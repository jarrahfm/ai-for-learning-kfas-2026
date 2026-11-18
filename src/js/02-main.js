/* ============================================================ deck navigation */
(function(){
  var deck=document.getElementById('deck');
  var slides=[].slice.call(deck.querySelectorAll('.slide'));
  var tpl=document.getElementById('bgtpl');
  slides.forEach(function(sl){ sl.insertBefore(tpl.content.cloneNode(true), sl.firstChild); });
  var i=0,N=slides.length;
  var ZOOM=(function(){try{if(!(window.CSS&&CSS.supports&&CSS.supports('zoom','2')))return false;var t=document.createElement('div');t.style.cssText='position:absolute;left:-9999px;top:0;width:100px;height:10px;zoom:2';document.documentElement.appendChild(t);var ok=Math.round(t.getBoundingClientRect().width)===200;t.parentNode.removeChild(t);return ok;}catch(e){return false;}})();
  function fit(){var vw=innerWidth,vh=innerHeight,g=vw<720?16:40,s=Math.min((vw-g)/1280,(vh-g)/720);if(!isFinite(s)||s<=0)s=1;s=Math.round(s*10000)/10000;if(ZOOM){deck.style.transform='none';deck.style.zoom=s;}else{deck.style.zoom='';deck.style.transform='scale('+s+')';}window.__deckScale=s;}
  addEventListener('resize',fit);fit();requestAnimationFrame(fit);
  slides.forEach(function(sl,n){var f=sl.querySelector('.foot');if(f&&f.lastElementChild)f.lastElementChild.textContent=String(n+1).padStart(2,'0')+' / '+N;});
  var notes=document.getElementById('notes');
  /* hidden slides: chosen in the overview (press O), remembered in this browser */
  function hkey(sl){var h=sl.querySelector('h1,h2');return sl.id||(h?h.textContent.replace(/\s+/g,' ').trim().slice(0,40):'');}
  var HID={};try{HID=JSON.parse(localStorage.getItem('kfasHiddenSlides')||'{}')||{};}catch(e){}
  function isHid(k){return !!HID[hkey(slides[k])];}
  window.deckHidden=function(){return slides.map(function(sl,k){return isHid(k)?k+1:0;}).filter(Boolean);};
  function show(n,force){
    var dir=n>=i?1:-1;n=Math.max(0,Math.min(N-1,n));
    if(!force){var t=n;while(t>=0&&t<N&&isHid(t))t+=dir;if(t<0||t>=N){t=n;while(t>=0&&t<N&&isHid(t))t-=dir;}if(t>=0&&t<N)n=t;}
    i=n;
    slides.forEach(function(sl,k){sl.classList.toggle('on',k===i);});
    var vis=0,pos=0;for(var q=0;q<N;q++){if(!isHid(q)||q===i){vis++;if(q<=i)pos=vis;}}
    document.getElementById('count').textContent=pos+' / '+vis;
    document.getElementById('bar').style.width=(pos/vis*100)+'%';
    notes.innerHTML='<b>Slide '+(i+1)+'</b> &nbsp; '+(slides[i].dataset.notes||'');
    try{location.hash=i+1;}catch(e){}
    document.dispatchEvent(new CustomEvent('slidechange',{detail:{index:i,slide:slides[i]}}));
  }
  window.deckShow=show;
  document.getElementById('next').onclick=function(e){e.stopPropagation();show(i+1)};
  document.getElementById('prev').onclick=function(e){e.stopPropagation();show(i-1)};
  var g=document.getElementById('grid'),gg=document.getElementById('gg');
  slides.forEach(function(sl,n){var h=sl.querySelector('h1,h2');var t=h?h.textContent.replace(/\s+/g,' ').trim().slice(0,60):'';var d=document.createElement('div');d.className='gi';d.innerHTML='<b>'+String(n+1).padStart(2,'0')+'</b><span></span>';d.querySelector('span').textContent=t;d.onclick=function(){g.classList.remove('on');show(n,true);};
    var hb=document.createElement('button');hb.className='gh';hb.type='button';
    function paint(){var h=isHid(n);d.classList.toggle('hid',h);hb.textContent=h?'Hidden: click to show':'Showing: click to hide';}
    hb.onclick=function(e){e.stopPropagation();var k=hkey(sl);if(HID[k])delete HID[k];else HID[k]=1;try{localStorage.setItem('kfasHiddenSlides',JSON.stringify(HID));}catch(x){}paint();show(i,true);};
    d.appendChild(hb);paint();gg.appendChild(d);});
  var gt=document.createElement('div');gt.className='ghead';gt.innerHTML='<b>Overview</b><span>Click a slide to jump to it. Use the button under a slide to hide it from the show (arrow keys skip hidden slides). Your choice is remembered in this browser. Press O or Esc to close.</span>';g.insertBefore(gt,gg);
  addEventListener('keydown',function(e){
    if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;
    var k=e.key;
    if(k==='ArrowRight'||k==='PageDown'||k==='Enter'){e.preventDefault();show(i+1);}
    else if(k==='ArrowLeft'||k==='PageUp'){e.preventDefault();show(i-1);}
    else if(k==='Home'){show(0);}else if(k==='End'){show(N-1);}
    else if(k==='o'||k==='O'){g.classList.toggle('on');}
    else if(k==='n'||k==='N'){notes.classList.toggle('on');}
    else if(k==='Escape'){g.classList.remove('on');notes.classList.remove('on');}
    else if(k==='f'||k==='F'){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();}
    else if(k==='p'||k==='P'){e.preventDefault();print();}
  });
  var uiT;function ui(){document.body.classList.add('ui');clearTimeout(uiT);uiT=setTimeout(function(){document.body.classList.remove('ui');},2200);}
  addEventListener('mousemove',ui);
  var s0=parseInt((location.hash||'').replace('#',''),10);
  show(isNaN(s0)?0:s0-1);
  // test/presenter hook: ?pane=3d&go=1 preselects a tab and presses the first Go button on the current slide
  setTimeout(function(){var q=new URLSearchParams(location.search);var sl=slides[i];if(q.get('pane')){var b=sl.querySelector('.tabs button[data-p="'+q.get('pane')+'"]');if(b)b.click();}
    if(q.get('go')){var gb=sl.querySelector('#avGo,#biGo,#hiPlay,#av3Go,#bi3Go');var pane=sl.querySelector('.pane.on');var g2=pane?pane.querySelector('button.btn.a,button.btn.t'):null;(g2||gb)&&(g2||gb).click();}
    if(q.get('reveal')){var rv=$('vdReveal');if(rv&&sl.contains(rv))rv.click();}
    if(q.get('step')){for(var k=0;k<+q.get('step');k++){var nb=$('lmNext');if(nb&&sl.contains(nb))nb.click();}}
  },600);
})();

