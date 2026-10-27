# h1-outage-nosw: Обрыв через 6 МБ + 5 с отказа CDN (503) (nosw)

Гипотеза: **H1**. Вердикт: **воспроизведено**.

6 ошибок <video> подряд, после каждой load() и снова playing (playing: 6); счётчик errorCounter сбрасывается, notifyBroken не вызван ни разу.

**Ожидалось:** Отказ длиннее повторов serve() и медиастека Chrome → ошибка <video> → load() через 500 мс → playing обнуляет errorCounter → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video>: 6 (коды 2×4, 4×2); перезагрузок load() после старта: 8 (макс. 8/мин); прыжков назад >5 с: 1; сыграно 102 с, стояло 30 с; notifyBroken: 0; **цикл ошибок без notifyBroken**.

**Сценарий:** CDN 600 КБ/с; каждый ответ обрывается после 6 МБ тела, следующие 5 с все медиазапросы получают 503 (с CORS). 150 с игры; «пользователь» жмёт Play, если плеер встал после ошибки.

| метрика | значение |
|---|---|
| ошибки <video> | +11.2s code=2 ct=8.18<br>+12.4s code=2 ct=8.85<br>+13.4s code=2 ct=8.85<br>+15s code=4 ct=0<br>+15s code=4 ct=0<br>+30.3s code=2 ct=14.61 |
| load() после старта / src с &rand | 8 / 1 |
| сброс в начало | [] |
| прыжки назад | [{"t":15.5,"from":8.85,"to":0}] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 102 / 30 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | qxpd9t |
| DevTools подключались к SW | нет |
| строки SW | blacklistMsg=1, bypassBlacklisted=8, install=1, activate=1, evaluated=1 |
| запросы к CDN | 12 ({"empty":5,"video":7}; статусы {"206":6,"503":6}; обрывов 6; 36 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s qxpd9t [bench] SW script evaluated, instance=qxpd9t script=?27
+0.1s qxpd9t [SW] Install event fired at 1793114913936
+0.1s qxpd9t [SW] Activate event fired at 1793114913938
+15.0s qxpd9t [SW] Blacklisting mParam: bench-A
+15.0s qxpd9t [SW] mParam bench-A is blacklisted, bypassing cache
+19.6s qxpd9t [SW] mParam bench-A is blacklisted, bypassing cache
+30.2s qxpd9t [SW] mParam bench-A is blacklisted, bypassing cache
+62.3s qxpd9t [SW] mParam bench-A is blacklisted, bypassing cache
+62.4s qxpd9t [SW] mParam bench-A is blacklisted, bypassing cache
+82.5s qxpd9t [SW] mParam bench-A is blacklisted, bypassing cache
+112.8s qxpd9t [SW] mParam bench-A is blacklisted, bypassing cache
+138.7s qxpd9t [SW] mParam bench-A is blacklisted, bypassing cache
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
+11.2s video error ct=8.18 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+11.2s video pause ct=8.18 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+11.7s call load el=main-video_html5_api ct=8.18
+11.7s video emptied ct=0
+11.7s video loadstart ct=0
+11.7s video seeking ct=8.18
+11.7s video canplay ct=8.18
+11.7s video playing ct=8.18
+12.4s video error ct=8.85 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+12.4s video pause ct=8.85 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+13.3s call load el=main-video_html5_api ct=8.85
+13.3s video emptied ct=0
+13.3s video loadstart ct=0
+13.3s video seeking ct=8.85
+13.4s video canplay ct=8.85
+13.4s video playing ct=8.85
+13.4s video error ct=8.85 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+13.4s video pause ct=8.85 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+15.0s call src= el=main-video_html5_api
+15.0s call load el=main-video_html5_api ct=0
+15.0s call load el=main-video_html5_api ct=0
+15.0s video emptied ct=0
+15.0s video loadstart ct=0
+15.0s video error ct=0 code=4 "MEDIA_ELEMENT_ERROR: Format error"
+15.0s call src= el=main-video_html5_api +rand
+15.0s call load el=main-video_html5_api ct=0
+15.0s call load el=main-video_html5_api ct=0
+15.0s video emptied ct=0
+15.0s video loadstart ct=0
+15.0s video error ct=0 code=4 "MEDIA_ELEMENT_ERROR: Format error"
+19.0s runner user-play (player is paused after an error)
+19.6s call load el=main-video_html5_api ct=0
+19.6s video emptied ct=0
+19.6s video loadstart ct=0
+20.0s runner user-play (player is paused after an error)
+20.0s video waiting ct=0
+21.2s video seeking ct=8.85
+24.5s video canplay ct=8.86
+24.5s video playing ct=8.86
+30.3s video error ct=14.61 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+30.3s video pause ct=14.61 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+35.1s runner user-play (player is paused after an error)
+35.1s video playing ct=14.61 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+62.3s call load el=main-video_html5_api ct=14.61
+62.3s video emptied ct=0
+62.3s video loadstart ct=0
+62.4s video seeking ct=14.61
+62.4s video canplay ct=14.61
+62.4s video playing ct=14.61
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 153.4,
  "state": {
   "ct": 105.158509,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [
    "bench-A"
   ],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 0
  }
 }
]
```
