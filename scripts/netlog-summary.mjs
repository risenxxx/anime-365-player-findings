#!/usr/bin/env node
// Summarises a Chrome NetLog (captured with --net-log-capture-mode=Default, no bodies)
// for media requests, and passes everything through scripts/redact.mjs before output.
//
//   node scripts/netlog-summary.mjs <file.netlog> [--json] [--filter=<regex on URL>]
//
// Per request: host (aliased), Range, status, Content-Range, Accept-Ranges,
// Access-Control-Allow-Origin / -Expose-Headers, protocol (h1/h2/QUIC), bytes read,
// final net error, duration. Plus totals: connections/sessions per host, errors.
import fs from 'node:fs';
import { makeRedactor } from './redact.mjs';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const asJson = args.includes('--json');
const filterArg = args.find((a) => a.startsWith('--filter='));
const FILTER = filterArg ? new RegExp(filterArg.slice(9)) : /[?&]m=|\.mp4(\?|$)/;
if (!file) {
  console.error('usage: netlog-summary.mjs <file.netlog> [--json] [--filter=regex]');
  process.exit(2);
}

function load(path) {
  let s = fs.readFileSync(path, 'utf8').trim();
  if (!s.endsWith('}')) s = s.replace(/,?\s*$/, ''); // Chrome killed mid-write
  if (!/\]\s*\}\s*$/.test(s)) s = s.slice(0, s.lastIndexOf('}') + 1) + ']}';
  return JSON.parse(s);
}

const log = load(file);
const C = log.constants;
const evName = Object.fromEntries(Object.entries(C.logEventTypes).map(([k, v]) => [v, k]));
const srcName = Object.fromEntries(Object.entries(C.logSourceType).map(([k, v]) => [v, k]));
const errName = Object.fromEntries(Object.entries(C.netError || {}).map(([k, v]) => [v, k]));
const t0 = +C.timeTickOffset || 0;

const reqs = new Map(); // source id -> request
const sessions = { HTTP2_SESSION: new Map(), QUIC_SESSION: new Map(), SOCKET: 0 };
const hdr = (list, name) => {
  const l = (list || []).find((h) => h.toLowerCase().startsWith(name.toLowerCase() + ':'));
  return l ? l.slice(name.length + 1).trim() : null;
};

for (const e of log.events) {
  const type = evName[e.type];
  const st = srcName[e.source.type];
  const p = e.params || {};
  if (st === 'HTTP2_SESSION' && type === 'HTTP2_SESSION_INITIALIZED') sessions.HTTP2_SESSION.set(e.source.id, p.host || '');
  if (st === 'QUIC_SESSION' && type === 'QUIC_SESSION') sessions.QUIC_SESSION.set(e.source.id, p.host || '');
  if (st === 'SOCKET' && type === 'TCP_CONNECT') sessions.SOCKET++;
  if (st !== 'URL_REQUEST') continue;
  let r = reqs.get(e.source.id);
  if (type === 'URL_REQUEST_START_JOB' && p.url) {
    if (!r) reqs.set(e.source.id, (r = { id: e.source.id, url: p.url, method: p.method, start: +e.time, bytes: 0 }));
  }
  if (!r) continue;
  if (/SEND_REQUEST_HEADERS$/.test(type)) {
    const h = p.headers || [];
    const list = Array.isArray(h) ? h : Object.entries(h).map(([k, v]) => `${k}: ${v}`);
    r.range = hdr(list, 'range') || r.range;
    r.proto = /HTTP2/.test(type) ? 'h2' : /QUIC|HTTP3/.test(type) ? 'h3' : r.proto || 'h1';
    if (p.line) r.proto = 'h1';
  }
  if (type === 'HTTP_TRANSACTION_READ_RESPONSE_HEADERS') {
    const h = p.headers || [];
    r.status = +((h[0] || '').match(/\s(\d{3})/) || [])[1] || r.status;
    r.contentRange = hdr(h, 'content-range');
    r.acceptRanges = hdr(h, 'accept-ranges');
    r.acao = hdr(h, 'access-control-allow-origin');
    r.expose = hdr(h, 'access-control-expose-headers');
    r.contentLength = hdr(h, 'content-length');
    r.cache = hdr(h, 'cf-cache-status') || hdr(h, 'x-cache');
    r.xContentRange = hdr(h, 'x-content-range');
  }
  if (type === 'URL_REQUEST_JOB_FILTERED_BYTES_READ' || type === 'URL_REQUEST_JOB_BYTES_READ') r.bytes += p.byte_count || 0;
  if (type === 'REQUEST_ALIVE' && e.phase === 2) {
    r.end = +e.time;
    if (p.net_error) r.error = errName[p.net_error] || p.net_error;
  }
  if (type === 'FAILED' || (p.net_error && p.net_error < 0)) r.error = errName[p.net_error] || p.net_error;
}

const red = makeRedactor();
const rows = [...reqs.values()].filter((r) => FILTER.test(r.url)).map((r) => ({
  t: +((r.start - (log.events[0]?.time || r.start)) / 1000).toFixed(1),
  url: red.url(r.url),
  range: r.range,
  status: r.status,
  contentRange: r.contentRange,
  xContentRange: r.xContentRange,
  acceptRanges: r.acceptRanges,
  acao: r.acao ? (r.acao === '*' ? '*' : '<origin>') : null,
  expose: r.expose,
  proto: r.proto,
  mb: +(r.bytes / 1048576).toFixed(2),
  error: r.error || null,
  durS: r.end ? +((r.end - r.start) / 1000).toFixed(1) : null,
}));
const mediaHosts = new Set([...reqs.values()].filter((r) => FILTER.test(r.url)).map((r) => { try { return new URL(r.url).hostname; } catch (e) { return ''; } }));
const hosts = {};
for (const [, h] of sessions.HTTP2_SESSION) { if (!mediaHosts.has(h.split(':')[0])) continue; const a = red.hostAlias(h.split(':')[0]); hosts[a] = hosts[a] || { h2: 0, quic: 0 }; hosts[a].h2++; }
for (const [, h] of sessions.QUIC_SESSION) { if (!mediaHosts.has(h.split(':')[0])) continue; const a = red.hostAlias(h.split(':')[0]); hosts[a] = hosts[a] || { h2: 0, quic: 0 }; hosts[a].quic++; }
const summary = {
  requests: rows.length,
  byStatus: rows.reduce((o, r) => ((o[r.status] = (o[r.status] || 0) + 1), o), {}),
  errors: rows.filter((r) => r.error).reduce((o, r) => ((o[r.error] = (o[r.error] || 0) + 1), o), {}),
  protocols: rows.reduce((o, r) => ((o[r.proto] = (o[r.proto] || 0) + 1), o), {}),
  exposeHeaders: [...new Set(rows.map((r) => r.expose).filter(Boolean))],
  sessionsPerHost: hosts,
  tcpConnects: sessions.SOCKET,
};
red.save();
const out = asJson ? JSON.stringify({ summary, rows }, null, 1) : [
  '# NetLog summary (redacted)', '', '```json', JSON.stringify(summary, null, 1), '```', '',
  '| t,s | url | range | status | content-range | expose | proto | MB | error | dur,s |', '|---|---|---|---|---|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.t} | ${r.url} | ${r.range || ''} | ${r.status || ''} | ${r.contentRange || ''} | ${r.expose || ''} | ${r.proto || ''} | ${r.mb} | ${r.error || ''} | ${r.durS ?? ''} |`),
].join('\n');
process.stdout.write(red.text(out) + '\n');
