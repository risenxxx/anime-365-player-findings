# control-sw: Контроль: без сбоев, SW singlethread

Гипотеза: **контроль**. Вердикт: **стенд работает** (код с патчами: all).

serve enter: 3; записей в кэше: 295; прямых запросов <video> к CDN: 0; ошибок: 0.

**Ожидалось:** Игра без ошибок <video>; запросы <video> идут через SW (на CDN только dest=empty), в логах SW есть `serve enter`, появляется кэш video-cache-v1-<m>.

**Что увидел пользователь:** ошибок <video> нет; сыграно 108 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** Старт, 60 с игры, перемотка на 10:00, 30 с, перемотка на 5:00, 20 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 108 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | z2jdy2 |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=3, browserReq=3, install=1, activate=1, evaluated=1 |
| запросы к CDN | 3 ({"empty":3}; статусы {"206":3}; обрывов 0; 295.2 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.6s z2jdy2 [bench] SW script evaluated, instance=z2jdy2 script=?24
+0.6s z2jdy2 [SW] Install event fired at 1792880793191
+0.6s z2jdy2 [SW] Activate event fired at 1792880793193
```

### Таймлайн

```
+0.5s runner navigate
+0.6s sw-target created
+0.6s page: controllerchange
+0.9s runner navigate
+1.0s call src= el=main-video_html5_api
+1.0s call load el=main-video_html5_api ct=0
+1.0s video emptied ct=0
+1.0s video loadstart ct=0
+1.2s runner mute
+1.4s video canplay ct=0
+1.9s runner play
+1.9s video playing ct=0
+61.9s runner seek 600
+62.0s video seeking ct=600
+62.0s video waiting ct=600
+62.0s video canplay ct=600
+62.0s video playing ct=600
+92.0s runner seek 300
+92.0s video seeking ct=300
+92.0s video waiting ct=300
+92.0s video canplay ct=300
+92.0s video playing ct=300
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 112,
  "state": {
   "ct": 319.899586,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 319.870336,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 2,
   "video-cache-v1-bench-A": 295
  }
 }
]
```
