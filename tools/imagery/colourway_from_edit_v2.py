#!/usr/bin/env python3
"""colourway_from_edit.py, generalized for a NON-black (chromatic) base garment.

Same idea as the original: same photograph, only the garment pixels get the render's fabric.
The original derived the garment mask from the base alone (floodfill on "dark & neutral" pixels) —
that only works when the base garment is black. For a wine/burgundy base that test excludes most
of the garment (wine has high R-B, "neutral" fails), which is why the wine->blush composites came
out barely-changed or a jagged partial blob.

New approach, colour-agnostic:
  1. align the EDIT to the BASE using a generous fixed centre-box exclusion (garment always lands
     roughly hip-to-thigh, centred) as the "known non-garment" reference region for the search —
     doesn't need to be exact, just needs to leave enough real reference pixels (head, arms, lower
     legs, floor, background) outside it.
  2. after alignment, the garment is wherever the aligned edit and the base differ a lot in colour
     (recolour) while skin/tee/background/floor should already match closely — so the true mask is
     the big connected blob of "aligned edit far from base" pixels inside (a dilation of) the coarse
     centre-box.
  3. composite exactly like the original: take the aligned render's own fabric pixels across the
     mask, with a shading-preserving recolour fallback for the ivory tee (so the tee never shifts)
     and any small silhouette mismatch slivers.
usage: python3 colourway_from_edit_v2.py base.jpg edit.jpg out.jpg
"""
import sys, numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage

def _blur(a, r):
    return np.asarray(Image.fromarray(np.clip(a*255,0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(float)/255
def _dil(m,r): return np.asarray(Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(int(r)|1)))>127
def _erd(m,r): return ~_dil(~m,r)

def warp(img, s, dy, dx):
    H,W=img.shape[:2]
    im=Image.fromarray(np.clip(img,0,255).astype(np.uint8))
    nw,nh=max(1,int(round(W*s))),max(1,int(round(H*s)))
    im=im.resize((nw,nh),Image.LANCZOS)
    canvas=Image.new(im.mode,(W,H)); ox=int(round((W-nw)/2+dx)); oy=int(round((H-nh)/2+dy))
    canvas.paste(im,(ox,oy))
    return np.asarray(canvas).astype(float)

def largest_component(mask):
    """largest connected blob of a boolean mask via scipy.ndimage.label."""
    lab,n=ndimage.label(mask)
    if n==0: return mask
    sizes=ndimage.sum(mask,lab,range(1,n+1))
    best=int(np.argmax(sizes))+1
    return lab==best

def main():
    base_p,edit_p,out_p=sys.argv[1],sys.argv[2],sys.argv[3]
    B=np.asarray(Image.open(base_p).convert('RGB')).astype(float)
    E=np.asarray(Image.open(edit_p).convert('RGB').resize((B.shape[1],B.shape[0]),Image.LANCZOS)).astype(float)
    H,W,_=B.shape

    # adaptive box: unaligned base/edit diff already flags the garment (scale/shift error is small,
    # a few % — most of the frame outside the garment differs by near-zero even before alignment).
    # This handles both a full-body shot (garment ~1/3 of frame) and a tight detail crop (garment
    # fills almost the whole frame) without hand-tuned fractions.
    diff0=np.sqrt(((E-B)**2).sum(2))
    cand0=diff0>35
    cand0=_blur(cand0.astype(float),2.0)>0.4
    lab0,n0=ndimage.label(cand0)
    if n0>0:
        sizes0=ndimage.sum(cand0,lab0,range(1,n0+1))
        best0=int(np.argmax(sizes0))+1
        blob0=lab0==best0
        ys,xs=np.where(blob0)
        y0,y1=max(0,ys.min()-int(H*0.06)),min(H,ys.max()+int(H*0.06))
        x0,x1=max(0,xs.min()-int(W*0.06)),min(W,xs.max()+int(W*0.06))
    else:
        y0,y1,x0,x1=int(H*0.36),int(H*0.82),int(W*0.10),int(W*0.90)
    box=np.zeros((H,W),dtype=bool)
    box[y0:y1,x0:x1]=True
    ref=~_dil(box,25)

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

    # true garment mask: big colour-diff blob inside the coarse box
    diff=np.sqrt(((Ea-B)**2).sum(2))
    cand=(diff>40)&_dil(box,10)
    cand=_blur(cand.astype(float),1.5)>0.5
    m=largest_component(cand)
    m=_dil(_erd(m,3),3)  # clean speckle, keep shape

    L=Ea.mean(2); R,Bl=Ea[...,0],Ea[...,2]
    region=_dil(m,7)
    ivory=(L>200)&(R-Bl<28)&m
    take=region&~ivory
    Lb=B.mean(2); Lg=Lb[m]; lo,hi=(np.percentile(Lg,2),np.percentile(Lg,99.5)) if m.sum()>200 else (0,255)
    n=np.clip((Lb-lo)/max(hi-lo,1),0,1); k=0.5+(1.3-0.5)*n**0.85
    fabpix=m&(R-Bl>18)&(L<200)&(L>40)
    tgt=np.median(Ea[fabpix],axis=0)/max(np.median(k[fabpix]),0.2) if fabpix.sum()>500 else np.array([201.,168.,136.])
    fallcol=tgt[None,None,:]*k[...,None]
    out=np.where(ivory[...,None],fallcol,Ea)
    al=_blur(region.astype(float),1.2)[...,None]
    final=np.where(al>0.999,out,al*out+(1-al)*B); final=np.where(_dil(region,5)[...,None],final,B)
    share=take.sum()/max(m.sum(),1)
    Image.fromarray(np.clip(final,0,255).astype(np.uint8)).save(out_p,quality=94)
    flag="" if (share>0.85 and resid<14) else "   <-- CHECK: low render share or poor alignment"
    print(f"{out_p.split('/')[-1]:28s} scale={s:.3f} shift=({dy2*2:+d},{dx2*2:+d}) align residual={resid:.1f}  garment px={int(m.sum())}  garment from render={share*100:.1f}%{flag}")
main()
