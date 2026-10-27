# NetLog summary (redacted)

```json
{
 "requests": 8,
 "byStatus": {
  "206": 8
 },
 "errors": {},
 "protocols": {
  "h2": 1,
  "h3": 7
 },
 "exposeHeaders": [
  "content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid"
 ],
 "sessionsPerHost": {},
 "tcpConnects": 138
}
```

| t,s | url | range | status | content-range | expose | proto | MB | error | dur,s |
|---|---|---|---|---|---|---|---|---|---|
| 1.4 | https://cdn-1/<redacted>?m=m-A | bytes=0- | 206 | bytes 0-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h2 | 37.62 |  | 60 |
| 61.5 | https://cdn-1/<redacted>?m=m-A | bytes=190218240- | 206 | bytes 190218240-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h3 | 63.22 |  | 3.5 |
| 64.7 | https://cdn-1/<redacted>?m=m-A | bytes=189792256- | 206 | bytes 189792256-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h3 | 1.23 |  | 0.4 |
| 65.1 | https://cdn-1/<redacted>?m=m-A | bytes=255852544- | 206 | bytes 255852544-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h3 | 370.64 |  | 11 |
| 151.5 | https://cdn-1/<redacted>?m=m-A | bytes=84082688- | 206 | bytes 84082688-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h3 | 74.67 |  | 3.9 |
| 155.1 | https://cdn-1/<redacted>?m=m-A | bytes=83886080- | 206 | bytes 83886080-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h3 | 1.05 |  | 0.3 |
| 155.5 | https://cdn-1/<redacted>?m=m-A | bytes=161480704- | 206 | bytes 161480704-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h3 | 0.94 |  | 15.2 |
| 170.8 | https://cdn-1/<redacted>?m=m-A | bytes=161480704- | 206 | bytes 161480704-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h3 | 27.04 |  | 1.3 |
