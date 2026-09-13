#!/usr/bin/env python3
"""Coverline house grade — makes every render sit in the same light.
Target (measured 13 Sep from the best-looking site images): backdrop luminance ~145, warm (+8 R-B),
floor a touch darker than the backdrop, no blown highlights (p95 ≈ 180), gentle contrast.
usage: python3 grade.py in.jpg out.jpg   |   import grade; grade.apply(PIL.Image) -> PIL.Image
"""
import sys, numpy as np
from PIL import Image
TARGET_BACKDROP_L = 145.0; TARGET_WARMTH = 8.0; MAX_P95 = 182.0

def _lum(a): return 0.2126*a[...,0]+0.7152*a[...,1]+0.0722*a[...,2]

def measure(im):
    a=np.asarray(im.convert("RGB")).astype(np.float32); h=a.shape[0]
    top=a[:int(h*0.10)].reshape(-1,3).mean(0); L=_lum(a)
    return {"backdrop_L":float(_lum(top)),"warmth":float(top[0]-top[2]),"p95":float(np.percentile(L,95)),"std":float(L.std())}

def apply(im):
    a=np.asarray(im.convert("RGB")).astype(np.float32)/255.0
    h,w,_=a.shape
    m=measure(im)
    # 1. exposure: bring the backdrop to target with a gamma (keeps blacks black, doesn't clip)
    cur=max(m["backdrop_L"],1.0)/255.0; tgt=TARGET_BACKDROP_L/255.0
    gamma=np.log(tgt)/np.log(cur) if 0<cur<1 else 1.0
    gamma=float(np.clip(gamma,0.7,1.6))
    a=np.power(np.clip(a,0,1),gamma)
    # 2. warmth: nudge R up / B down until the backdrop reads +TARGET_WARMTH
    top=(a[:int(h*0.10)].reshape(-1,3).mean(0))*255
    need=(TARGET_WARMTH-(top[0]-top[2]))/255.0
    a[...,0]=np.clip(a[...,0]+need*0.5,0,1); a[...,2]=np.clip(a[...,2]-need*0.5,0,1)
    # 3. gentle S-curve for contrast (strength 0.12), pivot at mid-grey
    x=a; a=np.clip(x+0.12*(x-0.5)*(1-np.abs(2*x-1)),0,1)
    # 4. floor falloff: bottom 30% eases to 0.94 so the floor sits under the backdrop, not brighter
    ramp=np.ones(h,dtype=np.float32); y0=int(h*0.70); ramp[y0:]=np.linspace(1.0,0.94,h-y0)
    a=a*ramp[:,None,None]
    # 5. soft highlight ceiling
    L=_lum(a*255); p95=np.percentile(L,95)
    if p95>MAX_P95: a=a*(MAX_P95/p95)**0.5
    return Image.fromarray((np.clip(a,0,1)*255).round().astype(np.uint8))

if __name__=="__main__":
    im=Image.open(sys.argv[1]); out=apply(im); out.save(sys.argv[2],quality=94)
    print("before",{k:round(v,1) for k,v in measure(im).items()},"after",{k:round(v,1) for k,v in measure(out).items()})
