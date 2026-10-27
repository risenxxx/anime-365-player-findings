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
| перемотка не сработала | [] |
| сыграно / стояло, с | 149 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | ppqbtr |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=11, serveFail=10, readDied=1, originNotOk=10, browserReq=11, install=1, activate=1, evaluated=1 |
| запросы к CDN | 109 ({"empty":109}; статусы {"206":10,"503":99}; обрывов 7; 56.7 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s ppqbtr [bench] SW script evaluated, instance=ppqbtr script=?27
+0.1s ppqbtr [SW] Install event fired at 1793114758317
+0.1s ppqbtr [SW] Activate event fired at 1793114758318
+10.8s ppqbtr [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 6291456 frontier= 6291456 err= network error
+10.8s ppqbtr [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+10.8s ppqbtr [SEEK-DIAG] serve FAIL m= bench-A start= 0 pos= 6291456 end= 307695338 servedSoFar= 6291456 total= 307695339 connFrontier= 6291456 connDead= true err= Fetch failed: 503
+11.1s ppqbtr [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.1s ppqbtr [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+11.5s ppqbtr [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.5s ppqbtr [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+11.9s ppqbtr [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.9s ppqbtr [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+12.3s ppqbtr [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+12.3s ppqbtr [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+12.8s ppqbtr [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+12.8s ppqbtr [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+13.4s ppqbtr [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+13.4s ppqbtr [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+14.0s ppqbtr [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+14.0s ppqbtr [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+14.7s ppqbtr [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+14.7s ppqbtr [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+15.4s ppqbtr [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+15.4s ppqbtr [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
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
  "t": 153.4,
  "state": {
   "ct": 149.961891,
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
