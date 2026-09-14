#!/usr/bin/env python3
"""Coverline — make every finished image sit on the SAME backdrop.
grade.py normalises one number (mean of the top 10%); the renders differ in the whole backdrop *field*
(brightness + gradient + vignette), which is what makes a gallery look like four different shoots.
This fits a smooth quadratic luminance field to the pure-backdrop border of each image (top rows, side
columns above the floor line), fits the same field on the house reference, and applies gain = ref/own
across the frame. Figure and garment keep their relative tones; the room becomes one room.
usage: python3 match_backdrop.py ref.jpg in.jpg [in2.jpg ...]   (rewrites each in.jpg in place)
"""
import sys, numpy as np
from PIL import Image, ImageFilter

def lum(a): return 0.2126*a[...,0]+0.7152*a[...,1]+0.0722*a[...,2]

def floor_row(L):
    """row of the backdrop->floor step; -1 when there is no floor in frame (detail crops)"""
    h,w=L.shape; k=int(h*0.01)
    def edge(col):
        sm=np.convolve(col,np.ones(k)/k,mode="same"); seg=sm[int(h*0.55):int(h*0.95)]; d=seg[k:]-seg[:-k]
        i=int(np.argmin(d)); return int(h*0.55)+i+k//2, -d[i]
    yl,sl=edge(L[:, :int(w*0.05)].mean(1)); yr,sr=edge(L[:, int(w*0.95):].mean(1))
    # a real floor is a step on BOTH edges at about the same height; a hem or a hand is not
    if sl>6 and sr>6 and abs(yl-yr)<h*0.03: return (yl+yr)//2
    return -1


def figure_mask(L, F, fy):
    """The model's silhouette: far from the fitted backdrop field, texture removed, and only the one blob that
    stands on the floor line — the backdrop's paper creases must never become islands of different gain."""
    h,w=L.shape; k=4
    small=np.abs(L-F)[::k,::k]>26
    im=Image.fromarray((small*255).astype(np.uint8))
    r=max(3,int(w/k*0.02)|1)
    im=im.filter(ImageFilter.MinFilter(r)).filter(ImageFilter.MaxFilter(r))          # opening: kill texture
    im=im.filter(ImageFilter.MaxFilter(r+2)).filter(ImageFilter.MinFilter(r+2))      # closing: heal the figure
    m=np.asarray(im)>127
    # keep only what connects to the floor-line band in the middle of the frame (the model's feet/legs)
    seed=np.zeros_like(m); y=int(fy/k); seed[max(0,y-6):y+6, int(m.shape[1]*0.3):int(m.shape[1]*0.7)]=True
    seed&=m
    cur=seed
    for _ in range(400):
        nxt=np.asarray(Image.fromarray((cur*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)))>127
        nxt&=m
        if (nxt==cur).all(): break
        cur=nxt
    big=np.asarray(Image.fromarray((cur*255).astype(np.uint8)).resize((w,h),Image.BILINEAR))>127
    return big

def fit_field(L, fy=None):
    h,w=L.shape
    if fy is None: fy=floor_row(L)
    ys,xs=np.mgrid[0:h,0:w]
    m=np.zeros((h,w),bool)
    m[:int(h*0.04),:]=True                       # top strip
    top=fy if fy>=0 else h
    m[:top, :int(w*0.06)]=True; m[:top, int(w*0.94):]=True   # side strips above the floor
    if fy>=0: m[fy+int(h*0.02):, :int(w*0.06)]=True; m[fy+int(h*0.02):, int(w*0.94):]=True  # floor edges too
    X=np.stack([np.ones(m.sum()), xs[m]/w, ys[m]/h, (xs[m]/w)**2, (ys[m]/h)**2, xs[m]*ys[m]/(w*h)],1)
    Xa=np.stack([np.ones(h*w), (xs/w).ravel(), (ys/h).ravel(), ((xs/w)**2).ravel(), ((ys/h)**2).ravel(), (xs*ys/(w*h)).ravel()],1)
    if fy<0:   # no floor in frame: one field for the whole image
        coef,_,_,_=np.linalg.lstsq(X, L[m], rcond=None); return (Xa@coef).reshape(h,w), -1
    # separate fit above/below the floor so the floor step is preserved
    coef_b,_ ,_,_=np.linalg.lstsq(X[ys[m]<fy], L[m][ys[m]<fy], rcond=None)
    coef_f,_ ,_,_=np.linalg.lstsq(X[ys[m]>=fy], L[m][ys[m]>=fy], rcond=None)
    Fb=(Xa@coef_b).reshape(h,w); Ff=(Xa@coef_f).reshape(h,w)
    # blend across the floor line over ~3% of height so no hard seam
    t=np.clip((ys-fy)/(h*0.03),0,1)
    return Fb*(1-t)+Ff*t, fy

