#!/usr/bin/env node
// Local "CDN" for the bench: a separate origin that serves media/ with Range/206 and
// CORS, and injects faults on demand. Every request is logged.
//
//   GET  /v/<name>.mp4?m=<m>&...   media (name: episode | twin, see FILES)
//   GET  /__control                current config
//   POST /__control                replace config (JSON body, see DEFAULTS); resets counters
//   GET  /__log[?since=<id>]       request log (JSON)
//   POST /__cut[?dest=video|empty]  destroy every open media response now (counts as a cut)
//
// Fault rules (config.faults, evaluated in order for each media request):
//   { when: <cond>, action: 'status', code, cors=true, body }
//   { when: <cond>, action: 'cut', afterBytes | atByte | afterMs }   destroy the socket
//   { when: <cond>, action: 'corrupt', fromByte, toByte }            zero-fill bytes
//   { when: <cond>, action: 'stall', afterBytes }                    stop sending, keep the connection open
//   { when: <cond>, action: 'hideHeader', header }                   drop from Expose-Headers
//   { when: <cond>, action: 'file', name }                           serve another file
// <cond> (all optional, AND-ed):
//   nth: [a, b]          1-based index of the media request (b may be null = open end)
//   dest: 'video'|'empty' Sec-Fetch-Dest of the request (element vs. service worker fetch())
//   afterMs: t           ms since config was set
//   beforeMs: t
//   afterCut: k          the k requests that follow every cut
//   withinMsAfterCut: t  any request less than t ms after the last cut (an outage window)
//   startGte, startLt    constraint on the Range start byte
//   times: n             apply at most n times
//   m: '<m>'             only for this m
//   query: {k: v}        only if the URL query has these values (e.g. an old signature)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORT = +(process.env.CDN_PORT || 8302);
const FILES = {
  episode: path.join(ROOT, 'media', 'episode.mp4'),
  twin: path.join(ROOT, 'media', 'twin.mp4'),
};

const DEFAULTS = {
  cors: true,
  exposeHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges'],
  throttleBps: 4 * 1024 * 1024, // per response; 0 = unlimited
  maxConnections: 0,            // concurrent media responses; excess get 429. 0 = unlimited
  faults: [],
};

let config = { ...DEFAULTS };
let state;
function resetState() {
  state = { since: Date.now(), n: 0, cuts: 0, afterCutLeft: 0, applied: new Map(), open: 0 };
}
resetState();
const log = [];
let logId = 0;
const sockets = new Map();
const active = new Set(); // open media responses: {dest, cut(reason)}
let socketSeq = 0;

function matches(rule, req, idx, start) {
  const w = rule.when || {};
  const t = Date.now() - state.since;
  if (w.nth && (idx < w.nth[0] || (w.nth[1] != null && idx > w.nth[1]))) return false;
  if (w.dest && req.headers['sec-fetch-dest'] !== w.dest) return false;
  if (w.afterMs != null && t < w.afterMs) return false;
  if (w.beforeMs != null && t >= w.beforeMs) return false;
  if (w.startGte != null && start < w.startGte) return false;
  if (w.startLt != null && start >= w.startLt) return false;
  if (w.m && new URL(req.url, 'http://x').searchParams.get('m') !== w.m) return false;
  if (w.query) { const q = new URL(req.url, 'http://x').searchParams; for (const [k, v] of Object.entries(w.query)) if (q.get(k) !== String(v)) return false; }
  if (w.afterCut && !(req._afterCut)) return false;
  if (w.withinMsAfterCut != null && !(state.lastCut && Date.now() - state.lastCut < w.withinMsAfterCut)) return false;
  if (w.times != null && (state.applied.get(rule) || 0) >= w.times) return false;
  return true;
}

function corsHeaders(req, hidden) {
  if (!config.cors) return {};
  const expose = config.exposeHeaders.filter((h) => !hidden.includes(h.toLowerCase()));
  return {
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': expose.join(', '),
    Vary: 'Origin',
  };
}

