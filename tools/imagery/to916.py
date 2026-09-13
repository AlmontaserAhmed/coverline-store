#!/usr/bin/env python3
"""Put a 4:5 final (1512x2016) on an ivory 1080x1920 canvas for TikTok Photo Mode.
usage: python3 to916.py in.jpg out.jpg"""
import sys
from PIL import Image
IVORY=(243,239,233)
inp,out=sys.argv[1],sys.argv[2]
im=Image.open(inp).convert("RGB").resize((1080,1440),Image.LANCZOS)
c=Image.new("RGB",(1080,1920),IVORY); c.paste(im,(0,240))
c.save(out,quality=94); print("saved",out)
