# h3-hidden-range-sw: CDN не открывает Content-Range в Expose-Headers (SW)

Гипотеза: **H3**. Вердикт: **воспроизведено**.

BAD range: 17; total=MISSING: 0; serve FAIL: 0; ошибок <video>: {}; blacklist: 0; прямых запросов <video>: 0; сыграно 77 с.

**Ожидалось:** Каждый ответ SW → «missing Content-Range» → meta null → фальшивый 206 → serve FAIL; после code 4 — blacklist и прямой путь.

**Что увидел пользователь:** ошибок <video> нет; сыграно 77 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** Access-Control-Expose-Headers без Content-Range. 30 с игры, перемотка на 11:40 (за запасной конец 100 МБ), 30 с, перемотка на 5:00, 20 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 77 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | hq8jyx |
| DevTools подключались к SW | нет |
| строки SW | badRange=17, metaThrew=17, install=1, activate=1, evaluated=1 |
| запросы к CDN | 22 ({"empty":22}; статусы {"206":22}; обрывов 0; 56.1 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s hq8jyx [bench] SW script evaluated, instance=hq8jyx script=?27
+0.1s hq8jyx [SW] Install event fired at 1793115949954
+0.1s hq8jyx [SW] Activate event fired at 1793115949955
+0.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+0.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+1.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+1.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+6.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+6.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+11.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+11.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+16.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+16.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+21.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+21.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+26.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+26.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+31.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+31.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+36.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+36.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+41.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+41.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+46.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+46.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+51.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+51.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+56.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+56.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+61.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+61.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+66.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+66.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+71.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+71.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
+76.5s hq8jyx [SEEK-DIAG] origin BAD range m= bench-A atByte= 0 reason= missing Content-Range header on 206 response cr= null status= 206
+76.5s hq8jyx [SEEK-DIAG] meta/open THREW m= bench-A err= Bad range response: missing Content-Range header on 206 response
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
  "t": 82,
  "state": {
   "ct": 319.450316,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {}
 }
]
```
