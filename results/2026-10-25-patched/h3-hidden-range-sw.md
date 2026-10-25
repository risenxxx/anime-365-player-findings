# h3-hidden-range-sw: CDN не открывает Content-Range в Expose-Headers (SW)

Гипотеза: **H3**. Вердикт: **воспроизведено** (код с патчами: all).

BAD range: 25; total=MISSING: 0; serve FAIL: 0; ошибок <video>: {}; blacklist: 0; прямых запросов <video>: 0; сыграно 74 с.

**Ожидалось:** Каждый ответ SW → «missing Content-Range» → meta null → фальшивый 206 → serve FAIL; после code 4 — blacklist и прямой путь.

**Что увидел пользователь:** ошибок <video> нет; сыграно 74 с, стояло 2 с; notifyBroken: 0.

**Сценарий:** Access-Control-Expose-Headers без Content-Range. 30 с игры, перемотка на 11:40 (за запасной конец 100 МБ), 30 с, перемотка на 5:00, 20 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 74 / 2 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | s62fp8 |
| DevTools подключались к SW | нет |
| строки SW | badRange=25, metaThrew=25, install=1, activate=1, evaluated=1 |
| запросы к CDN | 20 ({"empty":20}; статусы {"206":20}; обрывов 0; 51.8 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.5s s62fp8 [bench] SW script evaluated, instance=s62fp8 script=?24
+0.5s s62fp8 [SW] Install event fired at 1792884976916
+0.5s s62fp8 [SW] Activate event fired at 1792884976918
+1.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+1.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+1.5s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+1.5s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+2.5s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+2.5s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+3.4s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+3.4s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+8.4s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+8.4s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+13.4s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+13.4s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+18.4s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+18.4s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+23.4s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+23.4s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+28.4s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+28.4s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+33.4s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+33.4s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+33.4s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 150142976 reason= missing Content-Range header on 206 response cr= null status= 206
+33.4s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+33.9s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 150142976 reason= missing Content-Range header on 206 response cr= null status= 206
+33.9s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+35.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 150142976 reason= missing Content-Range header on 206 response cr= null status= 206
+35.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+38.5s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+38.5s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+43.4s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+43.4s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+48.4s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+48.4s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+53.4s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+53.4s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+58.4s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+58.4s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+63.4s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
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
+2.8s video canplay ct=0
+3.4s runner play
+3.4s video playing ct=0
+33.4s runner seek 700
+33.4s video seeking ct=700
+33.4s video waiting ct=700
+35.4s video canplay ct=700
+35.4s video playing ct=700
+63.4s runner seek 300
+63.4s video seeking ct=300
+63.4s video waiting ct=300
+65.5s video canplay ct=300
+65.5s video playing ct=300
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 83.4,
  "state": {
   "ct": 317.94184,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 317.756483,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1
  }
 }
]
```
