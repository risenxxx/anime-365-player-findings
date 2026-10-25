import { SLOW, cutEvery, statusAfterCut, judgeLoop } from './_common.mjs';
export default {
  id: 'h1-cut503-nosw',
  title: 'Обрыв через 6 МБ + 503 на следующий запрос (без SW)',
  hypothesis: 'H1',
  expected: 'Повтор Chrome получает 503 → MEDIA_ERR_NETWORK → load() → playing → цикл без notifyBroken.',
  describe: 'То же, кэширование SW выключено.',
  site: { engine: 'off' },
  cdn: { throttleBps: SLOW, faults: [cutEvery(6 * 1048576), statusAfterCut(503)] },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) {
    await b.open();
    await b.play();
    await b.wait(150);
  },
  judge: (m) => judgeLoop(m),
};
