# h4-expired-403-sw: Подпись истекла: с 45-й секунды CDN отвечает 403 (SW)

Гипотеза: **H4**. Вердикт: **не воспроизводится** (код с патчами: all).

Ошибок <video> нет.

**Ожидалось:** Обрыв на 45 с → serve переоткрывает один раз → 403 → serve FAIL; источники через /sources/ не обновляются; ошибки до notifyBroken.

**Что увидел пользователь:** ошибок <video> нет; перезагрузок load() после старта: 1 (макс. 1/мин); сыграно 244 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; в +45 с все открытые ответы обрываются, все последующие запросы со старой подписью (sig=1) → 403 (с CORS), свежая подпись из /sources/ работает; ещё 200 с — дальше края кэша.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 1 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 244 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | g4yh9c |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=3, browserReq=3, install=1, activate=1, evaluated=1 |
| запросы к CDN | 4 ({"empty":4}; статусы {"206":3,"403":1}; обрывов 1; 145.1 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s g4yh9c [bench] SW script evaluated, instance=g4yh9c script=?24
+0.1s g4yh9c [SW] Install event fired at 1792882919979
+0.1s g4yh9c [SW] Activate event fired at 1792882919981
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
+2.2s video canplay ct=0
+3.0s runner play
+3.0s video playing ct=0
+48.0s runner cdn-config {"throttleBps":614400,"faults":[{"action":"status","code":403,"when":{"query":{"sig":1}}}]}
+48.0s runner cdn-cut {"dest":"all","cut":1}
+48.1s call src= el=main-video_html5_api
+48.1s call load el=main-video_html5_api ct=0
+48.1s video emptied ct=0
+48.1s video loadstart ct=0
+48.1s video canplay ct=0
+48.1s video seeking ct=45.09
+48.1s video waiting ct=45.09
+48.1s video canplay ct=45.09
+48.1s video playing ct=45.09
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 248.5,
  "state": {
   "ct": 244.872061,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 244.786032,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 2,
   "video-cache-v1-bench-A": 145
  }
 }
]
```
