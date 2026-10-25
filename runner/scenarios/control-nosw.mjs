// Control: no faults, SW caching disabled the way the site does it for engine 'off'
// (applyVideoLoadingMode -> setVideoCachingEnabled false; the SW then does not respondWith).
export default {
  id: 'control-nosw',
  title: 'Контроль: без сбоев, кэширование SW выключено',
  hypothesis: 'контроль',
  expected: 'Игра без ошибок; все медиазапросы идут от <video> напрямую (dest=video), SW пишет `Video caching disabled, bypassing SW`.',
  describe: 'site.videoLoadingEngine = "off". Старт, 60 с, перемотка на 10:00, 30 с, перемотка на 5:00, 20 с.',
  site: { engine: 'off' },
  cdn: {},
  async steps(b) {
    await b.open();
    await b.play();
    await b.wait(60);
    await b.seek(600);
    await b.wait(30);
    await b.seek(300);
    await b.wait(20);
  },
  judge(m) {
    const ok = m.errors.length === 0 && m.sw_serveEnter === 0 && (m.cdnByDest.empty || 0) === 0 && m.backJumps.length === 0;
    return {
      verdict: ok ? 'стенд работает' : 'стенд не откалиброван',
      why: `serve enter: ${m.sw_serveEnter}; запросы к CDN: ${JSON.stringify(m.cdnByDest)}; bypass-строк SW: ${m.sw_bypassDisabled}; ошибок: ${m.errors.length}.`,
    };
  },
};
