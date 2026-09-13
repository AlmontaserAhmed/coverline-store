#!/usr/bin/env python3
"""Coverline imagery — automated QC on a raw or finished image.

usage: python3 qc.py image.jpg --model B          # identity + defects + backdrop, prints PASS/FAIL + reasons
       python3 qc.py image.jpg --model B --strict  # any warning is a fail

Checks: (1) file opens and is large enough; (2) backdrop reads as neutral light grey (no colour cast);
(3) Gemini is asked, with the model's reference image, whether it's the same woman, whether the negative-
prompt defects are present (extra/fused fingers, bent wrists, watermark, bare midriff), and whether the
garment matches — answered as JSON so it can gate a batch. Costs a fraction of a penny per check.
"""
import json, os, sys
from pathlib import Path
from PIL import Image, ImageStat
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

def backdrop_check(im):
    w, h = im.size
    strip = im.crop((0, 0, w, int(h*0.12)))            # top band is nearly always backdrop
    r, g, b = ImageStat.Stat(strip).mean
    cast = max(r, g, b) - min(r, g, b)
    return cast < 14, f"top-band RGB {r:.0f}/{g:.0f}/{b:.0f}, cast {cast:.0f}"

def gemini_check(path, model_key, garment_hint=""):
    from google import genai
    client = genai.Client()
    ref = Image.open((HERE / BRAND["models"][model_key]["reference"]).resolve()).convert("RGB")
    cand = Image.open(path).convert("RGB")
    q = ("Image 1 is the reference person. Image 2 is a candidate. Answer as strict JSON with keys: "
         "same_person (true/false), confidence (0-1), defects (list of strings from: extra_fingers, fused_fingers, "
         "bent_wrist, watermark, bare_midriff, extra_limb, distorted_face, text_artifacts — empty if none), "
         "backdrop_plain_grey (true/false), notes (short). " + (f"Garment expected: {garment_hint}. Add key garment_matches (true/false)." if garment_hint else ""))
    resp = client.models.generate_content(model="gemini-2.5-flash", contents=[ref, cand, q])
    txt = resp.text.strip().strip("`")
    if txt.startswith("json"): txt = txt[4:]
    return json.loads(txt)

if __name__ == "__main__":
    path = sys.argv[1]; model_key = sys.argv[sys.argv.index("--model")+1]
    strict = "--strict" in sys.argv
    garment = sys.argv[sys.argv.index("--garment")+1] if "--garment" in sys.argv else ""
    im = Image.open(path); fails, warns = [], []
    if "--graded" in sys.argv:
        import grade as G; ms = G.measure(im); lo, hi = BRAND["grade"]["backdrop_L"]; wlo, whi = BRAND["grade"]["warmth"]
        if not (lo <= ms["backdrop_L"] <= hi): fails.append(f"backdrop luminance {ms['backdrop_L']:.0f} outside {lo}-{hi}")
        if not (wlo <= ms["warmth"] <= whi): fails.append(f"warmth {ms['warmth']:.0f} outside {wlo}-{whi}")
    if min(im.size) < 1000: fails.append(f"too small {im.size}")
    ok, why = backdrop_check(im)
    if not ok: warns.append(f"backdrop cast: {why}")
    if os.environ.get("GEMINI_API_KEY"):
        r = gemini_check(path, model_key, garment)
        if not r.get("same_person") or r.get("confidence", 0) < 0.7: fails.append(f"identity: {r}")
        if r.get("defects"): fails.append(f"defects: {r['defects']}")
        if r.get("anatomy_ok") is False: fails.append("anatomy flagged")
        if "--close-crop" in sys.argv: warns.append("close crop — a human looks at hands/joints before this ships, regardless of PASS")
        if garment and r.get("garment_matches") is False: fails.append("garment mismatch")
        if r.get("backdrop_plain_grey") is False: warns.append("backdrop not plain grey (Gemini)")
    else:
        warns.append("no GEMINI_API_KEY — identity/defect check skipped")
    if strict: fails += warns
    print(("FAIL" if fails else "PASS"), path); [print("  -", f) for f in fails]; [print("  ~", w) for w in warns]
    sys.exit(1 if fails else 0)
