#!/usr/bin/env python3
"""Coverline imagery — generate one on-brand image from a job spec, via the Gemini API.

usage:  python3 generate.py job.json            # runs every item in the job
        python3 generate.py job.json --only legging-black-hero
env:    GEMINI_API_KEY  (paste it in your shell: export GEMINI_API_KEY=...)

A job item looks like:
  {"id":"legging-black-hero","model":"B","garment":"legging","colour":"black","pose":"hero",
   "extra":"", "out":"out/legging-black-hero-raw.jpg"}
The prompt is assembled from brand.json so nothing is retyped: model reference image + garment reference
photo + the locked style block + negative list. Model lock is enforced (a job that puts model A in a
legging fails before it costs anything).
"""
import json, os, sys, io, time
from pathlib import Path
from PIL import Image
def _load_key():
    """GEMINI_API_KEY from the environment, else from ~/Downloads/coverline-qc/.gemini.env (never in the repo)."""
    import os
    if os.environ.get("GEMINI_API_KEY"): return
    for p in [os.path.expanduser("~/Downloads/coverline-qc/.gemini.env"), os.path.join(os.path.expanduser("~"), "mnt/Downloads/coverline-qc/.gemini.env")]:
        if os.path.exists(p):
            for line in open(p):
                if line.startswith("GEMINI_API_KEY="): os.environ["GEMINI_API_KEY"] = line.split("=",1)[1].strip().strip('"'); return
_load_key()


HERE = Path(__file__).resolve().parent
BRAND = json.loads((HERE / "brand.json").read_text())
PRODUCT_IMAGES = HERE / "../../assets/product-images"
MODEL_ID = os.environ.get("COVERLINE_IMAGE_MODEL", "gemini-3-pro-image")   # Nano Banana Pro (Almontaser, 13 Sep); "gemini-3.1-flash-image" is the cheaper fallback
IMAGE_SIZE = os.environ.get("COVERLINE_IMAGE_SIZE", "2K")                         # 2K at 4:5 ≈ 1638×2048 → crops to 1512×2016 without upscaling

def build_prompt(item):
    g = BRAND["garments"][item["garment"]]
    garment_line = g["line"].format(colour=item["colour"])
    if item.get("base"):   # colourway edit: same image, only the garment colour changes
        colour_source = ("Take the garment's colour and construction from the last reference image. "
                          if not item.get("no_ref_image") else "")
        return (f"Use the first image as the base. Recreate it exactly — the same woman, the same pose, the same framing, "
                f"the same light and backdrop, pixel-for-pixel where possible — changing ONLY the garment to: {garment_line}. "
                f"{colour_source}Photography, not digital art. "
                f"{item.get('extra','')} "
                f"Avoid: {BRAND['negative']}.")
    if item.get("model") is None:   # garment-only / macro shot, no person
        return " ".join(p for p in [
            f"Editorial product photograph, no person in frame. {garment_line}, {item.get('extra','')}",
            f"Setting: {BRAND['background']}.", BRAND["style_block"], f"Avoid: {BRAND['negative']}, people, mannequins.",
            "Match the reference image for the garment exactly."] if p)
    m = BRAND["models"][item["model"]]
    if item["garment"] not in m["locked_to"]:
        raise SystemExit(f"model lock: model {item['model']} is not locked to {item['garment']}")
    pose = BRAND["poses"][item.get("pose", "hero")]
    parts = [
        f"Editorial product photograph. {m['line']}, in {BRAND['background']}, wearing {garment_line}.",
        f"Pose: {pose}.",
        item.get("extra", ""),
        BRAND["style_block"],
        f"Avoid: {BRAND['negative']}.",
        f"The first {len(refs(item))-1} image(s) show the same woman from different angles — match her identity exactly. The last image is the garment — match it exactly.",
    ]
    return " ".join(p for p in parts if p)

def refs(item):
    g = BRAND["garments"][item["garment"]]
    garment_ref = (PRODUCT_IMAGES / g["colours"][item["colour"]]).resolve()
    if not garment_ref.exists(): raise SystemExit(f"missing reference: {garment_ref}")
    out = []
    if item.get("base"):
        base = (HERE / item["base"]).resolve()
        if not base.exists(): raise SystemExit(f"missing base image: {base}")
        out.append(Image.open(base).convert("RGB"))
        if not item.get("no_ref_image"):
            out.append(Image.open(garment_ref).convert("RGB"))
        return out
    if item.get("model") is not None:
        m = BRAND["models"][item["model"]]
        for r in (m.get("references") or [m["reference"]])[:4]:
            p = (HERE / r).resolve()
            if not p.exists(): raise SystemExit(f"missing reference: {p}")
            out.append(Image.open(p).convert("RGB"))
    out.append(Image.open(garment_ref).convert("RGB")); return out

def generate(item, client):
    from google.genai import types
    prompt = build_prompt(item)
    imgs = refs(item)
    for attempt in range(3):
        try:
            resp = client.models.generate_content(
                model=MODEL_ID,
                contents=[*imgs, prompt],
                config=types.GenerateContentConfig(response_modalities=["IMAGE"], image_config=types.ImageConfig(aspect_ratio="4:5", image_size=IMAGE_SIZE)),
            )
            for part in resp.candidates[0].content.parts:
                if getattr(part, "inline_data", None) and part.inline_data.data:
                    out = HERE / item["out"]; out.parent.mkdir(parents=True, exist_ok=True)
                    Image.open(io.BytesIO(part.inline_data.data)).convert("RGB").save(out, quality=96)
                    return out
            raise RuntimeError("no image in response")
        except Exception as e:
            print(f"  attempt {attempt+1} failed: {e}"); time.sleep(4)
    raise SystemExit(f"gave up on {item['id']}")

if __name__ == "__main__":
    if not os.environ.get("GEMINI_API_KEY"): raise SystemExit("set GEMINI_API_KEY first")
    from google import genai
    client = genai.Client()
    job = json.loads(Path(sys.argv[1]).read_text())
    only = sys.argv[sys.argv.index("--only")+1] if "--only" in sys.argv else None
    for item in job["items"]:
        if only and item["id"] != only: continue
        print(f"[{item['id']}] generating…")
        out = generate(item, client)
        print(f"  -> {out}")
