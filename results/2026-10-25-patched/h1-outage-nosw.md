# h1-outage-nosw: Обрыв через 6 МБ + 5 с отказа CDN (503) (nosw)

Гипотеза: **H1**. Вердикт: **частично** (код с патчами: all).

Ошибок: 3, playing: 4, notifyBroken: 0.

**Ожидалось:** Отказ длиннее повторов serve() и медиастека Chrome → ошибка <video> → load() через 500 мс → playing обнуляет errorCounter → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video>: 3 (коды 2×3); перезагрузок load() после старта: 3 (макс. 3/мин); сыграно 142 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; каждый ответ обрывается после 6 МБ тела, следующие 5 с все медиазапросы получают 503 (с CORS). 150 с игры; «пользователь» жмёт Play, если плеер встал после ошибки.

| метрика | значение |
|---|---|
| ошибки <video> | +11.6s code=2 ct=8.15<br>+14.9s code=2 ct=10.53<br>+16s code=2 ct=10.57 |
| load() после старта / src с &rand | 3 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 142 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 2ybki9 |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=11, install=1, activate=1, evaluated=1 |
| запросы к CDN | 10 ({"video":10}; статусы {"206":7,"503":3}; обрывов 6; 37.6 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.6s 2ybki9 [bench] SW script evaluated, instance=2ybki9 script=?24
+0.6s 2ybki9 [SW] Install event fired at 1792881799690
+0.6s 2ybki9 [SW] Activate event fired at 1792881799691
+1.0s 2ybki9 [SW] Video caching disabled, bypassing SW
+11.5s 2ybki9 [SW] Video caching disabled, bypassing SW
+12.1s 2ybki9 [SW] Video caching disabled, bypassing SW
+14.7s 2ybki9 [SW] Video caching disabled, bypassing SW
+15.9s 2ybki9 [SW] Video caching disabled, bypassing SW
+18.0s 2ybki9 [SW] Video caching disabled, bypassing SW
+43.4s 2ybki9 [SW] Video caching disabled, bypassing SW
+69.4s 2ybki9 [SW] Video caching disabled, bypassing SW
+97.0s 2ybki9 [SW] Video caching disabled, bypassing SW
+124.5s 2ybki9 [SW] Video caching disabled, bypassing SW
+150.8s 2ybki9 [SW] Video caching disabled, bypassing SW
```

### Таймлайн

```
+0.5s runner navigate
+0.5s sw-target created
+0.6s page: controllerchange
+0.9s runner navigate
+1.0s call src= el=main-video_html5_api
+1.0s call load el=main-video_html5_api ct=0
+1.0s video emptied ct=0
+1.0s video loadstart ct=0
+1.2s runner mute
+2.7s video canplay ct=0
+3.4s runner play
+3.4s video playing ct=0
+11.6s video error ct=8.15 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+11.6s player: Error #2: A network error caused the video download to fail part-way.
+11.6s player: Current time:  7.915473
+11.6s video pause ct=8.15 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+12.1s call load el=main-video_html5_api ct=8.15
+12.1s video emptied ct=0
+12.1s video loadstart ct=0
+12.2s video canplay ct=0
+12.2s video seeking ct=7.92
+12.2s video waiting ct=7.92
+12.2s video canplay ct=7.92
+12.2s video playing ct=7.92
+14.9s video error ct=10.53 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+14.9s player: Error #2: A network error caused the video download to fail part-way.
+14.9s player: Current time:  10.517403
+14.9s video pause ct=10.53 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+15.9s call load el=main-video_html5_api ct=10.53
+15.9s video emptied ct=0
+15.9s video loadstart ct=0
+15.9s video canplay ct=0
+15.9s video seeking ct=10.52
+15.9s video waiting ct=10.52
+15.9s video canplay ct=10.52
+15.9s video playing ct=10.52
+16.0s video error ct=10.57 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+16.0s player: Error #2: A network error caused the video download to fail part-way.
+16.0s player: Current time:  10.517437
+16.0s video pause ct=10.57 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+18.0s player: using alternative sources
+18.0s call load el=main-video_html5_api ct=10.57
+18.0s video emptied ct=0
+18.0s video loadstart ct=0
+18.0s video canplay ct=0
+18.0s video seeking ct=10.52
+18.0s video waiting ct=10.52
+18.0s video canplay ct=10.52
+18.0s video playing ct=10.52
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 153.4,
  "state": {
   "ct": 145.899823,
   "paused": false,
   "errorCounter": 3,
   "lastSuccessTime": 145.679875,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1
  }
 }
]
```
