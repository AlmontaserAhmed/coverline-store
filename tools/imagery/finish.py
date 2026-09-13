#!/usr/bin/env python3
"""Coverline imagery — raw -> finished. Centre-crop to 1512x2016, optional text card + price tag, optional 9:16.
usage: python3 finish.py raw.jpg out.jpg [--text "..."] [--textpos tl|tr|bl|br] [--price £18] [--tiktok out-9x16.jpg]
"""
import sys, subprocess
from pathlib import Path
HERE = Path(__file__).resolve().parent
a = sys.argv[1:]; raw, out = a[0], a[1]
def opt(k, d=None): return a[a.index(k)+1] if k in a else d
tmp = str(Path(out).with_suffix(".proc.jpg"))
subprocess.check_call([sys.executable, HERE/"process.py", raw, tmp])
cmd = [sys.executable, HERE/"overlay.py", tmp, out]
if opt("--text"):  cmd += ["--text", opt("--text"), "--textpos", opt("--textpos", "bl")]
if opt("--price"): cmd += ["--price", opt("--price"), "--pricepos", "bl"]
if len(cmd) > 4: subprocess.check_call(cmd)
else: Path(tmp).replace(out)
Path(tmp).unlink(missing_ok=True)
if opt("--tiktok"): subprocess.check_call([sys.executable, HERE/"to916.py", out, opt("--tiktok")])
print("finished", out)