/* ============================================================ small interactions */
(function(){
  document.querySelectorAll('.ptiles .fig[data-go]').forEach(function(f){f.addEventListener('click',function(){var g=f.dataset.go,t=g.charAt(0)==='#'?document.querySelector(g):null;window.deckShow(t?[].indexOf.call(document.querySelectorAll('#deck .slide'),t):+g-1);});});
  // flip tiles
  document.querySelectorAll('.flip').forEach(function(t){t.querySelector('.r').textContent=t.dataset.r;t.addEventListener('click',function(){t.classList.toggle('open');});});
  // rings
  var rings=document.querySelectorAll('.ring'),ds=document.querySelectorAll('.ringtext .d');
  rings.forEach(function(r){r.addEventListener('click',function(e){e.stopPropagation();var k=r.dataset.k;rings.forEach(function(x){x.classList.toggle('sel',x===r)});ds.forEach(function(d){d.classList.toggle('sel',d.dataset.k===k)});});});
  // flags
  var out=document.getElementById('flagOut');
  document.querySelectorAll('.flag').forEach(function(f){f.addEventListener('click',function(){f.classList.add('on');var n=document.querySelectorAll('.flag.on').length;out.textContent=f.dataset.f+(n===3?'  -  All three found. Every part of this sentence is invented.':'');});});
  // language model demo
  var chain=[
    {text:'The cat sat on the',opts:[['mat',71],['sofa',18],['roof',8],['Moon',3]]},
    {text:'mat',opts:[['and',55],['because',20],['.',15],['happily',10]]},
    {text:'and',opts:[['fell',44],['purred',35],['ate',15],['flew',6]]},
    {text:'fell',opts:[['asleep',82],['over',11],['down',5],['upwards',2]]},
    {text:'asleep.',opts:[]}];
  var step=0,sent=document.getElementById('lmSent'),bars=document.getElementById('lmBars');
  function render(){
    var words=chain.slice(0,step+1).map(function(c){return c.text});
    sent.innerHTML=words.map(function(w,k){return k===step&&step>0?'<span class="cur">'+w+'</span>':w}).join(' ');
    bars.innerHTML='';
    var opts=chain[step].opts;
    opts.forEach(function(o,k){var d=document.createElement('div');d.className='bar'+(k===0?' top':'');d.innerHTML='<div class="w">'+o[0]+'</div><div class="f"></div><div class="p">'+o[1]+'%</div>';bars.appendChild(d);requestAnimationFrame(function(){d.querySelector('.f').style.width=(o[1]*(+bars.dataset.k||3.4))+'px';});});
    document.getElementById('lmNext').disabled=opts.length===0;
    document.getElementById('lmNext').textContent=opts.length?'Predict next word →':'The sentence is finished';
  }
  document.getElementById('lmNext').addEventListener('click',function(){if(step<chain.length-1){step++;render();}});
  document.getElementById('lmReset').addEventListener('click',function(){step=0;render();});
  render();
  // prompt builder: moved to 40-prompt-verify.js
  if(0){var P={role:'Act as a friendly biology teacher.',task:'Explain how a vaccine teaches my body to fight a virus.',context:'I am a first-year student. I know what a virus is, but no biology beyond school.',constraints:'Keep it under 150 words and avoid jargon; if you must use a technical word, explain it in brackets.',format:'Three short paragraphs, then a one-line summary I can remember.',check:'Finally, list what you assumed and what I should double-check.'};
  var NOTE={role:'Without a role the AI picks a random voice: encyclopaedia, journalist, children\'s book.',task:'Without a task you get a generic page about vaccines in general.',context:'Without context the level is a coin toss: too easy, or full of immunology words.',constraints:'Without constraints: 900 words and jargon you have never seen.',format:'Without a format: a wall of text you cannot scan.',check:'Without the Check line the AI hides its assumptions, and you cannot check what you cannot see.'};
  var on={role:1,task:1,context:1,constraints:1,format:1,check:1};
  function ptxt(){var keys=['role','task','context','constraints','format','check'];var t=keys.filter(function(k){return on[k]}).map(function(k){return P[k]}).join(' ');document.getElementById('ptext').textContent=t||'(empty prompt)';var off=keys.filter(function(k){return !on[k]});document.getElementById('pnote').textContent=off.length?NOTE[off[off.length-1]]:'All six parts present. Swap the topic for your own and it works for any subject.';}
  document.querySelectorAll('.pp').forEach(function(p){p.addEventListener('click',function(){var k=p.dataset.k;on[k]=!on[k];p.classList.toggle('off',!on[k]);ptxt();});});
  ptxt();}
  // quizzes
  document.querySelectorAll('.quiz').forEach(function(q){var ans=parseInt(q.dataset.ans||'',10);var correct={pdQuiz:1,avQuiz:2,biQuiz:2,hiQuiz:1}[q.id];q.querySelectorAll('.opts button').forEach(function(b){b.addEventListener('click',function(){var a=parseInt(b.dataset.a,10);q.querySelectorAll('.opts button').forEach(function(x){x.classList.remove('ok','no')});b.classList.add(a===correct?'ok':'no');if(a!==correct)q.querySelectorAll('.opts button')[correct].classList.add('ok');q.querySelector('.qa').style.display='block';});});});
  // tabs
  document.querySelectorAll('.tabs').forEach(function(t){var sl=t.closest('.slide');t.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){t.querySelectorAll('button').forEach(function(x){x.classList.toggle('sel',x===b)});sl.querySelectorAll('.pane').forEach(function(p){p.classList.toggle('on',p.dataset.p===b.dataset.p)});document.dispatchEvent(new CustomEvent('pane',{detail:{dive:t.dataset.dive,pane:b.dataset.p}}));});});});
  // verdict
  var vd=document.getElementById('verdict');
  if(vd)vd.querySelectorAll('.cl').forEach(function(cl){cl.querySelectorAll('.ans button').forEach(function(b){b.addEventListener('click',function(){cl.querySelectorAll('.ans button').forEach(function(x){x.classList.remove('pick')});b.classList.add('pick');});});});
  if(vd)document.getElementById('vdReveal').addEventListener('click',function(){vd.classList.toggle('reveal');this.textContent=vd.classList.contains('reveal')?'Hide answers':'Reveal answers';});
})();


