# h2a-zero-sw: Ошибка на 0:00 до старта, затем ошибка на ~1:30 (sw)

Гипотеза: **H2a**. Вердикт: **не воспроизводится** (код с патчами: all).

Ошибки <video> не возникло, сбой поглощён ниже плеера.

**Ожидалось:** Первая ошибка при ct=0 оставляет lastSuccessTime=0; вторая ошибка не восстанавливает позицию → серия с начала, на паузе.

**Что увидел пользователь:** ошибок <video> нет; сыграно 119 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с. Пока плеер на паузе до старта (preload), ответ обрывается и следующие 5 с все запросы получают 503 → ошибка при ct=0; пользователь жмёт Play. В +95 с тот же сбой.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 119 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | ynl4oi |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=1, readDied=1, originNotOk=4, browserReq=1, install=1, activate=1, evaluated=1 |
| запросы к CDN | 10 ({"empty":10}; статусы {"206":5,"503":5}; обрывов 2; 72.9 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s ynl4oi [bench] SW script evaluated, instance=ynl4oi script=?24
+0.1s ynl4oi [SW] Install event fired at 1792882170985
+0.1s ynl4oi [SW] Activate event fired at 1792882170986
+5.0s ynl4oi [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 2752512 frontier= 2752512 err= network error
+5.0s ynl4oi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 2752512 status= 503
+5.5s ynl4oi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 2752512 status= 503
+6.5s ynl4oi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 2752512 status= 503
+8.5s ynl4oi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 2752512 status= 503
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
+5.0s runner cdn-cut {"dest":"all","cut":1}
+17.0s runner play
+17.0s video playing ct=0.01
+97.0s runner cdn-cut {"dest":"all","cut":1}
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 137.5,
  "state": {
   "ct": 119.975715,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 119.747331,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 2,
   "video-cache-v1-bench-A": 72
  }
 }
]
```
