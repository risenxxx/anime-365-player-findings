# h1-cut503-nosw: Обрыв через 6 МБ + 503 на следующий запрос (без SW)

Гипотеза: **H1**. Вердикт: **воспроизведено**.

6 ошибок <video> подряд, после каждой load() и снова playing (playing: 7); счётчик errorCounter сбрасывается, notifyBroken не вызван ни разу.

**Ожидалось:** Повтор Chrome получает 503 → MEDIA_ERR_NETWORK → load() → playing → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video>: 6 (коды 2×6); перезагрузок load() после старта: 6 (макс. 4/мин); прыжков назад >5 с: 1; сыграно 121 с, стояло 4 с; notifyBroken: 0; **цикл ошибок без notifyBroken**.

**Сценарий:** То же, кэширование SW выключено.

| метрика | значение |
|---|---|
| ошибки <video> | +11.2s code=2 ct=8.21<br>+39.3s code=2 ct=35.7<br>+67.2s code=2 ct=62.56<br>+81.2s code=2 ct=72.31<br>+114.8s code=2 ct=102.54<br>+144.3s code=2 ct=127.82 |
| load() после старта / src с &rand | 6 / 0 |
| сброс в начало | [] |
| прыжки назад | [{"t":69.5,"from":62.56,"to":0}] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 121 / 4 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | p3lb8o |
| DevTools подключались к SW | нет |
| строки SW | install=1, activate=1, evaluated=1 |
| запросы к CDN | 18 ({"empty":18}; статусы {"206":12,"503":6}; обрывов 6; 39.6 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s p3lb8o [bench] SW script evaluated, instance=p3lb8o script=?27
+0.1s p3lb8o [SW] Install event fired at 1793114602750
+0.1s p3lb8o [SW] Activate event fired at 1793114602750
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
+11.2s video error ct=8.21 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+11.2s video pause ct=8.21 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+11.7s call load el=main-video_html5_api ct=8.21
+11.7s video emptied ct=0
+11.7s video loadstart ct=0
+11.8s video seeking ct=8.21
+11.8s video canplay ct=8.21
+11.8s video playing ct=8.21
+39.3s video error ct=35.7 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+39.3s video pause ct=35.7 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+40.2s call load el=main-video_html5_api ct=35.7
+40.2s video emptied ct=0
+40.2s video loadstart ct=0
+40.2s video seeking ct=35.7
+40.3s video canplay ct=35.7
+40.3s video playing ct=35.7
+67.2s video error ct=62.56 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+67.2s video pause ct=62.56 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+68.9s call src= el=main-video_html5_api
+68.9s call load el=main-video_html5_api ct=0
+68.9s call load el=main-video_html5_api ct=0
+68.9s video emptied ct=0
+68.9s video loadstart ct=0
+70.6s video seeking ct=62.56
+71.2s runner user-play (player is paused after an error)
+71.2s video waiting ct=62.56
+71.4s video canplay ct=62.56
+71.4s video playing ct=62.56
+81.2s video error ct=72.31 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+81.2s video pause ct=72.31 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+84.5s call load el=main-video_html5_api ct=72.31
+84.5s video emptied ct=0
+84.5s video loadstart ct=0
+84.5s video seeking ct=72.31
+84.6s video canplay ct=72.31
+84.6s video playing ct=72.31
+114.8s video error ct=102.54 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+114.8s video pause ct=102.54 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+119.0s call load el=main-video_html5_api ct=102.54
+119.0s video emptied ct=0
+119.0s video loadstart ct=0
+119.0s video seeking ct=102.54
+119.0s video canplay ct=102.54
+119.0s video playing ct=102.54
+144.3s video error ct=127.82 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+144.3s video pause ct=127.82 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+148.4s runner user-play (player is paused after an error)
+148.4s video playing ct=127.82 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 153.3,
  "state": {
   "ct": 127.817875,
   "paused": false,
   "errorCounter": 6,
   "lastSuccessTime": 127.817875,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {}
 }
]
```
