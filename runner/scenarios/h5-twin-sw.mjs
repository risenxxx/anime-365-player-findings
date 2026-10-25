// Same URL and m, other bytes of the same size (another encode). Three page opens.
export default {
  id: 'h5-twin-sw', title: 'Под тем же m другой файл той же длины (SW, три открытия)', hypothesis: 'H5',
  expected: 'Куски A из кэша смешиваются с B → ошибка декодирования → blacklist → с начала; при следующем открытии (после остановки SW) — снова.',
  describe: 'Открытие 1: файл A, 40 с игры (CDN 1 МБ/с), закрыть. CDN начинает отдавать B. Пауза 45 с (SW простаивает). Открытие 2 и 3: перемотка на 6:00, 40 с.',
  site: { engine: 'singlethread' },
  cdn: { throttleBps: 1048576 },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) {
    await b.open(); await b.play(); await b.wait(40); await b.snapshot('after open 1'); await b.closePage();
    await b.cdn({ throttleBps: 1048576, faults: [{ action: 'file', name: 'twin' }] });
    for (const k of [2, 3]) {
      await b.wait(45);
      await b.open({ warm: false }); await b.play(); await b.wait(5); await b.seek(360); await b.wait(40);
      await b.snapshot('after open ' + k); await b.closePage();
    }
  },
  judge(m) {
    const decode = m.errorCodes[3] || 0;
    return { verdict: decode >= 2 ? 'воспроизведено' : decode ? 'частично' : 'не воспроизводится',
      why: `MEDIA_ERR_DECODE: ${decode}; blacklist: ${m.playerBlacklist}; сбросов в начало: ${m.resetToZero.length}; экземпляры SW: ${m.swInstances.length}; кэш после открытий: ${m.snapshots.map((s) => s.label + '=' + JSON.stringify(s.cache)).join('; ')}.` };
  },
};