/* ============================================================ REV18NOV: worms, snow, roadmap, characters, check, traffic light, timer */
function wormSVG(label,color){
  var sw=Math.max(130,Math.round(label.length*(label.length>9?10.5:12)+34)),sx=113-sw/2,fs=label.length>9?15:20,ls=label.length>9?0.5:2;
  var segs='';for(var k=5;k>=1;k--){var x=40+k*26,r=15-k*0.9;segs+='<circle class="wseg" style="animation-delay:'+(k*0.12)+'s" cx="'+x+'" cy="150" r="'+r+'" fill="'+color+'" stroke="#1B1F3B" stroke-width="2"/>';}
  return '<svg viewBox="0 0 220 180"><g class="wbody">'+
    '<ellipse cx="110" cy="170" rx="80" ry="6" fill="rgba(20,26,51,.12)"/>'+segs+
    '<circle class="wseg" cx="40" cy="146" r="19" fill="'+color+'" stroke="#1B1F3B" stroke-width="2"/>'+
    '<circle cx="33" cy="141" r="4.5" fill="#fff"/><circle cx="46" cy="141" r="4.5" fill="#fff"/><circle cx="34" cy="142" r="2.2" fill="#1B1F3B"/><circle cx="47" cy="142" r="2.2" fill="#1B1F3B"/>'+
    '<path d="M31 153 Q40 161 49 153" stroke="#1B1F3B" stroke-width="2" fill="none" stroke-linecap="round"/>'+
    '<circle cx="26" cy="151" r="3" fill="rgba(255,120,150,.6)"/><circle cx="54" cy="151" r="3" fill="rgba(255,120,150,.6)"/>'+
    '<line x1="30" y1="130" x2="22" y2="116" stroke="#1B1F3B" stroke-width="2"/><line x1="50" y1="130" x2="58" y2="116" stroke="#1B1F3B" stroke-width="2"/><circle cx="21" cy="114" r="3" fill="#1B1F3B"/><circle cx="59" cy="114" r="3" fill="#1B1F3B"/>'+
    '<g class="wsign" style="transform-box:fill-box"><rect x="86" y="110" width="6" height="40" fill="#8a5a2b"/><rect x="'+sx+'" y="40" width="'+sw+'" height="62" rx="12" fill="#fff" stroke="#1B1F3B" stroke-width="3"/>'+
    '<text class="wtext" x="113" y="78" text-anchor="middle" font-family="IBM Plex Sans, Segoe UI, sans-serif" font-weight="700" font-size="'+fs+'" letter-spacing="'+ls+'" fill="#1B1F3B">'+label+'</text></g>'+
    '<path d="M60 146 Q75 128 86 118" stroke="#1B1F3B" stroke-width="2.5" fill="none"/></g></svg>';
}
function charaSVG(kind){
  var good=kind==='good',c=good?'#2BB3A3':'#D9372A',dark=good?'#177a6e':'#8f1f16';
  return '<svg viewBox="0 0 170 200"><g class="bob">'+
    '<ellipse cx="85" cy="192" rx="52" ry="6" fill="rgba(20,26,51,.12)"/>'+
    '<path d="M30 180 Q20 90 85 60 Q150 90 140 180 Z" fill="'+c+'" stroke="#1B1F3B" stroke-width="2.5"/>'+
    (good?'<path d="M60 60 Q70 30 85 50 Q100 30 110 60" fill="'+c+'" stroke="#1B1F3B" stroke-width="2.5"/>':'<path d="M48 70 L62 44 L76 66 L92 40 L108 66 L124 48 L130 74" fill="'+c+'" stroke="#1B1F3B" stroke-width="2.5" stroke-linejoin="round"/>')+
    '<g class="blink" style="transform-box:fill-box;transform-origin:center"><ellipse cx="66" cy="112" rx="11" ry="13" fill="#fff"/><ellipse cx="104" cy="112" rx="11" ry="13" fill="#fff"/><circle cx="68" cy="114" r="5" fill="#1B1F3B"/><circle cx="106" cy="114" r="5" fill="#1B1F3B"/></g>'+
    (good?'<path d="M62 140 Q85 162 108 140" stroke="#1B1F3B" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M52 96 Q66 86 78 96" stroke="#1B1F3B" stroke-width="2.5" fill="none"/><path d="M92 96 Q104 86 118 96" stroke="#1B1F3B" stroke-width="2.5" fill="none"/>'
         :'<path d="M64 148 L76 140 L88 150 L100 140 L112 148" stroke="#1B1F3B" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M52 92 L78 98" stroke="#1B1F3B" stroke-width="3"/><path d="M118 92 L92 98" stroke="#1B1F3B" stroke-width="3"/>')+
    (good?'<g><circle cx="146" cy="128" r="12" fill="'+c+'" stroke="#1B1F3B" stroke-width="2.5"/><rect x="141" y="100" width="10" height="26" rx="5" fill="'+c+'" stroke="#1B1F3B" stroke-width="2.5"/></g>'
         :'<g><path d="M28 140 Q10 150 26 170" stroke="#1B1F3B" stroke-width="2.5" fill="'+c+'"/><rect x="118" y="150" width="34" height="24" rx="4" fill="#fff" stroke="#1B1F3B" stroke-width="2"/><line x1="124" y1="158" x2="146" y2="158" stroke="'+dark+'" stroke-width="2"/><line x1="124" y1="165" x2="140" y2="165" stroke="'+dark+'" stroke-width="2"/></g>')+
    '<circle cx="54" cy="134" r="5" fill="rgba(255,255,255,.35)"/><circle cx="116" cy="134" r="5" fill="rgba(255,255,255,.35)"/></g></svg>';
}
(function(){
  document.querySelectorAll('.wormbox').forEach(function(w){w.innerHTML=wormSVG(w.dataset.worm,w.dataset.c);});
  document.querySelectorAll('.chara').forEach(function(c){c.innerHTML=charaSVG(c.dataset.chara);});
  // snow on .snow slides
  document.querySelectorAll('.slide.snow').forEach(function(sl){var f=document.createElement('div');f.className='flakes';for(var k=0;k<70;k++){var s=document.createElement('i');s.className='flake';var sz=3+Math.random()*7;s.style.cssText='left:'+(Math.random()*100)+'%;width:'+sz+'px;height:'+sz+'px;opacity:'+(0.35+Math.random()*0.6)+';animation-duration:'+(9+Math.random()*12)+'s;animation-delay:-'+(Math.random()*20)+'s';f.appendChild(s);}sl.insertBefore(f,sl.querySelector('.pad'));});
  // roadmap (slide 02): moved to src/js/20-roadmap.js
  // 5-step check walkthrough
  var cks=document.querySelectorAll('#cksteps .cks'),ck=0,ckL=$('ckLine'),ckQ=$('ckQuote');
  var CKT=['<b>Spot.</b> That sentence has a number in it, and numbers are claims. Underline it.','<b>Source.</b> Open a real one. Here: OpenStax Microbiology, chapter 9, "How Microbes Grow": E. coli can double about every 20 minutes.','<b>Check.</b> Do the small sum yourself. Two hours is six doublings: 2, 4, 8, 16, 32, 64. Sixty-four cells, not a million.','<b>Assume.</b> The AI mixed up two hours with six hours. Six hours is eighteen doublings, about 262,000, which is close to the number it remembered.','<b>Label.</b> Your own arithmetic says it is wrong: <span class="lab x">UNSUPPORTED</span>. Write "checked by hand, 2^6 = 64" next to it. Done in under a minute.'];
  function ckShow(){cks.forEach(function(c,i){c.classList.toggle('lit',i<ck)});if(ckQ)ckQ.classList.toggle('spot',ck>=1);if(ckL)ckL.innerHTML=ck?CKT[ck-1]:'Press <b>Next step</b> to walk one sentence through the check.';var b=$('ckNext');if(b){b.disabled=ck>=5;b.textContent=ck>=5?'All five done':'Next step →';}}
  if($('ckNext')){$('ckNext').addEventListener('click',function(){if(ck<5){ck++;ckShow();}});$('ckReset').addEventListener('click',function(){ck=0;ckShow();});ckShow();}
  // traffic light
  var lamps=document.querySelectorAll('#tlight .lamp'),tlc=document.querySelectorAll('#tlcards .tlc'),tk=0,hold=false;
  function tlShow(k){tk=k;lamps.forEach(function(l,i){l.classList.toggle('on',i===k)});tlc.forEach(function(c,i){c.classList.toggle('on',i===k)});}
  if(lamps.length){lamps.forEach(function(l){l.addEventListener('click',function(){hold=true;tlShow(+l.dataset.k);});});tlc.forEach(function(c){c.addEventListener('click',function(){hold=true;tlShow(+c.dataset.k);});});tlShow(0);
    setInterval(function(){var sl=lamps[0].closest('.slide');if(!hold&&sl.classList.contains('on'))tlShow((tk+1)%3);},2600);}
  // QR codes (offline library inlined at build time). Slides + survey QRs: see 90-finale.js (SLIDES_URL, SURVEY_URL)
  function qr(el,text,size){if(!el||!window.QRCode)return;el.innerHTML='';try{new QRCode(el,{text:text,width:size,height:size,correctLevel:QRCode.CorrectLevel.M,colorDark:'#141A33',colorLight:'#ffffff'});}catch(e){}}
  var kl=$('kLink'),kp=$('kPin');
  function kahoot(){var v=(kl.value||'').trim(),url='https://kahoot.it',pin='';var m=v.match(/(\d{6,8})/);if(m)pin=m[1];if(/^https?:\/\//i.test(v))url=v;else if(pin)url=(pin.length>=8?'https://kahoot.it/challenge/':'https://kahoot.it/?pin=')+pin;kp.textContent=pin||(v?'see link':'—');qr($('qrKahoot'),url,250);}
  if(kl){kl.addEventListener('input',function(){kahoot();try{localStorage.setItem('kfasKahootPin',kl.value);}catch(e){}});kl.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Enter')kl.blur();});kahoot();}
  // copy the all-in-one prompt
  var mc=$('mpCopy');if(mc){mc.addEventListener('click',function(){var t=$('masterPrompt2').textContent;function ok(){mc.textContent='Copied! Paste it into your AI';setTimeout(function(){mc.textContent='Copy the prompt'},2500);}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(ok,function(){fallback()});}else fallback();
    function fallback(){var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ok();}catch(e){mc.textContent='Select the text and press Ctrl+C';}document.body.removeChild(ta);}});}
  // challenge timer
  var tm=$('chTimer'),tb=$('chStart'),left=30*60,tick=null;
  function tmShow(){tm.textContent=String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0');tm.classList.toggle('end',left===0);}
  if(tb){tb.addEventListener('click',function(){if(tick){clearInterval(tick);tick=null;tb.textContent='Resume';tm.classList.remove('run');return;}if(left===0)left=30*60;tb.textContent='Pause';tm.classList.add('run');tick=setInterval(function(){if(left>0){left--;tmShow();}if(left===0){clearInterval(tick);tick=null;tb.textContent='Again';tm.classList.remove('run');}},1000);});tmShow();}
})();

/* ============================================================ helpers */
function $(id){return document.getElementById(id)}
function fmt(x,d){return Number.isFinite(x)?x.toFixed(d):'-'}
var HAS3D=function(){return !!window.THREE};
function make3d(wrap){
  var w=wrap.clientWidth||764,h=wrap.clientHeight||420;
  var r=new THREE.WebGLRenderer({antialias:true,alpha:true});r.setPixelRatio(Math.min(devicePixelRatio,2));r.setSize(w,h);r.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%';wrap.appendChild(r.domElement);
  var sc=new THREE.Scene();var cam=new THREE.PerspectiveCamera(42,w/h,0.1,2000);
  sc.add(new THREE.HemisphereLight(0xffffff,0x8899bb,0.95));var dl=new THREE.DirectionalLight(0xffffff,0.8);dl.position.set(5,10,6);sc.add(dl);
  // simple orbit by drag
  var orb={th:0.6,ph:1.15,r:8,tx:0,ty:0,tz:0,drag:false,lx:0,ly:0};
  wrap.addEventListener('mousedown',function(e){orb.drag=true;orb.lx=e.clientX;orb.ly=e.clientY;});
  addEventListener('mouseup',function(){orb.drag=false});
  addEventListener('mousemove',function(e){if(!orb.drag)return;var s=window.__deckScale||1;orb.th-=(e.clientX-orb.lx)/s*0.006;orb.ph=Math.max(0.2,Math.min(1.5,orb.ph-(e.clientY-orb.ly)/s*0.006));orb.lx=e.clientX;orb.ly=e.clientY;});
  wrap.addEventListener('wheel',function(e){e.preventDefault();orb.r=Math.max(2,Math.min(60,orb.r*(e.deltaY>0?1.08:0.92)));},{passive:false});
  function place(){cam.position.set(orb.tx+orb.r*Math.sin(orb.ph)*Math.sin(orb.th),orb.ty+orb.r*Math.cos(orb.ph),orb.tz+orb.r*Math.sin(orb.ph)*Math.cos(orb.th));cam.lookAt(orb.tx,orb.ty,orb.tz);}
  return {r:r,sc:sc,cam:cam,orb:orb,place:place,wrap:wrap};
}
function no3dMsg(wrap){if(wrap.querySelector('.no3d'))return;var d=document.createElement('div');d.className='no3d';d.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px;font-size:15px;color:#5B6080';d.innerHTML='3D needs the internet to load the Three.js library.<br>The 2D tab works offline, and it carries all the physics.';wrap.appendChild(d);}

/* ============================================================ DIVE 1: pendulum */
(function(){
  var L=1,g=9.81,m=1,amp=10,t0=performance.now()/1000;
  var cv=$('pdC'),cx=cv.getContext('2d');
  function T(){return 2*Math.PI*Math.sqrt(L/g)}
  function theta(){return amp*Math.PI/180*Math.cos(2*Math.PI/T()*(performance.now()/1000-t0))}
  function upd(){$('pdLv').textContent=L.toFixed(2)+' m';$('pdGv').textContent=g.toFixed(2)+' m/s²';$('pdMv').textContent=m.toFixed(1)+' kg';$('pdAv').textContent=amp+'°';}
  $('pdL').oninput=function(){L=+this.value;upd()};$('pdG').oninput=function(){g=+this.value;upd()};$('pdM').oninput=function(){m=+this.value;upd()};$('pdA').oninput=function(){amp=+this.value;upd()};
  document.querySelectorAll('#pdQuiz ~ * [data-g], .slide [data-g]').forEach(function(b){b.addEventListener('click',function(){g=+b.dataset.g;$('pdG').value=g;upd();});});
  upd();
  function draw2d(){
    var W=cv.width,H=cv.height,px=W/2,py=56,sc=118,th=theta(),len=L*sc,bx=px+len*Math.sin(th),by=py+len*Math.cos(th);
    cx.clearRect(0,0,W,H);
    cx.strokeStyle='rgba(27,31,59,.15)';cx.setLineDash([5,7]);cx.beginPath();cx.moveTo(px,py);cx.lineTo(px,py+len+30);cx.stroke();cx.setLineDash([]);
    // arc of amplitude
    cx.strokeStyle='rgba(242,169,59,.5)';cx.beginPath();cx.arc(px,py,len,Math.PI/2-amp*Math.PI/180,Math.PI/2+amp*Math.PI/180);cx.stroke();
    cx.fillStyle='#1B1F3B';cx.fillRect(px-70,py-10,140,10);
    cx.strokeStyle='#1B1F3B';cx.lineWidth=2.2;cx.beginPath();cx.moveTo(px,py);cx.lineTo(bx,by);cx.stroke();
    var r=10+7*Math.cbrt(m);
    var grd=cx.createRadialGradient(bx-r/3,by-r/3,2,bx,by,r);grd.addColorStop(0,'#FFD27F');grd.addColorStop(1,'#E0901C');
    cx.fillStyle=grd;cx.beginPath();cx.arc(bx,by,r,0,Math.PI*2);cx.fill();cx.strokeStyle='#1B1F3B';cx.lineWidth=1.5;cx.stroke();
    cx.fillStyle='#5B6080';cx.font='500 13px IBM Plex Sans, Segoe UI, sans-serif';
    cx.fillText('L = '+L.toFixed(2)+' m',px+len*0.5*Math.sin(th)+16,py+len*0.5*Math.cos(th));
    cx.fillText('θ = '+(th*180/Math.PI).toFixed(1)+'°',px+14,py+30);
    $('pdRead').innerHTML='T = 2π√(L/g) = <b>'+fmt(T(),2)+' s</b><br>f = '+fmt(1/T(),2)+' Hz &nbsp; g = '+g.toFixed(2)+' m/s²<br>mass = '+m.toFixed(1)+' kg (no effect on T)';
  }
  // 3D
  var S=null,rod,bob,ready=false;
  function init3d(){var wrap=$('pd3Wrap');if(!HAS3D()){no3dMsg(wrap);return;}if(S)return;S=make3d(wrap);S.orb.r=7;S.orb.ty=-1.2;
    var floor=new THREE.Mesh(new THREE.CircleGeometry(4,48),new THREE.MeshStandardMaterial({color:0xE6ECFA}));floor.rotation.x=-Math.PI/2;floor.position.y=-3.6;S.sc.add(floor);
    var grid=new THREE.GridHelper(8,16,0xb8c0e0,0xd5dbf0);grid.position.y=-3.59;S.sc.add(grid);
    var beam=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.12,0.6),new THREE.MeshStandardMaterial({color:0x1B1F3B}));S.sc.add(beam);
    rod=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,1,12),new THREE.MeshStandardMaterial({color:0x2A3152}));S.sc.add(rod);
    bob=new THREE.Mesh(new THREE.SphereGeometry(0.28,32,24),new THREE.MeshStandardMaterial({color:0xF2A93B,metalness:0.2,roughness:0.35}));S.sc.add(bob);ready=true;}
  function draw3d(){if(!ready)return;var th=theta(),len=L*1.0+0.4;rod.scale.y=len;rod.position.set(len/2*Math.sin(th),-len/2*Math.cos(th),0);rod.rotation.z=th;bob.position.set(len*Math.sin(th),-len*Math.cos(th),0);var s=0.22+0.09*Math.cbrt(m);bob.scale.set(s/0.28,s/0.28,s/0.28);S.place();S.r.render(S.sc,S.cam);$('pd3Read').innerHTML='T = <b>'+fmt(T(),2)+' s</b> &nbsp; L = '+L.toFixed(2)+' m &nbsp; g = '+g.toFixed(2)+'<br>drag to orbit, wheel to zoom';}
  document.addEventListener('pane',function(e){if(e.detail.dive==='pd'&&e.detail.pane==='3d')init3d();});
  (function loop(){var sl=cv.closest('.slide');if(sl.classList.contains('on')){if(sl.querySelector('.pane[data-p="2d"]').classList.contains('on'))draw2d();else if(sl.querySelector('.pane[data-p="3d"]').classList.contains('on'))draw3d();}requestAnimationFrame(loop);})();
})();

