#!/usr/bin/env node
// Local "site" for the bench (origin http://localhost:8301).
//
//   /translations/embed/<id>   embed page built from the downloaded copy (scripts/build-embed.mjs)
//   /bench/watch               host page with the embed in an iframe (like the catalog page)
//   /js/**, /sworker.js, /swMain.js   site files from vendor/site/ (query ignored, like a CDN path)
//       /sworker.js gets server/site/sw-log-wrapper.js prepended; its swMain.js?v= can be
//       changed through the control endpoint (H7). /js/vendor/OneSignalSDK.js is an empty stub.
//   POST /translations/{brokenVideo,watched,videoTelemetry,sources,reportActivation}/...  stubs (logged)
//   POST /__sw-log             collector for SW console lines
//   GET/POST /__control        site config (engine, sources, swVersion, ...)
//   GET  /__log[?since=id]     collected events (SW lines + stub calls)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildEmbed } from '../../scripts/build-embed.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORT = +(process.env.SITE_PORT || 8301);
const CDN = process.env.CDN_ORIGIN || 'http://127.0.0.1:8302';
const VENDOR = path.join(ROOT, 'vendor', 'site');
const EMBED_ID = 6042685;
const WRAPPER = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'sw-log-wrapper.js'), 'utf8');

// sig imitates a signed URL: /translations/sources/<id> hands out the next one (H4)
export function mediaUrl(file, m, sig = 1) {
  return `${CDN}/v/${file}.mp4?m=${encodeURIComponent(m)}&sig=${sig}`;
}

const DEFAULTS = {
  engine: 'singlethread',
  swVersion: null,   // e.g. 99: /sworker.js imports swMain.js?v=99 instead of its own version (H7)
  m: 'bench-A',
  file: 'episode',
  height: 720,
  alternative: null,   // {file, m} -> data-alternative-sources
  background: true,    // push data-background-sources {m: [url]}
  duration: 1420.002,
  sig: 1,
  swUnavailable: false, // /sworker.js -> 404: registration fails, no controller (like a browser without SW)
};
let config = { ...DEFAULTS };
const events = [];
let eventId = 0;
const t0 = Date.now();
function record(kind, data) {
  events.push({ id: ++eventId, ts: Date.now(), kind, ...data });
  if (events.length > 50000) events.splice(0, events.length - 50000);
}

function sources(file, m) {
  return [{ height: config.height, type: 'video/mp4', urls: [mediaUrl(file, m, config.sig)] }];
}

function embedHtml() {
  const file = path.join(VENDOR, 'translations', 'embed', String(EMBED_ID));
  const orig = fs.readFileSync(file, 'utf8');
  const bg = {};
  if (config.background) bg[config.m] = [mediaUrl(config.file, config.m, config.sig)];
  return buildEmbed(orig, {
    engine: config.engine,
    embedId: EMBED_ID,
    pageUrl: `http://localhost:${PORT}/bench/watch`,
    sources: sources(config.file, config.m),
    alternativeSources: config.alternative ? sources(config.alternative.file, config.alternative.m) : [],
    backgroundSources: bg,
    duration: config.duration,
    width: 1280,
    height: 720,
  });
}

const TYPES = { '.js': 'application/javascript; charset=utf-8', '.html': 'text/html; charset=utf-8', '.json': 'application/json' };

// --patched=<set>: files from vendor/patched/<set>/ (built by scripts/apply-patches.mjs)
// replace the originals at the same path.
function vendorFile(rel) {
  if (config.patched) {
    const f = path.join(ROOT, 'vendor', 'patched', String(config.patched), rel);
    if (fs.existsSync(f)) return f;
  }
  return path.join(VENDOR, rel);
}

