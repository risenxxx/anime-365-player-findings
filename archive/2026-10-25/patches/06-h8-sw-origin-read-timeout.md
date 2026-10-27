# Патч 06 — таймаут чтения из соединения с CDN (H8)

Читаемая версия [`06-h8-sw-origin-read-timeout.patch`](06-h8-sw-origin-read-timeout.patch).
Накладывается поверх патча 04.

## Проблема

CDN может перестать отдавать байты, не закрывая соединение (так выглядел обрыв посреди
HTTP/2‑потока на живом CDN). В `serve()` нет таймаута чтения. Загрузчик ждёт `serve()`
(`_foregroundFetches > 0`) и тоже стоит. Своего таймаута нет и у Chrome. В итоге плеер
стоит без ошибки, пока пользователь не перемотает далеко. Небольшая перемотка не помогает:
позиция остаётся внутри того же диапазона, и ждётся то же соединение.

## Где

`singleThread.serve()`, два чтения из соединения:
- в `idleDrain` — `res = await c.reader.read()`;
- в основном цикле «3. Drive the connection's reader live» — `res = await conn.reader.read()`,
  рядом лог `'[SEEK-DIAG] origin read DIED mid-serve'`.

## Стало

```js
const ORIGIN_READ_TIMEOUT_MS = 12000; // [fix H8] столько без байтов от CDN -> переоткрыть

// внутри serve(), рядом с остальными хелперами (parkIdle, flushChunks, idleDrain):
// [fix H8] Поток CDN может перестать отдавать байты без сброса. Больше никто не ограничит
// ожидание (браузер тоже), поэтому каждое чтение ограничено: нет байтов
// ORIGIN_READ_TIMEOUT_MS -> обрываем соединение; внешний цикл переоткроет его с pos,
// как после любой другой смерти соединения посреди ответа.
const readOrStall = (c) => new Promise((resolve, reject) => {
    const t = setTimeout(() => {
        logError('[SEEK-DIAG] origin read STALLED', ORIGIN_READ_TIMEOUT_MS, 'ms m=', mParam, 'frontier=', c.frontier);
        try { c.abort.abort('stalled'); } catch (e) {}
        reject(new Error('origin read stalled'));
    }, ORIGIN_READ_TIMEOUT_MS);
    c.reader.read().then((r) => { clearTimeout(t); resolve(r); }, (e) => { clearTimeout(t); reject(e); });
});

// оба чтения:
//   res = await c.reader.read();     ->  res = await readOrStall(c);
//   res = await conn.reader.read();  ->  res = await readOrStall(conn);
```

Обработка ошибки чтения уже есть в оригинале: `conn.dead = true` → `break` → внешний цикл
→ новое соединение с `pos`. Вместе с патчем 02 переоткрытие идёт с повторами.

## Инварианты

- Ни одно чтение из соединения с CDN не ждёт дольше 12 с.
- Медленный, но живой CDN не обрывается: таймер сбрасывается на каждом полученном куске.

## Проверка и результат

`node runner/run.mjs --patched=all h8-stall-sw h8-stall-nosw`: первый ответ CDN после 6 МБ
перестаёт отдавать байты, соединение остаётся открытым.

| | Без патча | С патчем |
|---|---|---|
| `h8-stall-sw` — простой | 114 с | 0 с (сыграно 138 с) |
| `h8-stall-nosw` — простой | 114 с | 114 с (без SW патч не действует) |

## Что патч не решает

Без SW (кэширование выключено, SW не зарегистрирован) зависший поток по‑прежнему держит
плеер. Нужен сторожевой таймер в плеере на долгий `waiting` при живой сети
([SOLUTIONS.md, H8](../SOLUTIONS.md#h8-зависший-поток-cdn)).