/* ============================================================ DIVE 2: take-off */
(function(){
  var cv=$('avC'),cx=cv.getContext('2d');
  var P={T:15,m:70,CL:1.8,th:100},S=null,run=null;
  var SREF=122.6,RUNWAY=3000,CD=0.085,MU=0.02,TMAX=240000;
  function rho(){return 101325/(287.05*(P.T+273.15))}
  function upd(){$('avTv').textContent=P.T+' °C';$('avMv').textContent=P.m+' t';$('avCv').textContent=P.CL.toFixed(1);$('avThv').textContent=P.th+' %';}
  $('avT').oninput=function(){P.T=+this.value;upd()};$('avM').oninput=function(){P.m=+this.value;upd()};$('avCL').oninput=function(){P.CL=+this.value;upd()};$('avTh').oninput=function(){P.th=+this.value;upd()};upd();
  function start(){run={x:0,v:0,h:0,t:0,lifted:false,done:false,liftX:null,last:performance.now()/1000,rho:rho(),W:P.m*1000*9.81,T:TMAX*P.th/100,m:P.m*1000,CL:P.CL,temp:P.T};}
  function stepRun(){
    if(!run||run.done)return;var now=performance.now()/1000,dt=Math.min(0.05,now-run.last)*2;run.last=now;
    var q=0.5*run.rho*run.v*run.v,Lf=q*SREF*run.CL,D=q*SREF*CD;
    if(!run.lifted){var N=Math.max(0,run.W-Lf),a=(run.T-D-MU*N)/run.m;run.v+=a*dt;run.x+=run.v*dt;if(Lf>=run.W&&run.v>20){run.lifted=true;run.liftX=run.x;}
      if(run.x>RUNWAY){run.done=true;run.over=true;}}
    else{var a2=(run.T-D)/run.m*0.55;run.v+=a2*dt;run.x+=run.v*dt;run.h+=Math.min(12,run.v*0.12)*dt;if(run.h>140)run.done=true;}
    run.t+=dt;run.L=Lf;
  }
  function draw(){
    stepRun();var W=cv.width,H=cv.height;cx.clearRect(0,0,W,H);
    // sky gradient by temperature
    var hot=(P.T+10)/60;var sky=cx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'rgb('+Math.round(200+40*hot)+','+Math.round(225-40*hot)+','+Math.round(250-80*hot)+')');sky.addColorStop(1,'#F3F5FB');cx.fillStyle=sky;cx.fillRect(0,0,W,H);
    var gy=H-70;var x=run?run.x:0,h=run?run.h:0;
    var scale=W/(RUNWAY+600);var camx=Math.max(0,x-W*0.35/scale);
    cx.fillStyle='#CED5E8';cx.fillRect(0,gy,W,70);
    cx.fillStyle='#4A5170';cx.fillRect((0-camx)*scale,gy-6,RUNWAY*scale,10);
    cx.strokeStyle='#fff';cx.setLineDash([14,14]);cx.beginPath();cx.moveTo((0-camx)*scale,gy-1);cx.lineTo((RUNWAY-camx)*scale,gy-1);cx.stroke();cx.setLineDash([]);
    cx.fillStyle='#5B6080';cx.font='12px IBM Plex Sans, sans-serif';for(var k=0;k<=RUNWAY;k+=500){var sx=(k-camx)*scale;cx.fillRect(sx,gy+6,2,8);cx.fillText(k+' m',sx-12,gy+28);}
    cx.fillStyle='#C0392B';cx.fillRect((RUNWAY-camx)*scale,gy-30,4,30);cx.fillText('end of runway',(RUNWAY-camx)*scale+8,gy-18);
    if(run&&run.liftX!=null){cx.fillStyle='#2BB3A3';cx.fillRect((run.liftX-camx)*scale,gy-26,3,26);cx.fillText('lift-off '+Math.round(run.liftX)+' m',(run.liftX-camx)*scale+6,gy-32);}
    // plane
    var px=(x-camx)*scale+56,py=gy-14-h*1.6,pitch=run&&run.lifted?-0.22:0;
    cx.save();cx.translate(px,py);cx.rotate(pitch);
    cx.fillStyle='#1B1F3B';cx.beginPath();cx.moveTo(-40,0);cx.lineTo(28,0);cx.lineTo(44,-6);cx.lineTo(28,-12);cx.lineTo(-30,-12);cx.lineTo(-44,-22);cx.lineTo(-48,-20);cx.lineTo(-44,0);cx.closePath();cx.fill();
    cx.fillStyle='#2BB3A3';cx.fillRect(-12,-8,30,4);cx.fillStyle='#F2A93B';cx.fillRect(-6,2,10,5);
    cx.restore();
    // bars lift vs weight
    var Wt=P.m*1000*9.81,Lf=run?run.L:0,bx=W-250,by=66;
    cx.fillStyle='rgba(255,255,255,.85)';cx.fillRect(bx-12,by-12,246,86);
    cx.fillStyle='#5B6080';cx.font='600 11px IBM Plex Sans, sans-serif';cx.fillText('LIFT',bx,by+4);cx.fillText('WEIGHT',bx,by+40);
    cx.fillStyle='#E3E7F5';cx.fillRect(bx+60,by-6,170,14);cx.fillRect(bx+60,by+30,170,14);
    cx.fillStyle=Lf>=Wt?'#2BB3A3':'#F2A93B';cx.fillRect(bx+60,by-6,Math.min(170,170*Lf/(Wt*1.3)),14);
    cx.fillStyle='#1B1F3B';cx.fillRect(bx+60,by+30,170/1.3,14);
    cx.fillStyle='#5B6080';cx.font='11px IBM Plex Mono, monospace';cx.fillText(Math.round(Lf/1000)+' kN',bx+60,by+62);cx.fillText(Math.round(Wt/1000)+' kN',bx+150,by+62);
    var v=run?run.v:0;
    $('avRead').innerHTML='speed <b>'+Math.round(v*3.6)+' km/h</b> ('+Math.round(v*1.944)+' kt)<br>air density '+rho().toFixed(3)+' kg/m³ at '+P.T+' °C<br>runway used '+(run?Math.round(Math.min(run.x,RUNWAY)):0)+' m / '+RUNWAY+' m  (time ×2)'+(run&&run.over?'<br><span style="color:#F2A93B">RAN OUT OF RUNWAY: reduce mass, add flaps or more thrust</span>':'')+(run&&run.lifted?'<br>airborne, altitude '+Math.round(h)+' m':'');
  }
  $('avGo').addEventListener('click',start);$('avReset').addEventListener('click',function(){run=null});
  // 3D
  var plane,rw,ready=false;
  function init3d(){var wrap=$('av3Wrap');if(!HAS3D()){no3dMsg(wrap);return;}if(S)return;S=make3d(wrap);S.orb.r=95;S.orb.ph=1.25;S.orb.th=3.35;
    var ground=new THREE.Mesh(new THREE.PlaneGeometry(4000,800),new THREE.MeshStandardMaterial({color:0xD8DEC8}));ground.rotation.x=-Math.PI/2;ground.position.set(1500,-0.05,0);S.sc.add(ground);
    rw=new THREE.Mesh(new THREE.PlaneGeometry(RUNWAY,45),new THREE.MeshStandardMaterial({color:0x4A5170}));rw.rotation.x=-Math.PI/2;rw.position.set(RUNWAY/2,0,0);S.sc.add(rw);
    for(var k=0;k<RUNWAY;k+=60){var st=new THREE.Mesh(new THREE.PlaneGeometry(30,1.2),new THREE.MeshStandardMaterial({color:0xffffff}));st.rotation.x=-Math.PI/2;st.position.set(k+15,0.02,0);S.sc.add(st);}
    plane=new THREE.Group();var mat=new THREE.MeshStandardMaterial({color:0xF4F6FB,metalness:0.3,roughness:0.4});
    var fus=new THREE.Mesh(new THREE.CylinderGeometry(2,2,36,20),mat);fus.rotation.z=Math.PI/2;plane.add(fus);
    var nose=new THREE.Mesh(new THREE.ConeGeometry(2,6,20),mat);nose.rotation.z=-Math.PI/2;nose.position.x=21;plane.add(nose);
    var wing=new THREE.Mesh(new THREE.BoxGeometry(6,0.4,34),new THREE.MeshStandardMaterial({color:0x2BB3A3}));wing.position.set(2,-0.5,0);plane.add(wing);
    var tail=new THREE.Mesh(new THREE.BoxGeometry(4,8,0.4),new THREE.MeshStandardMaterial({color:0xF2A93B}));tail.position.set(-16,4,0);plane.add(tail);
    var htail=new THREE.Mesh(new THREE.BoxGeometry(3.5,0.3,12),new THREE.MeshStandardMaterial({color:0xF2A93B}));htail.position.set(-16,0.5,0);plane.add(htail);
    [-5,5].forEach(function(z){var eng=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,5,16),new THREE.MeshStandardMaterial({color:0x1B1F3B}));eng.rotation.z=Math.PI/2;eng.position.set(3,-2,z*1.6);plane.add(eng);});
    plane.position.y=3;S.sc.add(plane);ready=true;}
  function draw3d(){if(!ready)return;stepRun();var x=run?run.x:0,h=run?run.h:0;plane.position.set(x,3+h,0);plane.rotation.z=run&&run.lifted?0.18:0;S.orb.tx=x+20;S.orb.ty=6+h;S.place();S.r.render(S.sc,S.cam);var v=run?run.v:0;$('av3Read').innerHTML='speed <b>'+Math.round(v*3.6)+' km/h</b> &nbsp; altitude '+Math.round(h)+' m<br>'+(run&&run.lifted?'airborne at '+Math.round(run.liftX)+' m':'rolling: '+(run?Math.round(run.x):0)+' m used');}
  $('av3Go').addEventListener('click',start);
  document.addEventListener('pane',function(e){if(e.detail.dive==='av'&&e.detail.pane==='3d')init3d();});
  (function loop(){var sl=cv.closest('.slide');if(sl.classList.contains('on')){if(sl.querySelector('.pane[data-p="2d"]').classList.contains('on'))draw();else if(sl.querySelector('.pane[data-p="3d"]').classList.contains('on'))draw3d();}requestAnimationFrame(loop);})();
})();

