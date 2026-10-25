#!/usr/bin/env node
// Live check on a real episode (section 4.2). Ordinary viewing in one tab, sequential,
// player muted. CDP is attached to the page only, never to the service worker.
//
//   node runner/live.mjs login                    open the test profile for a manual login, then close Chrome
//   node runner/live.mjs login-proxy [--spki=...]  the same for the proxy profile, THROUGH the proxy:
//        a profile that once saw the site directly gets InvalidStateError from the SW API when
//        later opened through mitmproxy (Chrome 155), so the proxy profile must never go direct
//   node runner/live.mjs baseline <episode-url>   ~10 min: start, 3 seeks, pause > 5 min, resume
//   node runner/live.mjs proxy <episode-url> [--port=8080] [--spki=<hash>]
//                                                 same, through mitmdump -s proxy/faults.py
//
// Profiles: profiles/live (baseline) and profiles/live-mitm (proxy). Both git-ignored.
// The proxy profile accepts the mitmproxy certificate via --ignore-certificate-errors-spki-list,
// which Chrome honours only together with a custom --user-data-dir: nothing is changed
// in the system keychain and the main profile is not touched.
// Raw output: captures/raw/live-<ts>/ and captures/raw/live-<ts>.netlog (git-ignored).
// Redacted output: results/live-<date>/<mode>-<ts>.md (through scripts/redact.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Session, sleep } from './session.mjs';
import { analyze, keySwLines } from './detectors.mjs';
import { makeRedactor } from '../scripts/redact.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [mode, pageUrl] = process.argv.slice(2);
const opt = (k) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : null; }; // keep base64 '=' padding
const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

if (!['login', 'login-proxy', 'baseline', 'proxy'].includes(mode) || (!mode.startsWith('login') && !/^https:\/\/smotret-anime\.(org|co)\//.test(pageUrl || ''))) {
  console.error('usage: live.mjs login | login-proxy | baseline <episode page url> | proxy <episode page url>');
  process.exit(2);
}

const viaProxy = mode === 'proxy' || mode === 'login-proxy';
// One test profile for both modes: mitmdump runs with --allow-hosts limited to the video CDN,
// so the site and its login (VK) keep their real certificates; the mitmproxy CA is accepted
// only for that launch via --ignore-certificate-errors-spki-list.
const profileDir = path.join(ROOT, 'profiles', 'live');
const extraArgs = [];
if (viaProxy) {
  extraArgs.push(`--proxy-server=http://127.0.0.1:${opt('port') || 8080}`, '--disable-quic');
  if (opt('spki')) extraArgs.push(`--ignore-certificate-errors-spki-list=${opt('spki')}`);
}

async function main() {
  const rawDir = path.join(ROOT, 'captures', 'raw', `live-${ts}`);
  fs.mkdirSync(rawDir, { recursive: true });
  const netlog = mode.startsWith('login') ? null : path.join(ROOT, 'captures', 'raw', `live-${ts}.netlog`);
  const s = new Session({ profileDir, netlog, headless: false, liteProbe: true }); // lite: see probe.js
  s.opts.extraArgs = extraArgs;
  await s.start();

  if (mode.startsWith('login')) {
    await s.navigate('https://smotret-anime.co/users/login');
    console.log('Log in by hand in the Chrome window, then close the window. Waiting...');
    await new Promise((r) => s.proc.once('exit', r));
    return;
  }

  const t0 = Date.now();
  await s.navigate(pageUrl);
  await s.waitForPlayer(60000);
  await s.act('mute');
  const step = async (label, fn) => { s.rec('runner', { action: 'step', arg: label }); console.log(`+${((Date.now() - t0) / 1000).toFixed(0)}s ${label}`); await fn(); };
  await step('play', () => s.act('play'));
  await sleep(60000);
  for (const pos of [420, 900, 180]) {
    await step('seek ' + pos, () => s.act('seek', pos));
    await sleep(45000);
  }
  await step('pause (330 s)', () => s.act('pause'));
  await sleep(330000);
  await step('resume', () => s.act('play'));
  await sleep(90000);
  const state = await s.state().catch((e) => String(e));
  await s.stop();

  // raw (ignored)
  fs.writeFileSync(path.join(rawDir, 'events.jsonl'), s.events.map((e) => JSON.stringify(e)).join('\n') + '\n');
  // redacted summary (page-side view; SW lines are only in NetLog/DevTools-free sources)
  const red = makeRedactor();
  const m = analyze({ events: s.events, sw: [], site: [], cdn: [], t0 });
  const swPageLines = s.events.filter((e) => e.src === 'console' && /\[Player\]|Error #|errors in row|Blacklisting|Notify broken/.test(e.msg))
    .map((e) => `+${((e.t - t0) / 1000).toFixed(1)}s ${e.msg}`).slice(0, 300);
  const md = `# Живая запись (${mode}), ${ts.slice(0, 10)}

Профиль: отдельный тестовый; CDP только к странице; звук выключен в плеере.
Сценарий: старт, 60 с, перемотки на 7:00 / 15:00 / 3:00 (по 45 с), пауза 330 с, продолжение 90 с.

\`\`\`json
${JSON.stringify({ errors: m.errors, errorCodes: m.errorCodes, loadsAfterStart: m.loadsAfterStart, resetToZero: m.resetToZero, backJumps: m.backJumps, playedSec: m.playedSec, stalledSec: m.stalledSec, controllerLost: m.controllerLost, swTargets: s.events.filter((e) => e.src === 'target' && /sworker/.test(e.url || '')).map((e) => ({ t: +((e.t - t0) / 1000).toFixed(1), ev: e.ev, attached: e.attached })), finalState: state }, null, 1)}
\`\`\`

## Строки плеера (консоль embed)

\`\`\`
${swPageLines.join('\n')}
\`\`\`

NetLog: \`node scripts/netlog-summary.mjs captures/raw/live-${ts}.netlog\` (выход уже отредактирован).
`;
  const outDir = path.join(ROOT, 'results', `live-${ts.slice(0, 10)}`);
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${mode}-${ts.slice(11)}.md`);
  fs.writeFileSync(out, red.text(md));
  red.save();
  console.log('wrote ' + path.relative(ROOT, out));
}

main().catch((e) => { console.error(e); process.exit(1); });
