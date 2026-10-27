# NetLog summary (redacted)

```json
{
 "requests": 5,
 "byStatus": {
  "206": 5
 },
 "errors": {},
 "protocols": {
  "h2": 1,
  "h3": 4
 },
 "exposeHeaders": [
  "content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid"
 ],
 "sessionsPerHost": {},
 "tcpConnects": 76
}
```

| t,s | url | range | status | content-range | expose | proto | MB | error | dur,s |
|---|---|---|---|---|---|---|---|---|---|
| 1 | https://cdn-1/<redacted>?m=m-A | bytes=0- | 206 | bytes 0-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h2 | 90 |  | 4 |
| 1.9 | https://cdn-1/<redacted>?m=m-A | bytes=0- | 206 | bytes 0-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h3 | 1.24 |  | 0.5 |
| 4.7 | https://cdn-1/<redacted>?m=m-A | bytes=84934656- | 206 | bytes 84934656-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h3 | 1 |  | 0.6 |
| 5.3 | https://cdn-1/<redacted>?m=m-A | bytes=93323264-644492799 | 206 | bytes 93323264-644492799/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h3 | 525.64 |  | 22.6 |
| 526.1 | https://cdn-1/<redacted>?m=m-A | bytes=104759296-629062863 | 206 | bytes 104759296-629062863/644492800 | content-range,content-type,content-length,cache-control,accept-ranges,date,etag,last-modified,x-cache,x-content-length,x-server-id,x-uid | h3 | 53.08 |  | 90 |
