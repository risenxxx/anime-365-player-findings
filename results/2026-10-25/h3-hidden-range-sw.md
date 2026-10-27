# h3-hidden-range-sw: CDN не открывает Content-Range в Expose-Headers (SW)

Гипотеза: **H3**. Вердикт: **воспроизведено**.

BAD range: 3; total=MISSING: 1; serve FAIL: 1; ошибок <video>: {"4":1}; blacklist: 1; прямых запросов <video>: 3; сыграно 78 с.

**Ожидалось:** Каждый ответ SW → «missing Content-Range» → meta null → фальшивый 206 → serve FAIL; после code 4 — blacklist и прямой путь.

**Что увидел пользователь:** ошибок <video>: 1 (коды 4×1); сыграно 78 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** Access-Control-Expose-Headers без Content-Range. 30 с игры, перемотка на 11:40 (за запасной конец 100 МБ), 30 с, перемотка на 5:00, 20 с.

| метрика | значение |
|---|---|
| ошибки <video> | +0.6s code=4 ct=0 |
| load() после старта / src с &rand | 0 / 1 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 78 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | a2r52e |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=1, serveFail=1, badRange=3, metaThrew=2, totalMissing=1, browserReq=1, blacklistMsg=1, bypassBlacklisted=3, install=1, activate=1, evaluated=1 |
| запросы к CDN | 5 ({"empty":2,"video":3}; статусы {"206":5}; обрывов 0; 46.8 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s a2r52e [bench] SW script evaluated, instance=a2r52e script=?24
+0.1s a2r52e [SW] Install event fired at 1792878740130
+0.1s a2r52e [SW] Activate event fired at 1792878740131
+0.5s a2r52e [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+0.5s a2r52e [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+0.5s a2r52e [SEEK-DIAG] browser req m= bench-A start= 0 end= 104857600 total= MISSING seek= false mode= singlethread
+0.6s a2r52e [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+0.6s a2r52e [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+0.6s a2r52e [SEEK-DIAG] serve enter m= bench-A start= 0 end= 104857600 total= MISSING seek= false
+0.6s a2r52e [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+0.6s a2r52e [SEEK-DIAG] serve FAIL m= bench-A start= 0 pos= 0 end= 104857600 servedSoFar= 0 total= MISSING connFrontier= null connDead= null err= Bad range response: missing Content-Range header on 206 response
+0.6s a2r52e [SW] Blacklisting mParam: bench-A
+0.6s a2r52e [SW] mParam bench-A is blacklisted, bypassing cache
+31.5s a2r52e [SW] mParam bench-A is blacklisted, bypassing cache
+61.5s a2r52e [SW] mParam bench-A is blacklisted, bypassing cache
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
+0.6s video error ct=0 code=4 "MEDIA_ELEMENT_ERROR: Format error"
+0.6s player: MEDIA_ERR_SRC_NOT_SUPPORTED: Blacklisting mParam bench-A and retrying immediately
+0.6s call src= el=main-video_html5_api +rand
+0.6s call load el=main-video_html5_api ct=0
+0.6s call load el=main-video_html5_api ct=0
+0.6s video emptied ct=0
+0.6s video loadstart ct=0
+0.7s runner mute
+0.9s video canplay ct=0
+1.5s runner play
+1.5s video playing ct=0
+31.5s runner seek 700
+31.5s video seeking ct=700
+31.5s video waiting ct=700
+32.0s video canplay ct=700
+32.0s video playing ct=700
+61.5s runner seek 300
+61.5s video seeking ct=300
+61.5s video waiting ct=300
+62.0s video canplay ct=300
+62.0s video playing ct=300
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 81.9,
  "state": {
   "ct": 319.448919,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [
    "bench-A"
   ],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1
  }
 }
]
```
