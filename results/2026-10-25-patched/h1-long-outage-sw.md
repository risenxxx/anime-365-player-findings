# h1-long-outage-sw: Обрыв через 6 МБ + 40 с отказа CDN (503) (sw)

Гипотеза: **H1**. Вердикт: **не воспроизводится** (код с патчами: all).

Ни одной ошибки <video>: сбой поглощён ниже плеера (повтор в SW или в медиастеке Chrome).

**Ожидалось:** Отказ дольше бюджета повторов Chrome (~30 попыток) и буфера → ошибка <video> → load() через 500 мс → playing обнуляет errorCounter → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video> нет; сыграно 120 с, стояло 87 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; каждый ответ обрывается после 6 МБ тела, следующие 40 с все медиазапросы получают 503 (с CORS). 150 с игры; «пользователь» жмёт Play, если плеер встал после ошибки.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 120 / 87 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | ogaauh |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=21, serveFail=20, readDied=5, originNotOk=105, browserReq=21, install=1, activate=1, evaluated=1 |
| запросы к CDN | 136 ({"empty":136}; статусы {"206":5,"503":131}; обрывов 5; 30 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.5s ogaauh [bench] SW script evaluated, instance=ogaauh script=?24
+0.5s ogaauh [SW] Install event fired at 1792881955304
+0.5s ogaauh [SW] Activate event fired at 1792881955305
+11.2s ogaauh [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 6291456 frontier= 6291456 err= network error
+11.3s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.8s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+12.8s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+14.8s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+18.8s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+18.8s ogaauh [SEEK-DIAG] serve FAIL m= bench-A start= 0 pos= 6291456 end= 307695338 servedSoFar= 6291456 total= 307695339 connFrontier= 6291456 connDead= true err= Fetch failed: 503
+19.1s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+19.6s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+20.6s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+22.6s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+26.6s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+26.6s ogaauh [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+27.0s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+27.5s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+28.5s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+30.5s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+34.5s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+34.5s ogaauh [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+34.9s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+35.4s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+36.5s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+38.5s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+42.5s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+42.5s ogaauh [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+42.9s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+43.4s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+44.5s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+46.5s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+50.5s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+50.5s ogaauh [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+51.0s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+61.7s ogaauh [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 12582912 frontier= 12582912 err= network error
+61.7s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 12582912 status= 503
+62.2s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 12582912 status= 503
+63.3s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 12582912 status= 503
+65.3s ogaauh [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 12582912 status= 503
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
+28.0s video waiting ct=24.52
+51.6s video canplay ct=24.58
+51.6s video playing ct=24.58
+80.7s video waiting ct=53.6
+102.2s video canplay ct=53.65
+102.2s video playing ct=53.65
+131.4s video waiting ct=82.79
+153.0s video canplay ct=82.84
+153.0s video playing ct=82.84
+182.0s video waiting ct=111.8
+203.9s video canplay ct=111.85
+203.9s video playing ct=111.85
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 213.4,
  "state": {
   "ct": 121.297694,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 121.245312,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 2,
   "video-cache-v1-bench-A": 31
  }
 }
]
```
