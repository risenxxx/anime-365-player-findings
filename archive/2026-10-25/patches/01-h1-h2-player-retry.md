# Патч 01 — ретраи и восстановление позиции в плеере (H1, H2a, H2b)

Читаемая версия [`01-h1-h2-player-retry.patch`](01-h1-h2-player-retry.patch). `.patch`
наложен на prettified‑копию минифицированного файла и нужен стенду. Переносить правку в
исходник удобнее по этому описанию.

## Где

- **Файл:** плагин `concatenatePlugin`, на сайте — `/js/lib/videojs.concatenate.min.js?1789631056`.
  Это собственный плагин сайта поверх video.js 4.x.
- **Функции:** `onError` (повешен на `player.on('error', …)`) и `restoreLastTime`.
- **Как найти в исходнике:** по строкам логов, они переживают минификацию:
  - `"errors in row. Exit."`, `"Notify broken."`, `"Error #"`, `"Current time: "` — `onError`;
  - `": Blacklisting mParam"` и `"and retrying immediately"` — ветка blacklist в начале `onError`.
- **Строки в prettified‑копии:** `onError` — 51-72, `restoreLastTime` — 72-74.

## Обозначения

В минифицированном коде `v` — это плеер video.js (`this` плагина), `m` — состояние плагина
(`player.concatenate`). Ниже они названы `player` и `plugin`.

## Было

Семантика один в один с оригиналом. Цепочки через `,` и `&&` развёрнуты в обычный код.

```js
plugin.onError = function () {
  const error = player.error();

  // Ветка A: ошибка декодирования / неподдерживаемый источник при активном SW.
  if (error && (error.code === 3 || error.code === 4) &&
      navigator.serviceWorker && navigator.serviceWorker.controller) {
    const src = player.currentSrc();
    if (src) {
      try {
        const mParam = new URL(src).searchParams.get('m');
        if (mParam && !plugin._blacklistedMParams[mParam]) {
          console.log((error.code === 3 ? 'MEDIA_ERR_DECODE' : 'MEDIA_ERR_SRC_NOT_SUPPORTED') +
                      ': Blacklisting mParam', mParam, 'and retrying immediately');
          plugin._blacklistedMParams[mParam] = true;
          navigator.serviceWorker.controller.postMessage({ type: 'blacklist', mParam });
          player.errorCounter = 0;                     // (1) H1: счётчик обнуляется и здесь
          setTimeout(() => {
            player.src(src + '&rand=' + Math.random());
            player.load();
          }, 0);
          return;                                      // (2) H2b: restoreLastTime не подключён
        }
      } catch (e) {
        console.log('Error extracting mParam:', e);
      }
    }
  }

  // Ветка B: все остальные ошибки.
  if (error == null || window.location.href.indexOf('embedTest') !== -1) return;

  if (player.lastSuccessTime == null) {                // (3) H2a: пишется только если null
    const cached = player.cache_.currentTime;
    player.lastSuccessTime = cached == 0 ? player.currentTime() : cached;
  }
  console.log('Error #' + error.code + ': ' + error.message);
  console.log('Current time: ', player.lastSuccessTime);
  console.log(error);

  player.errorCounter++;
  if (player.errorCounter > 4) {
    console.log(player.errorCounter + ' errors in row. Exit.');
    console.log('Notify broken.');
    plugin.notifyBroken();
    return;
  }

  player.one('playing', () => { player.errorCounter = 0; });   // (4) H1: сброс по первому playing

  const reload = () => {
    if (player.el_ === null) return;
    if (player.errorCounter > 3 && player.lastSuccessTime > 0.1) player.lastSuccessTime -= 0.1;
    player.off('canplay', plugin.restoreLastTime);
    player.one('canplay', plugin.restoreLastTime);
    if (player.errorCounter < 3 || !plugin.useAlternativeSources()) player.load();
  };
  setTimeout(reload, 500);   // в оригинале `1 <= errorCounter ? setTimeout(o, 500) : o()`;
                             // после ++ errorCounter всегда >= 1, поэтому всегда 500 мс
};

plugin.restoreLastTime = function () {
  if (player.lastSuccessTime > 0) {                    // (5) H2a: значение 0 никогда не сбрасывается в null
    player.currentTime(player.lastSuccessTime);
    player.lastSuccessTime = null;
    player.play();
  }
};
```

Что именно не так:

- **(4) H1.** После `load()` видео обычно успевает заиграть, `playing` обнуляет счётчик, и
  порог `> 4` недостижим. Сбой, который повторяется после каждой перезагрузки, даёт вечный
  цикл без `notifyBroken`. (1) — то же в ветке A.
- **(3)+(5) H2a.** Первая ошибка при `ct = 0` записывает `0`. `restoreLastTime` его не
  сбрасывает (условие `> 0`), а (3) больше не перезаписывает. Следующая ошибка в середине
  серии позицию не восстанавливает: серия с 0:00, на паузе. На практике так бывает без
  контроллера SW — при контроллере ошибка code 4 на старте уходит в ветку A.
- **(2) H2b.** Ветка A перезагружает источник и выходит до подключения `restoreLastTime`.
  Ошибка декодирования в середине серии всегда отправляет в 0:00.

## Стало

