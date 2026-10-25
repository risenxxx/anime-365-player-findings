# h6b-sw-restart: SW остановлен браузером во время паузы, затем продолжение

Гипотеза: **H6**. Вердикт: **воспроизведено**.

экземпляров SW: 2; запросов мимо SW («Video caching disabled, bypassing SW»): 2; прямых запросов <video> к CDN: 2; ошибок <video>: 0; стояло 3 с.

**Ожидалось:** Новый экземпляр начинает с videoCachingEnabled=false: после продолжения запросы <video> идут мимо SW и кэша, хотя кэш есть.

**Что увидел пользователь:** ошибок <video> нет; сыграно 89 с, стояло 3 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; 40 с игры, пауза, через 20 с SW останавливается (как при простое), ещё 10 с, продолжение, 40 с игры, перемотка назад на 0:10, 15 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 89 / 3 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | qiycme, w3xooo |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=1, browserReq=1, bypassDisabled=2, install=1, activate=1, evaluated=2 |
| запросы к CDN | 4 ({"empty":2,"video":2}; статусы {"206":4}; обрывов 0; 67.9 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.7s qiycme [bench] SW script evaluated, instance=qiycme script=?24
+0.7s qiycme [SW] Install event fired at 1792880644725
+0.7s qiycme [SW] Activate event fired at 1792880644727
+73.6s w3xooo [bench] SW script evaluated, instance=w3xooo script=?24
+78.8s w3xooo [SW] Video caching disabled, bypassing SW
+113.6s w3xooo [SW] Video caching disabled, bypassing SW
```

### Таймлайн

```
+0.6s runner navigate
+0.7s sw-target created
+0.7s page: controllerchange
+1.0s runner navigate
+1.1s call src= el=main-video_html5_api
+1.1s call load el=main-video_html5_api ct=0
+1.2s video emptied ct=0
+1.2s video loadstart ct=0
+1.3s runner mute
+2.9s video canplay ct=0
+3.6s runner play
+3.6s video playing ct=0
+43.6s runner pause
+43.6s video pause ct=39.97
+63.6s runner stopSW
+63.6s runner note "stop SW: true"
+73.6s runner play
+73.6s sw-target created
+73.6s video playing ct=40.02
+113.6s runner seek 10
+113.6s video seeking ct=10
+113.6s video waiting ct=10
+117.3s video canplay ct=10
+117.3s video playing ct=10
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
