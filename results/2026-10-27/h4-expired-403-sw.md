# h4-expired-403-sw: Подпись истекла: с 45-й секунды CDN отвечает 403 (SW)

Гипотеза: **H4**. Вердикт: **не воспроизводится**.

Ошибок <video> нет.

**Ожидалось:** Обрыв на 45 с → serve переоткрывает один раз → 403 → serve FAIL; источники через /sources/ не обновляются; ошибки до notifyBroken.

**Что увидел пользователь:** ошибок <video> нет; перезагрузок load() после старта: 2 (макс. 2/мин); сыграно 244 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 600 КБ/с; в +45 с все открытые ответы обрываются, все последующие запросы со старой подписью (sig=1) → 403 (с CORS), свежая подпись из /sources/ работает; ещё 200 с — дальше края кэша.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 2 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 244 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | veu3j5 |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=3, browserReq=3, install=1, activate=1, evaluated=1 |
| запросы к CDN | 53 ({"empty":53}; статусы {"206":13,"403":40}; обрывов 1; 65.4 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s veu3j5 [bench] SW script evaluated, instance=veu3j5 script=?27
+0.1s veu3j5 [SW] Install event fired at 1793116033987
+0.1s veu3j5 [SW] Activate event fired at 1793116033989
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
+48.1s call load el=main-video_html5_api ct=0
+48.1s video emptied ct=0
+48.1s video loadstart ct=0
+48.1s video seeking ct=45.08
+48.1s video canplay ct=45.08
+48.1s video playing ct=45.08
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 248.3,
  "state": {
   "ct": 244.878367,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 60
  }
 }
]
```
