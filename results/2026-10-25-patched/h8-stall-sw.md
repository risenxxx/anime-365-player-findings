# h8-stall-sw: Зависший поток CDN: байты перестают идти, соединение не закрыто (sw)

Гипотеза: **H8**. Вердикт: **не воспроизводится** (код с патчами: all).

плеер стоял 0 с без ошибки <video> (ошибок: 0); последняя позиция 144.38; запросов к CDN: 4 {"empty":4}.

**Ожидалось:** Нет таймаута чтения ни в serve()/загрузчике SW, ни в плеере: после опустошения буфера плеер стоит без ошибки, пока пользователь не перемотает.

**Что увидел пользователь:** ошибок <video> нет; сыграно 138 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; первый медиаответ после 6 МБ перестаёт отдавать байты (соединение открыто). 100 с игры, затем «пользователь» перематывает на +5 с, ещё 40 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 138 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 66clrs |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=1, readDied=1, browserReq=1, install=1, activate=1, evaluated=1 |
| запросы к CDN | 4 ({"empty":4}; статусы {"206":4}; обрывов 0; 82.6 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.5s 66clrs [bench] SW script evaluated, instance=66clrs script=?24
+0.5s 66clrs [SW] Install event fired at 1792883505583
+0.5s 66clrs [SW] Activate event fired at 1792883505584
+23.1s 66clrs [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 6291456 frontier= 6291456 err= origin read stalled
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
+2.7s video canplay ct=0
+3.4s runner play
+3.4s video playing ct=0
+103.4s runner note "ct before the nudge: 99.9"
+103.4s runner seek 104.917891
+103.4s video seeking ct=104.92
+103.4s video waiting ct=104.92
+103.4s video canplay ct=104.92
+103.4s video playing ct=104.92
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 143.4,
  "state": {
   "ct": 144.854445,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 144.71208,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 2,
   "video-cache-v1-bench-A": 77
  }
 }
]
```
