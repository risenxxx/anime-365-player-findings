#!/usr/bin/env bash
# Synthetic test media for the local bench (written to media/, git-ignored).
#
#   media/episode.mp4  H.264 + AAC, ~24 min, moov at the start (faststart)
#   media/twin.mp4     a different encode (other bitrate/GOP, other picture) padded
#                      with a trailing `free` box to EXACTLY the same byte size as
#                      episode.mp4. Used for H5: same URL/m and same length, other bytes.
#
# Parameters can be overridden through the environment. Defaults are a first guess;
# they are refined from the numbers measured on the live stream (see REPORT.md, 4.2).
set -euo pipefail
cd "$(dirname "$0")/.."

DURATION="${DURATION:-1420}"        # seconds (data-duration of the sample episode: 1420.004)
SIZE="${SIZE:-1280x720}"
FPS="${FPS:-24000/1001}"            # data-framerate 23.976
VBITRATE="${VBITRATE:-1600k}"
GOP="${GOP:-240}"                   # keyframe interval, frames
PROFILE="${PROFILE:-high}"
LEVEL="${LEVEL:-4.0}"
ABITRATE="${ABITRATE:-128k}"
MOVFLAGS="${MOVFLAGS:-+faststart}"  # set MOVFLAGS= to keep moov at the end
PRESET="${PRESET:-veryfast}"

mkdir -p media
enc() { # out source-filter bitrate gop
  local out="$1" src="$2" br="$3" gop="$4"
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "$src" \
    -f lavfi -i "sine=frequency=440:sample_rate=48000:duration=${DURATION}" \
    -t "$DURATION" -map 0:v -map 1:a \
    -c:v libx264 -preset "$PRESET" -profile:v "$PROFILE" -level "$LEVEL" -pix_fmt yuv420p \
    -b:v "$br" -maxrate "$br" -bufsize "$(( ${br%k} * 2 ))k" -g "$gop" -keyint_min "$gop" -sc_threshold 0 \
    -c:a aac -b:a "$ABITRATE" -ac 2 \
    -movflags "$MOVFLAGS" "$out"
}

if [[ ! -f media/episode.mp4 ]]; then
  echo "encoding media/episode.mp4 ($SIZE, ${DURATION}s, $VBITRATE, GOP $GOP)"
  enc media/episode.mp4 "testsrc2=size=${SIZE}:rate=${FPS}:duration=${DURATION}" "$VBITRATE" "$GOP"
fi

if [[ ! -f media/twin.mp4 ]]; then
  # Lower bitrate so the twin is smaller, then pad it to the same size.
  TB="$(( ${VBITRATE%k} * 85 / 100 ))k"
  echo "encoding media/twin.mp4 (other picture, $TB, GOP $(( GOP / 2 )))"
  enc media/twin.raw.mp4 "testsrc2=size=${SIZE}:rate=${FPS}:duration=${DURATION},hue=h=120,vflip" "$TB" "$(( GOP / 2 ))"
  node scripts/pad-mp4.mjs media/twin.raw.mp4 media/episode.mp4 media/twin.mp4
  rm media/twin.raw.mp4
fi

for f in media/episode.mp4 media/twin.mp4; do
  printf '%s  %s bytes  ' "$f" "$(stat -f %z "$f" 2>/dev/null || stat -c %s "$f")"
  ffprobe -v error -show_entries format=duration,bit_rate -of default=nw=1:nk=1 "$f" | paste -sd' ' -
done
