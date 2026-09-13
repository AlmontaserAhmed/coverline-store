#!/usr/bin/env python3
"""Crop + house-grade + backdrop-match every raw in a job into out/<id>.jpg (1512x2016). usage: python3 finish_batch.py jobs/catalogue.json"""
import json, sys, subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent
job=json.loads(Path(sys.argv[1]).read_text())
for it in job["items"]:
    raw=HERE/it["out"]; fin=HERE/"out"/(it["id"]+".jpg")
    if not raw.exists(): print("MISSING", it["id"]); continue
    subprocess.check_call([sys.executable, HERE/"finish.py", str(raw), str(fin)])
# then put every finished image on the one house backdrop (refs/house-backdrop.jpg = the tee-apricot hero look)
done=[str(HERE/"out"/(it["id"]+".jpg")) for it in job["items"] if (HERE/it["out"]).exists()]
if done: subprocess.check_call([sys.executable, HERE/"match_backdrop.py", str(HERE/"refs"/"house-backdrop.jpg")]+done)
# colourways: a second colour is the base photo with only the garment changed — composite the edit onto
# its base so face/skin/room are pixel-identical. Base items must be finished first (jobs list them first).
import os
for it in job["items"]:
    if not it.get("base") or it.get("composite") is False: continue   # composite:false = a later step composites this one
    base_id=os.path.basename(it["base"]).replace("-raw.jpg","").replace(".jpg","")
    base=HERE/"out"/(base_id+".jpg")
    if not base.exists(): base=HERE.parent.parent/"assets"/"product-images"/(base_id+".jpg")
    fin=HERE/"out"/(it["id"]+".jpg")
    if base.exists() and fin.exists():
        cmd=[sys.executable, HERE/"composite.py", str(base), str(fin), str(fin)]
        if it.get("target"): cmd+=["--target", it["target"]]        # listed colour, e.g. "176,138,108" for sand
        subprocess.check_call(cmd)
    else: print("COMPOSITE SKIPPED (no base found):", it["id"], base)
print("done — any line marked DRIFTED above must be regenerated (generate.py job --only <id>) and finished again")
