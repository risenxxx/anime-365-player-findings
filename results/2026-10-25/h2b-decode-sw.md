# h2b-decode-sw: Ошибка декодирования в середине (SW): ветка blacklist

Гипотеза: **H2b**. Вердикт: **воспроизведено**.

После ошибки позиция ушла в начало: 189 с → 0 с. Коды ошибок: {"3":1}; blacklist: 1; src с &rand: 1.

**Ожидалось:** MEDIA_ERR_DECODE → blacklist m → src(&rand) + load() без restoreLastTime → серия с начала.

**Что увидел пользователь:** ошибок <video>: 1 (коды 3×1); перезагрузок load() после старта: 2 (макс. 2/мин); сброс в начало после ошибки: 189→0 с; прыжков назад >5 с: 1; сыграно 63 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** CDN 4 МБ/с; байты 40–41 МБ файла заполнены нулями. Перемотка на 2:50, ждём ошибку.

| метрика | значение |
|---|---|
| ошибки <video> | +30.8s code=3 ct=189.22 |
| load() после старта / src с &rand | 2 / 1 |
| сброс в начало | [{"t":30.8,"before":189.22,"after":0,"pausedAfter":false}] |
| прыжки назад | [{"t":31.5,"from":188.9,"to":0}] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 63 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | 3n88l4 |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=2, browserReq=2, blacklistMsg=1, bypassBlacklisted=1, install=1, activate=1, evaluated=1 |
| запросы к CDN | 4 ({"empty":3,"video":1}; статусы {"206":4}; обрывов 0; 143.7 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s 3n88l4 [bench] SW script evaluated, instance=3n88l4 script=?24
+0.1s 3n88l4 [SW] Install event fired at 1792878580266
+0.1s 3n88l4 [SW] Activate event fired at 1792878580269
+30.8s 3n88l4 [SW] Blacklisting mParam: bench-A
+30.8s 3n88l4 [SW] mParam bench-A is blacklisted, bypassing cache
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
+0.9s video canplay ct=0
+1.4s runner play
+1.5s video playing ct=0.01
+11.4s runner seek 170
+11.5s video seeking ct=170
+11.5s video waiting ct=170
+11.5s video canplay ct=170
+11.5s video playing ct=170
+30.8s video error ct=189.22 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+30.8s player: MEDIA_ERR_DECODE: Blacklisting mParam bench-A and retrying immediately
+30.8s video pause ct=189.22 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+30.8s call src= el=main-video_html5_api +rand
+30.8s call load el=main-video_html5_api ct=0
+30.8s call load el=main-video_html5_api ct=0
+30.8s video emptied ct=0
+30.8s video loadstart ct=0
+31.0s video canplay ct=0
+35.5s runner user-play (player is paused after an error)
+35.5s video playing ct=0
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
