// Turns the raw logs of one run into metrics and user-visible symptoms.
//   events : page-side events from Session (probe, console, target, runner)
//   sw     : SW console lines from the collector [{ts, sw, level, msg}]
//   site   : stub endpoint calls [{ts, what, ...}]
//   cdn    : CDN request log [{t, n, range, dest, status, sent, reason, dur, ...}]

const SW_PATTERNS = {
  serveEnter: /\[SEEK-DIAG\] serve enter/,
  serveFail: /\[SEEK-DIAG\] serve FAIL/,
  readDied: /\[SEEK-DIAG\] origin read DIED/,
  originNotOk: /\[SEEK-DIAG\] origin fetch NOT OK/,
  badRange: /\[SEEK-DIAG\] origin BAD range/,
  extractMetaFailed: /\[SEEK-DIAG\] extractMeta FAILED/,
  metaThrew: /\[SEEK-DIAG\] meta\/open THREW/,
  probeNotOk: /\[SEEK-DIAG\] probe NOT OK/,
  handlerFail: /\[SEEK-DIAG\] handler FAIL/,
  totalMissing: /\[SEEK-DIAG\] browser req .*total= MISSING/,
  browserReq: /\[SEEK-DIAG\] browser req/,
  blacklistMsg: /\[SW\] Blacklisting mParam/,
  bypassBlacklisted: /is blacklisted, bypassing cache/,
  bypassDisabled: /Video caching disabled, bypassing SW/,
  install: /\[SW\] Install event fired/,
  activate: /\[SW\] Activate event fired/,
  evaluated: /\[bench\] SW script evaluated/,
};

export const KEY_LINE = /serve FAIL|read DIED|NOT OK|BAD range|extractMeta FAILED|meta\/open THREW|handler FAIL|total= MISSING|Blacklisting|Install event|Activate event|SW script evaluated|bypassing/;

