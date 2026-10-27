# h2a-preload-nosw: Ошибка во время preload (ct=0), затем ошибка на ~1:30 (без SW)

Гипотеза: **H2a**. Вердикт: **не воспроизводится**.

Ошибок: 1, но позиция восстановлена (последняя ct=138.87).

**Ожидалось:** Первая ошибка при ct=0 оставляет lastSuccessTime=0 навсегда; после второй ошибки позиция не восстанавливается → серия с начала, плеер на паузе.

**Что увидел пользователь:** ошибок <video>: 1 (коды 2×1); перезагрузок load() после старта: 1 (макс. 1/мин); сыграно 138 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с. Первый ответ обрывается на 1.5 МБ (preload, до Play), следующий запрос → 503. «Пользователь» жмёт Play. В +95 с обрыв, первый запрос после него → 503.

| метрика | значение |
|---|---|
| ошибки <video> | +15s code=2 ct=0.02 |
| load() после старта / src с &rand | 1 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 138 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 7g4z29 |
| DevTools подключались к SW | нет |
| строки SW | install=1, activate=1, evaluated=1 |
| запросы к CDN | 5 ({"empty":5}; статусы {"206":3,"503":2}; обрывов 2; 38.1 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s 7g4z29 [bench] SW script evaluated, instance=7g4z29 script=?27
+0.1s 7g4z29 [SW] Install event fired at 1793115564394
+0.1s 7g4z29 [SW] Activate event fired at 1793115564394
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
+15.0s video playing ct=0
+15.0s video error ct=0.02 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+15.0s video pause ct=0.02 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+15.6s call load el=main-video_html5_api ct=0.02
+15.6s video emptied ct=0
+15.6s video loadstart ct=0
+15.6s video seeking ct=0.02
+15.6s video canplay ct=0.02
+15.6s video playing ct=0.02
+95.0s runner cdn-cut {"dest":"all","cut":1}
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 155.4,
  "state": {
   "ct": 139.37463,
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
