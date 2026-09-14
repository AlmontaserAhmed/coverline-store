# Coverline imagery — standing rules (read before touching any image; every rule here was broken at least twice)

This file lives in the repo so no session can build a pipeline without it. The project doc
`coverline-imagery-standing-rules.md` is the same text. If you change one, change both.

## 1. A colourway is the SAME photograph — never a new one
- Colour 2 is made from colour 1's image: Gemini edit of the base → `composite.py` puts the base back everywhere
  except the garment. Face, hair, skin, light, backdrop, floor, framing are pixel-identical between colours.
- `finish_batch.py` does this automatically for every job item with `"base"`. It prints `changed%` and `ghost%`
  per edit. A line marked **DRIFTED** means Gemini moved the figure; that edit is regenerated
  (`generate.py job --only <id>`), never shipped. Never "fix" a drifted edit by hand.
- Never ship a colourway that is a separate generation. If the edit keeps drifting, regenerate it; do not fall
  back to a fresh generation "just this once" — that is exactly what put two different photos on the
  Off-Duty Set in the 13 Sep catalogue.
- History: compositor written 12 Sep (`coverline-colourway-compositor.md`), dropped when the 13 Sep pipeline was
  built, regression noticed by Almontaser on the local site the same evening. Hence this file.

## 2. One room, one light
- Every finished image passes `match_backdrop.py` against `refs/house-backdrop.jpg` (per channel: brightness,
  gradient and colour temperature). `grade.py` alone is NOT enough — it matches one mean and left Model B
  renders 25% brighter and cooler than Model A ones.
- Check: top-strip luminance ~139 and R−B ~+8.5 on every full-body shot (`match_backdrop.py` prints it).
  Tight close-ups (tee / loungeset / legging detail) are matched on a hand-picked backdrop patch.

## 3. Views per colourway = hero, proof, back, detail — the same four for every product
- Hero: standing, face visible, front or three-quarter. Movement/proof shots never lead.
- Detail is a CLOSE crop of the garment's defining feature. If Gemini returns a full-length or 3/4 shot for
  "detail", it is wrong — regenerate with an explicit `extra` crop spec (see `jobs/fixes-2.json` for the shorts
  wording). The 13 Sep loungeset and shorts details both came back as full/3/4 shots the first time.

## 4. Styling
- No sports bra, bralette, crop top or visible midriff on any SKU, including the gym short. Legging and short
  are styled with a fitted longline tee whose hem sits below the waistband.
- Model lock is per product (A: tee, co-ord, short; B: loungeset, legging). Identity comes from the reference
  sheets in `refs/`; prompts say "the same woman as the reference images", never re-describe her.

## 5. Before shipping
- Contact-sheet the whole product (both colours, all four views) and LOOK at it on a dark background — the site is
  dark, and backdrop/tone differences that hide on white jump out on black.
- QC: `run_qc.py job --graded`. Close-crop FAILs are the human-eyes gate, not a defect; everything else is.
- Ship = copy `out/<id>.jpg` → `assets/product-images/`, bump image `?v=` in `products.js` and
  `products.js?v=` in all six html, commit, Almontaser pushes.

## 6. Pipeline order (what `finish_batch.py` does)
`generate.py job` (raw, from his Terminal — Claude's shells cannot reach the Gemini API) →
`finish_batch.py job` = crop + `grade.py` → `match_backdrop.py` → `composite.py` for every `"base"` item →
`run_qc.py job --graded` → contact sheet → ship. Job files list a base before its edits.

## 7. When a Gemini colour edit drifts more than twice — stop paying, use post (13 Sep, learned on the Off-Duty detail: 4 drifts)
- Saturated garment (wine, blush, navy on the grey set): `recolour.py base.jpg out.jpg --hue a-b --sat s --target r,g,b`
  masks the garment by hue and re-maps it to the listed colour, keeping the fabric shading. Skin is excluded by
  hue (skin sits at 19–28°, wine at 355–5°). Used for `short-pink-detail`.
- Pale / neutral garment (cream, oat, black) that cannot be hue-masked: make the detail as an identical CROP of both
  colourways' finished heroes (they are the same photo, so the crops match exactly; ~2.7× upscale is fine at gallery
  size). Used for both `loungeset-*-detail`.
- Never ship an un-composited drifted edit "for now"; the ghost of the moved figure is visible on the dark site.

## 8. A colour-only edit must never invent construction — describe colour, not fabric texture (13 Sep night, found on the Sand legging "fix")
- The v1 Sand-legging fix solved the skin-tone problem but broke rule #1's spirit: it silently changed the
  waistband width and rib pattern, so Black and Sand now read as two different garments, not one recoloured.
