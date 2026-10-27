# h2a-preload-nosw: Ошибка во время preload (ct=0), затем ошибка на ~1:30 (без SW)

Гипотеза: **H2a**. Вердикт: **не воспроизводится** (код с патчами: all).

Ошибок: 1, но позиция восстановлена (последняя ct=134.43).

**Ожидалось:** Первая ошибка при ct=0 оставляет lastSuccessTime=0 навсегда; после второй ошибки позиция не восстанавливается → серия с начала, плеер на паузе.

**Что увидел пользователь:** ошибок <video>: 1 (коды 2×1); перезагрузок load() после старта: 1 (макс. 1/мин); сыграно 134 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с. Первый ответ обрывается на 1.5 МБ (preload, до Play), следующий запрос → 503. «Пользователь» жмёт Play. В +95 с обрыв, первый запрос после него → 503.

| метрика | значение |
|---|---|
| ошибки <video> | +15s code=2 ct=0.01 |
| load() после старта / src с &rand | 1 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 134 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | wr0q7k |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=5, install=1, activate=1, evaluated=1 |
| запросы к CDN | 5 ({"video":5}; статусы {"206":3,"503":2}; обрывов 2; 38.8 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s wr0q7k [bench] SW script evaluated, instance=wr0q7k script=?24
+0.1s wr0q7k [SW] Install event fired at 1792882450247
+0.1s wr0q7k [SW] Activate event fired at 1792882450249
+0.5s wr0q7k [SW] Video caching disabled, bypassing SW
+3.4s wr0q7k [SW] Video caching disabled, bypassing SW
+15.5s wr0q7k [SW] Video caching disabled, bypassing SW
+125.3s wr0q7k [SW] Video caching disabled, bypassing SW
+130.9s wr0q7k [SW] Video caching disabled, bypassing SW
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
+15.0s runner play
+15.0s video playing ct=0.01
+15.0s video error ct=0.01 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+15.0s player: Error #2: A network error caused the video download to fail part-way.
+15.0s player: Current time:  null
+15.0s video pause ct=0.01 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+15.5s call load el=main-video_html5_api ct=0.01
+15.5s video emptied ct=0
+15.5s video loadstart ct=0
+15.5s video canplay ct=0
+20.0s runner user-play (player is paused after an error)
+20.0s video playing ct=0
+95.0s runner cdn-cut {"dest":"all","cut":1}
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 155.4,
  "state": {
   "ct": 134.887015,
   "paused": false,
   "errorCounter": 1,
   "lastSuccessTime": 134.879549,
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
