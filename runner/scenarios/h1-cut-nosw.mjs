import { SLOW, cutEvery, statusAfterCut, judgeLoop } from './_common.mjs';
export default {
  id: 'h1-cut-nosw',
  title: 'Обрыв каждого ответа CDN через 6 МБ (без SW)',
  hypothesis: 'H1',
  expected: 'Медиастек Chrome сам повторяет range-запрос после обрыва; плеер ошибок не видит.',
  describe: 'То же, кэширование SW выключено.',
  site: { engine: 'off' },
  cdn: { throttleBps: SLOW, faults: [cutEvery(6 * 1048576)] },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) {
    await b.open();
    await b.play();
    await b.wait(150);
  },
  judge: (m) => judgeLoop(m),
};
