import sys, glob, os
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]
nums = sys.argv[3:]
files = [os.path.join(src, n.zfill(2) + '.png') for n in nums] if nums else sorted(glob.glob(os.path.join(src, '*.png')))
W, H, cols = 640, 360, 2
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (W * cols, H * rows), 'white')
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((W, H), Image.LANCZOS)
    x, y = (i % cols) * W, (i // cols) * H
    sheet.paste(im, (x, y)); d.rectangle([x, y, x + 34, y + 20], fill='red'); d.text((x + 4, y + 4), os.path.basename(f)[:2], fill='white')
sheet.save(out)
