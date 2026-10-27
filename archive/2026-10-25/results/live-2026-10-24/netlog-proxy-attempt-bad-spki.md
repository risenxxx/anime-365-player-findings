# NetLog summary (redacted)

```json
{
 "requests": 9,
 "byStatus": {
  "undefined": 9
 },
 "errors": {
  "ERR_CERT_AUTHORITY_INVALID": 9
 },
 "protocols": {
  "undefined": 9
 },
 "exposeHeaders": [],
 "sessionsPerHost": {},
 "tcpConnects": 80
}
```

| t,s | url | range | status | content-range | expose | proto | MB | error | dur,s |
|---|---|---|---|---|---|---|---|---|---|
| 1 | https://cdn-1/<redacted>?m=m-A |  |  |  |  |  | 0 | ERR_CERT_AUTHORITY_INVALID | 0.1 |
| 1 | https://cdn-1/<redacted>?m=m-A |  |  |  |  |  | 0 | ERR_CERT_AUTHORITY_INVALID | 0 |
| 1.1 | https://cdn-1/<redacted>?m=m-A |  |  |  |  |  | 0 | ERR_CERT_AUTHORITY_INVALID | 0 |
| 1.1 | https://cdn-1/<redacted>?m=m-A |  |  |  |  |  | 0 | ERR_CERT_AUTHORITY_INVALID | 0 |
| 1.7 | https://cdn-1/<redacted>?m=m-A |  |  |  |  |  | 0 | ERR_CERT_AUTHORITY_INVALID | 0 |
| 2.2 | https://cdn-1/<redacted>?m=m-A |  |  |  |  |  | 0 | ERR_CERT_AUTHORITY_INVALID | 0 |
| 2.8 | https://cdn-2/<redacted>?m=m-A |  |  |  |  |  | 0 | ERR_CERT_AUTHORITY_INVALID | 0.2 |
| 3.5 | https://cdn-2/<redacted>?m=m-A |  |  |  |  |  | 0 | ERR_CERT_AUTHORITY_INVALID | 0.2 |
| 4 | https://cdn-2/<redacted>?m=m-A |  |  |  |  |  | 0 | ERR_CERT_AUTHORITY_INVALID | 0.2 |
