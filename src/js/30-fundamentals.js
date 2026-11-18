/* slide "What is AI?": open one nested box at a time */
(function(){
  var sl=document.getElementById('s-whatai');if(!sl)return;
  var D=[
    ['Artificial intelligence','Computers doing tasks that usually need human thinking.','Your phone understanding your voice.'],
    ['Machine learning','AI that learns patterns from examples instead of fixed rules.','Your email filtering out spam.'],
    ['Deep learning','Machine learning using many layers to find complex patterns.','Your phone recognising your face.'],
    ['Generative AI','Deep learning that creates new text, images or other content.','ChatGPT writing a story.']];
  var boxes=[].slice.call(sl.querySelectorAll('.wa-box')),det=sl.querySelector('.wa-detail'),cur=0,open=0;
  function $(id){return document.getElementById(id);}
  function render(){
    boxes.forEach(function(b){var k=+b.dataset.k;b.classList.toggle('hid',k>open);b.classList.toggle('sel',k===cur);});
    $('waIx').textContent='Layer '+(cur+1)+' of 4';$('waName').textContent=D[cur][0];$('waDef').textContent=D[cur][1];$('waEx').textContent=D[cur][2];
    det.className=det.className.replace(/\bk\d\b/g,'').trim()+' k'+cur;
    det.classList.remove('swap');void det.offsetWidth;det.classList.add('swap');
    $('waPrev').disabled=cur===0;$('waNext').disabled=cur===3;
  }
  function go(k){cur=Math.max(0,Math.min(3,k));if(cur>open)open=cur;render();}
  $('waNext').addEventListener('click',function(e){e.stopPropagation();go(cur+1);});
  $('waPrev').addEventListener('click',function(e){e.stopPropagation();go(cur-1);});
  boxes.forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();go(+b.dataset.k);});});
  document.addEventListener('slidechange',function(e){if(e.detail.slide===sl){cur=0;open=0;render();}});
  var q=+(new URLSearchParams(location.search).get('wa')||0);
  if(q){open=3;cur=Math.min(3,q-1);}
  render();
})();
