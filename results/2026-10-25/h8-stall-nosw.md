# h8-stall-nosw: Зависший поток CDN: байты перестают идти, соединение не закрыто (nosw)

Гипотеза: **H8**. Вердикт: **воспроизведено**.

плеер стоял 114 с без ошибки <video> (ошибок: 0); последняя позиция 29.52; запросов к CDN: 1 {"video":1}.

**Ожидалось:** Нет таймаута чтения ни в serve()/загрузчике SW, ни в плеере: после опустошения буфера плеер стоит без ошибки, пока пользователь не перемотает.

**Что увидел пользователь:** ошибок <video> нет; сыграно 24 с, стояло 114 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; первый медиаответ после 6 МБ перестаёт отдавать байты (соединение открыто). 100 с игры, затем «пользователь» перематывает на +5 с, ещё 40 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 24 / 114 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | qfv4ga |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=1, install=1, activate=1, evaluated=1 |
| запросы к CDN | 1 ({"video":1}; статусы {"206":1}; обрывов 0; 6 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.5s qfv4ga [bench] SW script evaluated, instance=qfv4ga script=?24
+0.6s qfv4ga [SW] Install event fired at 1792879554389
+0.6s qfv4ga [SW] Activate event fired at 1792879554390
+1.0s qfv4ga [SW] Video caching disabled, bypassing SW
```

### Таймлайн

```
+0.5s runner navigate
+0.5s sw-target created
+0.6s page: controllerchange
+0.9s runner navigate
+1.0s call src= el=main-video_html5_api
+1.0s call load el=main-video_html5_api ct=0
+1.0s video emptied ct=0
+1.0s video loadstart ct=0
+1.2s runner mute
+2.7s video canplay ct=0
+3.4s runner play
+3.4s video playing ct=0
+28.0s video waiting ct=24.52
+103.5s runner note "ct before the nudge: 24.5"
+103.5s runner seek 29.520122
+103.5s video seeking ct=29.52
+103.5s video waiting ct=29.52
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 143.5,
  "state": {
   "ct": 29.520122,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 1
  },
  "cache": {}
 }
]
```
