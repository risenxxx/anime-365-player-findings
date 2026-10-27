# h6b-sw-restart: SW остановлен браузером во время паузы, затем продолжение

Гипотеза: **H6**. Вердикт: **воспроизведено**.

экземпляров SW: 2; запросов, обслуженных новым экземпляром: 0; строк «Video caching disabled, bypassing SW»: 2; прямых запросов <video> к CDN: 2; ошибок <video>: 0; стояло 3 с.

**Ожидалось:** Новый экземпляр начинает с videoCachingEnabled=false: после продолжения запросы <video> идут мимо SW и кэша, хотя кэш есть.

**Что увидел пользователь:** ошибок <video> нет; сыграно 89 с, стояло 3 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; 40 с игры, пауза, через 20 с SW останавливается (как при простое), ещё 10 с, продолжение, 40 с игры, перемотка назад на 0:10, 15 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 89 / 3 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | qiycme, w3xooo |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=1, browserReq=1, bypassDisabled=2, install=1, activate=1, evaluated=2 |
| запросы к CDN | 4 ({"empty":2,"video":2}; статусы {"206":4}; обрывов 0; 67.9 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s qiycme [bench] SW script evaluated, instance=qiycme script=?24
+0.1s qiycme [SW] Install event fired at 1792880644725
+0.1s qiycme [SW] Activate event fired at 1792880644727
+73.0s w3xooo [bench] SW script evaluated, instance=w3xooo script=?24
+78.2s w3xooo [SW] Video caching disabled, bypassing SW
+113.0s w3xooo [SW] Video caching disabled, bypassing SW
```

### Таймлайн

```
+0.0s runner navigate
+0.1s sw-target created
+0.1s page: controllerchange
+0.4s runner navigate
+0.5s call src= el=main-video_html5_api
+0.5s call load el=main-video_html5_api ct=0
+0.6s video emptied ct=0
+0.6s video loadstart ct=0
+0.7s runner mute
+2.3s video canplay ct=0
+3.0s runner play
+3.0s video playing ct=0
+43.0s runner pause
+43.0s video pause ct=39.97
+63.0s runner stopSW
+63.0s runner note "stop SW: true"
+73.0s runner play
+73.0s sw-target created
+73.0s video playing ct=40.02
+113.0s runner seek 10
+113.0s video seeking ct=10
+113.0s video waiting ct=10
+116.7s video canplay ct=10
+116.7s video playing ct=10
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 128.6,
  "state": {
   "ct": 21.217053,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 3
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 36
  }
 }
]
```
