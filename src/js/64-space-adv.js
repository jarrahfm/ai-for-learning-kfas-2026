/* Dive 4 Space: Advanced "zoom to scale" tab. One camera, true scale, nine stops.
   Numbers: NASA JPL SSD tables, NASA Science facts pages, OpenStax Astronomy 2e ch. 3 (see Sources in the pane). */
(function(){
  var cv=document.getElementById('spzC');if(!cv)return;
  var sl=cv.closest('.slide'),pane=cv.closest('.pane'),ctx=cv.getContext('2d');
  var $=function(id){return document.getElementById(id);};
  var AU=149597870.7, C_KMS=299792.458, LMIN=C_KMS*60;           // JPL astrodynamic parameters
  var R_SUN=700000, R_MOON=1740, D_MOON=384400;                  // NASA Science Sun / Moon facts
  // name, equatorial radius km, period yr (JPL phys_par); a AU, e, L deg, long.peri deg (JPL approx_pos Table 1, J2000)
  var PL=[['Mercury',2440.53,0.2408467,0.38709927,0.20563593,252.25032350,77.45779628,'#c9c0b4'],
          ['Venus',6051.8,0.61519726,0.72333566,0.00677672,181.97909950,131.60246718,'#f0d49a'],
          ['Earth',6378.1366,1.0000174,1.00000261,0.01671123,100.46457166,102.93768193,'#5aa0ff'],
          ['Mars',3396.19,1.8808476,1.52371034,0.09339410,-4.55343205,-23.94362959,'#ff7045'],
          ['Jupiter',71492,11.862615,5.20288700,0.04838624,34.39644051,14.72847983,'#e3b27a'],
          ['Saturn',60268,29.447498,9.53667594,0.05386179,49.95424423,92.59887831,'#efd99a'],
          ['Uranus',25559,84.016846,19.18916464,0.04725744,313.23810451,170.95427630,'#93e3ea'],
          ['Neptune',24764,164.79132,30.06992276,0.00859048,-55.12002969,44.96476227,'#5d7dff']];
  var P=PL.map(function(p){return {n:p[0],r:p[1],T:p[2]*365.25,a:p[3]*AU,e:p[4],L:p[5]*Math.PI/180,w:p[6]*Math.PI/180,c:p[7]};});
  var EARTH=P[2],D=Math.PI/180;
  var OS='OpenStax Astronomy 2e',U1='https://openstax.org/books/astronomy-2e/pages/3-1-the-laws-of-planetary-motion',UK='https://openstax.org/books/astronomy-2e/pages/3-key-terms',
      JP='https://ssd.jpl.nasa.gov/planets/phys_par.html',JA='https://ssd.jpl.nasa.gov/planets/approx_pos.html',JC='https://ssd.jpl.nasa.gov/astro_par.html',
      NM='https://science.nasa.gov/moon/facts/',NS='https://science.nasa.gov/sun/facts/';
  function L(u,t){return '<a href="'+u+'" target="_blank" rel="noopener">'+t+'</a>';}
  // W = view width in km; f = focus ('e' Earth, 'm' Earth-Moon midpoint, 's' Sun); rate = simulated days per real second
  var ST=[
    {nm:'Earth, true size',W:36000,f:'e',rate:0.02,hl:'earthD',t:'Equatorial radius',
     d:'The distance from a planet\'s centre to its equator.',
     n:'Earth: <b>6,378 km</b>, so about <b>12,756 km</b> across.',c:L(JP,'NASA JPL, Planetary Physical Parameters')},
    {nm:'Earth and Moon',W:1.0e6,f:'m',rate:1.2,hl:'moon',t:'Ellipse',
     d:'A closed curve: from any point on it, the distances to two inside points (the foci) always add up to the same total.',
     n:'The Moon\'s path is an ellipse; its average distance is <b>384,400 km</b>, about <b>30 Earths</b> side by side.',c:L(UK,OS+', ch. 3 key terms')+' · '+L(NM,'NASA Moon Facts')},
    {nm:'The inner planets',W:3.4*AU,f:'s',rate:12,hl:'au',t:'Astronomical unit (AU)',
     d:'The average distance between Earth and the Sun.',
     n:'<b>1 AU = 149,597,870.7 km</b>, fixed exactly by the IAU in 2012. The Moon gap is only 0.0026 AU.',c:L(UK,OS+', ch. 3 key terms')+' · '+L(JC,'NASA JPL, Astrodynamic Parameters')},
    {nm:'Mercury\'s orbit',W:1.15*AU,f:'s',rate:6,hl:'merc',t:'Semimajor axis and eccentricity',
     d:'Semimajor axis (a): half the widest diameter of the ellipse. Eccentricity (e): distance between the foci divided by the major axis.',
     n:'Mercury: <b>a = 0.387 AU</b>, <b>e = 0.206</b>, the most stretched of the eight planet orbits. The Sun sits at one focus.',c:L(U1,OS+', §3.1')+' · '+L(JA,'NASA JPL, Table 1')},
    {nm:'Mars: near and far',W:4.0*AU,f:'s',rate:14,hl:'mars',t:'Perihelion and aphelion',
     d:'Perihelion: the point in an orbit nearest the Sun. Aphelion: the point farthest from the Sun.',
     n:'Mars: perihelion <b>1.38 AU</b>, aphelion <b>1.67 AU</b>, from a(1 &minus; e) and a(1 + e). Earth: 0.983 and 1.017 AU.',c:L(UK,OS+', ch. 3 key terms')+' · computed from '+L(JA,'NASA JPL a, e')},
    {nm:'Sunlight on its way',W:2.6*AU,f:'s',rate:3,hl:'light',t:'Light-minute',
     d:'The distance light travels in one minute: 299,792.458 km/s &times; 60 s.',
     n:'1 light-minute = <b>17,987,547 km</b>. Sunlight needs <b>499 s = 8.3 minutes</b> to cross 1 AU.',c:L(JC,'NASA JPL, Astrodynamic Parameters (c, au/c)')},
    {nm:'Out to Jupiter',W:13*AU,f:'s',rate:160,hl:'jup',t:'Orbital period (P)',
     d:'The time it takes a planet to travel once around the Sun.',
     n:'Jupiter: <b>P = 11.86 Earth years</b>, at a = 5.20 AU. Watch it crawl while the inner planets race.',c:L(U1,OS+', §3.1')+' · '+L(JP,'NASA JPL')},
    {nm:'The outer planets',W:66*AU,f:'s',rate:9000,hl:'nep',t:'Kepler\'s third law',
     d:'The square of a planet\'s orbital period is proportional to the cube of its semimajor axis. In years and AU: P&sup2; = a&sup3;.',
     n:'Neptune: a = 30.07 AU, &radic;(30.07&sup3;) = <b>164.9 yr</b>; measured <b>164.79 yr</b>. Jupiter: &radic;(5.203&sup3;) = 11.87 vs 11.86.',c:L(U1,OS+', §3.1')+' · '+L(JP,'NASA JPL')+', '+L(JA,'Table 1')},
    {nm:'The Sun, true size',W:3.7e6,f:'s',rate:0.3,hl:'sun',t:'The Sun\'s radius',
     d:'The Sun is a medium-sized star; its radius is about 700,000 km.',
     n:'Diameter about <b>1.4 million km</b>: roughly <b>110 Earths</b> across (1,400,000 &divide; 12,756). Earth is the dot beside it.',c:L(NS,'NASA Science, Sun Facts')+' · '+L(JP,'NASA JPL')}];
  var N=ST.length;
  // time: days since J2000 (2000-01-01 12:00 TT ~ UTC); start at today
  var t0=(Date.now()-Date.UTC(2000,0,1,12))/864e5, tSim=t0;
  function kep(M,e){var E=M;for(var i=0;i<6;i++)E=E-(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));return E;}
  function pos(p,t){var M=p.L-p.w+2*Math.PI*t/p.T,E=kep(((M%(2*Math.PI))+2*Math.PI)%(2*Math.PI),p.e);
    var x=p.a*(Math.cos(E)-p.e),y=p.a*Math.sqrt(1-p.e*p.e)*Math.sin(E);return [x*Math.cos(p.w)-y*Math.sin(p.w),x*Math.sin(p.w)+y*Math.cos(p.w)];}
  function moonPos(t){var e=pos(EARTH,t),ang=2*Math.PI*t/27.32+1.2;return [e[0]+D_MOON*Math.cos(ang),e[1]+D_MOON*Math.sin(ang)];}
  function focus(f,t){if(f==='s')return [0,0];var e=pos(EARTH,t);if(f==='e')return e;var m=moonPos(t);return [(e[0]+m[0])/2,(e[1]+m[1])/2];}
  // camera along journey s in [0, N-1]
  function cam(s,t){var i=Math.min(N-2,Math.floor(s)),u=s-i,A=ST[i],B=ST[i+1];
    var lw=Math.log(A.W)+(Math.log(B.W)-Math.log(A.W))*u,W=Math.exp(lw);
    var fa=focus(A.f,t),fb=focus(B.f,t),k=(A.W===B.W)?u:Math.max(0,Math.min(1,(W-A.W)/(B.W-A.W)));
    var rate=Math.exp(Math.log(A.rate)+(Math.log(B.rate)-Math.log(A.rate))*u);
    return {W:W,cx:fa[0]+(fb[0]-fa[0])*k,cy:fa[1]+(fb[1]-fa[1])*k,rate:rate};}
  var dpr=1,w=0,h=0,imgE=new Image(),imgM=new Image(),stars=[],ready=false;
  function init(){if(ready)return;var r=cv.getBoundingClientRect();if(!r.width)return;
    dpr=Math.min(2,window.devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;
    if(window.IMGS){imgE.src=IMGS.earth||'';imgM.src=IMGS.moon||'';}
    var seed=7;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647;}
    for(var i=0;i<420;i++)stars.push({x:rnd(),y:rnd(),z:0.2+rnd()*0.8,m:rnd(),c:rnd()});ready=true;}
  // state
  var s=0,target=0,from=0,tA=0,tDur=0,playing=false,dwell=0,shownStop=-1,lightT=0;
  function ease(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
  function goTo(k,dur){k=Math.max(0,Math.min(N-1,k));from=s;target=k;tA=0;tDur=dur||Math.max(1.6,Math.abs(k-s)*2.6);}
  function nearest(){return Math.round(s);}
  function fmt(n,d){return n.toLocaleString('en-US',{maximumFractionDigits:d||0,minimumFractionDigits:d||0});}
  function nice(x){var p=Math.pow(10,Math.floor(Math.log10(x))),m=x/p;return (m>=5?5:m>=2?2:1)*p;}
  function scaleBar(kpp){var want=150*kpp,lab,sub,km;
    if(want<1e4){km=nice(want);lab=fmt(km)+' km';sub='';}
    else if(want<3e7){var v=nice(want/1e3);km=v*1e3;lab=fmt(v)+' thousand km';sub=km>=1e6?'= '+fmt(km/1e6,1)+' million km':'';}
    else if(want<6*AU){var a=nice(want/AU);km=a*AU;lab=(a<1?a.toFixed(1):fmt(a))+' AU';sub='= '+fmt(km/LMIN,1)+' light-minutes';}
    else{var lm=nice(want/LMIN);km=lm*LMIN;lab=fmt(lm)+' light-minutes';sub='= '+fmt(km/AU,1)+' AU';}
    return {px:km/kpp,lab:lab,sub:sub};}
  function txt(t,x,y,col,sz,al){ctx.font='600 '+(sz||15)+'px "IBM Plex Sans","Segoe UI",sans-serif';ctx.textAlign=al||'left';ctx.lineWidth=4;ctx.strokeStyle='rgba(3,5,13,.85)';ctx.strokeText(t,x,y);ctx.fillStyle=col||'#fff';ctx.fillText(t,x,y);}
  function glow(x,y,r,col,a){var g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=a;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.globalAlpha=1;}
  function dim(x1,y1,x2,y2,label,col,off){ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);
    [[x1,y1],[x2,y2]].forEach(function(p){ctx.beginPath();ctx.arc(p[0],p[1],3,0,7);ctx.fill();});ctx.restore();txt(label,(x1+x2)/2,(y1+y2)/2+(off||-10),col,15,'center');}
  function weight(k){return Math.max(0,1-Math.abs(s-k)*1.6);}   // how much stop k's annotations show
  function frame(dt,now){
    // journey
    if(tDur>0){tA+=dt;var x=Math.min(1,tA/tDur);s=from+(target-from)*ease(x);if(x>=1){tDur=0;s=target;dwell=0;}}
    else if(playing){dwell+=dt;if(dwell>4.5){if(s<N-1-1e-6)goTo(Math.floor(s+1e-6)+1,3.6);else{playing=false;setPlay();}}}
    var c0=cam(s,tSim);tSim+=c0.rate*dt;var c=cam(s,tSim),kpp=c.W/w;
    function X(km){return w/2+(km-c.cx)/kpp;}function Y(km){return h/2-(km-c.cy)/kpp;}
    ctx.setTransform(dpr,0,0,dpr,0,0);
    var bg=ctx.createRadialGradient(w*.5,h*.45,10,w*.5,h*.5,w*.75);bg.addColorStop(0,'#101a46');bg.addColorStop(.55,'#070b1e');bg.addColorStop(1,'#020309');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    // nebula wash, drifts with zoom
    var lz=Math.log(c.W);for(var q=0;q<3;q++){var nx=w*(0.2+0.3*q)+Math.sin(lz*0.7+q*2)*80,ny=h*(0.3+0.2*(q%2))+Math.cos(lz*0.5+q)*40;glow(nx,ny,260,['rgba(61,86,214,.55)','rgba(43,179,163,.45)','rgba(150,70,200,.4)'][q],0.22);}
    // stars: parallax with log zoom
    stars.forEach(function(st){var zz=st.z*(lz*0.18),sx=((st.x+zz*0.03)%1+1)%1*w,sy=((st.y+zz*0.02)%1+1)%1*h;var tw=0.55+0.45*Math.sin(now*0.0017*(0.5+st.m)+st.x*40);
      ctx.globalAlpha=(0.25+0.6*st.z)*tw;ctx.fillStyle=st.c>.85?'#ffd9a0':st.c>.7?'#b8c8ff':'#fff';ctx.fillRect(sx,sy,st.z*1.6,st.z*1.6);});ctx.globalAlpha=1;
    var sx0=X(0),sy0=Y(0),rSun=R_SUN/kpp;
    // light-minute rings
    var wl=weight(5);if(wl>0){lightT=(lightT+dt*1.6)%12;ctx.save();for(var m=1;m<=12;m++){var rr=m*LMIN/kpp;ctx.globalAlpha=wl*(m%4===0?0.45:0.16);ctx.strokeStyle='#ffd27a';ctx.lineWidth=1;ctx.beginPath();ctx.arc(sx0,sy0,rr,0,7);ctx.stroke();}
      var pr=lightT*LMIN/kpp;ctx.globalAlpha=wl*0.9;ctx.lineWidth=3;ctx.strokeStyle='#ffe9a8';ctx.shadowColor='#ffcc66';ctx.shadowBlur=16;ctx.beginPath();ctx.arc(sx0,sy0,pr,0,7);ctx.stroke();ctx.restore();
      txt('light pulse: '+lightT.toFixed(1)+' min after leaving the Sun',sx0,sy0-pr-10,'rgba(255,233,168,'+wl+')',15,'center');}
    // orbits
    P.forEach(function(p,i){var hi=(i===0&&weight(3))||(i===3&&weight(4))||(i===4&&weight(6))||(i===7&&weight(7))||0;var ap=p.a/kpp;if(ap<4||ap>w*30)return;
      ctx.beginPath();for(var k=0;k<=180;k++){var nu=k/180*2*Math.PI,r=p.a*(1-p.e*p.e)/(1+p.e*Math.cos(nu)),th=nu+p.w;var px=X(r*Math.cos(th)),py=Y(r*Math.sin(th));k?ctx.lineTo(px,py):ctx.moveTo(px,py);}
      ctx.strokeStyle=hi?'rgba(242,169,59,'+(0.35+0.65*hi)+')':'rgba(143,160,240,.38)';ctx.lineWidth=1+2*hi;ctx.stroke();});
    // Sun
    var sr=Math.max(rSun,2.2);glow(sx0,sy0,Math.max(sr*2.6,26),'rgba(255,190,90,.9)',Math.min(1,0.5+rSun/200));
    if(rSun>6){var g=ctx.createRadialGradient(sx0-rSun*.15,sy0-rSun*.15,rSun*.05,sx0,sy0,rSun);g.addColorStop(0,'#fffbe6');g.addColorStop(.55,'#ffd36b');g.addColorStop(.88,'#ff9a2e');g.addColorStop(1,'#e2581a');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx0,sy0,rSun,0,7);ctx.fill();
      ctx.save();ctx.beginPath();ctx.arc(sx0,sy0,rSun,0,7);ctx.clip();ctx.globalAlpha=0.16;for(var gq=0;gq<60;gq++){var an=gq*2.4+now*0.00005*(gq%3+1),rd=rSun*Math.sqrt((gq*0.618)%1);ctx.fillStyle=gq%2?'#fff3c0':'#c8501a';ctx.beginPath();ctx.arc(sx0+Math.cos(an)*rd,sy0+Math.sin(an)*rd,rSun*0.09,0,7);ctx.fill();}ctx.restore();}
    else{ctx.fillStyle='#fff3c4';ctx.beginPath();ctx.arc(sx0,sy0,sr,0,7);ctx.fill();}
    if(rSun<60&&sx0>-50&&sx0<w+50&&sy0>-50&&sy0<h+50)txt('Sun',sx0+10,sy0-12,'#ffd27a',15);
    // planets
    var ps=P.map(function(p){return pos(p,tSim);});
    P.forEach(function(p,i){var q=ps[i],px=X(q[0]),py=Y(q[1]),rp=p.r/kpp;if(px<-200||px>w+200||py<-200||py>h+200)return;
      if(i===2&&rp>=3&&imgE.complete&&imgE.naturalWidth){glow(px,py,rp*1.25,'rgba(90,160,255,.7)',0.6);ctx.save();ctx.beginPath();ctx.arc(px,py,rp,0,7);ctx.clip();var sc=rp/572;ctx.drawImage(imgE,px-638*sc,py-637*sc,1280*sc,1280*sc);
        var sh=ctx.createLinearGradient(px-rp,py,px+rp,py);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(.75,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,10,.35)');ctx.fillStyle=sh;ctx.fillRect(px-rp,py-rp,2*rp,2*rp);ctx.restore();}
      else if(rp>=3){var gp=ctx.createRadialGradient(px-rp*.3,py-rp*.3,rp*.1,px,py,rp);gp.addColorStop(0,'#fff');gp.addColorStop(.25,p.c);gp.addColorStop(1,'#111');ctx.fillStyle=gp;ctx.beginPath();ctx.arc(px,py,rp,0,7);ctx.fill();}
      else{glow(px,py,9,p.c,0.7);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(px,py,2.6,0,7);ctx.fill();}
      var big=c.W>2.2*AU||i>3;if((c.W>0.6*AU)&&(i<4||c.W>8*AU))txt(p.n,px+(rp>3?rp+6:8),py-8,p.c,14);});
    // Moon
    var mq=moonPos(tSim),mx=X(mq[0]),my=Y(mq[1]),rm=R_MOON/kpp,eq=ps[2],ex=X(eq[0]),ey=Y(eq[1]),re=EARTH.r/kpp;
    if(c.W<2.5e7&&mx>-100&&mx<w+100){ctx.strokeStyle='rgba(200,210,255,.22)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(ex,ey,D_MOON/kpp,0,7);ctx.stroke();
      if(rm>=3&&imgM.complete&&imgM.naturalWidth){ctx.save();ctx.beginPath();ctx.arc(mx,my,rm,0,7);ctx.clip();var sm=rm/456;ctx.drawImage(imgM,mx-480*sm,my-497*sm,960*sm,960*sm);ctx.restore();}
      else{glow(mx,my,7,'#dfe3ee',0.6);ctx.fillStyle='#e8e8ee';ctx.beginPath();ctx.arc(mx,my,Math.max(rm,1.8),0,7);ctx.fill();}
      if(c.W>2e5)txt('Moon',mx+8,my-8,'#e8e8ee',14);if(c.W>2e5&&c.W<1e7)txt('Earth',ex+Math.max(re,3)+6,ey+18,'#8fc0ff',14);}
    // stop annotations
    var a;
    if((a=weight(0))>0){ctx.globalAlpha=a;dim(ex-re,ey+re+24,ex+re,ey+re+24,'12,756 km across','#7FDBD0',22);ctx.globalAlpha=1;}
    if((a=weight(1))>0){ctx.globalAlpha=a;dim(ex,ey,mx,my,'384,400 km (average)','#F2A93B');ctx.globalAlpha=1;}
    if((a=weight(2))>0){ctx.globalAlpha=a;dim(sx0,sy0,ex,ey,'1 AU','#F2A93B');ctx.globalAlpha=1;}
    if((a=weight(3))>0){var M0=P[0],qd=M0.a*(1-M0.e),Qd=M0.a*(1+M0.e),cw=Math.cos(M0.w),sw=Math.sin(M0.w);
      var pX=X(qd*cw),pY=Y(qd*sw),aX=X(-Qd*cw),aY=Y(-Qd*sw),cX=X(-M0.a*M0.e*cw),cY=Y(-M0.a*M0.e*sw),f2X=X(-2*M0.a*M0.e*cw),f2Y=Y(-2*M0.a*M0.e*sw);
      ctx.globalAlpha=a;dim(cX,cY,aX,aY,'a = 0.387 AU','#F2A93B',-12);ctx.strokeStyle='rgba(255,255,255,.5)';ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(pX,pY);ctx.lineTo(cX,cY);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#7FDBD0';ctx.beginPath();ctx.arc(f2X,f2Y,4,0,7);ctx.fill();txt('empty focus',f2X,f2Y+22,'#7FDBD0',14,'center');txt('Sun = focus',sx0,sy0+24,'#ffd27a',14,'center');txt('e = 0.206',cX,cY+40,'#fff',16,'center');ctx.globalAlpha=1;}
    if((a=weight(4))>0){var M3=P[3],q3=M3.a*(1-M3.e),Q3=M3.a*(1+M3.e),c3=Math.cos(M3.w),s3=Math.sin(M3.w);ctx.globalAlpha=a;
      var p3x=X(q3*c3),p3y=Y(q3*s3),a3x=X(-Q3*c3),a3y=Y(-Q3*s3);dim(sx0,sy0,p3x,p3y,'','#7FDBD0');dim(sx0,sy0,a3x,a3y,'','#F2A93B');
      ctx.fillStyle='#7FDBD0';ctx.beginPath();ctx.arc(p3x,p3y,5,0,7);ctx.fill();ctx.fillStyle='#F2A93B';ctx.beginPath();ctx.arc(a3x,a3y,5,0,7);ctx.fill();
      txt('perihelion 1.38 AU',p3x+(p3x>sx0?10:-10),p3y+24,'#7FDBD0',15,p3x>sx0?'left':'right');txt('aphelion 1.67 AU',a3x+(a3x>sx0?10:-10),a3y-14,'#F2A93B',15,a3x>sx0?'left':'right');ctx.globalAlpha=1;}
    if((a=weight(5))>0){ctx.globalAlpha=a;txt('8.3 light-minutes',ex,ey+26,'#ffe9a8',15,'center');ctx.globalAlpha=1;}
    if((a=weight(6))>0){var jq=ps[4];ctx.globalAlpha=a;txt('P = 11.86 years',X(jq[0]),Y(jq[1])+24,'#F2A93B',16,'center');ctx.globalAlpha=1;}
    if((a=weight(7))>0){var nq=ps[7];ctx.globalAlpha=a;txt('P\u00b2 = a\u00b3:  30.07 AU \u2192 164.9 yr',X(nq[0]),Y(nq[1])+24,'#F2A93B',16,'center');ctx.globalAlpha=1;}
    if((a=weight(8))>0){ctx.globalAlpha=a;var bx=sx0+rSun*1.22,by=sy0,br=EARTH.r/kpp;ctx.fillStyle='#5aa0ff';ctx.beginPath();ctx.arc(bx,by,Math.max(br,1.6),0,7);ctx.fill();
      ctx.strokeStyle='rgba(127,219,208,.9)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(bx,by,9+3*Math.sin(now*0.004),0,7);ctx.stroke();txt('Earth, same scale',bx+16,by+5,'#9cd0ff',15);
      dim(sx0-rSun,sy0+rSun+22,sx0+rSun,sy0+rSun+22,'1.4 million km','#F2A93B',-10);ctx.globalAlpha=1;}
    // scale bar (top right)
    var sb=scaleBar(kpp),x1=w-18,x0=x1-sb.px,yb=30;ctx.fillStyle='rgba(3,5,13,.55)';ctx.fillRect(x0-12,yb-22,sb.px+24,sb.sub?58:42);
    ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x0,yb-6);ctx.lineTo(x0,yb+6);ctx.moveTo(x0,yb);ctx.lineTo(x1,yb);ctx.moveTo(x1,yb-6);ctx.lineTo(x1,yb+6);ctx.stroke();
    txt(sb.lab,(x0+x1)/2,yb+22,'#fff',15,'center');if(sb.sub)txt(sb.sub,(x0+x1)/2,yb+40,'#B8C3EE',14,'center');
    // readout + side panel
    var Wtxt=c.W<1e6?fmt(c.W/1e3)+' thousand km':c.W<0.3*AU?fmt(c.W/1e6,1)+' million km':fmt(c.W/AU,1)+' AU';
    var ry=(tSim-t0)/365.25;$('spzRead').innerHTML='view width <b>'+Wtxt+'</b><br>1 s = <b>'+(c.rate<1?fmt(c.rate*24,0)+' hours':c.rate<730?fmt(c.rate,0)+' days':fmt(c.rate/365.25,0)+' years')+'</b> · elapsed '+(ry<1?fmt(ry*365.25,0)+' days':fmt(ry,1)+' yr');
    var k=nearest();if(k!==shownStop){shownStop=k;var S=ST[k];$('spzChip').textContent=(k+1)+' / '+N+'  '+S.nm;$('spzK').textContent='Stop '+(k+1)+' of '+N+' \u00b7 '+S.nm;$('spzT').textContent=S.t;$('spzD').innerHTML=S.d;$('spzN').innerHTML=S.n;$('spzCi').innerHTML='Source: '+S.c;}
    if(document.activeElement!==$('spzZ'))$('spzZ').value=Math.round(s/(N-1)*800);
  }
  function setPlay(){var b=$('spzGo');b.innerHTML=playing?'&#10074;&#10074; Pause':'&#9654; Play';b.classList.toggle('hint',!playing);}
  $('spzGo').addEventListener('click',function(){playing=!playing;if(playing&&s>=N-1-1e-6){goTo(0,4);}dwell=4.5;setPlay();});
  $('spzNext').addEventListener('click',function(){goTo(Math.floor(s+1e-6)+1);});
  $('spzPrev').addEventListener('click',function(){goTo(Math.ceil(s-1e-6)-1);});
  $('spzZ').addEventListener('input',function(){tDur=0;playing=false;setPlay();s=this.value/800*(N-1);});
  sl.querySelectorAll('.spz-tog').forEach(function(b){b.addEventListener('click',function(){var o=$(b.dataset.o),on=!o.classList.contains('on');sl.querySelectorAll('.spz-over').forEach(function(x){x.classList.remove('on');});sl.querySelectorAll('.spz-tog').forEach(function(x){x.classList.remove('on');});if(on){o.classList.add('on');b.classList.add('on');}});});
  sl.querySelectorAll('.spz-x').forEach(function(b){b.addEventListener('click',function(){$(b.dataset.x).classList.remove('on');sl.querySelectorAll('.spz-tog').forEach(function(x){x.classList.remove('on');});});});
  $('spzCopy').addEventListener('click',function(){var t=$('spzPre').textContent,btn=this;function ok(){btn.textContent='Copied';setTimeout(function(){btn.textContent='Copy prompt';},1500);}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,function(){fb();});else fb();
    function fb(){var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}ta.remove();ok();}});
  setPlay();
  document.addEventListener('pane',function(e){if(e.detail.dive==='sp'){if(e.detail.pane==='adv')init();else{playing=false;setPlay();}}});
  var last=0;(function loop(now){requestAnimationFrame(loop);var dt=Math.min(0.05,(now-last)/1000||0);last=now;
    if(!sl.classList.contains('on')||!pane.classList.contains('on'))return;if(!ready){init();if(!ready)return;}frame(dt,now);})(0);
  window.__spz={go:function(k){goTo(k,0.01);},get s(){return s;}};
})();
