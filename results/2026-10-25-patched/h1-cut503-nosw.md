# h1-cut503-nosw: Обрыв через 6 МБ + 503 на следующий запрос (без SW)

Гипотеза: **H1**. Вердикт: **не воспроизводится** (код с патчами: all).

Ошибок: 5; порог сработал, notifyBroken: 1.

**Ожидалось:** Повтор Chrome получает 503 → MEDIA_ERR_NETWORK → load() → playing → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video>: 5 (коды 2×5); перезагрузок load() после старта: 4 (макс. 3/мин); сыграно 112 с, стояло 20 с; notifyBroken: 1.

**Сценарий:** То же, кэширование SW выключено.

| метрика | значение |
|---|---|
| ошибки <video> | +11.7s code=2 ct=8.14<br>+40.7s code=2 ct=36.35<br>+68.3s code=2 ct=62.82<br>+97s code=2 ct=89.41<br>+128.3s code=2 ct=116.38 |
| load() после старта / src с &rand | 4 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 112 / 20 |
| notifyBroken (POST brokenVideo) | 1 |
| экземпляры SW (по обёртке логов) | i7apuw |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=15, install=1, activate=1, evaluated=1 |
| запросы к CDN | 10 ({"video":10}; статусы {"206":5,"503":5}; обрывов 5; 30 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.6s i7apuw [bench] SW script evaluated, instance=i7apuw script=?24
+0.6s i7apuw [SW] Install event fired at 1792881488353
+0.6s i7apuw [SW] Activate event fired at 1792881488355
+1.0s i7apuw [SW] Video caching disabled, bypassing SW
+11.6s i7apuw [SW] Video caching disabled, bypassing SW
+12.2s i7apuw [SW] Video caching disabled, bypassing SW
+14.7s i7apuw [SW] Video caching disabled, bypassing SW
+40.7s i7apuw [SW] Video caching disabled, bypassing SW
+41.7s i7apuw [SW] Video caching disabled, bypassing SW
+41.7s i7apuw [SW] Video caching disabled, bypassing SW
+68.3s i7apuw [SW] Video caching disabled, bypassing SW
+70.3s i7apuw [SW] Video caching disabled, bypassing SW
+70.4s i7apuw [SW] Video caching disabled, bypassing SW
+97.0s i7apuw [SW] Video caching disabled, bypassing SW
+101.0s i7apuw [SW] Video caching disabled, bypassing SW
+101.0s i7apuw [SW] Video caching disabled, bypassing SW
+101.1s i7apuw [SW] Video caching disabled, bypassing SW
+128.3s i7apuw [SW] Video caching disabled, bypassing SW
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
+2.7s video canplay ct=0
+3.5s runner play
+3.5s video playing ct=0
+11.7s video error ct=8.14 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+11.7s player: Error #2: A network error caused the video download to fail part-way.
+11.7s player: Current time:  7.923575
+11.7s video pause ct=8.14 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+12.2s call load el=main-video_html5_api ct=8.14
+12.2s video emptied ct=0
+12.2s video loadstart ct=0
+12.2s video canplay ct=0
+12.2s video seeking ct=7.92
+12.2s video waiting ct=7.92
+12.2s video canplay ct=7.92
+12.2s video playing ct=7.92
+40.7s video error ct=36.35 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+40.7s player: Error #2: A network error caused the video download to fail part-way.
+40.7s player: Current time:  36.294984
+40.7s video pause ct=36.35 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+41.7s call load el=main-video_html5_api ct=36.35
+41.7s video emptied ct=0
+41.7s video loadstart ct=0
+41.7s video canplay ct=0
+41.7s video seeking ct=36.29
+41.7s video waiting ct=36.29
+41.8s video canplay ct=36.3
+41.8s video playing ct=36.3
+68.3s video error ct=62.82 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+68.3s player: Error #2: A network error caused the video download to fail part-way.
+68.3s player: Current time:  62.801502
+68.3s video pause ct=62.82 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+70.3s player: using alternative sources
+70.3s call load el=main-video_html5_api ct=62.82
+70.3s video emptied ct=0
+70.3s video loadstart ct=0
+70.3s video canplay ct=0
+70.3s video seeking ct=62.8
+70.3s video waiting ct=62.8
+70.4s video canplay ct=62.8
+70.4s video playing ct=62.8
+97.0s video error ct=89.41 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+97.0s player: Error #2: A network error caused the video download to fail part-way.
+97.0s player: Current time:  89.321582
+97.0s video pause ct=89.41 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+101.0s call load el=main-video_html5_api ct=89.41
+101.0s video emptied ct=0
+101.0s video loadstart ct=0
+101.0s video canplay ct=0
+101.0s video seeking ct=89.22
+101.0s video waiting ct=89.22
+101.1s video canplay ct=89.22
+101.1s video playing ct=89.22
+128.3s video error ct=116.38 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+128.3s player: Error #2: A network error caused the video download to fail part-way.
+128.3s player: Current time:  116.264627
+128.3s player: Notify broken.
+128.3s video pause ct=116.38 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+132.8s runner user-play (player is paused after an error)
+132.8s video playing ct=116.38 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 153.5,
  "state": {
   "ct": 116.382472,
   "paused": false,
   "errorCounter": 5,
   "lastSuccessTime": 116.382472,
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
