#!/usr/bin/env node
// Runs local scenarios against server/site + server/cdn in the real Chrome.
//
//   node runner/run.mjs                 all scenarios (sequentially)
//   node runner/run.mjs h1-cut-503 h4-403   selected scenarios
//   options: --patched=<set>   serve patched site code (vendor/patched/<set>, see patches/)
//            --out=<dir>       output directory (default results/<YYYY-MM-DD>[-patched])
//            --headless        headless Chrome (visibility scenarios need a window)
//            --quick           skip scenarios marked long (H6)
//
// Raw logs go to <out>/raw/<scenario>/ (git-ignored), the summary to <out>/summary.md and
// one <out>/<scenario>.md per scenario (local synthetic data only: no secrets).
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Session, sleep } from './session.mjs';
import { analyze, keySwLines } from './detectors.mjs';
import { SCENARIOS } from './scenarios/index.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'http://localhost:8301';
const CDN = 'http://127.0.0.1:8302';
const args = process.argv.slice(2);
const opt = (k) => { const a = args.find((x) => x.startsWith(`--${k}`)); return a ? (a.split('=')[1] ?? true) : null; };
const patched = opt('patched');
const date = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(); // local date
const OUT = path.resolve(ROOT, opt('out') || `results/${date}${patched ? '-patched' : ''}`);
const wanted = args.filter((a) => !a.startsWith('--'));

