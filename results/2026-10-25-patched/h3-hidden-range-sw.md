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
| перемотка не сработала | [] |
| сыграно / стояло, с | 74 / 2 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | s62fp8 |
| DevTools подключались к SW | нет |
| строки SW | badRange=25, metaThrew=25, install=1, activate=1, evaluated=1 |
| запросы к CDN | 20 ({"empty":20}; статусы {"206":20}; обрывов 0; 51.8 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s s62fp8 [bench] SW script evaluated, instance=s62fp8 script=?24
+0.1s s62fp8 [SW] Install event fired at 1792884976916
+0.1s s62fp8 [SW] Activate event fired at 1792884976918
+0.5s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+0.5s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+1.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+1.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+2.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+2.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+3.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+3.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+8.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+8.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+13.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+13.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+18.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+18.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+23.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+23.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+28.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+28.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+33.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+33.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+33.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 150142976 reason= missing Content-Range header on 206 response cr= null status= 206
+33.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+33.5s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 150142976 reason= missing Content-Range header on 206 response cr= null status= 206
+33.5s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+34.5s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 150142976 reason= missing Content-Range header on 206 response cr= null status= 206
+34.5s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+38.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+38.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+43.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+43.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+48.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+48.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+53.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+53.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+58.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+58.0s s62fp8 [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+63.0s s62fp8 [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
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
+2.4s video canplay ct=0
+3.0s runner play
+3.0s video playing ct=0
+33.0s runner seek 700
+33.0s video seeking ct=700
+33.0s video waiting ct=700
+35.0s video canplay ct=700
+35.0s video playing ct=700
+63.0s runner seek 300
+63.0s video seeking ct=300
+63.0s video waiting ct=300
+65.0s video canplay ct=300
+65.0s video playing ct=300
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
