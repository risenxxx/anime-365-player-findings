# h2b-decode-sw: Ошибка декодирования в середине (SW): ветка blacklist

Гипотеза: **H2b**. Вердикт: **не воспроизводится** (код с патчами: all).

Ошибок: 6, но позиция восстановлена (последняя ct=189.28). Коды ошибок: {"3":6}; blacklist: 1; src с &rand: 1.

**Ожидалось:** MEDIA_ERR_DECODE → blacklist m → src(&rand) + load() без restoreLastTime → серия с начала.

**Что увидел пользователь:** ошибок <video>: 6 (коды 3×6); перезагрузок load() после старта: 6 (макс. 6/мин); сыграно 28 с, стояло 28 с; notifyBroken: 1.

**Сценарий:** CDN 4 МБ/с; байты 40–41 МБ файла заполнены нулями. Перемотка на 2:50, ждём ошибку.

| метрика | значение |
|---|---|
| ошибки <video> | +31.2s code=3 ct=189.31<br>+32.2s code=3 ct=189.29<br>+32.9s code=3 ct=189.33<br>+34.1s code=3 ct=189.33<br>+36.2s code=3 ct=189.33<br>+40.4s code=3 ct=189.28 |
| load() после старта / src с &rand | 6 / 1 |
| сброс в начало | [] |
| прыжки назад | [] |
| сыграно / стояло, с | 28 / 28 |
| notifyBroken (POST brokenVideo) | 1 |
| экземпляры SW (по обёртке логов) | imj2jc |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=2, browserReq=2, blacklistMsg=1, bypassBlacklisted=14, install=1, activate=1, evaluated=1 |
| запросы к CDN | 14 ({"empty":3,"video":11}; статусы {"206":14}; обрывов 0; 128.9 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.4s imj2jc [bench] SW script evaluated, instance=imj2jc script=?24
+0.5s imj2jc [SW] Install event fired at 1792882676008
+0.5s imj2jc [SW] Activate event fired at 1792882676008
+31.3s imj2jc [SW] Blacklisting mParam: bench-A
+31.3s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+31.5s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+32.8s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+32.8s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+32.8s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+32.8s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+32.8s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+33.9s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+34.0s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+36.1s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+36.1s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+36.1s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+40.2s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+40.4s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
```

### Таймлайн

```
+0.4s runner navigate
+0.4s sw-target created
+0.5s page: controllerchange
+0.8s runner navigate
+0.9s call src= el=main-video_html5_api
+0.9s call load el=main-video_html5_api ct=0
+0.9s video emptied ct=0
+0.9s video loadstart ct=0
+1.1s runner mute
+1.3s video canplay ct=0
+1.8s runner play
+1.8s video playing ct=0
+11.8s runner seek 170
+11.8s video seeking ct=170
+11.8s video waiting ct=170
+11.9s video canplay ct=170
+11.9s video playing ct=170
+31.2s video error ct=189.31 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+31.3s player: MEDIA_ERR_DECODE: Blacklisting mParam bench-A and retrying immediately
+31.3s video pause ct=189.31 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+31.3s call src= el=main-video_html5_api +rand
+31.3s call load el=main-video_html5_api ct=0
+31.3s call load el=main-video_html5_api ct=0
+31.3s video emptied ct=0
+31.3s video loadstart ct=0
+31.5s video canplay ct=0
+31.5s video seeking ct=189.07
+31.5s video waiting ct=189.07
+32.0s video canplay ct=189.07
+32.0s video playing ct=189.07
+32.2s video error ct=189.29 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+32.3s player: Error #3: The video playback was aborted due to a corruption problem or because the video used features your browser did not support.
+32.3s player: Current time:  189.285598
+32.3s video pause ct=189.29 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+32.8s call load el=main-video_html5_api ct=189.29
+32.8s video emptied ct=0
+32.8s video loadstart ct=0
+32.8s video canplay ct=0
+32.8s video seeking ct=189.29
+32.8s video waiting ct=189.29
+32.8s video canplay ct=189.29
+32.8s video playing ct=189.29
+32.9s video error ct=189.33 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+32.9s player: Error #3: The video playback was aborted due to a corruption problem or because the video used features your browser did not support.
+32.9s player: Current time:  189.301722
+32.9s video pause ct=189.33 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+33.9s call load el=main-video_html5_api ct=189.33
+33.9s video emptied ct=0
+33.9s video loadstart ct=0
+33.9s video canplay ct=0
+33.9s video seeking ct=189.3
+33.9s video waiting ct=189.3
+34.0s video canplay ct=189.3
+34.0s video playing ct=189.3
+34.1s video error ct=189.33 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+34.1s player: Error #3: The video playback was aborted due to a corruption problem or because the video used features your browser did not support.
+34.1s player: Current time:  189.301778
+34.1s video pause ct=189.33 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+36.1s player: using alternative sources
+36.1s call load el=main-video_html5_api ct=189.33
+36.1s video emptied ct=0
+36.1s video loadstart ct=0
+36.1s video canplay ct=0
+36.1s video seeking ct=189.3
+36.1s video waiting ct=189.3
+36.1s video canplay ct=189.3
+36.1s video playing ct=189.3
+36.2s video error ct=189.33 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+36.2s player: Error #3: The video playback was aborted due to a corruption problem or because the video used features your browser did not support.
+36.2s player: Current time:  189.301838
+36.2s video pause ct=189.33 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+40.2s call load el=main-video_html5_api ct=189.33
+40.2s video emptied ct=0
+40.2s video loadstart ct=0
+40.2s video canplay ct=0
+40.2s video seeking ct=189.2
+40.2s video waiting ct=189.2
+40.3s video canplay ct=189.2
+40.3s video playing ct=189.2
+40.4s video error ct=189.28 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+40.4s player: Error #3: The video playback was aborted due to a corruption problem or because the video used features your browser did not support.
+40.4s player: Current time:  189.201898
+40.4s player: Notify broken.
+40.4s video pause ct=189.28 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+44.9s runner user-play (player is paused after an error)
+44.9s video playing ct=189.28 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 71.8,
  "state": {
   "ct": 189.281994,
   "paused": false,
   "errorCounter": 5,
   "lastSuccessTime": 189.281994,
   "blacklisted": [
    "bench-A"
   ],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 1
  }
 }
]
```
