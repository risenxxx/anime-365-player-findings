# h1-outage-sw: Обрыв через 6 МБ + 5 с отказа CDN (503) (sw)

Гипотеза: **H1**. Вердикт: **не воспроизводится**.

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
| сыграно / стояло, с | 149 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 18xo2q |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=11, serveFail=10, readDied=1, originNotOk=10, browserReq=11, install=1, activate=1, evaluated=1 |
| запросы к CDN | 77 ({"empty":77}; статусы {"206":10,"503":67}; обрывов 7; 56.8 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.5s 18xo2q [bench] SW script evaluated, instance=18xo2q script=?24
+0.5s 18xo2q [SW] Install event fired at 1792877548061
+0.5s 18xo2q [SW] Activate event fired at 1792877548063
+11.2s 18xo2q [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 6291456 frontier= 6291456 err= network error
+11.2s 18xo2q [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.2s 18xo2q [SEEK-DIAG] serve FAIL m= bench-A start= 0 pos= 6291456 end= 307695338 servedSoFar= 6291456 total= 307695339 connFrontier= 6291456 connDead= true err= Fetch failed: 503
+11.5s 18xo2q [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.5s 18xo2q [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+11.9s 18xo2q [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.9s 18xo2q [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+12.3s 18xo2q [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+12.3s 18xo2q [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+12.8s 18xo2q [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+12.8s 18xo2q [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+13.3s 18xo2q [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+13.3s 18xo2q [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+13.8s 18xo2q [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+13.8s 18xo2q [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+14.4s 18xo2q [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+14.4s 18xo2q [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+15.1s 18xo2q [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+15.1s 18xo2q [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+15.8s 18xo2q [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+15.8s 18xo2q [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
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
+1.1s runner mute
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
   "ct": 149.99222,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 53
  }
 }
]
```
