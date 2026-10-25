#!/usr/bin/env node
// Downloads the site's player files into vendor/site/ (git-ignored) and checks
// them against vendor-manifest.json.
//
//   node scripts/fetch-site.mjs            download + verify (default)
//   node scripts/fetch-site.mjs --accept   record the hashes of what was downloaded
//                                          (use only after reviewing a reported change)
//
// Files are downloaded one by one into vendor/site/.incoming/. A file is moved into
// vendor/site/ only when its sha256 matches the manifest. On mismatch nothing is
// overwritten: the new copy stays in .incoming/ and the script exits with code 2.
//
// The embed page is volatile (no-store, contains CSRF token), so it is not hashed;
// instead its list of external scripts is compared with the manifest.
// The obfuscated data: script in the embed page is never decoded or executed;
// scripts/build-embed.mjs drops it when building the local copy.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'vendor-manifest.json');
const OUT = path.join(ROOT, 'vendor', 'site');
const INCOMING = path.join(OUT, '.incoming');
const accept = process.argv.includes('--accept');

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const UA = manifest.userAgent;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

// vendor/site/<path without leading slash>; query is kept in the manifest only
export function localPath(entry) {
  return path.join(OUT, entry.path.replace(/^\//, ''));
}

async function download(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: '*/*' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function externalScripts(html) {
  const list = [];
  const re = /<script\b[^>]*\ssrc="(\/[^"]+)"/gi;
  let m;
  while ((m = re.exec(html))) list.push(m[1]);
  return list;
}

async function main() {
  fs.mkdirSync(INCOMING, { recursive: true });
  const problems = [];
  let changed = false;

  for (const entry of manifest.files) {
    const url = manifest.origin + entry.path + (entry.query ? '?' + entry.query : '');
    process.stdout.write(`${entry.path}${entry.query ? '?' + entry.query : ''} ... `);
    let buf;
    try {
      buf = await download(url);
    } catch (e) {
      console.log('FAILED: ' + e.message);
      problems.push(`${entry.path}: download failed (${e.message})`);
      continue;
    }
    const incoming = path.join(INCOMING, entry.path.replace(/^\//, ''));
    fs.mkdirSync(path.dirname(incoming), { recursive: true });
    fs.writeFileSync(incoming, buf);
    const hash = sha256(buf);

    if (entry.volatile) {
      const found = externalScripts(buf.toString('utf8'));
      const expected = manifest.files.filter((f) => f.inEmbed).map((f) => f.path + (f.query ? '?' + f.query : ''));
      const missing = expected.filter((s) => !found.includes(s));
      const extra = found.filter((s) => !expected.includes(s));
      if (missing.length || extra.length) {
        console.log('SCRIPT LIST CHANGED');
        problems.push(`${entry.path}: script list differs from manifest\n    missing: ${missing.join(', ') || '-'}\n    new:     ${extra.join(', ') || '-'}`);
        if (!accept) continue;
      } else console.log(`ok (volatile, ${buf.length} bytes, script list matches)`);
      move(incoming, entry);
      continue;
    }

    if (!entry.sha256 || accept) {
      if (entry.sha256 && entry.sha256 !== hash) console.log(`ACCEPTED new hash ${hash.slice(0, 12)}… (was ${entry.sha256.slice(0, 12)}…)`);
      else console.log(`recorded ${hash.slice(0, 12)}… (${buf.length} bytes)`);
      entry.sha256 = hash;
      entry.bytes = buf.length;
      changed = true;
      move(incoming, entry);
    } else if (entry.sha256 === hash) {
      console.log(`ok ${hash.slice(0, 12)}…`);
      move(incoming, entry);
    } else {
      console.log('HASH MISMATCH');
      problems.push(`${entry.path}?${entry.query || ''}: sha256 ${hash} (${buf.length} bytes), manifest has ${entry.sha256} (${entry.bytes} bytes).\n    New copy kept in ${path.relative(ROOT, incoming)}; vendor copy left as is.`);
    }
    await sleep(manifest.delayMs ?? 300);
  }

  if (changed) {
    manifest.fetchedAt = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
    console.log('\nvendor-manifest.json updated.');
  }
  if (problems.length) {
    console.log('\nThe site code differs from the manifest. Line references in REPORT.md may be stale.');
    for (const p of problems) console.log(' - ' + p);
    console.log('\nReview the diff (scripts/pretty.mjs on both copies), then rerun with --accept if intended.');
    process.exit(2);
  }
  fs.rmSync(INCOMING, { recursive: true, force: true });
}

function move(from, entry) {
  const to = localPath(entry);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.renameSync(from, to);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
