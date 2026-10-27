# h5-twin-sw: Под тем же m другой файл той же длины (SW, три открытия)

Гипотеза: **H5**. Вердикт: **частично**.

MEDIA_ERR_DECODE: 1; blacklist: 0; сбросов в начало: 0; экземпляры SW: 3; кэш после открытий: after open 1={"video-cache-meta":1,"video-cache-v1-bench-A":42}; after open 2={"video-cache-meta":0}; after open 3={"video-cache-meta":1,"video-cache-v1-bench-A":45}; end=null.

**Ожидалось:** Куски A из кэша смешиваются с B → ошибка декодирования → blacklist → с начала; при следующем открытии (после остановки SW) — снова.

**Что увидел пользователь:** ошибок <video>: 1 (коды 3×1); перезагрузок load() после старта: 4 (макс. 3/мин); сыграно 123 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** Открытие 1: файл A, 40 с игры (CDN 1 МБ/с), закрыть. CDN начинает отдавать B. Пауза 45 с (SW простаивает). Открытие 2 и 3: перемотка на 6:00, 40 с.

| метрика | значение |
|---|---|
| ошибки <video> | +93.5s code=3 ct=360 |
| load() после старта / src с &rand | 4 / 1 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 123 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | q1calr, 7aylu8, 4hj95n |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=7, browserReq=7, blacklistMsg=1, bypassBlacklisted=4, install=1, activate=1, evaluated=3 |
| запросы к CDN | 15 ({"empty":11,"video":4}; статусы {"206":15}; обрывов 0; 128.3 МБ; одновременно до 3) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s q1calr [bench] SW script evaluated, instance=q1calr script=?27
+0.1s q1calr [SW] Install event fired at 1793116284563
+0.1s q1calr [SW] Activate event fired at 1793116284566
+87.7s 7aylu8 [bench] SW script evaluated, instance=7aylu8 script=?27
+93.5s 7aylu8 [SW] Blacklisting mParam: bench-A
+93.5s 7aylu8 [SW] mParam bench-A is blacklisted, bypassing cache
+94.4s 7aylu8 [SW] mParam bench-A is blacklisted, bypassing cache
+94.4s 7aylu8 [SW] mParam bench-A is blacklisted, bypassing cache
+94.4s 7aylu8 [SW] mParam bench-A is blacklisted, bypassing cache
+179.0s 4hj95n [bench] SW script evaluated, instance=4hj95n script=?27
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
+1.6s video canplay ct=0
+2.2s runner play
+2.2s video playing ct=0
+42.2s runner navigate
+42.7s runner cdn-config {"throttleBps":1048576,"faults":[{"action":"file","name":"twin"}]}
+87.7s runner navigate
+87.7s sw-target created
+87.8s call src= el=main-video_html5_api
+87.8s call load el=main-video_html5_api ct=0
+87.8s video emptied ct=0
+87.8s video loadstart ct=0
+87.8s video canplay ct=0
+88.0s runner mute
+88.5s runner play
+88.5s video playing ct=0
+93.5s runner seek 360
+93.5s video seeking ct=360
+93.5s video waiting ct=360
+93.5s video error ct=360 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=350250667 duration=21333 size=339 is_key_frame=1 encrypted=0}"
+93.5s video pause ct=360 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=350250667 duration=21333 size=339 is_key_frame=1 encrypted=0}"
+93.5s call src= el=main-video_html5_api +rand
+93.5s call load el=main-video_html5_api ct=0
+93.5s call load el=main-video_html5_api ct=0
+93.5s video emptied ct=0
+93.5s video loadstart ct=0
+94.4s video seeking ct=360
+95.2s video canplay ct=360
+95.2s video playing ct=360
+133.5s runner navigate
+179.0s runner navigate
+179.0s sw-target created
+179.1s call src= el=main-video_html5_api
+179.1s call load el=main-video_html5_api ct=0
+179.1s video emptied ct=0
+179.1s video loadstart ct=0
+179.3s runner mute
+180.0s video canplay ct=0
+180.5s runner play
+180.5s video playing ct=0
+185.5s runner seek 360
+185.5s video seeking ct=360
+185.5s video waiting ct=360
+186.4s video canplay ct=360
+186.4s video playing ct=360
+225.6s runner navigate
```

### Снимки состояния

```json
[
 {
  "label": "after open 1",
  "t": 42.6,
  "state": {
   "ct": 39.957379,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 42
  }
 },
 {
  "label": "after open 2",
  "t": 133.9,
  "state": {
   "ct": 398.220971,
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
 },
 {
  "label": "after open 3",
  "t": 225.9,
  "state": {
   "ct": 399.140022,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 45
  }
 },
 {
  "label": "end",
  "t": 226.5,
  "state": "Error: embed frame context not found",
  "cache": null
 }
]
```
