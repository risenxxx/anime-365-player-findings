# h2a-no-sw-support: Без контроллера SW: ошибка на старте (ct=0), затем ошибка на ~3:09

Гипотеза: **H2a**. Вердикт: **не воспроизводится**.

Ошибок: 6, но позиция восстановлена (последняя ct=189.37). Ошибки: code 4 при ct=0, code 3 при ct=189.3, code 3 при ct=189.33, code 3 при ct=189.37, code 3 при ct=189.37, code 3 при ct=189.37.

**Ожидалось:** Ошибка code 4 при ct=0 → lastSuccessTime=0 навсегда; вторая ошибка (декодирование на ~3:09) → load() без восстановления → позиция 0, пауза.

**Что увидел пользователь:** ошибок <video>: 6 (коды 3×5, 4×1); перезагрузок load() после старта: 5 (макс. 5/мин); сыграно 34 с, стояло 8 с; notifyBroken: 1.

**Сценарий:** sworker.js отдаёт 404 (SW не регистрируется). Первый медиазапрос → 503. «Пользователь» жмёт Play. Байты 40–41 МБ занулены; перемотка на 2:50.

| метрика | значение |
|---|---|
| ошибки <video> | +0.1s code=4 ct=0<br>+40.4s code=3 ct=189.3<br>+41.7s code=3 ct=189.33<br>+44.2s code=3 ct=189.37<br>+48.5s code=3 ct=189.37<br>+52.4s code=3 ct=189.37 |
| load() после старта / src с &rand | 5 / 0 |
| сброс в начало | [] |
| прыжки назад | [] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 34 / 8 |
| notifyBroken (POST brokenVideo) | 1 |
| экземпляры SW (по обёртке логов) | — |
| DevTools подключались к SW | нет |
| строки SW | — |
| запросы к CDN | 13 ({"video":13}; статусы {"206":12,"503":1}; обрывов 0; 40.1 МБ; одновременно до 1) |

`dest=video` — запрос самого `<video>` мимо SW, `dest=empty` — `fetch()` из SW.

### Ключевые строки SW

```
(нет)
```

### Таймлайн

```
+0.0s runner navigate
+0.1s call src= el=main-video_html5_api
+0.1s call load el=main-video_html5_api ct=0
+0.1s video emptied ct=0
+0.1s sw-target created
+0.1s video loadstart ct=0
+0.1s video error ct=0 code=4 "MEDIA_ELEMENT_ERROR: Format error"
+0.3s runner mute
+0.6s call load el=main-video_html5_api ct=0
+0.6s video emptied ct=0
+0.6s video loadstart ct=0
+0.9s video seeking ct=0
+1.0s video canplay ct=0
+4.5s runner user-play (player is paused after an error)
+4.6s video playing ct=0
+5.5s runner play
+20.5s runner seek 170
+20.5s video seeking ct=170
+20.5s video waiting ct=170
+21.1s video canplay ct=170
+21.1s video playing ct=170
+40.4s video error ct=189.3 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+40.4s video pause ct=189.3 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+41.5s call load el=main-video_html5_api ct=189.3
+41.5s video emptied ct=0
+41.5s video loadstart ct=0
+41.5s video seeking ct=189.3
+41.6s video canplay ct=189.3
+41.6s video playing ct=189.3
+41.7s video error ct=189.33 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+41.7s video pause ct=189.33 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+43.4s call src= el=main-video_html5_api
+43.4s call load el=main-video_html5_api ct=0
+43.4s call load el=main-video_html5_api ct=0
+43.4s video emptied ct=0
+43.4s video loadstart ct=0
+43.6s video seeking ct=189.33
+44.1s video canplay ct=189.33
+44.1s video playing ct=189.33
+44.2s video error ct=189.37 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+44.2s video pause ct=189.37 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+48.4s call load el=main-video_html5_api ct=189.37
+48.4s video emptied ct=0
+48.4s video loadstart ct=0
+48.4s video seeking ct=189.37
+48.5s video canplay ct=189.37
+48.5s video playing ct=189.37
+48.5s video error ct=189.37 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=189610667 duration=21333 size=347 is_key_frame=1 encrypted=0}"
+48.5s video pause ct=189.37 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=189610667 duration=21333 size=347 is_key_frame=1 encrypted=0}"
+52.3s call load el=main-video_html5_api ct=189.37
+52.3s video emptied ct=0
+52.3s video loadstart ct=0
+52.3s video seeking ct=189.37
+52.4s video canplay ct=189.37
+52.4s video playing ct=189.37
+52.4s video error ct=189.37 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=189610667 duration=21333 size=347 is_key_frame=1 encrypted=0}"
+52.4s video pause ct=189.37 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=189610667 duration=21333 size=347 is_key_frame=1 encrypted=0}"
+56.6s runner user-play (player is paused after an error)
+56.6s video playing ct=189.37 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=189610667 duration=21333 size=347 is_key_frame=1 encrypted=0}"
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 66,
  "state": {
   "ct": 189.371034,
   "paused": false,
   "errorCounter": 6,
   "lastSuccessTime": 189.371034,
   "blacklisted": [],
   "ctrl": false,
   "rs": 4
  },
  "cache": {}
 }
]
```
