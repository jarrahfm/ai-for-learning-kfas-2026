/* Dive 3 biology: Advanced zoom tab. One log-scale camera from the agar plate to the Gram-negative envelope. */
(function(){
  var cv=document.getElementById('bzC');if(!cv)return;
  var cx=cv.getContext('2d'),pane=cv.closest('.pane'),slide=cv.closest('.slide');
  var W=764,H=440,DPR=2;
  var OS33='https://openstax.org/books/microbiology/pages/3-3-unique-characteristics-of-prokaryotic-cells',
      OS91='https://openstax.org/books/microbiology/pages/9-1-how-microbes-grow',
      BIO42='https://openstax.org/books/biology-2e/pages/4-2-prokaryotic-cells',
      BN='https://book.bionumbers.org/how-big-is-an-e-coli-cell-and-what-is-its-mass/';
  /* ---------- world (metres); dish centred at 0,0 ---------- */
  var DISH=0.045,C={x:0.012,y:-0.006},R=1.4e-3;
  function rTh(t){return R*(1+0.04*Math.sin(5*t+1)+0.022*Math.sin(13*t+2)+0.01*Math.sin(29*t))}
  var E={x:C.x+rTh(0),y:C.y},F={x:E.x-9e-6,y:E.y},D={x:F.x-1.6e-6,y:F.y+3.4e-6};
  function hash(i,j,k){var h=Math.sin(i*127.1+j*311.7+(k||0)*74.7)*43758.5453;return h-Math.floor(h)}
  /* stops: w = field of view (m), c = centre */
  var NM=1e-9;
  function fl(x,y){return {x:F.x+x*NM,y:F.y+y*NM}}
  var FLB={x:500+500*Math.cos(-0.52),y:500*Math.sin(-0.52)};
  var S=[
   {w:0.2,c:{x:0,y:0},n:'Petri dish',t:'Closed (batch) culture',
    d:'\u201CMicroorganisms grown in closed culture (also known as a batch culture), in which no nutrients are added and most waste is not removed, follow a reproducible growth pattern referred to as the growth curve.\u201D',
    k:'',src:'OpenStax Microbiology, 9.1',u:OS91},
   {w:6e-3,c:C,n:'One colony',t:'Log (exponential) phase',
    d:'In the log phase \u201Cthe cells are actively dividing by binary fission and their number increases exponentially.\u201D A colony is that growth piled up in one spot.',
    k:'',src:'OpenStax Microbiology, 9.1',u:OS91},
   {w:45e-6,c:{x:E.x-15e-6,y:E.y},n:'Colony edge',t:'Prokaryotic cell size',
    d:'\u201CAt 0.1 to 5.0 \u00B5m in diameter, prokaryotic cells are significantly smaller than eukaryotic cells.\u201D Here every capsule is one cell.',
    k:'Eukaryotic cells: 10 to 100 \u00B5m',src:'OpenStax Biology 2e, 4.2',u:BIO42},
   {w:9e-6,c:{x:D.x,y:D.y},n:'Binary fission',t:'Binary fission',fis:1,
    d:'\u201CThe center of the enlarged cell constricts until two daughter cells are formed, each offspring receiving a complete copy of the parental genome.\u201D It is directed by a protein called FtsZ.',
    k:'E. coli can double in as little as 20 minutes (optimal lab conditions)',src:'OpenStax Microbiology, 9.1',u:OS91},
   {w:4.4e-6,c:F,n:'One E. coli cell',t:'Escherichia coli, one cell',
    d:'A rule of thumb for E. coli: \u201Ca diameter of about \u22481 \u00B5m, a length of \u22482 \u00B5m, and a volume of \u22481 \u00B5m\u00B3.\u201D Its mass is about 1 pg.',
    k:'Flagella over the whole surface = peritrichous (OpenStax 3.3)',src:'Milo & Phillips, Cell Biology by the Numbers',u:BN},
   {w:0.62e-6,c:fl(FLB.x+150,FLB.y-70),n:'Flagellum',t:'Flagellum: basal body, hook, filament',
    d:'Flagella are \u201Cstiff spiral filaments composed of flagellin protein subunits\u201D that spin. \u201CThe basal body is the motor for the flagellum and is embedded in the plasma membrane.\u201D A hook connects it to the filament.',
    k:'',src:'OpenStax Microbiology, 3.3',u:OS33},
   {w:1.5e-6,c:fl(180,-620),n:'Fimbriae and pili',t:'Fimbriae and pili',
    d:'Fimbriae: \u201Cshort bristle-like proteins projecting from the cell surface by the hundreds\u201D; they attach cells to surfaces. Pili: \u201Clonger, less numerous protein appendages.\u201D',
    k:'F pilus (sex pilus): transfers DNA between cells',src:'OpenStax Microbiology, 3.3',u:OS33},
   {w:2.5e-6,c:fl(0,0),n:'Nucleoid and plasmids',t:'Nucleoid, plasmid, cytoplasm',
    d:'\u201CProkaryotic DNA and DNA-associated proteins are concentrated within the nucleoid region.\u201D Plasmids are \u201Csmall, circular, double-stranded DNA molecules.\u201D Cytoplasm: \u201Ca gel-like substance.\u201D',
    k:'',src:'OpenStax Microbiology, 3.3',u:OS33},
   {w:0.24e-6,c:fl(220,-330),n:'70S ribosomes',t:'Ribosomes (70S)',
    d:'\u201CProkaryotic ribosomes (70S) are composed of two subunits: the 30S (small subunit) and the 50S (large subunit)\u201D, made of protein and rRNA. S is the Svedberg unit of sedimentation.',
    k:'Eukaryotic cytoplasmic ribosomes: 80S',src:'OpenStax Microbiology, 3.3',u:OS33},
   {w:0.09e-6,c:fl(260,-485),n:'Gram-negative envelope',t:'Gram-negative cell envelope',
    d:'Outer membrane: \u201Ca second lipid bilayer\u201D outside the peptidoglycan; its outer leaflet holds LPS. Peptidoglycan (murein) is the major cell-wall component. The plasma membrane is selectively permeable.',
    k:'Gram-negative peptidoglycan: no more than about 4 nm thick',src:'OpenStax Microbiology, 3.3',u:OS33}
  ];
  var N=S.length;
  /* ---------- camera as function of path p in [0,N-1] ---------- */
  var cam={x:0,y:0,w:0.2,ppm:1};
  function camAt(p){var i=Math.min(N-2,Math.max(0,Math.floor(p))),f=p-i,a=S[i],b=S[i+1];
    var lw=Math.log(a.w)+(Math.log(b.w)-Math.log(a.w))*f,w=Math.exp(lw),g=Math.abs(a.w-b.w)<1e-15?f:(a.w-w)/(a.w-b.w);
    return {x:a.c.x+(b.c.x-a.c.x)*g,y:a.c.y+(b.c.y-a.c.y)*g,w:w};}
  function sx(x){return (x-cam.x)*cam.ppm+W/2}function sy(y){return (y-cam.y)*cam.ppm+H/2}
  function sm(a,b,x){x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)}
  /* ---------- precomputed geometry (focal cell, nm) ---------- */
  var DNA=[],PLS=[[-760,190,46],[680,-250,40],[-380,-300,36],[760,240,42]],RIB=[],FLA=[],FIM=[],PIL=[];
  (function(){var x=-500,y=0,a=0;for(var i=0;i<900;i++){a+=(hash(i,1)-.5)*1.4;x+=Math.cos(a)*22;y+=Math.sin(a)*22;var ex=(x+80)/620,ey=y/270;if(ex*ex+ey*ey>1){a+=Math.PI*0.7;x=Math.max(-680,Math.min(520,x));y=Math.max(-260,Math.min(260,y));}DNA.push([x,y]);}
    for(var j=0;j<1100;j++){var rx=(hash(j,7)*2-1)*1380,ry=(hash(j,9)*2-1)*450;if(!inCap(rx,ry,455))continue;var e1=(rx+80)/600,e2=ry/250;if(e1*e1+e2*e2<0.85&&hash(j,3)<.8)continue;if(hash(j,4)<.4)continue;RIB.push([rx,ry,hash(j,5)*6.28]);}
    var at=[[FLB.x,FLB.y,-0.52],[-180,-500,-1.75],[260,500,1.45],[-500-500*Math.cos(0.5),500*Math.sin(0.5),2.64],[-560,-498,-2.2]];
    at.forEach(function(q,i){FLA.push({x:q[0],y:q[1],a:q[2],L:i===0?4200:3600+hash(i,4)*900,ph:hash(i,8)*6});});
    for(var k=0;k<240;k++){var s=k/240*2*Math.PI*1000*0+k/240,pt=capPt(s);FIM.push({x:pt[0],y:pt[1],a:pt[2]+(hash(k,2)-.5)*.5,L:110+hash(k,6)*90});}
    var p1=capPt(0.13),p2=capPt(0.62);PIL.push({x:p1[0],y:p1[1],a:p1[2]-0.25,L:1500},{x:p2[0],y:p2[1],a:p2[2]+0.3,L:1300});})();
  function inCap(x,y,r){var ax=Math.max(-500,Math.min(500,x));return (x-ax)*(x-ax)+y*y<r*r}
  /* point on capsule outline by fraction s of perimeter: [x,y,normalAngle] */
  function capPt(s){var P=2000+Math.PI*1000,d=((s%1)+1)%1*P;
    if(d<1000)return [-500+d,-500,-Math.PI/2];d-=1000;
    if(d<Math.PI*500){var t=-Math.PI/2+d/500;return [500+500*Math.cos(t),500*Math.sin(t),t];}d-=Math.PI*500;
    if(d<1000)return [500-d,500,Math.PI/2];d-=1000;var t2=Math.PI/2+d/500;return [-500+500*Math.cos(t2),500*Math.sin(t2),t2];}
  function capPath(c,r,len){var h=len/2-500;c.beginPath();c.moveTo(-h,-r);c.lineTo(h,-r);c.arc(h,0,r,-Math.PI/2,Math.PI/2);c.lineTo(-h,r);c.arc(-h,0,r,Math.PI/2,Math.PI*1.5);c.closePath();}
  /* colony outline in um, relative to C */
  var COL=[];for(var q=0;q<=360;q++){var t=q/360*2*Math.PI,r=rTh(t)*1e6;COL.push([Math.cos(t)*r,Math.sin(t)*r]);}
  var DOTS=[];for(var m=0;m<70;m++){var aa=hash(m,11)*6.283,rr=Math.sqrt(hash(m,12))*0.039,dx=Math.cos(aa)*rr,dy=Math.sin(aa)*rr;if(Math.hypot(dx-C.x,dy-C.y)<0.005)continue;DOTS.push([dx,dy,(0.4+hash(m,13)*1.3)*1e-3,hash(m,14)]);}
  var PT=[];for(var z=0;z<90;z++)PT.push({a:hash(z,21)*6.283,r:hash(z,22),s:0.4+hash(z,23)*1.4});
  /* ---------- drawing ---------- */
  var T=0,fis=0,lastLw=0;
  function bg(){var g=cx.createRadialGradient(W/2,H*0.45,40,W/2,H/2,W*0.75);g.addColorStop(0,'#101a3a');g.addColorStop(1,'#04060f');cx.fillStyle=g;cx.fillRect(0,0,W,H);}
  function drawDish(){var ox=sx(0),oy=sy(0),rr=DISH*cam.ppm;
    if(rr>2e5){var ga=cx.createRadialGradient(W*0.3,H*0.2,20,W/2,H/2,W);ga.addColorStop(0,'#C8893A');ga.addColorStop(1,'#6E4213');cx.fillStyle=ga;cx.fillRect(0,0,W,H);return;}
    if(rr<Math.hypot(W,H)*1.2||cam.ppm<4e4){
      cx.save();cx.shadowColor='rgba(127,219,208,.35)';cx.shadowBlur=40;cx.beginPath();cx.arc(ox,oy,rr*1.035,0,7);cx.fillStyle='rgba(190,225,255,.10)';cx.fill();cx.restore();
      cx.beginPath();cx.arc(ox,oy,rr*1.035,0,7);cx.lineWidth=Math.max(1.5,rr*0.012);cx.strokeStyle='rgba(220,240,255,.55)';cx.stroke();}
    var g=cx.createRadialGradient(ox-rr*0.25,oy-rr*0.3,rr*0.05,ox,oy,rr);g.addColorStop(0,'#E8B25A');g.addColorStop(0.65,'#B77A2A');g.addColorStop(1,'#6E4213');
    cx.beginPath();cx.arc(ox,oy,rr,0,7);cx.fillStyle=g;cx.fill();
    if(rr<3000){cx.save();cx.globalAlpha=.35;cx.beginPath();cx.arc(ox-rr*0.1,oy-rr*0.1,rr*0.82,3.6,4.5);cx.lineWidth=rr*0.03;cx.strokeStyle='#fff6e0';cx.stroke();cx.restore();}
    DOTS.forEach(function(d){var x=sx(d[0]),y=sy(d[1]),r=d[2]*cam.ppm;if(x<-r||x>W+r||y<-r||y>H+r||r<0.4)return;colonyBlob(x,y,r,d[3]);});}
  function colonyBlob(x,y,r,h){cx.save();cx.shadowColor='rgba(40,20,0,.55)';cx.shadowBlur=Math.min(30,r*0.6);cx.shadowOffsetY=Math.min(8,r*0.15);
    var g=cx.createRadialGradient(x-r*0.3,y-r*0.35,r*0.05,x,y,r);g.addColorStop(0,'#FFFDF4');g.addColorStop(0.6,h>.5?'#EFE3C4':'#E9E6D0');g.addColorStop(1,'#C9B78E');
    cx.beginPath();cx.arc(x,y,r,0,7);cx.fillStyle=g;cx.fill();cx.restore();}
  function drawColony(){var ox=sx(C.x),oy=sy(C.y),k=cam.ppm*1e-6,rr=R*cam.ppm;
    if(sx(C.x+R*1.1)<-50||sx(C.x-R*1.1)>W+50||sy(C.y+R*1.1)<-50||sy(C.y-R*1.1)>H+50)return;
    if(rr<0.5)return;
    if(cam.ppm>3e8){cx.fillStyle='#163238';cx.fillRect(0,0,W,H);drawCells(1);return;}
    var cellsA=sm(4e6,1.2e7,cam.ppm);
    cx.save();cx.translate(ox,oy);cx.scale(k,k);
    cx.shadowColor='rgba(30,14,0,.6)';cx.shadowBlur=Math.min(60,rr*0.3);cx.shadowOffsetY=Math.min(14,rr*0.06);
    cx.beginPath();COL.forEach(function(p,i){i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1])});cx.closePath();
    var g=cx.createRadialGradient(-R*3e5,-R*3.5e5,R*5e4,0,0,R*1.06e6);g.addColorStop(0,'#FFFDF5');g.addColorStop(0.55,'#EDE2C2');g.addColorStop(0.92,'#CDBA8C');g.addColorStop(1,'#B49C6A');
    cx.fillStyle=g;cx.fill();cx.restore();
    if(rr<6e4){cx.save();cx.translate(ox,oy);cx.scale(k,k);cx.globalAlpha=.18*(1-cellsA);cx.strokeStyle='#8a7444';cx.lineWidth=1/k;
      for(var q=1;q<6;q++){cx.beginPath();COL.forEach(function(p,i){var f=q/6;i?cx.lineTo(p[0]*f,p[1]*f):cx.moveTo(p[0]*f,p[1]*f)});cx.closePath();cx.stroke();}cx.restore();}
    if(cellsA>0){cx.save();cx.translate(ox,oy);cx.scale(k,k);cx.beginPath();COL.forEach(function(p,i){i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1])});cx.closePath();cx.globalAlpha=cellsA;cx.fillStyle='#163238';cx.fill();cx.restore();drawCells(cellsA);}}
  function drawCells(al){var k=cam.ppm*1e-6;var x0=(cam.x-C.x)*1e6-W/2/k,x1=x0+W/k,y0=(cam.y-C.y)*1e6-H/2/k,y1=y0+H/k;var SX=2.3,SY=1.1;
    var fx=(F.x-C.x)*1e6,fy=(F.y-C.y)*1e6,dx=(D.x-C.x)*1e6,dy=(D.y-C.y)*1e6;
    var i0=Math.floor(x0/SX)-2,i1=Math.ceil(x1/SX)+2,j0=Math.floor(y0/SY)-2,j1=Math.ceil(y1/SY)+2;
    if((i1-i0)*(j1-j0)>16000)return;
    var segs=[];for(var j=j0;j<=j1;j++)for(var i=i0;i<=i1;i++){var px=i*SX+(j&1?SX/2:0)+(hash(i,j)-.5)*.7,py=j*SY+(hash(j,i,2)-.5)*.35;
      var th=Math.atan2(py,px),rr=rTh(th)*1e6-hash(i,j,3)*3.5;if(px*px+py*py>rr*rr)continue;
      if(Math.abs(px-fx)<2.6&&Math.abs(py-fy)<1.8)continue;if(Math.abs(px-dx)<3.4&&Math.abs(py-dy)<1.5)continue;
      var a=0.45*Math.sin(px*0.11+py*0.05)+0.35*Math.cos(py*0.15)+(hash(i,j,4)-.5)*.35,L=1.7+hash(i,j,5)*0.9;segs.push([px,py,a,L]);}
    var ox=sx(C.x),oy=sy(C.y);
    function path(off){cx.beginPath();segs.forEach(function(s){var h=(s[3]-1)/2,c=Math.cos(s[2]),n=Math.sin(s[2]);cx.moveTo(ox+(s[0]-c*h)*k,oy+(s[1]-n*h+off)*k);cx.lineTo(ox+(s[0]+c*h)*k,oy+(s[1]+n*h+off)*k);});}
    cx.save();cx.globalAlpha=al;cx.lineCap='round';
    path(0);cx.lineWidth=1.0*k;cx.strokeStyle='#0c3f44';cx.stroke();
    cx.lineWidth=0.84*k;cx.strokeStyle='#58C9B9';cx.stroke();
    path(-0.16);cx.lineWidth=0.3*k;cx.strokeStyle='rgba(225,255,248,.55)';cx.stroke();cx.restore();
    var D_on=Math.abs(cam.x-D.x)<40e-6&&Math.abs(cam.y-D.y)<40e-6;if(D_on)drawDivider(al);}
  function simpleCell(len,r,al,glow){capPath(cx,r,len);var g=cx.createLinearGradient(0,-r,0,r);g.addColorStop(0,'#A6F0E4');g.addColorStop(0.45,'#3FB7A6');g.addColorStop(1,'#145D5B');
    cx.save();if(glow){cx.shadowColor='rgba(127,219,208,.9)';cx.shadowBlur=glow;}cx.globalAlpha=al;cx.fillStyle=g;cx.fill();cx.restore();cx.globalAlpha=al;cx.lineWidth=40;cx.strokeStyle='#0c3f44';cx.stroke();cx.globalAlpha=1;}
  function drawDivider(al){var k=cam.ppm*NM;cx.save();cx.translate(sx(D.x),sy(D.y));cx.scale(k,k);
    var L=2000+2000*sm(0,0.6,fis),c=sm(0.45,0.92,fis),gap=sm(0.92,1,fis)*260;
    if(c<0.999){var hl=L/2,pts=[];for(var q=0;q<=80;q++){var x=-hl+q/80*L,ax=Math.abs(x),e=hl-500,h=ax<e?500:Math.sqrt(Math.max(0,500*500-(ax-e)*(ax-e)));h*=1-c*Math.exp(-(x*x)/(380*380));pts.push([x,h]);}
      cx.beginPath();pts.forEach(function(p,i){i?cx.lineTo(p[0],-p[1]):cx.moveTo(p[0],-p[1])});for(var z=pts.length-1;z>=0;z--)cx.lineTo(pts[z][0],pts[z][1]);cx.closePath();
      var g=cx.createLinearGradient(0,-500,0,500);g.addColorStop(0,'#A6F0E4');g.addColorStop(0.45,'#3FB7A6');g.addColorStop(1,'#145D5B');cx.globalAlpha=al;cx.shadowColor='rgba(127,219,208,.8)';cx.shadowBlur=18;cx.fillStyle=g;cx.fill();cx.shadowBlur=0;cx.lineWidth=40;cx.strokeStyle='#0c3f44';cx.stroke();
      if(c>0.05){cx.globalAlpha=al*Math.min(1,c*3)*(1-sm(0.85,0.95,fis));cx.fillStyle='#F2A93B';var wv=500*(1-c)+30;cx.beginPath();cx.ellipse(0,-wv+20,60,30,0,0,7);cx.ellipse(0,wv-20,60,30,0,0,7);cx.fill();cx.fillRect(-40,-wv+20,80,2*wv-40);}
      var sp=(L-2000)/2*0.9;cx.globalAlpha=al*.8;cx.fillStyle='rgba(20,80,90,.75)';cx.beginPath();cx.ellipse(-sp,0,420,200,0,0,7);cx.ellipse(sp,0,420,200,0,0,7);cx.fill();}
    else{[-1,1].forEach(function(s){cx.save();cx.translate(s*(1000+gap),0);simpleCell(2000,500,al,18);cx.globalAlpha=al*.8;cx.fillStyle='rgba(20,80,90,.75)';cx.beginPath();cx.ellipse(0,0,420,200,0,0,7);cx.fill();cx.restore();});}
    cx.restore();}
  function wave(f,s,t){return Math.sin(s*0.0028-t*7+f.ph)*Math.min(1,s/600)*170}
  function flagPts(f,t){var pts=[],c=Math.cos(f.a),n=Math.sin(f.a),bx=f.x+c*55,by=f.y+n*55;for(var s=0;s<=f.L;s+=40){var w=wave(f,s,t),bend=s*s*0.00002;pts.push([bx+c*s-n*(w+bend),by+n*s+c*(w+bend)]);}return pts;}
  function drawFocal(){var k=cam.ppm*NM,len=2000*k;if(len<3)return;var al=sm(3,10,len);
    var rev=sm(4.6,6.8,P);
    cx.save();cx.translate(sx(F.x),sy(F.y));cx.scale(k,k);cx.globalAlpha=al;
    var lw=Math.max(1/k,1);
    /* fimbriae + pili behind body */
    cx.strokeStyle='rgba(242,200,120,.85)';cx.lineWidth=Math.max(4,0.8/k);cx.lineCap='round';cx.beginPath();
    FIM.forEach(function(f,i){var c=Math.cos(f.a),n=Math.sin(f.a),sw=Math.sin(T*1.3+i)*0.12;cx.moveTo(f.x,f.y);cx.quadraticCurveTo(f.x+c*f.L*0.5-n*f.L*sw,f.y+n*f.L*0.5+c*f.L*sw,f.x+Math.cos(f.a+sw)*f.L,f.y+Math.sin(f.a+sw)*f.L);});cx.stroke();
    cx.strokeStyle='rgba(255,214,140,.95)';cx.lineWidth=Math.max(9,1.2/k);PIL.forEach(function(p,i){cx.beginPath();for(var s=0;s<=p.L;s+=30){var w=Math.sin(s*0.004+T*0.8+i)*40*s/p.L,c=Math.cos(p.a),n=Math.sin(p.a),x=p.x+c*s-n*w,y=p.y+n*s+c*w;s?cx.lineTo(x,y):cx.moveTo(x,y);}cx.stroke();});
    /* flagella */
    FLA.forEach(function(f){var pts=flagPts(f,T);cx.save();cx.shadowColor='rgba(143,160,240,.9)';cx.shadowBlur=12;cx.beginPath();pts.forEach(function(p,i){i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1])});cx.strokeStyle='#8FA0F0';cx.lineWidth=Math.max(20,1.6/k);cx.stroke();cx.restore();
      cx.beginPath();pts.forEach(function(p,i){i?cx.lineTo(p[0],p[1]-4):cx.moveTo(p[0],p[1]-4)});cx.strokeStyle='rgba(235,240,255,.7)';cx.lineWidth=Math.max(6,0.5/k);cx.stroke();
      var c=Math.cos(f.a),n=Math.sin(f.a);cx.beginPath();cx.moveTo(f.x,f.y);cx.quadraticCurveTo(f.x+c*40+n*12,f.y+n*40-c*12,f.x+c*55,f.y+n*55);cx.strokeStyle='#C9D3FF';cx.lineWidth=18;cx.stroke();});
    /* body */
    capPath(cx,500,2000);var g=cx.createLinearGradient(0,-520,0,520);g.addColorStop(0,'#B8F5EA');g.addColorStop(0.4,'#47BFAE');g.addColorStop(1,'#0F4F51');
    cx.save();cx.shadowColor='rgba(127,219,208,.85)';cx.shadowBlur=26;cx.fillStyle=g;cx.fill();cx.restore();
    /* cut-away interior */
    if(rev>0){cx.save();cx.globalAlpha=al*rev;capPath(cx,471,2000);var gi=cx.createRadialGradient(-200,-150,50,0,0,1100);gi.addColorStop(0,'#1C3D78');gi.addColorStop(1,'#0A1638');cx.fillStyle=gi;cx.fill();cx.clip();
      /* ribosomes */
      RIB.forEach(function(r){var px=r[0]*k,ok=1;if(k*12<1.2){cx.fillStyle='rgba(201,211,255,.75)';cx.fillRect(r[0]-9,r[1]-9,18,18);return;}cx.save();cx.translate(r[0],r[1]);cx.rotate(r[2]+T*0.05);if(k>3){cx.shadowColor='rgba(0,0,0,.5)';cx.shadowBlur=14;}var g1=cx.createRadialGradient(-4,-7,1,0,-3,11);g1.addColorStop(0,'#DCE3FF');g1.addColorStop(1,'#5D72D9');cx.fillStyle=g1;cx.beginPath();cx.arc(0,-3,11,0,7);cx.fill();var g2=cx.createRadialGradient(0,6,0.5,2,9,7.5);g2.addColorStop(0,'#FFF1CC');g2.addColorStop(1,'#E0A43A');cx.fillStyle=g2;cx.beginPath();cx.arc(2,9,7.5,0,7);cx.fill();cx.restore();});
      /* nucleoid */
      cx.fillStyle='rgba(43,179,163,.14)';cx.beginPath();cx.ellipse(-80,0,640,290,0,0,7);cx.fill();
      cx.save();cx.shadowColor='rgba(127,219,208,.9)';cx.shadowBlur=10;cx.strokeStyle='#7FDBD0';cx.lineWidth=Math.max(2.2,0.9/k);cx.beginPath();DNA.forEach(function(p,i){var j=Math.sin(T*0.6+i*0.3)*3;i?cx.lineTo(p[0]+j,p[1]-j):cx.moveTo(p[0],p[1])});cx.stroke();cx.restore();
      /* plasmids */
      PLS.forEach(function(p,i){cx.save();cx.translate(p[0],p[1]);cx.rotate(T*0.15*(i%2?1:-1));cx.beginPath();for(var q=0;q<=72;q++){var t=q/72*6.283,rr=p[2]+Math.sin(t*7)*p[2]*0.18;q?cx.lineTo(Math.cos(t)*rr,Math.sin(t)*rr):cx.moveTo(rr,0);}cx.shadowColor='rgba(242,169,59,.9)';cx.shadowBlur=10;cx.strokeStyle='#F2A93B';cx.lineWidth=Math.max(2.2,0.9/k);cx.stroke();cx.restore();});
      cx.restore();}
    /* envelope bands */
    var B=[[496.5,7,'#E8B04A'],[485.5,15,'rgba(30,60,80,.9)'],[486,4,'#F2EFE6'],[474.5,7,'#E8B04A']];
    if(k>0.05)B.forEach(function(b){capPath(cx,b[0],2000);cx.lineWidth=b[1];cx.strokeStyle=b[2];cx.stroke();});
    else{capPath(cx,500,2000);cx.lineWidth=Math.max(30,1.4/k);cx.strokeStyle='rgba(12,63,68,.95)';cx.stroke();}
    if(k>1.2)drawEnvelope(k);
    /* basal bodies */
    if(k>0.3)FLA.forEach(function(f){cx.save();cx.translate(f.x,f.y);cx.rotate(f.a+Math.PI/2);cx.fillStyle='#C9D3FF';cx.fillRect(-4,-2,8,38);
      [[3.5,22],[14,18],[25,26],[36,40]].forEach(function(r,i){cx.fillStyle=i===3?'#8FA0F0':'#DDE3FF';cx.fillRect(-r[1]/2,r[0]-2.5,r[1],5);});cx.restore();});
    cx.restore();}
  function drawEnvelope(k){var x0=(cam.x-F.x)/NM-W/2/k-10,x1=x0+W/k+20;x0=Math.max(-500,x0);x1=Math.min(500,x1);if(x1<=x0)return;
    cx.save();cx.globalAlpha=sm(1.2,3,k);
    cx.fillStyle='#0b1f2c';cx.fillRect(x0,-493,x1-x0,15);
    /* peptidoglycan mesh */
    cx.strokeStyle='#F7F2E4';cx.lineWidth=0.9;cx.beginPath();cx.moveTo(x0,-487.2);cx.lineTo(x1,-487.2);cx.moveTo(x0,-484.8);cx.lineTo(x1,-484.8);cx.stroke();
    cx.lineWidth=0.5;cx.beginPath();for(var x=Math.ceil(x0/2.2)*2.2;x<x1;x+=2.2){cx.moveTo(x,-487.2);cx.lineTo(x+0.6,-484.8);}cx.stroke();
    function leaflet(y,dir,col,tail){for(var x=Math.ceil(x0/0.95)*0.95;x<x1;x+=0.95){cx.strokeStyle=tail;cx.lineWidth=0.18;cx.beginPath();cx.moveTo(x-0.12,y);cx.lineTo(x-0.12+Math.sin(x*3+T)*0.08,y+dir*2.7);cx.moveTo(x+0.12,y);cx.lineTo(x+0.12,y+dir*2.7);cx.stroke();cx.fillStyle=col;cx.beginPath();cx.arc(x,y,0.42,0,7);cx.fill();}}
    cx.fillStyle='#0d2440';cx.fillRect(x0,-500,x1-x0,7);cx.fillRect(x0,-478,x1-x0,7);
    leaflet(-499.5,1,'#F2A93B','#E9D7A8');leaflet(-493.5,-1,'#F2C46B','#E9D7A8');
    leaflet(-477.5,1,'#F2C46B','#E9D7A8');leaflet(-471.5,-1,'#F2A93B','#E9D7A8');
    /* LPS chains */
    cx.fillStyle='#E26D8C';for(var x2=Math.ceil(x0/2.4)*2.4;x2<x1;x2+=2.4){for(var b=0;b<5;b++){cx.beginPath();cx.arc(x2+Math.sin(T+x2+b)*0.25,-500.6-b*0.75,0.32,0,7);cx.fill();}}
    /* porin + transporter */
    [[60,-496.5],[330,-496.5]].forEach(function(p){if(p[0]>x0-6&&p[0]<x1+6){cx.fillStyle='rgba(143,160,240,.95)';cx.beginPath();cx.roundRect(p[0]-2.6,p[1]-4.2,5.2,8.4,1.4);cx.fill();cx.fillStyle='#0b1f2c';cx.fillRect(p[0]-0.8,p[1]-4.2,1.6,8.4);}});
    if(210>x0-6&&210<x1+6){cx.fillStyle='rgba(127,219,208,.95)';cx.beginPath();cx.roundRect(207,-479,6,9,1.6);cx.fill();}
    cx.restore();}
  /* labels */
  function L(x,y,t,dx,dy){return {x:x,y:y,t:t,dx:dx,dy:dy}}
  function LBL(i){var f=function(x,y){return fl(x,y)};var fp=flagPts(FLA[0],T);
    switch(i){
    case 0:return [L(C.x,C.y,'the colony we enter',70,-70),L(-0.03,0.028,'agar in a Petri dish',-60,40)];
    case 1:return [L(E.x,E.y,'colony edge',60,-60),L(C.x+R*1.7,C.y+R*0.5,'agar',30,40)];
    case 2:return [L(F.x,F.y,'this cell',40,-110),L(E.x-28e-6,E.y+6e-6,'cells packed side by side',-20,60),L(E.x+3.5e-6,E.y-9e-6,'agar',10,-20)];
    case 3:return fis>0.95?[L(D.x+1.1e-6,D.y,'daughter cell',40,-110),L(D.x-1.1e-6,D.y,'daughter cell',-40,-110)]:[L(D.x,D.y-0.45e-6,fis>0.4?'septum forms (FtsZ)':'cell grows longer',0,-100)];
    case 4:return [L(f(fp[38][0],fp[38][1]).x,f(fp[38][0],fp[38][1]).y,'flagellum',20,-40),L(f(-200,-640).x,f(-200,-640).y,'fimbriae',-40,-50),L(f(-80,0).x,f(-80,0).y,'nucleoid (DNA)',-60,95),L(f(300,500).x,f(300,500).y,'cell envelope',140,60)];
    case 5:var c=Math.cos(FLA[0].a),n=Math.sin(FLA[0].a),b=FLB;return [L(f(b.x-n*0-c*20,b.y-n*20).x,f(b.x-c*20,b.y-n*20).y,'basal body (motor)',-130,90),L(f(b.x+c*30,b.y+n*30).x,f(b.x+c*30,b.y+n*30).y,'hook',-90,-60),L(f(fp[5][0],fp[5][1]).x,f(fp[5][0],fp[5][1]).y,'filament (flagellin)',40,-50)];
    case 6:var pp=PIL[0];return [L(f(-50,-640).x,f(-50,-640).y,'fimbriae',-60,-60),L(f(pp.x+Math.cos(pp.a)*700,pp.y+Math.sin(pp.a)*700).x,f(pp.x+Math.cos(pp.a)*700,pp.y+Math.sin(pp.a)*700).y,'pilus',60,-20)];
    case 7:return [L(f(DNA[300][0],DNA[300][1]).x,f(DNA[300][0],DNA[300][1]).y,'nucleoid',-30,-120),L(f(PLS[1][0],PLS[1][1]).x,f(PLS[1][0],PLS[1][1]).y,'plasmid',90,-40),L(f(600,330).x,f(600,330).y,'cytoplasm',60,70)];
    case 8:var rb=nearRib();if(!rb)return [];var ra=rb[2]+T*0.05,cs=Math.cos(ra),sn=Math.sin(ra),o=function(a,b){return f(rb[0]+a*cs-b*sn,rb[1]+a*sn+b*cs)},p50=o(-2,-8),p30=o(3,12),pc=o(10,-12);return [L(pc.x,pc.y,'70S ribosome',90,-70),L(p50.x,p50.y,'50S large subunit',-170,-50),L(p30.x,p30.y,'30S small subunit',-150,80)];
    case 9:var xx=(cam.x-F.x)/NM-25;return [L(f(xx,-501.5).x,f(xx,-501.5).y,'LPS (outer leaflet)',-60,-28),L(f(xx+40,-496.5).x,f(xx+40,-496.5).y,'outer membrane',80,-40),L(f(xx-10,-486).x,f(xx-10,-486).y,'peptidoglycan',-90,44),L(f(xx+25,-490).x,f(xx+25,-490).y,'periplasm',150,10),L(f(xx+12,-474.5).x,f(xx+12,-474.5).y,'plasma membrane',60,46)];}
    return [];}
  function nearRib(){var c=S[8].c,best=null,bd=1e9,tx=(c.x-F.x)/NM,ty=(c.y-F.y)/NM;RIB.forEach(function(r){var d=Math.hypot(r[0]-tx,r[1]-ty);if(d<bd){bd=d;best=r;}});return best;}
  function drawLabels(){var i=Math.round(P),a=1-sm(0.06,0.28,Math.abs(P-i));if(a<=0.01)return;cx.save();cx.globalAlpha=a;cx.font='600 15px "IBM Plex Sans",system-ui,sans-serif';
    LBL(i).forEach(function(l){var x=sx(l.x),y=sy(l.y);if(x<-20||x>W+20||y<-20||y>H+20)return;var tw=cx.measureText(l.t).width+20,lx=Math.max(8,Math.min(W-tw-8,x+l.dx-tw/2)),ly=Math.max(84,Math.min(H-96,y+l.dy-14));
      cx.strokeStyle='rgba(255,255,255,.85)';cx.lineWidth=1.5;cx.beginPath();cx.moveTo(x,y);cx.lineTo(lx+tw/2,ly+14);cx.stroke();
      cx.fillStyle='#fff';cx.beginPath();cx.arc(x,y,4,0,7);cx.fill();cx.strokeStyle='rgba(242,169,59,.9)';cx.lineWidth=2;cx.beginPath();cx.arc(x,y,8+Math.sin(T*3)*2,0,7);cx.stroke();
      cx.fillStyle='rgba(6,9,20,.82)';cx.strokeStyle='rgba(127,219,208,.7)';cx.lineWidth=1.2;cx.beginPath();cx.roundRect(lx,ly,tw,28,14);cx.fill();cx.stroke();cx.fillStyle='#fff';cx.fillText(l.t,lx+10,ly+19);});cx.restore();}
  function drawParticles(dz){cx.save();PT.forEach(function(p){p.r*=Math.exp(dz*0.9*p.s);if(p.r>1.25||p.r<0.02){p.r=dz<0?1.2:0.03+Math.random()*0.1;p.a=Math.random()*6.283;}
      var x=W/2+Math.cos(p.a)*p.r*W*0.6,y=H/2+Math.sin(p.a)*p.r*H*0.75,sp=Math.min(1,Math.abs(dz)*25);cx.globalAlpha=0.12+0.45*sp;cx.strokeStyle=p.s>1?'#7FDBD0':'#F2D28A';cx.lineWidth=1.4;
      cx.beginPath();cx.moveTo(x,y);var tl=1+sp*18;cx.lineTo(x-Math.cos(p.a)*tl*Math.sign(dz||1),y-Math.sin(p.a)*tl*Math.sign(dz||1));cx.stroke();});cx.restore();}
  function fmt(m){var u=[[1e-2,'cm'],[1e-3,'mm'],[1e-6,'\u00B5m'],[1e-9,'nm']];for(var i=0;i<u.length;i++)if(m>=u[i][0]*0.999){var v=m/u[i][0];return (v>=10?Math.round(v):+v.toPrecision(2))+' '+u[i][1];}return m+' m';}
  function scaleBar(){var target=130/cam.ppm,e=Math.pow(10,Math.floor(Math.log10(target))),best=e;[1,2,5,10].forEach(function(m){if(m*e<=target*1.25)best=m*e;});
    bSc.style.width=(best*cam.ppm).toFixed(1)+'px';tSc.textContent=fmt(best);tFov.textContent='field of view '+fmt(cam.w);}
  /* ---------- UI + state ---------- */
  var $=function(id){return document.getElementById(id)};
  var bSc=$('bzScaleB'),tSc=$('bzScaleT'),tFov=$('bzFov'),sl=$('bzZ'),bPlay=$('bzPlay');sl.max=N-1;
  var P=0,goal=null,from=0,t0=0,dur=1,playing=false,dwell=0,cur=-1,running=false,lt=0;
  function side(i){if(i===cur)return;cur=i;var s=S[i];$('bzEb').textContent='Stop '+(i+1)+' of '+N+' \u00B7 '+fmt(s.w)+' view';$('bzTerm').textContent=s.t;$('bzDef').textContent=s.d;$('bzNum').textContent=s.k;var a=$('bzCite');a.textContent=s.src+' \u2197';a.href=s.u;$('bzStop').textContent=(i+1)+' / '+N+' \u00B7 '+s.n;}
  function go(i){i=Math.max(0,Math.min(N-1,i));from=P;goal=i;t0=performance.now();dur=1400+Math.abs(Math.log10(S[i].w)-Math.log10(camAt(P).w))*650+Math.abs(i-P)*150;}
  function setPlay(on){playing=on;bPlay.classList.toggle('on',on);bPlay.innerHTML=on?'&#10073;&#10073; Pause':'&#9654; Play';
    if(!on)return;if(P>=N-1-1e-3){P=0;goal=null;dwell=performance.now()-2400;}else if(Math.abs(P-Math.round(P))>1e-3)go(Math.ceil(P));else go(Math.round(P)+1);}
  bPlay.onclick=function(){setPlay(!playing)};
  $('bzNext').onclick=function(){setPlay(false);go(Math.floor(P+1e-3)+1)};
  $('bzPrev').onclick=function(){setPlay(false);go(Math.ceil(P-1e-3)-1)};
  sl.oninput=function(){setPlay(false);goal=null;P=+sl.value;};
  $('bzCopy').onclick=function(){var t=$('bzPrompt').textContent,b=this;function ok(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy'},1400)}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,function(){fb()});else fb();
    function fb(){var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ok()}catch(e){}ta.remove();}};
  $('bzPd').addEventListener('toggle',function(){if(this.open)$('bzSd').open=false});$('bzSd').addEventListener('toggle',function(){if(this.open)$('bzPd').open=false});
  function ease(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
  function size(){var r=cv.parentNode;W=r.clientWidth||764;H=r.clientHeight||440;cv.width=W*DPR;cv.height=H*DPR;}
  function frame(now){if(!running)return;var dt=Math.min(0.05,(now-(lt||now))/1000);lt=now;T+=dt;
    if(!(slide.classList.contains('on')&&pane.classList.contains('on'))){running=false;return;}
    if(goal!==null){var x=Math.min(1,(now-t0)/dur);P=from+(goal-from)*ease(x);if(x>=1){P=goal;goal=null;dwell=now;}}
    else if(playing&&now-dwell>(S[Math.round(P)].fis?8000:4800)){if(P>=N-1)setPlay(false);else go(Math.round(P)+1);}
    var atF=goal===null&&Math.abs(P-3)<1e-3;fis=atF?Math.min(1,fis+dt/5.5):Math.max(0,fis-dt*1.5);
    var c=camAt(P);cam.x=c.x;cam.y=c.y;cam.w=c.w;cam.ppm=W/c.w;var lw=Math.log(c.w),dz=lastLw?lastLw-lw:0;lastLw=lw;
    if(document.activeElement!==sl)sl.value=P;side(Math.round(P));
    cx.setTransform(DPR,0,0,DPR,0,0);bg();drawDish();drawColony();drawFocal();drawParticles(dz);drawLabels();scaleBar();
    requestAnimationFrame(frame);}
  function start(){size();if(!running){running=true;lt=0;requestAnimationFrame(frame);}}
  document.addEventListener('pane',function(e){if(e.detail.dive==='bi'&&e.detail.pane==='adv')start();});
  document.addEventListener('slidechange',function(e){if(e.detail.slide===slide&&pane.classList.contains('on'))start();});
  window.__bz={go:function(i){setPlay(false);goal=null;P=i;fis=S[i].fis?1:0;},n:N};
})();
