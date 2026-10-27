# Патч 02 — SW не выдумывает ответ и переживает временные отказы CDN (H3, H4)

Читаемая версия [`02-h3-h4-sw-fallback-and-reopen.patch`](02-h3-h4-sw-fallback-and-reopen.patch).
`swMain.js` не минифицирован, дифф переносится в исходник почти напрямую. Две независимые
правки.

## Правка A — неудача метаданных (H3)

**Где:** fetch‑обработчик, `addEventListener('fetch', …)` → `event.respondWith(async …)`,
сразу после получения `metadata`. В оригинале — строки ~2648-2660; искать по
`// Use a reasonable default for the initial request if end is unknown` и
`end = 1024 * 1024 * 100`.

**Было.** `_ensureMeta` ловит любое исключение и возвращает `null`. Тогда обработчик ставит
`end = 1024 * 1024 * 100` и отвечает `206` с `Content-Range: bytes 0-104857600/*` и
`Content-Length: 104857601`: размер неизвестен, конец придуман и к тому же на 1 байт
больше 100 МБ. На `fetch(request)` откатывается только ветка `catch`.

**Стало:**

```js
let { metadata } = isSingleThread()
    ? await singleThread.ensureMetadata(mParam, start, url, (p) => event.waitUntil(p))
    : await cachingService.ensureMetadata(mParam, start, initialEnd, url, (p) => event.waitUntil(p));

// [fix H3] Без настоящего размера мы бы ответили синтетическим 'bytes 0-104857600/*'
// и потом порвали тело. Повторяем получение метаданных пару раз (временный 5xx
// обычно проходит, а прямой 503 для медиастека фатален), затем отдаём браузеру
// прямой запрос к CDN.
let meta = metadata;
for (let i = 0; (!meta || !meta.totalSize) && i < 2 && isSingleThread(); i++) {
    await new Promise(r => setTimeout(r, 500 * (i + 1)));
    meta = (await singleThread.ensureMetadata(mParam, start, url)).metadata;
}
if (!meta || !meta.totalSize) {
    logError('[SEEK-DIAG] no metadata -> direct fetch m=', mParam);
    return fetch(request);
}
metadata = meta;
// дальше как было: end = metadata.totalSize - 1 и т. д.
```

**Инвариант:** SW никогда не отвечает `206` с неизвестным размером (`/*`).

**Важно (выяснено прогоном):** первая версия правки сразу делала `return fetch(request)`, и
это была регрессия. Прямой 503 медиастек Chrome считает фатальным, поэтому появилась
ошибка на старте, которой без патча не было. Повторы перед откатом обязательны.

## Правка B — переоткрытие соединения в `serve()` (H4)

**Где:** `singleThread.serve()` → внешний цикл `while (pos <= endByte && !cancelled)` →
ветка «2. Uncached → … open a new one», вызов `engine._openConnection(...)`. В оригинале —
строки ~2038-2045; искать по `// No adoptable connection covers pos -> open our own.`

**Было:** одна попытка. Если `_openConnection` бросил (`Fetch failed: 503` и т. п.), то
`throw e` → `[SEEK-DIAG] serve FAIL` → `controller.error()`: поток к `<video>` обрывается.

**Стало:**

```js
countFg();
// [fix H4] Временный отказ CDN (5xx/429/сеть), когда браузер посреди тела ответа:
// повторяем с растущей паузой, а не рвём поток с первой попытки.
for (let attempt = 0; ; attempt++) {
    try {
        conn = await engine._openConnection(mParam, pos, sourceUrl, contentType, totalSize);
        break;
    } catch (e) {
        const st = +(((e && e.message) || '').match(/Fetch failed: (\d+)/) || [])[1] || 0;
        const retryable = st === 0 || st === 429 || st >= 500;      // 0 = сеть / CORS
        if (cancelled) { uncountFg(); return; }
        if (!retryable || attempt >= 4) { uncountFg(); throw e; }     // 403/404 — сразу
        const delay = 500 * Math.pow(2, attempt);                      // 0.5, 1, 2, 4 с
        logError('[SEEK-DIAG] reopen failed, retry', attempt + 1, 'in', delay, 'ms m=', mParam, 'pos=', pos, 'err=', (e && e.message) || e);
        await new Promise(r => setTimeout(r, delay));
        if (cancelled || controller.desiredSize === null) { uncountFg(); return; }
    }
}
```

**Инварианты:** 403/404 не повторяются (повтор той же ссылки их не лечит — для 403 есть
патчи 04/05); после отмены браузером повторов нет; всего не больше 4 повторов, ~7.5 с.

## Проверка и результат

`node runner/run.mjs --patched=all h3-first-503-sw h3-hidden-range-sw h1-long-outage-sw`

| Сценарий | Без патча | С патчем |
|---|---|---|
| `h3-first-503-sw` (первые 2 запроса → 503) | синтетический ответ; 0 ошибок, 0 с простоя | синтетического ответа нет; 0 ошибок, ~4 с простоя на старте |
| `h3-hidden-range-sw` (нет `Content-Range` в `Expose-Headers`) | ошибка code 4 на старте, дальше мимо SW | ошибки нет, 2 с простоя |
| `h1-long-outage-sw` (отказы CDN по 40 с) | 4 ошибки `<video>`, 86 с простоя | 0 ошибок, 87 с простоя (CDN недоступен, играть нечего) |

## Что патч не решает

- Если `Content-Range` недоступен постоянно, **каждый** запрос заново тратит ~1.5 с на
  повторы. Нужен negative cache: помнить для `m`, что метаданных нет, и сразу отдавать
  прямой запрос ([SOLUTIONS.md, H3](../SOLUTIONS.md#h3-sw-выдумывает-ответ-когда-не-знает-размер-файла)).
- Сам прямой путь (`fetch(request)`) не повторяется. Если и он получит 503, браузер увидит
  фатальную ошибку.
