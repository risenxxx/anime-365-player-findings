# h8-stall-nosw: Зависший поток CDN: байты перестают идти, соединение не закрыто (nosw)

Гипотеза: **H8**. Вердикт: **воспроизведено**.

плеер стоял 30 с без ошибки <video> (ошибок: 0); последняя позиция 113.83; запросов к CDN: 2 {"empty":2}.

**Ожидалось:** Нет таймаута чтения ни в serve()/загрузчике SW, ни в плеере: после опустошения буфера плеер стоит без ошибки, пока пользователь не перемотает.

**Что увидел пользователь:** ошибок <video> нет; перезагрузок load() после старта: 1 (макс. 1/мин); сыграно 107 с, стояло 30 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; первый медиаответ после 6 МБ перестаёт отдавать байты (соединение открыто). 100 с игры, затем «пользователь» перематывает на +5 с, ещё 40 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 1 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 107 / 30 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | pkki8b |
| DevTools подключались к SW | нет |
| строки SW | install=1, activate=1, evaluated=1 |
| запросы к CDN | 2 ({"empty":2}; статусы {"206":2}; обрывов 0; 37.6 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s pkki8b [bench] SW script evaluated, instance=pkki8b script=?27
+0.1s pkki8b [SW] Install event fired at 1793116764542
+0.1s pkki8b [SW] Activate event fired at 1793116764543
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
+27.5s video waiting ct=24.52
+58.0s call load el=main-video_html5_api ct=24.52
+58.0s video emptied ct=0
+58.0s video loadstart ct=0
+58.0s video seeking ct=24.52
+58.0s video canplay ct=24.52
+58.0s video playing ct=24.52
+103.0s runner note "ct before the nudge: 69.4"
+103.0s runner seek 74.404312
+103.0s video seeking ct=74.4
+103.0s video waiting ct=74.4
+103.0s video canplay ct=74.4
+103.0s video playing ct=74.4
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 143.4,
  "state": {
   "ct": 114.339663,
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
