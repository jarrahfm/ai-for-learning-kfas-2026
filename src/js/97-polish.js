/* section colour themes + official KFAS / 50-years logos on every slide */
(function(){
  var TH={'roadmap':'sunrise','s-setup':'sunrise','s-habits':'lagoon','s-whatai':'lagoon','s-chatbot':'lagoon',
    's-prompt':'potion','s-ladder':'aurora','dive-pendulum':'indigo','dive-takeoff':'sky','dive-bacteria':'meadow',
    'dive-orbits':'cosmos','s-check':'signal','s-teachers':'coral','s-credits':'lagoon'};
  var I=window.IMGS||{};
  function img(k,c){var m=document.createElement('img');m.src=I[k]||'';m.alt=k.indexOf('50')>=0?'KFAS 50 years':'KFAS';if(c)m.className=c;return m;}
  document.querySelectorAll('#deck .slide').forEach(function(sl){
    var t=TH[sl.id];if(t)sl.classList.add('th-'+t);
    var dark=sl.classList.contains('dark');
    if(sl.id==='s-title'||sl.id==='s-thanks'){
      var mk=sl.querySelector('.mark');if(!mk)return;
      var l=document.createElement('span');l.className='klockup';
      l.appendChild(img('logo-50-white','k50'));l.appendChild(document.createElement('i'));l.appendChild(img('logo-kfas-white','kk'));
      mk.insertBefore(l,mk.firstChild);mk.classList.add('has-lockup');
      return;
    }
    var b=document.createElement('div');b.className='kbadge';
    b.appendChild(img(dark?'logo-50-white':'logo-50-gold','k50'));b.appendChild(document.createElement('i'));b.appendChild(img(dark?'logo-kfas-white':'logo-kfas','kk'));
    sl.appendChild(b);
  });
})();