/* ============================================================ DIVE 3: bacteria */
(function(){
  var cv=$('biC'),cx=cv.getContext('2d');
  var P={D:20,K:1000,A:0,S:1},t=0,running=false,last=0,hist=[],dots=[],S3=null;
  function upd(){$('biDv').textContent=P.D+' min';$('biKv').textContent=P.K.toLocaleString();$('biAv').textContent=P.A?('hour '+P.A):'off';$('biSv').textContent=P.S+' h / s';}
  $('biD').oninput=function(){P.D=+this.value;upd()};$('biK').oninput=function(){P.K=+this.value;upd()};$('biA').oninput=function(){P.A=+this.value;upd()};$('biS').oninput=function(){P.S=+this.value;upd()};upd();
  function r(){return Math.LN2/(P.D/60)}
  function N(tt){var N0=1,K=P.K,rr=r();var n=K/(1+((K-N0)/N0)*Math.exp(-rr*tt));if(P.A&&tt>P.A){var nA=K/(1+((K-N0)/N0)*Math.exp(-rr*P.A));var surv=nA*0.1;n=Math.min(K,K/(1+((K-surv)/surv)*Math.exp(-rr*(tt-P.A))));}return n;}
  function Nexp(tt){return Math.min(1e9,Math.exp(r()*tt))}
  // pre-generate dot positions in dish
  // dots grow outward from 7 colony centres, so the dish reads as colonies rather than a single speck
  var CC=[[0,0],[-70,-55],[75,-40],[-60,70],[70,75],[5,-105],[-10,110]];
  for(var k=0;k<3000;k++){var c=CC[k%CC.length],a=Math.random()*Math.PI*2,rad=Math.sqrt(k/3000)*62+Math.random()*6;dots.push([c[0]+Math.cos(a)*rad,c[1]+Math.sin(a)*rad,Math.random()]);}
  function start(){t=0;running=true;last=performance.now()/1000;hist=[];}
  function draw(){
    var now=performance.now()/1000;if(running){t+=(now-last)*P.S;last=now;if(t>12)running=false;}
    var W=cv.width,H=cv.height;cx.clearRect(0,0,W,H);
    // dish: top view, with a lid rim, colonies of rod-shaped cells, a zoom inset and a plain caption
    var dx=215,dy=H/2-6,R=165;cx.fillStyle='#F7F3E6';cx.beginPath();cx.arc(dx,dy,R,0,Math.PI*2);cx.fill();cx.strokeStyle='#CFC7A8';cx.lineWidth=7;cx.stroke();cx.strokeStyle='rgba(255,255,255,.9)';cx.lineWidth=2;cx.beginPath();cx.arc(dx,dy,R-7,0,Math.PI*2);cx.stroke();cx.lineWidth=1;
    var n=N(t),frac=Math.min(1,n/P.K),count=Math.max(1,Math.round(frac*3000*Math.min(1,P.K/3000)));
    var dead=P.A&&t>P.A;cx.fillStyle=dead?'#8fb8b2':'#1f9c8c';
    for(var i=0;i<count;i++){var d=dots[i];cx.save();cx.translate(dx+d[0],dy+d[1]);cx.rotate(d[2]*Math.PI);cx.beginPath();cx.roundRect?cx.roundRect(-4,-1.6,8,3.2,1.6):cx.rect(-4,-1.6,8,3.2);cx.fill();cx.restore();}
    if(count<=1){cx.strokeStyle='#C0392B';cx.lineWidth=1.5;cx.beginPath();cx.arc(dx,dy,12,0,Math.PI*2);cx.stroke();cx.lineWidth=1;cx.fillStyle='#C0392B';cx.font='600 12px IBM Plex Sans, sans-serif';cx.fillText('one cell: start',dx+18,dy+4);}
    cx.fillStyle='#5B6080';cx.font='600 11px IBM Plex Sans, sans-serif';cx.fillText('PETRI DISH, SEEN FROM ABOVE',dx-92,dy+R+22);
    cx.fillStyle='#1B1F3B';cx.font='700 14px IBM Plex Sans, sans-serif';cx.fillText(Math.round(n).toLocaleString()+' cells',dx-30,dy+R+40);
    if(dead){cx.fillStyle='rgba(192,57,43,.10)';cx.beginPath();cx.arc(dx,dy,R,0,Math.PI*2);cx.fill();cx.fillStyle='#C0392B';cx.font='600 12px IBM Plex Sans, sans-serif';cx.fillText('antibiotic added at hour '+P.A,dx-80,dy-R-10);}
    // zoom inset: what one dot is
    var ix=386,iy=74,ir=40;cx.fillStyle='#fff';cx.beginPath();cx.arc(ix,iy,ir,0,Math.PI*2);cx.fill();cx.strokeStyle='#1B1F3B';cx.lineWidth=2;cx.stroke();cx.lineWidth=1;
    cx.fillStyle='#1f9c8c';[[-14,-8,0.3],[10,-4,-0.2],[-2,14,0.9]].forEach(function(r){cx.save();cx.translate(ix+r[0],iy+r[1]);cx.rotate(r[2]);cx.beginPath();cx.roundRect?cx.roundRect(-13,-5,26,10,5):cx.rect(-13,-5,26,10);cx.fill();cx.strokeStyle='#0f6b5f';cx.beginPath();cx.moveTo(0,-5);cx.lineTo(0,5);cx.stroke();cx.restore();});
    cx.strokeStyle='#1B1F3B';cx.beginPath();cx.moveTo(ix-ir*0.7,iy+ir*0.7);cx.lineTo(dx+R*0.62,dy-R*0.62);cx.stroke();
    cx.fillStyle='#5B6080';cx.font='500 10.5px IBM Plex Sans, sans-serif';cx.fillText('each dot: a rod-shaped',ix-58,iy+ir+16);cx.fillText('bacterium, splitting in two',ix-58,iy+ir+29);
    // graph
    var gx=440,gy=60,gw=390,gh=320;cx.fillStyle='rgba(255,255,255,.75)';cx.fillRect(gx-10,gy-10,gw+20,gh+40);
    cx.strokeStyle='#B8C0E0';cx.lineWidth=1;cx.beginPath();cx.moveTo(gx,gy);cx.lineTo(gx,gy+gh);cx.lineTo(gx+gw,gy+gh);cx.stroke();
    cx.fillStyle='#5B6080';cx.font='11px IBM Plex Sans, sans-serif';cx.fillText('cells',gx+4,gy+10);cx.fillText('hours',gx+gw-34,gy+gh+26);for(var hh=0;hh<=12;hh+=2){cx.fillText(hh,gx+gw*hh/12-3,gy+gh+14);}
    cx.fillText('K = '+P.K.toLocaleString(),gx+gw-80,gy+8);cx.strokeStyle='rgba(242,169,59,.6)';cx.setLineDash([4,4]);cx.beginPath();cx.moveTo(gx,gy+gh*(1-1));cx.lineTo(gx+gw,gy+gh*(1-1));cx.stroke();
    // exponential (dashed) and logistic
    cx.strokeStyle='#C0392B';cx.setLineDash([5,5]);cx.beginPath();for(var tt=0;tt<=t;tt+=0.05){var y=gy+gh*(1-Math.min(1.2,Nexp(tt)/P.K)/1.2);if(tt===0)cx.moveTo(gx,y);else cx.lineTo(gx+gw*tt/12,y);}cx.stroke();cx.setLineDash([]);
    cx.strokeStyle='#2BB3A3';cx.lineWidth=2.5;cx.beginPath();for(var t2=0;t2<=t;t2+=0.05){var y2=gy+gh*(1-N(t2)/P.K/1.2);if(t2===0)cx.moveTo(gx,y2);else cx.lineTo(gx+gw*t2/12,y2);}cx.stroke();cx.lineWidth=1;
    cx.fillStyle='#C0392B';cx.fillText('- - exponential (unlimited food)',gx+12,gy+gh-10);cx.fillStyle='#2BB3A3';cx.fillText('— logistic (nutrients limited)',gx+12,gy+gh-26);
    $('biRead').innerHTML='t = <b>'+t.toFixed(1)+' h</b> &nbsp; N = <b>'+Math.round(n).toLocaleString()+'</b> cells<br>doubling '+P.D+' min → r = '+r().toFixed(2)+' /h<br>exponential alone would give '+Math.round(Nexp(t)).toLocaleString();
  }
  $('biGo').addEventListener('click',start);$('biReset').addEventListener('click',function(){t=0;running=false;});
  // 3D
  var inst,ready=false;
  function init3d(){var wrap=$('bi3Wrap');if(!HAS3D()){no3dMsg(wrap);return;}if(S3)return;S3=make3d(wrap);S3.orb.r=9;S3.orb.ph=0.9;
    var dish=new THREE.Mesh(new THREE.CylinderGeometry(3,3,0.3,64),new THREE.MeshStandardMaterial({color:0xF2E9C9,transparent:true,opacity:0.95}));S3.sc.add(dish);
    var rim=new THREE.Mesh(new THREE.TorusGeometry(3,0.08,12,80),new THREE.MeshStandardMaterial({color:0xCFC7A8}));rim.rotation.x=Math.PI/2;rim.position.y=0.15;S3.sc.add(rim);
    var pos=new Float32Array(3000*3);for(var i=0;i<3000;i++){var d=dots[i];pos[i*3]=d[0]/55;pos[i*3+1]=0.24+d[2]*0.08;pos[i*3+2]=d[1]/55;}
    var geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setDrawRange(0,0);
    inst=new THREE.Points(geo,new THREE.PointsMaterial({color:0x2BB3A3,size:0.13}));S3.sc.add(inst);ready=true;}
  function draw3d(){if(!ready)return;var now=performance.now()/1000;if(running){t+=(now-last)*P.S;last=now;if(t>12)running=false;}var n=N(t),count=Math.round(Math.min(1,n/P.K)*3000*Math.min(1,P.K/3000));inst.geometry.setDrawRange(0,count);inst.material.color.set(P.A&&t>P.A?0x8fb8b2:0x2BB3A3);S3.place();S3.r.render(S3.sc,S3.cam);$('bi3Read').innerHTML='t = <b>'+t.toFixed(1)+' h</b> &nbsp; N = <b>'+Math.round(n).toLocaleString()+'</b><br>drag to orbit';}
  $('bi3Go').addEventListener('click',start);
  document.addEventListener('pane',function(e){if(e.detail.dive==='bi'&&e.detail.pane==='3d')init3d();});
  (function loop(){var sl=cv.closest('.slide');if(sl.classList.contains('on')){if(sl.querySelector('.pane[data-p="2d"]').classList.contains('on'))draw();else if(sl.querySelector('.pane[data-p="3d"]').classList.contains('on'))draw3d();}requestAnimationFrame(loop);})();
})();

