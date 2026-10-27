# h4-expired-403-sw: Подпись истекла: с 45-й секунды CDN отвечает 403 (SW)

Гипотеза: **H4**. Вердикт: **воспроизведено**.

serve FAIL: 149, origin NOT OK: 149; ошибок <video>: 4; notifyBroken: 0; запросов /sources/: 0 (обновления подписанных ссылок не было); запросов к CDN после истечения: 353 (403).

**Ожидалось:** Обрыв на 45 с → serve переоткрывает один раз → 403 → serve FAIL; источники через /sources/ не обновляются; ошибки до notifyBroken.

**Что увидел пользователь:** ошибок <video>: 4 (коды 2×4); перезагрузок load() после старта: 4 (макс. 2/мин); сыграно 121 с, стояло 119 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; в +45 с все открытые ответы обрываются, все последующие запросы со старой подписью (sig=1) → 403 (с CORS), свежая подпись из /sources/ работает; ещё 200 с — дальше края кэша.

| метрика | значение |
|---|---|
| ошибки <video> | +130.8s code=2 ct=121.62<br>+162.3s code=2 ct=121.62<br>+193.8s code=2 ct=121.62<br>+225.3s code=2 ct=121.62 |
| load() после старта / src с &rand | 4 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 121 / 119 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 2fbeyi |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=152, serveFail=149, originNotOk=149, browserReq=152, install=1, activate=1, evaluated=1 |
| запросы к CDN | 355 ({"empty":355}; статусы {"206":2,"403":353}; обрывов 1; 27.9 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s 2fbeyi [bench] SW script evaluated, instance=2fbeyi script=?24
+0.1s 2fbeyi [SW] Install event fired at 1792878824309
+0.1s 2fbeyi [SW] Activate event fired at 1792878824310
+94.5s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+94.5s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 0 pos= 27262976 end= 307695338 servedSoFar= 27262976 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+100.1s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+100.1s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+100.5s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+100.5s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+100.9s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+100.9s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+101.3s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+101.3s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+101.8s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+101.8s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+102.4s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+102.4s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+103.0s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+103.0s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+103.7s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+103.7s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+104.4s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+104.4s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+105.1s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+105.1s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+105.9s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+105.9s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+106.8s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+106.8s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+107.7s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+107.7s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+108.7s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+108.7s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+109.7s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+109.7s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+110.7s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+110.7s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+111.8s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+111.8s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+113.0s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
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
+0.6s video loadstart ct=0
+0.7s runner mute
+2.3s video canplay ct=0
+3.0s runner play
+3.0s video playing ct=0
+48.0s runner cdn-config {"throttleBps":614400,"faults":[{"action":"status","code":403,"when":{"query":{"sig":1}}}]}
+48.0s runner cdn-cut {"dest":"all","cut":1}
+124.6s video waiting ct=121.62
+130.8s video error ct=121.62 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+130.8s player: Error #2: A network error caused the video download to fail part-way.
+130.8s player: Current time:  121.620045
+130.8s video pause ct=121.66 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+131.3s call load el=main-video_html5_api ct=121.66
+131.3s video emptied ct=0
+131.3s video loadstart ct=0
+131.3s video canplay ct=0
+131.3s video seeking ct=121.62
+131.3s video waiting ct=121.62
+162.3s video error ct=121.62 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+162.3s player: Error #2: A network error caused the video download to fail part-way.
+162.3s player: Current time:  121.620045
+162.3s video pause ct=121.62 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+162.8s call load el=main-video_html5_api ct=121.62
+162.8s video emptied ct=0
+162.8s video loadstart ct=0
+162.8s video canplay ct=0
+162.8s video seeking ct=121.62
+162.8s video waiting ct=121.62
+193.8s video error ct=121.62 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+193.8s player: Error #2: A network error caused the video download to fail part-way.
+193.8s player: Current time:  121.620045
+193.8s video pause ct=121.62 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+194.3s player: using alternative sources
+194.3s call load el=main-video_html5_api ct=121.62
+194.3s video emptied ct=0
+194.3s video loadstart ct=0
+194.3s video canplay ct=0
+194.3s video seeking ct=121.62
+194.3s video waiting ct=121.62
+225.3s video error ct=121.62 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+225.3s player: Error #2: A network error caused the video download to fail part-way.
+225.3s player: Current time:  121.620045
+225.3s video pause ct=121.62 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+225.8s call load el=main-video_html5_api ct=121.62
+225.8s video emptied ct=0
+225.8s video loadstart ct=0
+225.9s video canplay ct=0
+225.9s video seeking ct=121.52
+225.9s video waiting ct=121.52
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 248.5,
  "state": {
   "ct": 121.520045,
   "paused": false,
   "errorCounter": 4,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 1
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 27
  }
 }
]
```
