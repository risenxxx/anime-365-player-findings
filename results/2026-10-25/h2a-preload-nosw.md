# h2a-preload-nosw: Ошибка во время preload (ct=0), затем ошибка на ~1:30 (без SW)

Гипотеза: **H2a**. Вердикт: **не воспроизводится**.

Ошибок: 2, но позиция восстановлена (последняя ct=138.07).

**Ожидалось:** Первая ошибка при ct=0 оставляет lastSuccessTime=0 навсегда; после второй ошибки позиция не восстанавливается → серия с начала, плеер на паузе.

**Что увидел пользователь:** ошибок <video>: 2 (коды 2×2); перезагрузок load() после старта: 2 (макс. 1/мин); сыграно 136 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с. Первый ответ обрывается на 1.5 МБ (preload, до Play), следующий запрос → 503. «Пользователь» жмёт Play. В +95 с обрыв, первый запрос после него → 503.

| метрика | значение |
|---|---|
| ошибки <video> | +15.5s code=2 ct=0.01<br>+115.8s code=2 ct=99.75 |
| load() после старта / src с &rand | 2 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 136 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | wc2cvh |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=7, install=1, activate=1, evaluated=1 |
| запросы к CDN | 5 ({"video":5}; статусы {"206":3,"503":2}; обрывов 2; 40.9 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.6s wc2cvh [bench] SW script evaluated, instance=wc2cvh script=?24
+0.6s wc2cvh [SW] Install event fired at 1792878354363
+0.6s wc2cvh [SW] Activate event fired at 1792878354365
+1.0s wc2cvh [SW] Video caching disabled, bypassing SW
+3.9s wc2cvh [SW] Video caching disabled, bypassing SW
+16.0s wc2cvh [SW] Video caching disabled, bypassing SW
+115.7s wc2cvh [SW] Video caching disabled, bypassing SW
+116.3s wc2cvh [SW] Video caching disabled, bypassing SW
+116.4s wc2cvh [SW] Video caching disabled, bypassing SW
+116.4s wc2cvh [SW] Video caching disabled, bypassing SW
```

### Таймлайн

```
+0.5s runner navigate
+0.6s sw-target created
+0.6s page: controllerchange
+1.0s runner navigate
+1.0s call src= el=main-video_html5_api
+1.0s call load el=main-video_html5_api ct=0
+1.0s video emptied ct=0
+1.0s video loadstart ct=0
+1.2s runner mute
+2.8s video canplay ct=0
+15.5s runner play
+15.5s video playing ct=0.01
+15.5s video error ct=0.01 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+15.5s player: Error #2: A network error caused the video download to fail part-way.
+15.5s player: Current time:  0.000073
+15.5s video pause ct=0.01 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+16.0s call load el=main-video_html5_api ct=0.01
+16.0s video emptied ct=0
+16.0s video loadstart ct=0
+16.0s video canplay ct=0
+16.0s video seeking ct=0
+16.0s video waiting ct=0
+16.0s video canplay ct=0
+16.0s video playing ct=0
+95.5s runner cdn-cut {"dest":"all","cut":1}
+115.8s video error ct=99.75 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+115.8s player: Error #2: A network error caused the video download to fail part-way.
+115.8s player: Current time:  99.562502
+115.8s video pause ct=99.75 code=2 "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: data source error"
+116.3s call load el=main-video_html5_api ct=99.75
+116.3s video emptied ct=0
+116.3s video loadstart ct=0
+116.4s video canplay ct=0
+116.4s video seeking ct=99.56
+116.4s video waiting ct=99.56
+116.4s video canplay ct=99.56
+116.4s video playing ct=99.56
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
