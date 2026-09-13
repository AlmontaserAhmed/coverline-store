import sys
from PIL import Image
inp, outp = sys.argv[1], sys.argv[2]
im = Image.open(inp).convert("RGB")
w,h = im.size
target_ratio = 1512/2016
cur_ratio = w/h
if cur_ratio > target_ratio:
    new_w = int(h*target_ratio)
    x0 = (w-new_w)//2
    im = im.crop((x0,0,x0+new_w,h))
else:
    new_h = int(w/target_ratio)
    y0 = (h-new_h)//2
    im = im.crop((0,y0,w,y0+new_h))
im = im.resize((1512,2016), Image.LANCZOS)
im.save(outp, quality=94)
print("processed", outp, im.size)
