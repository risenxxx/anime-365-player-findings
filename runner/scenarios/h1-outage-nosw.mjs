import { SLOW, cutEvery, outageAfterCut, judgeLoop } from './_common.mjs';
export default {
  id: 'h1-outage-nosw', title: 'Обрыв через 6 МБ + 5 с отказа CDN (503) (nosw)', hypothesis: 'H1',
  expected: 'Отказ длиннее повторов serve() и медиастека Chrome → ошибка <video> → load() через 500 мс → playing обнуляет errorCounter → цикл без notifyBroken.',
  describe: 'CDN 600 КБ/с; каждый ответ обрывается после 6 МБ тела, следующие 5 с все медиазапросы получают 503 (с CORS). 150 с игры; «пользователь» жмёт Play, если плеер встал после ошибки.',
  site: { engine: 'off' }, cdn: { throttleBps: SLOW, faults: [cutEvery(6 * 1048576), outageAfterCut(503, 5000)] },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) { await b.open(); await b.play(); await b.wait(150); },
  judge: (m) => judgeLoop(m),
};
