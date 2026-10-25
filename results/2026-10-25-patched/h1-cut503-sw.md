# h1-cut503-sw: Обрыв через 6 МБ + 503 на следующий запрос (SW)

Гипотеза: **H1**. Вердикт: **не воспроизводится** (код с патчами: all).

Ни одной ошибки <video>: сбой поглощён ниже плеера (повтор в SW или в медиастеке Chrome).

**Ожидалось:** Переоткрытие в serve() получает 503 → serve FAIL → ошибка <video> → load() → playing обнуляет errorCounter → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video> нет; сыграно 149 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; каждый ответ обрывается после 6 МБ, первый запрос после каждого обрыва получает 503 (с CORS). 150 с игры.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 149 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 1cgtyo |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=1, readDied=1, originNotOk=1, browserReq=1, install=1, activate=1, evaluated=1 |
| запросы к CDN | 29 ({"empty":29}; статусы {"206":15,"503":14}; обрывов 14; 87.4 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.5s 1cgtyo [bench] SW script evaluated, instance=1cgtyo script=?24
+0.5s 1cgtyo [SW] Install event fired at 1792881332686
+0.5s 1cgtyo [SW] Activate event fired at 1792881332687
+11.3s 1cgtyo [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 6291456 frontier= 6291456 err= network error
+11.3s 1cgtyo [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
```

### Таймлайн

```
+0.5s runner navigate
+0.5s sw-target created
+0.5s page: controllerchange
+0.9s runner navigate
+1.0s call src= el=main-video_html5_api
+1.0s call load el=main-video_html5_api ct=0
+1.0s video emptied ct=0
+1.0s video loadstart ct=0
+1.2s runner mute
+2.7s video canplay ct=0
+3.4s runner play
+3.4s video playing ct=0
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 153.4,
  "state": {
   "ct": 149.966124,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 149.764654,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 2,
   "video-cache-v1-bench-A": 88
  }
 }
]
```