// The SW script URL exactly as the site's embed.min.js registers it (e.g. /sworker.js?27):
// registering another URL would trigger an extra SW update at the start of every scenario.
function swRegisterUrl() {
  const src = fs.readFileSync(vendorFile('js/app/embed.min.js'), 'utf8');
  return (src.match(/register\("(\/sworker\.js\?\d+)"/) || [null, '/sworker.js'])[1];
}

function send(res, code, body, type = 'text/plain', extra = {}) {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-cache', ...extra });
  res.end(body);
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
  const p = u.pathname;

  if (p === '/__control') {
    if (req.method === 'POST') {
      config = { ...DEFAULTS, ...JSON.parse((await readBody(req)) || '{}') };
      record('control', { config });
    }
    return send(res, 200, JSON.stringify(config), TYPES['.json']);
  }
  if (p === '/__log') {
    const since = +(u.searchParams.get('since') || 0);
    return send(res, 200, JSON.stringify(events.filter((e) => e.id > since)), TYPES['.json']);
  }
  if (p === '/__sw-log' && req.method === 'POST') {
    try {
      for (const line of JSON.parse(await readBody(req))) record('sw', line);
    } catch (e) {}
    return send(res, 204, '');
  }

  if (p === '/bench/watch') {
    return send(res, 200, `<!DOCTYPE html><html><head><meta charset="utf-8"><title>bench watch</title>
<style>body{margin:0;background:#222}iframe{border:0;width:1280px;height:766px;display:block}</style></head>
<body><iframe id="embed" src="/translations/embed/${EMBED_ID}" allowfullscreen allow="autoplay; fullscreen"></iframe></body></html>`, TYPES['.html']);
  }
  if (p === '/bench/register') {
    // Same registration call as embed.min.js, without a player: lets a scenario start with
    // the SW already controlling the page (a returning visitor) and an empty video cache.
    return send(res, 200, `<!DOCTYPE html><html><head><meta charset="utf-8"><title>bench register</title></head><body>
<script>navigator.serviceWorker.register("${swRegisterUrl()}", { scope: "/" }).then(function () { return navigator.serviceWorker.ready; })
.then(function () { document.title = "sw-ready"; });</script></body></html>`, TYPES['.html']);
  }
  if (p === `/translations/embed/${EMBED_ID}`) {
    record('site', { what: 'embed', ua: req.headers['user-agent'] ? 'chrome' : '' });
    return send(res, 200, embedHtml(), TYPES['.html'], { 'Cache-Control': 'no-store' });
  }

  // stubs for the player's POST endpoints
  const stub = p.match(/^\/translations\/(brokenVideo|watched|videoTelemetry|sources|reportActivation|isAvailable|embedActivation)(?:\/(\d+))?/);
  if (stub) {
    const body = req.method === 'POST' ? await readBody(req) : '';
    record('site', { what: stub[1], query: u.search, body: stub[1] === 'videoTelemetry' ? body.slice(0, 4000) : body.slice(0, 300) });
    if (stub[1] === 'sources') {
      config.sig++; // a fresh signature
      return send(res, 200, JSON.stringify({ sources: JSON.stringify(sources(config.file, config.m)) }), TYPES['.json']);
    }
    if (stub[1] === 'isAvailable') return send(res, 200, '{"isAvailable":false}', TYPES['.json']);
    return send(res, 200, '{}', TYPES['.json']);
  }

  if (p === '/js/vendor/OneSignalSDK.js') {
    return send(res, 200, '/* bench: OneSignal SDK stub (push notifications are out of scope) */\n', TYPES['.js']);
  }
  if (p === '/sworker.js') {
    if (config.swUnavailable) { record('site', { what: 'sworker.js', status: 404 }); return send(res, 404, 'not found'); }
    let src = fs.readFileSync(vendorFile('sworker.js'), 'utf8');
    if (config.swVersion != null) src = src.replace(/'\/swMain\.js\?v=\d+'/, `'/swMain.js?v=${config.swVersion}'`);
    record('site', { what: 'sworker.js', query: u.search, swVersion: config.swVersion });
    return send(res, 200, WRAPPER + '\n' + src, TYPES['.js']);
  }
  if (p === '/swMain.js') {
    record('site', { what: 'swMain.js', query: u.search });
    return send(res, 200, fs.readFileSync(vendorFile('swMain.js')), TYPES['.js']);
  }
  if (p.startsWith('/js/')) {
    const rel = path.normalize(p).replace(/^(\.\.[/\\])+/, '').replace(/^\//, '');
    const f = vendorFile(rel);
    if (!rel.includes('..') && fs.existsSync(f)) return send(res, 200, fs.readFileSync(f), TYPES[path.extname(f)] || 'application/octet-stream');
  }
  send(res, 404, 'not found');
});

server.listen(PORT, '127.0.0.1', () => console.log(`site listening on http://localhost:${PORT} (cdn ${CDN})`));
