# Патч 04 — SW сообщает странице, что CDN отверг подписанную ссылку (H4)

Читаемая версия [`04-h4-sw-report-expired-signature.patch`](04-h4-sw-report-expired-signature.patch).
Работает в паре с [патчем 05](05-h4-player-refresh-sources.md) (реакция плеера).
Накладывается поверх патча 03.

## Проблема

Когда подпись ссылки истекла, CDN отвечает 403. SW к этому моменту уже отдал браузеру
`206`, поэтому 403 превращается в обрыв тела (`serve FAIL`). Chrome его повторяет — и
снова получает 403. Страница о причине не узнаёт: первая ошибка `<video>` приходит
примерно через 85 с, а свежие ссылки плеер не запрашивает.

## Где

- новая функция `notifyOriginStatus` — рядом с `validateRangeResponse`;
- `singleThread._openConnection` — искать по `'[SEEK-DIAG] origin fetch NOT OK'`;
- `singleThread._streamFrom` (загрузчик) — искать по `"FETCH to ORIGIN (loader, long-lived)"`,
  проверка `if (!response.ok)`.

## Стало

```js
// [fix H4] CDN отверг подписанную ссылку (403/410: подпись истекла). Повтор той же ссылки
// не поможет — сообщаем странице, она возьмёт свежие ссылки. Не чаще раза в 10 с на видео.
const originStatusSent = new Map();
function notifyOriginStatus(mParam, status) {
    if (status !== 403 && status !== 410) return;
    const now = Date.now();
    if (now - (originStatusSent.get(mParam) || 0) < 10000) return;
    originStatusSent.set(mParam, now);
    self.clients.matchAll()
        .then(cs => cs.forEach(c => c.postMessage({ type: 'originStatus', mParam, status })))
        .catch(() => {});
}

// _openConnection (serve):
if (!response.ok) {
    notifyOriginStatus(mParam, response.status);   // [fix H4]
    logError('[SEEK-DIAG] origin fetch NOT OK m=', mParam, 'atByte=', atByte, 'status=', response.status);
    // ... дальше как было: abort + throw
}

// _streamFrom (загрузчик):
if (!response.ok) { notifyOriginStatus(mParam, response.status); throw new Error(`Fetch failed: ${response.status}`); }
```

## Контракт сообщения

`{ type: 'originStatus', mParam: string, status: 403 | 410 }` всем клиентам SW. Плеер
сверяет `mParam` с текущим источником и игнорирует сообщения про другие видео
([патч 05](05-h4-player-refresh-sources.md)).

## Проверка и результат

См. [патч 05](05-h4-player-refresh-sources.md#проверка-и-результат): с 02+04+05 —
0 ошибок, 0 с простоя, 1 запрос с 403 вместо 353.
