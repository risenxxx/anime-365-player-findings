# h3-first-503-sw: Первый запрос SW к CDN получает 503 (SW)

Гипотеза: **H3**. Вердикт: **механизм подтверждён, видимых последствий нет**.

browser req с total=MISSING (ответ 206 с '*' и запасным концом 100 МБ): 1; handler FAIL (честный откат): 0; ошибок <video>: 0 {}; прыжков назад: 0; стояло 0 с.

**Ожидалось:** _ensureMeta глотает исключение → фальшивый 206 «bytes 0-104857599/*», а не откат на fetch(request).

**Что увидел пользователь:** ошибок <video> нет; сыграно 77 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; первые 2 медиазапроса → 503. 30 с игры, перемотка на 11:40 (за запасной конец 100 МБ), 30 с, перемотка на 5:00, 20 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 77 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | x6ofhb |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=3, originNotOk=2, metaThrew=2, totalMissing=1, browserReq=3, install=1, activate=1, evaluated=1 |
| запросы к CDN | 7 ({"empty":7}; статусы {"206":5,"503":2}; обрывов 0; 48.6 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.6s x6ofhb [bench] SW script evaluated, instance=x6ofhb script=?24
+0.6s x6ofhb [SW] Install event fired at 1792878654484
+0.6s x6ofhb [SW] Activate event fired at 1792878654485
+1.0s x6ofhb [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 0 status= 503
+1.0s x6ofhb [SEEK-DIAG] meta/open THREW m= bench-A err= Fetch failed: 503
+1.0s x6ofhb [SEEK-DIAG] browser req m= bench-A start= 0 end= 104857600 total= MISSING seek= false mode= singlethread
+1.0s x6ofhb [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 0 status= 503
+1.0s x6ofhb [SEEK-DIAG] meta/open THREW m= bench-A err= Fetch failed: 503
+1.0s x6ofhb [SEEK-DIAG] serve enter m= bench-A start= 0 end= 104857600 total= MISSING seek= false
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
+33.5s runner seek 700
+33.5s video seeking ct=0
+33.5s video waiting ct=0
+33.5s video canplay ct=0
+33.5s video playing ct=0
+63.5s runner seek 300
+63.5s video seeking ct=0
+63.5s video waiting ct=0
+63.5s video canplay ct=0
+63.5s video playing ct=0
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 83.5,
  "state": {
   "ct": 19.959221,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 49
  }
 }
]
```
