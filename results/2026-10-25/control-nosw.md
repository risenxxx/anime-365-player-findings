# control-nosw: Контроль: без сбоев, кэширование SW выключено

Гипотеза: **контроль**. Вердикт: **стенд работает**.

serve enter: 0; запросы к CDN: {"video":3}; bypass-строк SW: 3; ошибок: 0.

**Ожидалось:** Игра без ошибок; SW не обслуживает запросы из своего кэша (нет `serve enter`): до v27 запросы шли мимо SW (dest=video), с v27 SW проксирует их без кэша (dest=empty).

**Что увидел пользователь:** ошибок <video> нет; сыграно 107 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** site.videoLoadingEngine = "off". Старт, 60 с, перемотка на 10:00, 30 с, перемотка на 5:00, 20 с.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 107 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 5wcxec |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=3, install=1, activate=1, evaluated=1 |
| запросы к CDN | 3 ({"video":3}; статусы {"206":3}; обрывов 0; 60.2 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s 5wcxec [bench] SW script evaluated, instance=5wcxec script=?24
+0.1s 5wcxec [SW] Install event fired at 1792876811330
+0.1s 5wcxec [SW] Activate event fired at 1792876811331
+0.6s 5wcxec [SW] Video caching disabled, bypassing SW
+61.5s 5wcxec [SW] Video caching disabled, bypassing SW
+91.5s 5wcxec [SW] Video caching disabled, bypassing SW
```

### Таймлайн

```
+0.1s runner navigate
+0.1s sw-target created
+0.1s page: controllerchange
+0.5s runner navigate
+0.6s call src= el=main-video_html5_api
+0.6s call load el=main-video_html5_api ct=0
+0.6s video emptied ct=0
+0.6s video loadstart ct=0
+0.7s runner mute
+1.0s video canplay ct=0
+1.5s runner play
+1.5s video playing ct=0
+61.5s runner seek 600
+61.5s video seeking ct=600
+61.5s video waiting ct=600
+62.0s video canplay ct=600
+62.0s video playing ct=600
+91.5s runner seek 300
+91.5s video seeking ct=300
+91.5s video waiting ct=300
+92.0s video canplay ct=300
+92.0s video playing ct=300
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 112,
  "state": {
   "ct": 319.444254,
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
