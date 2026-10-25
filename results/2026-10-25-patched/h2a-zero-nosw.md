# h2a-zero-nosw: Ошибка на 0:00 до старта, затем ошибка на ~1:30 (nosw)

Гипотеза: **H2a**. Вердикт: **не воспроизводится** (код с патчами: all).

Ошибок: 1, но позиция восстановлена (последняя ct=114.42).

**Ожидалось:** Первая ошибка при ct=0 оставляет lastSuccessTime=0; вторая ошибка не восстанавливает позицию → серия с начала, на паузе.

**Что увидел пользователь:** ошибок <video>: 1 (коды 2×1); перезагрузок load() после старта: 1 (макс. 1/мин); сыграно 114 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с. Пока плеер на паузе до старта (preload), ответ обрывается и следующие 5 с все запросы получают 503 → ошибка при ct=0; пользователь жмёт Play. В +95 с тот же сбой.

| метрика | значение |
|---|---|
| ошибки <video> | +17.4s code=2 ct=0 |
| load() после старта / src с &rand | 1 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 114 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | ic93ae |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=4, install=1, activate=1, evaluated=1 |
| запросы к CDN | 4 ({"video":4}; статусы {"206":3,"503":1}; обрывов 2; 35 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.5s ic93ae [bench] SW script evaluated, instance=ic93ae script=?24
+0.5s ic93ae [SW] Install event fired at 1792882310611
+0.5s ic93ae [SW] Activate event fired at 1792882310613
+0.9s ic93ae [SW] Video caching disabled, bypassing SW
+5.7s ic93ae [SW] Video caching disabled, bypassing SW
+17.9s ic93ae [SW] Video caching disabled, bypassing SW
+114.9s ic93ae [SW] Video caching disabled, bypassing SW
```

### Таймлайн

```
+0.4s runner navigate
+0.5s sw-target created
+0.5s page: controllerchange
+0.9s runner navigate
+0.9s call src= el=main-video_html5_api
+0.9s call load el=main-video_html5_api ct=0
+0.9s video emptied ct=0
+0.9s video loadstart ct=0
+1.1s runner mute
+2.7s video canplay ct=0
+5.4s runner cdn-cut {"dest":"all","cut":1}
+17.4s runner play
+17.4s video playing ct=0
+17.4s video error ct=0 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+17.4s player: Error #2: A network error caused the video download to fail part-way.
+17.4s player: Current time:  null
+17.4s video pause ct=0 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+17.9s call load el=main-video_html5_api ct=0
+17.9s video emptied ct=0
+17.9s video loadstart ct=0
+17.9s video canplay ct=0
+22.4s runner user-play (player is paused after an error)
+22.4s video playing ct=0
+97.4s runner cdn-cut {"dest":"all","cut":1}
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 137.4,
  "state": {
   "ct": 114.955207,
   "paused": false,
   "errorCounter": 1,
   "lastSuccessTime": 114.708103,
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
