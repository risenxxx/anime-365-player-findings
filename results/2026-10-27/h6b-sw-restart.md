# h6b-sw-restart: SW остановлен браузером во время паузы, затем продолжение

Гипотеза: **H6**. Вердикт: **не воспроизводится**.

экземпляров SW: 2; запросов, обслуженных новым экземпляром: 2; строк «Video caching disabled, bypassing SW»: 0; прямых запросов <video> к CDN: 0; ошибок <video>: 0; стояло 0 с.

**Ожидалось:** Новый экземпляр начинает с videoCachingEnabled=false: после продолжения запросы <video> идут мимо SW и кэша, хотя кэш есть.

**Что увидел пользователь:** ошибок <video> нет; сыграно 92 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; 40 с игры, пауза, через 20 с SW останавливается (как при простое), ещё 10 с, продолжение, 40 с игры, перемотка назад на 0:10, 15 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 92 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | kyon41, wqeqzb |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=3, browserReq=3, install=1, activate=1, evaluated=2 |
| запросы к CDN | 4 ({"empty":4}; статусы {"206":4}; обрывов 0; 66.1 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s kyon41 [bench] SW script evaluated, instance=kyon41 script=?27
+0.1s kyon41 [SW] Install event fired at 1793117854786
+0.1s kyon41 [SW] Activate event fired at 1793117854788
+73.0s wqeqzb [bench] SW script evaluated, instance=wqeqzb script=?27
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
+2.3s video canplay ct=0
+3.0s runner play
+3.0s video playing ct=0
+43.0s runner pause
+43.0s video pause ct=39.96
+63.0s runner stopSW
+63.0s runner note "stop SW: true"
+73.0s runner play
+73.0s sw-target created
+73.0s video playing ct=40.02
+113.0s runner seek 10
+113.0s video seeking ct=10
+113.0s video waiting ct=10
+113.0s video canplay ct=10
+113.0s video playing ct=10
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 128.5,
  "state": {
   "ct": 24.891196,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 65
  }
 }
]
```
