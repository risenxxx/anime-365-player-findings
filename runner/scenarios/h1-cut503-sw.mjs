import { SLOW, cutEvery, statusAfterCut, judgeLoop } from './_common.mjs';
export default {
  id: 'h1-cut503-sw',
  title: 'Обрыв через 6 МБ + 503 на следующий запрос (SW)',
  hypothesis: 'H1',
  expected: 'Переоткрытие в serve() получает 503 → serve FAIL → ошибка <video> → load() → playing обнуляет errorCounter → цикл без notifyBroken.',
  describe: 'CDN 600 КБ/с; каждый ответ обрывается после 6 МБ, первый запрос после каждого обрыва получает 503 (с CORS). 150 с игры.',
  site: { engine: 'singlethread' },
  cdn: { throttleBps: SLOW, faults: [cutEvery(6 * 1048576), statusAfterCut(503)] },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) {
    await b.open();
    await b.play();
    await b.wait(150);
  },
  judge: (m) => judgeLoop(m),
};
