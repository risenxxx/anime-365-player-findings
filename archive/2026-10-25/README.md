# Архив: расследование 24–25.10.2026

Первая версия этого репозитория, на коде сайта до исправлений
(`videojs.concatenate.min.js?1789631056`, `embed.min.js?1785943069`, `swMain.js?v=24`).
Сохранено как доказательная база и история.

- [REPORT.md](REPORT.md) — полный отчёт: гипотезы H1–H8, код, воспроизведение, логи, результат
  с патчами; в конце — раздел о проверке 27.10.
- [SOLUTIONS.md](SOLUTIONS.md) — предложения к старому коду.
- [patches/](patches/README.md) — патчи 01–07 к старому коду и их читаемые версии.
- [results/2026-10-25](results/2026-10-25/summary.md) — все сценарии на старом коде;
  [results/2026-10-25-patched](results/2026-10-25-patched/summary.md) — с патчами 01–07;
  [results/live-2026-10-24](results/live-2026-10-24/) — живые записи (без прокси и с прокси).

Чтобы прогнать стенд на старом коде, нужен манифест тех версий (`git log -- vendor-manifest.json`)
и `scripts/fetch-site.mjs`; патчи — из `archive/2026-10-25/patches/` в `patches/`.
Актуальное состояние — в корневых [README.md](../../README.md), [REPORT.md](../../REPORT.md),
[SOLUTIONS.md](../../SOLUTIONS.md).
