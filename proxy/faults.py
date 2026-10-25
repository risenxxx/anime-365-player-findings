"""
mitmproxy addon: fault injection into OUR OWN live player traffic (rule 0.6).

    mitmdump -s proxy/faults.py --set stream_large_bodies=1 \
             --set faults_config=proxy/faults.json --listen-port 8080

Only media requests are touched: requests whose query has an `m` parameter and whose
Sec-Fetch-Dest is `video` (the <video> element) or `empty` (fetch() from the site's SW).
Bodies are streamed (stream_large_bodies) and never written to disk.

Config (JSON, re-read when the file changes), same vocabulary as server/cdn:
{
  "maxFaults": 20,                 # hard cap on injected faults per proxy run
  "faults": [
    {"action": "cut", "afterBytes": 6291456},
    {"action": "status", "code": 503, "when": {"afterCut": 6}},
    {"action": "status", "code": 403, "when": {"afterMs": 45000}},
    {"action": "hideHeader", "header": "Content-Range"}
  ]
}
`when` supports: nth [a, b], dest, afterMs, beforeMs, afterCut, withinMsAfterCut, times.

The addon also measures file parameters for scripts/make-media.sh, as NUMBERS only:
total size (from Content-Range), and from the first bytes of a response that starts at
byte 0: position of `moov` (start/end of file), `mvhd` duration, `tkhd` width/height,
`avcC` profile/level. Nothing else from the body is kept. Output goes to
captures/raw/media-params.jsonl and must be passed through scripts/redact.mjs.
"""
import json
import os
import struct
import time
from urllib.parse import parse_qs, urlsplit

from mitmproxy import ctx, http

OUT = os.path.join(os.path.dirname(__file__), "..", "captures", "raw")


