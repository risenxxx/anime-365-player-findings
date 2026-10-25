# h1-cut-sw: Обрыв каждого ответа CDN через 6 МБ (SW)

Гипотеза: **H1**. Вердикт: **не воспроизводится**.

Ни одной ошибки <video>: сбой поглощён ниже плеера (повтор в SW или в медиастеке Chrome).

**Ожидалось:** По коду serve() переоткрывает соединение после обрыва; если переоткрытие успешно, плеер ошибок не видит.

**Что увидел пользователь:** ошибок <video> нет; сыграно 149 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с, каждый ответ обрывается после 6 МБ тела. 150 с игры.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 149 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 89oveg |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=1, readDied=1, browserReq=1, install=1, activate=1, evaluated=1 |
| запросы к CDN | 16 ({"empty":16}; статусы {"206":16}; обрывов 14; 88.6 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.5s 89oveg [bench] SW script evaluated, instance=89oveg script=?24
+0.5s 89oveg [SW] Install event fired at 1792876925427
+0.5s 89oveg [SW] Activate event fired at 1792876925427
+11.2s 89oveg [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 6291456 frontier= 6291456 err= network error
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
+2.7s video canplay ct=0
+3.4s runner play
+3.4s video playing ct=0.01
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 153.4,
  "state": {
   "ct": 149.961005,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 88
  }
 }
]
```
