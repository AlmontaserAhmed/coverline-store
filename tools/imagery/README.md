# Coverline imagery pipeline (internal tool — not deployed with the site)

One place that owns how every Coverline image gets made, so nothing drifts: the palette, the studio
background, the locked style block, both house models (with their reference images and product locks), the
real garment reference photos, and the finishing rules (1512×2016 crop, oat text card, berry price tag
bottom-left, 9:16 export for TikTok).

    export GEMINI_API_KEY=...                       # from aistudio.google.com — never commit it
    python3 generate.py jobs/modelb-galleries.json  # raw images -> out/
    python3 qc.py out/legging-black-raw.jpg --model B --garment "black seamless legging" --strict
    python3 finish.py out/legging-black-raw.jpg out/legging-black.jpg --price £18 --tiktok out/legging-black-9x16.jpg

Rules the code enforces: a model can only be generated in a garment she's locked to; every prompt is built
from brand.json (no retyping); QC asks Gemini, with the model's reference image, "same woman? defects?
garment matches?" and fails the image if not. Change brand.json to change the brand — nothing else.

Why this and not the Gemini web UI: the web route works but is slow (3–5 min an image, browser-driven,
retries on every click) and identity drifts between threads. The API route is ~8p an image (Nano Banana 2 at 2K, so the 1512×2016 crop needs no upscaling; ~10p on Nano Banana Pro for heroes), scriptable,
and QC-gated. Why not "hosted on the website": this is a production tool, not a customer feature — a CLI in
the repo is the right home; a UI can be added later if more than one person needs to run it.

Model B: once the first hero from `jobs/modelb-galleries.json` passes QC, copy it to `refs/` and point
`brand.json → models.B.reference` at it, so every later Model B shot keys off the same image.

> **Read RULES.md first.** It is the list of things that went wrong before and how the pipeline prevents them.
