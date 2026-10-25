import { SLOW } from './_common.mjs';
// Long: ~8 min. No DevTools on the worker (runner never attaches to it).
export default {
  id: 'h6-long-play-sw', title: 'Непрерывная игра 8 минут без DevTools на воркере', hypothesis: 'H6', long: true,
  expected: 'Chrome останавливает воркер с событием fetch дольше ~5 мин → обрыв потока примерно на 5-й минуте.',
  describe: 'CDN 300 КБ/с (загрузчик не успевает закэшировать всё), 480 с игры.',
  site: { engine: 'singlethread' }, cdn: { throttleBps: 300 * 1024 },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) { await b.open(); await b.play(); await b.wait(480); },
  judge(m) {
    const restarted = m.swInstances.length > 1;
    return { verdict: restarted && (m.errors.length || m.stalledSec > 5) ? 'воспроизведено' : restarted ? 'частично' : 'не воспроизводится',
      why: `экземпляров SW: ${m.swInstances.length} (${m.swInstances.join(', ')}); DevTools к SW: ${m.swDevtoolsAttached ? 'да' : 'нет'}; ошибок <video>: ${JSON.stringify(m.errorCodes)}; стояло ${m.stalledSec} с; serve FAIL: ${m.sw_serveFail}.` };
  },
};
