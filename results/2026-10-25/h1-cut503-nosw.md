# h1-cut503-nosw: Обрыв через 6 МБ + 503 на следующий запрос (без SW)

Гипотеза: **H1**. Вердикт: **воспроизведено**.

6 ошибок <video> подряд, после каждой load() и снова playing (playing: 7); счётчик errorCounter сбрасывается, notifyBroken не вызван ни разу.

**Ожидалось:** Повтор Chrome получает 503 → MEDIA_ERR_NETWORK → load() → playing → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video>: 6 (коды 2×6); перезагрузок load() после старта: 6 (макс. 3/мин); сыграно 142 с, стояло 4 с; notifyBroken: 0; **цикл ошибок без notifyBroken**.

**Сценарий:** То же, кэширование SW выключено.

| метрика | значение |
|---|---|
| ошибки <video> | +11.6s code=2 ct=8.14<br>+41.2s code=2 ct=36.87<br>+67.1s code=2 ct=62.15<br>+95.2s code=2 ct=89.49<br>+123.2s code=2 ct=116.77<br>+150.2s code=2 ct=143 |
| load() после старта / src с &rand | 6 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 142 / 4 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 1tyy66 |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=19, install=1, activate=1, evaluated=1 |
| запросы к CDN | 13 ({"video":13}; статусы {"206":7,"503":6}; обрывов 6; 37.6 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.5s 1tyy66 [bench] SW script evaluated, instance=1tyy66 script=?24
+0.6s 1tyy66 [SW] Install event fired at 1792877392429
+0.6s 1tyy66 [SW] Activate event fired at 1792877392431
+1.0s 1tyy66 [SW] Video caching disabled, bypassing SW
+11.6s 1tyy66 [SW] Video caching disabled, bypassing SW
+12.1s 1tyy66 [SW] Video caching disabled, bypassing SW
+14.7s 1tyy66 [SW] Video caching disabled, bypassing SW
+41.2s 1tyy66 [SW] Video caching disabled, bypassing SW
+41.7s 1tyy66 [SW] Video caching disabled, bypassing SW
+41.7s 1tyy66 [SW] Video caching disabled, bypassing SW
+67.1s 1tyy66 [SW] Video caching disabled, bypassing SW
+67.6s 1tyy66 [SW] Video caching disabled, bypassing SW
+67.6s 1tyy66 [SW] Video caching disabled, bypassing SW
+95.2s 1tyy66 [SW] Video caching disabled, bypassing SW
+95.7s 1tyy66 [SW] Video caching disabled, bypassing SW
+95.8s 1tyy66 [SW] Video caching disabled, bypassing SW
+123.1s 1tyy66 [SW] Video caching disabled, bypassing SW
+123.7s 1tyy66 [SW] Video caching disabled, bypassing SW
+123.8s 1tyy66 [SW] Video caching disabled, bypassing SW
+150.2s 1tyy66 [SW] Video caching disabled, bypassing SW
+150.7s 1tyy66 [SW] Video caching disabled, bypassing SW
+150.7s 1tyy66 [SW] Video caching disabled, bypassing SW
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
+3.5s video playing ct=0
+11.6s video error ct=8.14 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+11.6s player: Error #2: A network error caused the video download to fail part-way.
+11.6s player: Current time:  7.920476
+11.6s video pause ct=8.14 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+12.1s call load el=main-video_html5_api ct=8.14
+12.1s video emptied ct=0
+12.1s video loadstart ct=0
+12.2s video canplay ct=0
+12.2s video seeking ct=7.92
+12.2s video waiting ct=7.92
+12.2s video canplay ct=7.92
+12.2s video playing ct=7.92
+41.2s video error ct=36.87 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+41.2s player: Error #2: A network error caused the video download to fail part-way.
+41.2s player: Current time:  36.825438
+41.2s video pause ct=36.87 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+41.7s call load el=main-video_html5_api ct=36.87
+41.7s video emptied ct=0
+41.7s video loadstart ct=0
+41.7s video canplay ct=0
+41.7s video seeking ct=36.83
+41.7s video waiting ct=36.83
+41.7s video canplay ct=36.83
+41.7s video playing ct=36.83
+67.1s video error ct=62.15 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+67.1s player: Error #2: A network error caused the video download to fail part-way.
+67.1s player: Current time:  62.005882
+67.1s video pause ct=62.15 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+67.6s call load el=main-video_html5_api ct=62.15
+67.6s video emptied ct=0
+67.6s video loadstart ct=0
+67.6s video canplay ct=0
+67.6s video seeking ct=62.01
+67.6s video waiting ct=62.01
+67.6s video canplay ct=62.01
+67.6s video playing ct=62.01
+95.2s video error ct=89.49 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+95.2s player: Error #2: A network error caused the video download to fail part-way.
+95.2s player: Current time:  89.324493
+95.2s video pause ct=89.49 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+95.7s call load el=main-video_html5_api ct=89.49
+95.7s video emptied ct=0
+95.7s video loadstart ct=0
+95.7s video canplay ct=0
+95.7s video seeking ct=89.32
+95.7s video waiting ct=89.32
+95.8s video canplay ct=89.32
+95.8s video playing ct=89.33
+123.2s video error ct=116.77 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+123.2s player: Error #2: A network error caused the video download to fail part-way.
+123.2s player: Current time:  116.641612
+123.2s video pause ct=116.77 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+123.7s call load el=main-video_html5_api ct=116.77
+123.7s video emptied ct=0
+123.7s video loadstart ct=0
+123.8s video canplay ct=0
+123.8s video seeking ct=116.64
+123.8s video waiting ct=116.64
+123.8s video canplay ct=116.64
+123.8s video playing ct=116.64
+150.2s video error ct=143 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+150.2s player: Error #2: A network error caused the video download to fail part-way.
+150.2s player: Current time:  142.894853
+150.2s video pause ct=143 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+150.7s call load el=main-video_html5_api ct=143
+150.7s video emptied ct=0
+150.7s video loadstart ct=0
+150.7s video canplay ct=0
+150.7s video seeking ct=142.89
+150.7s video waiting ct=142.89
+150.7s video canplay ct=142.9
+150.7s video playing ct=142.9
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 153.4,
  "state": {
   "ct": 145.55494,
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
