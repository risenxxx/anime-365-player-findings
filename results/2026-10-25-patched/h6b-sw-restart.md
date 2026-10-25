# h6b-sw-restart: SW остановлен браузером во время паузы, затем продолжение

Гипотеза: **H6**. Вердикт: **не воспроизводится** (код с патчами: all).

экземпляров SW: 2; запросов мимо SW («Video caching disabled, bypassing SW»): 0; прямых запросов <video> к CDN: 0; ошибок <video>: 0; стояло 0 с.

**Ожидалось:** Новый экземпляр начинает с videoCachingEnabled=false: после продолжения запросы <video> идут мимо SW и кэша, хотя кэш есть.

**Что увидел пользователь:** ошибок <video> нет; сыграно 92 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; 40 с игры, пауза, через 20 с SW останавливается (как при простое), ещё 10 с, продолжение, 40 с игры, перемотка назад на 0:10, 15 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 92 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 3r5dke, meqc1x |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=3, browserReq=3, install=1, activate=1, evaluated=2 |
| запросы к CDN | 6 ({"empty":6}; статусы {"206":6}; обрывов 0; 65.8 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.6s 3r5dke [bench] SW script evaluated, instance=3r5dke script=?24
+0.6s 3r5dke [SW] Install event fired at 1792884741221
+0.6s 3r5dke [SW] Activate event fired at 1792884741225
+73.5s meqc1x [bench] SW script evaluated, instance=meqc1x script=?24
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
+2.8s video canplay ct=0
+3.5s runner play
+3.5s video playing ct=0
+43.5s runner pause
+43.5s video pause ct=39.96
+63.5s runner stopSW
+63.5s runner note "stop SW: true"
+73.5s runner play
+73.5s sw-target created
+73.5s video playing ct=40
+113.5s runner seek 10
+113.5s video seeking ct=10
+113.5s video waiting ct=10
+113.6s video canplay ct=10
+113.6s video playing ct=10
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 128.5,
  "state": {
   "ct": 24.901474,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 24.822631,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 2,
   "video-cache-v1-bench-A": 65
  }
 }
]
```
