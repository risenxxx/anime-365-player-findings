# h1-cut-sw: Обрыв каждого ответа CDN через 6 МБ (SW)

Гипотеза: **H1**. Вердикт: **не воспроизводится** (код с патчами: all).

Ни одной ошибки <video>: сбой поглощён ниже плеера (повтор в SW или в медиастеке Chrome).

**Ожидалось:** По коду serve() переоткрывает соединение после обрыва; если переоткрытие успешно, плеер ошибок не видит.

**Что увидел пользователь:** ошибок <video> нет; сыграно 149 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с, каждый ответ обрывается после 6 МБ тела. 150 с игры.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 149 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | h2xo6t |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=1, readDied=1, browserReq=1, install=1, activate=1, evaluated=1 |
| запросы к CDN | 15 ({"empty":15}; статусы {"206":15}; обрывов 14; 88.6 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s h2xo6t [bench] SW script evaluated, instance=h2xo6t script=?24
+0.1s h2xo6t [SW] Install event fired at 1792881021453
+0.1s h2xo6t [SW] Activate event fired at 1792881021455
+10.8s h2xo6t [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 6291456 frontier= 6291456 err= network error
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
+2.3s video canplay ct=0
+3.0s runner play
+3.0s video playing ct=0
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 153.5,
  "state": {
   "ct": 149.962191,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 149.757525,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 2,
   "video-cache-v1-bench-A": 89
  }
 }
]
```
