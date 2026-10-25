import { SLOW, cutEvery, statusAfterCut, judgeLoop } from './_common.mjs';
export default {
  id: 'h1-cut-sw',
  title: 'Обрыв каждого ответа CDN через 6 МБ (SW)',
  hypothesis: 'H1',
  expected: 'По коду serve() переоткрывает соединение после обрыва; если переоткрытие успешно, плеер ошибок не видит.',
  describe: 'CDN 600 КБ/с, каждый ответ обрывается после 6 МБ тела. 150 с игры.',
  site: { engine: 'singlethread' },
  cdn: { throttleBps: SLOW, faults: [cutEvery(6 * 1048576)] },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) {
    await b.open();
    await b.play();
    await b.wait(150);
  },
  judge: (m) => judgeLoop(m),
};
