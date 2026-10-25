#!/usr/bin/env node
// Builds vendor/patched/<set>/ from the downloaded site code and patches/*.patch.
//
//   node scripts/apply-patches.mjs [set]      set = all (default) | comma list of patch
//                                             prefixes, e.g. 01,02
//
// Patches are unified diffs with paths relative to the site root (a/js/..., b/swMain.js),
// against the files as produced by scripts/pretty.mjs (js/**) and against the original
// swMain.js / sworker.js (not minified). They are applied in file-name order, so a later
// patch to the same file is written on top of the earlier ones.
// The prettified concatenate/embed scripts are served instead of the .min.js originals:
// js-beautify only changes whitespace, so the behaviour is the same.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const set = process.argv[2] || 'all';
const PATCHES = path.join(ROOT, 'patches');
const OUT = path.join(ROOT, 'vendor', 'patched', set);

const all = fs.readdirSync(PATCHES).filter((f) => f.endsWith('.patch')).sort();
const chosen = set === 'all' ? all : all.filter((f) => set.split(',').some((p) => f.startsWith(p)));
if (!chosen.length) throw new Error('no patches for set ' + set);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const seeded = new Set();
for (const p of chosen) {
  const text = fs.readFileSync(path.join(PATCHES, p), 'utf8');
  for (const m of text.matchAll(/^\+\+\+ b\/(\S+)/gm)) {
    const rel = m[1];
    if (seeded.has(rel)) continue;
    seeded.add(rel);
    const pretty = path.join(ROOT, 'vendor', 'pretty', rel);
    const orig = path.join(ROOT, 'vendor', 'site', rel);
    const src = rel.startsWith('js/') ? pretty : orig;
    if (!fs.existsSync(src)) throw new Error(`missing ${path.relative(ROOT, src)} (run fetch-site and pretty)`);
    fs.mkdirSync(path.dirname(path.join(OUT, rel)), { recursive: true });
    fs.copyFileSync(src, path.join(OUT, rel));
  }
  execFileSync('patch', ['-p1', '-s', '--forward', '--no-backup-if-mismatch', '-d', OUT, '-i', path.join(PATCHES, p)], { stdio: 'inherit' });
  console.log('applied ' + p);
}
console.log(`vendor/patched/${set}/ ready (${[...seeded].join(', ')})`);
