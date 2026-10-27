import { SLOW } from './_common.mjs';
export default {
  id: 'h3-first-503-sw', title: 'Первый запрос SW к CDN получает 503 (SW)', hypothesis: 'H3',
  expected: '_ensureMeta глотает исключение → фальшивый 206 «bytes 0-104857600/*», а не откат на fetch(request); после ответа с неизвестным размером перемотка может не работать.',
  describe: 'CDN 600 КБ/с; первые 2 медиазапроса → 503. 30 с игры, перемотка на 11:40 (за запасной конец 100 МБ), 30 с, перемотка на 5:00, 20 с.',
  site: { engine: 'singlethread' },
  cdn: { throttleBps: SLOW, faults: [{ action: 'status', code: 503, when: { nth: [1, 2] } }] },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) { await b.open(); await b.play(); await b.wait(30); await b.seek(700); await b.wait(30); await b.seek(300); await b.wait(20); },
  judge(m) {
    const fake = m.sw_totalMissing;
    const misses = (m.seekMisses || []).length;
    const visible = m.errors.length || m.backJumps.length || misses || m.stalledSec > 5;
    return { verdict: !fake ? 'не воспроизводится' : visible ? 'воспроизведено' : 'механизм подтверждён, видимых последствий нет',
      why: `browser req с total=MISSING (ответ 206 с '*' и запасным концом 100 МБ): ${fake}; handler FAIL (честный откат): ${m.sw_handlerFail}; ошибок <video>: ${m.errors.length} ${JSON.stringify(m.errorCodes)}; прыжков назад: ${m.backJumps.length}; несработавших перемоток: ${misses}; стояло ${m.stalledSec} с.` };
  },
};
