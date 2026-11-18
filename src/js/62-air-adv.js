/* Dive 2 aviation: Advanced zoom tab. One camera, real-scale log zoom: runway -> A320neo -> airfoil -> boundary layer -> molecules. */
(function(){
  var sec=document.getElementById('dive-takeoff'); if(!sec)return;
  var cv=document.getElementById('avzC'); if(!cv)return;
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,pane=sec.querySelector('.pane[data-p="adv"]');
  var $=function(id){return document.getElementById(id)};
  // Airbus A320neo key figures (aircraft.airbus.com): length 37.57 m, span 35.80 m, height 11.76 m, fuselage width 3.95 m
  var LEN=37.57,HGT=11.76,FUS=3.95,PX=1800,GB=1.9,PITCH=3*Math.PI/180;
  var CH=5.0; // airfoil chord: illustrative, not A320 data
  var LE={x:PX+23.2,y:GB+0.9}; // wing-root leading edge (illustrative placement)
  var aoa=8,aoaT=8;
  var NASA='https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/';
  var STOPS=[
    {w:4200,k:'Runway',term:'Lift and weight',def:'Weight is always directed toward the centre of the Earth. Lift is directed perpendicular to the flight direction. The wheels leave the runway when lift beats weight.',fact:'Runway drawn 3 km long, matching the 2D tab',cite:'NASA Glenn, Four Forces on an Airplane',url:NASA+'four-forces-on-an-airplane/'},
    {w:70,k:'Aircraft',term:'Thrust and drag',def:'The air resists the motion of the aircraft: that force is drag, along and opposed to the flight direction. The engines make thrust to overcome it.',fact:'A320neo: length 37.57 m, wing span 35.80 m, height 11.76 m',cite:'NASA Glenn, Four Forces; Airbus A320neo key figures',url:'https://aircraft.airbus.com/en/aircraft/a320-family/a320neo'},
    {w:16,k:'Wing section',term:'Airfoil, chord line, angle of attack',def:'The chord line is a straight line between the most forward point (leading edge) and most aft point (trailing edge) of an airfoil. Angle of attack is the angle between the flow and the chord line.',fact:'Slat (front) and flap (rear) are extended for take-off',cite:'NASA Glenn, Lift vs. Angle of Attack (wind-tunnel notes)',url:'https://www.grc.nasa.gov/WWW/k-12/WindTunnel/WTExpKids/tsld006.htm'},
    {w:12.5,k:'Pressure',term:'Lift coefficient and air density',def:'Lower pressure on the upper surface, higher pressure on the lower surface. Lift = ½ ρ v² S C_L, where ρ is air density and the lift coefficient C_L is in general found by experiment.',fact:'L = ½ ρ v² S C_L',cite:'NASA Glenn, The Lift Equation; Bernoulli and Newton',url:NASA+'lift-equation/'},
    {w:10,k:'Stall',term:'Stall',def:'Lift rises with angle of attack until the stall angle is reached. Past it, lift decreases and becomes highly unsteady because the boundary layer separates.',fact:'Watch the upper-surface flow break away',cite:'NASA Glenn, Lift vs. Angle of Attack (wind-tunnel notes)',url:'https://www.grc.nasa.gov/WWW/k-12/WindTunnel/WTExpKids/tsld006.htm'},
    {w:0.25,k:'On the skin',term:'Boundary layer',def:'A thin layer of air near the surface in which the velocity changes from zero at the surface to the free-stream value farther away.',fact:'Its thickness depends on the Reynolds number (drawn illustrative)',cite:'NASA Glenn, Boundary Layer',url:NASA+'boundary-layer/'},
    {w:3e-7,k:'Molecules',term:'Mean free path',def:'The average distance a molecule travels between collisions with other molecules. Air is gas molecules in constant, random motion; the ones touching the skin stick to it.',fact:'Sea-level standard air: 15 °C, 1013.25 mb, ρ = 1.225 kg/m³',cite:'OpenStax University Physics 2, §2.2; US Std Atmosphere 1976',url:'https://openstax.org/books/university-physics-volume-2/pages/2-2-pressure-temperature-and-rms-speed'}
  ];
  var N=STOPS.length,ZMAX=Math.log10(STOPS[0].w),ZMIN=Math.log10(STOPS[N-1].w);
  var z=ZMAX,anim=null,playing=false,hold=0,cur=-1,t0=performance.now()/1000;

  // ---------- airfoil (NACA 4412-like, chord units) ----------
  function yt(x){return 0.6*(0.2969*Math.sqrt(x)-0.1260*x-0.3516*x*x+0.2843*x*x*x-0.1015*x*x*x*x)}
  function yc(x){var m=0.04,p=0.4;return x<p?m/(p*p)*(2*p*x-x*x):m/((1-p)*(1-p))*((1-2*p)+2*p*x-x*x)}
  function frame(a){var r=(a)*Math.PI/180;return {d:{x:-Math.cos(r),y:-Math.sin(r)},n:{x:-Math.sin(r),y:Math.cos(r)}}}
  function fpt(u,v,a,F){F=F||frame(a);return {x:LE.x+CH*(u*F.d.x+v*F.n.x),y:LE.y+CH*(u*F.d.y+v*F.n.y)}}
  function surf(u,up,a){return fpt(u,yc(u)+(up?1:-1)*yt(u),a)}
  function anchorSkin(a){var p=surf(0.62,true,a),q=surf(0.64,true,a);var tx=q.x-p.x,ty=q.y-p.y,l=Math.hypot(tx,ty);return {p:p,t:{x:tx/l,y:ty/l},nrm:{x:-ty/l,y:tx/l}}}
  function stopAnchor(i,a){
    if(i===0)return {x:1500,y:260};
    if(i===1)return {x:PX+LEN/2,y:HGT/2+1};
    if(i===2)return {x:LE.x-CH*0.5,y:LE.y+0.1};
    if(i===3)return {x:LE.x-CH*0.5,y:LE.y-0.1};
    if(i===4)return {x:LE.x-CH*0.5,y:LE.y+0.3};
    var s=anchorSkin(a),h=i===5?0.015:0.2e-7;var n=s.nrm.y<0?{x:-s.nrm.x,y:-s.nrm.y}:s.nrm;
    return {x:s.p.x+n.x*h,y:s.p.y+n.y*h};
  }
  function skinAngle(a){var s=anchorSkin(a);return Math.atan2(-s.t.y,-s.t.x)}

  // ---------- camera ----------
  var cam={x:0,y:0,w:1,k:1,rot:0,ca:1,sa:0};
  function segOf(zz){for(var i=0;i<N-1;i++){var a=Math.log10(STOPS[i].w),b=Math.log10(STOPS[i+1].w);if(zz<=a&&zz>=b)return {i:i,f:(a-zz)/(a-b)}}return zz>ZMAX?{i:0,f:0}:{i:N-2,f:1}}
  function camera(){
    var w=Math.pow(10,z),s=segOf(z),A=stopAnchor(s.i,aoa),B=stopAnchor(s.i+1,aoa),wa=STOPS[s.i].w,wb=STOPS[s.i+1].w;
    var f=(w-wb)/(wa-wb);cam.x=B.x+(A.x-B.x)*f;cam.y=B.y+(A.y-B.y)*f;cam.w=w;cam.k=W/w;
    var rt=skinAngle(aoa),g=sm(Math.log10(1.5),Math.log10(0.2),z);cam.rot=-rt*g;
    cam.ca=Math.cos(cam.rot);cam.sa=Math.sin(cam.rot);
    return s.i+s.f;
  }
  function S(x,y){var dx=(x-cam.x)*cam.k,dy=(y-cam.y)*cam.k;return [W/2+dx*cam.ca-dy*cam.sa,H/2-(dx*cam.sa+dy*cam.ca)]}
  function sm(a,b,v){var t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t)}
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
  function fmtLen(m){var u=[[1e3,'km'],[1,'m'],[1e-2,'cm'],[1e-3,'mm'],[1e-6,'µm'],[1e-9,'nm']];for(var i=0;i<u.length;i++)if(m>=u[i][0]*0.999){var v=m/u[i][0];return (v>=100?v.toFixed(0):v>=10?v.toFixed(0):v.toFixed(v%1?1:0))+' '+u[i][1]}return m.toExponential(1)+' m'}

  // ---------- drawing helpers ----------
  function poly(pts){ctx.beginPath();for(var i=0;i<pts.length;i++){var s=S(pts[i].x,pts[i].y);i?ctx.lineTo(s[0],s[1]):ctx.moveTo(s[0],s[1])}}
  function label(txt,x,y,col,al,align){if(al<=0.02)return;ctx.save();ctx.globalAlpha=al;ctx.font='600 15px "IBM Plex Sans",sans-serif';var w=ctx.measureText(txt).width;var bx=align==='r'?x-w-16:align==='c'?x-w/2-8:x;ctx.fillStyle='rgba(11,16,38,.78)';rr(bx,y-13,w+16,26,9);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=1.2;ctx.stroke();ctx.fillStyle='#fff';ctx.fillText(txt,bx+8,y+5);ctx.restore()}
  function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
  function arrow(x1,y1,x2,y2,col,lw){ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();var a=Math.atan2(y2-y1,x2-x1),h=6+lw*2;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-h*Math.cos(a-.45),y2-h*Math.sin(a-.45));ctx.lineTo(x2-h*Math.cos(a+.45),y2-h*Math.sin(a+.45));ctx.closePath();ctx.fill()}
  function clampY(v){return Math.max(-50,Math.min(H+50,v))}

  // ---------- layers ----------
  function sky(t){
    var lz=Math.log10(cam.w),day=sm(-0.3,1.6,lz),deep=sm(-1.2,-4.5,lz);
    var g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,mix('#0E1A4A','#060A1C',deep));g.addColorStop(0.55,mix(mix('#132055','#2E3A8C',day),'#0A0F2A',deep));g.addColorStop(1,mix(mix('#1B1F3B','#F2A93B',day*0.85),'#0B1026',deep));
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    if(day>0.05){ctx.save();ctx.globalAlpha=day*0.9;var sx=W*0.78,sy=H*0.62;var sg=ctx.createRadialGradient(sx,sy,4,sx,sy,190);sg.addColorStop(0,'rgba(255,214,150,.95)');sg.addColorStop(0.12,'rgba(255,180,90,.55)');sg.addColorStop(1,'rgba(255,150,60,0)');ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);ctx.restore()}
    if(lz<1.4){ctx.save();ctx.globalAlpha=0.16*(1-day*0.6);ctx.strokeStyle='#8FA0F0';ctx.lineWidth=1;var st=Math.pow(10,Math.floor(lz-0.7)),k=cam.k*st;if(k>14){var ox=(W/2)%k,oy=(H/2)%k;for(var x=ox;x<W;x+=k){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(var y=oy;y<H;y+=k){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}}ctx.restore()}
  }
  function mix(a,b,t){var pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16);var r=(pa>>16)*(1-t)+(pb>>16)*t,g=((pa>>8)&255)*(1-t)+((pb>>8)&255)*t,bl=(pa&255)*(1-t)+(pb&255)*t;return 'rgb('+(r|0)+','+(g|0)+','+(bl|0)+')'}
  function ground(t){
    if(cam.w<0.8)return;var al=sm(0.8,3,cam.w);ctx.save();ctx.globalAlpha=al;
    var gy=clampY(S(cam.x,0)[1]);var g=ctx.createLinearGradient(0,gy,0,H);g.addColorStop(0,'#3A2E2A');g.addColorStop(1,'#16121A');ctx.fillStyle=g;ctx.fillRect(0,gy,W,H-gy+60);
    // runway 0..3000 m, 45 m wide seen nearly edge-on: a lit strip
    var a=S(0,0),b=S(3000,0),x1=Math.max(-20,a[0]),x2=Math.min(W+20,b[0]);
    if(x2>x1){var th=Math.max(3,Math.min(26,cam.k*0.9));ctx.fillStyle='#2A2C38';ctx.fillRect(x1,gy,x2-x1,th);ctx.fillStyle='rgba(255,255,255,.8)';
      var step=cam.w>800?150:cam.w>60?50:10;var s0=Math.max(0,Math.floor((cam.x-cam.w)/step)*step);for(var m=s0;m<=Math.min(3000,cam.x+cam.w);m+=step){var p=S(m,0),q=S(m+step*0.45,0);if(q[0]>-5&&p[0]<W+5)ctx.fillRect(p[0],gy+th*0.45,Math.max(1,q[0]-p[0]),Math.max(1,th*0.12))}
      for(m=s0;m<=Math.min(3000,cam.x+cam.w);m+=step/2){p=S(m,0);if(p[0]<-5||p[0]>W+5)continue;var tw=0.55+0.45*Math.sin(t*3+m*0.05);ctx.fillStyle='rgba(255,200,110,'+(0.55*tw)+')';ctx.beginPath();ctx.arc(p[0],gy+1,Math.max(1.5,Math.min(4,cam.k*0.3)),0,7);ctx.fill()}}
    ctx.restore();
    if(cam.w>800){var e=S(0,0),f=S(3000,0);ctx.save();ctx.globalAlpha=sm(800,2500,cam.w);ctx.strokeStyle='#F2A93B';ctx.lineWidth=1.5;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(e[0],gy+30);ctx.lineTo(f[0],gy+30);ctx.stroke();ctx.setLineDash([]);ctx.restore();
      label('runway 3 km',(e[0]+f[0])/2,gy+52,'#F2A93B',sm(800,2500,cam.w),'c')}
  }
  function plane(t,pAl){
    if(cam.w<0.6)return;var px=cam.k;if(px*LEN<2)return;
    var cut=sm(30,14,cam.w),al=1-0.94*cut;ctx.save();
    function P(u,v){var c=Math.cos(PITCH),s=Math.sin(PITCH);var x=u*c-v*s,y=u*s+v*c;return {x:PX+x,y:GB+y}}
    var R=FUS/2,cy=R;
    // fuselage outline (tail at u=0, nose at u=LEN)
    var top=[],bot=[];for(var i=0;i<=40;i++){var u=i/40*LEN,r;if(u<9){var f=u/9;r=R*(0.25+0.75*Math.sqrt(f));var yo=R*(1-f)*0.9}else if(u>LEN-4.2){var f2=(LEN-u)/4.2;r=R*Math.sqrt(Math.max(0,1-(1-f2)*(1-f2)));yo=-R*(1-f2)*0.25}else{r=R;yo=0}top.push(P(u,cy+yo+r));bot.push(P(u,cy+yo*1.6-r))}
    ctx.globalAlpha=al;
    // fin (top reaches HGT)
    poly([P(0.6,cy+R*0.8),P(2.6,HGT),P(5.0,HGT),P(8.5,cy+R)]);ctx.fillStyle='#E8ECF7';ctx.fill();
    poly([P(1.7,HGT-3),P(2.6,HGT),P(5.0,HGT),P(4.3,HGT-3)]);ctx.fillStyle='#2E3A8C';ctx.fill();
    // fuselage
    ctx.beginPath();var all=top.concat(bot.reverse());poly(all);ctx.closePath();var a=S(PX,GB),b=S(PX,GB+FUS);var g=ctx.createLinearGradient(0,b[1],0,a[1]);g.addColorStop(0,'#FFFFFF');g.addColorStop(0.6,'#DCE2F2');g.addColorStop(1,'#9AA4C4');ctx.fillStyle=g;ctx.fill();
    // cheatline
    poly([P(6,cy-0.2),P(LEN-4,cy-0.2),P(LEN-4,cy-0.6),P(6,cy-0.6)]);ctx.fillStyle='#2BB3A3';ctx.fill();
    if(px*LEN>200){ctx.fillStyle='#1B1F3B';for(var w=8;w<LEN-6;w+=0.95){var q=S(P(w,cy+0.55).x,P(w,cy+0.55).y);ctx.fillRect(q[0],q[1],Math.max(1,px*0.25),Math.max(1,px*0.3))}var c1=P(LEN-3.4,cy+0.3),c2=P(LEN-2.3,cy+0.9);poly([c1,{x:c2.x,y:c1.y},c2]);ctx.fillStyle='#1B1F3B';ctx.fill()}
    // engine
    var e1=P(LEN*0.6-1.2,0.55),e2=P(LEN*0.6+3.6,0.55);poly([P(LEN*0.6-1.4,0.9),P(LEN*0.6+3.8,1.45),P(LEN*0.6+3.8,-0.3+0.55),P(LEN*0.6-1.4,0.2)]);ctx.fillStyle='#B8C1DC';ctx.fill();
    // gear
    ctx.strokeStyle='#3B4160';ctx.lineWidth=Math.max(1,px*0.25);[[LEN*0.53,0],[LEN-5.2,0]].forEach(function(gp){var q=P(gp[0],cy-R*0.8),w=P(gp[0],0.55);var s1=S(q.x,q.y),s2=S(w.x,w.y);ctx.beginPath();ctx.moveTo(s1[0],s1[1]);ctx.lineTo(s2[0],s2[1]);ctx.stroke();ctx.fillStyle='#1B1F3B';ctx.beginPath();ctx.arc(s2[0],s2[1],Math.max(1.5,px*0.55),0,7);ctx.fill()});
    ctx.restore();
    // force arrows (stops 0-1)
    if(pAl>0.02){ctx.save();ctx.globalAlpha=pAl;var c=S(PX+LEN*0.55,GB+R),L=Math.max(40,Math.min(110,px*14));
      arrow(c[0],c[1],c[0],c[1]-L,'#2BB3A3',4);arrow(c[0],c[1],c[0],c[1]+L*0.85,'#FF7A7A',4);arrow(c[0]+px*LEN*0.45,c[1],c[0]+px*LEN*0.45+L*0.9,c[1],'#F2A93B',4);arrow(c[0]-px*LEN*0.55,c[1],c[0]-px*LEN*0.55-L*0.7,c[1],'#8FA0F0',4);
      label('LIFT',c[0]+8,c[1]-L-4,'#2BB3A3',1);label('WEIGHT',c[0]+8,c[1]+L*0.85,'#FF7A7A',1);label('THRUST',c[0]+px*LEN*0.45+L*0.9,c[1]-22,'#F2A93B',1,'r');label('DRAG',c[0]-px*LEN*0.55-L*0.7,c[1]-22,'#8FA0F0',1);ctx.restore()}
  }
  function airfoilPath(a){var up=[],lo=[];for(var i=0;i<=48;i++){var u=Math.pow(i/48,1.6)*0.78+0.1;up.push(surf(u,true,a));lo.push(surf(u,false,a))}return up.concat(lo.reverse())}
  function element(u0,u1,rotDeg,shift,a){var hingeU=u0<0.2?u1:u0,F=frame(a),pts=[],i,u;var hp=fpt(hingeU,yc(hingeU),a,F),r=rotDeg*Math.PI/180;
    function tf(p){var dx=p.x-hp.x,dy=p.y-hp.y;return {x:hp.x+dx*Math.cos(r)-dy*Math.sin(r)+shift.x*CH,y:hp.y+dx*Math.sin(r)+dy*Math.cos(r)+shift.y*CH}}
    for(i=0;i<=16;i++){u=u0+(u1-u0)*i/16;pts.push(tf(surf(Math.max(u,1e-4),true,a)))}for(i=16;i>=0;i--){u=u0+(u1-u0)*i/16;pts.push(tf(surf(Math.max(u,1e-4),false,a)))}return pts}
  function topY(x,a){// world-height of upper surface at world x (0 if outside)
    var u=(LE.x-x)/(CH*Math.cos(a*Math.PI/180));if(u<0||u>1)return null;var p=surf(u,true,a);return p.y}
  function botY(x,a){var u=(LE.x-x)/(CH*Math.cos(a*Math.PI/180));if(u<0||u>1)return null;return surf(u,false,a).y}
  function airfoil(t,i0){
    if(cam.w>40||cam.w<0.02)return;var al=sm(40,16,cam.w);ctx.save();ctx.globalAlpha=al;
    var stall=sm(12,17,aoa),cx0=LE.x-CH*0.5,cy0=LE.y;
    // pressure halos
    var pa=al*(0.55+0.45*sm(2.2,3,i0)*(1-sm(3.5,4,i0)));var c=S(cx0,cy0+CH*0.16),r=cam.k*CH*0.62;
    var g=ctx.createRadialGradient(c[0],c[1],2,c[0],c[1],r);g.addColorStop(0,'rgba(80,170,255,'+(0.55*pa*(1-stall*0.6))+')');g.addColorStop(1,'rgba(80,170,255,0)');ctx.fillStyle=g;ctx.fillRect(c[0]-r,c[1]-r,2*r,2*r);
    c=S(cx0,cy0-CH*0.2);g=ctx.createRadialGradient(c[0],c[1],2,c[0],c[1],r*0.8);g.addColorStop(0,'rgba(255,150,70,'+(0.5*pa)+')');g.addColorStop(1,'rgba(255,150,70,0)');ctx.fillStyle=g;ctx.fillRect(c[0]-r,c[1]-r,2*r,2*r);
    // streamlines
    ctx.lineWidth=1.6;for(var j=-6;j<=6;j++){if(!j)continue;var y0=cy0+j*CH*0.085+(j>0?CH*0.05:-CH*0.04),up=j>0,dec=Math.exp(-Math.abs(j)/3.2),spd=up?1.5-0.06*j:0.75;
      ctx.beginPath();var first=true,sep=up&&j<=3?stall:0,lastTop=null;
      for(var xx=cx0+CH*1.6;xx>=cx0-CH*1.8;xx-=CH*0.02){var yy=y0,ty=up?topY(xx,aoa):botY(xx,aoa);var base=up?cy0+CH*0.02:cy0-CH*0.02;
        if(ty!==null){var dh=(ty-base);if(up&&dh<0)dh=0;if(!up&&dh>0)dh=0;var bump=dh*dec;if(sep&&xx<LE.x-CH*0.25){bump=lastTop===null?bump:lastTop+(bump-lastTop)*(1-sep)}else if(up)lastTop=bump;yy+=bump}
        else{var dx=xx<cx0?(cx0-CH*0.5-xx)/CH:(xx-(cx0+CH*0.5))/CH;yy+=(up?1:-1)*0*dx;if(xx<cx0){yy-=CH*0.06*Math.exp(-dx*1.2)*(1-Math.abs(j)/8);if(sep&&lastTop!==null)yy+=lastTop*(1-sep*0.3)*Math.exp(-dx)}else{yy+=CH*0.05*Math.exp(-dx*2.5)*(1-Math.abs(j)/8)}}
        if(sep&&xx<LE.x-CH*0.3&&j<=2){yy+=Math.sin(xx*6+t*7+j)*CH*0.025*sep}
        var s=S(xx,yy);first?ctx.moveTo(s[0],s[1]):ctx.lineTo(s[0],s[1]);first=false}
      ctx.strokeStyle=up?'rgba(150,215,255,.7)':'rgba(255,205,150,.6)';ctx.setLineDash([14,10]);ctx.lineDashOffset=t*60*spd*(1+cam.k/120);ctx.stroke()}
    ctx.setLineDash([]);
    // eddies when stalled
    if(stall>0.05){for(var e=0;e<4;e++){var ex=LE.x-CH*(0.5+e*0.17),ey=(topY(ex,aoa)||cy0)+CH*(0.06+0.03*e),es=S(ex,ey),er=cam.k*CH*(0.04+0.012*e);ctx.strokeStyle='rgba(255,122,122,'+(0.75*stall)+')';ctx.lineWidth=2;ctx.beginPath();var ph=t*(3+e);ctx.arc(es[0],es[1],er,ph,ph+4.6);ctx.stroke()}}
    // slat, main element, flap
    var main=airfoilPath(aoa);poly(main);ctx.closePath();var a1=S(LE.x,LE.y),b1=S(LE.x-CH,LE.y);var mg=ctx.createLinearGradient(a1[0],a1[1]-30,b1[0],b1[1]+30);mg.addColorStop(0,'#EEF2FF');mg.addColorStop(1,'#9AA8D6');ctx.fillStyle=mg;ctx.shadowColor='rgba(143,160,240,.8)';ctx.shadowBlur=18;ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#ffffff';ctx.lineWidth=1.2;ctx.stroke();
    var slat=element(0,0.12,-12,{x:0.035,y:-0.02},aoa);poly(slat);ctx.closePath();ctx.fillStyle='#C9D3F5';ctx.fill();ctx.stroke();
    var flap=element(0.78,1,22,{x:-0.03,y:-0.015},aoa);poly(flap);ctx.closePath();ctx.fillStyle='#C9D3F5';ctx.fill();ctx.stroke();
    // chord line + angle of attack
    var la=sm(1.5,2,i0)*(1-sm(2.6,3,i0))+sm(3.6,4,i0)*(1-sm(4.5,4.9,i0));
    if(la>0.02){ctx.save();ctx.globalAlpha=la*al;var p0=S(LE.x+CH*0.25,LE.y),te=fpt(1,0,aoa),p1=S(te.x,te.y),le=S(LE.x,LE.y);var d=frame(aoa).d;var ext=S(LE.x-d.x*CH*0.3,LE.y-d.y*CH*0.3);
      ctx.strokeStyle='#F2A93B';ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(ext[0],ext[1]);ctx.lineTo(p1[0],p1[1]);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.moveTo(le[0]+cam.k*CH*0.3,le[1]);ctx.lineTo(p1[0],le[1]);ctx.stroke();ctx.setLineDash([]);
      var rr2=cam.k*CH*0.26,ang=-aoa*Math.PI/180;ctx.strokeStyle='#F2A93B';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(le[0],le[1],rr2,ang,0);ctx.stroke();
      label('angle of attack '+aoa.toFixed(0)+'°',le[0]+rr2+8,le[1]-rr2*0.5,'#F2A93B',1);
      label('chord line',(le[0]+p1[0])/2-40,(le[1]+p1[1])/2+38,'#F2A93B',1,'c');
      label('leading edge',le[0]+10,le[1]+52,'#fff',1);label('trailing edge',p1[0]-6,p1[1]+64,'#fff',1,'r');
      var sp=S(slat[2].x,slat[2].y);label('slat',sp[0]+14,sp[1]-34,'#C9D3F5',1);var fp=S(flap[10].x,flap[10].y);label('flap',fp[0]-12,fp[1]+30,'#C9D3F5',1,'r');ctx.restore()}
    var pl=sm(2.4,3,i0)*(1-sm(3.4,3.8,i0));
    if(pl>0.02){var q1=S(cx0,cy0+CH*0.32),q2=S(cx0,cy0-CH*0.26);label('lower pressure, faster flow',q1[0],q1[1],'#50AAFF',pl*al,'c');label('higher pressure',q2[0],q2[1],'#FF9646',pl*al,'c');
      ctx.save();ctx.globalAlpha=pl*al;arrow(q2[0]+150,q2[1]-8,q2[0]+150,q1[1]+26,'#2BB3A3',4);ctx.restore();label('net force: lift',q2[0]+160,(q1[1]+q2[1])/2,'#2BB3A3',pl*al)}
    var sl=sm(3.6,4,i0)*(1-sm(4.4,4.8,i0));if(sl>0.02&&stall>0.3){var q3=S(LE.x-CH*0.62,LE.y+CH*0.3);label('flow separates: stall',q3[0],q3[1],'#FF7A7A',sl*al,'c')}
    ctx.restore();
  }
  // fine scales: skin as a half-plane in the tangent frame at the anchor
  var mol=[];(function(){var r=1;function rnd(){r=(r*16807)%2147483647;return r/2147483647}for(var i=0;i<110;i++)mol.push({x:(rnd()-.5)*4.4e-7,y:rnd()*1.7e-7,a:rnd()*6.28,v:0.6+rnd()*0.8,o:rnd()<0.22,ph:rnd()*6.28,st:false})})();
  function skin(t){
    if(cam.w>0.6)return;var s=anchorSkin(aoa),p=s.p,tg=s.t,n=s.nrm.y<0?{x:-s.nrm.x,y:-s.nrm.y}:s.nrm;var al=sm(0.6,0.15,cam.w);ctx.save();ctx.globalAlpha=al;
    var Lw=cam.w*3,A=S(p.x-tg.x*Lw,p.y-tg.y*Lw),B=S(p.x+tg.x*Lw,p.y+tg.y*Lw),Cc=S(p.x+tg.x*Lw-n.x*Lw,p.y+tg.y*Lw-n.y*Lw),D=S(p.x-tg.x*Lw-n.x*Lw,p.y-tg.y*Lw-n.y*Lw);
    ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.lineTo(Cc[0],Cc[1]);ctx.lineTo(D[0],D[1]);ctx.closePath();var g=ctx.createLinearGradient(0,A[1],0,A[1]+160);g.addColorStop(0,'#C9D3F5');g.addColorStop(0.08,'#7E8BB8');g.addColorStop(1,'#2A3156');ctx.fillStyle=g;ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=2;ctx.shadowColor='#8FA0F0';ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.stroke();ctx.shadowBlur=0;
    // boundary-layer velocity profile (illustrative thickness 4 cm)
    var bl=sm(1.2,0.3,cam.w)*(1-sm(0.02,0.004,cam.w));if(bl>0.02){ctx.globalAlpha=al*bl;var dl=0.04;var pts=[];for(var i=1;i<=12;i++){var h=dl*1.35*i/12,u=h<dl?Math.pow(h/dl,1/7):1;var b0=S(p.x+n.x*h,p.y+n.y*h),b1=S(p.x+n.x*h-tg.x*0.09*u,p.y+n.y*h-tg.y*0.09*u);arrow(b0[0],b0[1],b1[0],b1[1],h<dl?'#2BB3A3':'#8FA0F0',2.2);pts.push(b1)}
      ctx.strokeStyle='rgba(242,169,59,.9)';ctx.lineWidth=2;ctx.beginPath();var z0=S(p.x,p.y);ctx.moveTo(z0[0],z0[1]);pts.forEach(function(q){ctx.lineTo(q[0],q[1])});ctx.stroke();
      var e0=S(p.x+n.x*dl,p.y+n.y*dl);ctx.setLineDash([6,6]);ctx.strokeStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.moveTo(e0[0]-300,e0[1]);ctx.lineTo(e0[0]+300,e0[1]);ctx.stroke();ctx.setLineDash([]);
      label('edge of boundary layer',e0[0]+40,e0[1]-18,'#fff',1);label('free stream',e0[0]-230,e0[1]-60,'#8FA0F0',1);label('velocity = 0 at the skin',z0[0]-120,z0[1]+40,'#F2A93B',1,'c');
      // flowing tracers, slower near the wall
      for(i=0;i<26;i++){var hh=dl*1.3*((i*37)%26)/26+dl*0.02,uu=hh<dl?Math.pow(hh/dl,1/7):1;var xx=((t*0.12*uu+i*0.07)%0.6)-0.3;var q=S(p.x-tg.x*xx+n.x*hh,p.y-tg.y*xx+n.y*hh);ctx.fillStyle='rgba(159,231,220,.9)';ctx.beginPath();ctx.arc(q[0],q[1],2.2,0,7);ctx.fill()}}
    // molecules
    var ma=sm(4e-6,8e-7,cam.w);if(ma>0.02){ctx.globalAlpha=ma;var dt=0.016;
      mol.forEach(function(m,i){var r=Math.max(3,0.18e-9*cam.k),x=m.x,y=m.y;
        if(i>0){x=m.x+Math.cos(m.a+t*0.3*m.v)*3e-8*Math.sin(t*0.9*m.v+m.ph);y=Math.max(2e-9,m.y+Math.sin(m.a*1.7+t*0.4*m.v)*2e-8*Math.cos(t*0.7+m.ph))}
        if(m.y<1.2e-8){y=2e-9+((i%3)*1.5e-9)}
        var q=S(p.x-tg.x*x+n.x*y,p.y-tg.y*x+n.y*y);if(q[0]<-20||q[0]>W+20||q[1]<-20||q[1]>H+20)return;
        var col=m.o?'255,122,122':'143,190,255';var gg=ctx.createRadialGradient(q[0],q[1],0,q[0],q[1],r*3);gg.addColorStop(0,'rgba('+col+',.95)');gg.addColorStop(1,'rgba('+col+',0)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(q[0],q[1],r*3,0,7);ctx.fill();
        ctx.fillStyle='rgb('+col+')';var ox=Math.cos(m.a+t*m.v)*r*0.7,oy=Math.sin(m.a+t*m.v)*r*0.7;ctx.beginPath();ctx.arc(q[0]-ox,q[1]-oy,r*0.75,0,7);ctx.arc(q[0]+ox,q[1]+oy,r*0.75,0,7);ctx.fill()});
      // one molecule's zig-zag path: free flights between collisions
      var path=[[-1.4e-7,0.9e-7],[-0.95e-7,1.2e-7],[-0.6e-7,0.6e-7],[-0.15e-7,1.0e-7],[0.3e-7,0.45e-7],[0.75e-7,0.95e-7],[1.1e-7,0.5e-7],[1.45e-7,1.1e-7]];
      var prog=(t*0.35)%1*(path.length-1);ctx.strokeStyle='rgba(242,169,59,.95)';ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();for(var k2=0;k2<=Math.floor(prog);k2++){var pp=path[k2],q4=S(p.x-tg.x*pp[0]+n.x*pp[1],p.y-tg.y*pp[0]+n.y*pp[1]);k2?ctx.lineTo(q4[0],q4[1]):ctx.moveTo(q4[0],q4[1])}
      var fi=Math.floor(prog),fr=prog-fi,pa2=path[fi],pb2=path[Math.min(fi+1,path.length-1)],hx=pa2[0]+(pb2[0]-pa2[0])*fr,hy=pa2[1]+(pb2[1]-pa2[1])*fr,hq=S(p.x-tg.x*hx+n.x*hy,p.y-tg.y*hx+n.y*hy);ctx.lineTo(hq[0],hq[1]);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#F2A93B';ctx.shadowColor='#F2A93B';ctx.shadowBlur=16;ctx.beginPath();ctx.arc(hq[0],hq[1],6,0,7);ctx.fill();ctx.shadowBlur=0;
      var l1=S(p.x-tg.x*(-0.95e-7)+n.x*1.2e-7,p.y-tg.y*(-0.95e-7)+n.y*1.2e-7);label('free flight between collisions (mean free path)',l1[0]-10,l1[1]-26,'#F2A93B',1);
      var l2=S(p.x+n.x*0.5e-8,p.y+n.y*0.5e-8);label('molecules at the skin stick to it',l2[0]+20,l2[1]+34,'#C9D3F5',1);
      label('molecules enlarged; spacing illustrative',W-14,H-96,'#8FA0F0',0.9,'r')}
    ctx.restore();
  }
  function scalebar(){
    var target=cam.w*0.22,e=Math.pow(10,Math.floor(Math.log10(target))),m=target/e,n=m>=5?5:m>=2?2:1,len=n*e,px=len*cam.k,x=18,y=H-96;
    ctx.save();ctx.fillStyle='rgba(11,16,38,.7)';rr(x-8,y-30,px+16+90,44,10);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-6);ctx.lineTo(x,y);ctx.lineTo(x+px,y);ctx.lineTo(x+px,y-6);ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='600 16px "IBM Plex Mono",monospace';ctx.fillText(fmtLen(len),x+2,y-12);ctx.restore();
  }

  // ---------- UI ----------
  function setStopUI(i){if(i===cur)return;cur=i;var s=STOPS[i];$('avzK').textContent='Stop '+(i+1)+' / '+N+' · '+s.k;$('avzTerm').textContent=s.term;$('avzDef').textContent=s.def;$('avzFact').textContent=s.fact;var c=$('avzCite');c.textContent=s.cite;c.href=s.url;
    $('avzPrev').disabled=i===0;$('avzNext').disabled=i===N-1}
  function goTo(j){j=Math.max(0,Math.min(N-1,j));var z1=Math.log10(STOPS[j].w);anim={z0:z,z1:z1,t:0,d:0.9+0.5*Math.abs(z1-z),j:j}}
  function stopIdx(p){return Math.round(p)}
  var pNow=0;
  $('avzNext').addEventListener('click',function(){setPlay(false);goTo(Math.floor(pNow+0.01)+1)});
  $('avzPrev').addEventListener('click',function(){setPlay(false);goTo(Math.ceil(pNow-0.01)-1)});
  $('avzZ').addEventListener('input',function(e){setPlay(false);anim=null;z=ZMAX-(ZMAX-ZMIN)*(+e.target.value/1000)});
  function setPlay(on){playing=on;var b=$('avzPlay');b.classList.toggle('on',on);b.innerHTML=on?'&#10073;&#10073; Pause':'&#9654; Play';$('avzNext').classList.toggle('hint',!on&&pNow<0.02);hold=0}
  $('avzPlay').addEventListener('click',function(){if(playing){setPlay(false);return}if(pNow>=N-1.01){z=ZMAX;anim=null}setPlay(true);hold=1.6});
  $('avzCopy').addEventListener('click',function(){var txt=$('avzPrompt').innerText,b=this;function ok(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy prompt'},1400)}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(ok,fb);else fb();function fb(){var ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}ta.remove();ok()}});
  setPlay(false);setStopUI(0);

  var last=performance.now()/1000,active=false;
  document.addEventListener('pane',function(e){if(e.detail.dive!=='av')return;active=e.detail.pane==='adv'});
  function frameLoop(){
    requestAnimationFrame(frameLoop);
    if(!sec.classList.contains('on')||!pane.classList.contains('on')){last=performance.now()/1000;return}
    var now=performance.now()/1000,dt=Math.min(0.05,now-last),t=now-t0;last=now;
    if(anim){anim.t+=dt;var f=Math.min(1,anim.t/anim.d);z=anim.z0+(anim.z1-anim.z0)*ease(f);if(f>=1){z=anim.z1;anim=null;hold=0}}
    else if(playing){hold+=dt;if(hold>4.2){if(pNow>=N-1.01)setPlay(false);else goTo(Math.round(pNow)+1)}}
    var si=stopIdx(pNow);aoaT=(si===4&&!anim)||(anim&&anim.j===4&&anim.t/anim.d>0.7)?18:8;aoa+=(aoaT-aoa)*Math.min(1,dt*(aoaT>aoa?0.9:2.5));
    pNow=camera();setStopUI(stopIdx(pNow));
    var sl=$('avzZ');if(document.activeElement!==sl)sl.value=Math.round((ZMAX-z)/(ZMAX-ZMIN)*1000);
    $('avzZv').textContent=fmtLen(cam.w);$('avzHud').innerHTML='view width <b>'+fmtLen(cam.w)+'</b>'+(pNow>1.6&&pNow<4.6?'<br>angle of attack <b>'+aoa.toFixed(0)+'°</b> (illustrative)':'');
    sky(t);ground(t);var fa=1-sm(0.4,0.9,Math.abs(pNow-0.5)*1.0);plane(t,Math.max(0,1-Math.abs(pNow-1)*2.2)*(cam.w<300?1:0));airfoil(t,pNow);skin(t);scalebar();
    var ra=Math.max(0,1-pNow*3);if(ra>0.02){var pc=S(PX+LEN/2,GB);ctx.save();ctx.strokeStyle='rgba(242,169,59,'+ra+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(pc[0],pc[1]-4,14+3*Math.sin(t*3),0,7);ctx.stroke();ctx.restore();label('A320neo, 37.57 m long',pc[0]+20,pc[1]-40,'#F2A93B',ra)}
    if(pNow>1.5&&pNow<2.6){var la=Math.max(0,1-Math.abs(pNow-2)*2.5)}
  }
  requestAnimationFrame(frameLoop);
})();
