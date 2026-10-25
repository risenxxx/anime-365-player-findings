import { SLOW, cutEvery, outageAfterCut, judgeLoop } from './_common.mjs';
export default {
  id: 'h1-long-outage-sw', title: 'Обрыв через 6 МБ + 40 с отказа CDN (503) (sw)', hypothesis: 'H1',
  expected: 'Отказ дольше бюджета повторов Chrome (~30 попыток) и буфера → ошибка <video> → load() через 500 мс → playing обнуляет errorCounter → цикл без notifyBroken.',
  describe: 'CDN 600 КБ/с; каждый ответ обрывается после 6 МБ тела, следующие 40 с все медиазапросы получают 503 (с CORS). 150 с игры; «пользователь» жмёт Play, если плеер встал после ошибки.',
  site: { engine: 'singlethread' }, cdn: { throttleBps: SLOW, faults: [cutEvery(6 * 1048576), outageAfterCut(503, 40000)] },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) { await b.open(); await b.play(); await b.wait(210); },
  judge: (m) => judgeLoop(m),
};
