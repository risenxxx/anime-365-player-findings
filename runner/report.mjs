// Markdown for one scenario run and the summary table (used by run.mjs and reanalyze.mjs).

export function timeline(events, t0) {
  const out = [];
  for (const e of events) {
    const t = `+${((e.t - t0) / 1000).toFixed(1)}s`;
    if (e.src === 'runner') out.push(`${t} runner ${e.action}${e.arg != null ? ' ' + JSON.stringify(e.arg) : ''}${e.note ? ' (' + e.note + ')' : ''}`);
    else if (e.src === 'probe' && e.type === 'media' && e.el === 'main-video_html5_api' && /error|playing|emptied|seeking|waiting|loadstart|canplay|pause/.test(e.ev)) {
      out.push(`${t} video ${e.ev} ct=${e.ct}${e.err ? ` code=${e.err.code} "${e.err.message}"` : ''}`);
    } else if (e.src === 'probe' && e.type === 'call') out.push(`${t} call ${e.fn} el=${e.el}${e.rand ? ' +rand' : ''}${e.ct != null ? ' ct=' + e.ct : ''}`);
    else if (e.src === 'probe' && e.type === 'media' && e.el === 'detached' && e.ev === 'error') out.push(`${t} detached-video error code=${e.err?.code}`);
    else if (e.src === 'console' && /Error #|errors in row|Notify broken|Blacklisting|alternative sources|Current time/.test(e.msg)) out.push(`${t} player: ${e.msg.slice(0, 160)}`);
    else if (e.src === 'probe' && e.type === 'sw') out.push(`${t} page: ${e.ev}`);
    else if (e.src === 'target' && /sworker/.test(e.url || '')) out.push(`${t} sw-target ${e.ev}${e.attached != null ? ' attached=' + e.attached : ''}`);
  }
  // compress: keep at most 200 lines
  return out.length > 200 ? [...out.slice(0, 120), `… ${out.length - 200} lines skipped …`, ...out.slice(-80)] : out;
}

export function userSaw(m) {
  const parts = [];
  if (m.errors.length) parts.push(`ошибок <video>: ${m.errors.length} (коды ${Object.entries(m.errorCodes).map(([c, n]) => `${c}×${n}`).join(', ')})`);
  else parts.push('ошибок <video> нет');
  if (m.loadsAfterStart) parts.push(`перезагрузок load() после старта: ${m.loadsAfterStart} (макс. ${m.reloadsPerMinMax}/мин)`);
  if (m.resetToZero.length) parts.push(`сброс в начало после ошибки: ${m.resetToZero.map((r) => `${r.before.toFixed(0)}→${r.after.toFixed(0)} с${r.pausedAfter ? ', стоп' : ''}`).join('; ')}`);
  if (m.backJumps.length) parts.push(`прыжков назад >5 с: ${m.backJumps.length}`);
  if (m.seekMisses && m.seekMisses.length) parts.push(`**перемотка не сработала**: ${m.seekMisses.map((x) => `на ${x.target} с → ${x.got.toFixed(0)} с`).join('; ')}`);
  parts.push(`сыграно ${m.playedSec} с, стояло ${m.stalledSec} с`);
  parts.push(`notifyBroken: ${m.notifyBroken}`);
  if (m.infiniteLoop) parts.push('**цикл ошибок без notifyBroken**');
  return parts.join('; ');
}

export function scenarioMd(r, sc, { patched } = {}) {
  const m = r.metrics;
  const swCounts = Object.entries(m).filter(([k, v]) => k.startsWith('sw_') && v).map(([k, v]) => `${k.slice(3)}=${v}`).join(', ');
  return `# ${r.id}: ${r.title}

Гипотеза: **${r.hypothesis}**. Вердикт: **${r.verdict}**${patched ? ` (код с патчами: ${patched})` : ''}.

${r.why || ''}

**Ожидалось:** ${r.expected}

**Что увидел пользователь:** ${userSaw(m)}.

**Сценарий:** ${sc.describe || ''}

| метрика | значение |
|---|---|
| ошибки <video> | ${m.errors.map((e) => `+${e.t}s code=${e.code} ct=${e.ct}`).join('<br>') || '—'} |
| load() после старта / src с &rand | ${m.loadsAfterStart} / ${m.randReloads} |
| сброс в начало | ${JSON.stringify(m.resetToZero)} |
| прыжки назад | ${JSON.stringify(m.backJumps)} |
| перемотка не сработала | ${JSON.stringify(m.seekMisses || [])} |
| сыграно / стояло, с | ${m.playedSec} / ${m.stalledSec} |
| notifyBroken (POST brokenVideo) | ${m.notifyBroken} |
| экземпляры SW (по обёртке логов) | ${m.swInstances.join(', ') || '—'} |
| DevTools подключались к SW | ${m.swDevtoolsAttached ? 'да' : 'нет'} |
| строки SW | ${swCounts || '—'} |
| запросы к CDN | ${m.cdnRequests} (${JSON.stringify(m.cdnByDest)}; статусы ${JSON.stringify(m.cdnStatus)}; обрывов ${m.cdnCuts}; ${m.cdnMB} МБ; одновременно до ${m.cdnMaxConcurrent}) |

\`dest=video\` — запрос самого \`<video>\` мимо SW, \`dest=empty\` — \`fetch()\` из SW.

### Ключевые строки SW

\`\`\`
${r.keyLines.join('\n') || '(нет)'}
\`\`\`

### Таймлайн

\`\`\`
${r.timeline.join('\n')}
\`\`\`

### Снимки состояния

\`\`\`json
${JSON.stringify(m.snapshots, null, 1).slice(0, 4000)}
\`\`\`
`;
}

export function summaryMd(results, { date, patched } = {}) {
  const rows = results.map((r) => {
    const m = r.metrics;
    const key = r.keyLines.filter((l) => /serve FAIL|read DIED|NOT OK|MISSING|THREW|Blacklist|handler FAIL|evaluated/.test(l)).slice(0, 3)
      .map((l) => l.replace(/\|/g, '/').replace(/m= \S+ /, '').slice(0, 140)).join('<br>');
    return `| [${r.id}](${r.id}.md) | ${r.hypothesis} | ${userSaw(m).replace(/\|/g, '/')} | ${key || '—'} | **${r.verdict}** |`;
  });
  return `# Сводка прогонов ${date}${patched ? ` (патчи: ${patched})` : ''}

Chrome: ${process.env.CHROME_VERSION || 'см. README'}; локальный сайт + CDN; синтетическое медиа (media/episode.mp4).

| сценарий | гипотеза | что увидел пользователь | ключевые строки SW | вердикт |
|---|---|---|---|---|
${rows.join('\n')}
`;
}
