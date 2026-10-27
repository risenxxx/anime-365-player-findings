# NetLog summary (redacted)

```json
{
 "requests": 13,
 "byStatus": {
  "206": 13
 },
 "errors": {
  "ERR_CACHE_LOCK_TIMEOUT": 1
 },
 "protocols": {
  "h2": 13
 },
 "exposeHeaders": [
  "content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid"
 ],
 "sessionsPerHost": {},
 "tcpConnects": 70
}
```

| t,s | url | range | status | content-range | expose | proto | MB | error | dur,s |
|---|---|---|---|---|---|---|---|---|---|
| 1 | https://cdn-1/<redacted>?m=m-A | bytes=0- | 206 | bytes 0-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h2 | 8 |  | 240.2 |
| 61.2 | https://cdn-1/<redacted>?m=m-A | bytes=190218240- | 206 | bytes 190218240-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h2 | 8 |  | 180 |
| 61.6 | https://cdn-1/<redacted>?m=m-A | bytes=8388608- | 206 | bytes 8388608-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h2 | 3.22 |  | 0.5 |
| 106.2 | https://cdn-1/<redacted>?m=m-A | bytes=409108480-644492799 | 206 | bytes 409108480-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h2 | 1.03 |  | 0.4 |
| 106.4 | https://cdn-1/<redacted>?m=m-A | bytes=198606848- | 206 | bytes 198606848-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h2 | 4.32 |  | 0.7 |
| 106.4 | https://cdn-1/<redacted>?m=m-A | bytes=409174016- | 206 | bytes 409174016-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h2 | 167.91 | ERR_CACHE_LOCK_TIMEOUT | 5.8 |
| 111.9 | https://cdn-3/<redacted>?m=m-A | bytes=408944640- | 206 | bytes 408944640-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h2 | 1.09 |  | 0.9 |
| 112.8 | https://cdn-3/<redacted>?m=m-A | bytes=585105408-644492799 | 206 | bytes 585105408-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h2 | 56.64 |  | 2.6 |
| 151.2 | https://cdn-1/<redacted>?m=m-A | bytes=84082688- | 206 | bytes 84082688-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h2 | 80.38 |  | 3.3 |
| 154.3 | https://cdn-1/<redacted>?m=m-A | bytes=83886080- | 206 | bytes 83886080-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h2 | 1.05 |  | 0.4 |
| 154.7 | https://cdn-1/<redacted>?m=m-A | bytes=167772160- | 206 | bytes 167772160-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h2 | 22.09 |  | 0.9 |
| 155.6 | https://cdn-1/<redacted>?m=m-A | bytes=198180864-644492799 | 206 | bytes 198180864-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h2 | 201.16 |  | 8.1 |
| 566.9 | https://cdn-1/<redacted>?m=m-A | bytes=105873408-309227071 | 206 | bytes 105873408-309227071/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h2 | 36 |  | 49.3 |
