/* ============================================================ slide 02: roadmap (path, worm, step card) */
(function(){
  var sec=document.getElementById('roadmap');if(!sec)return;
  function el(id){return document.getElementById(id)}

  /* ---------- the 12 steps: [map label, title, what, how] ---------- */
  var STEPS=[
    ['Get ready','Get Ready','Choose ChatGPT, Claude, Gemini, Copilot, or a coding agent. Sign in.',''],
    ['Folder','Make Your Folder','Create a folder called My AI Lab and a notes file.','Right-click the Desktop › New › Folder. Inside it save a Notepad file: my-lab-notes.txt'],
    ['Chat','Start Chatting','Open a new chat with your AI.','Stay in this one chat all afternoon so it remembers your work.'],
    ['Explore','Explore an Idea','Ask AI to explain something from your subject.','Not clear? Reply "simpler" or "one level deeper".'],
    ['Table','Make a Table','Ask AI to create a table with numbers.','Check one row yourself with your phone calculator.'],
    ['Build','Build a Simulation','Ask AI to create one interactive web page.','One single HTML file, with a slider for every variable.'],
    ['Save','Save Your Work','Save the web page in My AI Lab.','Name it my-simulation.html, then double-click it to run.'],
    ['Try it','Try It Out','Move the sliders and see what changes.','Write your prediction in the notes first.'],
    ['Improve','Make It Better','Ask AI to improve one thing.','One change per message. Save v2, v3: never overwrite v1.'],
    ['Check','Check a Fact','Find a real source to check one AI claim.','Open the source yourself and write it in your notes.'],
    ['Habits','Remember Three Habits','Prompt, Simulate, Verify. Three skills you can use again.',''],
    ['Share','Share Your Work','Send your finished work to Mariam.','Attach the notes file, the latest HTML and a screenshot.']];

  /* ---------- Step 0 lives on its own slide: #s-setup (src/slides/02b-setup.html) ---------- */
  function goSetup(){var t=document.getElementById('s-setup');if(t&&window.deckShow)window.deckShow([].indexOf.call(document.querySelectorAll('#deck .slide'),t));}
  el('rmSetupBtn').onclick=function(e){e.stopPropagation();goSetup();};

  /* ---------- roadmap path + worm ---------- */
  var rm=el('rmap'),path=el('rmPath'),worm=el('rmWorm'),det=el('rmDetail'),Lp=path.getTotalLength(),nodes=[],curL=0,tgtL=0,anim=null,lastDir=1,selK=0;
  if(typeof wormSVG==='function')worm.innerHTML=wormSVG('GO!','#7CC843');
  function lenOf(k){return Lp*(0.02+0.96*k/11)}
  function pos(k){var p=path.getPointAtLength(lenOf(k));return {x:p.x/1110*100,y:p.y/300*100};}
  function place(L,dir){var p=path.getPointAtLength(L);worm.style.left=(p.x/1110*100)+'%';worm.style.top=(p.y/300*100)+'%';worm.classList.toggle('flip',dir>0);}
  function crawl(){var d=tgtL-curL;if(Math.abs(d)<1.5){curL=tgtL;place(curL,lastDir);anim=null;return;}var sp=Math.max(2.2,Math.abs(d)*0.045);curL+=Math.sign(d)*Math.min(Math.abs(d),sp);place(curL,Math.sign(d));anim=requestAnimationFrame(crawl);}
  function sel(k){selK=k;nodes.forEach(function(n,i){n.classList.toggle('sel',i===k)});tgtL=lenOf(k);lastDir=tgtL>=curL?1:-1;if(!anim)anim=requestAnimationFrame(crawl);
    var s=STEPS[k];
    det.innerHTML='<div class="n">'+k+'</div><div class="rmdt"><b>Step '+k+' · '+s[1]+'</b><p>'+s[2]+'</p>'+(s[3]?'<p class="how">'+s[3]+'</p>':'')+'</div>'+(k===0?'<button type="button" class="rmsetup lg" id="rmSetupBtn2">Open the setup guide →</button>':'');
    var b2=el('rmSetupBtn2');if(b2)b2.onclick=function(e){e.stopPropagation();goSetup();};
    det.classList.remove('rin');void det.offsetWidth;det.classList.add('rin');}
  STEPS.forEach(function(s,k){var p=pos(k),d=document.createElement('button');d.type='button';d.className='rmnode'+((p.y<45||k===1||k===11)?' up':'')+(k===0?' zero':'');d.style.left=p.x+'%';d.style.top=p.y+'%';d.innerHTML=k+'<span>'+s[0]+'</span>';
    d.onclick=function(e){e.stopPropagation();sel(k);if(k===0)setTimeout(goSetup,450);};rm.appendChild(d);nodes.push(d);});
  curL=lenOf(0);tgtL=curL;place(curL,1);sel(0);
})();
