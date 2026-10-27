# h5-twin-sw: Под тем же m другой файл той же длины (SW, три открытия)

Гипотеза: **H5**. Вердикт: **воспроизведено**.

MEDIA_ERR_DECODE: 2; blacklist: 2; сбросов в начало: 2; экземпляры SW: 3; кэш после открытий: after open 1={"video-cache-meta":1,"video-cache-v1-bench-A":42}; after open 2={"video-cache-meta":1,"video-cache-v1-bench-A":58}; after open 3={"video-cache-meta":1,"video-cache-v1-bench-A":64}; end=null.

**Ожидалось:** Куски A из кэша смешиваются с B → ошибка декодирования → blacklist → с начала; при следующем открытии (после остановки SW) — снова.

**Что увидел пользователь:** ошибок <video>: 2 (коды 3×2); перезагрузок load() после старта: 6 (макс. 3/мин); сброс в начало после ошибки: 360→0 с; 360→0 с; **перемотка не сработала**: на 360 с → 2 с; на 360 с → 3 с; сыграно 116 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** Открытие 1: файл A, 40 с игры (CDN 1 МБ/с), закрыть. CDN начинает отдавать B. Пауза 45 с (SW простаивает). Открытие 2 и 3: перемотка на 6:00, 40 с.

| метрика | значение |
|---|---|
| ошибки <video> | +93.5s code=3 ct=360<br>+184.8s code=3 ct=360 |
| load() после старта / src с &rand | 6 / 2 |
| сброс в начало | [{"t":93.5,"before":360,"after":0,"pausedAfter":false},{"t":184.8,"before":360,"after":0,"pausedAfter":false}] |
| прыжки назад | [] |
| перемотка не сработала | [{"t":93.5,"target":360,"got":2.2},{"t":184.8,"target":360,"got":3.2}] |
| сыграно / стояло, с | 116 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | xc34ix, w6hf83, vtudkb |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=5, readDied=1, browserReq=5, blacklistMsg=2, bypassBlacklisted=6, install=1, activate=1, evaluated=3 |
| запросы к CDN | 14 ({"empty":8,"video":6}; статусы {"206":14}; обрывов 0; 99.5 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s xc34ix [bench] SW script evaluated, instance=xc34ix script=?24
+0.1s xc34ix [SW] Install event fired at 1792879075002
+0.1s xc34ix [SW] Activate event fired at 1792879075003
+87.7s w6hf83 [bench] SW script evaluated, instance=w6hf83 script=?24
+93.5s w6hf83 [SW] Blacklisting mParam: bench-A
+93.5s w6hf83 [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 76677120 frontier= 76677120 err= dropped
+93.5s w6hf83 [SW] mParam bench-A is blacklisted, bypassing cache
+94.4s w6hf83 [SW] mParam bench-A is blacklisted, bypassing cache
+94.4s w6hf83 [SW] mParam bench-A is blacklisted, bypassing cache
+179.0s vtudkb [bench] SW script evaluated, instance=vtudkb script=?24
+184.8s vtudkb [SW] Blacklisting mParam: bench-A
+184.8s vtudkb [SW] mParam bench-A is blacklisted, bypassing cache
+185.7s vtudkb [SW] mParam bench-A is blacklisted, bypassing cache
+185.7s vtudkb [SW] mParam bench-A is blacklisted, bypassing cache
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
+93.5s player: MEDIA_ERR_DECODE: Blacklisting mParam bench-A and retrying immediately
+93.5s video pause ct=360 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=350250667 duration=21333 size=339 is_key_frame=1 encrypted=0}"
+93.5s call src= el=main-video_html5_api +rand
+93.5s call load el=main-video_html5_api ct=0
+93.5s call load el=main-video_html5_api ct=0
+93.5s video emptied ct=0
+93.5s video loadstart ct=0
+94.4s video canplay ct=0
+98.5s runner user-play (player is paused after an error)
+98.5s video playing ct=0
+133.5s runner navigate
+179.0s runner navigate
+179.0s sw-target created
+179.1s call src= el=main-video_html5_api
+179.1s call load el=main-video_html5_api ct=0
+179.1s video emptied ct=0
+179.1s video loadstart ct=0
+179.1s video canplay ct=0
+179.3s runner mute
+179.8s runner play
+179.8s video playing ct=0
+184.8s runner seek 360
+184.8s video seeking ct=360
+184.8s video waiting ct=360
+184.8s video error ct=360 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=350250667 duration=21333 size=339 is_key_frame=1 encrypted=0}"
+184.8s player: MEDIA_ERR_DECODE: Blacklisting mParam bench-A and retrying immediately
+184.8s video pause ct=360 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=350250667 duration=21333 size=339 is_key_frame=1 encrypted=0}"
+184.8s call src= el=main-video_html5_api +rand
+184.8s call load el=main-video_html5_api ct=0
+184.8s call load el=main-video_html5_api ct=0
+184.8s video emptied ct=0
+184.8s video loadstart ct=0
+185.7s video canplay ct=0
+188.8s runner user-play (player is paused after an error)
+188.8s video playing ct=0
+224.8s runner navigate
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
