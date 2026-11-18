"""One-off: turn the Firefox 'Save Frame As' snapshot of the claude.ai artifact
into a clean, editable source tree under src/.

src/head.css        - the deck stylesheet (fonts left as data URIs)
src/chrome.html     - hud / progress / grid / notes + bg template
src/slides/NN.html  - one <section> per file (order = filename)
src/js/NN-*.js      - inline scripts in order
assets/img/<key>.jpg- photos referenced by data-img
"""
import re, os, base64, json, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
snap = open(os.path.join(ROOT, 'original', 'artifact_v21.html'), encoding='utf-8').read()

# 1. drop claude frame runtime + its <head>; artifact content starts at the first real <meta charset>
start = snap.index('<meta charset="utf-8">')
body = snap[start:]
body = body.replace('</body></html>', '').replace('</body>', '').replace('</html>', '')

# 2. split head (meta/title/style) from body content
hud = body.index('<div id="hud">')
headpart, rest = body[:hud], body[hud:]
css = re.search(r'<style>(.*?)</style>', headpart, re.S).group(1)
title = re.search(r'<title>(.*?)</title>', headpart, re.S).group(1)

# 3. reset runtime state
rest = re.sub(r'<div id="gg">.*?</div></div>\s*\n', '<div id="gg"></div></div>\n', rest, count=1, flags=re.S)
rest = re.sub(r'<div id="notes">.*?</div>\s*\n<div id="stage">', '<div id="notes"></div>\n<div id="stage">', rest, count=1, flags=re.S)
rest = rest.replace('<div id="deck" style="transform: none; zoom: 0.8153;">', '<div id="deck">')
rest = re.sub(r'<span id="count">[^<]*</span>', '<span id="count">1 / 21</span>', rest)
# cloned backgrounds: the bg block right after each <section ...>
bgre = re.compile(r'(<section[^>]*>)\s*<div class="bg">.*?<div class="sheen"></div>\s*</div>', re.S)
rest, nbg = bgre.subn(r'\1', rest)
print('bg clones removed', nbg)
# images: strip runtime src from data-img images
rest = re.sub(r'(<img[^>]*?)\s+src="data:[^"]*"', r'\1', rest)
# qr boxes generated content
rest = re.sub(r'(<div class="qr(?: [^"]*)?"[^>]*>).*?(</div>)', r'\1\2', rest, flags=re.S)
# footers numbered at runtime -> empty last span
rest = re.sub(r'<span>\d\d / 21</span></div><div class="rulebar">', '<span></span></div><div class="rulebar">', rest)
rest = rest.replace('class="rmworm flip"', 'class="rmworm"')
rest = re.sub(r'class="slide([^"]*?) on"', r'class="slide\1"', rest)

# 4. split stage / scripts
stage_start = rest.index('<div id="stage">')
chrome = rest[:stage_start]
stage_end = rest.index('</div></div>', rest.rindex('</section>'))
stage = rest[stage_start:stage_end]
scripts_part = rest[stage_end + len('</div></div>'):]
tpl = re.search(r'<template id="bgtpl">.*?</template>', stage, re.S).group(0)
sections = re.findall(r'(?:<!--[^>]*-->\s*)?<section.*?</section>', stage, re.S)
print('sections', len(sections))

os.makedirs(os.path.join(ROOT, 'src', 'slides'), exist_ok=True)
os.makedirs(os.path.join(ROOT, 'src', 'js'), exist_ok=True)
os.makedirs(os.path.join(ROOT, 'assets', 'img'), exist_ok=True)
open(os.path.join(ROOT, 'src', 'head.css'), 'w', encoding='utf-8').write(css.strip() + '\n')
open(os.path.join(ROOT, 'src', 'chrome.html'), 'w', encoding='utf-8').write(chrome.strip() + '\n' + tpl + '\n')
for i, s in enumerate(sections, 1):
    open(os.path.join(ROOT, 'src', 'slides', '%02d.html' % i), 'w', encoding='utf-8').write(s.strip() + '\n')

scripts = re.findall(r'<script([^>]*)>(.*?)</script>', scripts_part, re.S)
n = 0
for attrs, code in scripts:
    if 'three.min' in attrs:
        continue
    if code.startswith('window.IMGS='):
        m = re.match(r'window\.IMGS=(\{.*?\});', code, re.S)
        imgs = json.loads(m.group(1))
        for k, v in imgs.items():
            b = base64.b64decode(v.split(',', 1)[1])
            open(os.path.join(ROOT, 'assets', 'img', k + '.jpg'), 'wb').write(b)
        print('images', list(imgs))
        continue
    n += 1
    name = 'qrcode-lib' if code.startswith('var QRCode') else 'main'
    open(os.path.join(ROOT, 'src', 'js', '%02d-%s.js' % (n, name)), 'w', encoding='utf-8').write(code.strip() + '\n')
print('scripts', n)
open(os.path.join(ROOT, 'src', 'title.txt'), 'w', encoding='utf-8').write(title)
