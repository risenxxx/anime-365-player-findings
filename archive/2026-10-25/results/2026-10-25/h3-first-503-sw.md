# h3-first-503-sw: Первый запрос SW к CDN получает 503 (SW)

Гипотеза: **H3**. Вердикт: **воспроизведено**.

browser req с total=MISSING (ответ 206 с '*' и запасным концом 100 МБ): 1; handler FAIL (честный откат): 0; ошибок <video>: 0 {}; прыжков назад: 0; несработавших перемоток: 2; стояло 0 с.

**Ожидалось:** _ensureMeta глотает исключение → фальшивый 206 «bytes 0-104857600/*», а не откат на fetch(request); после ответа с неизвестным размером перемотка может не работать.

**Что увидел пользователь:** ошибок <video> нет; **перемотка не сработала**: на 700 с → 7 с; на 300 с → 7 с; сыграно 77 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; первые 2 медиазапроса → 503. 30 с игры, перемотка на 11:40 (за запасной конец 100 МБ), 30 с, перемотка на 5:00, 20 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [{"t":33,"target":700,"got":7.43},{"t":63,"target":300,"got":7.43}] |
| сыграно / стояло, с | 77 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | x6ofhb |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=3, originNotOk=2, metaThrew=2, totalMissing=1, browserReq=3, install=1, activate=1, evaluated=1 |
| запросы к CDN | 7 ({"empty":7}; статусы {"206":5,"503":2}; обрывов 0; 48.6 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s x6ofhb [bench] SW script evaluated, instance=x6ofhb script=?24
+0.1s x6ofhb [SW] Install event fired at 1792878654484
+0.1s x6ofhb [SW] Activate event fired at 1792878654485
+0.5s x6ofhb [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 0 status= 503
+0.5s x6ofhb [SEEK-DIAG] meta/open THREW m= bench-A err= Fetch failed: 503
+0.5s x6ofhb [SEEK-DIAG] browser req m= bench-A start= 0 end= 104857600 total= MISSING seek= false mode= singlethread
+0.5s x6ofhb [SEEK-DIAG] origin fetch NOT OK m= bench-A atByte= 0 status= 503
+0.5s x6ofhb [SEEK-DIAG] meta/open THREW m= bench-A err= Fetch failed: 503
+0.5s x6ofhb [SEEK-DIAG] serve enter m= bench-A start= 0 end= 104857600 total= MISSING seek= false
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
+3.0s runner play
+3.0s video playing ct=0
+33.0s runner seek 700
+33.0s video seeking ct=0
+33.0s video waiting ct=0
+33.0s video canplay ct=0
+33.0s video playing ct=0
+63.0s runner seek 300
+63.0s video seeking ct=0
+63.0s video waiting ct=0
+63.0s video canplay ct=0
+63.0s video playing ct=0
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
