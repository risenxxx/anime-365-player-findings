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
| перемотка не сработала | [] |
| сыграно / стояло, с | 125 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 4fw1vt, efs1bs, nfsgk1 |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=9, browserReq=9, install=1, activate=1, evaluated=3 |
| запросы к CDN | 20 ({"empty":20}; статусы {"206":20}; обрывов 0; 159.4 МБ; одновременно до 3) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s 4fw1vt [bench] SW script evaluated, instance=4fw1vt script=?24
+0.1s 4fw1vt [SW] Install event fired at 1792883170593
+0.1s 4fw1vt [SW] Activate event fired at 1792883170594
+87.7s efs1bs [bench] SW script evaluated, instance=efs1bs script=?24
+179.8s nfsgk1 [bench] SW script evaluated, instance=nfsgk1 script=?24
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
+88.0s runner mute
+88.7s video canplay ct=0
+89.3s runner play
+89.3s video playing ct=0
+94.3s runner seek 360
+94.3s video seeking ct=360
+94.3s video waiting ct=360
+95.1s video canplay ct=360
+95.1s video playing ct=360
+134.3s runner navigate
+179.8s runner navigate
+179.8s sw-target created
+179.9s call src= el=main-video_html5_api
+179.9s call load el=main-video_html5_api ct=0
+179.9s video emptied ct=0
+179.9s video loadstart ct=0
+180.0s runner mute
+180.8s video canplay ct=0
+181.3s runner play
+181.3s video playing ct=0
+186.3s runner seek 360
+186.3s video seeking ct=360
+186.3s video waiting ct=360
+186.3s video canplay ct=360
+186.3s video playing ct=360
+226.3s runner navigate
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
