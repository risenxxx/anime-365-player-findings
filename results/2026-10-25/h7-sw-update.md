# h7-sw-update: Новая версия SW во время игры (swMain.js?v=25)

Гипотеза: **H7**. Вердикт: **не воспроизводится**.

экземпляров SW: 2; ошибок <video>: {}; прыжков назад: 0; serve FAIL: 0; стояло 0 с.

**Ожидалось:** skipWaiting + clients.claim: новая версия забирает вкладку; поток старого воркера может оборваться.

**Что увидел пользователь:** ошибок <video> нет; сыграно 99 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; 40 с игры, затем sworker.js начинает импортировать ?v=25 и вызывается registration.update(). Ещё 60 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 99 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | ky4kpd, d1hgeo |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=1, browserReq=1, install=2, activate=1, evaluated=2 |
| запросы к CDN | 2 ({"empty":2}; статусы {"206":2}; обрывов 0; 66.3 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.5s ky4kpd [bench] SW script evaluated, instance=ky4kpd script=?24
+0.5s ky4kpd [SW] Install event fired at 1792879303023
+0.5s ky4kpd [SW] Activate event fired at 1792879303024
+43.5s d1hgeo [bench] SW script evaluated, instance=d1hgeo script=?24
+43.5s d1hgeo [SW] Install event fired at 1792879345943
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
+1.2s runner mute
+2.7s video canplay ct=0
+3.4s runner play
+3.4s video playing ct=0
+43.4s runner site-config {"engine":"singlethread","swVersion":25}
+43.4s runner swUpdate
+43.5s sw-target created
+43.5s runner note "update: updated"
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 103.5,
  "state": {
   "ct": 99.989522,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 60
  }
 }
]
```
