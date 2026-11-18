/* ============================================================ 40-prompt-verify: slide 7 (6-part prompt + all-in-one) and slide 14 (check a source) */
(function(){
  // ---- slide 7: prompt builder (each part is a coloured sentence that pours into the prompt)
  var box=document.getElementById('ptext'),note=document.getElementById('pnote');
  if(box){
    var keys=['role','task','context','constraints','format','check'];
    var P={role:'Act as a friendly biology teacher.',task:'Explain how a vaccine teaches my body to fight a virus.',context:'I am a first-year student. I know what a virus is, but no biology beyond school.',constraints:'Keep it under 150 words and avoid jargon; if you must use a technical word, explain it in brackets.',format:'Three short paragraphs, then a one-line summary I can remember.',check:'Finally, list what you assumed and what I should double-check.'};
    var NOTE={role:'Without a role the AI picks a random voice: encyclopaedia, journalist, children\'s book.',task:'Without a task you get a generic page about vaccines in general.',context:'Without context the level is a coin toss: too easy, or full of immunology words.',constraints:'Without constraints: 900 words and jargon you have never seen.',format:'Without a format: a wall of text you cannot scan.',check:'Without the Check line the AI hides its assumptions, and you cannot check what you cannot see.'};
    var ALL='All six parts present. Swap the topic for your own and it works for any subject.';
    var on={},spans={},lastOff=[];
    box.innerHTML='';
    keys.forEach(function(k,n){on[k]=true;var s=document.createElement('span');s.className='ps c'+(n+1);s.textContent=P[k];spans[k]=s;box.appendChild(s);box.appendChild(document.createTextNode(' '));});
    var empty=document.createElement('span');empty.className='empty';empty.textContent='(empty prompt)';empty.style.display='none';box.appendChild(empty);
    function pour(){keys.forEach(function(k,n){var s=spans[k];if(!on[k])return;s.classList.remove('in');void s.offsetWidth;s.style.animationDelay=(0.25+n*0.12)+'s';s.classList.add('in');});}
    function noteShow(){var any=keys.some(function(k){return on[k]});empty.style.display=any?'none':'inline';
      var off=lastOff.filter(function(k){return !on[k]});note.textContent=off.length?NOTE[off[off.length-1]]:ALL;note.classList.toggle('alert',off.length>0);}
    function setPart(k,val){var s=spans[k];on[k]=val;
      if(!val){lastOff=lastOff.filter(function(x){return x!==k});lastOff.push(k);s.classList.remove('in','flash');s.classList.add('out');setTimeout(function(){if(!on[k])s.style.display='none';},300);}
      else{s.style.display='';s.classList.remove('out','in');s.style.animationDelay='0s';void s.offsetWidth;s.classList.add('in');}
      noteShow();}
    document.querySelectorAll('#pparts .pp').forEach(function(p){var k=p.dataset.k;
      p.addEventListener('click',function(){setPart(k,!on[k]);p.classList.toggle('off',!on[k]);});
      p.addEventListener('mouseenter',function(){var s=spans[k];if(!on[k])return;s.classList.remove('flash','in');void s.offsetWidth;s.classList.add('flash');});});
    noteShow();
    var sl=box.closest('.slide');
    document.addEventListener('slidechange',function(e){if(e.detail.slide===sl)pour();});
    if(sl.classList.contains('on'))pour();
    // view switch: build part by part / all-in-one
    var seg=document.getElementById('ppSeg');
    if(seg)seg.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){
      seg.querySelectorAll('button').forEach(function(x){x.classList.toggle('sel',x===b)});
      sl.querySelectorAll('.pv-view').forEach(function(v){v.classList.toggle('on',v.dataset.v===b.dataset.v)});
      if(b.dataset.v==='build')pour();});});
  }

  // ---- slide 14: check before you trust (click to reveal source, then compare + label)
  var flow=document.getElementById('csFlow'),go=document.getElementById('csNext');
  if(flow&&go){
    var cards=flow.querySelectorAll('.cs-card'),st=1,LBL=['','Find a source →','Compare →','Again ↺'];
    function csShow(){cards.forEach(function(c,i){c.classList.toggle('lit',i<st)});go.textContent=LBL[st];}
    function csNext(){st=st>=3?1:st+1;csShow();}
    go.addEventListener('click',csNext);
    cards.forEach(function(c){c.addEventListener('click',function(){var s=+c.dataset.s;if(s>st){st=s;csShow();}});});
    document.addEventListener('slidechange',function(e){if(e.detail.slide===flow.closest('.slide')){st=1;csShow();}});
    csShow();
  }
})();
