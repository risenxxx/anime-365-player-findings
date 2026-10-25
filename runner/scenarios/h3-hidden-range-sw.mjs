export default {
  id: 'h3-hidden-range-sw', title: 'CDN не открывает Content-Range в Expose-Headers (SW)', hypothesis: 'H3',
  expected: 'Каждый ответ SW → «missing Content-Range» → meta null → фальшивый 206 → serve FAIL; после code 4 — blacklist и прямой путь.',
  describe: 'Access-Control-Expose-Headers без Content-Range. 30 с игры, перемотка на 11:40 (за запасной конец 100 МБ), 30 с, перемотка на 5:00, 20 с.',
  site: { engine: 'singlethread' },
  cdn: { faults: [{ action: 'hideHeader', header: 'Content-Range' }] },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) { await b.open(); await b.play(); await b.wait(30); await b.seek(700); await b.wait(30); await b.seek(300); await b.wait(20); },
  judge(m) {
    return { verdict: m.sw_totalMissing || m.sw_badRange ? 'воспроизведено' : 'не воспроизводится',
      why: `BAD range: ${m.sw_badRange}; total=MISSING: ${m.sw_totalMissing}; serve FAIL: ${m.sw_serveFail}; ошибок <video>: ${JSON.stringify(m.errorCodes)}; blacklist: ${m.playerBlacklist}; прямых запросов <video>: ${m.cdnElementDirect}; сыграно ${m.playedSec} с.` };
  },
};