```js
plugin.onError = function () {
  const error = player.error();

  // [H2] Последняя хорошая позиция обновляется при КАЖДОЙ ошибке и хранится отдельно
  // от флага «нужно восстановить». 0 (позиция сразу после load()) её не затирает.
  const cur = player.cache_.currentTime || player.currentTime();
  if (cur > 0.5) player.lastSuccessTime = cur;

  // Ветка A
  if (error && (error.code === 3 || error.code === 4) &&
      navigator.serviceWorker && navigator.serviceWorker.controller) {
    const src = player.currentSrc();
    if (src) {
      try {
        const mParam = new URL(src).searchParams.get('m');
        if (mParam && !plugin._blacklistedMParams[mParam]) {
          console.log(/* как было */);
          plugin._blacklistedMParams[mParam] = true;
          navigator.serviceWorker.controller.postMessage({ type: 'blacklist', mParam });
          // [H1] счётчик здесь больше не обнуляется
          // [H2b] перезагрузка после blacklist тоже восстанавливает позицию
          player.restorePending = true;
          player.off('canplay', plugin.restoreLastTime);
          player.one('canplay', plugin.restoreLastTime);
          setTimeout(() => {
            player.src(src + '&rand=' + Math.random());
            player.load();
          }, 0);
          return;
        }
      } catch (e) {
        console.log('Error extracting mParam:', e);
      }
    }
  }

  // Ветка B
  if (error == null || window.location.href.indexOf('embedTest') !== -1) return;

  // [H1] Ошибки считаются в скользящем окне 2 минуты; сброса по `playing` больше нет.
  const now = Date.now();
  player.errorTimes = (player.errorTimes || []).filter(t => now - t < 120000);
  player.errorTimes.push(now);
  player.errorCounter = player.errorTimes.length;

  console.log('Error #' + error.code + ': ' + error.message);
  console.log('Current time: ', player.lastSuccessTime);
  console.log(error);

  if (player.errorCounter > 4) {
    console.log(player.errorCounter + ' errors in 2 min. Exit.');
    console.log('Notify broken.');
    plugin.notifyBroken();
    return;
  }

  player.restorePending = true;
  const reload = () => {
    if (player.el_ === null) return;
    if (player.errorCounter > 3 && player.lastSuccessTime > 0.1) player.lastSuccessTime -= 0.1;
    player.off('canplay', plugin.restoreLastTime);
    player.one('canplay', plugin.restoreLastTime);
    if (player.errorCounter < 3 || !plugin.useAlternativeSources()) player.load();
  };
  // [H1] растущая пауза: 0.5, 1, 2, 4 с
  setTimeout(reload, 500 * Math.pow(2, player.errorCounter - 1));
};
player.on('error', plugin.onError);

// [H2] Позиция обновляется и при обычной игре, кроме времени, пока ждём восстановления.
player.on('timeupdate', () => {
  const c = player.currentTime();
  if (!player.restorePending && c > 0.5) player.lastSuccessTime = c;
});

plugin.restoreLastTime = function () {
  // Восстанавливаем, только если об этом просили; флаг всегда сбрасываем.
  if (player.restorePending && player.lastSuccessTime > 0) {
    player.currentTime(player.lastSuccessTime);
    player.play();
  }
  player.restorePending = false;
};
```

## Инварианты

- `lastSuccessTime` — только позиция. Решение «восстанавливать или нет» принимает
  `restorePending`.
- `lastSuccessTime` никогда не становится `0` из‑за ошибки или перезагрузки: значения
  `≤ 0.5` игнорируются.
- **Каждый** путь перезагрузки (ветка A, ветка B, в патче 05 — смена ссылки) выставляет
  `restorePending = true` и подключает `restoreLastTime` на `canplay`.
- `errorCounter` — число ошибок за последние 120 с. Ничто не обнуляет его досрочно.
- `player.currentTime()` вызывается через video.js, а не через `<video>`: так учитываются
  смещения частей (`currentVideoStart`).

## Проверка и результат

Сценарии стенда: `node runner/run.mjs --patched=all h1-cut503-nosw h2a-no-sw-support h2b-decode-sw`.

| Сценарий | Без патча | С патчем |
|---|---|---|
| `h1-cut503-nosw` | 6 ошибок, цикл, `notifyBroken` = 0, сыграно 142 с | 5 ошибок, `notifyBroken` = 1, сыграно 112 с |
| `h2a-no-sw-support` | ошибка на 3:09 → позиция 0:00 | позиция 3:09 сохраняется; байты там испорчены, ошибка повторяется 4 раза → `notifyBroken` |
| `h2b-decode-sw` | ошибка на 3:09 → позиция 0:00 | позиция 3:09 сохраняется; ошибка повторяется 6 раз → `notifyBroken` |

## Что патч не решает

- После `notifyBroken` плеер стоит: пользователь видит меньше видео, чем с багом. Нужна
  лестница «тот же источник → свежие ссылки → альтернативный источник → сообщение и
  фоновые попытки» ([SOLUTIONS.md, H1](../SOLUTIONS.md#h1-бесконечный-цикл-перезагрузок)).
- Если байты испорчены на самом CDN, восстановление ведёт на то же место, и ошибка
  повторяется. Нужно перешагивать: при повторной ошибке декодирования в пределах ±1 с
  восстанавливаться на 2–5 с дальше
  ([SOLUTIONS.md, H2](../SOLUTIONS.md#h2-прыжок-в-начало-серии-после-ошибки)).
- После восстановления вызывается `play()`, даже если пользователь стоял на паузе.
  Стоит запоминать, играло ли видео до ошибки.
