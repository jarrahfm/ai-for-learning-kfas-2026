/* ============================================================ finale seat: QR codes (title + thank you) and the butterfly finale */
var SLIDES_URL='https://jarrahfm.github.io/ai-for-learning-kfas-2026/';
var SURVEY_URL = 'https://kfas.eu.qualtrics.com/jfe/form/SV_6P8nYVS6blCVI9g?Q_CHL=qr'; // decoded from assets/survey_qr_source.jpeg
var FINALE_TITLE = "Now It's Your Turn to Shine!";
var FINALE_SUB = 'You started with questions. Now you can explore, create, and check.';

(function(){
  window.SLIDES_URL = SLIDES_URL;
  function qr(el, text){
    if(!el || !window.QRCode) return;
    var size = +el.dataset.size || 200;
    el.innerHTML = ''; el.title = text;
    try{ new QRCode(el, {text:text, width:size, height:size, correctLevel:QRCode.CorrectLevel.M, colorDark:'#0B1030', colorLight:'#ffffff'}); }catch(e){}
  }
  document.querySelectorAll('.qrSlides').forEach(function(e){ qr(e, SLIDES_URL); });
  document.querySelectorAll('.qrSurvey').forEach(function(e){ qr(e, SURVEY_URL); });
})();

(function(){
  var sl = document.getElementById('s-thanks'); if(!sl) return;
  var fx = sl.querySelector('.tk-fx'), cv = fx.querySelector('canvas'), ctx = cv.getContext('2d');
  var rays = fx.querySelector('.tk-rays'), glow = fx.querySelector('.tk-glow'), chrys = fx.querySelector('.tk-chrys'),
      fly = fx.querySelector('.tk-fly'), flash = fx.querySelector('.tk-flash'), msg = fx.querySelector('.tk-msg'),
      ctl = fx.querySelector('.tk-ctl');
  var worms = [].slice.call(sl.querySelectorAll('.tk-worm'));
  var CX = 640, CY = 300;
  var running = false, timers = [], raf = 0, t0 = 0, parts = [], extras = [], flyOn = false, flyT0 = 0, silk = 0;
  var COLS = ['#FFE7A8', '#F2A93B', '#7FDBD0', '#2BB3A3', '#FF8FB8', '#FFFFFF', '#8FA0F0'];

  // message text, split into letters for the reveal
  (function(){
    var b = msg.querySelector('b'), d = 0;
    FINALE_TITLE.split(' ').forEach(function(w, wi){
      var word = document.createElement('span'); word.style.whiteSpace = 'nowrap';
      w.split('').forEach(function(c){
        var s = document.createElement('span'); s.className = 'ch'; s.textContent = c;
        s.style.backgroundPosition = (-d * 40) + 'px 0'; s._d = d;
        word.appendChild(s); d++;
      });
      b.appendChild(word);
      if(wi < FINALE_TITLE.split(' ').length - 1) b.appendChild(document.createTextNode(' '));
    });
    msg.querySelector('.tk-sub').textContent = FINALE_SUB;
  })();

  var chars = [].slice.call(msg.querySelectorAll('.ch'));
  function life(svg, fast){
    var out = [];
    svg.querySelectorAll('.wseg').forEach(function(c, k){
      out.push(c.animate([{transform:'translateY(0)'}, {transform:'translateY(-7px)'}, {transform:'translateY(0)'}],
        {duration:fast ? 320 : 1600, delay:-(5 - k) * (fast ? 40 : 120), iterations:Infinity, easing:'ease-in-out'}));
    });
    var sign = svg.querySelector('.wsign');
    if(sign){ sign.style.transformOrigin = '50% 100%'; out.push(sign.animate([{transform:'rotate(-3deg)'}, {transform:'rotate(3deg)'}, {transform:'rotate(-3deg)'}], {duration:fast ? 500 : 2400, iterations:Infinity, easing:'ease-in-out'})); }
    return out;
  }
  worms.forEach(function(w, i){
    var svg = w.querySelector('svg'); if(!svg) return;
    life(svg, false);
    svg.animate([{filter:'drop-shadow(0 0 0 rgba(255,214,120,0))'}, {filter:'drop-shadow(0 0 14px rgba(255,214,120,.85))'}, {filter:'drop-shadow(0 0 0 rgba(255,214,120,0))'}],
      {duration:2600, delay:-i * 1300, iterations:Infinity, easing:'ease-in-out'});
  });
  sl.querySelector('.tk-go').animate([{boxShadow:'0 0 0 0 rgba(242,169,59,.6)'}, {boxShadow:'0 0 0 14px rgba(242,169,59,0)', offset:.7}, {boxShadow:'0 0 0 14px rgba(242,169,59,0)'}], {duration:2600, iterations:Infinity});

  function at(ms, fn){ timers.push(setTimeout(fn, ms)); }
  function stageRect(el){
    var r = el.getBoundingClientRect(), s = sl.getBoundingClientRect(), k = s.width / 1280;
    return {x:(r.left - s.left) / k, y:(r.top - s.top) / k, w:r.width / k, h:r.height / k};
  }
  function rnd(a, b){ return a + Math.random() * (b - a); }
  function burst(x, y, n, sp, life, opt){
    opt = opt || {};
    for(var i = 0; i < n; i++){
      var a = rnd(0, Math.PI * 2), v = rnd(sp * 0.25, sp);
      parts.push({x:x, y:y, vx:Math.cos(a) * v, vy:Math.sin(a) * v - (opt.up || 0), g:opt.g == null ? 0.05 : opt.g,
        drag:opt.drag || 0.975, life:0, max:rnd(life * 0.6, life), r:rnd(1.5, opt.r || 4), c:COLS[(Math.random() * COLS.length) | 0],
        star:Math.random() < (opt.stars == null ? 0.35 : opt.stars), spin:rnd(0, 6)});
    }
  }
  function drawStar(x, y, r, a){
    ctx.beginPath();
    for(var i = 0; i < 8; i++){
      var rr = i % 2 ? r * 0.28 : r, aa = a + i * Math.PI / 4;
      ctx.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr);
    }
    ctx.closePath(); ctx.fill();
  }
  function flyPos(t){ // butterfly path after it unfolds (t seconds since emergence)
    var e = Math.min(1, t / 1.6), ease = 1 - Math.pow(1 - e, 3);
    var hx = CX + Math.sin(t * 0.9) * 170 * ease, hy = CY - 60 * ease + Math.sin(t * 1.8) * 26 * ease;
    return {x:hx, y:hy, rot:Math.cos(t * 0.9) * 10 * ease};
  }
  function frame(now){
    var t = (now - t0) / 1000;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, 1280, 720);
    ctx.globalCompositeOperation = 'lighter';
    // silk threads wrapping the forming chrysalis
    if(silk > 0){
      for(var k = 0; k < 9; k++){
        var a = t * 2.2 + k * 0.7;
        ctx.strokeStyle = 'rgba(255,240,210,' + (0.32 * silk) + ')'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.ellipse(CX, CY, 58 + 22 * Math.sin(t * 3 + k), 150, a, 0, Math.PI * 2); ctx.stroke();
      }
    }
    // butterfly flight + sparkle trail
    if(flyOn){
      var ft = (now - flyT0) / 1000, p = flyPos(ft);
      var open = Math.min(1, ft / 0.9), oe = open < 1 ? 1 - Math.pow(1 - open, 3) * Math.cos(open * 5) : 1;
      var flap = ft < 0.9 ? 1 : 0.38 + 0.62 * Math.abs(Math.cos((ft - 0.9) * 6.2));
      var sc = 0.35 + 0.65 * Math.min(1, ft / 0.9);
      fly.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px) rotate(' + p.rot + 'deg) scale(' + (sc * Math.max(0.04, oe) * flap) + ',' + sc + ')';
      fly.style.opacity = Math.min(1, ft / 0.35);
      if(Math.random() < 0.8) burst(p.x + rnd(-60, 60), p.y + rnd(-20, 40), 1, 1.2, 70, {g:0.012, stars:0.7, r:5});
    }
    // ambient twinkles once the butterfly is out
    if(flyOn && Math.random() < 0.25) parts.push({x:rnd(40, 1240), y:rnd(40, 700), vx:0, vy:-0.15, g:0, drag:1, life:0, max:rnd(50, 110), r:rnd(2, 5), c:COLS[(Math.random() * COLS.length) | 0], star:true, spin:0});
    for(var i = parts.length - 1; i >= 0; i--){
      var q = parts[i]; q.life++;
      if(q.life > q.max){ parts.splice(i, 1); continue; }
      q.vx *= q.drag; q.vy = q.vy * q.drag + q.g; q.x += q.vx; q.y += q.vy;
      var f = 1 - q.life / q.max, tw = q.star ? 0.6 + 0.4 * Math.sin(q.life * 0.4 + q.spin) : 1;
      ctx.globalAlpha = Math.max(0, f * tw);
      ctx.fillStyle = q.c;
      if(q.star){ drawStar(q.x, q.y, q.r * 2.2, q.spin + q.life * 0.05); }
      else { ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (0.5 + f * 0.5), 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  function anim(el, kf, opt){ var a = el.animate(kf, opt); extras.push(a); return a; }

  function start(){
    if(running) return;
    reset(); running = true;
    sl.classList.add('tk-run');
    t0 = performance.now(); raf = requestAnimationFrame(frame);
    requestAnimationFrame(function(){ sl.classList.add('tk-dim'); });

    // 1. the worms come alive above the dimmed slide (0 - 0.7 s)
    var clones = worms.map(function(w){
      var r = stageRect(w), c = document.createElement('div');
      c.className = 'tk-clone'; c.style.cssText = 'left:' + r.x + 'px;top:' + r.y + 'px;width:' + r.w + 'px;height:' + r.h + 'px';
      c.innerHTML = w.innerHTML; sl.appendChild(c); extras.push({cancel:function(){ c.remove(); }});
      extras.push.apply(extras, life(c.querySelector('svg'), true));
      w.style.visibility = 'hidden';
      c._dx = CX - (r.x + r.w / 2); c._dy = CY - (r.y + r.h / 2);
      anim(c, [{transform:'scale(1)'}, {transform:'scale(1.12) rotate(-4deg)'}, {transform:'scale(1.08) rotate(4deg)'}, {transform:'scale(1.12) rotate(-3deg)'}, {transform:'scale(1.1)'}],
        {duration:700, easing:'ease-in-out', fill:'forwards'});
      return c;
    });
    // 2. they spiral into the centre and wrap up (0.7 - 1.9 s)
    at(700, function(){
      clones.forEach(function(c, i){
        var dir = i ? -1 : 1;
        anim(c, [
          {transform:'translate(0,0) scale(1.1) rotate(0deg)', opacity:1},
          {transform:'translate(' + (c._dx * 0.55) + 'px,' + (c._dy * 0.55 - 120) + 'px) scale(.62) rotate(' + (200 * dir) + 'deg)', opacity:1, offset:0.55},
          {transform:'translate(' + c._dx + 'px,' + c._dy + 'px) scale(.08) rotate(' + (540 * dir) + 'deg)', opacity:0}
        ], {duration:1150, easing:'cubic-bezier(.45,0,.3,1)', fill:'forwards'});
      });
      anim(glow, [{opacity:0, transform:'scale(.2)'}, {opacity:.9, transform:'scale(.7)'}], {duration:1100, easing:'ease-in', fill:'forwards'});
      var s0 = performance.now();
      (function ramp(){ var p = (performance.now() - s0) / 900; silk = Math.min(1, p); if(p < 1 && running) timers.push(setTimeout(ramp, 30)); })();
    });
    at(1650, function(){
      burst(CX, CY, 40, 3, 50, {g:0, stars:0.6});
      anim(chrys, [{opacity:0, transform:'scale(.2) rotate(-25deg)'}, {opacity:1, transform:'scale(1.12) rotate(6deg)', offset:.6}, {opacity:1, transform:'scale(1) rotate(0deg)'}],
        {duration:650, easing:'cubic-bezier(.2,1.3,.4,1)', fill:'forwards'});
    });
    at(2200, function(){ var s0 = performance.now(); (function fade(){ var p = (performance.now() - s0) / 600; silk = Math.max(0, 1 - p); if(p < 1 && running) timers.push(setTimeout(fade, 30)); })(); });
    // 3. the chrysalis glows and trembles harder and harder (2.3 - 3.5 s)
    at(2300, function(){
      rays.classList.add('on');
      anim(rays, [{rotate:'0deg'}, {rotate:'360deg'}], {duration:40000, iterations:Infinity});
      var kf = [], n = 24;
      for(var i = 0; i <= n; i++){ var amp = (i / n) * (i / n) * 14; kf.push({transform:'rotate(' + (i % 2 ? amp : -amp) + 'deg) scale(' + (1 + i / n * 0.08) + ')', opacity:1}); }
      anim(chrys, kf, {duration:1200, easing:'ease-in', fill:'forwards'});
      anim(glow, [{opacity:.9, transform:'scale(.7)'}, {opacity:1, transform:'scale(1.25)'}], {duration:1200, easing:'ease-in', fill:'forwards'});
      for(var j = 0; j < 6; j++) at(2300 + j * 200, function(){ burst(CX + rnd(-30, 30), CY + rnd(-90, 90), 8, 2.2, 40, {g:0.02, stars:0.8}); });
    });
    // 4. it bursts open (3.5 s)
    at(3500, function(){
      anim(flash, [{opacity:0}, {opacity:1, offset:.18}, {opacity:0}], {duration:900, easing:'ease-out', fill:'forwards'});
      burst(CX, CY, 220, 11, 95, {g:0.06, r:4.5});
      burst(CX, CY, 60, 5, 120, {g:0.0, stars:1, r:6});
      chrys.style.opacity = 0; extras.forEach(function(a){ if(a.effect && a.effect.target === chrys) a.cancel(); });
      chrys.style.opacity = 0;
      [['polygon(0 0,54% 0,46% 22%,57% 41%,44% 60%,55% 79%,48% 100%,0 100%)', -1], ['polygon(54% 0,100% 0,100% 100%,48% 100%,55% 79%,44% 60%,57% 41%,46% 22%)', 1]].forEach(function(h){
        var im = document.createElement('img'); im.className = 'tk-half'; im.src = chrys.src; im.style.clipPath = h[0];
        fx.insertBefore(im, cv); extras.push({cancel:function(){ im.remove(); }});
        anim(im, [{opacity:1, transform:'translate(0,0) rotate(0deg) scale(1.08)'}, {opacity:0, transform:'translate(' + (h[1] * 190) + 'px,170px) rotate(' + (h[1] * 50) + 'deg) scale(.8)'}],
          {duration:1000, easing:'cubic-bezier(.2,.7,.4,1)', fill:'forwards'});
      });
      anim(glow, [{opacity:1, transform:'scale(1.25)'}, {opacity:.55, transform:'scale(1.6)'}], {duration:1400, easing:'ease-out', fill:'forwards'});
      // 5. the butterfly unfolds and takes off
      flyOn = true; flyT0 = performance.now();
    });
    // 6. the message
    at(4400, function(){
      msg.classList.add('on');
      chars.forEach(function(c){
        anim(c, [{opacity:0, transform:'translateY(34px) scale(.6)', filter:'blur(10px)'}, {opacity:1, transform:'none', filter:'blur(0)'}],
          {duration:700, delay:c._d * 35, easing:'cubic-bezier(.2,1.4,.4,1)', fill:'forwards'});
        anim(c, [{backgroundPositionX:(-c._d * 40) + 'px'}, {backgroundPositionX:(1280 - c._d * 40) + 'px'}], {duration:3200, delay:800 + c._d * 35, iterations:Infinity});
      });
    });
    at(5600, function(){ ctl.classList.add('on'); running = false; sl.classList.add('tk-done'); });
  }

  function reset(){
    timers.forEach(clearTimeout); timers = [];
    cancelAnimationFrame(raf); raf = 0;
    extras.forEach(function(a){ try{ a.cancel(); }catch(e){} }); extras = [];
    parts = []; flyOn = false; silk = 0; running = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    rays.classList.remove('on'); msg.classList.remove('on'); ctl.classList.remove('on');
    fly.style.transform = ''; fly.style.opacity = ''; chrys.style.opacity = '';
    sl.classList.remove('tk-run', 'tk-dim', 'tk-done');
    worms.forEach(function(w){ w.style.visibility = ''; });
  }

  worms.forEach(function(w){ w.addEventListener('click', function(e){ e.stopPropagation(); start(); }); });
  sl.querySelector('.tk-go').addEventListener('click', function(e){ e.stopPropagation(); start(); });
  fx.querySelector('.tk-replay').addEventListener('click', function(e){ e.stopPropagation(); reset(); start(); });
  fx.querySelector('.tk-close').addEventListener('click', function(e){ e.stopPropagation(); reset(); });
  document.addEventListener('slidechange', function(e){ if(e.detail.slide !== sl) reset(); });
  window.finaleStart = start; window.finaleReset = reset;
})();