- Cause: the `extra` prompt described the target fabric ("clear ribbing/seam texture", "obvious tonal
  contrast") instead of only the colour. With `no_ref_image` in play there is no image anchoring construction,
  so Gemini took texture language as permission to redesign, not just recolour.
- Rule: an `extra` string on a `"base"` edit may specify colour (hex is fine) and may say skin/fabric contrast
  must be visually clear, but must NEVER describe ribbing, seams, waistband style, sheen, or any other
  construction/texture detail — and should explicitly say to keep every construction line pixel-identical to
  the base image. `composite.py`'s drift check catches the model/pose moving; it does NOT catch the garment
  itself being redesigned inside its own mask, so this has to be caught by eye (contact-sheet the SAME view of
  both colourways side by side, not just each colourway alone) before shipping, every time — not only for
  skin-adjacent colours.

9. **Colourways of a black garment: Gemini renders the fabric, `colourway_from_edit.py` puts it on the base photo.** (13 Sep, after three failed Gemini
   rounds on the Sand legging.) Gemini re-renders the whole frame on every "edit", so two colourways are never the
   same photo, and it re-styles anything black it can see (the tee got a satin sheen three runs in a row). Rule:
   shoot the base once with the garment in BLACK and every other garment in a NON-black colour (ivory tee), then make
   every other colour with `recolour_dark.py base.jpg out.jpg --target R,G,B` — same pixels, only the black fabric
   remapped, its own ribs/folds/highlights kept. Sand = 201,168,136. Never put a black top on a black-garment base.
   (Amended 13 Sep, late: a pure pixel recolour of black knit reads as a flat tint — Almontaser: "looks like an
   overlay, not real pants". So: base photo = black garment + ivory tee; Gemini renders the colourway from that
   base (colour-only wording, `composite:false` in the job); then `colourway_from_edit.py base.jpg render.jpg
   out.jpg` aligns the render (scale+shift on the non-garment area) and takes the rendered fabric across the
   garment silhouette only — everything else stays the base, byte for byte. It prints the render share and
   alignment residual; if Gemini lengthened/shortened the tee, the hem band is flagged — regenerate that view
   with the hem clause rather than shipping the fill.)

10. **A garment reference must be the supplier's OWN product photo, saved into the repo — never a Coverline render.** (14 Sep, found via the "does every image match the real product" audit.) Every `colours` entry in `brand.json` used to point at the site's own previous AI image (e.g. `legging-black-detail.jpg`) — meaning the pipeline was checking its renders against themselves, so the whole catalogue could drift from the real CJ product with nothing to catch it. Fix: download the actual CJ listing photo for the locked SKU/colour into `tools/imagery/refs/cj-<garment>-<colour>.png` (screenshot + save_to_disk works — CJ's CDN is not reachable by curl through the sandbox's egress allowlist) and point `colours` at that file (a relative path out of `assets/product-images/`, e.g. `"../../tools/imagery/refs/cj-short-wine.png"`, works without touching `generate.py`). Before writing a new `colours` entry, open the CJ listing yourself and confirm the SKU, the colour name, and the construction (waistband style, seams, mesh, scrunch) — never assume last week's site photo was right.

11. **A colourway compositor built for a black base garment does not generalize to a colour one — `composite.py` is the only supported compositor now.** (14 Sep, found while shipping the short's Wine/Blush colourways.) `colourway_from_edit.py` derives its garment mask from "dark & colour-neutral" pixels on the base — that only works when the base garment is black (R≈G≈B). Point it at a wine/burgundy base and the mask barely catches the garment (wine has high R-B, it isn't "neutral"), producing either a barely-recoloured image or a jagged partial patchwork depending on the pose crop. `composite.py` (in this same folder) replaced it in the actual pipeline back on 13 Sep — it needs no garment segmentation at all, just a soft change-mask between base and edit plus an exposure fit, so it works for any garment colour. The old file was left in the repo and it's easy to reach for by name; don't use it. Always run colourway compositing through `composite.py`, or via `finish_batch.py`'s own composite step on a job file where each colourway item has a `base` field pointing at the wine (or other primary) raw file — and make sure the `base`'s basename-minus-`-raw.jpg` matches the finished id of that base item exactly, or the auto-composite step silently no-ops with "COMPOSITE SKIPPED (no base found)".
12. **`composite.py`'s drift check can false-positive on a tight detail crop of the RAW image — recheck after `finish_batch.py`'s crop + backdrop-match, not before.** (14 Sep.) The drift heuristic samples the leftmost/rightmost 6% of the frame as "backdrop" to catch a figure that moved between base and edit. In a close hip/waistband detail shot there may be little or no real backdrop in that strip (it's mostly skin/garment), so a correct composite can get flagged `<-- DRIFTED` on the raw pair. Finish (crop+grade+backdrop-match) first, then re-run `composite.py` on the finished pair before trusting the flag — the false positive cleared entirely once backdrop-matching normalised the frame in this case (ghost dropped from 2.6% to 0.75%).
