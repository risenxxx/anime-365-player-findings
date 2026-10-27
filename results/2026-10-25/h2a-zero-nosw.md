# h2a-zero-nosw: Ошибка на 0:00 до старта, затем ошибка на ~1:30 (nosw)

Гипотеза: **H2a**. Вердикт: **не воспроизводится**.

Ошибок: 1, но позиция восстановлена (последняя ct=118.88).

**Ожидалось:** Первая ошибка при ct=0 оставляет lastSuccessTime=0; вторая ошибка не восстанавливает позицию → серия с начала, на паузе.

**Что увидел пользователь:** ошибок <video>: 1 (коды 2×1); перезагрузок load() после старта: 1 (макс. 1/мин); сыграно 118 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с. Пока плеер на паузе до старта (preload), ответ обрывается и следующие 5 с все запросы получают 503 → ошибка при ct=0; пользователь жмёт Play. В +95 с тот же сбой.

| метрика | значение |
|---|---|
| ошибки <video> | +17s code=2 ct=0 |
| load() после старта / src с &rand | 1 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 118 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | sbv7ju |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=4, install=1, activate=1, evaluated=1 |
| запросы к CDN | 4 ({"video":4}; статусы {"206":3,"503":1}; обрывов 2; 34.9 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s sbv7ju [bench] SW script evaluated, instance=sbv7ju script=?24
+0.1s sbv7ju [SW] Install event fired at 1792878214669
+0.1s sbv7ju [SW] Activate event fired at 1792878214669
+0.5s sbv7ju [SW] Video caching disabled, bypassing SW
+5.3s sbv7ju [SW] Video caching disabled, bypassing SW
+17.5s sbv7ju [SW] Video caching disabled, bypassing SW
+110.2s sbv7ju [SW] Video caching disabled, bypassing SW
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
+5.0s runner cdn-cut {"dest":"all","cut":1}
+17.0s runner play
+17.0s video playing ct=0
+17.0s video error ct=0 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+17.0s player: Error #2: A network error caused the video download to fail part-way.
+17.0s player: Current time:  0.004709
+17.0s video pause ct=0 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+17.5s call load el=main-video_html5_api ct=0
+17.5s video emptied ct=0
+17.5s video loadstart ct=0
+17.5s video canplay ct=0
+17.5s video seeking ct=0
+17.5s video waiting ct=0
+17.5s video canplay ct=0.01
+17.5s video playing ct=0.01
+97.0s runner cdn-cut {"dest":"all","cut":1}
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 137.4,
  "state": {
   "ct": 119.407332,
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
