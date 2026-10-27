# h2b-decode-sw: Ошибка декодирования в середине (SW): ветка blacklist

Гипотеза: **H2b**. Вердикт: **не воспроизводится**.

Ошибок: 7, но позиция восстановлена (последняя ct=189.37). Коды ошибок: {"3":7}; blacklist: 0; src с &rand: 1.

**Ожидалось:** MEDIA_ERR_DECODE → blacklist m → src(&rand) + load() без restoreLastTime → серия с начала.

**Что увидел пользователь:** ошибок <video>: 7 (коды 3×7); перезагрузок load() после старта: 8 (макс. 8/мин); сыграно 28 с, стояло 20 с; notifyBroken: 1.

**Сценарий:** CDN 4 МБ/с; байты 40–41 МБ файла заполнены нулями. Перемотка на 2:50, ждём ошибку.

| метрика | значение |
|---|---|
| ошибки <video> | +30.9s code=3 ct=189.28<br>+31.7s code=3 ct=189.33<br>+32.9s code=3 ct=189.34<br>+35.5s code=3 ct=189.36<br>+39.4s code=3 ct=189.37<br>+43.4s code=3 ct=189.37<br>+69.4s code=3 ct=189.37 |
| load() после старта / src с &rand | 8 / 1 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 28 / 20 |
| notifyBroken (POST brokenVideo) | 1 |
| экземпляры SW (по обёртке логов) | j0kbml |
| DevTools подключались к SW | нет |
| строки SW | serveEnter=2, browserReq=2, blacklistMsg=1, bypassBlacklisted=19, install=1, activate=1, evaluated=1 |
| запросы к CDN | 17 ({"empty":3,"video":14}; статусы {"206":17}; обрывов 0; 130.4 МБ; одновременно до 2) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
+0.1s j0kbml [bench] SW script evaluated, instance=j0kbml script=?27
+0.1s j0kbml [SW] Install event fired at 1793115790201
+0.1s j0kbml [SW] Activate event fired at 1793115790203
+30.9s j0kbml [SW] Blacklisting mParam: bench-A
+30.9s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+31.1s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+32.7s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+32.8s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+32.8s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+32.8s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+32.8s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+34.7s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+35.0s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+39.4s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+39.4s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+43.3s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+43.4s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+43.4s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+43.4s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+43.4s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+69.3s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+69.3s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
+69.3s j0kbml [SW] mParam bench-A is blacklisted, bypassing cache
```

### Таймлайн

```
+0.1s runner navigate
+0.1s sw-target created
+0.1s page: controllerchange
+0.5s runner navigate
+0.5s call src= el=main-video_html5_api
+0.5s call load el=main-video_html5_api ct=0
+0.5s video emptied ct=0
+0.5s video loadstart ct=0
+0.7s runner mute
+0.9s video canplay ct=0
+1.5s runner play
+1.5s video playing ct=0
+11.5s runner seek 170
+11.5s video seeking ct=170
+11.5s video waiting ct=170
+11.5s video canplay ct=170
+11.5s video playing ct=170
+30.9s video error ct=189.28 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+30.9s video pause ct=189.28 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+30.9s call src= el=main-video_html5_api +rand
+30.9s call load el=main-video_html5_api ct=0
+30.9s call load el=main-video_html5_api ct=0
+30.9s video emptied ct=0
+30.9s video loadstart ct=0
+31.1s video seeking ct=189.28
+31.6s video canplay ct=189.28
+31.6s video playing ct=189.28
+31.7s video error ct=189.33 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+31.7s video pause ct=189.33 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+32.7s call load el=main-video_html5_api ct=189.33
+32.7s video emptied ct=0
+32.7s video loadstart ct=0
+32.8s video seeking ct=189.33
+32.8s video canplay ct=189.33
+32.8s video playing ct=189.33
+32.9s video error ct=189.34 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+32.9s video pause ct=189.34 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+34.7s call src= el=main-video_html5_api
+34.7s call load el=main-video_html5_api ct=0
+34.7s call load el=main-video_html5_api ct=0
+34.7s video emptied ct=0
+34.7s video loadstart ct=0
+35.0s video seeking ct=189.34
+35.4s video canplay ct=189.34
+35.4s video playing ct=189.34
+35.5s video error ct=189.36 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+35.5s video pause ct=189.36 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+39.4s call load el=main-video_html5_api ct=189.36
+39.4s video emptied ct=0
+39.4s video loadstart ct=0
+39.4s video seeking ct=189.36
+39.4s video canplay ct=189.36
+39.4s video playing ct=189.36
+39.4s video error ct=189.37 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+39.4s video pause ct=189.37 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+43.3s call load el=main-video_html5_api ct=189.37
+43.3s video emptied ct=0
+43.3s video loadstart ct=0
+43.4s video seeking ct=189.37
+43.4s video canplay ct=189.37
+43.4s video playing ct=189.37
+43.4s video error ct=189.37 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=189610667 duration=21333 size=347 is_key_frame=1 encrypted=0}"
+43.4s video pause ct=189.37 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=189610667 duration=21333 size=347 is_key_frame=1 encrypted=0}"
+47.5s runner user-play (player is paused after an error)
+47.5s video playing ct=189.37 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=189610667 duration=21333 size=347 is_key_frame=1 encrypted=0}"
+69.3s call load el=main-video_html5_api ct=189.37
+69.3s video emptied ct=0
+69.3s video loadstart ct=0
+69.3s video seeking ct=189.37
+69.4s video canplay ct=189.37
+69.4s video playing ct=189.37
+69.4s video error ct=189.37 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+69.4s video pause ct=189.37 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 71.9,
  "state": {
   "ct": 189.373005,
   "paused": true,
   "errorCounter": 7,
   "lastSuccessTime": 189.373005,
   "blacklisted": [
    "bench-A"
   ],
   "ctrl": true,
   "rs": 4
  },
  "cache": {
   "video-cache-meta": 0
  }
 }
]
```
