const puppeteer=require('puppeteer-core'),path=require('path');
(async()=>{const b=await puppeteer.launch({executablePath:'C:\\Users\\USER\\.mercury\\browsers\\chrome\\win64-154.0.8037.92\\chrome-win64\\chrome.exe',headless:true});
const p=await b.newPage();await p.setViewport({width:1320,height:760});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const f='file:///'+path.join(__dirname,'..','dist','AI_for_Learning.html').replace(/\\/g,'/');
await p.goto(f+'#3',{waitUntil:'load'});await new Promise(r=>setTimeout(r,800));
await p.keyboard.press('o');await new Promise(r=>setTimeout(r,400));
const btns=await p.$$('#gg .gi .gh');await btns[3].click();await new Promise(r=>setTimeout(r,300)); // hide slide 4
await p.screenshot({path:process.argv[2]});
await p.keyboard.press('Escape');
const r=[];r.push(await p.evaluate(()=>location.hash));
await p.keyboard.press('ArrowRight');await new Promise(r=>setTimeout(r,300));r.push(await p.evaluate(()=>location.hash+' '+document.getElementById('count').textContent));
await p.keyboard.press('ArrowLeft');await new Promise(r=>setTimeout(r,300));r.push(await p.evaluate(()=>location.hash));
await p.reload({waitUntil:'load'});await new Promise(r=>setTimeout(r,500));r.push('hidden after reload: '+await p.evaluate(()=>JSON.stringify(window.deckHidden())));
console.log(r.join(' | '),'errors',JSON.stringify(errs));await b.close();})();
