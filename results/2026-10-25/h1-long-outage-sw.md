# h1-long-outage-sw: Обрыв через 6 МБ + 40 с отказа CDN (503) (sw)

Гипотеза: **H1**. Вердикт: **частично**.

Ошибок: 4, playing: 5, notifyBroken: 0.

**Ожидалось:** Отказ дольше бюджета повторов Chrome (~30 попыток) и буфера → ошибка <video> → load() через 500 мс → playing обнуляет errorCounter → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video>: 4 (коды 2×4); перезагрузок load() после старта: 4 (макс. 2/мин); сыграно 120 с, стояло 86 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; каждый ответ обрывается после 6 МБ тела, следующие 40 с все медиазапросы получают 503 (с CORS). 150 с игры; «пользователь» жмёт Play, если плеер встал после ошибки.

| метрика | значение |
|---|---|
| ошибки <video> | +42.3s code=2 ct=24.52<br>+93s code=2 ct=53.6<br>+143.7s code=2 ct=82.78<br>+194.4s code=2 ct=111.8 |
| load() после старта / src с &rand | 4 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 120 / 86 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | gbngz1 |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=186, serveFail=180, readDied=4, originNotOk=180, browserReq=186, install=1, activate=1, evaluated=1 |
| запросы к CDN | 415 ({"empty":415}; статусы {"206":5,"503":410}; обрывов 4; 29.8 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.6s gbngz1 [bench] SW script evaluated, instance=gbngz1 script=?24
+0.6s gbngz1 [SW] Install event fired at 1792877859333
+0.6s gbngz1 [SW] Activate event fired at 1792877859334
+11.3s gbngz1 [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 6291456 frontier= 6291456 err= network error
+11.3s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.3s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 0 pos= 6291456 end= 307695338 servedSoFar= 6291456 total= 307695339 connFrontier= 6291456 connDead= true err= Fetch failed: 503
+11.6s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.6s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+12.0s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+12.0s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+12.4s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+12.4s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+12.8s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+12.8s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+13.3s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+13.3s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+13.9s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+13.9s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+14.5s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+14.5s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+15.2s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+15.2s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+15.9s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+15.9s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+16.6s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+16.6s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+17.4s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+17.4s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+18.3s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+18.3s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+19.2s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+19.2s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+20.2s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+20.2s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+21.2s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+21.2s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+22.2s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+22.2s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+23.3s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+23.3s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
```

### Таймлайн

```
+0.5s runner navigate
+0.6s sw-target created
+0.6s page: controllerchange
+0.9s runner navigate
+1.0s call src= el=main-video_html5_api
+1.0s call load el=main-video_html5_api ct=0
+1.0s video emptied ct=0
+1.0s video loadstart ct=0
+1.2s runner mute
+2.8s video canplay ct=0
+3.5s runner play
+3.5s video playing ct=0
+28.0s video waiting ct=24.52
+42.3s video error ct=24.52 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+42.3s player: Error #2: A network error caused the video download to fail part-way.
+42.3s player: Current time:  24.520133
+42.3s video pause ct=24.58 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+42.8s call load el=main-video_html5_api ct=24.58
+42.8s video emptied ct=0
+42.8s video loadstart ct=0
+42.8s video canplay ct=0
+42.8s video seeking ct=24.52
+42.8s video waiting ct=24.52
+51.7s video canplay ct=24.52
+51.7s video playing ct=24.52
+80.9s video waiting ct=53.6
+93.0s video error ct=53.6 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+93.0s player: Error #2: A network error caused the video download to fail part-way.
+93.0s player: Current time:  53.600222
+93.0s video pause ct=53.65 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+93.5s call load el=main-video_html5_api ct=53.65
+93.5s video emptied ct=0
+93.5s video loadstart ct=0
+93.5s video canplay ct=0
+93.5s video seeking ct=53.6
+93.5s video waiting ct=53.6
+102.4s video canplay ct=53.6
+102.4s video playing ct=53.6
+131.6s video waiting ct=82.78
+143.7s video error ct=82.78 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+143.7s player: Error #2: A network error caused the video download to fail part-way.
+143.7s player: Current time:  82.78045
+143.7s video pause ct=82.84 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+144.2s call load el=main-video_html5_api ct=82.84
+144.2s video emptied ct=0
+144.2s video loadstart ct=0
+144.2s video canplay ct=0
+144.2s video seeking ct=82.78
+144.2s video waiting ct=82.78
+153.1s video canplay ct=82.78
+153.1s video playing ct=82.78
+182.1s video waiting ct=111.8
+194.4s video error ct=111.8 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+194.4s player: Error #2: A network error caused the video download to fail part-way.
+194.4s player: Current time:  111.80065
+194.4s video pause ct=111.85 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+194.9s call load el=main-video_html5_api ct=111.85
+194.9s video emptied ct=0
+194.9s video loadstart ct=0
+194.9s video canplay ct=0
+194.9s video seeking ct=111.8
+194.9s video waiting ct=111.8
+203.8s video canplay ct=111.8
+203.8s video playing ct=111.8
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 213.5,
  "state": {
   "ct": 121.435969,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 30
  }
 }
]
```
