const puppeteer=require('puppeteer-core'),path=require('path');
(async()=>{const b=await puppeteer.launch({executablePath:'C:\\Users\\USER\\.mercury\\browsers\\chrome\\win64-154.0.8037.92\\chrome-win64\\chrome.exe',headless:true});
const p=await b.newPage();await p.setViewport({width:1320,height:760});
const f='file:///'+path.join(__dirname,'..','dist','AI_for_Learning.html').replace(/\\/g,'/');
for(const n of [1,16]){await p.goto(f+'?q='+n+'#'+n,{waitUntil:'load'});await new Promise(r=>setTimeout(r,900));
 await p.evaluate(()=>{window.__opened=[];window.open=function(u){window.__opened.push(u);};});
 const qs=await p.$$('.slide.on .qr-link');for(const q of qs){await q.click();}
 console.log('slide',n,'qr-links',qs.length,JSON.stringify(await p.evaluate(()=>window.__opened)));}
await b.close();})();
