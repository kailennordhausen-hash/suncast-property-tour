# Suncast Scroll Experience — Footage Generation Prompts & Asset Manifest

Project folder: `Desktop/Suncast Website Hero/`
New work lives in: `06_Build/` (reference folders 00–05 are read-only).

## Verified scope (from the project folders)

| # | Chapter | Model | Folder | Verified product name |
|---|---------|-------|--------|------------------------|
| 1 | Vista Shed | BMS7705 | `01_VistaShed_BMS7705` | Vista® 7 ft. x 7 ft. Storage Shed |
| 2 | Deck Box | BMDB1341 (official SKU BMDB1341P, Peppercorn) | `02_Deckbox_BMDB1341` | 134 Gallon Extra Large Deck Box |
| 3 | Hose Mobile | CPLSFB200CG (folder name corrects the brief's "PLSFB200CG") | `03_HoseMobile_CPLSFB200CG` | Hosemobile® Hose Reel Cart with Bin, 225 ft |
| 4 | Garage Cabinets | Diamond Door series, 7-piece config ("Config_7") | `04_GarageCabinets` | BMC7210 ×2, BMC3010 ×2, BMC3611, BMC3610, BMC5810 |
| 5 | Trash Hideaway | BMS4000PB | `05_TrashHideAway_BMS4000PB` | Single Trash Stow-Away® |

Garage arrangement (left → right, from `Menards_ENV_Config_7_CLOSED_Front.png`):
Tall Storage Cabinet BMC7210 · Wall Cabinet BMC3010 over Single-Drawer Base BMC3611 · Wall Cabinet BMC3010 over Base Cabinet BMC3610 · Tall Storage Locker BMC5810 (vented, single door) · Tall Storage Cabinet BMC7210.

## Home reference (`00_StartHere/DroneShotStart.jpg`, 11264×6144)

Elevated three-quarter aerial, golden-hour light from camera-left. Fixed facts of the scene:
- White board-and-batten modern farmhouse, charcoal shingle roof, standing-seam metal porch roofs, attached garage at left with the door open.
- Gravel side path with concrete border runs along the right side of the house from the front lawn to the rear patio.
- Rear patio with covered seating, dining table, rectangular pool with spa, loungers and umbrellas.
- Stepping-stone path leads from the patio across the rear lawn to the shed at the back-right corner.

**Products in the plate that must be corrected to the folder references:**
- Shed in plate has carriage doors with 6-pane windows and a brown roof → must be the **BMS7705**: Colonnade (warm ivory) walls, **black** shingle-style roof, **Pavestone** arched double doors with sunburst ribbing and three small square windows per door, gable vent, black D-handles.
- Box on the patio against the house wall is brown with vertical slats and open → must be the **BMDB1341P**: Peppercorn (deep charcoal) 49.25 in. W box, diagonal wood-look slat panels split by a centre stile, slightly domed ribbed lid, recessed front latch, gas-shock lid supports. Lid **closed** in the plate.
- Hose reel at the end of the side path is a generic beige reel → must be the **CPLSFB200CG**: dark charcoal A-frame resin cart with a light-grey spoked reel, light-grey accessory bin at the top, black crank handle on the camera-right side, two black wheels at the rear, hose coiled on the reel.
- Garage interior shows a generic cabinet pair → must be the Diamond Door 7-piece arrangement above along the back wall.
- **Trash Hideaway is absent** → place one **BMS4000PB** on the patio against the house wall, between the deck box and the covered seating area, door facing the pool. Same spot in every shot.

## Camera rule for every chapter

Start on the exact reference frame (the corrected plate). Glide forward and down, never passing through roofs, walls, furniture or planting. Settle into a stable three-quarter hero of the product with ~35% of the frame clear on the left for overlays. All products stationary. Return to the aerial is achieved in the site by scrubbing the same clip in reverse, so each clip only needs the approach.

Common prompt suffix (append to each):
> Photoreal architectural visualisation, golden hour, soft long shadows, consistent lighting throughout, physically plausible drone/gimbal move, no cuts, no people, no text, no morphing, product geometry unchanged, 16:9.

Negative prompt: `people, text, watermark, logo overlay, lens flare, cuts, warping, duplicated products, extra buildings, night, rain`

## Clip prompts (Kling 4.0 Reference — first frame = corrected plate, refs = product sheets)

### 01 — Vista Shed BMS7705 (backyard)
> @Image1 is the first frame. Camera drifts forward over the pool and patio, following the line of the stepping-stone path across the lawn toward the storage shed in the back-right corner, descending smoothly from the aerial to about 2 m above the grass. Finish in a stable three-quarter view of the shed showing its front double doors and the left side wall. The shed is exactly the product in @Image2: ivory multi-wall panels, black shingle-style gable roof, taupe arched double doors with sunburst ribbing and three small square windows per door, black handles. Doors stay closed. Landscaping, hedges and trees unchanged.

### 02 — Deck Box BMDB1341P (patio beside the house)
> @Image1 is the first frame. Camera glides forward and down toward the rear patio, keeping the house wall on the left, and settles into a low three-quarter view of the deck box standing against the white house wall near the pool. The deck box is exactly @Image2: deep charcoal resin, diagonal wood-look slat front split by a centre stile, domed ribbed lid, recessed front latch. The lid remains closed for the whole shot. The planter, loungers and pool stay where they are.

### 03 — Hosemobile CPLSFB200CG (side pathway)
> @Image1 is the first frame. Camera moves forward over the front lawn and descends along the gravel side path on the right side of the house, finishing in a stable three-quarter view of the hose reel cart that stands at the end of the path beside the house wall. The cart is exactly @Image2: dark charcoal A-frame resin cart, light grey spoked reel with a green garden hose neatly coiled on it, light grey accessory bin at the top, black crank handle, two black wheels, hose hooked on the frame. Nothing else moves.

### 04 — Diamond Door Garage Cabinets (inside the garage)
> @Image1 is the first frame. Camera descends toward the open garage door at the left of the house, slows at the threshold and enters through the existing opening at eye level, finishing in a stable, slightly angled view of the cabinet wall inside. The cabinets are exactly @Image2: a charcoal resin seven-piece set with diamond-textured doors — a tall two-door cabinet, two wall cabinets above a single-drawer base cabinet and a two-door base cabinet, a narrow vented locker, and a second tall two-door cabinet, all against the back wall. All doors closed. Garage floor polished concrete.

### 05 — Trash Hideaway BMS4000PB (patio, established location)
> @Image1 is the first frame. Camera glides forward and down to the rear patio and settles into a three-quarter view of the trash enclosure standing against the house wall between the deck box and the covered seating area. The enclosure is exactly @Image2: deep charcoal resin, horizontal wood-grain front door hinged on the right, flat ribbed lift-up lid, small lock hasp at the lower left of the door. Door and lid remain closed. Deck box and furniture stay in place.

## Plate-correction prompt (Nano Banana 2.1, 2K)

> Keep this aerial photograph exactly as it is — same camera, house, roofs, pool, furniture, paths, lawn, trees and lighting — and change only the following. (1) Replace the shed at the back-right with the shed in the shed reference: ivory walls, black shingle roof, taupe arched double doors with three small square windows each, closed. Same footprint and orientation. (2) Replace the brown box on the patio against the house wall with the charcoal deck box from the deck-box reference, lid closed, same spot. (3) Replace the beige hose reel at the end of the gravel side path with the charcoal hose reel cart from the hose-cart reference, green hose coiled on it, same spot. (4) Inside the open garage, place the charcoal diamond-door cabinet set from the cabinet reference along the back wall. (5) Add the charcoal trash enclosure from the trash reference on the patio against the house wall between the deck box and the covered seating, door facing the pool, closed. Photoreal, seamless, matching shadows.

## Output files the site expects (`06_Build/site/`)

```
assets/
  poster.jpg                      corrected plate, 1920×1047
  chapters/01-shed/frames/f_0001.webp … f_0192.webp     (24 fps × 8 s; any count works)
  chapters/02-deckbox/frames/…
  chapters/03-hosemobile/frames/…
  chapters/04-garage/frames/…
  chapters/05-trash/frames/…
  chapters/*/hero.jpg             last frame of each clip, used by the reduced-motion layout
  chapters/manifest.json          frame counts, hotspot tracks, overlay cues
```

Frame extraction: `ffmpeg -i clip.mp4 -vf "scale=1600:-2" -q:v 80 frames/f_%04d.webp` then run `tools/build_manifest.py` to count frames and regenerate `manifest.json`. Hotspot tracks are keyframed in `manifest.json` as `[progress, x%, y%]` and interpolated.

## What was actually generated (Higgsfield team project “Suncast Commercial”, 2 Nov 2026)

| Chapter | Method | Result |
|---|---|---|
| Plate (master aerial) | Nano Banana 2.1, 2K edit of `DroneShotStart.jpg` with the five product references | `plate v1` — approved; used as the start frame of every clip |
| 01 Shed | Kling 4.0 **References** (plate v1 + single‑view shed crop) | approved |
| 02 Deck box | Kling 4.0 References (plate v1 + deck box crop) | approved |
| 03 Hosemobile | Kling 4.0 References (plate v1 + hose reel crop) | approved |
| 04 Garage cabinets | Nano Banana 2.1 hero still (cabinet env photo + plate v1) → Kling 4.0 **Frames** (start = plate v1, end = hero still) | approved |
| 05 Trash Stow‑Away | Nano Banana 2.1 hero still (product‑only reference) → Kling 4.0 Frames (start = plate v1, end = hero still) | approved on v3 — References mode twice produced a wide two‑door unit |

Lessons that save credits next time:
- Kling’s reference images must be single views, ≤2.5:1. Multi‑angle composite sheets fail outright (credits refunded) — crop to one view with Higgsfield’s crop tool.
- When a product keeps drifting (the trash enclosure), generate the hero still first with Nano Banana from a product‑only reference, then animate with Frames mode. The end frame then matches the reference exactly.
- Kling 4.0, 16:9, 1080p, 10 s = 32.5 credits per clip; Nano Banana 2K edits ≈ 2 credits.
- Clips are 1924×1076 @ 24 fps, ~27–33 MB each. `tools/ingest_clip.py` turns each one into the frame sequence the site scrubs.

## Round 2 (tree fix) — same day

The front-lawn tree stood on the walkway in plate v1 (and in the source drone shot). Plate v3 = Nano Banana edit of plate v1 moving the tree ~2 m into the lawn, nothing else changed. All five clips were then re-generated in Kling 4.0 **Frames** mode: start = plate v3, end = the approved hero still for that chapter (shed / deck box / hose = last frame of the round-1 clip, exported from the browser; garage / trash = the Nano Banana hero stills). Result: identical hero shots, corrected aerial and approach paths. 5 × 32.5 credits + 2.
