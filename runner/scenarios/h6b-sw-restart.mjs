import { SLOW } from './_common.mjs';
// Seen on the live site: Chrome stopped the idle SW ~45 s into a pause and started it again
// later; the new instance bypassed caching (53 MB re-downloaded with a full cache).
export default {
  id: 'h6b-sw-restart', title: 'SW остановлен браузером во время паузы, затем продолжение', hypothesis: 'H6',
  expected: 'Новый экземпляр начинает с videoCachingEnabled=false: после продолжения запросы <video> идут мимо SW и кэша, хотя кэш есть.',
  describe: 'CDN 600 КБ/с; 40 с игры, пауза, через 20 с SW останавливается (как при простое), ещё 10 с, продолжение, 40 с игры, перемотка назад на 0:10, 15 с.',
  site: { engine: 'singlethread' }, cdn: { throttleBps: SLOW },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) {
    await b.open(); await b.play(); await b.wait(40);
    await b.pause(); await b.wait(20);
    b.note('stop SW: ' + await b.stopSW()); await b.wait(10);
    await b.play(); await b.wait(40);
    await b.seek(10); await b.wait(15);
  },
  judge(m) {
    // Evidence that the new instance bypasses its cache: the old engine logs
    // 'Video caching disabled, bypassing SW'; the newer one (v27+) does not log it,
    // so also count the browser requests the second instance actually served.
    const bypass = m.sw_bypassDisabled;
    const served = m.swBrowserReqByInstance || [];
    const restarted = m.swInstances.length > 1;
    const servedAfter = restarted ? served.slice(1).reduce((a, b) => a + b, 0) : 0;
    const reproduced = restarted && (bypass > 0 || servedAfter === 0);
    return {
      verdict: !restarted ? 'ошибка стенда' : reproduced ? 'воспроизведено' : 'не воспроизводится',
      why: `экземпляров SW: ${m.swInstances.length}; запросов, обслуженных новым экземпляром: ${servedAfter}; строк «Video caching disabled, bypassing SW»: ${bypass}; прямых запросов <video> к CDN: ${m.cdnElementDirect}; ошибок <video>: ${m.errors.length}; стояло ${m.stalledSec} с.`,
    };
  },
};
