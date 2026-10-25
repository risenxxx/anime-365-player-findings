import { SLOW } from './_common.mjs';
export default {
  id: 'h6-long-pause-sw', title: 'Пауза 6 минут, затем продолжение (SW)', hypothesis: 'H6', long: true,
  expected: 'За время паузы простаивающий SW останавливается; поток к <video> рвётся; после продолжения — кэширование выключено (новый экземпляр не получил setVideoCachingEnabled).',
  describe: 'CDN 300 КБ/с; 30 с игры, пауза 360 с, 60 с игры.',
  site: { engine: 'singlethread' }, cdn: { throttleBps: 300 * 1024 },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) { await b.open(); await b.play(); await b.wait(30); await b.pause(); await b.wait(360); await b.play(); await b.wait(60); },
  judge(m) {
    return { verdict: m.swInstances.length > 1 ? (m.errors.length ? 'воспроизведено' : 'частично') : 'не воспроизводится',
      why: `экземпляров SW: ${m.swInstances.length}; bypass (кэш выключен) после рестарта: ${m.sw_bypassDisabled}; ошибок <video>: ${JSON.stringify(m.errorCodes)}; стояло ${m.stalledSec} с.` };
  },
};
