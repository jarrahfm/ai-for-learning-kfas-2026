// node tools/states.js <slide#> <selector> <clicks> <out.png>
const puppeteer=require('puppeteer-core'),path=require('path');
(async()=>{const [n,sel,c,out]=process.argv.slice(2);
const b=await puppeteer.launch({executablePath:'C:\\Users\\USER\\.mercury\\browsers\\chrome\\win64-154.0.8037.92\\chrome-win64\\chrome.exe',headless:true});
const p=await b.newPage();await p.setViewport({width:1320,height:760});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///'+path.join(__dirname,'..','dist','AI_for_Learning.html').replace(/\\/g,'/')+'?s='+n+'#'+n,{waitUntil:'load'});
await new Promise(r=>setTimeout(r,1200));
for(let i=0;i<+c;i++){const els=await p.$$(sel);const vis=[];for(const e of els){if(await e.isVisible())vis.push(e)}await vis[0].click();await new Promise(r=>setTimeout(r,1400));}
await (await p.$('#deck')).screenshot({path:out});console.log('errors',JSON.stringify(errs));await b.close();})();