export function analyze({ events, sw, site, cdn, t0, cdnT0 }) {
  const m = {};
  const probe = events.filter((e) => e.src === 'probe' && e.frame === 'embed');
  const isMain = (e) => e.el === 'main-video_html5_api';
  const ticks = probe.filter((e) => e.type === 'tick');
  const media = probe.filter((e) => e.type === 'media' && isMain(e));
  const calls = probe.filter((e) => e.type === 'call');
  const runner = events.filter((e) => e.src === 'runner');
  const consoleLines = events.filter((e) => e.src === 'console' && e.frame === 'embed');
  const rel = (t) => +((t - t0) / 1000).toFixed(1);

  // ---- element errors and reloads
  m.errors = media.filter((e) => e.ev === 'error').map((e) => ({ t: rel(e.t), code: e.err?.code, ct: e.ct, msg: e.err?.message }));
  m.errorCodes = countBy(m.errors.map((e) => e.code));
  m.detachedErrors = probe.filter((e) => e.type === 'media' && e.el === 'detached' && e.ev === 'error').length;
  const firstPlaying = media.find((e) => e.ev === 'playing');
  const mainLoads = calls.filter((e) => e.el === 'main-video_html5_api' && e.fn === 'load');
  m.loadsAfterStart = firstPlaying ? mainLoads.filter((e) => e.t > firstPlaying.t).length : 0;
  m.srcChangesAfterStart = firstPlaying ? calls.filter((e) => e.el === 'main-video_html5_api' && e.fn !== 'load' && e.t > firstPlaying.t).length : 0;
  m.randReloads = calls.filter((e) => e.el === 'main-video_html5_api' && e.rand).length;
  m.reloadsPerMinMax = maxPerWindow(mainLoads.filter((e) => !firstPlaying || e.t > firstPlaying.t).map((e) => e.t), 60000);
  m.playingEvents = media.filter((e) => e.ev === 'playing').length;

  // ---- position: back jumps not caused by the runner's own seeks
  const seeks = runner.filter((e) => e.action === 'seek' || e.action === 'navigate').map((e) => e.t);
  m.backJumps = [];
  for (let i = 1; i < ticks.length; i++) {
    const d = ticks[i].ct - ticks[i - 1].ct;
    if (d < -5 && !seeks.some((s) => ticks[i].t - s < 4000 && ticks[i].t >= s)) {
      m.backJumps.push({ t: rel(ticks[i].t), from: ticks[i - 1].ct, to: ticks[i].ct });
    }
  }
  // reset to ~0 after an error: position before error > 10 s, then a tick within 20 s with ct < 2
  m.resetToZero = [];
  for (const err of media.filter((e) => e.ev === 'error')) {
    // position before the error: the error event's own ct (it may follow a seek that
    // the last tick has not seen yet), or the last tick, whichever is larger
    const tick = [...ticks].reverse().find((t) => t.t <= err.t);
    const before = { ct: Math.max(err.ct || 0, tick ? tick.ct : 0) };
    if (before.ct < 10) continue;
    const after = ticks.filter((t) => t.t > err.t + 2500 && t.t < err.t + 20000);
    if (after.length && after.some((t) => t.ct < 2)) {
      const playingAfter = after.filter((t) => !t.paused).length > 0;
      m.resetToZero.push({ t: rel(err.t), before: before.ct, after: Math.min(...after.map((t) => t.ct)), pausedAfter: !playingAfter });
    }
  }

  // ---- playback quality
  let played = 0, stalled = 0;
  for (let i = 1; i < ticks.length; i++) {
    const a = ticks[i - 1], b = ticks[i];
    if (a.paused || b.paused) continue;
    const d = b.ct - a.ct;
    if (d > 0.3 && d < 3) played += d;
    else if (Math.abs(d) <= 0.3) stalled += (b.t - a.t) / 1000;
  }
  m.playedSec = Math.round(played);
  m.stalledSec = Math.round(stalled);
  m.lastCt = ticks.length ? ticks[ticks.length - 1].ct : null;
  m.lastPaused = ticks.length ? ticks[ticks.length - 1].paused : null;
  m.controllerLost = ticks.some((t, i) => i > 0 && ticks[i - 1].ctrl && !t.ctrl);

  // ---- player-level
  m.siteCalls = countBy(site.map((e) => e.what));
  m.notifyBroken = site.filter((e) => e.what === 'brokenVideo').length;
  m.playerExitLines = consoleLines.filter((e) => /errors in row\. Exit/.test(e.msg)).length;
  m.playerBlacklist = consoleLines.filter((e) => /Blacklisting mParam/.test(e.msg)).length;
  m.alternativeUsed = consoleLines.filter((e) => /using alternative sources/.test(e.msg)).length;
  m.infiniteLoop = m.errors.length >= 6 && m.notifyBroken === 0;

  // ---- service worker
  for (const [k, re] of Object.entries(SW_PATTERNS)) m['sw_' + k] = sw.filter((l) => re.test(l.msg)).length;
  m.swInstances = [...new Set(sw.map((l) => l.sw))];
  const swTargets = events.filter((e) => e.src === 'target' && /sworker\.js/.test(e.url || ''));
  m.swTargetsCreated = swTargets.filter((e) => e.ev === 'created').length;
  m.swDevtoolsAttached = swTargets.some((e) => e.attached === true);

  // ---- CDN
  const media_ = cdn.filter((e) => e.file);
  m.cdnRequests = media_.length;
  m.cdnByDest = countBy(media_.map((e) => e.dest || 'none'));
  m.cdnStatus = countBy(media_.map((e) => e.status));
  m.cdnCuts = media_.filter((e) => (e.reason || '').startsWith('cut')).length;
  m.cdnMB = +(media_.reduce((s, e) => s + e.sent, 0) / 1048576).toFixed(1);
  m.cdnMaxConcurrent = maxConcurrent(media_);
  m.cdnElementDirect = media_.filter((e) => e.dest === 'video').length;
  return m;
}

export function keySwLines(sw, t0, limit = 40) {
  return sw
    .filter((l) => KEY_LINE.test(l.msg))
    .slice(0, limit)
    .map((l) => `+${((l.ts - t0) / 1000).toFixed(1)}s ${l.sw} ${l.msg.replace(/^\[\d\d:\d\d:\d\d\.\d+\] /, '')}`.slice(0, 260));
}

function countBy(arr) {
  const o = {};
  for (const x of arr) o[x] = (o[x] || 0) + 1;
  return o;
}
function maxPerWindow(ts, win) {
  let best = 0;
  for (let i = 0; i < ts.length; i++) {
    let n = 0;
    for (let j = i; j < ts.length && ts[j] - ts[i] < win; j++) n++;
    best = Math.max(best, n);
  }
  return best;
}
function maxConcurrent(reqs) {
  const pts = [];
  for (const r of reqs) {
    if (r.dur == null) continue;
    pts.push([r.t, 1], [r.t + r.dur, -1]);
  }
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let cur = 0, best = 0;
  for (const [, d] of pts) best = Math.max(best, (cur += d));
  return best;
}
