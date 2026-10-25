# h3-first-503-sw: Первый запрос SW к CDN получает 503 (SW)

Гипотеза: **H3**. Вердикт: **не воспроизводится** (код с патчами: all).

browser req с total=MISSING (ответ 206 с '*' и запасным концом 100 МБ): 0; handler FAIL (честный откат): 0; ошибок <video>: 0 {}; прыжков назад: 0; стояло 4 с.

**Ожидалось:** _ensureMeta глотает исключение → фальшивый 206 «bytes 0-104857599/*», а не откат на fetch(request).

**Что увидел пользователь:** ошибок <video> нет; сыграно 72 с, стояло 4 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; первые 2 медиазапроса → 503. 30 с игры, перемотка на 11:40 (за запасной конец 100 МБ), 30 с, перемотка на 5:00, 20 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 72 / 4 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 1o11mi |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=4, originNotOk=2, metaThrew=2, browserReq=4, install=1, activate=1, evaluated=1 |
| запросы к CDN | 12 ({"empty":12}; статусы {"206":10,"503":2}; обрывов 0; 50.1 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.5s 1o11mi [bench] SW script evaluated, instance=1o11mi script=?24
+0.5s 1o11mi [SW] Install event fired at 1792884889748
+0.5s 1o11mi [SW] Activate event fired at 1792884889748
+0.9s 1o11mi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 0 status= 503
+0.9s 1o11mi [SEEK-DIAG] meta/open THREW m= bench-A err= Fetch failed: 503
+1.5s 1o11mi [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 0 status= 503
+1.5s 1o11mi [SEEK-DIAG] meta/open THREW m= bench-A err= Fetch failed: 503
```

### Таймлайн

```
+0.4s runner navigate
+0.5s sw-target created
+0.5s page: controllerchange
+0.8s runner navigate
+0.9s call src= el=main-video_html5_api
+0.9s call load el=main-video_html5_api ct=0
+0.9s video emptied ct=0
+0.9s video loadstart ct=0
+1.1s runner mute
+3.9s call src= el=main-video_html5_api
+3.9s call load el=main-video_html5_api ct=0
+3.9s video emptied ct=0
+3.9s video loadstart ct=0
+4.2s video canplay ct=0
+4.9s runner play
+4.9s video playing ct=0
+34.9s runner seek 700
+34.9s video seeking ct=700
+34.9s video waiting ct=700
+38.2s video canplay ct=700
+38.2s video playing ct=700
+64.9s runner seek 300
+64.9s video seeking ct=300
+64.9s video waiting ct=300
+68.4s video canplay ct=300
+68.4s video playing ct=300
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 84.9,
  "state": {
   "ct": 316.511468,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 316.426705,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 2,
   "video-cache-v1-bench-A": 46
  }
 }
]
```
