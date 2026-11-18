const puppeteer=require('puppeteer-core'),path=require('path');
(async()=>{const b=await puppeteer.launch({executablePath:'C:\\Users\\USER\\.mercury\\browsers\\chrome\\win64-154.0.8037.92\\chrome-win64\\chrome.exe',headless:true});
const p=await b.newPage();await p.setViewport({width:1320,height:760});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
const f='file:///'+path.join(__dirname,'..','dist','AI_for_Learning.html').replace(/\\/g,'/');
const out=process.argv[2];
for(const n of [9,10,11,12]){await p.goto(f+'?a='+n+'#'+n,{waitUntil:'load'});await new Promise(r=>setTimeout(r,800));
 await p.evaluate(()=>{const t=document.querySelector('.slide.on .tabs button[data-p="adv"]');t&&t.click();});await new Promise(r=>setTimeout(r,1500));
 for(let k=0;k<3;k++){await p.evaluate(()=>{const s=document.querySelector('.slide.on .pane.on');const bs=[...s.querySelectorAll('button')].filter(x=>/next/i.test(x.textContent));bs[0]&&bs[0].click();});await new Promise(r=>setTimeout(r,2600));}
 await (await p.$('#deck')).screenshot({path:out+'/adv'+n+'.png'});
 // leave slide and back: nav still works
 await p.keyboard.press('ArrowRight');await new Promise(r=>setTimeout(r,300));}
console.log('hash',await p.evaluate(()=>location.hash),'errors',JSON.stringify(errs));await b.close();})();