async function post(url, body) {
  const r = await fetch(url, { method: 'POST', body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
}
const getJson = async (url) => (await fetch(url)).json();

async function ensureServers() {
  const procs = [];
  for (const [name, url] of [['site', SITE], ['cdn', CDN]]) {
    try { await fetch(url + '/__control'); continue; } catch (e) {}
    const p = spawn(process.execPath, [path.join(ROOT, 'server', name, 'index.mjs')], { stdio: 'ignore' });
    procs.push(p);
    for (let i = 0; i < 50; i++) {
      await sleep(100);
      try { await fetch(url + '/__control'); break; } catch (e) {}
    }
  }
  return procs;
}

function bench(session, scenario, log) {
  let lastError = 0;
  let userPaused = false;
  const b = {
    session,
    async open({ warm = true } = {}) {
      if (warm) {
        await session.navigate(`${SITE}/bench/register`);
        for (let i = 0; i < 100; i++) {
          await sleep(100);
          try { if ((await session.evalTop('document.title')) === 'sw-ready') break; } catch (e) {}
        }
        await sleep(300);
      }
      await session.navigate(`${SITE}/bench/watch`);
      await session.waitForPlayer();
      await session.act('mute');
      // wait until the player can play (readyState >= 3): on a slow CDN an early play()
      // is lost when concatenate re-sets src after durationchange (REPORT.md, «Второстепенное»)
      for (let i = 0; i < 80; i++) {
        try { if ((await session.state()).rs >= 3) break; } catch (e) {}
        await sleep(250);
      }
      await sleep(500);
    },
    async play() { userPaused = false; await session.act('play'); },
    async pause() { userPaused = true; await session.act('pause'); },
    async seek(t) { await session.act('seek', t); },
    async hide() { await session.act('hide'); },
    async show() { await session.act('show'); },
    async swUpdate() { return session.act('swUpdate'); },
    async stopSW() { return session.act('stopSW'); },
    async closePage() { await session.navigate('about:blank'); await sleep(500); },
    async wait(sec) {
      const end = Date.now() + sec * 1000;
      while (Date.now() < end) {
        await sleep(Math.min(1000, end - Date.now()));
        await this._user();
      }
    },
    async until(pred, sec) {
      const end = Date.now() + sec * 1000;
      while (Date.now() < end) {
        try { if (pred(await session.state())) return true; } catch (e) {}
        await sleep(1000);
        await this._user();
      }
      return false;
    },
    // A user who presses Play again when the player stopped after an error.
    async _user() {
      const u = scenario.user;
      if (!u || !u.resumeAfterErrorSec || userPaused) return;
      const errs = session.events.filter((e) => e.src === 'probe' && e.type === 'media' && e.ev === 'error' && e.el === 'main-video_html5_api');
      if (errs.length) lastError = errs[errs.length - 1].t;
      if (!lastError || Date.now() - lastError > 60000) return;
      try {
        const st = await session.state();
        const since = Date.now() - lastError;
        if (st.paused && since > u.resumeAfterErrorSec * 1000) {
          session.rec('runner', { action: 'user-play', note: 'player is paused after an error' });
          await session.evalEmbed("(vjs.players['main-video'].play(), true)");
          lastError = Date.now() - u.resumeAfterErrorSec * 1000 + 5000; // do not spam
        }
      } catch (e) {}
    },
    state: () => session.state(),
    cache: () => session.cacheInfo(),
    async cdn(cfg) { session.rec('runner', { action: 'cdn-config', arg: cfg }); await post(`${CDN}/__control`, cfg); },
    async cdnCut(dest) {
      const r = await post(`${CDN}/__cut${dest ? '?dest=' + dest : ''}`, {});
      session.rec('runner', { action: 'cdn-cut', arg: { dest: dest || 'all', cut: r.cut } });
      return r.cut;
    },
    async site(cfg) { session.rec('runner', { action: 'site-config', arg: cfg }); await post(`${SITE}/__control`, { ...cfg, patched }); },
    note(text) { session.rec('runner', { action: 'note', arg: text }); log(`  · ${text}`); },
    snapshots: [],
    async snapshot(label) {
      const s = { label, t: Date.now(), state: await session.state().catch((e) => String(e)), cache: await session.cacheInfo().catch(() => null) };
      this.snapshots.push(s);
      return s;
    },
  };
  return b;
}

async function runScenario(sc) {
  const dir = path.join(OUT, 'raw', sc.id);
  fs.mkdirSync(dir, { recursive: true });
  const profileDir = path.join(ROOT, 'profiles', `run-${sc.id}-${Date.now()}`);
  const netlog = path.join(ROOT, 'captures', 'raw', `${date}-${sc.id}${patched ? '-patched' : ''}.netlog`);
  fs.mkdirSync(path.dirname(netlog), { recursive: true });
  const log = (s) => console.log(s);

  await post(`${SITE}/__control`, { ...(sc.site || {}), patched });
  await post(`${CDN}/__control`, sc.cdn || {});
  const siteSince = (await getJson(`${SITE}/__log`)).reduce((a, e) => Math.max(a, e.id), 0);
  const cdnSince = (await getJson(`${CDN}/__log`)).reduce((a, e) => Math.max(a, e.id), 0);

  const session = new Session({ profileDir, netlog, headless: !!opt('headless') && !sc.needsWindow });
  const t0 = Date.now();
  let failure = null;
  const b = bench(session, sc, log);
  try {
    await session.start();
    await sc.steps(b);
    await b.snapshot('end');
  } catch (e) {
    failure = e.stack || String(e);
    log('  ! ' + e.message);
  } finally {
    await session.stop();
    fs.rmSync(profileDir, { recursive: true, force: true });
  }

  const siteLog = (await getJson(`${SITE}/__log?since=${siteSince}`));
  const sw = siteLog.filter((e) => e.kind === 'sw');
  const site = siteLog.filter((e) => e.kind === 'site');
  const cdn = await getJson(`${CDN}/__log?since=${cdnSince}`);
  const metrics = analyze({ events: session.events, sw, site, cdn, t0 });
  metrics.snapshots = b.snapshots.map((s) => ({ label: s.label, t: +((s.t - t0) / 1000).toFixed(1), state: s.state, cache: s.cache }));
  let verdict = { verdict: 'ошибка стенда', why: failure };
  if (!failure) {
    try { verdict = sc.judge(metrics); } catch (e) { verdict = { verdict: 'ошибка стенда', why: 'judge: ' + e.message }; }
  }

  const w = (name, rows) => fs.writeFileSync(path.join(dir, name), rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  w('events.jsonl', session.events);
  w('sw.jsonl', sw);
  w('site.jsonl', site);
  w('cdn.jsonl', cdn);
  fs.writeFileSync(path.join(dir, 'metrics.json'), JSON.stringify(metrics, null, 2));

  const result = { id: sc.id, title: sc.title, hypothesis: sc.hypothesis, expected: sc.expected, metrics, ...verdict, keyLines: keySwLines(sw, t0), timeline: timeline(session.events, t0) };
  fs.writeFileSync(path.join(OUT, `${sc.id}.md`), scenarioMd(result, sc));
  return result;
}

function timeline(events, t0) {
  const out = [];
  for (const e of events) {
    const t = `+${((e.t - t0) / 1000).toFixed(1)}s`;
    if (e.src === 'runner') out.push(`${t} runner ${e.action}${e.arg != null ? ' ' + JSON.stringify(e.arg) : ''}${e.note ? ' (' + e.note + ')' : ''}`);
    else if (e.src === 'probe' && e.type === 'media' && e.el === 'main-video_html5_api' && /error|playing|emptied|seeking|waiting|loadstart|canplay|pause/.test(e.ev)) {
      out.push(`${t} video ${e.ev} ct=${e.ct}${e.err ? ` code=${e.err.code} "${e.err.message}"` : ''}`);
    } else if (e.src === 'probe' && e.type === 'call') out.push(`${t} call ${e.fn} el=${e.el}${e.rand ? ' +rand' : ''}${e.ct != null ? ' ct=' + e.ct : ''}`);
    else if (e.src === 'probe' && e.type === 'media' && e.el === 'detached' && e.ev === 'error') out.push(`${t} detached-video error code=${e.err?.code}`);
    else if (e.src === 'console' && /Error #|errors in row|Notify broken|Blacklisting|alternative sources|Current time/.test(e.msg)) out.push(`${t} player: ${e.msg.slice(0, 160)}`);
    else if (e.src === 'probe' && e.type === 'sw') out.push(`${t} page: ${e.ev}`);
    else if (e.src === 'target' && /sworker/.test(e.url || '')) out.push(`${t} sw-target ${e.ev}${e.attached != null ? ' attached=' + e.attached : ''}`);
  }
  // compress: keep at most 200 lines
  return out.length > 200 ? [...out.slice(0, 120), `… ${out.length - 200} lines skipped …`, ...out.slice(-80)] : out;
}

export function userSaw(m) {
  const parts = [];
  if (m.errors.length) parts.push(`ошибок <video>: ${m.errors.length} (коды ${Object.entries(m.errorCodes).map(([c, n]) => `${c}×${n}`).join(', ')})`);
  else parts.push('ошибок <video> нет');
  if (m.loadsAfterStart) parts.push(`перезагрузок load() после старта: ${m.loadsAfterStart} (макс. ${m.reloadsPerMinMax}/мин)`);
  if (m.resetToZero.length) parts.push(`сброс в начало после ошибки: ${m.resetToZero.map((r) => `${r.before.toFixed(0)}→${r.after.toFixed(0)} с${r.pausedAfter ? ', стоп' : ''}`).join('; ')}`);
  if (m.backJumps.length) parts.push(`прыжков назад >5 с: ${m.backJumps.length}`);
  parts.push(`сыграно ${m.playedSec} с, стояло ${m.stalledSec} с`);
  parts.push(`notifyBroken: ${m.notifyBroken}`);
  if (m.infiniteLoop) parts.push('**цикл ошибок без notifyBroken**');
  return parts.join('; ');
}

function scenarioMd(r, sc) {
  const m = r.metrics;
  const swCounts = Object.entries(m).filter(([k, v]) => k.startsWith('sw_') && v).map(([k, v]) => `${k.slice(3)}=${v}`).join(', ');
  return `# ${r.id}: ${r.title}

Гипотеза: **${r.hypothesis}**. Вердикт: **${r.verdict}**${patched ? ` (код с патчами: ${patched})` : ''}.

${r.why || ''}

**Ожидалось:** ${r.expected}

**Что увидел пользователь:** ${userSaw(m)}.

**Сценарий:** ${sc.describe || ''}

| метрика | значение |
|---|---|
| ошибки <video> | ${m.errors.map((e) => `+${e.t}s code=${e.code} ct=${e.ct}`).join('<br>') || '—'} |
| load() после старта / src с &rand | ${m.loadsAfterStart} / ${m.randReloads} |
| сброс в начало | ${JSON.stringify(m.resetToZero)} |
| прыжки назад | ${JSON.stringify(m.backJumps)} |
| сыграно / стояло, с | ${m.playedSec} / ${m.stalledSec} |
| notifyBroken (POST brokenVideo) | ${m.notifyBroken} |
| экземпляры SW (по обёртке логов) | ${m.swInstances.join(', ') || '—'} |
| DevTools подключались к SW | ${m.swDevtoolsAttached ? 'да' : 'нет'} |
| строки SW | ${swCounts || '—'} |
| запросы к CDN | ${m.cdnRequests} (${JSON.stringify(m.cdnByDest)}; статусы ${JSON.stringify(m.cdnStatus)}; обрывов ${m.cdnCuts}; ${m.cdnMB} МБ; одновременно до ${m.cdnMaxConcurrent}) |

\`dest=video\` — запрос самого \`<video>\` мимо SW, \`dest=empty\` — \`fetch()\` из SW.

### Ключевые строки SW

\`\`\`
${r.keyLines.join('\n') || '(нет)'}
\`\`\`

### Таймлайн

\`\`\`
${r.timeline.join('\n')}
\`\`\`

### Снимки состояния

\`\`\`json
${JSON.stringify(m.snapshots, null, 1).slice(0, 4000)}
\`\`\`
`;
}

function summaryMd(results) {
  const rows = results.map((r) => {
    const m = r.metrics;
    const key = r.keyLines.filter((l) => /serve FAIL|read DIED|NOT OK|MISSING|THREW|Blacklist|handler FAIL|evaluated/.test(l)).slice(0, 3)
      .map((l) => l.replace(/\|/g, '/').replace(/m= \S+ /, '').slice(0, 140)).join('<br>');
    return `| [${r.id}](${r.id}.md) | ${r.hypothesis} | ${userSaw(m).replace(/\|/g, '/')} | ${key || '—'} | **${r.verdict}** |`;
  });
  return `# Сводка прогонов ${date}${patched ? ` (патчи: ${patched})` : ''}

Chrome: ${process.env.CHROME_VERSION || 'см. README'}; локальный сайт + CDN; синтетическое медиа (media/episode.mp4).

| сценарий | гипотеза | что увидел пользователь | ключевые строки SW | вердикт |
|---|---|---|---|---|
${rows.join('\n')}
`;
}

async function main() {
  const list = SCENARIOS.filter((s) => (wanted.length ? wanted.includes(s.id) : true)).filter((s) => !(opt('quick') && s.long));
  if (!list.length) throw new Error('no scenarios matched: ' + wanted.join(' '));
  fs.mkdirSync(OUT, { recursive: true });
  if (patched) execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'apply-patches.mjs'), String(patched)], { stdio: 'inherit' });
  const procs = await ensureServers();
  const results = [];
  const prevPath = path.join(OUT, 'results.json');
  const prev = fs.existsSync(prevPath) ? JSON.parse(fs.readFileSync(prevPath, 'utf8')) : [];
  try {
    for (const sc of list) {
      console.log(`▶ ${sc.id} — ${sc.title}`);
      const r = await runScenario(sc);
      console.log(`  ${r.verdict}: ${userSaw(r.metrics)}`);
      results.push(r);
      await sleep(2000);
    }
  } finally {
    for (const p of procs) p.kill();
  }
  // merge with earlier results of the same day (re-running a subset keeps the others)
  const merged = [...prev.filter((p) => !results.some((r) => r.id === p.id)), ...results]
    .sort((a, b) => SCENARIOS.findIndex((s) => s.id === a.id) - SCENARIOS.findIndex((s) => s.id === b.id));
  fs.writeFileSync(prevPath, JSON.stringify(merged.map((r) => ({ ...r, timeline: undefined })), null, 1));
  fs.writeFileSync(path.join(OUT, 'summary.md'), summaryMd(merged.map((r) => ({ ...r, keyLines: r.keyLines || [] }))));
  console.log(`\nwrote ${path.relative(ROOT, OUT)}/summary.md`);
}

main().catch((e) => { console.error(e); process.exit(1); });
