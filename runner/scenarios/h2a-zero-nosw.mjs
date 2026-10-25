import { SLOW, judgeReset } from './_common.mjs';
export default {
  id: 'h2a-zero-nosw', title: 'Ошибка на 0:00 до старта, затем ошибка на ~1:30 (nosw)', hypothesis: 'H2a',
  expected: 'Первая ошибка при ct=0 оставляет lastSuccessTime=0; вторая ошибка не восстанавливает позицию → серия с начала, на паузе.',
  describe: 'CDN 600 КБ/с. Пока плеер на паузе до старта (preload), ответ обрывается и следующие 5 с все запросы получают 503 → ошибка при ct=0; пользователь жмёт Play. В +95 с тот же сбой.',
  site: { engine: 'off' },
  cdn: { throttleBps: SLOW, faults: [{ action: 'status', code: 503, when: { withinMsAfterCut: 5000 } }] },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) {
    await b.open();
    await b.wait(2); await b.cdnCut(); await b.wait(12);
    await b.play(); await b.wait(80);
    await b.cdnCut(); await b.wait(40);
  },
  judge: (m) => judgeReset(m),
};
