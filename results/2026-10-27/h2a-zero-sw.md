# h2a-zero-sw: Ошибка на 0:00 до старта, затем ошибка на ~1:30 (sw)

Гипотеза: **H2a**. Вердикт: **не воспроизводится**.

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
| экземпляры SW (по обёртке логов) | k806vk |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=11, serveFail=10, readDied=1, originNotOk=10, browserReq=11, install=1, activate=1, evaluated=1 |
| запросы к CDN | 71 ({"empty":71}; статусы {"206":5,"503":66}; обрывов 2; 71.3 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s k806vk [bench] SW script evaluated, instance=k806vk script=?27
+0.1s k806vk [SW] Install event fired at 1793115285255
+0.1s k806vk [SW] Activate event fired at 1793115285256
+5.0s k806vk [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 2752512 frontier= 2752512 err= network error
+5.0s k806vk [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 2752512 status= 503
+5.0s k806vk [SEEK-DIAG] serve FAIL m= bench-A start= 0 pos= 2752512 end= 307695338 servedSoFar= 2752512 total= 307695339 connFrontier= 2752512 connDead= true err= Fetch failed: 503
+5.3s k806vk [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 2752512 status= 503
+5.3s k806vk [SEEK-DIAG] serve FAIL m= bench-A start= 2752512 pos= 2752512 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+5.6s k806vk [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 2752512 status= 503
+5.6s k806vk [SEEK-DIAG] serve FAIL m= bench-A start= 2752512 pos= 2752512 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+6.0s k806vk [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 2752512 status= 503
+6.0s k806vk [SEEK-DIAG] serve FAIL m= bench-A start= 2752512 pos= 2752512 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+6.5s k806vk [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 2752512 status= 503
+6.5s k806vk [SEEK-DIAG] serve FAIL m= bench-A start= 2752512 pos= 2752512 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+7.0s k806vk [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 2752512 status= 503
+7.0s k806vk [SEEK-DIAG] serve FAIL m= bench-A start= 2752512 pos= 2752512 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+7.6s k806vk [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 2752512 status= 503
+7.6s k806vk [SEEK-DIAG] serve FAIL m= bench-A start= 2752512 pos= 2752512 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+8.2s k806vk [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 2752512 status= 503
+8.2s k806vk [SEEK-DIAG] serve FAIL m= bench-A start= 2752512 pos= 2752512 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+8.8s k806vk [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 2752512 status= 503
+8.8s k806vk [SEEK-DIAG] serve FAIL m= bench-A start= 2752512 pos= 2752512 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
+9.5s k806vk [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 2752512 status= 503
+9.5s k806vk [SEEK-DIAG] serve FAIL m= bench-A start= 2752512 pos= 2752512 end= 307695338 servedSoFar= 0 total= 307695339 connFrontier= null connDead= null err= Fetch failed: 503
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
+17.0s video playing ct=0
+97.0s runner cdn-cut {"dest":"all","cut":1}
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 137.4,
  "state": {
   "ct": 119.989742,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 70
  }
 }
]
```
