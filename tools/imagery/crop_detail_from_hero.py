#!/usr/bin/env python3
"""Rule 7 fallback: when a colour-edit detail shot keeps drifting from Gemini (composite.py flags DRIFTED
more than twice), make it an identical crop of the finished hero instead of generating a new pose. Heroes
across colourways are pixel-aligned by composite.py, so one crop box works for all colourways of a garment.

usage: python3 crop_detail_from_hero.py <garment-prefix> <colour1> [<colour2> ...] [--box x0,y0,x1,y1]
  e.g. python3 crop_detail_from_hero.py loungeset cream charcoal
Box defaults to the one used for the Off-Duty Set (chin down through the collar/zip/chest seams and pockets):
  0.336,0.17,0.656,0.49  (fractions of the hero's width,height,width,height)
Reads out/<prefix>-<colour>.jpg (must already be finished/graded), writes out/<prefix>-<colour>-detail.jpg
at the same 1512x2016 the rest of the gallery uses.
"""
import sys
from PIL import Image

DEFAULT_BOX = (0.336, 0.17, 0.656, 0.49)

def main():
    args = sys.argv[1:]
    box = DEFAULT_BOX
    if "--box" in args:
        i = args.index("--box")
        box = tuple(float(v) for v in args[i+1].split(","))
        del args[i:i+2]
    prefix, colours = args[0], args[1:]
    for colour in colours:
        src = f"out/{prefix}-{colour}.jpg"
        im = Image.open(src).convert("RGB")
        w, h = im.size
        x0, y0, x1, y1 = [int(box[i] * (w if i % 2 == 0 else h)) for i in range(4)]
        crop = im.crop((x0, y0, x1, y1)).resize((1512, 2016), Image.LANCZOS)
        out = f"out/{prefix}-{colour}-detail.jpg"
        crop.save(out, quality=96)
        print(f"{out}  <- {src} crop {(x0,y0,x1,y1)}")

if __name__ == "__main__":
    main()
