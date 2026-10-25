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
| сыграно / стояло, с | 149 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | mqx31x |
| DevTools подключались к SW | нет |
| строки SW | bypassDisabled=7, install=1, activate=1, evaluated=1 |
| запросы к CDN | 7 ({"video":7}; статусы {"206":7}; обрывов 6; 39.7 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.6s mqx31x [bench] SW script evaluated, instance=mqx31x script=?24
+0.6s mqx31x [SW] Install event fired at 1792877081094
+0.6s mqx31x [SW] Activate event fired at 1792877081096
+1.0s mqx31x [SW] Video caching disabled, bypassing SW
+11.6s mqx31x [SW] Video caching disabled, bypassing SW
+41.0s mqx31x [SW] Video caching disabled, bypassing SW
+67.3s mqx31x [SW] Video caching disabled, bypassing SW
+93.2s mqx31x [SW] Video caching disabled, bypassing SW
+120.7s mqx31x [SW] Video caching disabled, bypassing SW
+147.3s mqx31x [SW] Video caching disabled, bypassing SW
```

### Таймлайн

```
+0.5s runner navigate
+0.6s sw-target created
+0.6s page: controllerchange
+0.9s runner navigate
+1.0s call src= el=main-video_html5_api
+1.0s call load el=main-video_html5_api ct=0
+1.0s video emptied ct=0
+1.0s video loadstart ct=0
+1.2s runner mute
+2.7s video canplay ct=0
+3.5s runner play
+3.5s video playing ct=0
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 153.5,
  "state": {
   "ct": 149.960125,
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
