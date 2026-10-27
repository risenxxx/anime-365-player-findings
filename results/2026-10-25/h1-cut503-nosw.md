# h1-cut503-nosw: Обрыв через 6 МБ + 503 на следующий запрос (без SW)

Гипотеза: **H1**. Вердикт: **воспроизведено**.

6 ошибок <video> подряд, после каждой load() и снова playing (playing: 7); счётчик errorCounter сбрасывается, notifyBroken не вызван ни разу.

**Ожидалось:** Повтор Chrome получает 503 → MEDIA_ERR_NETWORK → load() → playing → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video>: 6 (коды 2×6); перезагрузок load() после старта: 6 (макс. 3/мин); сыграно 142 с, стояло 4 с; notifyBroken: 0; **цикл ошибок без notifyBroken**.

**Сценарий:** То же, кэширование SW выключено.

| метрика | значение |
|---|---|
| ошибки <video> | +11.1s code=2 ct=8.14<br>+40.7s code=2 ct=36.87<br>+66.6s code=2 ct=62.15<br>+94.7s code=2 ct=89.49<br>+122.8s code=2 ct=116.77<br>+149.7s code=2 ct=143 |
| load() после старта / src с &rand | 6 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 142 / 4 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 1tyy66 |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=19, install=1, activate=1, evaluated=1 |
| запросы к CDN | 13 ({"video":13}; статусы {"206":7,"503":6}; обрывов 6; 37.6 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s 1tyy66 [bench] SW script evaluated, instance=1tyy66 script=?24
+0.1s 1tyy66 [SW] Install event fired at 1792877392429
+0.1s 1tyy66 [SW] Activate event fired at 1792877392431
+0.5s 1tyy66 [SW] Video caching disabled, bypassing SW
+11.1s 1tyy66 [SW] Video caching disabled, bypassing SW
+11.7s 1tyy66 [SW] Video caching disabled, bypassing SW
+14.2s 1tyy66 [SW] Video caching disabled, bypassing SW
+40.7s 1tyy66 [SW] Video caching disabled, bypassing SW
+41.2s 1tyy66 [SW] Video caching disabled, bypassing SW
+41.3s 1tyy66 [SW] Video caching disabled, bypassing SW
+66.6s 1tyy66 [SW] Video caching disabled, bypassing SW
+67.1s 1tyy66 [SW] Video caching disabled, bypassing SW
+67.2s 1tyy66 [SW] Video caching disabled, bypassing SW
+94.7s 1tyy66 [SW] Video caching disabled, bypassing SW
+95.2s 1tyy66 [SW] Video caching disabled, bypassing SW
+95.3s 1tyy66 [SW] Video caching disabled, bypassing SW
+122.6s 1tyy66 [SW] Video caching disabled, bypassing SW
+123.3s 1tyy66 [SW] Video caching disabled, bypassing SW
+123.3s 1tyy66 [SW] Video caching disabled, bypassing SW
+149.7s 1tyy66 [SW] Video caching disabled, bypassing SW
+150.2s 1tyy66 [SW] Video caching disabled, bypassing SW
+150.2s 1tyy66 [SW] Video caching disabled, bypassing SW
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
+2.2s video canplay ct=0
+3.0s runner play
+3.0s video playing ct=0
+11.1s video error ct=8.14 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+11.2s player: Error #2: A network error caused the video download to fail part-way.
+11.2s player: Current time:  7.920476
+11.2s video pause ct=8.14 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+11.6s call load el=main-video_html5_api ct=8.14
+11.6s video emptied ct=0
+11.7s video loadstart ct=0
+11.7s video canplay ct=0
+11.7s video seeking ct=7.92
+11.7s video waiting ct=7.92
+11.7s video canplay ct=7.92
+11.7s video playing ct=7.92
+40.7s video error ct=36.87 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+40.7s player: Error #2: A network error caused the video download to fail part-way.
+40.7s player: Current time:  36.825438
+40.7s video pause ct=36.87 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+41.2s call load el=main-video_html5_api ct=36.87
+41.2s video emptied ct=0
+41.2s video loadstart ct=0
+41.2s video canplay ct=0
+41.2s video seeking ct=36.83
+41.2s video waiting ct=36.83
+41.3s video canplay ct=36.83
+41.3s video playing ct=36.83
+66.6s video error ct=62.15 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+66.6s player: Error #2: A network error caused the video download to fail part-way.
+66.6s player: Current time:  62.005882
+66.6s video pause ct=62.15 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+67.1s call load el=main-video_html5_api ct=62.15
+67.1s video emptied ct=0
+67.1s video loadstart ct=0
+67.1s video canplay ct=0
+67.1s video seeking ct=62.01
+67.1s video waiting ct=62.01
+67.2s video canplay ct=62.01
+67.2s video playing ct=62.01
+94.7s video error ct=89.49 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+94.7s player: Error #2: A network error caused the video download to fail part-way.
+94.7s player: Current time:  89.324493
+94.7s video pause ct=89.49 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+95.2s call load el=main-video_html5_api ct=89.49
+95.2s video emptied ct=0
+95.2s video loadstart ct=0
+95.2s video canplay ct=0
+95.2s video seeking ct=89.32
+95.2s video waiting ct=89.32
+95.3s video canplay ct=89.32
+95.3s video playing ct=89.33
+122.8s video error ct=116.77 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+122.8s player: Error #2: A network error caused the video download to fail part-way.
+122.8s player: Current time:  116.641612
+122.8s video pause ct=116.77 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+123.3s call load el=main-video_html5_api ct=116.77
+123.3s video emptied ct=0
+123.3s video loadstart ct=0
+123.3s video canplay ct=0
+123.3s video seeking ct=116.64
+123.3s video waiting ct=116.64
+123.3s video canplay ct=116.64
+123.3s video playing ct=116.64
+149.7s video error ct=143 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+149.7s player: Error #2: A network error caused the video download to fail part-way.
+149.7s player: Current time:  142.894853
+149.7s video pause ct=143 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+150.2s call load el=main-video_html5_api ct=143
+150.2s video emptied ct=0
+150.2s video loadstart ct=0
+150.2s video canplay ct=0
+150.2s video seeking ct=142.89
+150.2s video waiting ct=142.89
+150.3s video canplay ct=142.9
+150.3s video playing ct=142.9
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
