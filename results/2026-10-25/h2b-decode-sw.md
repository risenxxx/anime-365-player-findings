# h2b-decode-sw: Ошибка декодирования в середине (SW): ветка blacklist

Гипотеза: **H2b**. Вердикт: **воспроизведено**.

После ошибки позиция ушла в начало: 189 с → 0 с. Коды ошибок: {"3":1}; blacklist: 1; src с &rand: 1.

**Ожидалось:** MEDIA_ERR_DECODE → blacklist m → src(&rand) + load() без restoreLastTime → серия с начала.

**Что увидел пользователь:** ошибок <video>: 1 (коды 3×1); перезагрузок load() после старта: 2 (макс. 2/мин); сброс в начало после ошибки: 189→0 с; прыжков назад >5 с: 1; сыграно 63 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 4 МБ/с; байты 40–41 МБ файла заполнены нулями. Перемотка на 2:50, ждём ошибку.

| метрика | значение |
|---|---|
| ошибки <video> | +31.3s code=3 ct=189.22 |
| load() после старта / src с &rand | 2 / 1 |
| сброс в начало | [{"t":31.3,"before":189.22,"after":0,"pausedAfter":false}] |
| прыжки назад | [{"t":31.9,"from":188.9,"to":0}] |
| сыграно / стояло, с | 63 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 3n88l4 |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=2, browserReq=2, blacklistMsg=1, bypassBlacklisted=1, install=1, activate=1, evaluated=1 |
| запросы к CDN | 4 ({"empty":3,"video":1}; статусы {"206":4}; обрывов 0; 143.7 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.5s 3n88l4 [bench] SW script evaluated, instance=3n88l4 script=?24
+0.5s 3n88l4 [SW] Install event fired at 1792878580266
+0.6s 3n88l4 [SW] Activate event fired at 1792878580269
+31.3s 3n88l4 [SW] Blacklisting mParam: bench-A
+31.3s 3n88l4 [SW] mParam bench-A is blacklisted, bypassing cache
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
+1.4s video canplay ct=0
+1.9s runner play
+1.9s video playing ct=0.01
+11.9s runner seek 170
+11.9s video seeking ct=170
+11.9s video waiting ct=170
+12.0s video canplay ct=170
+12.0s video playing ct=170
+31.3s video error ct=189.22 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+31.3s player: MEDIA_ERR_DECODE: Blacklisting mParam bench-A and retrying immediately
+31.3s video pause ct=189.22 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+31.3s call src= el=main-video_html5_api +rand
+31.3s call load el=main-video_html5_api ct=0
+31.3s call load el=main-video_html5_api ct=0
+31.3s video emptied ct=0
+31.3s video loadstart ct=0
+31.5s video canplay ct=0
+36.0s runner user-play (player is paused after an error)
+36.0s video playing ct=0
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 71.9,
  "state": {
   "ct": 35.936622,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": null,
   "blacklisted": [
    "bench-A"
   ],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1,
   "video-cache-v1-bench-A": 121
  }
 }
]
```
