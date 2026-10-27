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
| перемотка не сработала | [] |
| сыграно / стояло, с | 99 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | ovhqdd, qhnrum |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=1, browserReq=1, install=2, activate=1, evaluated=2 |
| запросы к CDN | 2 ({"empty":2}; статусы {"206":2}; обрывов 0; 60.3 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s ovhqdd [bench] SW script evaluated, instance=ovhqdd script=?27
+0.1s ovhqdd [SW] Install event fired at 1793116513232
+0.1s ovhqdd [SW] Activate event fired at 1793116513233
+43.0s qhnrum [bench] SW script evaluated, instance=qhnrum script=?27
+43.0s qhnrum [SW] Install event fired at 1793116556147
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
+43.0s runner site-config {"engine":"singlethread","swVersion":25}
+43.0s runner swUpdate
+43.0s sw-target created
+43.0s runner note "update: updated"
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 103.4,
  "state": {
   "ct": 99.992469,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 61
  }
 }
]
```
