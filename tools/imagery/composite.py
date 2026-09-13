#!/usr/bin/env python3
"""Coverline colourway compositor — the ONLY way a second colourway is made.

A colourway is the SAME photograph with a different garment colour. Gemini's "edit" of the base image
re-renders the whole frame, so face, skin, light and backdrop all drift a little. This puts the base back:
  base  where nothing changed   (pixel identity — face, hair, skin, room, floor, framing)
  edit  where the garment changed (real AI-rendered fabric in the new colour)
blended on a soft change-mask, after fitting the edit's exposure to the base on the unchanged pixels.
No garment segmentation, no dependence on scipy (Pillow + numpy only).

usage: python3 composite.py base.jpg edit.jpg out.jpg
Prints changed% and the untouched-area diff. If changed% is > 60 the edit did not keep the pose/framing —
that edit must be REGENERATED, not shipped (the compositor cannot fix a different photo).
(12 Sep 2026 version lived only in the project doc; 13 Sep pipeline dropped it — hence this file in the repo.)
"""
import sys, numpy as np
from PIL import Image, ImageFilter

def _blur(a, r):
    return np.asarray(Image.fromarray(np.clip(a,0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(float)
def _dilate(mask, r):
    return np.asarray(Image.fromarray((mask*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(int(r)|1)))>127

def align(B, E, search=6):
    H, W, _ = B.shape
    y0, y1, x0, x1 = int(0.03*H), int(0.25*H), int(0.30*W), int(0.70*W)
    ref = B[y0:y1, x0:x1].mean(2); ref = ref-ref.mean(); e = E.mean(2); best = None
    for dy in range(-search, search+1):
        for dx in range(-search, search+1):
            s = e[y0+dy:y1+dy, x0+dx:x1+dx]
            if s.shape != ref.shape: continue
            s = s - s.mean(); sc = (ref*s).sum()/(np.sqrt((ref*ref).sum()*(s*s).sum())+1e-9)
            if best is None or sc > best[0]: best = (sc, dy, dx)
    sc, dy, dx = best
    return np.roll(np.roll(E, -dy, 0), -dx, 1), sc, dy, dx

def build(base_path, edit_path, out_path, lo=10, hi=34):
    B = np.asarray(Image.open(base_path).convert('RGB')).astype(float)
    E = np.asarray(Image.open(edit_path).convert('RGB').resize((B.shape[1], B.shape[0]), Image.LANCZOS)).astype(float)
    E, sc, dy, dx = align(B, E)
    S = B.shape[1]/630.0
    d0 = np.abs(E-B).mean(2)
    still = ~_dilate(d0 > 40, 25*S)
    Eg = np.empty_like(E)
    for c in range(3):
        a, b = np.polyfit(E[..., c][still], B[..., c][still], 1)
        Eg[..., c] = np.clip(E[..., c]*a + b, 0, 255)
    d = _blur(np.abs(Eg-B).mean(2), 2.0*S)
    alpha = np.clip((d-lo)/(hi-lo), 0, 1)
    alpha = _blur(alpha*255, 1.5*S)/255.0
    core = alpha > 0.6
    out = np.clip(B*(1-alpha[..., None]) + Eg*alpha[..., None], 0, 255).astype(np.uint8)
    Image.fromarray(out).save(out_path, quality=94, subsampling=0)
    O = np.asarray(Image.open(out_path).convert('RGB')).astype(float)
    far = alpha < 0.02; df = np.abs(O-B).mean(2)
    changed = core.mean()*100
    # drift test: a colour change only touches the garment, which is ON the model. Changed pixels that sit on
    # the base's plain backdrop mean the edit moved the figure — the composite would carry a ghost. Regenerate.
    H, W, _ = B.shape
    edges = np.concatenate([B[:, :int(0.06*W)], B[:, int(0.94*W):]], 1)
    bgrow = np.median(edges, axis=1, keepdims=True)
    on_backdrop = np.abs(B - bgrow).mean(2) < 12
    ghost = (core & on_backdrop).mean()*100
    flag = "  <-- DRIFTED (figure moved): regenerate this edit" if (ghost > 1.0 or changed > 60) else ""
    print(f'{out_path.split("/")[-1]:26s} align={sc:.3f} ({dy:+d},{dx:+d}) changed={changed:4.1f}% ghost={ghost:.2f}% | untouched diff mean={df[far].mean():.2f} max={df[far].max():.0f}{flag}')
    return changed, ghost

if __name__ == "__main__":
    build(sys.argv[1], sys.argv[2], sys.argv[3])
