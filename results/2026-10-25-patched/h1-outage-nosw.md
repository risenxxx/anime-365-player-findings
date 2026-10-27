# h1-outage-nosw: Обрыв через 6 МБ + 5 с отказа CDN (503) (nosw)

Гипотеза: **H1**. Вердикт: **частично** (код с патчами: all).

Ошибок: 3, playing: 4, notifyBroken: 0.

**Ожидалось:** Отказ длиннее повторов serve() и медиастека Chrome → ошибка <video> → load() через 500 мс → playing обнуляет errorCounter → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video>: 3 (коды 2×3); перезагрузок load() после старта: 3 (макс. 3/мин); сыграно 142 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; каждый ответ обрывается после 6 МБ тела, следующие 5 с все медиазапросы получают 503 (с CORS). 150 с игры; «пользователь» жмёт Play, если плеер встал после ошибки.

| метрика | значение |
|---|---|
| ошибки <video> | +11.2s code=2 ct=8.15<br>+14.4s code=2 ct=10.53<br>+15.5s code=2 ct=10.57 |
| load() после старта / src с &rand | 3 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 142 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 2ybki9 |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=11, install=1, activate=1, evaluated=1 |
| запросы к CDN | 10 ({"video":10}; статусы {"206":7,"503":3}; обрывов 6; 37.6 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s 2ybki9 [bench] SW script evaluated, instance=2ybki9 script=?24
+0.1s 2ybki9 [SW] Install event fired at 1792881799690
+0.1s 2ybki9 [SW] Activate event fired at 1792881799691
+0.5s 2ybki9 [SW] Video caching disabled, bypassing SW
+11.1s 2ybki9 [SW] Video caching disabled, bypassing SW
+11.7s 2ybki9 [SW] Video caching disabled, bypassing SW
+14.2s 2ybki9 [SW] Video caching disabled, bypassing SW
+15.4s 2ybki9 [SW] Video caching disabled, bypassing SW
+17.6s 2ybki9 [SW] Video caching disabled, bypassing SW
+42.9s 2ybki9 [SW] Video caching disabled, bypassing SW
+69.0s 2ybki9 [SW] Video caching disabled, bypassing SW
+96.5s 2ybki9 [SW] Video caching disabled, bypassing SW
+124.0s 2ybki9 [SW] Video caching disabled, bypassing SW
+150.4s 2ybki9 [SW] Video caching disabled, bypassing SW
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
+11.2s video error ct=8.15 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+11.2s player: Error #2: A network error caused the video download to fail part-way.
+11.2s player: Current time:  7.915473
+11.2s video pause ct=8.15 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+11.7s call load el=main-video_html5_api ct=8.15
+11.7s video emptied ct=0
+11.7s video loadstart ct=0
+11.7s video canplay ct=0
+11.7s video seeking ct=7.92
+11.7s video waiting ct=7.92
+11.7s video canplay ct=7.92
+11.7s video playing ct=7.92
+14.4s video error ct=10.53 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+14.4s player: Error #2: A network error caused the video download to fail part-way.
+14.4s player: Current time:  10.517403
+14.4s video pause ct=10.53 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+15.4s call load el=main-video_html5_api ct=10.53
+15.4s video emptied ct=0
+15.4s video loadstart ct=0
+15.4s video canplay ct=0
+15.4s video seeking ct=10.52
+15.4s video waiting ct=10.52
+15.4s video canplay ct=10.52
+15.4s video playing ct=10.52
+15.5s video error ct=10.57 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+15.5s player: Error #2: A network error caused the video download to fail part-way.
+15.5s player: Current time:  10.517437
+15.5s video pause ct=10.57 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+17.5s player: using alternative sources
+17.5s call load el=main-video_html5_api ct=10.57
+17.5s video emptied ct=0
+17.5s video loadstart ct=0
+17.5s video canplay ct=0
+17.5s video seeking ct=10.52
+17.5s video waiting ct=10.52
+17.5s video canplay ct=10.52
+17.5s video playing ct=10.52
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
