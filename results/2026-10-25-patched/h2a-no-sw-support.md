# h2a-no-sw-support: Без контроллера SW: ошибка на старте (ct=0), затем ошибка на ~3:09

Гипотеза: **H2a**. Вердикт: **не воспроизводится** (код с патчами: all).

Ошибок: 5, но позиция восстановлена (последняя ct=189.24). Ошибки: code 4 при ct=0, code 3 при ct=189.22, code 3 при ct=189.25, code 3 при ct=189.29, code 3 при ct=189.24.

**Ожидалось:** Ошибка code 4 при ct=0 → lastSuccessTime=0 навсегда; вторая ошибка (декодирование на ~3:09) → load() без восстановления → позиция 0, пауза.

**Что увидел пользователь:** ошибок <video>: 5 (коды 3×4, 4×1); перезагрузок load() после старта: 3 (макс. 3/мин); сыграно 34 с, стояло 12 с; notifyBroken: 1.

**Сценарий:** sworker.js отдаёт 404 (SW не регистрируется). Первый медиазапрос → 503. «Пользователь» жмёт Play. Байты 40–41 МБ занулены; перемотка на 2:50.

| метрика | значение |
|---|---|
| ошибки <video> | +0.1s code=4 ct=0<br>+40.4s code=3 ct=189.22<br>+41.7s code=3 ct=189.25<br>+43.9s code=3 ct=189.29<br>+48.1s code=3 ct=189.24 |
| load() после старта / src с &rand | 3 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 34 / 12 |
| notifyBroken (POST brokenVideo) | 1 |
| экземпляры SW (по обёртке логов) | — |
| DevTools подключались к SW | нет |
| строки SW | — |
| запросы к CDN | 4 ({"video":4}; статусы {"206":3,"503":1}; обрывов 0; 27.8 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
(нет)
```

### Таймлайн

```
+0.1s runner navigate
+0.1s call src= el=main-video_html5_api
+0.1s call load el=main-video_html5_api ct=0
+0.1s video emptied ct=0
+0.1s video loadstart ct=0
+0.1s video error ct=0 code=4 "MEDIA_ELEMENT_ERROR: Format error"
+0.1s player: Error #4: The video could not be loaded, either because the server or network failed or because the format is not supported.
+0.1s player: Current time:  null
+0.1s sw-target created
+0.3s runner mute
+0.6s call load el=main-video_html5_api ct=0
+0.7s video emptied ct=0
+0.7s video loadstart ct=0
+1.0s video canplay ct=0
+4.6s runner user-play (player is paused after an error)
+4.6s video playing ct=0
+5.6s runner play
+20.6s runner seek 170
+20.6s video seeking ct=170
+20.6s video waiting ct=170
+21.1s video canplay ct=170
+21.1s video playing ct=170
+40.4s video error ct=189.22 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+40.4s player: Error #3: The video playback was aborted due to a corruption problem or because the video used features your browser did not support.
+40.4s player: Current time:  189.069373
+40.4s video pause ct=189.22 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+41.4s call load el=main-video_html5_api ct=189.22
+41.4s video emptied ct=0
+41.4s video loadstart ct=0
+41.4s video canplay ct=0
+41.4s video seeking ct=189.07
+41.4s video waiting ct=189.07
+41.5s video canplay ct=189.07
+41.5s video playing ct=189.07
+41.7s video error ct=189.25 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+41.7s player: Error #3: The video playback was aborted due to a corruption problem or because the video used features your browser did not support.
+41.7s player: Current time:  189.214372
+41.7s video pause ct=189.25 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+43.7s player: using alternative sources
+43.7s call load el=main-video_html5_api ct=189.25
+43.7s video emptied ct=0
+43.7s video loadstart ct=0
+43.7s video canplay ct=0
+43.7s video seeking ct=189.21
+43.7s video waiting ct=189.21
+43.8s video canplay ct=189.21
+43.8s video playing ct=189.21
+43.9s video error ct=189.29 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+43.9s player: Error #3: The video playback was aborted due to a corruption problem or because the video used features your browser did not support.
+43.9s player: Current time:  189.214415
+43.9s video pause ct=189.29 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+47.9s call load el=main-video_html5_api ct=189.29
+47.9s video emptied ct=0
+47.9s video loadstart ct=0
+47.9s video canplay ct=0
+47.9s video seeking ct=189.11
+47.9s video waiting ct=189.11
+48.0s video canplay ct=189.11
+48.0s video playing ct=189.11
+48.1s video error ct=189.24 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+48.1s player: Error #3: The video playback was aborted due to a corruption problem or because the video used features your browser did not support.
+48.1s player: Current time:  189.114477
+48.1s player: Notify broken.
+48.1s video pause ct=189.24 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+52.7s runner user-play (player is paused after an error)
+52.7s video playing ct=189.24 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 66.1,
  "state": {
   "ct": 189.241393,
   "paused": false,
   "errorCounter": 5,
   "lastSuccessTime": 189.241393,
   "blacklisted": [],
   "ctrl": false,
   "rs": 4
  },
  "cache": {}
 }
]
```
