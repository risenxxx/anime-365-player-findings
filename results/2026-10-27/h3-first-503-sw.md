# h3-first-503-sw: Первый запрос SW к CDN получает 503 (SW)

Гипотеза: **H3**. Вердикт: **не воспроизводится**.

browser req с total=MISSING (ответ 206 с '*' и запасным концом 100 МБ): 0; handler FAIL (честный откат): 0; ошибок <video>: 0 {}; прыжков назад: 0; несработавших перемоток: 0; стояло 6 с.

**Ожидалось:** _ensureMeta глотает исключение → фальшивый 206 «bytes 0-104857600/*», а не откат на fetch(request); после ответа с неизвестным размером перемотка может не работать.

**Что увидел пользователь:** ошибок <video> нет; сыграно 71 с, стояло 6 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; первые 2 медиазапроса → 503. 30 с игры, перемотка на 11:40 (за запасной конец 100 МБ), 30 с, перемотка на 5:00, 20 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 71 / 6 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 51xkt8 |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=3, browserReq=3, install=1, activate=1, evaluated=1 |
| запросы к CDN | 9 ({"empty":9}; статусы {"206":7,"503":2}; обрывов 0; 52.6 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s 51xkt8 [bench] SW script evaluated, instance=51xkt8 script=?27
+0.1s 51xkt8 [SW] Install event fired at 1793115864288
+0.1s 51xkt8 [SW] Activate event fired at 1793115864289
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
+2.2s video canplay ct=0
+3.0s runner play
+3.0s video playing ct=0
+33.0s runner seek 700
+33.0s video seeking ct=700
+33.0s video waiting ct=700
+36.3s video canplay ct=700
+36.3s video playing ct=700
+63.0s runner seek 300
+63.0s video seeking ct=300
+63.0s video waiting ct=300
+66.4s video canplay ct=300
+66.4s video playing ct=300
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 83.4,
  "state": {
   "ct": 316.53554,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 47
  }
 }
]
```
