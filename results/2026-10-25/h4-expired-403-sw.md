# h4-expired-403-sw: Подпись истекла: с 45-й секунды CDN отвечает 403 (SW)

Гипотеза: **H4**. Вердикт: **воспроизведено**.

serve FAIL: 149, origin NOT OK: 149; ошибок <video>: 4; notifyBroken: 0; запросов /sources/: 0 (обновления подписанных ссылок не было); запросов к CDN после истечения: 353 (403).

**Ожидалось:** Обрыв на 45 с → serve переоткрывает один раз → 403 → serve FAIL; источники через /sources/ не обновляются; ошибки до notifyBroken.

**Что увидел пользователь:** ошибок <video>: 4 (коды 2×4); перезагрузок load() после старта: 4 (макс. 2/мин); сыграно 121 с, стояло 119 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; в +45 с все открытые ответы обрываются, все последующие запросы со старой подписью (sig=1) → 403 (с CORS), свежая подпись из /sources/ работает; ещё 200 с — дальше края кэша.

| метрика | значение |
|---|---|
| ошибки <video> | +131.3s code=2 ct=121.62<br>+162.8s code=2 ct=121.62<br>+194.3s code=2 ct=121.62<br>+225.9s code=2 ct=121.62 |
| load() после старта / src с &rand | 4 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 121 / 119 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 2fbeyi |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=152, serveFail=149, originNotOk=149, browserReq=152, install=1, activate=1, evaluated=1 |
| запросы к CDN | 355 ({"empty":355}; статусы {"206":2,"403":353}; обрывов 1; 27.9 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.6s 2fbeyi [bench] SW script evaluated, instance=2fbeyi script=?24
+0.6s 2fbeyi [SW] Install event fired at 1792878824309
+0.6s 2fbeyi [SW] Activate event fired at 1792878824310
+95.0s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+95.0s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 0 pos= 27262976 end= 307695338 servedSoFar= 27262976 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+100.6s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+100.6s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+101.0s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+101.0s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+101.4s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+101.4s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+101.8s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+101.8s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+102.4s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+102.4s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+102.9s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+102.9s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+103.5s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+103.5s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+104.2s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+104.2s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+104.9s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+104.9s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+105.6s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+105.6s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+106.5s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+106.5s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+107.3s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+107.3s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+108.2s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+108.2s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+109.2s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+109.2s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+110.2s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+110.2s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+111.2s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+111.2s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+112.3s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
+112.3s 2fbeyi [SEEK-DIAG] serve FAIL m= bench-A start= 27262976 pos= 27262976 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 403
+113.5s 2fbeyi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 27262976 status= 403
```

### Таймлайн

```
+0.6s runner navigate
+0.6s sw-target created
+0.6s page: controllerchange
+1.0s runner navigate
+1.1s call src= el=main-video_html5_api
+1.1s call load el=main-video_html5_api ct=0
+1.1s video emptied ct=0
+1.1s video loadstart ct=0
+1.2s runner mute
+2.8s video canplay ct=0
+3.5s runner play
+3.5s video playing ct=0
+48.5s runner cdn-config {"throttleBps":614400,"faults":[{"action":"status","code":403,"when":{"query":{"sig":1}}}]}
+48.5s runner cdn-cut {"dest":"all","cut":1}
+125.2s video waiting ct=121.62
+131.3s video error ct=121.62 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+131.3s player: Error #2: A network error caused the video download to fail part-way.
+131.3s player: Current time:  121.620045
+131.3s video pause ct=121.66 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+131.8s call load el=main-video_html5_api ct=121.66
+131.8s video emptied ct=0
+131.8s video loadstart ct=0
+131.8s video canplay ct=0
+131.8s video seeking ct=121.62
+131.8s video waiting ct=121.62
+162.8s video error ct=121.62 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+162.8s player: Error #2: A network error caused the video download to fail part-way.
+162.8s player: Current time:  121.620045
+162.8s video pause ct=121.62 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+163.3s call load el=main-video_html5_api ct=121.62
+163.3s video emptied ct=0
+163.3s video loadstart ct=0
+163.4s video canplay ct=0
+163.4s video seeking ct=121.62
+163.4s video waiting ct=121.62
+194.3s video error ct=121.62 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+194.3s player: Error #2: A network error caused the video download to fail part-way.
+194.3s player: Current time:  121.620045
+194.3s video pause ct=121.62 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+194.8s player: using alternative sources
+194.8s call load el=main-video_html5_api ct=121.62
+194.8s video emptied ct=0
+194.8s video loadstart ct=0
+194.9s video canplay ct=0
+194.9s video seeking ct=121.62
+194.9s video waiting ct=121.62
+225.9s video error ct=121.62 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+225.9s player: Error #2: A network error caused the video download to fail part-way.
+225.9s player: Current time:  121.620045
+225.9s video pause ct=121.62 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+226.4s call load el=main-video_html5_api ct=121.62
+226.4s video emptied ct=0
+226.4s video loadstart ct=0
+226.4s video canplay ct=0
+226.4s video seeking ct=121.52
+226.4s video waiting ct=121.52
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
