# h1-outage-sw: Обрыв через 6 МБ + 5 с отказа CDN (503) (sw)

Гипотеза: **H1**. Вердикт: **не воспроизводится** (код с патчами: all).

Ни одной ошибки <video>: сбой поглощён ниже плеера (повтор в SW или в медиастеке Chrome).

**Ожидалось:** Отказ длиннее повторов serve() и медиастека Chrome → ошибка <video> → load() через 500 мс → playing обнуляет errorCounter → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video> нет; сыграно 149 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; каждый ответ обрывается после 6 МБ тела, следующие 5 с все медиазапросы получают 503 (с CORS). 150 с игры; «пользователь» жмёт Play, если плеер встал после ошибки.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 149 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | byoiin |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=1, readDied=1, originNotOk=4, browserReq=1, install=1, activate=1, evaluated=1 |
| запросы к CDN | 63 ({"empty":63}; статусы {"206":10,"503":53}; обрывов 9; 57.3 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s byoiin [bench] SW script evaluated, instance=byoiin script=?24
+0.1s byoiin [SW] Install event fired at 1792881644011
+0.1s byoiin [SW] Activate event fired at 1792881644013
+10.8s byoiin [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 6291456 frontier= 6291456 err= network error
+10.8s byoiin [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.3s byoiin [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+12.3s byoiin [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+14.3s byoiin [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
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
   "ct": 149.962434,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 149.766609,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 2,
   "video-cache-v1-bench-A": 52
  }
 }
]
```
