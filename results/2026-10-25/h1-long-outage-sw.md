# h1-long-outage-sw: Обрыв через 6 МБ + 40 с отказа CDN (503) (sw)

Гипотеза: **H1**. Вердикт: **частично**.

Ошибок: 4, playing: 5, notifyBroken: 0.

**Ожидалось:** Отказ дольше бюджета повторов Chrome (~30 попыток) и буфера → ошибка <video> → load() через 500 мс → playing обнуляет errorCounter → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video>: 4 (коды 2×4); перезагрузок load() после старта: 4 (макс. 2/мин); сыграно 120 с, стояло 86 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; каждый ответ обрывается после 6 МБ тела, следующие 40 с все медиазапросы получают 503 (с CORS). 150 с игры; «пользователь» жмёт Play, если плеер встал после ошибки.

| метрика | значение |
|---|---|
| ошибки <video> | +41.8s code=2 ct=24.52<br>+92.5s code=2 ct=53.6<br>+143.2s code=2 ct=82.78<br>+193.9s code=2 ct=111.8 |
| load() после старта / src с &rand | 4 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 120 / 86 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | gbngz1 |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=186, serveFail=180, readDied=4, originNotOk=180, browserReq=186, install=1, activate=1, evaluated=1 |
| запросы к CDN | 415 ({"empty":415}; статусы {"206":5,"503":410}; обрывов 4; 29.8 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s gbngz1 [bench] SW script evaluated, instance=gbngz1 script=?24
+0.1s gbngz1 [SW] Install event fired at 1792877859333
+0.1s gbngz1 [SW] Activate event fired at 1792877859334
+10.8s gbngz1 [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 6291456 frontier= 6291456 err= network error
+10.8s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+10.8s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 0 pos= 6291456 end= 307695338 servedSoFar= 6291456 total= 307695339 connFrontier= 6291456 connDead= true err= Fetch failed: 503
+11.1s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.1s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+11.5s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.5s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+11.9s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.9s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+12.4s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+12.4s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+12.9s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+12.9s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+13.4s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+13.4s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+14.0s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+14.0s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+14.7s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+14.7s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+15.4s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+15.4s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+16.2s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+16.2s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+17.0s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+17.0s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+17.8s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+17.8s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+18.7s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+18.7s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+19.7s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+19.7s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+20.7s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+20.7s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+21.8s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+21.8s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+22.9s gbngz1 [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+22.9s gbngz1 [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
```

### Таймлайн

```
+0.1s runner navigate
+0.1s sw-target created
+0.1s page: controllerchange
+0.5s runner navigate
+0.6s call src= el=main-video_html5_api
+0.6s call load el=main-video_html5_api ct=0
+0.6s video emptied ct=0
+0.6s video loadstart ct=0
+0.7s runner mute
+2.3s video canplay ct=0
+3.0s runner play
+3.0s video playing ct=0
+27.6s video waiting ct=24.52
+41.8s video error ct=24.52 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+41.8s player: Error #2: A network error caused the video download to fail part-way.
+41.8s player: Current time:  24.520133
+41.9s video pause ct=24.58 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+42.4s call load el=main-video_html5_api ct=24.58
+42.4s video emptied ct=0
+42.4s video loadstart ct=0
+42.4s video canplay ct=0
+42.4s video seeking ct=24.52
+42.4s video waiting ct=24.52
+51.3s video canplay ct=24.52
+51.3s video playing ct=24.52
+80.4s video waiting ct=53.6
+92.5s video error ct=53.6 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+92.5s player: Error #2: A network error caused the video download to fail part-way.
+92.5s player: Current time:  53.600222
+92.5s video pause ct=53.65 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+93.0s call load el=main-video_html5_api ct=53.65
+93.0s video emptied ct=0
+93.0s video loadstart ct=0
+93.1s video canplay ct=0
+93.1s video seeking ct=53.6
+93.1s video waiting ct=53.6
+102.0s video canplay ct=53.6
+102.0s video playing ct=53.6
+131.2s video waiting ct=82.78
+143.2s video error ct=82.78 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+143.2s player: Error #2: A network error caused the video download to fail part-way.
+143.2s player: Current time:  82.78045
+143.2s video pause ct=82.84 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+143.7s call load el=main-video_html5_api ct=82.84
+143.7s video emptied ct=0
+143.7s video loadstart ct=0
+143.7s video canplay ct=0
+143.7s video seeking ct=82.78
+143.7s video waiting ct=82.78
+152.6s video canplay ct=82.78
+152.6s video playing ct=82.78
+181.7s video waiting ct=111.8
+193.9s video error ct=111.8 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+193.9s player: Error #2: A network error caused the video download to fail part-way.
+193.9s player: Current time:  111.80065
+193.9s video pause ct=111.85 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+194.4s call load el=main-video_html5_api ct=111.85
+194.4s video emptied ct=0
+194.4s video loadstart ct=0
+194.4s video canplay ct=0
+194.4s video seeking ct=111.8
+194.4s video waiting ct=111.8
+203.3s video canplay ct=111.8
+203.3s video playing ct=111.8
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
