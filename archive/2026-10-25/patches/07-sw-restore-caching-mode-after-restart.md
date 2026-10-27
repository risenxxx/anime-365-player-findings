# Патч 07 — новый экземпляр SW восстанавливает режим кэширования (H6b)

Читаемая версия [`07-sw-restore-caching-mode-after-restart.patch`](07-sw-restore-caching-mode-after-restart.patch).
Накладывается поверх патча 06.

## Проблема

`videoCachingEnabled` (по умолчанию `false`) и `videoMode` (по умолчанию `'multithread'`)
живут только в памяти SW. Страница шлёт `setVideoCachingEnabled` и `setVideoMode` только при
загрузке и на `controllerchange` (`embed.min.js`, `applyVideoLoadingMode`). Браузер
останавливает простаивающий SW: на живом сайте это случилось через ~45 с паузы, когда серия
уже была в кэше. Новый экземпляр обходит кэш (`'[SW] Video caching disabled, bypassing SW'`)
до перезагрузки страницы, и уже скачанная серия качается заново.

## Где

- объявление `let videoCachingEnabled = false;`;
- fetch‑обработчик — проверка `if (!videoCachingEnabled)` и начало `respondWith`;
- обработчик сообщений — ветки `'setVideoCachingEnabled'` и `'setVideoMode'`.

## Стало

```js
// [fix SW restart] Сохраняем последний выбранный страницей режим и восстанавливаем его
// при старте нового экземпляра.
const SETTINGS_KEY = 'https://cache.local/settings';
let settingsLoaded = false;
const settingsReady = (async () => {
    try {
        const r = await (await caches.open(CACHE_META_NAME)).match(SETTINGS_KEY);
        if (r && !settingsLoaded) {
            const st = await r.json();
            videoCachingEnabled = !!st.enabled;
            if (st.mode === 'singlethread' || st.mode === 'multithread') videoMode = st.mode;
            log('[SW] restored video settings: caching=', videoCachingEnabled, 'mode=', videoMode);
        }
    } catch (e) { /* остаются значения по умолчанию */ }
    settingsLoaded = true;
})();
function persistSettings() {
    settingsLoaded = true; // явное сообщение страницы важнее сохранённого значения
    return caches.open(CACHE_META_NAME)
        .then(c => c.put(SETTINGS_KEY, new Response(JSON.stringify({ enabled: videoCachingEnabled, mode: videoMode }))))
        .catch(() => {});
}

// fetch-обработчик: обход, пока настройки неизвестны, не делаем — решаем внутри respondWith.
if (!videoCachingEnabled && settingsLoaded) { log('[SW] Video caching disabled, bypassing SW'); return; }
event.respondWith((async () => {
    await settingsReady;
    if (!videoCachingEnabled) return fetch(request);
    // ... дальше как было
})());

// обработчик сообщений:
//   setVideoCachingEnabled: ... ; event.waitUntil(persistSettings());
//   setVideoMode:           ... ; event.waitUntil(persistSettings());
```

## Инварианты

- Сообщение от страницы всегда важнее сохранённого значения: `persistSettings()`
  выставляет `settingsLoaded = true`, и `settingsReady` его уже не перезапишет.
- Пока настройки загружаются (первые миллисекунды жизни экземпляра), видеозапросы не
  уходят в обход молча: решение принимается после `await settingsReady`.

## Проверка и результат

`node runner/run.mjs --patched=all h6b-sw-restart`: 40 с игры, пауза, остановка SW
(`ServiceWorker.stopAllWorkers` с сессии страницы — так же, как при простое), продолжение.

| | Без патча | С патчем |
|---|---|---|
| запросов мимо SW после перезапуска | 2 | 0 |
| в логе нового экземпляра | `Video caching disabled, bypassing SW` | `restored video settings: caching= true mode= singlethread` |

## Ограничение

Если страница выключила кэширование (`engine: 'off'`), новый экземпляр тоже восстановит
«выключено». Так и задумано: режим всегда выбирает страница.
