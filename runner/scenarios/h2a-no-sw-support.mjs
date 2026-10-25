import { judgeReset } from './_common.mjs';
// No SW controller (registration fails, like a browser without service workers):
// a start-up error then takes the lastSuccessTime path at ct=0 instead of the blacklist branch.
export default {
  id: 'h2a-no-sw-support', title: 'Без контроллера SW: ошибка на старте (ct=0), затем ошибка на ~3:09', hypothesis: 'H2a',
  expected: 'Ошибка code 4 при ct=0 → lastSuccessTime=0 навсегда; вторая ошибка (декодирование на ~3:09) → load() без восстановления → позиция 0, пауза.',
  describe: 'sworker.js отдаёт 404 (SW не регистрируется). Первый медиазапрос → 503. «Пользователь» жмёт Play. Байты 40–41 МБ занулены; перемотка на 2:50.',
  site: { engine: 'singlethread', swUnavailable: true },
  cdn: { faults: [{ action: 'status', code: 503, when: { nth: [1, 1] } }, { action: 'corrupt', fromByte: 40 * 1048576, toByte: 41 * 1048576 }] },
  user: { resumeAfterErrorSec: 4 },
  async steps(b) {
    await b.open({ warm: false });
    await b.wait(4);
    await b.play(); await b.wait(15);
    await b.seek(170); await b.wait(45);
  },
  judge(m) {
    const r = judgeReset(m);
    r.why += ` Ошибки: ${m.errors.map((e) => `code ${e.code} при ct=${e.ct}`).join(', ')}.`;
    return r;
  },
};
