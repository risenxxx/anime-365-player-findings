# h5-twin-sw: Под тем же m другой файл той же длины (SW, три открытия)

Гипотеза: **H5**. Вердикт: **не воспроизводится** (код с патчами: all).

MEDIA_ERR_DECODE: 0; blacklist: 0; сбросов в начало: 0; экземпляры SW: 3; кэш после открытий: after open 1={"video-cache-meta":2,"video-cache-v1-bench-A":42}; after open 2={"video-cache-meta":2,"video-cache-v1-bench-A":45}; after open 3={"video-cache-meta":2,"video-cache-v1-bench-A":100}; end=null.

**Ожидалось:** Куски A из кэша смешиваются с B → ошибка декодирования → blacklist → с начала; при следующем открытии (после остановки SW) — снова.

**Что увидел пользователь:** ошибок <video> нет; перезагрузок load() после старта: 2 (макс. 1/мин); сыграно 125 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** Открытие 1: файл A, 40 с игры (CDN 1 МБ/с), закрыть. CDN начинает отдавать B. Пауза 45 с (SW простаивает). Открытие 2 и 3: перемотка на 6:00, 40 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 2 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 125 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 4fw1vt, efs1bs, nfsgk1 |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=9, browserReq=9, install=1, activate=1, evaluated=3 |
| запросы к CDN | 20 ({"empty":20}; статусы {"206":20}; обрывов 0; 159.4 МБ; одновременно до 3) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.5s 4fw1vt [bench] SW script evaluated, instance=4fw1vt script=?24
+0.5s 4fw1vt [SW] Install event fired at 1792883170593
+0.5s 4fw1vt [SW] Activate event fired at 1792883170594
+88.2s efs1bs [bench] SW script evaluated, instance=efs1bs script=?24
+180.2s nfsgk1 [bench] SW script evaluated, instance=nfsgk1 script=?24
```

### Таймлайн

```
+0.5s runner navigate
+0.5s sw-target created
+0.5s page: controllerchange
+0.9s runner navigate
+1.0s call src= el=main-video_html5_api
+1.0s call load el=main-video_html5_api ct=0
+1.0s video emptied ct=0
+1.0s video loadstart ct=0
+1.1s runner mute
+2.1s video canplay ct=0
+2.6s runner play
+2.6s video playing ct=0
+42.7s runner navigate
+43.2s runner cdn-config {"throttleBps":1048576,"faults":[{"action":"file","name":"twin"}]}
+88.2s runner navigate
+88.2s sw-target created
+88.2s call src= el=main-video_html5_api
+88.2s call load el=main-video_html5_api ct=0
+88.2s video emptied ct=0
+88.2s video loadstart ct=0
+88.4s runner mute
+89.2s video canplay ct=0
+89.7s runner play
+89.7s video playing ct=0
+94.7s runner seek 360
+94.7s video seeking ct=360
+94.7s video waiting ct=360
+95.5s video canplay ct=360
+95.5s video playing ct=360
+134.7s runner navigate
+180.2s runner navigate
+180.2s sw-target created
+180.3s call src= el=main-video_html5_api
+180.3s call load el=main-video_html5_api ct=0
+180.3s video emptied ct=0
+180.3s video loadstart ct=0
+180.5s runner mute
+181.2s video canplay ct=0
+181.7s runner play
+181.7s video playing ct=0
+186.7s runner seek 360
+186.7s video seeking ct=360
+186.7s video waiting ct=360
+186.8s video canplay ct=360
+186.8s video playing ct=360
+226.7s runner navigate
```

### Снимки состояния

```json
[
 {
  "label": "after open 1",
  "t": 42.6,
  "state": {
   "ct": 39.961143,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 39.788097,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 2,
   "video-cache-v1-bench-A": 42
  }
 },
 {
  "label": "after open 2",
  "t": 134.7,
  "state": {
   "ct": 399.114272,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 398.990756,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 2,
   "video-cache-v1-bench-A": 45
  }
 },
 {
  "label": "after open 3",
  "t": 226.7,
  "state": {
   "ct": 399.931264,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 399.789074,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 2,
   "video-cache-v1-bench-A": 100
  }
 },
 {
  "label": "end",
  "t": 227.3,
  "state": "Error: embed frame context not found",
  "cache": null
 }
]
```
