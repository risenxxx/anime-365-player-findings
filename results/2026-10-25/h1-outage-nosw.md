# h1-outage-nosw: Обрыв через 6 МБ + 5 с отказа CDN (503) (nosw)

Гипотеза: **H1**. Вердикт: **частично**.

Ошибок: 4, playing: 5, notifyBroken: 0.

**Ожидалось:** Отказ длиннее повторов serve() и медиастека Chrome → ошибка <video> → load() через 500 мс → playing обнуляет errorCounter → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video>: 4 (коды 2×4); перезагрузок load() после старта: 4 (макс. 4/мин); сыграно 144 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; каждый ответ обрывается после 6 МБ тела, следующие 5 с все медиазапросы получают 503 (с CORS). 150 с игры; «пользователь» жмёт Play, если плеер встал после ошибки.

| метрика | значение |
|---|---|
| ошибки <video> | +11.6s code=2 ct=8.15<br>+14.8s code=2 ct=10.52<br>+15.4s code=2 ct=10.57<br>+16s code=2 ct=10.58 |
| load() после старта / src с &rand | 4 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 144 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | mi2icn |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=12, install=1, activate=1, evaluated=1 |
| запросы к CDN | 11 ({"video":11}; статусы {"206":7,"503":4}; обрывов 6; 38.3 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.5s mi2icn [bench] SW script evaluated, instance=mi2icn script=?24
+0.5s mi2icn [SW] Install event fired at 1792877703673
+0.5s mi2icn [SW] Activate event fired at 1792877703674
+1.0s mi2icn [SW] Video caching disabled, bypassing SW
+11.5s mi2icn [SW] Video caching disabled, bypassing SW
+12.1s mi2icn [SW] Video caching disabled, bypassing SW
+14.7s mi2icn [SW] Video caching disabled, bypassing SW
+15.3s mi2icn [SW] Video caching disabled, bypassing SW
+16.0s mi2icn [SW] Video caching disabled, bypassing SW
+16.5s mi2icn [SW] Video caching disabled, bypassing SW
+36.9s mi2icn [SW] Video caching disabled, bypassing SW
+68.2s mi2icn [SW] Video caching disabled, bypassing SW
+95.4s mi2icn [SW] Video caching disabled, bypassing SW
+122.9s mi2icn [SW] Video caching disabled, bypassing SW
+149.7s mi2icn [SW] Video caching disabled, bypassing SW
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
+3.4s video playing ct=0.01
+11.6s video error ct=8.15 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+11.6s player: Error #2: A network error caused the video download to fail part-way.
+11.6s player: Current time:  7.920056
+11.6s video pause ct=8.15 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+12.1s call load el=main-video_html5_api ct=8.15
+12.1s video emptied ct=0
+12.1s video loadstart ct=0
+12.1s video canplay ct=0
+12.1s video seeking ct=7.92
+12.1s video waiting ct=7.92
+12.2s video canplay ct=7.92
+12.2s video playing ct=7.92
+14.8s video error ct=10.52 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+14.8s player: Error #2: A network error caused the video download to fail part-way.
+14.8s player: Current time:  10.519656
+14.8s video pause ct=10.52 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+15.3s call load el=main-video_html5_api ct=10.52
+15.3s video emptied ct=0
+15.3s video loadstart ct=0
+15.3s video canplay ct=0
+15.3s video seeking ct=10.52
+15.3s video waiting ct=10.52
+15.3s video canplay ct=10.52
+15.3s video playing ct=10.52
+15.4s video error ct=10.57 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+15.4s player: Error #2: A network error caused the video download to fail part-way.
+15.4s player: Current time:  10.562185
+15.4s video pause ct=10.57 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+15.9s call load el=main-video_html5_api ct=10.57
+15.9s video emptied ct=0
+15.9s video loadstart ct=0
+16.0s video canplay ct=0
+16.0s video seeking ct=10.56
+16.0s video waiting ct=10.56
+16.0s video canplay ct=10.56
+16.0s video playing ct=10.56
+16.0s video error ct=10.58 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+16.0s player: Error #2: A network error caused the video download to fail part-way.
+16.0s player: Current time:  10.562338
+16.0s video pause ct=10.58 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+16.5s call load el=main-video_html5_api ct=10.58
+16.5s video emptied ct=0
+16.5s video loadstart ct=0
+16.5s video canplay ct=0
+16.5s video seeking ct=10.56
+16.5s video waiting ct=10.56
+16.5s video canplay ct=10.56
+16.5s video playing ct=10.56
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 153.4,
  "state": {
   "ct": 147.403465,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {}
 }
]
```
