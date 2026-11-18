// node tools/shoot.js [outDir] [slideNumbers...]  -> PNG per slide at 1280x720
const puppeteer = require('puppeteer-core');
const path = require('path'), fs = require('fs');
const EXE = process.env.CHROME || 'C:\\Users\\USER\\.mercury\\browsers\\chrome\\win64-154.0.8037.92\\chrome-win64\\chrome.exe';
(async () => {
  const out = process.argv[2] || path.join(__dirname, '..', 'shots');
  fs.mkdirSync(out, { recursive: true });
  const file = 'file:///' + (process.env.DIST || path.join(__dirname, '..', 'dist', 'AI_for_Learning.html')).replace(/\\/g, '/');
  const b = await puppeteer.launch({ executablePath: EXE, headless: true, args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1320, height: 760 });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(file + '#1', { waitUntil: 'load' });
  const n = await p.evaluate(() => document.querySelectorAll('#deck .slide').length);
  let list = process.argv.slice(3).map(Number);
  if (!list.length) list = Array.from({ length: n }, (_, i) => i + 1);
  for (const k of list) {
    await p.goto(file + '?s=' + k + '#' + k, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 1800));
    const el = await p.$('#deck');
    await el.screenshot({ path: path.join(out, String(k).padStart(2, '0') + '.png') });
  }
  console.log('slides', n, 'shot', list.length, 'errors', JSON.stringify(errs));
  await b.close();
})();
