# h1-cut-nosw: Обрыв каждого ответа CDN через 6 МБ (без SW)

Гипотеза: **H1**. Вердикт: **не воспроизводится**.

Ни одной ошибки <video>: сбой поглощён ниже плеера (повтор в SW или в медиастеке Chrome).

**Ожидалось:** Медиастек Chrome сам повторяет range-запрос после обрыва; плеер ошибок не видит.

**Что увидел пользователь:** ошибок <video> нет; сыграно 149 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** То же, кэширование SW выключено.

| метрика | значение |
|---|---|
| ошибки <video> | — |
| load() после старта / src с &rand | 0 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 149 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | dga2u2 |
| DevTools подключались к SW | нет |
| строки SW | install=1, activate=1, evaluated=1 |
| запросы к CDN | 7 ({"empty":7}; статусы {"206":7}; обрывов 6; 38.3 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s dga2u2 [bench] SW script evaluated, instance=dga2u2 script=?27
+0.1s dga2u2 [SW] Install event fired at 1793114291675
+0.1s dga2u2 [SW] Activate event fired at 1793114291676
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
+3.0s video playing ct=0.01
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 153.5,
  "state": {
   "ct": 149.941928,
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