/* ============================================================ DIVE 4: planets in orbit (REV3SPACE) */
(function(){
  var cv=$('spC'),cx=cv.getContext('2d');
  var PL=[['Mercury',0.39,'#b8b0a8',3],['Venus',0.72,'#e8c38a',4.5],['Earth',1,'#4f8ef7',5],['Mars',1.52,'#d1603d',4],['Jupiter',5.2,'#d9a066',11],['Saturn',9.54,'#e6d3a3',9]];
  var P={a:1,M:1,S:1},t=0,running=false,last=0,S3=null;
  function T(a){return Math.sqrt(a*a*a/P.M)}
  function rpx(a){return 34+118*Math.log10(1+2*a)}
  function upd(){$('spAv').textContent=P.a.toFixed(2)+' AU';$('spMv').textContent=P.M.toFixed(1)+' Suns';$('spSv').textContent=P.S+' year / s';}
  $('spA').oninput=function(){P.a=+this.value;upd()};$('spM').oninput=function(){P.M=+this.value;upd()};$('spS').oninput=function(){P.S=+this.value;upd()};upd();
  document.querySelectorAll('#spQuiz ~ * [data-au], .slide [data-au]').forEach(function(b){b.addEventListener('click',function(){P.a=+b.dataset.au;$('spA').value=P.a;upd();});});
  function tick(){var now=performance.now()/1000;if(running){t+=(now-last)*P.S;}last=now;}
  var stars=[];for(var k=0;k<160;k++)stars.push([Math.random()*860,Math.random()*440,Math.random()*1.4+0.3]);
  function draw(){
    tick();var W=cv.width,H=cv.height,ox=W/2,oy=H/2;cx.clearRect(0,0,W,H);
    cx.fillStyle='rgba(255,255,255,.8)';stars.forEach(function(s){cx.beginPath();cx.arc(s[0],s[1],s[2],0,Math.PI*2);cx.fill();});
    // sun
    var g=cx.createRadialGradient(ox,oy,2,ox,oy,26+6*P.M);g.addColorStop(0,'#fff6d0');g.addColorStop(0.5,'#F2A93B');g.addColorStop(1,'rgba(242,169,59,0)');cx.fillStyle=g;cx.beginPath();cx.arc(ox,oy,26+6*P.M,0,Math.PI*2);cx.fill();
    cx.font='500 11px IBM Plex Sans, sans-serif';
    function planet(name,a,col,r,isYou){var R=rpx(a),Tp=T(a),ang=-2*Math.PI*(t/Tp);
      cx.strokeStyle=isYou?'rgba(255,255,255,.55)':'rgba(255,255,255,.14)';cx.setLineDash(isYou?[4,4]:[]);cx.beginPath();cx.arc(ox,oy,R,0,Math.PI*2);cx.stroke();cx.setLineDash([]);
      var x=ox+R*Math.cos(ang),y=oy+R*Math.sin(ang);
      if(isYou){cx.strokeStyle='rgba(255,255,255,.9)';cx.lineWidth=2;cx.beginPath();cx.arc(x,y,r+4,0,Math.PI*2);cx.stroke();cx.lineWidth=1;}
      cx.fillStyle=col;cx.beginPath();cx.arc(x,y,r,0,Math.PI*2);cx.fill();
      if(name==='Saturn'){cx.strokeStyle='rgba(230,211,163,.8)';cx.lineWidth=2;cx.beginPath();cx.ellipse(x,y,r+7,(r+7)*0.35,-0.4,0,Math.PI*2);cx.stroke();cx.lineWidth=1;}
      cx.fillStyle=isYou?'#fff':'rgba(255,255,255,.7)';cx.fillText(name+(isYou?'  '+Tp.toFixed(2)+' yr':''),x+r+5,y+4);}
    PL.forEach(function(p){planet(p[0],p[1],p[2],p[3],false)});
    planet('Your planet',P.a,'#ffffff',6,true);
    var v=29.78*Math.sqrt(P.M/P.a);
    $('spRead').innerHTML='t = <b>'+t.toFixed(1)+' Earth years</b><br>your planet: a = '+P.a.toFixed(2)+' AU → one year = <b>'+T(P.a).toFixed(2)+' Earth years</b><br>speed '+v.toFixed(1)+' km/s &nbsp; star = '+P.M.toFixed(1)+' Suns';
  }
  $('spGo').addEventListener('click',function(){running=!running;this.textContent=running?'Pause':'Play';});
  $('spReset').addEventListener('click',function(){t=0;});
  // 3D
  var meshes=[],you,sun,ready=false;
  function init3d(){var wrap=$('sp3Wrap');if(!HAS3D()){no3dMsg(wrap);return;}if(S3)return;S3=make3d(wrap);S3.orb.r=14;S3.orb.ph=1.0;S3.orb.th=0.4;
    var sg=new THREE.BufferGeometry(),sp=new Float32Array(1200*3);for(var i=0;i<1200;i++){var r=60+Math.random()*40,th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1);sp[i*3]=r*Math.sin(ph)*Math.cos(th);sp[i*3+1]=r*Math.cos(ph);sp[i*3+2]=r*Math.sin(ph)*Math.sin(th);}
    sg.setAttribute('position',new THREE.BufferAttribute(sp,3));S3.sc.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:0.35})));
    sun=new THREE.Mesh(new THREE.SphereGeometry(0.9,32,24),new THREE.MeshBasicMaterial({color:0xF2A93B}));S3.sc.add(sun);
    var pl=new THREE.PointLight(0xfff2cc,1.6,200);S3.sc.add(pl);
    function ring(R,col){var rg=new THREE.RingGeometry(R-0.01,R+0.01,96);var m=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide,transparent:true,opacity:0.35}));m.rotation.x=-Math.PI/2;S3.sc.add(m);return m;}
    PL.forEach(function(p){var R=rpx(p[1])/40;ring(R,0x8FA0F0);var m=new THREE.Mesh(new THREE.SphereGeometry(p[3]/28,24,18),new THREE.MeshStandardMaterial({color:p[2],roughness:0.7}));S3.sc.add(m);
      if(p[0]==='Saturn'){var rr=new THREE.Mesh(new THREE.RingGeometry(p[3]/28*1.4,p[3]/28*2.2,48),new THREE.MeshBasicMaterial({color:0xe6d3a3,side:THREE.DoubleSide,transparent:true,opacity:0.7}));rr.rotation.x=-Math.PI/2+0.4;m.add(rr);}
      meshes.push({m:m,a:p[1]});});
    you={m:new THREE.Mesh(new THREE.SphereGeometry(0.22,24,18),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x8FA0F0,emissiveIntensity:0.5})),ring:ring(1,0xffffff)};S3.sc.add(you.m);ready=true;}
  function draw3d(){if(!ready)return;tick();sun.scale.setScalar(0.8+0.25*P.M);
    meshes.forEach(function(o){var R=rpx(o.a)/40,ang=-2*Math.PI*(t/T(o.a));o.m.position.set(R*Math.cos(ang),0,R*Math.sin(ang));});
    var Ry=rpx(P.a)/40,ay=-2*Math.PI*(t/T(P.a));you.m.position.set(Ry*Math.cos(ay),0,Ry*Math.sin(ay));you.ring.scale.setScalar(Ry);
    S3.place();S3.r.render(S3.sc,S3.cam);$('sp3Read').innerHTML='t = <b>'+t.toFixed(1)+' yr</b> &nbsp; your planet: '+P.a.toFixed(2)+' AU, year = <b>'+T(P.a).toFixed(2)+' yr</b><br>drag to orbit, wheel to zoom';}
  $('sp3Go').addEventListener('click',function(){running=!running;this.textContent=running?'Pause (3D)':'Play (3D)';});
  document.addEventListener('pane',function(e){if(e.detail.dive==='sp'&&e.detail.pane==='3d')init3d();});
  (function loop(){var sl=cv.closest('.slide');if(sl.classList.contains('on')){if(sl.querySelector('.pane[data-p="2d"]').classList.contains('on'))draw();else if(sl.querySelector('.pane[data-p="3d"]').classList.contains('on'))draw3d();}else{last=performance.now()/1000;}requestAnimationFrame(loop);})();
})();
