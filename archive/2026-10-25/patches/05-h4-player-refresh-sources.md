# Патч 05 — плеер обновляет подписанные ссылки по сигналу SW (H4)

Читаемая версия [`05-h4-player-refresh-sources.patch`](05-h4-player-refresh-sources.patch).
Работает в паре с [патчем 04](04-h4-sw-report-expired-signature.md): SW сообщает о 403, плеер
реагирует. Накладывается поверх патча 01 (использует `restorePending` и `restoreLastTime`
оттуда).

## Где

- **Файл:** плагин `concatenatePlugin` (`/js/lib/videojs.concatenate.min.js?1789631056`).
- **Три места:**
  1. обработчик `navigator.serviceWorker.addEventListener('message', …)` в начале плагина.
     Ищите по `"cachedRanges"`;
  2. `_refreshSources` — ищите по `"/sources/"` и `_sourcesLoadedAt`;
  3. новая функция `_onSourceExpired`, рядом с `_refreshSources`.
- **Строки в prettified‑копии:** обработчик сообщений — 8-10, `_refreshSources` — 335-352.

## Было

```js
// Сообщения от SW: плеер понимает только cachedRanges.
navigator.serviceWorker && navigator.serviceWorker.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'cachedRanges') {
    plugin._cachedRanges[e.data.mParam] = e.data.ranges;
    player.trigger('progressChunks');
  }
});

// Свежие подписанные ссылки. Вызывается только по таймеру: раз в 5 минут проверка,
// не прошло ли 23 часа (828e5 мс) с загрузки источников.
plugin._refreshSources = function () {
  if (plugin._refreshingSources) return;
  const type = $(player.tag).attr('data-type'), id = $(player.tag).attr('data-id');
  if (type == null || id == null) return;
  plugin._refreshingSources = true;
  $.ajax({
    method: 'POST', url: '/' + type + '/sources/' + id, data: { csrf: YII_CSRF_TOKEN }, dataType: 'json',
    success(resp) {
      plugin._refreshingSources = false;
      if (resp && resp.sources) try {
        plugin._applyRefreshedSources(JSON.parse(resp.sources));   // меняет только m.videos[].urls[].src
        if (resp.alternativeSources) player.el_.setAttribute('data-alternative-sources', resp.alternativeSources);
        plugin._sourcesLoadedAt = Date.now();
      } catch (e) {}
    },
    error() { plugin._refreshingSources = false; },
  });
};
```

Что не так: когда подпись истекла раньше 23 часов (или CDN её отверг), плеер об этом не
узнаёт. SW превращает каждый 403 в обрыв, Chrome его повторяет. Первая ошибка `<video>`
приходит примерно через 85 с, дальше цикл ошибок и сотни запросов с 403. К тому же
`_applyRefreshedSources` меняет только список источников: элемент `<video>` продолжает
играть старую ссылку.

## Стало

```js
navigator.serviceWorker && navigator.serviceWorker.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'cachedRanges') {
    plugin._cachedRanges[e.data.mParam] = e.data.ranges;
    player.trigger('progressChunks');
  }
  // [H4] SW сообщает, что CDN отверг подписанную ссылку (403/410, патч 04).
  if (e.data && e.data.type === 'originStatus' && plugin._onSourceExpired) {
    plugin._onSourceExpired(e.data.mParam, e.data.status);
  }
});

// [H4] Взять свежие ссылки и переключить на них <video>, сохранив позицию.
plugin._onSourceExpired = function (mParam, status) {
  const before = plugin._stripCacheBuster(player.currentSrc());
  if (plugin._currentSourceInfo().m !== mParam) return;       // сообщение про другое видео
  console.log('[Player] origin answered ' + status + ', refreshing sources');
  plugin._refreshSources(() => {
    const source = plugin.videos[plugin.currentVideoSource];
    const part = source && source.urls[Math.max(0, plugin.currentVideo)];
    const newSrc = part && (part.src || part);
    if (!newSrc || newSrc === before) return;                  // сервер вернул ту же ссылку
    const t = player.currentTime();
    if (t > 0.5) player.lastSuccessTime = t;                   // механизм восстановления из патча 01
    player.restorePending = true;
    player.off('canplay', plugin.restoreLastTime);
    player.one('canplay', plugin.restoreLastTime);
    player.src({ type: source.type, src: newSrc });
  });
};

// Добавлен необязательный колбэк `done`: вызывается после успешного применения ссылок.
plugin._refreshSources = function (done) {
  // ... без изменений ...
  //   success(resp) { ...
  //     plugin._sourcesLoadedAt = Date.now();
  //     if (typeof done === 'function') done();     // [H4]
  //   }
};
```

## Инварианты

- На одно истечение подписи — один запрос `/sources/`: защищает существующий флаг
  `_refreshingSources`, плюс SW шлёт `originStatus` не чаще раза в 10 с на видео.
- Переключение `src` идёт через тот же механизм восстановления, что и после ошибок
  (`restorePending` + `restoreLastTime` на `canplay`), поэтому позиция сохраняется.
- Если сервер вернул ту же ссылку, плеер ничего не делает: дальше работает обычная
  обработка ошибок.

## Проверка и результат

`node runner/run.mjs --patched=all h4-expired-403-sw`: на 45‑й секунде все ссылки со старой
подписью начинают получать 403, `/sources/` выдаёт новую подпись.

| | Без патчей | С патчами 02+04+05 |
|---|---|---|
| ошибки `<video>` | 4 | 0 |
| остановки | 119 с | 0 с |
| сыграно | 121 с | 244 с |
| запросов `/sources/` | 0 | 1 |
| запросов к CDN с 403 | 353 | 1 |

## Что патч не решает

- Если `/sources/` вернул ошибку или ту же ссылку, отдельного сообщения пользователю нет.
  Дальше обычная обработка ошибок (патч 01).
- `restoreLastTime` вызывает `play()`, даже если пользователь стоял на паузе.
