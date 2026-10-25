#!/usr/bin/env node
// Writes prettified copies of the vendored site scripts to vendor/pretty/,
// using the same layout as `js-beautify -s 2` (indent 2, other options default).
// Line numbers in REPORT.md and in patches/ refer to these files,
// except swMain.js, which is not minified and is referenced as downloaded.
//
//   node scripts/pretty.mjs              all JS files from the manifest
//   node scripts/pretty.mjs <in> [out]   a single file

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import beautify from 'js-beautify';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OPTS = { indent_size: 2 };

export function pretty(src) {
  return beautify.js(src, OPTS) + '\n';
}

function main() {
  const [inFile, outFile] = process.argv.slice(2);
  if (inFile) {
    const out = pretty(fs.readFileSync(inFile, 'utf8'));
    if (outFile) fs.writeFileSync(outFile, out);
    else process.stdout.write(out);
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'vendor-manifest.json'), 'utf8'));
  for (const f of manifest.files) {
    if (!f.path.endsWith('.js')) continue;
    const rel = f.path.replace(/^\//, '');
    const src = path.join(ROOT, 'vendor', 'site', rel);
    if (!fs.existsSync(src)) {
      console.error('missing ' + rel + ' (run scripts/fetch-site.mjs)');
      continue;
    }
    const dst = path.join(ROOT, 'vendor', 'pretty', rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, pretty(fs.readFileSync(src, 'utf8')));
  }
  console.log('wrote vendor/pretty/');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
