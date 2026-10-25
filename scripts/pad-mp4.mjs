#!/usr/bin/env node
// pad-mp4.mjs <in.mp4> <reference.mp4> <out.mp4>
// Appends a top-level `free` box so <out> has exactly the byte size of <reference>.
// A trailing free box is ignored by demuxers, so the file stays valid.
import fs from 'node:fs';

const [inFile, refFile, outFile] = process.argv.slice(2);
const src = fs.readFileSync(inFile);
const target = fs.statSync(refFile).size;
const pad = target - src.length;
if (pad < 8) {
  console.error(`cannot pad: ${inFile} is ${src.length} bytes, reference ${target} (need >= 8 bytes of room)`);
  process.exit(1);
}
const box = Buffer.alloc(pad);
box.writeUInt32BE(pad, 0);
box.write('free', 4, 'ascii');
fs.writeFileSync(outFile, Buffer.concat([src, box]));
console.log(`padded ${inFile} by ${pad} bytes -> ${outFile} (${target} bytes)`);
