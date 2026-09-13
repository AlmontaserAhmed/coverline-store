#!/usr/bin/env python3
"""Colourway = the BASE (black-garment) photo with only the garment pixels replaced by the rendered fabric from a
Gemini EDIT of that same photo. Same photograph, real fabric.

  1. garment mask from the BASE (black is trivially segmentable; below --top so hair is excluded; one blob)
  2. align the EDIT to the base as a whole frame — scale + shift, searched on the parts that should be identical
     (everything outside the garment) — Gemini re-renders at a slightly different zoom/offset every time
  3. inside the base garment mask: take the aligned edit pixel where it is rendered fabric (warm, textured, not
     the ivory tee, not skin); elsewhere in the mask (silhouette/hem mismatch) fall back to a shading-preserving
     recolour of the base pixel in the SAME colour as the rendered fabric, so it reads as one garment
  4. outside the mask: base, byte for byte
usage: python3 colourway_from_edit.py base.jpg edit.jpg out.jpg [--top 0.30] [--thresh 80]
Prints scale/offset, alignment residual, and the share of the garment that came from the render.
"""
import sys, numpy as np
from PIL import Image, ImageFilter, ImageDraw

def _blur(a, r):
    return np.asarray(Image.fromarray(np.clip(a*255,0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(float)/255
def _dil(m,r): return np.asarray(Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(int(r)|1)))>127

def garment_mask(x, top, th):
    H,W,_=x.shape; mx=x.max(2)
    neutral=(x[...,0]-x[...,2])<28
    raw=((mx<=th)&neutral).astype(float); raw[:int(H*top)]=0
    solid=_blur(raw,2.0)>0.5
    seed=None
    for yy in range(int(H*0.55),int(H*0.95),4):
        xs=np.where(solid[yy])[0]
        if len(xs): seed=(int(xs[len(xs)//2]),yy); break
    if seed is None: raise SystemExit("no black garment found in base")
    lab=Image.fromarray((solid*255).astype(np.uint8)).copy(); ImageDraw.floodfill(lab,seed,128)
    return np.asarray(lab)==128

def warp(img, s, dy, dx):
    """scale img by s about its centre, then shift by (dy,dx); same output size, edges padded by edge pixels"""
    H,W=img.shape[:2]
    im=Image.fromarray(np.clip(img,0,255).astype(np.uint8))
    nw,nh=max(1,int(round(W*s))),max(1,int(round(H*s)))
    im=im.resize((nw,nh),Image.LANCZOS)
    canvas=Image.new(im.mode,(W,H)); ox=int(round((W-nw)/2+dx)); oy=int(round((H-nh)/2+dy))
    canvas.paste(im,(ox,oy))
    a=np.asarray(canvas).astype(float)
    return a

def main():
    a=sys.argv[1:]; base_p,edit_p,out_p=a[0],a[1],a[2]
    top=float(a[a.index('--top')+1]) if '--top' in a else 0.30
    th=float(a[a.index('--thresh')+1]) if '--thresh' in a else 80
    B=np.asarray(Image.open(base_p).convert('RGB')).astype(float)
    E=np.asarray(Image.open(edit_p).convert('RGB').resize((B.shape[1],B.shape[0]),Image.LANCZOS)).astype(float)
    H,W,_=B.shape
    m=garment_mask(B,top,th)
    # 2. whole-frame alignment on the non-garment area (coarse on a 1/4 image, then refine at full res)
    ref=~_dil(m,41)
    f=4; Bs=np.asarray(Image.fromarray(B.astype(np.uint8)).resize((W//f,H//f),Image.BOX)).astype(float).mean(2)
    Es=np.asarray(Image.fromarray(E.astype(np.uint8)).resize((W//f,H//f),Image.BOX)).astype(float).mean(2)
    refs=np.asarray(Image.fromarray((ref*255).astype(np.uint8)).resize((W//f,H//f),Image.BOX))>200
    refs[:2]=refs[-2:]=False; refs[:,:2]=refs[:,-2:]=False
    best=(1e9,1.0,0,0)
    for s in np.arange(0.92,1.0801,0.01):
        Ew=warp(Es,s,0,0)
        for dy in range(-12,13):
            for dx in range(-12,13):
                sh=np.roll(np.roll(Ew,dy,0),dx,1)
                sc=np.abs(sh-Bs)[refs].mean()
                if sc<best[0]: best=(sc,s,dy,dx)
    sc,s,dy,dx=best
    # refine scale finer + shift ±3 at full res (on a 1/2 image for speed)
    f2=2; B2=np.asarray(Image.fromarray(B.astype(np.uint8)).resize((W//f2,H//f2),Image.BOX)).astype(float).mean(2)
    E2=np.asarray(Image.fromarray(E.astype(np.uint8)).resize((W//f2,H//f2),Image.BOX)).astype(float).mean(2)
    ref2=np.asarray(Image.fromarray((ref*255).astype(np.uint8)).resize((W//f2,H//f2),Image.BOX))>200
    ref2[:4]=ref2[-4:]=False; ref2[:,:4]=ref2[:,-4:]=False
    best2=(1e9,s,dy*2,dx*2)
    for s2 in np.arange(s-0.006,s+0.0061,0.002):
        Ew=warp(E2,s2,0,0)
        for ddy in range(-4,5):
            for ddx in range(-4,5):
                sh=np.roll(np.roll(Ew,dy*2+ddy,0),dx*2+ddx,1)
                v=np.abs(sh-B2)[ref2].mean()
                if v<best2[0]: best2=(v,s2,dy*2+ddy,dx*2+ddx)
    v,s,dy2,dx2=best2
    Ea=warp(E,s,dy2*2,dx2*2)
    resid=np.abs(Ea.mean(2)-B.mean(2))[ref].mean()
    # 3. take the aligned render across the garment and a few px around it (so the render's own fabric edge is
    #    used — no slivers where the two silhouettes differ by a pixel or two). The one exception: where the
    #    render put its tee hem lower than the base, the base's black pixel gets a shading-preserving recolour in
    #    the render's fabric colour instead of the render's ivory, so the tee stays identical across colourways.
    L=Ea.mean(2); R,Bl=Ea[...,0],Ea[...,2]
    region=_dil(m,7)
    ivory=(L>200)&(R-Bl<28)&m
    take=region&~ivory
    Lb=B.mean(2); Lg=Lb[m]; lo,hi=np.percentile(Lg,2),np.percentile(Lg,99.5)
    n=np.clip((Lb-lo)/max(hi-lo,1),0,1); k=0.5+(1.3-0.5)*n**0.85
    fabpix=m&(R-Bl>18)&(L<200)&(L>40)
    tgt=np.median(Ea[fabpix],axis=0)/max(np.median(k[fabpix]),0.2) if fabpix.sum()>500 else np.array([201.,168.,136.])
    fallcol=tgt[None,None,:]*k[...,None]
    out=np.where(ivory[...,None],fallcol,Ea)
    # soft boundary: 1.5 px feather where the region meets the untouched base
    al=_blur(region.astype(float),1.2)[...,None]
    final=np.where(al>0.999,out,al*out+(1-al)*B); final=np.where(_dil(region,5)[...,None],final,B)
    share=1-ivory.sum()/max(m.sum(),1); fall=ivory
    Image.fromarray(np.clip(final,0,255).astype(np.uint8)).save(out_p,quality=94)
    share=take.sum()/max(m.sum(),1)
    flag="" if (share>0.85 and resid<14) else "   <-- CHECK: low render share or poor alignment"
    print(f"{out_p.split('/')[-1]:28s} scale={s:.3f} shift=({dy2*2:+d},{dx2*2:+d}) align residual={resid:.1f}  garment from render={share*100:.1f}%  fallback={fall.mean()*100:.2f}% of frame{flag}")
main()
