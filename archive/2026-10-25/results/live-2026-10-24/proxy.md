# Живая запись (proxy), 2026-10-24

Профиль: отдельный тестовый; CDP только к странице; звук выключен в плеере.
Сценарий: старт, 60 с, перемотки на 7:00 / 15:00 / 3:00 (по 45 с), пауза 330 с, продолжение 90 с.

```json
{
 "errors": [],
 "errorCodes": {},
 "loadsAfterStart": 0,
 "resetToZero": [],
 "backJumps": [],
 "playedSec": 169,
 "stalledSec": 71,
 "controllerLost": false,
 "swTargets": [
  {
   "t": 0,
   "ev": "created"
  },
  {
   "t": 509.9,
   "ev": "created"
  },
  {
   "t": 566.3,
   "ev": "created"
  }
 ],
 "finalState": {
  "ct": 274.204133,
  "paused": false,
  "errorCounter": 0,
  "lastSuccessTime": null,
  "blacklisted": [],
  "ctrl": true,
  "rs": 4
 }
}
```

## Строки плеера (консоль embed)

```
+0.8s [Player] _pushBackgroundSourcesToServiceWorker called, controller: true sources: 6
+0.8s [Player] Sent background sources to SW: 6 mParams
+1.0s [Player] Sent video state to SW: playing mParam: m-A time: 0
+6.0s [Player] Sent video state to SW: playing mParam: m-A time: 4.414021
+11.0s [Player] Sent video state to SW: playing mParam: m-A time: 9.415428
+16.0s [Player] Sent video state to SW: playing mParam: m-A time: 14.414271
+21.0s [Player] Sent video state to SW: playing mParam: m-A time: 17.900051
+26.0s [Player] Sent video state to SW: playing mParam: m-A time: 17.900051
+31.0s [Player] Sent video state to SW: playing mParam: m-A time: 17.900051
+36.0s [Player] Sent video state to SW: playing mParam: m-A time: 17.900051
+41.0s [Player] Sent video state to SW: playing mParam: m-A time: 17.900051
+46.0s [Player] Sent video state to SW: playing mParam: m-A time: 17.900051
+51.0s [Player] Sent video state to SW: playing mParam: m-A time: 17.900051
+56.0s [Player] Sent video state to SW: playing mParam: m-A time: 17.900051
+61.0s [Player] Sent video state to SW: playing mParam: m-A time: 17.900051
+66.0s [Player] Sent video state to SW: playing mParam: m-A time: 424.496433
+71.0s [Player] Sent video state to SW: playing mParam: m-A time: 429.496692
+76.0s [Player] Sent video state to SW: playing mParam: m-A time: 434.220138
+81.0s [Player] Sent video state to SW: playing mParam: m-A time: 434.220138
+86.0s [Player] Sent video state to SW: playing mParam: m-A time: 434.220138
+91.0s [Player] Sent video state to SW: playing mParam: m-A time: 434.220138
+96.0s [Player] Sent video state to SW: playing mParam: m-A time: 434.220138
+101.0s [Player] Sent video state to SW: playing mParam: m-A time: 434.220138
+106.0s [Player] Sent video state to SW: playing mParam: m-A time: 434.220138
+111.0s [Player] Sent video state to SW: playing mParam: m-A time: 904.494015
+116.0s [Player] Sent video state to SW: playing mParam: m-A time: 909.492023
+121.0s [Player] Sent video state to SW: playing mParam: m-A time: 914.491529
+126.0s [Player] Sent video state to SW: playing mParam: m-A time: 919.491207
+131.0s [Player] Sent video state to SW: playing mParam: m-A time: 924.492577
+136.0s [Player] Sent video state to SW: playing mParam: m-A time: 929.491341
+141.0s [Player] Sent video state to SW: playing mParam: m-A time: 934.492262
+146.0s [Player] Sent video state to SW: playing mParam: m-A time: 939.490313
+151.0s [Player] Sent video state to SW: playing mParam: m-A time: 944.491117
+156.0s [Player] Sent video state to SW: playing mParam: m-A time: 184.569962
+161.0s [Player] Sent video state to SW: playing mParam: m-A time: 189.574168
+166.0s [Player] Sent video state to SW: playing mParam: m-A time: 194.569008
+171.0s [Player] Sent video state to SW: playing mParam: m-A time: 199.569636
+176.0s [Player] Sent video state to SW: playing mParam: m-A time: 204.569454
+181.0s [Player] Sent video state to SW: playing mParam: m-A time: 209.569877
+186.0s [Player] Sent video state to SW: playing mParam: m-A time: 214.569381
+191.0s [Player] Sent video state to SW: playing mParam: m-A time: 219.570199
+196.0s [Player] Sent video state to SW: playing mParam: m-A time: 224.569404
+196.0s [Player] Sent video state to SW: paused mParam: m-A time: 224.588738
+526.0s [Player] Sent video state to SW: playing mParam: m-A time: 224.588738
+526.0s [Player] Sent video state to SW: paused mParam: m-A time: 224.588738
+566.3s [Player] Sent video state to SW: playing mParam: m-A time: 224.588738
+571.3s [Player] Sent video state to SW: playing mParam: m-A time: 229.525561
+576.3s [Player] Sent video state to SW: playing mParam: m-A time: 234.523151
+581.3s [Player] Sent video state to SW: playing mParam: m-A time: 239.524577
+586.3s [Player] Sent video state to SW: playing mParam: m-A time: 244.527133
+591.3s [Player] Sent video state to SW: playing mParam: m-A time: 249.526935
+596.3s [Player] Sent video state to SW: playing mParam: m-A time: 254.526942
+601.3s [Player] Sent video state to SW: playing mParam: m-A time: 259.523767
+606.3s [Player] Sent video state to SW: playing mParam: m-A time: 264.523216
+611.3s [Player] Sent video state to SW: playing mParam: m-A time: 269.526858
```

NetLog: `node scripts/netlog-summary.mjs captures/raw/live-2026-10-24T20-47-21.netlog` (выход уже отредактирован).
