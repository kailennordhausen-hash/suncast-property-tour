#!/usr/bin/env python3
"""Render stand-in frame sequences by moving a virtual camera over the full-res home plate.

These are NOT the final footage. They give the scroll engine a real, scrubbable sequence per
chapter (aerial -> push-in on the product's established location) until generated clips are
dropped into assets/chapters/<id>/frames/.

Usage: make_placeholders.py <plate.jpg> <site_assets_dir> [frames_per_chapter]
"""
import json, os, sys, math
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

PLATE, OUT = sys.argv[1], sys.argv[2]
N = int(sys.argv[3]) if len(sys.argv) > 3 else 96
OUT_W = 1600

# Focus points in normalised plate coordinates (x, y) and end zoom factor.
# Taken from the 1600px proxy of DroneShotStart.jpg.
CHAPTERS = [
    ("01-shed",       (1425/1600, 285/872), 4.2),
    ("02-deckbox",    (1000/1600, 478/872), 5.5),
    ("03-hosemobile", ( 905/1600, 538/872), 6.5),
    ("04-garage",     ( 300/1600, 480/872), 4.6),
    ("05-trash",      (1040/1600, 428/872), 6.0),
]

def ease(t):  # smooth in/out
    return 0.5 - 0.5 * math.cos(math.pi * t)

im = Image.open(PLATE).convert("RGB")
W, H = im.size
OUT_H = round(OUT_W * H / W / 2) * 2
tracks = {}
for cid, (fx, fy), zoom in CHAPTERS:
    d = os.path.join(OUT, "chapters", cid, "frames"); os.makedirs(d, exist_ok=True)
    track = []
    for i in range(N):
        t = ease(i / (N - 1))
        z = 1 + (zoom - 1) * t
        cw, ch = W / z, H / z
        # crop centre drifts from frame centre to the focus point, clamped to the plate
        cx = (0.5 + (fx - 0.5) * t) * W
        cy = (0.5 + (fy - 0.5) * t) * H
        x0 = min(max(cx - cw / 2, 0), W - cw); y0 = min(max(cy - ch / 2, 0), H - ch)
        fr = im.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((OUT_W, OUT_H), Image.LANCZOS)
        fr.save(os.path.join(d, f"f_{i+1:04d}.webp"), quality=78, method=4)
        # where the product sits in this frame (normalised)
        px, py = (fx * W - x0) / cw, (fy * H - y0) / ch
        if i % 8 == 0 or i == N - 1:
            track.append([round(i / (N - 1), 3), round(px * 100, 1), round(py * 100, 1)])
    fr.convert("RGB").save(os.path.join(OUT, "chapters", cid, "hero.jpg"), quality=86)
    tracks[cid] = track
    print(cid, "frames:", N)

im.resize((1920, round(1920 * H / W)), Image.LANCZOS).save(os.path.join(OUT, "poster.jpg"), quality=86)
with open(os.path.join(OUT, "chapters", "tracks.json"), "w") as f:
    json.dump(tracks, f)
print("placeholder tracks written")
