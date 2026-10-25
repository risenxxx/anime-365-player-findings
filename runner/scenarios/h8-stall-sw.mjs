import { SLOW } from './_common.mjs';
// Found on the live CDN through mitmproxy: a stream that stops delivering bytes without
// being reset. Nothing has a read timeout, so playback waits until the user seeks.
export default {
  id: 'h8-stall-sw', title: 'Зависший поток CDN: байты перестают идти, соединение не закрыто (sw)', hypothesis: 'H8',
  expected: 'Нет таймаута чтения ни в serve()/загрузчике SW, ни в плеере: после опустошения буфера плеер стоит без ошибки, пока пользователь не перемотает.',
  describe: 'CDN 600 КБ/с; первый медиаответ после 6 МБ перестаёт отдавать байты (соединение открыто). 100 с игры, затем «пользователь» перематывает на +5 с, ещё 40 с.',
  site: { engine: 'singlethread' },
  cdn: { throttleBps: SLOW, faults: [{ action: 'stall', afterBytes: 6 * 1048576, when: { nth: [1, 1] } }] },
  async steps(b) {
    await b.open(); await b.play(); await b.wait(100);
    const st = await b.state(); b.note('ct before the nudge: ' + st.ct.toFixed(1));
    await b.seek(st.ct + 5); await b.wait(40);
  },
  judge(m) {
    const stuck = m.stalledSec;
    return {
      verdict: stuck >= 20 && !m.errors.length ? 'воспроизведено' : stuck >= 20 ? 'частично' : 'не воспроизводится',
      why: `плеер стоял ${stuck} с без ошибки <video> (ошибок: ${m.errors.length}); последняя позиция ${m.lastCt}; запросов к CDN: ${m.cdnRequests} ${JSON.stringify(m.cdnByDest)}.`,
    };
  },
};
