#!/usr/bin/env node
// Redaction for anything derived from real traffic, and a pre-commit check.
//
//   node scripts/redact.mjs <in> [out]     redact a text/JSON file (stdout if no out)
//   node scripts/redact.mjs --check [files...]
//        scan files (default: everything tracked or staged in git) for CDN URLs, signed
//        query strings, cookies, CSRF tokens, IP addresses, home-directory paths, e-mail
//        addresses and the local user/host/git identity. Exit code 1 on any finding.
//
// Redaction rules (rule 0.2 of README):
//   - hosts that are not the site itself or local -> cdn-1, cdn-2, ... (stable within a run;
//     the mapping is kept in captures/raw/aliases.json, which is git-ignored)
//   - query strings dropped, except m, which becomes a stable alias m-A, m-B, ...
//   - path of CDN URLs replaced by /<redacted>.<ext>
//   - Cookie / Set-Cookie / csrf values, IPv4/IPv6 addresses, $HOME paths, e-mails removed
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ALIASES = path.join(ROOT, 'captures', 'raw', 'aliases.json');

// The site itself (page URLs are public and fine to mention) and local/bench hosts.
const SITE_HOST = /(^|\.)smotret-anime\.(org|co|ru|net|online|app)$|(^|\.)anime-365\.ru$/;
const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0|cache\.local|cdn-\d+|example\.(com|invalid|org))$/;
const DOC_HOST = /(^|\.)(github\.com|chromium\.org|chrome\.com|google\.com|googlesource\.com|mozilla\.org|w3\.org|whatwg\.org|mitmproxy\.org|videojs\.com|ffmpeg\.org|nodejs\.org|npmjs\.com|npmjs\.org|apple\.com|webkit\.org|brew\.sh|cloudflare\.com)$/;
const ALLOWED_EMAILS = new Set(['info@smotret-anime.ru', 'player-findings@users.noreply.invalid']);
const QUERY_KEYS_OK = new Set(['m', 'v', 'rand', 'since', 'dest', 'willcache']); // `sig` only on local hosts (not checked)

function loadAliases() {
  try { return JSON.parse(fs.readFileSync(ALIASES, 'utf8')); } catch (e) { return { hosts: {}, m: {} }; }
}
function saveAliases(a) {
  fs.mkdirSync(path.dirname(ALIASES), { recursive: true });
  fs.writeFileSync(ALIASES, JSON.stringify(a, null, 1));
}
const letters = (n) => { let s = ''; n++; while (n > 0) { n--; s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26); } return s; };

