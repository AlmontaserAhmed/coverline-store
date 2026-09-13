#!/usr/bin/env python3
"""Colourway from a BLACK garment, without Gemini: the SAME photograph, only the black fabric re-mapped.
Finds the black-fabric region (below --top so hair is excluded, one connected garment), keeps the fabric's own
shading (ribs, folds, highlights) and re-maps it onto the listed colour. Everything else — face, skin, top,
backdrop, floor — is byte-identical to the base.
usage: python3 recolour_dark.py base.jpg out.jpg --target 201,168,136 [--top 0.30] [--thresh 80]
  --target  sRGB of the listed colour at mid-tone (sand ≈ 201,168,136)
  --top     fraction of the image height above which nothing is recoloured (hair) — default 0.30
  --thresh  max(R,G,B) at/below which a pixel is solid black fabric — default 80
"""
import sys, numpy as np
from PIL import Image, ImageFilter, ImageDraw

def _blur(a, r):
    return np.asarray(Image.fromarray(np.clip(a*255,0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(float)/255

def main():
    a=sys.argv[1:]; inp,outp=a[0],a[1]
    tgt=np.array([float(x) for x in a[a.index('--target')+1].split(',')])
    top=float(a[a.index('--top')+1]) if '--top' in a else 0.30
    th=float(a[a.index('--thresh')+1]) if '--thresh' in a else 80
    im=Image.open(inp).convert('RGB'); x=np.asarray(im).astype(float); H,W,_=x.shape
    mx=x.max(2); L=x.mean(2)
    neutral=(x[...,0]-x[...,2])<28                 # black fabric is neutral; skin in shadow is warm — never touch skin
    # 1. solid-black pixels, cleaned with a round (blur) filter — no square morphology, no staircase edges
    raw=((mx<=th)&neutral).astype(float); raw[:int(H*top)]=0
    solid=_blur(raw,2.0)>0.5
    # 2. keep the one connected blob that is the garment (drops hair, floor line, stray shadow specks)
    seed=None
    for yy in range(int(H*0.55),int(H*0.95),4):
        xs=np.where(solid[yy])[0]
        if len(xs): seed=(int(xs[len(xs)//2]),yy); break
    if seed is None: raise SystemExit("no black fabric found — lower --thresh or --top")
    lab=Image.fromarray((solid*255).astype(np.uint8)).copy(); ImageDraw.floodfill(lab,seed,128)
    solid=np.asarray(lab)==128
    region=_blur(solid.astype(float),4.0)>0.02          # garment + a few px of edge
    # 3. per-pixel recolour strength: 1 on solid fabric, fading to 0 across the anti-aliased edge (by darkness)
    s=np.clip((th+25-mx)/45.0,0,1)*region*neutral
    s=np.where(solid,1.0,s)
    # 4. shading: normalise the garment's own luminance range, place it on the target colour
    Lg=L[solid]; lo,hi=np.percentile(Lg,2),np.percentile(Lg,99.5)
    n=np.clip((L-lo)/max(hi-lo,1),0,1)
    k=0.5+(1.3-0.5)*n**0.85                            # dark folds 0.5×target, highlights 1.3× — keeps the fabric's contrast so it never reads as skin
    k=np.where(solid,k,np.minimum(k,0.5))               # edge pixels stay on the dark side of the curve (reads as the original edge, no rim)
    col=tgt[None,None,:]*k[...,None]
    out=s[...,None]*col+(1-s[...,None])*x
    Image.fromarray(np.clip(out,0,255).astype(np.uint8)).save(outp,quality=94)
    print(f"{outp}: recoloured {solid.mean()*100:.1f}% of frame (+edge); garment L range {lo:.0f}-{hi:.0f}")
main()
