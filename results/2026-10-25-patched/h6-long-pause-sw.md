# h6-long-pause-sw: Пауза 6 минут, затем продолжение (SW)

Гипотеза: **H6**. Вердикт: **не воспроизводится** (код с патчами: all).

экземпляров SW: 1; bypass (кэш выключен) после рестарта: 0; ошибок <video>: {}; стояло 0 с.

**Ожидалось:** За время паузы простаивающий SW останавливается; поток к <video> рвётся; после продолжения — кэширование выключено (новый экземпляр не получил setVideoCachingEnabled).

**Что увидел пользователь:** ошибок <video> нет; сыграно 88 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 300 КБ/с; 30 с игры, пауза 360 с, 60 с игры.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 88 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | pj5lj0 |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=2, browserReq=2, install=1, activate=1, evaluated=1 |
| запросы к CDN | 5 ({"empty":5}; статусы {"206":5}; обрывов 0; 133.4 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.6s pj5lj0 [bench] SW script evaluated, instance=pj5lj0 script=?24
+0.6s pj5lj0 [SW] Install event fired at 1792884283985
+0.6s pj5lj0 [SW] Activate event fired at 1792884283985
```

### Таймлайн

```
+0.6s runner navigate
+0.6s sw-target created
+0.6s page: controllerchange
+1.0s runner navigate
+1.1s call src= el=main-video_html5_api
+1.1s call load el=main-video_html5_api ct=0
+1.1s video emptied ct=0
+1.1s video loadstart ct=0
+1.2s runner mute
+4.1s call src= el=main-video_html5_api
+4.1s call load el=main-video_html5_api ct=0
+4.1s video emptied ct=0
+4.1s video loadstart ct=0
+4.3s video canplay ct=0
+5.0s runner play
+5.0s video playing ct=0
+35.0s runner pause
+35.0s video pause ct=29.96
+395.0s runner play
+395.0s video playing ct=30
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 455,
  "state": {
   "ct": 89.951088,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 89.719442,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 2,
   "video-cache-v1-bench-A": 133
  }
 }
]
```
