import { SLOW } from './_common.mjs';
export default {
  id: 'h4-expired-403-sw', title: 'Подпись истекла: с 45-й секунды CDN отвечает 403 (SW)', hypothesis: 'H4',
  expected: 'Обрыв на 45 с → serve переоткрывает один раз → 403 → serve FAIL; источники через /sources/ не обновляются; ошибки до notifyBroken.',
  describe: 'CDN 600 КБ/с; в +45 с все открытые ответы обрываются, все последующие запросы со старой подписью (sig=1) → 403 (с CORS), свежая подпись из /sources/ работает; ещё 200 с — дальше края кэша.',
  site: { engine: 'singlethread' },
  cdn: { throttleBps: SLOW },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) { await b.open(); await b.play(); await b.wait(45);
    await b.cdn({ throttleBps: SLOW, faults: [{ action: 'status', code: 403, when: { query: { sig: 1 } } }] });
    await b.cdnCut(); await b.wait(200); },
  judge(m) {
    const refreshed = (m.siteCalls?.sources) || 0;
    if (!m.errors.length) return { verdict: 'не воспроизводится', why: 'Ошибок <video> нет.' };
    return { verdict: m.sw_serveFail ? 'воспроизведено' : 'частично',
      why: `serve FAIL: ${m.sw_serveFail}, origin NOT OK: ${m.sw_originNotOk}; ошибок <video>: ${m.errors.length}; notifyBroken: ${m.notifyBroken}; запросов /sources/: ${refreshed} (обновления подписанных ссылок не было); запросов к CDN после истечения: ${m.cdnStatus[403] || 0} (403).` };
  },
};
