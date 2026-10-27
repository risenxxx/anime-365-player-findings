# h1-cut-nosw: Обрыв каждого ответа CDN через 6 МБ (без SW)

Гипотеза: **H1**. Вердикт: **не воспроизводится** (код с патчами: all).

Ни одной ошибки <video>: сбой поглощён ниже плеера (повтор в SW или в медиастеке Chrome).

**Ожидалось:** Медиастек Chrome сам повторяет range-запрос после обрыва; плеер ошибок не видит.

**Что увидел пользователь:** ошибок <video> нет; сыграно 149 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** То же, кэширование SW выключено.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 149 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | kegomx |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=7, install=1, activate=1, evaluated=1 |
| запросы к CDN | 7 ({"video":7}; статусы {"206":7}; обрывов 6; 38.4 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s kegomx [bench] SW script evaluated, instance=kegomx script=?24
+0.1s kegomx [SW] Install event fired at 1792881177061
+0.1s kegomx [SW] Activate event fired at 1792881177063
+0.5s kegomx [SW] Video caching disabled, bypassing SW
+11.1s kegomx [SW] Video caching disabled, bypassing SW
+42.5s kegomx [SW] Video caching disabled, bypassing SW
+68.7s kegomx [SW] Video caching disabled, bypassing SW
+94.9s kegomx [SW] Video caching disabled, bypassing SW
+121.5s kegomx [SW] Video caching disabled, bypassing SW
+148.9s kegomx [SW] Video caching disabled, bypassing SW
```

### Таймлайн

```
+0.0s runner navigate
+0.1s sw-target created
+0.1s page: controllerchange
+0.4s runner navigate
+0.5s call src= el=main-video_html5_api
+0.5s call load el=main-video_html5_api ct=0
+0.5s video emptied ct=0
+0.5s video loadstart ct=0
+0.7s runner mute
+2.2s video canplay ct=0
+3.0s runner play
+3.0s video playing ct=0
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 153.4,
  "state": {
   "ct": 149.961738,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 149.770912,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1
  }
 }
]
```
