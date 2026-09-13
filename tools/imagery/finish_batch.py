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
print("done")
