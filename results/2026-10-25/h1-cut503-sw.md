# h1-cut503-sw: Обрыв через 6 МБ + 503 на следующий запрос (SW)

Гипотеза: **H1**. Вердикт: **не воспроизводится**.

Ни одной ошибки <video>: сбой поглощён ниже плеера (повтор в SW или в медиастеке Chrome).

**Ожидалось:** Переоткрытие в serve() получает 503 → serve FAIL → ошибка <video> → load() → playing обнуляет errorCounter → цикл без notifyBroken.

**Что увидел пользователь:** ошибок <video> нет; сыграно 149 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; каждый ответ обрывается после 6 МБ, первый запрос после каждого обрыва получает 503 (с CORS). 150 с игры.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 149 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | p82p9w |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=2, serveFail=1, readDied=1, originNotOk=1, browserReq=2, install=1, activate=1, evaluated=1 |
| запросы к CDN | 22 ({"empty":22}; статусы {"206":12,"503":10}; обрывов 10; 66.1 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.5s p82p9w [bench] SW script evaluated, instance=p82p9w script=?24
+0.6s p82p9w [SW] Install event fired at 1792877236752
+0.6s p82p9w [SW] Activate event fired at 1792877236752
+11.3s p82p9w [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 6291456 frontier= 6291456 err= network error
+11.3s p82p9w [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 6291456 status= 503
+11.3s p82p9w [SEEK-DIAG] serve FAIL m= bench-A start= 0 pos= 6291456 end= 307695338 servedSoFar= 6291456 total= 307695339 connFrontier= 6291456 connDead= true err= Fetch failed: 503
```

### Таймлайн

```
+0.5s runner navigate
+0.5s sw-target created
+0.6s page: controllerchange
+0.9s runner navigate
+1.0s call src= el=main-video_html5_api
+1.0s call load el=main-video_html5_api ct=0
+1.0s video emptied ct=0
+1.0s video loadstart ct=0
+1.2s runner mute
+2.8s video canplay ct=0
+3.4s runner play
+3.5s video playing ct=0
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 153.5,
  "state": {
   "ct": 149.960838,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 67
  }
 }
]
```
