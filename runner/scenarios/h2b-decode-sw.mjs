import { SLOW, judgeReset } from './_common.mjs';
// Bytes 40..41 MB of the file are zero-filled -> decoder error around 3 min in.
export default {
  id: 'h2b-decode-sw', title: 'Ошибка декодирования в середине (SW): ветка blacklist', hypothesis: 'H2b',
  expected: 'MEDIA_ERR_DECODE → blacklist m → src(&rand) + load() без restoreLastTime → серия с начала.',
  describe: 'CDN 4 МБ/с; байты 40–41 МБ файла заполнены нулями. Перемотка на 2:50, ждём ошибку.',
  site: { engine: 'singlethread' },
  cdn: { faults: [{ action: 'corrupt', fromByte: 40 * 1048576, toByte: 41 * 1048576 }] },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) { await b.open(); await b.play(); await b.wait(10); await b.seek(170); await b.wait(60); },
  judge(m) {
    const r = judgeReset(m);
    r.why += ` Коды ошибок: ${JSON.stringify(m.errorCodes)}; blacklist: ${m.playerBlacklist}; src с &rand: ${m.randReloads}.`;
    return r;
  },
};