class Faults:
    def __init__(self):
        self.cfg = {"faults": [], "maxFaults": 20}
        self.cfg_mtime = 0
        self.t0 = time.time()
        self.n = 0
        self.injected = 0
        self.after_cut_left = 0
        self.last_cut = 0
        self.applied = {}
        self.params_seen = set()

    def load(self, loader):
        loader.add_option("faults_config", str, "proxy/faults.json", "fault rules (JSON)")

    # ------------------------------------------------------------------ config
    def _config(self):
        path = ctx.options.faults_config
        try:
            m = os.path.getmtime(path)
        except OSError:
            return self.cfg
        if m != self.cfg_mtime:
            with open(path) as f:
                self.cfg = json.load(f)
            self.cfg_mtime = m
            self.t0 = time.time()
            self.n = 0
            self.after_cut_left = 0
            self.applied = {}
            ctx.log.info(f"[faults] config loaded: {len(self.cfg.get('faults', []))} rules")
        return self.cfg

    @staticmethod
    def _is_media(flow):
        q = parse_qs(urlsplit(flow.request.url).query)
        dest = flow.request.headers.get("sec-fetch-dest", "")
        return "m" in q and dest in ("video", "empty")

    def _match(self, i, rule, flow, idx):
        w = rule.get("when", {})
        t = (time.time() - self.t0) * 1000
        if "nth" in w and (idx < w["nth"][0] or (w["nth"][1] is not None and idx > w["nth"][1])):
            return False
        if "dest" in w and flow.request.headers.get("sec-fetch-dest") != w["dest"]:
            return False
        if "afterMs" in w and t < w["afterMs"]:
            return False
        if "beforeMs" in w and t >= w["beforeMs"]:
            return False
        if w.get("afterCut") and not flow.metadata.get("after_cut"):
            return False
        if "withinMsAfterCut" in w and not (self.last_cut and (time.time() - self.last_cut) * 1000 < w["withinMsAfterCut"]):
            return False
        if "times" in w and self.applied.get(i, 0) >= w["times"]:
            return False
        return True

    def _budget(self):
        return self.injected < self.cfg.get("maxFaults", 20)

    # ------------------------------------------------------------------ hooks
    def request(self, flow: http.HTTPFlow):
        cfg = self._config()
        if not self._is_media(flow):
            return
        self.n += 1
        idx = self.n
        flow.metadata["idx"] = idx
        if self.after_cut_left > 0:
            flow.metadata["after_cut"] = True
            self.after_cut_left -= 1
        for i, rule in enumerate(cfg.get("faults", [])):
            if rule.get("action") != "status" or not self._match(i, rule, flow, idx) or not self._budget():
                continue
            self.applied[i] = self.applied.get(i, 0) + 1
            self.injected += 1
            headers = {"Content-Type": "text/plain", "Cache-Control": "no-store"}
            origin = flow.request.headers.get("origin")
            if rule.get("cors", True) and origin:
                headers["Access-Control-Allow-Origin"] = origin
            flow.response = http.Response.make(rule["code"], f"fault {rule['code']}".encode(), headers)
            ctx.log.info(f"[faults] #{idx} -> {rule['code']}")
            return

    def responseheaders(self, flow: http.HTTPFlow):
        if "idx" not in flow.metadata or flow.response is None:
            return
        cfg = self.cfg
        idx = flow.metadata["idx"]
        cut_at = None
        for i, rule in enumerate(cfg.get("faults", [])):
            if not self._match(i, rule, flow, idx):
                continue
            a = rule.get("action")
            if a == "hideHeader":
                h = flow.response.headers.get("access-control-expose-headers", "")
                kept = [x.strip() for x in h.split(",") if x.strip().lower() != rule["header"].lower()]
                flow.response.headers["access-control-expose-headers"] = ", ".join(kept)
            elif a == "cut" and self._budget():
                cut_at = rule["afterBytes"] if cut_at is None else min(cut_at, rule["afterBytes"])
                self.applied[i] = self.applied.get(i, 0) + 1
        self._record_params(flow)
        sent = {"n": 0}
        head = {"buf": b""} if flow.request.headers.get("range", "").startswith("bytes=0-") else None
        faults = self

        state = {"cut": False}

        def stream(chunk: bytes) -> bytes:
            # After the cut: abort the connection. flow.kill() alone does not stop a
            # streamed body (the client would just stall), raising does.
            if state["cut"]:
                flow.kill()
                raise ConnectionAbortedError("bench fault: cut")
            if head is not None and len(head["buf"]) < 4 * 1024 * 1024:
                head["buf"] += chunk
                if len(head["buf"]) >= 64 * 1024:
                    faults._parse_head(flow, head["buf"])
            if cut_at is not None and sent["n"] + len(chunk) >= cut_at:
                keep = chunk[: max(0, cut_at - sent["n"])]
                sent["n"] = cut_at
                state["cut"] = True
                faults.injected += 1
                faults.last_cut = time.time()
                faults.after_cut_left = max([r.get("when", {}).get("afterCut", 0) for r in cfg.get("faults", [])] + [0])
                ctx.log.info(f"[faults] #{idx} cut after {cut_at} bytes")
                return keep
            sent["n"] += len(chunk)
            return chunk

        flow.response.stream = stream

    # ------------------------------------------------------------------ params (numbers only)
    def _record_params(self, flow):
        cr = flow.response.headers.get("content-range", "")
        total = cr.split("/")[-1] if "/" in cr else None
        row = {
            "status": flow.response.status_code,
            "total": int(total) if total and total.isdigit() else None,
            "type": flow.response.headers.get("content-type"),
            "acceptRanges": flow.response.headers.get("accept-ranges"),
            "expose": flow.response.headers.get("access-control-expose-headers"),
            "acao": "present" if flow.response.headers.get("access-control-allow-origin") else None,
            "http": flow.response.http_version,
        }
        self._write(row)

    def _parse_head(self, flow, buf):
        key = flow.request.url.split("?")[0]
        if key in self.params_seen:
            return
        self.params_seen.add(key)
        info = {"moov": None}
        off = 0
        while off + 8 <= len(buf):
            size, typ = struct.unpack(">I4s", buf[off:off + 8])
            typ = typ.decode("latin-1")
            if size == 1 and off + 16 <= len(buf):
                size = struct.unpack(">Q", buf[off + 8:off + 16])[0]
            if typ == "moov":
                info["moov"] = "start" if off < 1024 * 1024 else f"offset {off}"
                info.update(self._moov_numbers(buf[off:off + size]))
                break
            if typ == "mdat":
                info["moov"] = "after mdat (end of file)"
                break
            if size < 8:
                break
            off += size
        self._write({"head": info})

    @staticmethod
    def _moov_numbers(moov):
        out = {}
        i = moov.find(b"mvhd")
        if i > 0:
            ver = moov[i + 4]
            if ver == 0:
                ts, dur = struct.unpack(">II", moov[i + 16:i + 24])
            else:
                ts, dur = struct.unpack(">IQ", moov[i + 24:i + 36])
            out["durationS"] = round(dur / ts, 3) if ts else None
        j = 0
        dims = []
        while True:
            j = moov.find(b"tkhd", j + 1)
            if j < 0:
                break
            ver = moov[j + 4]
            # width/height (16.16 fixed) follow the 36-byte matrix
            base = j + (80 if ver == 0 else 92)
            if base + 8 <= len(moov):
                w, h = struct.unpack(">II", moov[base:base + 8])
                if w and h:
                    dims.append((w >> 16, h >> 16))
        out["trackDims"] = dims
        k = moov.find(b"avcC")
        if k > 0:
            out["avcProfile"], out["avcLevel"] = moov[k + 5], moov[k + 7]
        s = moov.find(b"stss")
        if s > 0:
            out["keyframes"] = struct.unpack(">I", moov[s + 8:s + 12])[0]
        z = moov.find(b"stsz")
        if z > 0:
            out["videoOrFirstTrackSamples"] = struct.unpack(">I", moov[z + 12:z + 16])[0]
        return out

    def _write(self, row):
        os.makedirs(OUT, exist_ok=True)
        row["t"] = round(time.time() - self.t0, 1)
        with open(os.path.join(OUT, "media-params.jsonl"), "a") as f:
            f.write(json.dumps(row) + "\n")


addons = [Faults()]