def main():
    ref=np.asarray(Image.open(sys.argv[1]).convert("RGB")).astype(np.float32)
    Tl,tfy=fit_field(lum(ref))
    Tf=np.stack([fit_field(ref[...,c],tfy)[0] for c in range(3)],-1)   # per channel: matches colour temperature too
    for p in sys.argv[2:]:
        im=Image.open(p).convert("RGB"); a=np.asarray(im).astype(np.float32)
        if a.shape!=ref.shape: raise SystemExit(f"{p}: size {a.shape} != ref {ref.shape}")
        out=a
        for _ in range(2):   # two passes: the quadratic under-fits big gaps, second pass closes it
            L=lum(out); h,w=L.shape
            Fl,fy=fit_field(L)
            F=np.stack([fit_field(out[...,c],fy)[0] for c in range(3)],-1) if fy>=0 else Fl
            # tight crops (torso / legs fill the frame) have no clean border: the edge strips are garment
            tight=p.endswith("-detail.jpg") and any(k in p for k in ("tee-","loungeset-","legging-","short-"))
            if fy<0 or tight:
                # no clean border to fit a field on. Use a hand-picked pure-backdrop patch per crop type
                # (fractions of w,h: x0,x1,y0,y1) and a single global gain so the patch matches the reference's
                # top-strip level. Keeps the close-up in the same room as the full-body shots.
                patch={"tee-":(0.0,0.12,0.0,0.30),"loungeset-":(0.0,0.10,0.0,0.25),"legging-":(0.88,1.0,0.0,0.30),"short-":(0.90,1.0,0.0,0.25)}
                key=next((k for k in patch if k in p),None)
                if key:
                    x0,x1,y0,y1=patch[key]; own=out[int(h*y0):int(h*y1), int(w*x0):int(w*x1)].reshape(-1,3).mean(0)
                    g=np.clip(Tf[:int(h*0.05)].reshape(-1,3).mean(0)/np.maximum(own,1),0.55,1.25)
                    out=np.clip(out*g,0,255)
                break
            shift=fy-tfy; T=np.roll(Tf,shift,axis=0)     # align the target field to THIS image's floor line
            if shift>0: T[:shift]=Tf[0]
            elif shift<0: T[shift:]=Tf[-1]
            gain=np.clip(T/np.maximum(F,1),0.70,1.45)
            # The field gain is for the ROOM. On the figure it would paint the floor's darkening onto trouser legs
            # (cream joggers went grey from the knee down). Inside the silhouette use one scalar gain per channel
            # (the mean room gain above the floor) so the garment keeps its own shading.
            # Per-pixel: a pixel that looks like the fitted backdrop gets the field gain (it IS backdrop, creases and
            # all); a pixel far from it (garment, skin, hair) gets one scalar gain per channel — the mean room gain
            # above the floor — so a garment keeps its own shading and never inherits the floor's darkening.
            dist=np.abs(out-F).max(2)
            wfig=np.clip((dist-18.0)/22.0,0,1)
            wfig=np.asarray(Image.fromarray((wfig*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(w*0.003))).astype(np.float32)[...,None]/255.0
            scalar=gain[:fy][(dist[:fy]<18)].reshape(-1,3).mean(0)
            gain=gain*(1-wfig)+scalar*wfig
            out=np.clip(out*gain,0,255)
        Image.fromarray(out.round().astype(np.uint8)).save(p,quality=94)
        c=lambda z: z[:int(z.shape[0]*0.3), :int(z.shape[1]*0.06)].mean()
        print(f"{p.split('/')[-1]:28} floor {fy:4d} corner {c(lum(a)):5.0f} -> {c(lum(out)):5.0f}  (ref {c(lum(ref)):.0f})")
main()
