# h8-stall-sw: Зависший поток CDN: байты перестают идти, соединение не закрыто (sw)

Гипотеза: **H8**. Вердикт: **не воспроизводится**.

плеер стоял 0 с без ошибки <video> (ошибок: 0); последняя позиция 144.36; запросов к CDN: 4 {"empty":4}.

**Ожидалось:** Нет таймаута чтения ни в serve()/загрузчике SW, ни в плеере: после опустошения буфера плеер стоит без ошибки, пока пользователь не перемотает.

**Что увидел пользователь:** ошибок <video> нет; сыграно 138 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; первый медиаответ после 6 МБ перестаёт отдавать байты (соединение открыто). 100 с игры, затем «пользователь» перематывает на +5 с, ещё 40 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 138 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 86ba46 |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=1, readDied=1, browserReq=1, install=1, activate=1, evaluated=1 |
| запросы к CDN | 4 ({"empty":4}; статусы {"206":4}; обрывов 0; 80.9 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s 86ba46 [bench] SW script evaluated, instance=86ba46 script=?27
+0.1s 86ba46 [SW] Install event fired at 1793116618873
+0.1s 86ba46 [SW] Activate event fired at 1793116618875
+25.7s 86ba46 [SEEK-DIAG] origin read DIED mid-serve m= bench-A pos= 6291456 frontier= 6291456 err= Origin read timed out
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
+103.0s runner note "ct before the nudge: 100.0"
+103.0s runner seek 104.958191
+103.0s video seeking ct=104.96
+103.0s video waiting ct=104.96
+103.0s video canplay ct=104.96
+103.0s video playing ct=104.96
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 143.4,
  "state": {
   "ct": 144.886781,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 75
  }
 }
]
```
