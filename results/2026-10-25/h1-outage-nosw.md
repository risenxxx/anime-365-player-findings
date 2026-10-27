# h1-outage-nosw: Обрыв через 6 МБ + 5 с отказа CDN (503) (nosw)

Гипотеза: **H1**. Вердикт: **частично**.

Ошибок: 4, playing: 5, notifyBroken: 0.

**Ожидалось:** Отказ длиннее повторов serve() и медиастека Chrome → ошибка <video> → load() через 500 мс → playing обнуляет errorCounter → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video>: 4 (коды 2×4); перезагрузок load() после старта: 4 (макс. 4/мин); сыграно 144 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; каждый ответ обрывается после 6 МБ тела, следующие 5 с все медиазапросы получают 503 (с CORS). 150 с игры; «пользователь» жмёт Play, если плеер встал после ошибки.

| метрика | значение |
|---|---|
| ошибки <video> | +11.2s code=2 ct=8.15<br>+14.4s code=2 ct=10.52<br>+15s code=2 ct=10.57<br>+15.6s code=2 ct=10.58 |
| load() после старта / src с &rand | 4 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 144 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | mi2icn |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=12, install=1, activate=1, evaluated=1 |
| запросы к CDN | 11 ({"video":11}; статусы {"206":7,"503":4}; обрывов 6; 38.3 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s mi2icn [bench] SW script evaluated, instance=mi2icn script=?24
+0.1s mi2icn [SW] Install event fired at 1792877703673
+0.1s mi2icn [SW] Activate event fired at 1792877703674
+0.6s mi2icn [SW] Video caching disabled, bypassing SW
+11.1s mi2icn [SW] Video caching disabled, bypassing SW
+11.7s mi2icn [SW] Video caching disabled, bypassing SW
+14.3s mi2icn [SW] Video caching disabled, bypassing SW
+14.9s mi2icn [SW] Video caching disabled, bypassing SW
+15.6s mi2icn [SW] Video caching disabled, bypassing SW
+16.1s mi2icn [SW] Video caching disabled, bypassing SW
+36.5s mi2icn [SW] Video caching disabled, bypassing SW
+67.8s mi2icn [SW] Video caching disabled, bypassing SW
+95.0s mi2icn [SW] Video caching disabled, bypassing SW
+122.5s mi2icn [SW] Video caching disabled, bypassing SW
+149.2s mi2icn [SW] Video caching disabled, bypassing SW
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
+3.0s video playing ct=0.01
+11.2s video error ct=8.15 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+11.2s player: Error #2: A network error caused the video download to fail part-way.
+11.2s player: Current time:  7.920056
+11.2s video pause ct=8.15 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+11.7s call load el=main-video_html5_api ct=8.15
+11.7s video emptied ct=0
+11.7s video loadstart ct=0
+11.7s video canplay ct=0
+11.7s video seeking ct=7.92
+11.7s video waiting ct=7.92
+11.8s video canplay ct=7.92
+11.8s video playing ct=7.92
+14.4s video error ct=10.52 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+14.4s player: Error #2: A network error caused the video download to fail part-way.
+14.4s player: Current time:  10.519656
+14.4s video pause ct=10.52 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+14.9s call load el=main-video_html5_api ct=10.52
+14.9s video emptied ct=0
+14.9s video loadstart ct=0
+14.9s video canplay ct=0
+14.9s video seeking ct=10.52
+14.9s video waiting ct=10.52
+14.9s video canplay ct=10.52
+14.9s video playing ct=10.52
+15.0s video error ct=10.57 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+15.0s player: Error #2: A network error caused the video download to fail part-way.
+15.0s player: Current time:  10.562185
+15.0s video pause ct=10.57 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+15.5s call load el=main-video_html5_api ct=10.57
+15.5s video emptied ct=0
+15.5s video loadstart ct=0
+15.6s video canplay ct=0
+15.6s video seeking ct=10.56
+15.6s video waiting ct=10.56
+15.6s video canplay ct=10.56
+15.6s video playing ct=10.56
+15.6s video error ct=10.58 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+15.6s player: Error #2: A network error caused the video download to fail part-way.
+15.6s player: Current time:  10.562338
+15.6s video pause ct=10.58 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+16.1s call load el=main-video_html5_api ct=10.58
+16.1s video emptied ct=0
+16.1s video loadstart ct=0
+16.1s video canplay ct=0
+16.1s video seeking ct=10.56
+16.1s video waiting ct=10.56
+16.1s video canplay ct=10.56
+16.1s video playing ct=10.56
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