export function makeRedactor(aliases = loadAliases()) {
  const hostAlias = (h) => {
    h = h.toLowerCase();
    if (SITE_HOST.test(h) || LOCAL_HOST.test(h) || DOC_HOST.test(h)) return h;
    if (!aliases.hosts[h]) aliases.hosts[h] = `cdn-${Object.keys(aliases.hosts).length + 1}`;
    return aliases.hosts[h];
  };
  const mAlias = (v) => {
    if (!v || /^bench-|^m-[A-Z]+$/.test(v)) return v;
    if (!aliases.m[v]) aliases.m[v] = `m-${letters(Object.keys(aliases.m).length)}`;
    return aliases.m[v];
  };
  const url = (raw) => {
    let u;
    try { u = new URL(raw.startsWith('//') ? 'https:' + raw : raw); } catch (e) { return '<url>'; }
    const host = hostAlias(u.hostname);
    const isCdn = /^cdn-\d+$/.test(host);
    const m = u.searchParams.get('m');
    let p = u.pathname;
    if (isCdn) {
      const ext = (p.match(/\.([a-z0-9]{2,5})$/i) || [])[1];
      p = '/<redacted>' + (ext ? '.' + ext : '');
    } else {
      p = p.split('/').map((seg) => (/^[A-Za-z0-9_-]{24,}$/.test(seg) || /^[a-f0-9]{16,}$/i.test(seg) ? '<tok>' : seg)).join('/');
    }
    const q = m ? `?m=${mAlias(m)}` : '';
    const port = u.port && LOCAL_HOST.test(host) ? ':' + u.port : '';
    return `${u.protocol}//${host}${port}${p}${q}`;
  };
  const text = (s) => {
    s = s.replace(/(?:https?:)?\/\/[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?::\d+)?(?:\/[^\s"'<>\\)\]]*)?/g, (r) => url(r));
    s = s.replace(/("(?:cookie|set-cookie)"\s*:\s*)"[^"]*"/gi, '$1"<redacted>"');
    s = s.replace(/\b((?:set-)?cookie)\s*:\s*[^\n"]+/gi, '$1: <redacted>');
    s = s.replace(/((?:csrf|x-csrf-token|YII_CSRF_TOKEN)["']?\s*[:=]\s*["']?)[A-Za-z0-9+/=_-]{6,}/gi, '$1<redacted>');
    s = s.replace(/([?&;](?:sig|signature|token|expires|st|e|s|h|hash|md5|key|auth|t)=)[^&\s"']+/gi, '$1<redacted>');
    s = s.replace(/\b(m=\s?|mParam[":\s]+|video-cache-v1-)([A-Za-z0-9_-]{3,})/g, (all, pre, v) => pre + mAlias(v));
    s = s.replace(/\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g, (all, ...o) => (isIp(o) && !isLoopback(all) ? '<ip>' : all));
    s = s.replace(/\b(?:[0-9a-f]{1,4}:){3,7}[0-9a-f]{1,4}\b/gi, (all) => (/[a-f]/i.test(all) || all.split(':').length > 4 ? '<ip6>' : all));
    s = s.replace(/\/Users\/[^/\s"']+|\/home\/[^/\s"']+/g, '$HOME');
    s = s.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, (e) => (ALLOWED_EMAILS.has(e.toLowerCase()) ? e : '<email>'));
    return s;
  };
  return { text, url, mAlias, hostAlias, save: () => saveAliases(aliases) };
}

const isIp = (o) => o.slice(0, 4).every((x) => +x <= 255);
const isLoopback = (ip) => ip.startsWith('127.') || ip === '0.0.0.0';

// ---------------------------------------------------------------- check mode
function identity() {
  const ids = [];
  const add = (label, v) => { if (v && String(v).trim().length >= 3) ids.push({ label, re: new RegExp(escapeRe(String(v).trim()), 'i') }); };
  try { add('local user name', os.userInfo().username); } catch (e) {}
  add('host name', os.hostname().split('.')[0]);
  for (const k of ['user.name', 'user.email']) {
    try { add(`global git ${k}`, execFileSync('git', ['config', '--global', k], { encoding: 'utf8' })); } catch (e) {}
  }
  try {
    const name = execFileSync('git', ['config', '--global', 'user.name'], { encoding: 'utf8' }).trim();
    for (const part of name.split(/\s+/)) add('part of global git user.name', part.length >= 4 ? part : null);
  } catch (e) {}
  return ids;
}
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function checkText(content, ids = identity(), { generated = false } = {}) {
  const findings = [];
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    const hit = (what, sample) => findings.push({ line: i + 1, what, sample: String(sample).slice(0, 80) });
    for (const m of line.matchAll(/(?:https?:)?\/\/([A-Za-z0-9.-]+\.[A-Za-z]{2,}|localhost|\d+\.\d+\.\d+\.\d+)(?::\d+)?(\/[^\s"'<>\\)\]`]*)?/g)) {
      const host = m[1].toLowerCase();
      if (!(SITE_HOST.test(host) || LOCAL_HOST.test(host) || DOC_HOST.test(host))) hit('unknown host (CDN?)', host);
      const q = (m[2] || '').split('?')[1];
      if (q && !LOCAL_HOST.test(host) && !DOC_HOST.test(host)) {
        for (const kv of q.split('&')) {
          const [k, v = ''] = kv.split('=');
          if (k && !QUERY_KEYS_OK.has(k) && !/^\d+$/.test(k)) hit('query parameter', kv);
          if (k === 'm' && v && !/^(bench-[A-Za-z0-9]+|m-[A-Z]+|<[^>]*>|\$\{.*)$/.test(v)) hit('unaliased m', v);
        }
      }
    }
    if (/\b(?:set-)?cookie\s*[:=]\s*["']?[A-Za-z0-9_-]+=[^\s"';]{6,}/i.test(line)) hit('cookie value', line.trim());
    const csrf = line.match(/(?:csrf|YII_CSRF_TOKEN)["']?\s*[:=]\s*["']([A-Za-z0-9+/=_-]{16,})/i);
    if (csrf) hit('csrf token', csrf[1]);
    for (const ip of line.matchAll(/\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g)) {
      if (isIp(ip.slice(1)) && !isLoopback(ip[0]) && !/^\d+\.\d+\.\d+\.\d+$/.test(line.trim()) && !versionLike(line, ip.index)) hit('IP address', ip[0]);
    }
    for (const ip6 of line.matchAll(/\b(?:[0-9a-f]{1,4}:){4,7}[0-9a-f]{1,4}\b/gi)) if (/[a-f]/i.test(ip6[0])) hit('IPv6 address', ip6[0]);
    const home = line.match(/\/Users\/(?!Shared\b)[A-Za-z0-9._-]+|\/home\/[A-Za-z0-9._-]+|C:\\Users\\[^\\\s]+/);
    if (home) hit('home directory path', home[0]);
    // package-lock.json carries public npm author addresses; it is generated, not ours
    if (!generated) for (const e of line.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) {
      if (!ALLOWED_EMAILS.has(e[0].toLowerCase()) && !/@(example\.(com|invalid|org))$/.test(e[0])) hit('e-mail address', e[0]);
    }
    for (const id of ids) if (id.re.test(line)) hit(id.label, '(not shown)');
  });
  return findings;
}
// "Chrome/155.0.8059.85" and similar version strings are not addresses
function versionLike(line, idx) {
  return /[A-Za-z/]$/.test(line.slice(Math.max(0, idx - 1), idx)) || /\d+\.\d+\.\d+\.\d+\.\d+/.test(line.slice(idx, idx + 30));
}

function gitFiles() {
  const run = (a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  const files = new Set([...run(['ls-files']), ...run(['diff', '--cached', '--name-only', '--diff-filter=ACMR'])]);
  return [...files].filter((f) => fs.existsSync(path.join(ROOT, f)));
}

function check(files) {
  const ids = identity();
  let total = 0;
  for (const f of files) {
    const abs = path.resolve(ROOT, f);
    const buf = fs.readFileSync(abs);
    if (buf.includes(0)) continue; // binary
    const findings = checkText(buf.toString('utf8'), ids, { generated: path.basename(abs) === 'package-lock.json' });
    for (const x of findings) {
      total++;
      console.log(`${path.relative(ROOT, abs)}:${x.line}: ${x.what}: ${x.sample}`);
    }
  }
  if (total) {
    console.log(`\nredact --check: ${total} finding(s). Fix them before committing.`);
    process.exit(1);
  }
  console.log(`redact --check: ok (${files.length} files)`);
}

function main() {
  const a = process.argv.slice(2);
  if (a[0] === '--check') return check(a.length > 1 ? a.slice(1) : gitFiles());
  if (!a[0]) {
    console.error('usage: redact.mjs <in> [out] | --check [files...]');
    process.exit(2);
  }
  const r = makeRedactor();
  const out = r.text(fs.readFileSync(a[0], 'utf8'));
  r.save();
  if (a[1]) fs.writeFileSync(a[1], out);
  else process.stdout.write(out);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