function sendJson(res, obj, code = 200) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve) => {
    let b = '';
    req.on('data', (d) => (b += d));
    req.on('end', () => resolve(b));
  });
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);

  if (u.pathname === '/__control') {
    if (req.method === 'POST') {
      const body = JSON.parse((await readBody(req)) || '{}');
      config = { ...DEFAULTS, ...body };
      resetState();
      return sendJson(res, { ok: true, config });
    }
    return sendJson(res, config);
  }
  if (u.pathname === '/__cut' && req.method === 'POST') {
    const dest = u.searchParams.get('dest');
    let n = 0;
    for (const r of active) {
      if (dest && r.dest !== dest) continue;
      r.cut('cut:manual');
      n++;
    }
    return sendJson(res, { cut: n });
  }
  if (u.pathname === '/__log') {
    const since = +(u.searchParams.get('since') || 0);
    return sendJson(res, log.filter((e) => e.id > since));
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
      'Access-Control-Max-Age': '600',
    });
    return res.end();
  }

  const mm = u.pathname.match(/^\/v\/([a-z0-9-]+)\.mp4$/);
  if (!mm || !FILES[mm[1]]) {
    res.writeHead(404);
    return res.end();
  }

  // ---- media request ----
  const idx = ++state.n;
  if (state.afterCutLeft > 0) {
    req._afterCut = true;
    state.afterCutLeft--;
  }
  const rangeHdr = req.headers.range || null;
  const rm = rangeHdr && rangeHdr.match(/^bytes=(\d*)-(\d*)$/);
  const entry = {
    id: ++logId,
    t: Date.now() - state.since,
    n: idx,
    method: req.method,
    file: mm[1],
    m: u.searchParams.get('m'),
    range: rangeHdr,
    dest: req.headers['sec-fetch-dest'] || null,
    mode: req.headers['sec-fetch-mode'] || null,
    socket: req.socket._benchId,
    status: null,
    sent: 0,
    end: null,
    reason: null,
    faults: [],
  };
  log.push(entry);
  if (log.length > 20000) log.splice(0, log.length - 20000);

  let fileName = mm[1];
  let start = 0;
  const hidden = [];
  const cuts = [];
  const stalls = [];
  const corrupt = [];
  let status = null;

  const startGuess = rm && rm[1] !== '' ? +rm[1] : 0;
  for (const rule of config.faults) {
    if (!matches(rule, req, idx, startGuess)) continue;
    state.applied.set(rule, (state.applied.get(rule) || 0) + 1);
    entry.faults.push(rule.action + (rule.code ? ':' + rule.code : ''));
    if (rule.action === 'status' && !status) status = rule;
    else if (rule.action === 'cut') cuts.push(rule);
    else if (rule.action === 'corrupt') corrupt.push(rule);
    else if (rule.action === 'stall') stalls.push(rule);
    else if (rule.action === 'hideHeader') hidden.push(rule.header.toLowerCase());
    else if (rule.action === 'file') fileName = rule.name;
  }
  entry.file = fileName;

  const finish = (reason) => {
    if (entry.reason) return;
    entry.reason = reason;
    entry.dur = Date.now() - state.since - entry.t;
  };

  if (config.maxConnections && state.open >= config.maxConnections && !status) {
    status = { code: 429, cors: true };
    entry.faults.push('maxConnections');
  }

  if (status) {
    const h = status.cors === false ? {} : corsHeaders(req, hidden);
    entry.status = status.code;
    res.writeHead(status.code, { ...h, 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' });
    res.end(status.body || `fault ${status.code}`);
    finish('fault-status');
    return;
  }

  const file = FILES[fileName];
  const size = fs.statSync(file).size;
  let end = size - 1;
  let code = 200;
  if (rm) {
    if (rm[1] === '' && rm[2] !== '') {
      start = Math.max(0, size - +rm[2]);
    } else {
      start = +rm[1];
      if (rm[2] !== '') end = Math.min(+rm[2], size - 1);
    }
    if (start >= size) {
      entry.status = 416;
      res.writeHead(416, { ...corsHeaders(req, hidden), 'Content-Range': `bytes */${size}` });
      res.end();
      return finish('416');
    }
    code = 206;
  }
  entry.status = code;
  entry.start = start;
  entry.end = end;

  const headers = {
    ...corsHeaders(req, hidden),
    'Content-Type': 'video/mp4',
    'Content-Length': String(end - start + 1),
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=86400',
    'Last-Modified': fs.statSync(file).mtime.toUTCString(),
  };
  if (code === 206) headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
  res.writeHead(code, headers);
  if (req.method === 'HEAD') {
    res.end();
    return finish('head');
  }

  state.open++;
  let closed = false;
  const handle = { dest: entry.dest, cut: (why) => doCut(why) };
  active.add(handle);
  res.on('close', () => {
    active.delete(handle);
    state.open--;
    closed = true;
    finish(entry.sent >= end - start + 1 ? 'complete' : 'client-closed');
  });

  // cut limit in body bytes from response start
  let cutAt = Infinity;
  let cutTimer = null;
  for (const c of cuts) {
    if (c.afterBytes != null) cutAt = Math.min(cutAt, c.afterBytes);
    if (c.atByte != null && c.atByte > start) cutAt = Math.min(cutAt, c.atByte - start);
    if (c.afterMs != null) {
      cutTimer = setTimeout(() => doCut(`cut:afterMs=${c.afterMs}`), c.afterMs);
    }
  }
  const doCut = (why) => {
    if (closed) return;
    state.cuts++;
    state.lastCut = Date.now();
    state.afterCutLeft = Math.max(...config.faults.map((r) => (r.when && r.when.afterCut) || 0), 0);
    finish(why);
    res.socket.destroy();
  };

  const fd = fs.openSync(file, 'r');
  const SLICE = 64 * 1024;
  const buf = Buffer.alloc(SLICE);
  let pos = start;
  const t0 = Date.now();
  try {
    const stallAt = stalls.length ? Math.min(...stalls.map((r) => r.afterBytes)) : Infinity;
    while (pos <= end && !closed) {
      if (entry.sent >= stallAt) {
        // a stalled (not reset) stream: no more bytes, connection stays open
        entry.reason = 'stalled';
        state.lastCut = Date.now();
        await new Promise((r) => res.once('close', r));
        entry.dur = Date.now() - state.since - entry.t;
        break;
      }
      let n = Math.min(SLICE, end - pos + 1, stallAt - entry.sent);
      if (entry.sent + n > cutAt) n = cutAt - entry.sent;
      if (n <= 0) {
        doCut(`cut:afterBytes=${cutAt}`);
        break;
      }
      fs.readSync(fd, buf, 0, n, pos);
      const out = Buffer.from(buf.subarray(0, n));
      for (const c of corrupt) {
        const a = Math.max(c.fromByte, pos), b = Math.min(c.toByte, pos + n - 1);
        if (a <= b) out.fill(0, a - pos, b - pos + 1);
      }
      const ok = res.write(out);
      pos += n;
      entry.sent += n;
      if (!ok) await new Promise((r) => res.once('drain', r).once('close', r));
      if (config.throttleBps) {
        const due = t0 + (entry.sent / config.throttleBps) * 1000;
        const wait = due - Date.now();
        if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      }
    }
    if (!closed && pos > end) res.end();
  } finally {
    fs.closeSync(fd);
    if (cutTimer) clearTimeout(cutTimer);
  }
});

server.on('connection', (sock) => {
  sock._benchId = ++socketSeq;
  sockets.set(sock._benchId, sock);
  sock.on('close', () => sockets.delete(sock._benchId));
});
server.keepAliveTimeout = 5000;
server.listen(PORT, '127.0.0.1', () => console.log(`cdn listening on http://localhost:${PORT}`));
