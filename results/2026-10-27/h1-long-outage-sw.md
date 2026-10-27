# h1-long-outage-sw: Обрыв через 6 МБ + 40 с отказа CDN (503) (sw)

Гипотеза: **H1**. Вердикт: **частично**.

Ошибок: 4, playing: 5, notifyBroken: 0.

**Ожидалось:** Отказ дольше бюджета повторов Chrome (~30 попыток) и буфера → ошибка <video> → load() через 500 мс → playing обнуляет errorCounter → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video>: 4 (коды 2×4); перезагрузок load() после старта: 5 (макс. 3/мин); сыграно 120 с, стояло 66 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; каждый ответ обрывается после 6 МБ тела, следующие 40 с все медиазапросы получают 503 (с CORS). 150 с игры; «пользователь» жмёт Play, если плеер встал после ошибки.

| метрика | значение |
|---|---|
| ошибки <video> | +41.8s code=2 ct=24.52<br>+92.5s code=2 ct=53.6<br>+142.8s code=2 ct=82.79<br>+193.4s code=2 ct=111.8 |
| load() после старта / src с &rand | 5 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 120 / 66 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | c4n1xm |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=177, serveFail=173, readDied=5, originNotOk=173, browserReq=177, install=1, activate=1, evaluated=1 |
| запросы к CDN | 1131 ({"empty":1131}; статусы {"206":6,"503":1125}; обрывов 5; 30.2 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s c4n1xm [bench] SW script evaluated, instance=c4n1xm script=?27
+0.1s c4n1xm [SW] Install event fired at 1793115069565
+0.1s c4n1xm [SW] Activate event fired at 1793115069567
+10.8s c4n1xm [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 6291456 frontier= 6291456 err= network error
+10.8s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+10.8s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 0 pos= 6291456 end= 307695338 servedSoFar= 6291456 total= 307695339 connFrontier= 6291456 connDead= true err= Fetch failed: 503
+11.1s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.1s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+11.4s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.4s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+11.8s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.8s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+12.3s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+12.3s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+12.8s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+12.8s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+13.4s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+13.4s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+14.0s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+14.0s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+14.6s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+14.6s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+15.3s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+15.3s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+16.1s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+16.1s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+16.9s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+16.9s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+17.8s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+17.8s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+18.7s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+18.7s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+19.6s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+19.6s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+20.6s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+20.6s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+21.7s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+21.7s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+22.8s c4n1xm [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+22.8s c4n1xm [SEEK-DIAG] serve FAIL m= bench-A start= 6291456 pos= 6291456 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
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
+27.5s video waiting ct=24.52
+41.8s video error ct=24.52 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+41.8s video pause ct=24.58 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+42.3s call load el=main-video_html5_api ct=24.58
+42.3s video emptied ct=0
+42.3s video loadstart ct=0
+42.3s video seeking ct=24.58
+46.0s runner user-play (player is paused after an error)
+46.0s video waiting ct=24.58
+51.3s video canplay ct=24.58
+51.3s video playing ct=24.58
+80.3s video waiting ct=53.6
+92.5s video error ct=53.6 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+92.5s video pause ct=53.65 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+93.6s call load el=main-video_html5_api ct=53.65
+93.6s video emptied ct=0
+93.6s video loadstart ct=0
+93.6s video seeking ct=53.65
+97.2s runner user-play (player is paused after an error)
+97.2s video waiting ct=53.65
+101.5s video canplay ct=53.65
+101.5s video playing ct=53.65
+130.7s video waiting ct=82.79
+142.8s video error ct=82.79 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+142.8s video pause ct=82.84 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+145.1s call src= el=main-video_html5_api
+145.1s call load el=main-video_html5_api ct=0
+145.1s call load el=main-video_html5_api ct=0
+145.1s video emptied ct=0
+145.1s video loadstart ct=0
+145.1s video seeking ct=82.84
+147.3s runner user-play (player is paused after an error)
+147.3s video waiting ct=82.84
+152.2s video canplay ct=82.84
+152.2s video playing ct=82.84
+181.2s video waiting ct=111.8
+193.4s video error ct=111.8 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+193.4s video pause ct=111.85 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+197.5s runner user-play (player is paused after an error)
+197.5s video waiting ct=111.85 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+197.9s call load el=main-video_html5_api ct=111.85
+197.9s video emptied ct=0
+197.9s video loadstart ct=0
+197.9s video seeking ct=111.85
+198.5s runner user-play (player is paused after an error)
+198.5s video waiting ct=111.85
+202.5s video canplay ct=111.85
+202.5s video playing ct=111.85
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 213.4,
  "state": {
   "ct": 122.312842,
   "paused": false,
   "errorCounter": 4,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 31
  }
 }
]
```
