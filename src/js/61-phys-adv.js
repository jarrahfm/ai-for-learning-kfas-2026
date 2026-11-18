// Dive 1 physics: "Advanced: zoom" tab. One log-scale camera from Foucault's 67 m pendulum to millimetres.
(function(){
  var cv=document.getElementById('pdzC');if(!cv)return;
  var cx=cv.getContext('2d'),sl=cv.closest('.slide'),pane=cv.closest('.pane');
  var $=function(id){return document.getElementById(id)};
  var G=9.80, D2R=Math.PI/180;                       // g as used in OpenStax UP1 ch.15
  var FL=67, FP={x:0,y:67.3}, FA=2.2/67;              // Foucault: 67 m wire (Pantheon, CMN)
  var CL=0.994, CP={x:5,y:1.98}, CA=12*D2R;           // seconds pendulum, 0.994 m (drawn at 12 deg so forces are visible)
  var FT=2*Math.PI*Math.sqrt(FL/G), CT=2*Math.PI*Math.sqrt(CL/G);
  var Y0=CP.y-CL;                                     // height of the clock bob centre at rest
  var phi=15*D2R, phiD=phi;
  function gapOf(a){return CL*(a-Math.sin(a));}
  var STOPS=[
    {w:150,c:function(){return {x:0,y:36}},term:'Period',k:'Foucault\u2019s pendulum, Panth\u00e9on, Paris',
     def:'<em>Period (T)</em>: the time to complete one oscillation.',
     fact:'1851: a <b>67 m</b> steel wire and a <b>28 kg</b> brass-and-lead sphere hung from the dome. T = 2\u03c0\u221a(L/g) gives <b>T \u2248 16.4 s</b>.',
     cite:'OpenStax UP1 \u00a715.1, \u00a715.4 \u00b7 paris-pantheon.fr'},
    {w:9.5,c:function(){return {x:2.4,y:1.6}},term:'Amplitude',k:'On the Panth\u00e9on floor',
     def:'<em>Amplitude (A)</em>: the maximum displacement from equilibrium.',
     fact:'Below about <b>15\u00b0</b> the period is nearly independent of amplitude: a bigger swing does not take longer.',
     cite:'OpenStax UP1 \u00a715.1, \u00a715.4'},
    {w:5.2,c:function(){return {x:5.3,y:1.3}},term:'Seconds pendulum',k:'A pendulum clock, to scale',
     def:'<em>Seconds pendulum</em>: period of exactly 2 s, one second each way, about <b>0.994 m</b> long.',
     fact:'<b>Frequency (f)</b>: oscillations per unit time, in hertz (Hz). Here f = 1/T = <b>0.5 Hz</b>.',
     cite:'Wikipedia: Seconds pendulum \u00b7 OpenStax UP1 \u00a715.1'},
    {w:1.1,c:function(){return {x:5,y:Y0}},term:'Restoring force',k:'Forces on the bob',
     def:'<em>Restoring force</em>: the net force <b>\u2212mg\u00b7sin\u03b8</b> that pulls the bob back toward equilibrium.',
     fact:'Weight mg points down, tension pulls along the rod. Only the part of mg along the arc, mg\u00b7sin\u03b8, is left over. It is zero at the bottom.',
     cite:'OpenStax UP1 \u00a715.4'},
    {w:function(){return Math.max(gapOf(phiD)*7,0.0032)},c:function(){return {x:CP.x+CL*(phiD+Math.sin(phiD))/2,y:Y0}},term:'Small-angle approximation',k:'Millimetres from the bob',
     def:'<em>sin\u03b8 \u2248 \u03b8</em>, with \u03b8 in radians. Below about 15\u00b0 they differ by under 1%.',
     fact:'Then the pendulum is in <b>simple harmonic motion</b>: net force proportional to displacement, opposite in direction.',
     cite:'OpenStax UP1 \u00a715.1, \u00a715.4 \u00b7 errors computed'}
  ];
  var N=STOPS.length;
  function sw(i){var w=STOPS[i].w;return typeof w==='function'?w():w}
  function su(i){return Math.log10(sw(i))}
  var U0=Math.log10(150), U1=Math.log10(0.0032);
  var u=U0, anim=null, playing=false, hold=0, cur=0, target=0, t=0, W=860, H=440, DPR=2;

  function center(uu){var w=Math.pow(10,uu);
    for(var i=0;i<N-1;i++){var wa=sw(i),wb=sw(i+1);if(w<=wa&&w>=wb){var f=(wa-w)/(wa-wb),a=STOPS[i].c(),b=STOPS[i+1].c();f=f*f*(3-2*f);return {x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};}}
    return w>sw(0)?STOPS[0].c():STOPS[N-1].c();}
  var cam={x:0,y:36,k:1};
  function S(x,y){return [W/2+(x-cam.x)*cam.k,(H-58)/2-(y-cam.y)*cam.k]}
  function ease(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
  function go(i){target=(i+N)%N;anim={from:u,i:target,t0:t,dur:Math.min(4.2,1.4+Math.abs(su(target)-u)*0.9)};hold=0;side(target);}

  function resize(){var r=cv.parentNode;W=r.offsetWidth||860;H=r.offsetHeight||440;cv.width=W*DPR;cv.height=H*DPR;}

  // ---------- drawing helpers ----------
  function rect(x0,y0,x1,y1,fill){var a=S(x0,y1),b=S(x1,y0);cx.fillStyle=fill;cx.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);}
  function lin(x0,y0,x1,y1,c0,c1){var a=S(x0,y0),b=S(x1,y1),g=cx.createLinearGradient(a[0],a[1],b[0],b[1]);g.addColorStop(0,c0);g.addColorStop(1,c1);return g}
  function arrow(x0,y0,x1,y1,col,lw,label,lx,ly){var a=S(x0,y0),b=S(x1,y1),dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);if(L<3)return;
    var ux=dx/L,uy=dy/L,h=Math.min(16,L*.45);cx.save();cx.strokeStyle=col;cx.fillStyle=col;cx.lineWidth=lw;cx.lineCap='round';cx.shadowColor=col;cx.shadowBlur=12;
    cx.beginPath();cx.moveTo(a[0],a[1]);cx.lineTo(b[0]-ux*h*.8,b[1]-uy*h*.8);cx.stroke();
    cx.beginPath();cx.moveTo(b[0],b[1]);cx.lineTo(b[0]-ux*h-uy*h*.55,b[1]-uy*h+ux*h*.55);cx.lineTo(b[0]-ux*h+uy*h*.55,b[1]-uy*h-ux*h*.55);cx.closePath();cx.fill();
    if(label){cx.shadowBlur=0;tag(label,b[0]+(lx||0),b[1]+(ly||0),col);}cx.restore();}
  function tag(txt,x,y,col,size){cx.save();cx.font='600 '+(size||16)+'px "IBM Plex Sans","Segoe UI",sans-serif';var w=cx.measureText(txt).width;
    cx.fillStyle='rgba(7,11,26,.78)';rr(x-6,y-14,w+12,24,7);cx.fill();cx.fillStyle=col||'#fff';cx.textBaseline='middle';cx.fillText(txt,x,y-2);cx.restore();}
  function rr(x,y,w,h,r){cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath();}
  function bob(x,y,r,minPx,alpha){var p=S(x,y),R=Math.max(r*cam.k,minPx);cx.save();cx.globalAlpha=alpha==null?1:alpha;
    var gl=cx.createRadialGradient(p[0],p[1],R*.2,p[0],p[1],R*3.2);gl.addColorStop(0,'rgba(242,169,59,.45)');gl.addColorStop(1,'rgba(242,169,59,0)');cx.fillStyle=gl;cx.beginPath();cx.arc(p[0],p[1],R*3.2,0,7);cx.fill();
    var g=cx.createRadialGradient(p[0]-R*.35,p[1]-R*.4,R*.08,p[0],p[1],R);g.addColorStop(0,'#FFF3C4');g.addColorStop(.35,'#E9B44C');g.addColorStop(.8,'#9A6416');g.addColorStop(1,'#5A3A0C');
    cx.fillStyle=g;cx.beginPath();cx.arc(p[0],p[1],R,0,7);cx.fill();cx.restore();return p;}

  function drawPantheon(){var k=cam.k;
    // floor (marble) with tiles
    rect(-60,-6,60,0,lin(0,0,0,-6,'#C9C2B4','#6E675C'));
    if(k*2>6){cx.fillStyle='rgba(60,52,40,.18)';for(var i=-30;i<30;i++){var a=S(i*2,0),b=S(i*2+2,-0.3);if(b[0]<0||a[0]>W)continue;if((i&1)===0)cx.fillRect(a[0],a[1],b[0]-a[0],Math.max(2,b[1]-a[1]));}}
    if(k>2500)return;
    var stone='#2A3157';
    // drum and dome
    rect(-19,27,19,52,lin(-19,0,19,0,'#1E2446','#2E3768'));
    var c=S(0,52),rx=19*k,ry=22*k;cx.save();cx.beginPath();cx.ellipse(c[0],c[1],rx,ry,0,Math.PI,2*Math.PI);cx.closePath();
    var dg=cx.createRadialGradient(c[0],c[1]-ry*.9,ry*.05,c[0],c[1],rx);dg.addColorStop(0,'#5966A8');dg.addColorStop(.6,'#2E3768');dg.addColorStop(1,'#1B2042');cx.fillStyle=dg;cx.fill();
    cx.strokeStyle='rgba(201,211,255,.35)';cx.lineWidth=Math.max(1,0.25*k);for(var j=1;j<6;j++){cx.beginPath();cx.ellipse(c[0],c[1],rx*j/6,ry,0,Math.PI,2*Math.PI);cx.stroke();}
    cx.restore();
    for(var wx=-15;wx<=15;wx+=6){rect(wx-1.2,33,wx+1.2,45,'rgba(143,160,240,.25)');}
    // light shaft from the dome
    var top=S(0,73),bot=S(0,0);cx.save();var sg=cx.createLinearGradient(0,top[1],0,bot[1]);sg.addColorStop(0,'rgba(255,226,160,.32)');sg.addColorStop(1,'rgba(255,226,160,0)');cx.fillStyle=sg;
    cx.beginPath();cx.moveTo(top[0]-2*k,top[1]);cx.lineTo(top[0]+2*k,top[1]);cx.lineTo(bot[0]+12*k,bot[1]);cx.lineTo(bot[0]-12*k,bot[1]);cx.closePath();cx.fill();cx.restore();
    // entablature and columns
    rect(-40,24,40,27.2,lin(0,27,0,24,'#4A5385','#2A3157'));
    for(var x=-38;x<=38;x+=5){if(Math.abs(x)<9)continue;rect(x-0.8,0,x+0.8,23.2,lin(x-0.8,0,x+0.8,0,'#3A4378','#596497'));rect(x-1.2,23.2,x+1.2,24,'#6A75A8');rect(x-1.1,0,x+1.1,0.6,'#6A75A8');}
    // pivot bracket
    rect(-0.6,67.3,0.6,68.2,'#C9D3FF');
  }
  function drawPerson(){var x=3.3,k=cam.k;if(k<3)return;cx.save();cx.fillStyle='#16304A';cx.strokeStyle='rgba(127,219,208,.8)';cx.lineWidth=Math.max(1,0.012*k);
    var h=S(x,1.58);cx.beginPath();cx.arc(h[0],h[1],0.11*k,0,7);cx.fill();cx.stroke();
    var a=S(x-0.2,1.45),b=S(x+0.2,0.85);rr(a[0],a[1],b[0]-a[0],b[1]-a[1],0.08*k);cx.fill();cx.stroke();
    var l1=S(x-0.17,0.88),l2=S(x+0.17,0);rr(l1[0],l1[1],(l2[0]-l1[0])*.44,l2[1]-l1[1],0.04*k);cx.fill();cx.stroke();rr(l1[0]+(l2[0]-l1[0])*.56,l1[1],(l2[0]-l1[0])*.44,l2[1]-l1[1],0.04*k);cx.fill();cx.stroke();cx.restore();}
  function drawClock(){var k=cam.k;if(k<6)return;
    var wood=lin(4.7,0,5.3,0,'#3B1D12','#7A3F22');
    rect(4.72,0,5.28,0.55,wood);rect(4.78,0.55,5.22,1.95,wood);rect(4.70,1.95,5.30,2.42,wood);rect(4.66,2.42,5.34,2.48,'#8A4A28');
    rect(4.84,0.66,5.16,1.90,'rgba(10,14,30,.92)');
    var g1=S(4.84,1.90),g2=S(5.16,0.66);cx.save();cx.strokeStyle='rgba(255,226,160,.55)';cx.lineWidth=Math.max(1,0.006*k);cx.strokeRect(g1[0],g1[1],g2[0]-g1[0],g2[1]-g1[1]);cx.restore();
    var d=S(5,2.19),R=0.15*k;cx.save();var dg=cx.createRadialGradient(d[0]-R*.3,d[1]-R*.3,R*.1,d[0],d[1],R);dg.addColorStop(0,'#FFFDF4');dg.addColorStop(1,'#D9CFB4');cx.fillStyle=dg;cx.beginPath();cx.arc(d[0],d[1],R,0,7);cx.fill();
    cx.strokeStyle='#1B1F3B';cx.lineWidth=Math.max(1,R*.03);for(var i=0;i<60;i++){var an=i/60*2*Math.PI,r0=i%5?R*.9:R*.8;cx.beginPath();cx.moveTo(d[0]+Math.sin(an)*r0,d[1]-Math.cos(an)*r0);cx.lineTo(d[0]+Math.sin(an)*R*.96,d[1]-Math.cos(an)*R*.96);cx.stroke();}
    var sec=Math.floor(t)%60,an2=sec/60*2*Math.PI;cx.strokeStyle='#C0392B';cx.lineWidth=Math.max(1,R*.025);cx.beginPath();cx.moveTo(d[0],d[1]);cx.lineTo(d[0]+Math.sin(an2)*R*.85,d[1]-Math.cos(an2)*R*.85);cx.stroke();
    cx.strokeStyle='#1B1F3B';cx.lineWidth=Math.max(1,R*.05);cx.beginPath();cx.moveTo(d[0],d[1]);cx.lineTo(d[0]+R*.45,d[1]-R*.3);cx.stroke();cx.restore();}
  function pend(P,L,th,rod,r,minPx,alpha){var bx=P.x+L*Math.sin(th),by=P.y-L*Math.cos(th),a=S(P.x,P.y),b=S(bx,by);
    cx.save();cx.globalAlpha=alpha==null?1:alpha;cx.strokeStyle=rod.c;cx.lineWidth=Math.max(rod.min,rod.w*cam.k);cx.beginPath();cx.moveTo(a[0],a[1]);cx.lineTo(b[0],b[1]);cx.stroke();cx.restore();
    bob(bx,by,r,minPx,alpha);return {x:bx,y:by};}
  function near(i){return Math.max(0,1-Math.abs(u-su(i))/0.32)}

  function frame(dt){
    t+=dt;phiD+=(phi-phiD)*Math.min(1,dt*5);
    if(anim){var f=Math.min(1,(t-anim.t0)/anim.dur),to=su(anim.i);u=anim.from+(to-anim.from)*ease(f);if(f>=1){anim=null;cur=target;}}
    else if(cur===N-1&&Math.abs(u-su(N-1))<0.5){u=su(N-1);}
    if(playing&&!anim){hold+=dt;if(hold>5)go(cur+1);}
    var w=Math.pow(10,u),c=center(u);cam.x=c.x;cam.y=c.y;cam.k=W/w;
    var ns=0,bd=9;for(var i=0;i<N;i++){var dd=Math.abs(u-su(i));if(dd<bd){bd=dd;ns=i;}}if(!anim&&ns!==shown)side(ns);
    if(!sliding)$('pdzZ').value=Math.round((u-U0)/(U1-U0)*1000);
    cx.setTransform(DPR,0,0,DPR,0,0);
    var bg=cx.createRadialGradient(W*.5,H*.2,20,W*.5,H*.5,W*.8);bg.addColorStop(0,'#1C2556');bg.addColorStop(1,'#060914');cx.fillStyle=bg;cx.fillRect(0,0,W,H);
    drawPantheon();drawPerson();drawClock();
    // Foucault pendulum at its real period
    var fth=FA*Math.cos(2*Math.PI*t/FT);
    var fb=pend(FP,FL,fth,{c:'rgba(230,236,255,.85)',w:0.0014,min:1},0.085,4);
    // clock pendulum at its real period
    var cth=CA*Math.cos(2*Math.PI*t/CT),fade=Math.max(0,Math.min(1,(Math.log10(0.25)-u)/0.25));
    var cb=pend(CP,CL,cth,{c:'#C9A15A',w:0.008,min:1},0.065,2,1-fade*.7);
    var a1=near(0);if(a1>0){cx.save();cx.globalAlpha=a1;var wm=S(0,40);tag('Foucault\u2019s pendulum: 67 m wire, 28 kg bob',wm[0]+14,wm[1],'#F2A93B',17);tag('one full swing: T \u2248 '+FT.toFixed(1)+' s',wm[0]+14,wm[1]+30,'#fff',16);tag('Panth\u00e9on, Paris (stylised)',S(-19,56)[0],S(-19,56)[1],'#C9D3FF',14);cx.restore();}
    // amplitude bracket on the floor
    var a2=near(1);if(a2>0){cx.save();cx.globalAlpha=a2;var ax=FL*Math.sin(FA),e=S(0,0.3),r=S(ax,0.3);cx.setLineDash([6,6]);cx.strokeStyle='rgba(255,255,255,.7)';cx.lineWidth=2;
      cx.beginPath();cx.moveTo(e[0],e[1]-60);cx.lineTo(e[0],e[1]+30);cx.moveTo(r[0],r[1]-60);cx.lineTo(r[0],r[1]+30);cx.stroke();cx.setLineDash([]);cx.restore();
      cx.save();cx.globalAlpha=a2;arrow(0,0.3,ax,0.3,'#7FDBD0',3);tag('amplitude A',(e[0]+r[0])/2-50,e[1]-74,'#7FDBD0',17);tag('equilibrium',e[0]-48,e[1]+48,'#fff',15);tag('visitor, for scale',S(3.3,1.9)[0]-60,S(3.3,1.9)[1]-8,'#C9D3FF',14);cx.restore();}
    // seconds pendulum length bracket
    var a3=near(2);if(a3>0){cx.save();cx.globalAlpha=a3;var p0=S(5.42,CP.y),p1=S(5.42,Y0);cx.strokeStyle='#F2A93B';cx.lineWidth=2.5;cx.beginPath();cx.moveTo(p0[0]-6,p0[1]);cx.lineTo(p0[0]+6,p0[1]);cx.moveTo(p0[0],p0[1]);cx.lineTo(p1[0],p1[1]);cx.moveTo(p1[0]-6,p1[1]);cx.lineTo(p1[0]+6,p1[1]);cx.stroke();
      tag('L \u2248 0.994 m',p0[0]+12,(p0[1]+p1[1])/2,'#F2A93B',17);tag('T = 2 s  \u00b7  f = 0.5 Hz',p0[0]+12,(p0[1]+p1[1])/2+30,'#fff',16);cx.restore();}
    // forces on the clock bob
    var a4=Math.max(near(3),u<su(3)?Math.max(0,1-fade*1.4):0);if(a4>0&&cam.k>300){cx.save();cx.globalAlpha=a4;var F=0.16,s=Math.sin(cth),co=Math.cos(cth);
      cx.save();cx.setLineDash([5,5]);arrow(cb.x,cb.y,cb.x+F*co*Math.sin(cth),cb.y-F*co*Math.cos(cth),'rgba(201,211,255,.8)',2);cx.restore();
      arrow(cb.x,cb.y,cb.x,cb.y-F,'#8FA0F0',4,'weight mg',10,6);
      arrow(cb.x,cb.y,cb.x-F*co*Math.sin(cth),cb.y+F*co*Math.cos(cth),'#7FDBD0',4,'tension',10,-6);
      arrow(cb.x,cb.y,cb.x-F*s*co,cb.y-F*s*s,'#F2A93B',5,'restoring  mg\u00b7sin\u03b8',s>0?-190:12,-24);
      var pb=S(cb.x,cb.y);tag('\u03b8 = '+(cth/D2R).toFixed(1)+'\u00b0',pb[0]+18,pb[1]+0.16*cam.k*.55,'#fff',16);cx.restore();}
    // small-angle construction: arc L*theta vs L*sin(theta)
    if(fade>0){cx.save();cx.globalAlpha=fade;var gx=CP.x+CL*Math.sin(phiD),gy=CP.y-CL*Math.cos(phiD),pv=S(CP.x,CP.y),gb=S(gx,gy);
      cx.setLineDash([8,6]);cx.strokeStyle='rgba(255,255,255,.6)';cx.lineWidth=2;cx.beginPath();cx.moveTo(pv[0],pv[1]);cx.lineTo(gb[0],gb[1]);cx.stroke();cx.setLineDash([]);
      cx.strokeStyle='#2BB3A3';cx.lineWidth=3;cx.beginPath();var st=60;for(var q=0;q<=st;q++){var aa=phiD*q/st,pp=S(CP.x+CL*Math.sin(aa),CP.y-CL*Math.cos(aa));q?cx.lineTo(pp[0],pp[1]):cx.moveTo(pp[0],pp[1]);}cx.stroke();
      var arcEnd=CP.x+CL*phiD,sinEnd=CP.x+CL*Math.sin(phiD),o=S(CP.x,Y0),e1=S(arcEnd,Y0),e2=S(sinEnd,Y0);
      cx.lineCap='butt';cx.shadowBlur=14;cx.shadowColor='#2BB3A3';cx.strokeStyle='#2BB3A3';cx.lineWidth=8;cx.beginPath();cx.moveTo(o[0],o[1]-12);cx.lineTo(e1[0],e1[1]-12);cx.stroke();
      cx.shadowColor='#F2A93B';cx.strokeStyle='#F2A93B';cx.beginPath();cx.moveTo(o[0],o[1]+12);cx.lineTo(e2[0],e2[1]+12);cx.stroke();cx.shadowBlur=0;
      cx.strokeStyle='#fff';cx.lineWidth=2;cx.beginPath();cx.moveTo(e1[0],e1[1]-40);cx.lineTo(e1[0],e1[1]+40);cx.moveTo(e2[0],e2[1]-40);cx.lineTo(e2[0],e2[1]+40);cx.stroke();
      var gap=gapOf(phiD),deg=Math.round(phiD/D2R);
      tag('arc  L\u03b8 = '+(CL*phiD*100).toFixed(2)+' cm',Math.min(e1[0]+10,W-230),e1[1]-46,'#7FDBD0',17);
      tag('L\u00b7sin\u03b8 = '+(CL*Math.sin(phiD)*100).toFixed(2)+' cm',Math.max(12,e2[0]-230),e2[1]+52,'#F2A93B',17);
      tag('gap at '+deg+'\u00b0 = '+(gap*1000).toFixed(gap<0.001?2:1)+' mm',Math.max(270,(e1[0]+e2[0])/2-90),e1[1]-92,'#fff',19);cx.restore();}
    // readout
    $('pdzRead').innerHTML='Foucault: L = 67 m, T = <b>'+FT.toFixed(1)+' s</b><br>clock: L = 0.994 m, T = <b>'+CT.toFixed(2)+' s</b><br>view width: <b>'+fmt(w)+'</b>';
    scale();
  }
  function fmt(m){return m>=1?(+m.toPrecision(3))+' m':m>=0.01?(+(m*100).toPrecision(3))+' cm':m>=0.001?(+(m*1000).toPrecision(3))+' mm':(+(m*1e6).toPrecision(3))+' \u00b5m'}
  function scale(){var raw=140/cam.k,n=Math.floor(Math.log10(raw)),m=raw/Math.pow(10,n),v=(m<2?1:m<5?2:5)*Math.pow(10,n);
    $('pdzBar').style.width=Math.round(v*cam.k)+'px';$('pdzBarL').textContent=fmt(v);}

  // ---------- side panel ----------
  var shown=-1;
  function err(d){var a=d*D2R;return (a-Math.sin(a))/Math.sin(a)*100}
  function side(i){shown=i;var s=STOPS[i];$('pdzK').textContent='Stop '+(i+1)+' of '+N;$('pdzTerm').textContent=s.term;
    $('pdzDef').innerHTML=s.def;$('pdzFact').innerHTML=s.fact;$('pdzCite').textContent=s.cite;
    $('pdzAng').classList.toggle('on',i===N-1);
    [].forEach.call($('pdzDots').children,function(b,j){b.classList.toggle('on',j===i)});}
  var dots=$('pdzDots');STOPS.forEach(function(s,i){var b=document.createElement('button');b.textContent=(i+1)+' '+s.term.split(' ')[0];b.title=s.term;b.onclick=function(){setPlay(false);go(i)};dots.appendChild(b);});
  [5,15,30].forEach(function(d){var b=document.createElement('button');b.innerHTML=d+'\u00b0<small>error '+err(d).toFixed(2)+'%</small>';b.dataset.d=d;if(d===15)b.className='on';
    b.onclick=function(){phi=d*D2R;[].forEach.call($('pdzAng').children,function(x){x.classList.toggle('on',x===b)});setPlay(false);if(cur!==N-1||anim)go(N-1);};$('pdzAng').appendChild(b);});
  function setPlay(p){playing=p;var b=$('pdzPlay');b.classList.toggle('on',p);b.innerHTML=p?'&#10073;&#10073; Pause':'&#9654; Play';hold=0;}
  $('pdzPlay').onclick=function(){setPlay(!playing);if(playing&&!anim)hold=4;};
  $('pdzNext').onclick=function(){setPlay(false);go((anim?target:cur)+1)};
  $('pdzPrev').onclick=function(){setPlay(false);go((anim?target:cur)-1)};
  var sliding=false,z=$('pdzZ');
  z.addEventListener('input',function(){sliding=true;setPlay(false);anim=null;u=U0+(U1-U0)*z.value/1000;var bd=9;for(var i=0;i<N;i++){var dd=Math.abs(u-su(i));if(dd<bd){bd=dd;cur=i;}}target=cur;});
  z.addEventListener('change',function(){sliding=false});
  $('pdzOpen').onclick=function(){$('pdzPrompt').classList.add('on')};
  $('pdzClose').onclick=function(){$('pdzPrompt').classList.remove('on')};
  $('pdzCopy').onclick=function(){var tx=$('pdzPText').textContent,b=this;function ok(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy'},1500)}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(tx).then(ok,fb);else fb();
    function fb(){var ta=document.createElement('textarea');ta.value=tx;document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}ta.remove();ok();}};
  side(0);
  document.addEventListener('pane',function(e){if(e.detail.dive==='pd'&&e.detail.pane==='adv'){resize();last=performance.now();}else if(e.detail.dive==='pd')setPlay(false);});
  // test hook: window.pdzGo(i) jumps straight to a stop
  window.pdzGo=function(i,d){if(d){phi=phiD=d*D2R;[].forEach.call($('pdzAng').children,function(x){x.classList.toggle('on',+x.dataset.d===d)});}anim=null;cur=target=i;u=su(i);side(i);};
  var last=performance.now();
  (function loop(now){var on=sl.classList.contains('on')&&pane.classList.contains('on');if(on){if(cv.width!==W*DPR||!W)resize();var dt=Math.min(0.05,((now||performance.now())-last)/1000);frame(dt);}last=now||performance.now();requestAnimationFrame(loop);})();
})();
