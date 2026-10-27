# h6-long-play-sw: Непрерывная игра 8 минут без DevTools на воркере

Гипотеза: **H6**. Вердикт: **не воспроизводится**.

экземпляров SW: 1 (8vfgrr); DevTools к SW: нет; ошибок <video>: {}; стояло 0 с; serve FAIL: 0.

**Ожидалось:** Chrome останавливает воркер с событием fetch дольше ~5 мин → обрыв потока примерно на 5-й минуте.

**Что увидел пользователь:** ошибок <video> нет; сыграно 479 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 300 КБ/с (загрузчик не успевает закэшировать всё), 480 с игры.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 479 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 8vfgrr |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=2, browserReq=2, install=1, activate=1, evaluated=1 |
| запросы к CDN | 7 ({"empty":7}; статусы {"206":7}; обрывов 0; 143.3 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s 8vfgrr [bench] SW script evaluated, instance=8vfgrr script=?24
+0.1s 8vfgrr [SW] Install event fired at 1792879700101
+0.1s 8vfgrr [SW] Activate event fired at 1792879700101
```

### Таймлайн

```
+0.0s runner navigate
+0.1s sw-target created
+0.1s page: controllerchange
+0.5s runner navigate
+0.5s call src= el=main-video_html5_api
+0.5s call load el=main-video_html5_api ct=0
+0.6s video emptied ct=0
+0.6s video loadstart ct=0
+0.7s runner mute
+3.5s call src= el=main-video_html5_api
+3.5s call load el=main-video_html5_api ct=0
+3.5s video emptied ct=0
+3.5s video loadstart ct=0
+3.8s video canplay ct=0
+4.5s runner play
+4.5s video playing ct=0
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 485,
  "state": {
   "ct": 479.975698,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 142
  }
 }
]
```
