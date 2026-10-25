# control-nosw: Контроль: без сбоев, кэширование SW выключено

Гипотеза: **контроль**. Вердикт: **стенд работает** (код с патчами: all).

serve enter: 0; запросы к CDN: {"video":3}; bypass-строк SW: 3; ошибок: 0.

**Ожидалось:** Игра без ошибок; все медиазапросы идут от <video> напрямую (dest=video), SW пишет `Video caching disabled, bypassing SW`.

**Что увидел пользователь:** ошибок <video> нет; сыграно 107 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** site.videoLoadingEngine = "off". Старт, 60 с, перемотка на 10:00, 30 с, перемотка на 5:00, 20 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 107 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 047omw |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=3, install=1, activate=1, evaluated=1 |
| запросы к CDN | 3 ({"video":3}; статусы {"206":3}; обрывов 0; 70.9 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.4s 047omw [bench] SW script evaluated, instance=047omw script=?24
+0.4s 047omw [SW] Install event fired at 1792880907288
+0.4s 047omw [SW] Activate event fired at 1792880907289
+0.9s 047omw [SW] Video caching disabled, bypassing SW
+61.8s 047omw [SW] Video caching disabled, bypassing SW
+91.8s 047omw [SW] Video caching disabled, bypassing SW
```

### Таймлайн

```
+0.4s runner navigate
+0.4s sw-target created
+0.4s page: controllerchange
+0.8s runner navigate
+0.9s call src= el=main-video_html5_api
+0.9s call load el=main-video_html5_api ct=0
+0.9s video emptied ct=0
+0.9s video loadstart ct=0
+1.1s runner mute
+1.3s video canplay ct=0
+1.8s runner play
+1.8s video playing ct=0
+61.8s runner seek 600
+61.8s video seeking ct=600
+61.8s video waiting ct=600
+62.3s video canplay ct=600
+62.3s video playing ct=600
+91.8s runner seek 300
+91.8s video seeking ct=300
+91.8s video waiting ct=300
+92.4s video canplay ct=300
+92.4s video playing ct=300
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 111.8,
  "state": {
   "ct": 319.40122,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 319.340378,
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
