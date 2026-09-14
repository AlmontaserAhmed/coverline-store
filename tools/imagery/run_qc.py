#!/usr/bin/env python3
"""QC every item in a job with the right model + garment hint. usage: python3 run_qc.py jobs/catalogue.json [--graded]"""
import json, sys, subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent; B=json.loads((HERE/"brand.json").read_text())
job=json.loads(Path(sys.argv[1]).read_text()); extra=[a for a in sys.argv[2:]]
fails=0
for it in job["items"]:
    raw=HERE/it["out"]; img=raw
    if "--graded" in extra:
        fin=HERE/"out"/(it["id"]+".jpg")
        if fin.exists(): img=fin
    if not img.exists(): print("MISSING", it["id"]); fails+=1; continue
    if it.get("model") is None: print("SKIP (no model)", it["id"]); continue
    hint=B["garments"][it["garment"]]["name"]+" in "+it["colour"]
    cmd=[sys.executable, str(HERE/"qc.py"), str(img), "--model", it["model"], "--garment", hint, "--strict"]
    gcolours=B["garments"][it["garment"]].get("colours",{})
    gref=gcolours.get(it["colour"])
    # back-view shots can't show front-facing construction (pockets, zip, chest seams) — skip that check there,
    # it's a structural non-match, not a defect
    if gref and "detail" not in it["id"] and it.get("pose") != "back":
        cmd += ["--garment-ref", str((HERE/gref).resolve())]
        cline=B["garments"][it["garment"]].get("line","")
        if cline: cmd += ["--construction", cline]
    if it.get("pose") in ("detail","ref-hands") or "detail" in it["id"]: cmd.append("--close-crop")
    if "--graded" in extra: cmd.append("--graded")
    r=subprocess.run(cmd, capture_output=True, text=True); out=(r.stdout+r.stderr).strip()
    print(out.splitlines()[0] if out else "no output", "|", it["id"]); [print("   ",l) for l in out.splitlines()[1:]]
    if r.returncode: fails+=1
print(f"\n{fails} problem(s)"); sys.exit(1 if fails else 0)
