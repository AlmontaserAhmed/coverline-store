#!/usr/bin/env python3
"""
Coverline on-image text/price overlay — matches the locked brand doc (Option C palette).
Usage: python3 overlay.py input.jpg output.jpg [--text "some text" --pos tl|tr|bl|br] [--price "£15"]
Can pass multiple --text blocks by repeating the flag.
"""
import argparse
from PIL import Image, ImageDraw, ImageFont

import os
FONT_DIR = os.path.dirname(os.path.abspath(__file__))
INK = (43, 18, 24)        # #2B1218
OAT = (232, 223, 211)     # #E8DFD3
STONE = (184, 175, 166)   # #B8AFA6
BERRY = (156, 43, 78)     # #9C2B4E
WHITE = (255, 255, 255)

def font(size, weight="SemiBold"):
    return ImageFont.truetype(f"{FONT_DIR}/Inter-{weight}.ttf", size)

def rounded_card(draw, xy, radius, fill):
    draw.rounded_rectangle(xy, radius=radius, fill=fill)

def add_text_card(im, text, position="bl", card_color=OAT, text_color=INK, margin=60, pad_x=34, pad_y=20, font_size=40, extra_offset=0):
    draw = ImageDraw.Draw(im, "RGBA")
    f = font(font_size, "SemiBold")
    bbox = draw.textbbox((0, 0), text, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    w, h = im.size
    card_w, card_h = tw + pad_x * 2, th + pad_y * 2
    if position == "tl":
        x0, y0 = margin, margin + extra_offset
    elif position == "tr":
        x0, y0 = w - margin - card_w, margin + extra_offset
    elif position == "bl":
        x0, y0 = margin, h - margin - card_h - extra_offset
    elif position == "br":
        x0, y0 = w - margin - card_w, h - margin - card_h - extra_offset
    elif position == "center_top":
        x0, y0 = (w - card_w) // 2, margin + extra_offset
    rounded_card(draw, (x0, y0, x0 + card_w, y0 + card_h), radius=card_h // 3, fill=card_color)
    draw.text((x0 + pad_x - bbox[0], y0 + pad_y - bbox[1]), text, font=f, fill=text_color)
    return im, (x0, y0, card_w, card_h)

def add_price_tag(im, price_text, position="bl", margin=60, extra_offset=0, font_size=38):
    return add_text_card(im, price_text, position=position, card_color=BERRY, text_color=WHITE,
                          margin=margin, pad_x=30, pad_y=16, font_size=font_size, extra_offset=extra_offset)

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("output")
    ap.add_argument("--text", action="append", default=[])
    ap.add_argument("--textpos", action="append", default=[])
    ap.add_argument("--price", default=None)
    ap.add_argument("--pricepos", default="bl")
    args = ap.parse_args()

    im = Image.open(args.input).convert("RGB")
    text_card_box = None
    for i, t in enumerate(args.text):
        pos = args.textpos[i] if i < len(args.textpos) else "bl"
        im, box = add_text_card(im, t, position=pos)
        if pos == args.pricepos:
            text_card_box = box
    if args.price:
        gap = 18
        extra = (text_card_box[3] + gap) if text_card_box else 0
        im, _ = add_price_tag(im, args.price, position=args.pricepos, extra_offset=extra)
    im.save(args.output, quality=94)
    print("saved", args.output, im.size)
