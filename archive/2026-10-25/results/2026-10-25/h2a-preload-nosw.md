# h2a-preload-nosw: Ошибка во время preload (ct=0), затем ошибка на ~1:30 (без SW)

Гипотеза: **H2a**. Вердикт: **не воспроизводится**.

Ошибок: 2, но позиция восстановлена (последняя ct=138.07).

**Ожидалось:** Первая ошибка при ct=0 оставляет lastSuccessTime=0 навсегда; после второй ошибки позиция не восстанавливается → серия с начала, плеер на паузе.

**Что увидел пользователь:** ошибок <video>: 2 (коды 2×2); перезагрузок load() после старта: 2 (макс. 1/мин); сыграно 136 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с. Первый ответ обрывается на 1.5 МБ (preload, до Play), следующий запрос → 503. «Пользователь» жмёт Play. В +95 с обрыв, первый запрос после него → 503.

| метрика | значение |
|---|---|
| ошибки <video> | +15s code=2 ct=0.01<br>+115.3s code=2 ct=99.75 |
| load() после старта / src с &rand | 2 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 136 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | wc2cvh |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=7, install=1, activate=1, evaluated=1 |
| запросы к CDN | 5 ({"video":5}; статусы {"206":3,"503":2}; обрывов 2; 40.9 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s wc2cvh [bench] SW script evaluated, instance=wc2cvh script=?24
+0.1s wc2cvh [SW] Install event fired at 1792878354363
+0.1s wc2cvh [SW] Activate event fired at 1792878354365
+0.5s wc2cvh [SW] Video caching disabled, bypassing SW
+3.4s wc2cvh [SW] Video caching disabled, bypassing SW
+15.5s wc2cvh [SW] Video caching disabled, bypassing SW
+115.2s wc2cvh [SW] Video caching disabled, bypassing SW
+115.8s wc2cvh [SW] Video caching disabled, bypassing SW
+115.9s wc2cvh [SW] Video caching disabled, bypassing SW
+115.9s wc2cvh [SW] Video caching disabled, bypassing SW
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
+15.0s player: Current time:  0.000073
+15.0s video pause ct=0.01 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+15.5s call load el=main-video_html5_api ct=0.01
+15.5s video emptied ct=0
+15.5s video loadstart ct=0
+15.5s video canplay ct=0
+15.5s video seeking ct=0
+15.5s video waiting ct=0
+15.5s video canplay ct=0
+15.5s video playing ct=0
+95.0s runner cdn-cut {"dest":"all","cut":1}
+115.3s video error ct=99.75 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+115.3s player: Error #2: A network error caused the video download to fail part-way.
+115.3s player: Current time:  99.562502
+115.3s video pause ct=99.75 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+115.8s call load el=main-video_html5_api ct=99.75
+115.8s video emptied ct=0
+115.8s video loadstart ct=0
+115.9s video canplay ct=0
+115.9s video seeking ct=99.56
+115.9s video waiting ct=99.56
+115.9s video canplay ct=99.56
+115.9s video playing ct=99.56
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 155.5,
  "state": {
   "ct": 138.590492,
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
