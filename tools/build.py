"""Assemble src/ into one self-contained file: dist/AI_for_Learning.html
Slides are taken from src/slides/*.html in filename order; files starting with '_' are skipped.
Extra CSS: src/css/*.css (appended after head.css). Extra JS: src/js/*.js in order.
Images: every file in assets/img becomes window.IMGS[<stem>] (used by <img data-img="stem">).
"""
import os, glob, base64, json, re, mimetypes
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = lambda *p: os.path.join(ROOT, *p)
read = lambda p: open(p, encoding='utf-8').read()

css = read(S('src', 'head.css'))
for f in sorted(glob.glob(S('src', 'css', '*.css'))):
    css += '\n/* ---- %s ---- */\n' % os.path.basename(f) + read(f)
slides = [read(f) for f in sorted(glob.glob(S('src', 'slides', '*.html'))) if not os.path.basename(f).startswith('_')]
imgs = {}
for f in sorted(glob.glob(S('assets', 'img', '*'))):
    stem, ext = os.path.splitext(os.path.basename(f))
    mime = mimetypes.guess_type(f)[0] or 'image/jpeg'
    if ext.lower() == '.webp': mime = 'image/webp'
    imgs[stem] = 'data:%s;base64,%s' % (mime, base64.b64encode(open(f, 'rb').read()).decode())
js = []
for f in sorted(glob.glob(S('src', 'js', '*.js'))):
    name = os.path.basename(f)
    if name == 'three.min.js':
        continue
    js.append('<script>/* %s */\n%s</script>' % (name, read(f)))
three = read(S('src', 'js', 'three.min.js'))
# Lottie: only animations referenced by data-lottie="key" in slides are embedded
alltext = '\n'.join(slides)
lot = {}
for k in sorted(set(re.findall(r'data-lottie="([^"]+)"', alltext))):
    f = S('assets', 'lottie', k + '.json')
    if os.path.exists(f):
        lot[k] = json.loads(read(f))
lottie_js = read(S('assets', 'lottie', 'lottie-web-5.12.2.min.js')) if lot else ''
n = len(slides)
chrome = read(S('src', 'chrome.html')).replace('1 / 21', '1 / %d' % n)
out = ('<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
       '<title>%s</title>\n<style>\n%s\n</style>\n</head>\n<body>\n' % (read(S('src', 'title.txt')), css))
out += chrome.split('<template id="bgtpl">')[0]
out += '<div id="stage"><div id="deck">\n' + '<template id="bgtpl">' + chrome.split('<template id="bgtpl">')[1] + '\n'
out += '\n\n'.join(slides)
out += '\n</div></div>\n'
out += '<script>window.IMGS=%s;</script>\n' % json.dumps(imgs)
out += '<script>%s</script>\n' % three
if lot:
    out += '<script>%s</script>\n' % lottie_js
    out += '<script>window.LOTTIE=%s;</script>\n' % json.dumps(lot, separators=(',', ':'))
    out += '<script>(function(){var A=[];document.querySelectorAll("[data-lottie]").forEach(function(el){var d=window.LOTTIE[el.dataset.lottie];if(!d||!window.lottie)return;var a=lottie.loadAnimation({container:el,renderer:"svg",loop:true,autoplay:false,animationData:JSON.parse(JSON.stringify(d))});a.addEventListener(\"DOMLoaded\",function(){a.goToAndStop(Math.floor(a.totalFrames*0.3),true);});A.push([el,a]);});function sync(){A.forEach(function(p){var on=p[0].closest(".slide.on")&&p[0].offsetParent!==null;if(on)p[1].play();else p[1].pause();});}setInterval(sync,150);sync();})();</script>\n'
out += '\n'.join(js)
out += '\n<script>document.querySelectorAll("img[data-img]").forEach(function(i){if(!i.getAttribute("src"))i.src=IMGS[i.dataset.img]||"";});</script>\n</body>\n</html>\n'
import sys
dest = sys.argv[1] if len(sys.argv) > 1 else S('dist', 'AI_for_Learning.html')
os.makedirs(os.path.dirname(dest), exist_ok=True)
open(dest, 'w', encoding='utf-8').write(out)
print('built %d slides, %d images, %.1f MB' % (n, len(imgs), len(out) / 1e6))
