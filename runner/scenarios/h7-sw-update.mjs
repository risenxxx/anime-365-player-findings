import { SLOW } from './_common.mjs';
export default {
  id: 'h7-sw-update', title: 'Новая версия SW во время игры (swMain.js?v=25)', hypothesis: 'H7',
  expected: 'skipWaiting + clients.claim: новая версия забирает вкладку; поток старого воркера может оборваться.',
  describe: 'CDN 600 КБ/с; 40 с игры, затем sworker.js начинает импортировать ?v=25 и вызывается registration.update(). Ещё 60 с.',
  site: { engine: 'singlethread' }, cdn: { throttleBps: SLOW },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) {
    await b.open(); await b.play(); await b.wait(40);
    await b.site({ engine: 'singlethread', swVersion: 25 });
    b.note('update: ' + await b.swUpdate());
    await b.wait(60);
  },
  judge(m) {
    return { verdict: m.errors.length || m.backJumps.length ? 'воспроизведено' : 'не воспроизводится',
      why: `экземпляров SW: ${m.swInstances.length}; ошибок <video>: ${JSON.stringify(m.errorCodes)}; прыжков назад: ${m.backJumps.length}; serve FAIL: ${m.sw_serveFail}; стояло ${m.stalledSec} с.` };
  },
};
