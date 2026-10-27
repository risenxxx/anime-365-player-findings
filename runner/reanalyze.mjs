#!/usr/bin/env node
// Recomputes metrics, verdicts and the markdown of an existing run from its raw logs,
// without running anything again (e.g. after a detector or judge fix).
//
//   node runner/reanalyze.mjs results/<dir> [scenario ids...]
//
// Reads <dir>/raw/<id>/{events,sw,site,cdn}.jsonl and metrics.json (state snapshots),
// rewrites <dir>/<id>.md, <dir>/results.json and <dir>/summary.md.
import fs from 'node:fs';
import path from 'node:path';
import { analyze, keySwLines } from './detectors.mjs';
import { SCENARIOS } from './scenarios/index.mjs';
import { timeline, scenarioMd, summaryMd } from './report.mjs';

const [dirArg, ...ids] = process.argv.slice(2);
if (!dirArg) {
  console.error('usage: reanalyze.mjs results/<dir> [scenario ids...]');
  process.exit(2);
}
const OUT = path.resolve(dirArg);
const patched = /-patched/.test(path.basename(OUT)) ? 'all' : null;
const date = path.basename(OUT).slice(0, 10);
const readJsonl = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);

const resultsPath = path.join(OUT, 'results.json');
const results = fs.existsSync(resultsPath) ? JSON.parse(fs.readFileSync(resultsPath, 'utf8')) : [];
const todo = SCENARIOS.filter((sc) => fs.existsSync(path.join(OUT, 'raw', sc.id)) && (!ids.length || ids.includes(sc.id)));

for (const sc of todo) {
  const dir = path.join(OUT, 'raw', sc.id);
  const events = readJsonl(path.join(dir, 'events.jsonl'));
  if (!events.length) continue;
  const t0 = events[0].t;
  const sw = readJsonl(path.join(dir, 'sw.jsonl'));
  const site = readJsonl(path.join(dir, 'site.jsonl'));
  const cdn = readJsonl(path.join(dir, 'cdn.jsonl'));
  const old = fs.existsSync(path.join(dir, 'metrics.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'metrics.json'), 'utf8')) : {};
  const metrics = analyze({ events, sw, site, cdn, t0 });
  metrics.snapshots = old.snapshots || [];
  let verdict;
  try { verdict = sc.judge(metrics); } catch (e) { verdict = { verdict: 'ошибка стенда', why: 'judge: ' + e.message }; }
  const result = { id: sc.id, title: sc.title, hypothesis: sc.hypothesis, expected: sc.expected, metrics, ...verdict, keyLines: keySwLines(sw, t0), timeline: timeline(events, t0) };
  fs.writeFileSync(path.join(dir, 'metrics.json'), JSON.stringify(metrics, null, 2));
  fs.writeFileSync(path.join(OUT, `${sc.id}.md`), scenarioMd(result, sc, { patched }));
  const i = results.findIndex((r) => r.id === sc.id);
  const slim = { ...result, timeline: undefined };
  if (i >= 0) results[i] = slim; else results.push(slim);
  console.log(`${sc.id}: ${verdict.verdict}`);
}
results.sort((a, b) => SCENARIOS.findIndex((s) => s.id === a.id) - SCENARIOS.findIndex((s) => s.id === b.id));
fs.writeFileSync(resultsPath, JSON.stringify(results, null, 1));
fs.writeFileSync(path.join(OUT, 'summary.md'), summaryMd(results.map((r) => ({ ...r, keyLines: r.keyLines || [] })), { date, patched }));
console.log(`rewrote ${path.relative(process.cwd(), OUT)}/summary.md`);
