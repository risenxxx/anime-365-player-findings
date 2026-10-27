# h1-cut503-nosw: Обрыв через 6 МБ + 503 на следующий запрос (без SW)

Гипотеза: **H1**. Вердикт: **не воспроизводится** (код с патчами: all).

Ошибок: 5; порог сработал, notifyBroken: 1.

**Ожидалось:** Повтор Chrome получает 503 → MEDIA_ERR_NETWORK → load() → playing → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video>: 5 (коды 2×5); перезагрузок load() после старта: 4 (макс. 3/мин); сыграно 112 с, стояло 20 с; notifyBroken: 1.

**Сценарий:** То же, кэширование SW выключено.

| метрика | значение |
|---|---|
| ошибки <video> | +11.2s code=2 ct=8.14<br>+40.2s code=2 ct=36.35<br>+67.9s code=2 ct=62.82<br>+96.6s code=2 ct=89.41<br>+127.8s code=2 ct=116.38 |
| load() после старта / src с &rand | 4 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 112 / 20 |
| notifyBroken (POST brokenVideo) | 1 |
| экземпляры SW (по обёртке логов) | i7apuw |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=15, install=1, activate=1, evaluated=1 |
| запросы к CDN | 10 ({"video":10}; статусы {"206":5,"503":5}; обрывов 5; 30 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s i7apuw [bench] SW script evaluated, instance=i7apuw script=?24
+0.1s i7apuw [SW] Install event fired at 1792881488353
+0.1s i7apuw [SW] Activate event fired at 1792881488355
+0.6s i7apuw [SW] Video caching disabled, bypassing SW
+11.1s i7apuw [SW] Video caching disabled, bypassing SW
+11.7s i7apuw [SW] Video caching disabled, bypassing SW
+14.3s i7apuw [SW] Video caching disabled, bypassing SW
+40.2s i7apuw [SW] Video caching disabled, bypassing SW
+41.2s i7apuw [SW] Video caching disabled, bypassing SW
+41.3s i7apuw [SW] Video caching disabled, bypassing SW
+67.8s i7apuw [SW] Video caching disabled, bypassing SW
+69.9s i7apuw [SW] Video caching disabled, bypassing SW
+69.9s i7apuw [SW] Video caching disabled, bypassing SW
+96.6s i7apuw [SW] Video caching disabled, bypassing SW
+100.6s i7apuw [SW] Video caching disabled, bypassing SW
+100.6s i7apuw [SW] Video caching disabled, bypassing SW
+100.7s i7apuw [SW] Video caching disabled, bypassing SW
+127.8s i7apuw [SW] Video caching disabled, bypassing SW
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
+11.2s video error ct=8.14 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+11.2s player: Error #2: A network error caused the video download to fail part-way.
+11.2s player: Current time:  7.923575
+11.2s video pause ct=8.14 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+11.7s call load el=main-video_html5_api ct=8.14
+11.7s video emptied ct=0
+11.7s video loadstart ct=0
+11.7s video canplay ct=0
+11.7s video seeking ct=7.92
+11.7s video waiting ct=7.92
+11.8s video canplay ct=7.92
+11.8s video playing ct=7.92
+40.2s video error ct=36.35 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+40.2s player: Error #2: A network error caused the video download to fail part-way.
+40.2s player: Current time:  36.294984
+40.2s video pause ct=36.35 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+41.2s call load el=main-video_html5_api ct=36.35
+41.2s video emptied ct=0
+41.2s video loadstart ct=0
+41.3s video canplay ct=0
+41.3s video seeking ct=36.29
+41.3s video waiting ct=36.29
+41.3s video canplay ct=36.3
+41.3s video playing ct=36.3
+67.9s video error ct=62.82 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+67.9s player: Error #2: A network error caused the video download to fail part-way.
+67.9s player: Current time:  62.801502
+67.9s video pause ct=62.82 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+69.9s player: using alternative sources
+69.9s call load el=main-video_html5_api ct=62.82
+69.9s video emptied ct=0
+69.9s video loadstart ct=0
+69.9s video canplay ct=0
+69.9s video seeking ct=62.8
+69.9s video waiting ct=62.8
+69.9s video canplay ct=62.8
+69.9s video playing ct=62.8
+96.6s video error ct=89.41 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+96.6s player: Error #2: A network error caused the video download to fail part-way.
+96.6s player: Current time:  89.321582
+96.6s video pause ct=89.41 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+100.6s call load el=main-video_html5_api ct=89.41
+100.6s video emptied ct=0
+100.6s video loadstart ct=0
+100.6s video canplay ct=0
+100.6s video seeking ct=89.22
+100.6s video waiting ct=89.22
+100.6s video canplay ct=89.22
+100.6s video playing ct=89.22
+127.8s video error ct=116.38 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+127.8s player: Error #2: A network error caused the video download to fail part-way.
+127.8s player: Current time:  116.264627
+127.8s player: Notify broken.
+127.8s video pause ct=116.38 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+132.4s runner user-play (player is paused after an error)
+132.4s video playing ct=116.38 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
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
