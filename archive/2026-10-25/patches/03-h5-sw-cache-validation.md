# Патч 03 — кэш SW проверяет, что файл на CDN не сменился (H5)

Читаемая версия [`03-h5-sw-cache-validation.patch`](03-h5-sw-cache-validation.patch).
Накладывается поверх патча 02.

## Проблема

Кэш привязан только к `m` (`video-cache-v1-<m>`). В метаданных хранятся только размер и
тип, без версии файла. Если под тем же `m` на CDN оказался другой файл (перекодирование,
другой CDN с тем же `m`), куски из кэша смешиваются с новыми байтами. Итог — ошибка
декодирования и серия с 0:00, причём при **каждом** новом открытии в течение суток.
Blacklist хранится только в памяти, а кэш при нём не удаляется.

## Где

- `saveMetadata`, `extractAndSaveMetadata` — искать по `'[CachingService] Extracted metadata: size='`;
- fetch‑обработчик — начало `event.respondWith(async …)`;
- обработчик сообщений, ветка `'blacklist'` — искать по `'[SW] Blacklisting mParam:'`.

## Стало

**1. Валидатор в метаданных.** `saveMetadata(mParam, totalSize, contentType, validator)`
пишет `{ totalSize, contentType, validator }`, а `extractAndSaveMetadata` берёт
`response.headers.get('ETag') || response.headers.get('Last-Modified')`. На проде оба
заголовка открыты в `Access-Control-Expose-Headers` (проверено живой записью).

**2. Сверка раз за жизнь экземпляра SW**, перед обслуживанием `m`, метаданные которого
пришли из прошлой сессии:

```js
const revalidatedMParams = new Set();
async function revalidateCache(mParam, url) {
    if (revalidatedMParams.has(mParam)) return;
    revalidatedMParams.add(mParam);
    const meta = await getMetadata(mParam);
    if (!meta?.totalSize) return;                       // кэша нет — сверять нечего
    try {
        const r = await fetch(url, { headers: { 'Range': 'bytes=0-0' } });
        try { await r.body.cancel(); } catch (e) {}
        if (r.status !== 206) return;
        const total = +((r.headers.get('Content-Range') || '').split('/')[1]);
        const validator = r.headers.get('ETag') || r.headers.get('Last-Modified') || null;
        const changed = (total && total !== meta.totalSize)
            || (validator && meta.validator && validator !== meta.validator)
            || (validator && !meta.validator);          // кэш записан без валидатора (до патча)
        if (changed) {
            logError('[SEEK-DIAG] cache of m=', mParam, 'is stale (size', meta.totalSize, '->', total,
                     'validator', meta.validator, '->', validator, '), deleting');
            await deleteVideoCache(getCacheName(mParam), mParam);
        }
    } catch (e) { /* сеть: кэш оставляем, с CDN дальше разбирается serve() */ }
}
// в fetch-обработчике, первой строкой внутри respondWith:
//   await revalidateCache(mParam, url);
```

**3. Blacklist удаляет кэш:**

```js
if (event.data.type === 'blacklist') {
    blacklistedMParams.add(mParam);
    // [fix H5] вероятная причина ошибки декодирования — закэшированные байты: удаляем их,
    // иначе каждый новый экземпляр SW (blacklist только в памяти) отдаст их снова.
    event.waitUntil(deleteVideoCache(getCacheName(mParam), mParam).catch(() => {}));
    // ... дальше как было
}
```

## Инварианты

- В одном кэше `m` никогда не лежат куски двух разных версий файла: при любом
  расхождении размера или валидатора кэш удаляется целиком.
- Сверка — один маленький запрос (`bytes=0-0`) на видео за жизнь экземпляра SW.
- Сетевые ошибки при сверке кэш не удаляют.

## Проверка и результат

`node runner/run.mjs --patched=all h5-twin-sw`: файл A, потом под тем же URL — файл B
(другая кодировка, дополнен до того же размера), три открытия.

| | Без патча | С патчем |
|---|---|---|
| ошибки декодирования | 2 (при каждом повторном открытии) | 0 |
| сброс в 0:00 | 2 | 0 |
| в логе SW | — | `cache of m= bench-A is stale (size 307695339 -> 307695339 validator … -> …), deleting` |

Размер в тесте одинаковый: подмену поймал именно `Last-Modified`.

## Побочный эффект

При первом запуске после выкатки кэши, записанные без валидатора, будут удалены (условие
`validator && !meta.validator`). Это разовая потеря кэша, а не ошибка.
