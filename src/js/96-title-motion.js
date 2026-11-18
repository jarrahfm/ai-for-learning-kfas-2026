(function(){
  var sl=document.getElementById('s-title');if(!sl)return;
  var bg=sl.querySelector('.ttl-bg');if(!bg)return;
  var cv=document.createElement('canvas');cv.className='ttl-fx';cv.width=1280;cv.height=720;bg.insertBefore(cv,bg.querySelector('i'));
  var c=cv.getContext('2d'),P=[],L=[];
  function R(a,b){return a+Math.random()*(b-a);}
  for(var k=0;k<70;k++)P.push({x:R(560,1280),y:R(20,470),r:R(.6,2.2),vx:R(-.12,.12),vy:R(-.18,-.03),p:R(0,6.28),s:R(.01,.035),h:Math.random()<.75?'143,210,255':'127,219,208'});
  for(var j=0;j<14;j++)L.push({a:Math.floor(R(0,70)),b:Math.floor(R(0,70)),p:R(0,6.28)});
  function step(){
    if(sl.classList.contains('on')){
      c.clearRect(0,0,1280,720);
      P.forEach(function(q){q.x+=q.vx;q.y+=q.vy;q.p+=q.s;if(q.y<0){q.y=480;q.x=R(560,1280);}if(q.x<520)q.x=1280;if(q.x>1290)q.x=540;});
      L.forEach(function(l){var A=P[l.a],B=P[l.b],d=Math.hypot(A.x-B.x,A.y-B.y);if(d>220)return;l.p+=.02;var o=(1-d/220)*.22*(.6+.4*Math.sin(l.p));c.strokeStyle='rgba(143,210,255,'+o+')';c.lineWidth=1;c.beginPath();c.moveTo(A.x,A.y);c.lineTo(B.x,B.y);c.stroke();});
      P.forEach(function(q){var o=.35+.65*Math.max(0,Math.sin(q.p));var g=c.createRadialGradient(q.x,q.y,0,q.x,q.y,q.r*5);g.addColorStop(0,'rgba('+q.h+','+o+')');g.addColorStop(1,'rgba('+q.h+',0)');c.fillStyle=g;c.beginPath();c.arc(q.x,q.y,q.r*5,0,6.283);c.fill();});
    }
    requestAnimationFrame(step);
  }
  step();
})();
