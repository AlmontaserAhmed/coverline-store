#!/usr/bin/env python3
"""Crop + house-grade every raw in a job into out/<id>.jpg (1512x2016). usage: python3 finish_batch.py jobs/catalogue.json"""
import json, sys, subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent
job=json.loads(Path(sys.argv[1]).read_text())
for it in job["items"]:
    raw=HERE/it["out"]; fin=HERE/"out"/(it["id"]+".jpg")
    if not raw.exists(): print("MISSING", it["id"]); continue
    subprocess.check_call([sys.executable, HERE/"finish.py", str(raw), str(fin)])
print("done")
