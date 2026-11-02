#!/usr/bin/env python3
"""Count frames per chapter and write assets/chapters/manifest.js (+ manifest.json).

Product copy, links and hotspot tracks come from tools/chapters.json so the manifest can be
rebuilt any time footage is replaced:  build_manifest.py <site_dir>
"""
import json, os, sys, glob
SITE = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
spec = json.load(open(os.path.join(HERE, "chapters.json")))
tracks_path = os.path.join(SITE, "assets", "chapters", "tracks.json")
auto_tracks = json.load(open(tracks_path)) if os.path.exists(tracks_path) else {}

for ch in spec["chapters"]:
    d = os.path.join(SITE, "assets", "chapters", ch["id"], "frames")
    files = sorted(glob.glob(os.path.join(d, "f_*.webp")))
    ch["frames"] = len(files)
    ch["frameExt"] = "webp"
    ch["hero"] = f"assets/chapters/{ch['id']}/hero.jpg" if os.path.exists(os.path.join(SITE, "assets", "chapters", ch["id"], "hero.jpg")) else None
    if ch.get("track") in (None, "auto"):
        ch["track"] = auto_tracks.get(ch["id"], [[0, 50, 50], [1, 50, 50]])
    print(f"{ch['id']}: {ch['frames']} frames, source={ch.get('footage', 'unknown')}")

out = {"version": spec["version"], "poster": "assets/poster.jpg", "chapters": spec["chapters"]}
os.makedirs(os.path.join(SITE, "assets", "chapters"), exist_ok=True)
json.dump(out, open(os.path.join(SITE, "assets", "chapters", "manifest.json"), "w"), indent=1)
with open(os.path.join(SITE, "assets", "chapters", "manifest.js"), "w") as f:
    f.write("window.SUNCAST_MANIFEST = " + json.dumps(out) + ";\n")
print("manifest written")
