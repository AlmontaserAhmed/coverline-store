#!/usr/bin/env python3
"""One-off fix (14 Sep 2026): the four Wine short photos (hero/move/back/detail) were generated as
separate Gemini shots and drifted apart in garment colour/exposure -- hero and move read as a rich
dusty wine, back and detail read visibly paler/greyer. This re-grades the garment pixels of the
non-reference shots to match the reference shot's garment colour, leaving skin/shirt/background
untouched.

Garment isolation: for this fabric, G-B is small/negative (desaturated mauve/wine) while skin has a
clearly positive G-B (warm undertone) and shirt/background are near-neutral but far brighter or
duller than the garment tone band. Largest-connected-component cleans up stray matches (hair, shadow
creases). Correction is a per-channel mean+std match (Reinhard-style) computed over the garment mask
only, applied with a feathered mask so the edge blends.

usage: python3 colormatch.py ref.jpg target.jpg out.jpg
"""
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

def _blur(a, r):
    return np.asarray(Image.fromarray(np.clip(a,0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(float)

def _dilate(mask, r):
    return np.asarray(Image.fromarray((mask*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(int(r)|1))) > 127

def garment_mask(img):
    R,G,B = img[...,0], img[...,1], img[...,2]
    raw = (R - G > 6) & ((G - B) < 8) & (R > 35) & (R < 235)
    soft = _blur(raw.astype(float)*255, 2.0) > 120
    lab, n = ndimage.label(soft)
    if n == 0:
        return soft
    sizes = ndimage.sum(soft, lab, range(1, n+1))
    best = int(np.argmax(sizes)) + 1
    blob = lab == best
    blob = ndimage.binary_fill_holes(blob)
    blob = _dilate(blob, 9)  # reclaim brighter/highlight garment edges the colour test under-caught
    return blob

def stats(img, mask):
    px = img[mask]
    return px.mean(axis=0), px.std(axis=0) + 1e-6

def main():
    ref_p, tgt_p, out_p = sys.argv[1], sys.argv[2], sys.argv[3]
    ref = np.asarray(Image.open(ref_p).convert('RGB')).astype(float)
    tgt = np.asarray(Image.open(tgt_p).convert('RGB')).astype(float)
    rmask = garment_mask(ref)
    tmask = garment_mask(tgt)
    rmean, rstd = stats(ref, rmask)
    tmean, tstd = stats(tgt, tmask)
    scale = np.clip(rstd / tstd, 0.6, 1.6)
    corrected = rmean + (tgt - tmean) * scale
    corrected = np.clip(corrected, 0, 255)
    alpha = _blur(tmask.astype(float) * 255, 18.0) / 255.0  # wide feather: any residual mask gap fades smoothly instead of seaming
    alpha = alpha[..., None]
    out = tgt * (1 - alpha) + corrected * alpha
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(out_p, quality=95)
    print(f"{tgt_p}: garment px={int(tmask.sum())}  before={tmean.round(1)}  ref={rmean.round(1)}  after-mask-mean={corrected[tmask].mean(axis=0).round(1)}")

main()
