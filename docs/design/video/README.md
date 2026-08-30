# Hero scroll-scrub video — source masters

Raw generations for the desktop cinematic hero (`HeroCinematicSlide`). The
clip that actually ships lives at `public/videos/beauty-scrub.mp4` and is
re-encoded from one of these (all-keyframe H.264 + light grade) so it can be
scrubbed frame-accurately by scroll.

| file | dims | length | notes |
|------|------|--------|-------|
| `bunlar_icin_bahsettigin_gorunt.mp4` | 720×1280 (9:16) | 10s | first look — dynamic camera, dramatic reveal, moody bg. Different crown/frame from v2. |
| `v1.mp4` | 720×1280 (9:16) | 10s | marble-only intro, dark starry background. Does not transform to alive. |
| `v2.mp4` | 720×1280 (9:16) | 20s | full arc marble→alive, flat grey bg. Was the shipped source until the 4:5 came in. |
| `v2_4x5.mp4` | **1080×1350 (4:5)** | 20s | same character + arc as v2, native 4:5, higher res. **Current ship source.** |

`keyframes/` holds stills pulled from `v2_4x5.mp4` — use these as the
first-frame / character-reference image when generating a matching clip
later, since fresh generations drift the face/crown otherwise.

## Re-encode recipe (needs `ffmpeg-static`, already a devDependency)

```
node_modules/ffmpeg-static/ffmpeg.exe -y -i docs/design/video/v2_4x5.mp4 \
  -an -vf "scale=864:1080,hqdn3d=1.2:1.2:5:5,eq=contrast=1.04:saturation=1.05" \
  -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p \
  -x264-params "keyint=1:min-keyint=1:scenecut=0" -movflags +faststart \
  public/videos/beauty-scrub.mp4
```

`keyint=1` = every frame a keyframe (the reason the shipped file is ~2× the
source size — scrubbing needs any random frame instantly decodable).
