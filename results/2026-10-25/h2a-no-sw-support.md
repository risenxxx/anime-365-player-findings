# h2a-no-sw-support: Без контроллера SW: ошибка на старте (ct=0), затем ошибка на ~3:09

Гипотеза: **H2a**. Вердикт: **воспроизведено**.

После ошибки позиция ушла в начало: 189 с → 0 с. Ошибки: code 4 при ct=0, code 3 при ct=189.23.

**Ожидалось:** Ошибка code 4 при ct=0 → lastSuccessTime=0 навсегда; вторая ошибка (декодирование на ~3:09) → load() без восстановления → позиция 0, пауза.

**Что увидел пользователь:** ошибок <video>: 2 (коды 3×1, 4×1); перезагрузок load() после старта: 1 (макс. 1/мин); сброс в начало после ошибки: 189→0 с; прыжков назад >5 с: 1; сыграно 54 с, стояло 0 с; notifyBroken: 0.

**Сценарий:** sworker.js отдаёт 404 (SW не регистрируется). Первый медиазапрос → 503. «Пользователь» жмёт Play. Байты 40–41 МБ занулены; перемотка на 2:50.

| метрика | значение |
|---|---|
| ошибки <video> | +0.1s code=4 ct=0<br>+40.3s code=3 ct=189.23 |
| load() после старта / src с &rand | 1 / 0 |
| сброс в начало | [{"t":40.3,"before":189.23,"after":0,"pausedAfter":false}] |
| прыжки назад | [{"t":41,"from":188.93,"to":0}] |
| перемотка не сработала | [] |
| сыграно / стояло, с | 54 / 0 |
| notifyBroken (POST brokenVideo) | 0 |
| экземпляры SW (по обёртке логов) | — |
| DevTools подключались к SW | нет |
| строки SW | — |
| запросы к CDN | 4 ({"video":4}; статусы {"206":3,"503":1}; обрывов 0; 29.5 МБ; одновременно до 1) |

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
+0.1s video loadstart ct=0
+0.1s video error ct=0 code=4 "MEDIA_ELEMENT_ERROR: Format error"
+0.1s sw-target created
+0.1s player: Error #4: The video could not be loaded, either because the server or network failed or because the format is not supported.
+0.1s player: Current time:  0
+0.3s runner mute
+0.6s call load el=main-video_html5_api ct=0
+0.6s video emptied ct=0
+0.6s video loadstart ct=0
+1.0s video canplay ct=0
+4.5s runner user-play (player is paused after an error)
+4.5s video playing ct=0
+5.5s runner play
+20.5s runner seek 170
+20.5s video seeking ct=170
+20.5s video waiting ct=170
+21.1s video canplay ct=170
+21.1s video playing ct=170
+40.3s video error ct=189.23 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+40.3s player: Error #3: The video playback was aborted due to a corruption problem or because the video used features your browser did not support.
+40.3s player: Current time:  0
+40.3s video pause ct=189.23 code=3 "PipelineStatus::PIPELINE_ERROR_DECODE: Error Domain=NSOSStatusErrorDomain Code=-12909 "(null)" (-12909): VTDecompressionOutputCallback"
+40.8s call load el=main-video_html5_api ct=189.23
+40.8s video emptied ct=0
+40.8s video loadstart ct=0
+40.9s video canplay ct=0
+44.6s runner user-play (player is paused after an error)
+44.6s video playing ct=0
```

### Снимки состояния

```json
[
 {
  "label": "end",
  "t": 66.1,
  "state": {
   "ct": 20.882606,
   "paused": false,
   "errorCounter": 0,
   "lastSuccessTime": 0,
   "blacklisted": [],
   "ctrl": false,
   "rs": 4
  },
  "cache": {}
 }
]
```
