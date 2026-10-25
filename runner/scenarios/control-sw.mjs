// Control: no faults, SW enabled in singlethread mode (as on the site).
export default {
  id: 'control-sw',
  title: 'Контроль: без сбоев, SW singlethread',
  hypothesis: 'контроль',
  expected: 'Игра без ошибок <video>; запросы <video> идут через SW (на CDN только dest=empty), в логах SW есть `serve enter`, появляется кэш video-cache-v1-<m>.',
  describe: 'Старт, 60 с игры, перемотка на 10:00, 30 с, перемотка на 5:00, 20 с.',
  site: { engine: 'singlethread' },
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
    const cache = (m.snapshots.at(-1)?.cache) || {};
    const cached = Object.entries(cache).filter(([k]) => k.startsWith('video-cache-v1-')).map(([, n]) => n)[0] || 0;
    const ok = m.errors.length === 0 && m.sw_serveEnter > 0 && cached > 0 && m.cdnElementDirect === 0 && m.backJumps.length === 0;
    return {
      verdict: ok ? 'стенд работает' : 'стенд не откалиброван',
      why: `serve enter: ${m.sw_serveEnter}; записей в кэше: ${cached}; прямых запросов <video> к CDN: ${m.cdnElementDirect}; ошибок: ${m.errors.length}.`,
    };
  },
};
