# h2b-decode-sw: Ошибка декодирования в середине (SW): ветка blacklist

Гипотеза: **H2b**. Вердикт: **не воспроизводится** (код с патчами: all).

Ошибок: 6, но позиция восстановлена (последняя ct=189.28). Коды ошибок: {"3":6}; blacklist: 1; src с &rand: 1.

**Ожидалось:** MEDIA_ERR_DECODE → blacklist m → src(&rand) + load() без restoreLastTime → серия с начала.

**Что увидел пользователь:** ошибок <video>: 6 (коды 3×6); перезагрузок load() после старта: 6 (макс. 6/мин); сыграно 28 с, стояло 28 с; notifyBroken: 1.

**Сценарий:** CDN 4 МБ/с; байты 40–41 МБ файла заполнены нулями. Перемотка на 2:50, ждём ошибку.

| метрика | значение |
|---|---|
| ошибки <video> | +30.9s code=3 ct=189.31<br>+31.9s code=3 ct=189.29<br>+32.6s code=3 ct=189.33<br>+33.7s code=3 ct=189.33<br>+35.9s code=3 ct=189.33<br>+40.1s code=3 ct=189.28 |
| load() после старта / src с &rand | 6 / 1 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 28 / 28 |
| notifyBroken (POST brokenVideo) | 1 |
| экземпляры SW (по обёртке логов) | imj2jc |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=2, browserReq=2, blacklistMsg=1, bypassBlacklisted=14, install=1, activate=1, evaluated=1 |
| запросы к CDN | 14 ({"empty":3,"video":11}; статусы {"206":14}; обрывов 0; 128.9 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s imj2jc [bench] SW script evaluated, instance=imj2jc script=?24
+0.1s imj2jc [SW] Install event fired at 1792882676008
+0.1s imj2jc [SW] Activate event fired at 1792882676008
+30.9s imj2jc [SW] Blacklisting mParam: bench-A
+30.9s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+31.2s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+32.4s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+32.4s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+32.4s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+32.4s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+32.4s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+33.6s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+33.7s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+35.7s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+35.7s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+35.7s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+39.9s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
+40.0s imj2jc [SW] mParam bench-A is blacklisted, bypassing cache
```

### Таймлайн

```
+0.1s runner navigate
+0.1s sw-target created
+0.1s page: controllerchange
+0.5s runner navigate
+0.5s call src= el=main-video_html5_api
+0.5s call load el=main-video_html5_api ct=0
+0.6s video emptied ct=0
+0.6s video loadstart ct=0
+0.7s runner mute
+0.9s video canplay ct=0
+1.5s runner play
+1.5s video playing ct=0
+11.5s runner seek 170
+11.5s video seeking ct=170
+11.5s video waiting ct=170
+11.5s video canplay ct=170
+11.5s video playing ct=170
+30.9s video error ct=189.31 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+30.9s player: MEDIA_ERR_DECODE: Blacklisting mParam bench-A and retrying immediately
+30.9s video pause ct=189.31 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+30.9s call src= el=main-video_html5_api +rand
+30.9s call load el=main-video_html5_api ct=0
+30.9s call load el=main-video_html5_api ct=0
+30.9s video emptied ct=0
+30.9s video loadstart ct=0
+31.2s video canplay ct=0
+31.2s video seeking ct=189.07
+31.2s video waiting ct=189.07
+31.6s video canplay ct=189.07
+31.6s video playing ct=189.07
+31.9s video error ct=189.29 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+31.9s player: Error #3: The video playback was aborted due to a corruption problem or because the video used features your browser did not support.
+31.9s player: Current time:  189.285598
+31.9s video pause ct=189.29 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+32.4s call load el=main-video_html5_api ct=189.29
+32.4s video emptied ct=0
+32.4s video loadstart ct=0
+32.4s video canplay ct=0
+32.4s video seeking ct=189.29
+32.4s video waiting ct=189.29
+32.5s video canplay ct=189.29
+32.5s video playing ct=189.29
+32.6s video error ct=189.33 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+32.6s player: Error #3: The video playback was aborted due to a corruption problem or because the video used features your browser did not support.
+32.6s player: Current time:  189.301722
+32.6s video pause ct=189.33 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+33.6s call load el=main-video_html5_api ct=189.33
+33.6s video emptied ct=0
+33.6s video loadstart ct=0
+33.6s video canplay ct=0
+33.6s video seeking ct=189.3
+33.6s video waiting ct=189.3
+33.6s video canplay ct=189.3
+33.6s video playing ct=189.3
+33.7s video error ct=189.33 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+33.7s player: Error #3: The video playback was aborted due to a corruption problem or because the video used features your browser did not support.
+33.7s player: Current time:  189.301778
+33.7s video pause ct=189.33 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+35.7s player: using alternative sources
+35.7s call load el=main-video_html5_api ct=189.33
+35.7s video emptied ct=0
+35.7s video loadstart ct=0
+35.7s video canplay ct=0
+35.7s video seeking ct=189.3
+35.7s video waiting ct=189.3
+35.8s video canplay ct=189.3
+35.8s video playing ct=189.3
+35.9s video error ct=189.33 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+35.9s player: Error #3: The video playback was aborted due to a corruption problem or because the video used features your browser did not support.
+35.9s player: Current time:  189.301838
+35.9s video pause ct=189.33 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+39.9s call load el=main-video_html5_api ct=189.33
+39.9s video emptied ct=0
+39.9s video loadstart ct=0
+39.9s video canplay ct=0
+39.9s video seeking ct=189.2
+39.9s video waiting ct=189.2
+39.9s video canplay ct=189.2
+39.9s video playing ct=189.2
+40.1s video error ct=189.28 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+40.1s player: Error #3: The video playback was aborted due to a corruption problem or because the video used features your browser did not support.
+40.1s player: Current time:  189.201898
+40.1s player: Notify broken.
+40.1s video pause ct=189.28 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+44.5s runner user-play (player is paused after an error)
+44.5s video playing ct=189.28 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
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
