# control-sw: Контроль: без сбоев, SW singlethread

Гипотеза: **контроль**. Вердикт: **стенд работает**.

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
| экземпляры SW (по обёртке логов) | aoy0b0 |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=3, browserReq=3, install=1, activate=1, evaluated=1 |
| запросы к CDN | 3 ({"empty":3}; статусы {"206":3}; обрывов 0; 295.2 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.5s aoy0b0 [bench] SW script evaluated, instance=aoy0b0 script=?24
+0.5s aoy0b0 [SW] Install event fired at 1792876697086
+0.5s aoy0b0 [SW] Activate event fired at 1792876697087
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
+1.4s video canplay ct=0
+1.9s runner play
+1.9s video playing ct=0
+61.9s runner seek 600
+61.9s video seeking ct=600
+61.9s video waiting ct=600
+61.9s video canplay ct=600
+61.9s video playing ct=600
+91.9s runner seek 300
+91.9s video seeking ct=300
+91.9s video waiting ct=300
+92.0s video canplay ct=300
+92.0s video playing ct=300
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 111.9,
  "state": {
   "ct": 319.895534,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 295
  }
 }
]
```
