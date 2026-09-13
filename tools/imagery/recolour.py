#!/usr/bin/env python3
"""Post recolour of a SATURATED garment (wine -> blush, black -> ... no). For the case where Gemini's colour edit
keeps drifting: the base photo's garment is masked by hue/saturation and re-mapped to the listed colour, keeping
the fabric's own shading. Only works when the garment's hue is distinct from skin and backdrop (wine/pink/navy on a
grey set: yes; cream/oat/black: no — use composite.py with a Gemini edit for those).
usage: python3 recolour.py in.jpg out.jpg --hue 340-15 --sat 0.22 --target 220,185,182
"""
import sys, numpy as np
from PIL import Image, ImageFilter

def rgb2hsv(a):
    r,g,b=a[...,0],a[...,1],a[...,2]; mx=a.max(2); mn=a.min(2); d=mx-mn
    h=np.zeros_like(mx)
    m=d>0
    rm=m&(mx==r); gm=m&(mx==g)&~rm; bm=m&~rm&~gm
    h[rm]=(60*((g-b)[rm]/d[rm]))%360; h[gm]=60*((b-r)[gm]/d[gm])+120; h[bm]=60*((r-g)[bm]/d[bm])+240
    s=np.where(mx>0,d/np.maximum(mx,1e-6),0); return h,s,mx

def main():
    args=sys.argv[1:]; inp,outp=args[0],args[1]
    hue=args[args.index('--hue')+1]; sat=float(args[args.index('--sat')+1]); tgt=np.array([float(x) for x in args[args.index('--target')+1].split(',')])
    h0,h1=[float(x) for x in hue.split('-')]
    a=np.asarray(Image.open(inp).convert('RGB')).astype(float); H,W,_=a.shape
    h,s,v=rgb2hsv(a)
    inhue=((h>=h0)|(h<=h1)) if h0>h1 else ((h>=h0)&(h<=h1))
    m=inhue&(s>sat)&(v>25)
    # open hard (kills skin speckle that shares the hue edge), then close to heal the ribbing
    im=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.MinFilter(int(W*0.008)|1)).filter(ImageFilter.MaxFilter(int(W*0.014)|1)).filter(ImageFilter.MinFilter(int(W*0.006)|1))
    m=np.asarray(im)>127
    alpha=np.asarray(im.filter(ImageFilter.GaussianBlur(W*0.002))).astype(float)/255.0
    # shading = luminance relative to the garment's own median; target colour scaled by that shading
    L=0.2126*a[...,0]+0.7152*a[...,1]+0.0722*a[...,2]
    med=np.median(L[m]); shade=np.clip(L/max(med,1),0.25,1.6)
    tl=0.2126*tgt[0]+0.7152*tgt[1]+0.0722*tgt[2]
    new=np.clip(tgt[None,None,:]*shade[...,None],0,255)
    # keep a little of the original texture contrast
    out=a*(1-alpha[...,None])+new*alpha[...,None]
    Image.fromarray(np.clip(out,0,255).astype(np.uint8)).save(outp,quality=94,subsampling=0)
    print(f"{outp.split('/')[-1]}: garment {m.mean()*100:.1f}% of frame, target {tgt.astype(int).tolist()}")
main()
