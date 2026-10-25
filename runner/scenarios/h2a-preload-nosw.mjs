import { SLOW, judgeReset } from './_common.mjs';
// Error exactly at ct=0: the first response is cut during preload (after moov, 978 KB)
// and Chrome's retry gets 503. No SW, so no forward loader can take the 503 instead.
export default {
  id: 'h2a-preload-nosw', title: 'Ошибка во время preload (ct=0), затем ошибка на ~1:30 (без SW)', hypothesis: 'H2a',
  expected: 'Первая ошибка при ct=0 оставляет lastSuccessTime=0 навсегда; после второй ошибки позиция не восстанавливается → серия с начала, плеер на паузе.',
  describe: 'CDN 600 КБ/с. Первый ответ обрывается на 1.5 МБ (preload, до Play), следующий запрос → 503. «Пользователь» жмёт Play. В +95 с обрыв, первый запрос после него → 503.',
  site: { engine: 'off' },
  cdn: { throttleBps: SLOW, faults: [{ action: 'cut', afterBytes: 1536 * 1024, when: { nth: [1, 1] } }, { action: 'status', code: 503, when: { afterCut: 1 } }] },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) {
    await b.open();
    await b.wait(12);
    await b.play(); await b.wait(80);
    await b.cdnCut(); await b.wait(60);
  },
  judge: (m) => judgeReset(m),
};
