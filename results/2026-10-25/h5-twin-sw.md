# h5-twin-sw: Под тем же m другой файл той же длины (SW, три открытия)

Гипотеза: **H5**. Вердикт: **воспроизведено**.

MEDIA_ERR_DECODE: 2; blacklist: 2; сбросов в начало: 2; экземпляры SW: 3; кэш после открытий: after open 1={"video-cache-meta":1,"video-cache-v1-bench-A":42}; after open 2={"video-cache-meta":1,"video-cache-v1-bench-A":58}; after open 3={"video-cache-meta":1,"video-cache-v1-bench-A":64}; end=null.

**Ожидалось:** Куски A из кэша смешиваются с B → ошибка декодирования → blacklist → с начала; при следующем открытии (после остановки SW) — снова.

**Что увидел пользователь:** ошибок <video>: 2 (коды 3×2); перезагрузок load() после старта: 6 (макс. 3/мин); сброс в начало после ошибки: 360→0 с; 360→0 с; сыграно 116 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** Открытие 1: файл A, 40 с игры (CDN 1 МБ/с), закрыть. CDN начинает отдавать B. Пауза 45 с (SW простаивает). Открытие 2 и 3: перемотка на 6:00, 40 с.

| метрика | значение |
|---|---|
| ошибки <video> | +94s code=3 ct=360<br>+185.3s code=3 ct=360 |
| load() после старта / src с &rand | 6 / 2 |
| сброс в начало | [{"t":94,"before":360,"after":0,"pausedAfter":false},{"t":185.3,"before":360,"after":0,"pausedAfter":false}] |
| прыжки назад | [] |
| сыграно / стояло, с | 116 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | xc34ix, w6hf83, vtudkb |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=5, readDied=1, browserReq=5, blacklistMsg=2, bypassBlacklisted=6, install=1, activate=1, evaluated=3 |
| запросы к CDN | 14 ({"empty":8,"video":6}; статусы {"206":14}; обрывов 0; 99.5 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.6s xc34ix [bench] SW script evaluated, instance=xc34ix script=?24
+0.6s xc34ix [SW] Install event fired at 1792879075002
+0.6s xc34ix [SW] Activate event fired at 1792879075003
+88.2s w6hf83 [bench] SW script evaluated, instance=w6hf83 script=?24
+94.0s w6hf83 [SW] Blacklisting mParam: bench-A
+94.0s w6hf83 [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 76677120 frontier= 76677120 err= dropped
+94.0s w6hf83 [SW] mParam bench-A is blacklisted, bypassing cache
+94.9s w6hf83 [SW] mParam bench-A is blacklisted, bypassing cache
+94.9s w6hf83 [SW] mParam bench-A is blacklisted, bypassing cache
+179.5s vtudkb [bench] SW script evaluated, instance=vtudkb script=?24
+185.3s vtudkb [SW] Blacklisting mParam: bench-A
+185.3s vtudkb [SW] mParam bench-A is blacklisted, bypassing cache
+186.2s vtudkb [SW] mParam bench-A is blacklisted, bypassing cache
+186.2s vtudkb [SW] mParam bench-A is blacklisted, bypassing cache
```

### Таймлайн

```
+0.5s runner navigate
+0.5s sw-target created
+0.6s page: controllerchange
+0.9s runner navigate
+1.0s call src= el=main-video_html5_api
+1.0s call load el=main-video_html5_api ct=0
+1.0s video emptied ct=0
+1.0s video loadstart ct=0
+1.2s runner mute
+2.1s video canplay ct=0
+2.7s runner play
+2.7s video playing ct=0
+42.7s runner navigate
+43.2s runner cdn-config {"throttleBps":1048576,"faults":[{"action":"file","name":"twin"}]}
+88.2s runner navigate
+88.2s sw-target created
+88.3s call src= el=main-video_html5_api
+88.3s call load el=main-video_html5_api ct=0
+88.3s video emptied ct=0
+88.3s video loadstart ct=0
+88.3s video canplay ct=0
+88.5s runner mute
+89.0s runner play
+89.0s video playing ct=0
+94.0s runner seek 360
+94.0s video seeking ct=360
+94.0s video waiting ct=360
+94.0s video error ct=360 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=350250667 duration=21333 size=339 is_key_frame=1 encrypted=0}"
+94.0s player: MEDIA_ERR_DECODE: Blacklisting mParam bench-A and retrying immediately
+94.0s video pause ct=360 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=350250667 duration=21333 size=339 is_key_frame=1 encrypted=0}"
+94.0s call src= el=main-video_html5_api +rand
+94.0s call load el=main-video_html5_api ct=0
+94.0s call load el=main-video_html5_api ct=0
+94.0s video emptied ct=0
+94.0s video loadstart ct=0
+94.9s video canplay ct=0
+99.0s runner user-play (player is paused after an error)
+99.0s video playing ct=0
+134.0s runner navigate
+179.5s runner navigate
+179.5s sw-target created
+179.6s call src= el=main-video_html5_api
+179.6s call load el=main-video_html5_api ct=0
+179.6s video emptied ct=0
+179.6s video loadstart ct=0
+179.6s video canplay ct=0
+179.8s runner mute
+180.3s runner play
+180.3s video playing ct=0
+185.3s runner seek 360
+185.3s video seeking ct=360
+185.3s video waiting ct=360
+185.3s video error ct=360 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=350250667 duration=21333 size=339 is_key_frame=1 encrypted=0}"
+185.3s player: MEDIA_ERR_DECODE: Blacklisting mParam bench-A and retrying immediately
+185.3s video pause ct=360 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=350250667 duration=21333 size=339 is_key_frame=1 encrypted=0}"
+185.3s call src= el=main-video_html5_api +rand
+185.3s call load el=main-video_html5_api ct=0
+185.3s call load el=main-video_html5_api ct=0
+185.3s video emptied ct=0
+185.3s video loadstart ct=0
+186.2s video canplay ct=0
+189.3s runner user-play (player is paused after an error)
+189.3s video playing ct=0
+225.3s runner navigate
```

### Снимки состояния

```json
[
 {
  "label": "after open 1",
  "t": 42.7,
  "state": {
   "ct": 39.961389,
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
  "t": 134,
  "state": {
   "ct": 34.946501,
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
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 58
  }
 },
 {
  "label": "after open 3",
  "t": 225.3,
  "state": {
   "ct": 35.95122,
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
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 64
  }
 },
 {
  "label": "end",
  "t": 225.8,
  "state": "Error: embed frame context not found",
  "cache": null
 }
]
```
