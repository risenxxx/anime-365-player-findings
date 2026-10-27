# h6-long-pause-sw: Пауза 6 минут, затем продолжение (SW)

Гипотеза: **H6**. Вердикт: **не воспроизводится**.

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
| перемотка не сработала | [] |
| сыграно / стояло, с | 88 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | pcil3r |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=2, browserReq=2, install=1, activate=1, evaluated=1 |
| запросы к CDN | 5 ({"empty":5}; статусы {"206":5}; обрывов 0; 133.4 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s pcil3r [bench] SW script evaluated, instance=pcil3r script=?24
+0.1s pcil3r [SW] Install event fired at 1792880187366
+0.1s pcil3r [SW] Activate event fired at 1792880187367
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
+3.5s call src= el=main-video_html5_api
+3.5s call load el=main-video_html5_api ct=0
+3.5s video emptied ct=0
+3.5s video loadstart ct=0
+3.8s video canplay ct=0
+4.5s runner play
+4.5s video playing ct=0
+34.5s runner pause
+34.5s video pause ct=29.96
+394.5s runner play
+394.5s video playing ct=30.02
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 455,
  "state": {
   "ct": 89.981373,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 133
  }
 }
]
```
