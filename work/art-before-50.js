/* Noc eksponatów — original, resolution independent museum illustration. */
(() => {
  'use strict';
  const TAU=Math.PI*2;
  const sponsorImage=typeof Image==='function'?new Image():null;
  if(sponsorImage){sponsorImage.decoding='async';sponsorImage.src=document.currentScript?.dataset.sponsorImage||'assets/kustosz-reklama.png';}
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function path(c,pts,fill,stroke,lw=1){c.beginPath();pts(c);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
  function poly(c,p,fill,stroke,lw=1){path(c,q=>{q.moveTo(...p[0]);for(let i=1;i<p.length;i++)q.lineTo(...p[i]);q.closePath()},fill,stroke,lw)}
  function line(c,x,y,X,Y,s,w=1){c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.strokeStyle=s;c.lineWidth=w;c.stroke()}
  function ellipse(c,x,y,rx,ry,fill,stroke,lw=1,rot=0){c.beginPath();c.ellipse(x,y,rx,ry,rot,0,TAU);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
  function rr(c,x,y,w,h,r,fill,stroke,lw=1){path(c,q=>q.roundRect(x,y,w,h,r),fill,stroke,lw)}
  function grad(c,x,y,X,Y,stops){let g=c.createLinearGradient(x,y,X,Y);for(let [p,col]of stops)g.addColorStop(p,col);return g}
  function glow(c,x,y,r,col){let g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
  function txt(c,text,x,y,size,color,align='center',family='Georgia'){c.fillStyle=color;c.font=`${size}px ${family}`;c.textAlign=align;c.fillText(text,x,y)}
  function arch(c,x,y,w,h){c.moveTo(x,y+h);c.lineTo(x,y+w/2);c.bezierCurveTo(x,y-w*.06,x+w,y-w*.06,x+w,y+w/2);c.lineTo(x+w,y+h);c.closePath()}
  function windowArch(c,x,y,w,h,t){
    path(c,q=>arch(q,x-15,y-17,w+30,h+20),'#131c22','#615b45',2);
    path(c,q=>arch(q,x-8,y-8,w+16,h+8),'#070e17','#77827b',1);
    c.save();path(c,q=>arch(q,x,y,w,h),null);c.clip();
    c.fillStyle=grad(c,0,y,0,y+h,[[0,'#274858'],[.6,'#112d3d'],[1,'#07141c']]);c.fillRect(x,y,w,h);
    for(let i=0;i<13;i++){let sx=x+((i*71+19)%Math.round(w)),sy=y+24+((i*43)%170);ellipse(c,sx,sy,.7,.7,'#b6d3d0')}
    if(x>800){glow(c,x+w*.63,y+70,66,'rgba(188,225,214,.22)');ellipse(c,x+w*.63,y+70,27,27,'#a2bcb1');ellipse(c,x+w*.63-10,y+63,26,27,'#264353')}
    poly(c,[[x-10,y+h],[x-10,y+h-58],[x+33,y+h-108],[x+62,y+h-47],[x+112,y+h-140],[x+w+10,y+h-65],[x+w+10,y+h]],'#0c1a23');
    line(c,x+w/2,y-4,x+w/2,y+h,'#a28e65',7);line(c,x,y+h*.52,x+w,y+h*.52,'#887b59',6);line(c,x,y+h*.8,x+w,y+h*.8,'#887b59',5);
    path(c,q=>{q.moveTo(x+w/2,y+8);q.bezierCurveTo(x+w*.12,y+65,x+w*.12,y+115,x+w/2,y+158);q.bezierCurveTo(x+w*.88,y+115,x+w*.88,y+65,x+w/2,y+8)},null,'#718478',3);
    c.restore();rr(c,x-20,y+h,w+40,10,2,'#403e34','#7a7454');
  }
  function column(c,x){
    c.fillStyle=grad(c,x-25,0,x+26,0,[[0,'#151a1b'],[.22,'#3e4140'],[.45,'#555950'],[.63,'#343a36'],[1,'#10191a']]);c.fillRect(x-25,145,50,449);
    for(let k=-2;k<=2;k++)line(c,x+k*8,157,x+k*8,581,k<0?'#141e20':'#636559',1.5);
    rr(c,x-37,140,74,14,2,'#4d5046','#77715b');rr(c,x-45,119,90,21,3,'#262e2c','#625e48');
    poly(c,[[x-45,119],[x-34,102],[x+34,102],[x+45,119]],'#42483f','#6c694f');
    rr(c,x-35,584,70,16,2,'#454a41','#7a7355');rr(c,x-43,600,86,19,2,'#252f2b','#5d604e');
    rr(c,x-49,619,98,12,1,'#353e35','#625f49');
    path(c,q=>{q.moveTo(x-31,135);q.bezierCurveTo(x-52,119,x-22,117,x-25,136);q.moveTo(x+31,135);q.bezierCurveTo(x+52,119,x+22,117,x+25,136)},null,'#a0946b',2);
  }
  function wallFrame(c,x,y,w,h){
    rr(c,x-7,y-7,w+14,h+14,2,'#181f20','#716448',2);rr(c,x,y,w,h,1,'#0e1a20','#ac9360',2);rr(c,x+6,y+6,w-12,h-12,1,null,'#4c4c3d',1);
    // An abstract archaeological relief, with no figures.
    c.save();c.beginPath();c.rect(x+9,y+9,w-18,h-18);c.clip();
    c.fillStyle=grad(c,x,y,x+w,y+h,[[0,'#28373b'],[1,'#131d20']]);c.fillRect(x+9,y+9,w-18,h-18);
    ellipse(c,x+w*.48,y+h*.4,w*.26,h*.25,'#45483d','#6b6952',1);ellipse(c,x+w*.48,y+h*.4,w*.17,h*.17,'#252f2e','#73705b');
    for(let i=0;i<8;i++){const a=i*TAU/8;line(c,x+w*.48+Math.cos(a)*w*.19,y+h*.4+Math.sin(a)*h*.19,x+w*.48+Math.cos(a)*w*.26,y+h*.4+Math.sin(a)*h*.25,'#8d805d',2)}
    poly(c,[[x+8,y+h*.8],[x+w*.35,y+h*.66],[x+w*.65,y+h*.75],[x+w,y+h*.62],[x+w,y+h],[x,y+h]],'#20312e');c.restore();
    rr(c,x+w*.25,y+h+16,w*.5,14,1,'#444237');
  }
  function rope(c,x1,x2,y){
    [x1,x2].forEach(x=>{ellipse(c,x,y+78,18,5,'#090f10','#665b3c');poly(c,[[x-4,y+76],[x-3,y+6],[x+3,y+6],[x+4,y+76]],'#6e6546','#b6a472');ellipse(c,x,y,8,8,'#9f9061','#d0be87');ellipse(c,x-2,y-3,2,2,'#f7df9c')});
    path(c,q=>{q.moveTo(x1,y+6);q.bezierCurveTo(x1+30,y+43,x2-30,y+43,x2,y+6)},null,'#160d16',9);
    path(c,q=>{q.moveTo(x1,y+5);q.bezierCurveTo(x1+30,y+42,x2-30,y+42,x2,y+5)},null,'#6c2637',6);
    path(c,q=>{q.moveTo(x1,y+4);q.bezierCurveTo(x1+30,y+39,x2-30,y+39,x2,y+4)},null,'#9d4955',1);
  }
  function drawArena(c,w=1440,h=810,t=0){
    c.save();c.scale(w/1440,h/810);
    c.fillStyle=grad(c,0,0,0,810,[[0,'#050b12'],[.65,'#172824'],[1,'#090f14']]);c.fillRect(0,0,1440,810);
    // Deep gallery and coffered stonework.
    for(let x=0;x<1440;x+=160){c.fillStyle=(x/160)%2?'#132124':'#122023';c.fillRect(x,100,159,488);line(c,x,105,x,587,'#29352e',1)}
    for(let y=150;y<570;y+=70)line(c,0,y,1440,y,'rgba(155,149,108,.055)',1);
    rr(c,0,80,1440,17,1,'#25312d','#575b47',1);rr(c,0,98,1440,9,1,'#0b161b','#343e36');
    windowArch(c,226,164,170,335,t);windowArch(c,1044,164,170,335,t);
    wallFrame(c,452,238,105,158);wallFrame(c,883,238,105,158);
    // Center entrance, pediment and museum identity.
    path(c,q=>arch(q,598,210,244,342),'#0b171b','#4b5144',3);
    path(c,q=>arch(q,613,225,214,327),'#0a151a','#343f38',2);
    c.fillStyle=grad(c,613,260,825,530,[[0,'#13272b'],[.5,'#0a181e'],[1,'#050e15']]);c.fillRect(616,332,208,217);
    for(let x=630;x<820;x+=32)line(c,x,337,x,550,'#162827',1);
    ellipse(c,720,281,29,29,'#26392f','#8a7a50',2);ellipse(c,720,281,22,22,null,'#53634a');
    path(c,q=>{q.moveTo(720,262);q.lineTo(720,282);q.lineTo(734,290)},null,'#d9c28a',2);
    txt(c,'MUSEUM',720,187,22,'#a8a17c');txt(c,'HISTORIA NATURALIS',720,206,8,'#7f8a73','center','Arial');
    // The supplied advertisement is mounted in the back wall, behind the fighters.
    if(sponsorImage?.complete&&sponsorImage.naturalWidth>0){
      c.save();c.shadowColor='rgba(0,0,0,.7)';c.shadowBlur=15;c.shadowOffsetY=5;
      rr(c,602,302,236,246,2,'#151a15','#b9a36d',3);c.shadowBlur=0;c.shadowOffsetY=0;
      c.imageSmoothingEnabled=true;c.drawImage(sponsorImage,608,308,224,234);
      rr(c,606,306,228,238,1,null,'#d2bc82',1);c.restore();
    }
    // Exhibit consoles.
    [176,1280].forEach((x,i)=>{rr(c,x-45,501,90,63,3,'#182824','#4e5643');rr(c,x-50,495,100,8,2,'#66715b','#888b6b');line(c,x-41,508,x+41,508,'#9b9771',1);txt(c,i?'CRETACEOUS':'ARMA · XV',x,533,9,'#939875','center','Arial');line(c,x-25,544,x+25,544,'#454d3d',1)});
    [128,421,1019,1312].forEach(x=>column(c,x));
    // Warm overhead exhibition lights, cold moonlight through glass.
    c.save();c.globalCompositeOperation='screen';
    [311,1129].forEach((x,i)=>{const g=grad(c,x,190,x+(i?-200:200),664,[[0,'rgba(103,168,172,.04)'],[.6,'rgba(57,117,126,.12)'],[1,'rgba(93,157,152,0)']]);poly(c,[[x-55,210],[x+55,210],[x+(i?-30:260),666],[x+(i?-260:30),666]],g)});
    [505,935].forEach(x=>{poly(c,[[x,145],[x-180,649],[x+180,649]],grad(c,x,145,x,650,[[0,'rgba(255,203,116,.09)'],[1,'rgba(255,193,105,0)']]));glow(c,x,146,28,'rgba(241,198,108,.12)')});c.restore();
    [505,935].forEach(x=>{rr(c,x-21,128,42,13,3,'#141b1c','#696447');poly(c,[[x-15,140],[x-10,148],[x+10,148],[x+15,140]],'#97855c');line(c,x-8,148,x+8,148,'#ffe1a1',3)});
    // Continuous plinth and shadowed floor.
    rr(c,0,561,1440,13,1,'#293d33','#6a6c50');rr(c,0,576,1440,26,1,'#101e1f','#314435');
    c.fillStyle=grad(c,0,600,0,810,[[0,'#24392f'],[.25,'#243732'],[1,'#101e23']]);c.fillRect(0,602,1440,208);
    const horizon=572,vanish=720;
    for(let j=0;j<5;j++){const y1=602+j*j*9,y2=602+(j+1)*(j+1)*9;for(let k=-9;k<10;k++){let x1=vanish+k*(y1-horizon)*2,x2=vanish+k*(y2-horizon)*2,xx1=vanish+(k+1)*(y1-horizon)*2,xx2=vanish+(k+1)*(y2-horizon)*2;poly(c,[[x1,y1],[xx1,y1],[xx2,y2],[x2,y2]],(k+j)%2?'rgba(4,16,21,.32)':'rgba(131,142,104,.08)','rgba(156,164,127,.05)',1)}}
    glow(c,311,645,230,'rgba(86,140,131,.09)');glow(c,1129,645,230,'rgba(86,140,131,.09)');
    ellipse(c,720,686,460,70,null,'rgba(154,155,109,.13)',2);ellipse(c,720,686,440,66,null,'rgba(154,155,109,.05)',1);
    // Gilt inlay marks the fighting ground.
    line(c,90,668,1350,668,'rgba(206,183,114,.23)',2);[90,1350].forEach(x=>{poly(c,[[x-8,668],[x,660],[x+8,668],[x,676]],'#8b8052')});
    rope(c,0,161,575);rope(c,1279,1440,575);
    // Fine dust catches both colors of light.
    c.save();for(let i=0;i<49;i++){let x=(i*137.81+Math.sin(t*.08+i)*19)%1440,y=130+(i*71.2+t*(1+i%3))%450;ellipse(c,x,y,.6+(i%3)*.2,.6+(i%3)*.2,`rgba(208,218,180,${.06+Math.sin(i+t*.6)*.04})`)}c.restore();
    const vig=c.createRadialGradient(720,390,290,720,390,870);vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,4,10,.82)');c.fillStyle=vig;c.fillRect(0,0,1440,810);
    c.restore();
  }
  function armor(c,p,a,b){return grad(c,-45,-230,65,-20,[[0,a],[.33,p],[.5,b],[.67,p],[1,a]])}
  function drawKnight(c,x,y,o={}){
    const t=o.time||0,p=o.progress??o.phase??0,pose=o.pose||'idle',f=o.facing===-1?-1:1;
    const walk=pose==='walk'?Math.sin(t*9):Math.sin(t*2)*.13;
    const bob=pose==='walk'?Math.abs(Math.sin(t*9))*5:Math.sin(t*2.3)*2;
    const attack=pose==='attack'?Math.sin(clamp(p,0,1)*Math.PI):0;
    let base='#687b7e',dark='#172b36',light='#bad2c8',edge='#8ea597',glint='#e5dfab';
    if(o.skin==='brass'){base='#947247';dark='#302b29';light='#d9b773';edge='#c4a668';glint='#ffe1a0'}
    if(o.skin==='frost'){base='#6c9ca5';dark='#193747';light='#c5f6ed';edge='#92e8e5';glint='#e5ffff'}
    if(o.skin==='obsidian'){base='#353d55';dark='#111a29';light='#9c8bc1';edge='#9d83bd';glint='#d7b4ff'}
    const special={verdigris:['#4a947b','#152f29','#b8dfad','#91c9a4','#e5ffc5'],ember:['#a54e37','#351b24','#ffc187','#d88c57','#fff1b7'],royal:['#67528b','#211c3c','#dbb9ef','#bba0df','#ffebff'],solar:['#b7953c','#3e321b','#fff0ac','#edcf76','#ffffe1']}[o.skin];
    if(special)[base,dark,light,edge,glint]=special;
    const cloth={brass:['#581e32','#26182b','#7a3041'],frost:['#35708a','#16293e','#77b7bd'],obsidian:['#4d2f62','#1b162a','#805e91'],verdigris:['#22624e','#12291f','#6f9f60'],ember:['#a43127','#36151d','#e77b37'],royal:['#62408a','#241637','#a46ace'],solar:['#b28c38','#44311e','#e9cf7d']}[o.skin]||['#581e32','#26182b','#7a3041'];
    c.save();c.translate(x,y);ellipse(c,0,0,77,13,'rgba(0,0,0,.49)');c.scale(f,1);
    if(pose==='dead'){c.translate(-35,-10);c.rotate(-1.44)}else if(pose==='dodge'){c.translate(-23,25);c.rotate(-.16)}else if(pose==='hurt'){c.translate(-12,3);c.rotate(-.08)}
    c.translate(attack*20,-bob);
    const metal=armor(c,base,dark,light);
    // Velvet cape, textile folds and embroidered edge.
    path(c,q=>{q.moveTo(-23,-201);q.bezierCurveTo(-58,-168,-45,-95,-72-walk*4,-38);q.lineTo(-30,-49);q.lineTo(-1,-31);q.bezierCurveTo(5,-97,17,-160,10,-194);q.closePath()},grad(c,-60,-190,20,-45,[[0,cloth[0]],[.5,cloth[1]],[1,cloth[2]]]),'#aa7664',1);
    path(c,q=>{q.moveTo(-26,-179);q.bezierCurveTo(-44,-124,-29,-79,-45,-47);q.moveTo(-15,-176);q.bezierCurveTo(-28,-125,-10,-83,-18,-44)},null,cloth[2],1);
    // Back leg and articulated greaves.
    let legs=[{x:-19,step:-walk*17,shadow:true},{x:18,step:walk*18,shadow:false}];
    legs.forEach((L,i)=>{c.save();c.translate(L.x,-94);c.rotate((i?-.1:.1)+L.step*.009);poly(c,[[-16,-8],[14,-8],[13,39],[6,52],[-13,44]],metal,edge,1.5);ellipse(c,0,45,16,12,base,edge,2);poly(c,[[-13,47],[13,47],[10,81],[17,88],[14,94],[-13,94],[-16,84]],metal,edge,1.5);line(c,0,56,0,81,light,1);poly(c,[[-15,83],[12,83],[29,90],[32,95],[-17,95]],metal,edge,1.5);line(c,-9,90,22,92,glint,.8);c.restore()});
    // Rear arm and sword. Bladed silhouette changes dramatically on attack.
    c.save();c.translate(23,-178);c.rotate(pose==='guard'?-.5:attack*1.36-.13);
    ellipse(c,0,0,25,19,metal,edge,2);poly(c,[[-8,12],[15,11],[21,46],[3,53],[-12,32]],metal,edge,1.5);ellipse(c,11,46,12,12,dark,edge,1.5);
    poly(c,[[3,46],[22,42],[39,15],[31,4],[22,11],[9,27]],metal,edge,1.5);ellipse(c,32,7,11,9,base,edge,1.5);
    c.translate(31,6);c.rotate(.4+attack*.07);rr(c,-4,-26,8,31,2,'#372d25','#a68b56',1);for(let z=-23;z<-2;z+=5)line(c,-4,z,4,z-3,'#8f7950',1);
    ellipse(c,0,7,6,6,'#a58e57','#dfc58b');poly(c,[[-25,-27],[-24,-33],[-6,-35],[0,-40],[6,-35],[24,-33],[25,-27],[5,-30],[-5,-30]],'#a18d59','#e2c68c',1);
    poly(c,[[-6,-35],[-8,-139],[0,-161],[8,-139],[6,-35]],grad(c,-8,0,8,0,[[0,'#627d85'],[.46,'#d8e8de'],[.52,'#eff8df'],[.6,'#8ca9ac'],[1,'#3c555f']]),'#b6d9cc',1);
    line(c,0,-43,0,-146,'#f5f6d3',1);c.restore();
    // Torso: separate breastplate, rolled edges, engraved moon.
    poly(c,[[-27,-190],[-7,-205],[20,-197],[33,-178],[25,-121],[9,-106],[-22,-119],[-36,-167]],metal,edge,2);
    path(c,q=>{q.moveTo(-27,-182);q.bezierCurveTo(-14,-170,5,-170,27,-183);q.moveTo(-26,-151);q.bezierCurveTo(-12,-143,8,-143,27,-151)},null,light,1);
    line(c,-1,-188,0,-122,light,1);ellipse(c,3,-160,10,13,null,'#c4b279',1.3);path(c,q=>{q.moveTo(8,-171);q.bezierCurveTo(-5,-170,-5,-150,8,-149);q.bezierCurveTo(-12,-145,-17,-174,8,-171)},'#cabd86');
    for(let i=0;i<3;i++)poly(c,[[-26-i,-123+i*10],[25+i,-121+i*10],[30+i,-107+i*10],[0,-101+i*10],[-32-i,-108+i*10]],metal,edge,1.3);
    rr(c,-29,-124,57,8,2,'#332c25','#917a53',1);rr(c,-4,-125,11,11,2,'#a08a58','#ddc28b',1);
    // Near shoulder and shield arm.
    ellipse(c,-27,-177,26,20,metal,edge,2);path(c,q=>{q.moveTo(-50,-177);q.quadraticCurveTo(-28,-189,-6,-175)},null,light,1);
    let shieldX=pose==='guard'?47:4,shieldY=pose==='guard'?-154:-128;
    poly(c,[[-44,-170],[-23,-168],[-10,-133],[-24,-115],[-41,-137]],metal,edge,1.5);line(c,-28,-119,shieldX,shieldY,'#829391',16);
    c.save();c.translate(shieldX,shieldY);c.rotate(pose==='guard'?-.07:-.14);
    path(c,q=>{q.moveTo(-31,-35);q.lineTo(26,-35);q.lineTo(34,-9);q.bezierCurveTo(36,27,13,54,0,62);q.bezierCurveTo(-23,46,-39,19,-39,-9);q.closePath()},'#283d43','#c4b27f',3);
    path(c,q=>{q.moveTo(-25,-28);q.lineTo(21,-28);q.lineTo(27,-6);q.bezierCurveTo(26,21,12,42,0,51);q.bezierCurveTo(-19,36,-30,14,-31,-7);q.closePath()},grad(c,-30,-30,27,50,[[0,base],[.6,dark],[1,cloth[1]]]),'#617a73',1);
    line(c,-28,-3,26,-3,'#a3905e',4);line(c,-3,-27,-1,45,'#a3905e',4);ellipse(c,-2,-3,11,11,'#9c8956','#dbca92',1);ellipse(c,-4,-6,3,3,'#e7dfb2');
    [[-25,-27],[20,-27],[-29,-7],[25,-7],[0,48]].forEach(([a,b])=>ellipse(c,a,b,2,2,'#dfc68a'));c.restore();
    // Gorget and expressive closed visor.
    ellipse(c,-2,-205,21,10,metal,edge,1.5);
    path(c,q=>{q.moveTo(-23,-228);q.bezierCurveTo(-23,-256,9,-269,24,-243);q.lineTo(27,-217);q.lineTo(14,-205);q.lineTo(-13,-207);q.lineTo(-25,-219);q.closePath()},metal,edge,2);
    poly(c,[[-23,-231],[21,-238],[33,-224],[21,-210],[-19,-213]],grad(c,-25,-230,30,-215,[[0,'#3d555d'],[.4,'#7b9698'],[1,'#203643']]),edge,1.5);
    path(c,q=>{q.moveTo(-17,-229);q.lineTo(24,-232);q.lineTo(29,-226);q.lineTo(-15,-223);q.closePath()},'#071b24','#9fb4a3',1);
    c.save();c.shadowColor='#b7f9d5';c.shadowBlur=8;line(c,-13,-226,22,-229,'#b2e9cf',1.5);c.restore();
    for(let j=0;j<5;j++)line(c,4+j*4,-219,5+j*4,-213,'#0c2530',1.6);
    poly(c,[[-4,-254],[2,-263],[7,-249],[6,-237],[-1,-235]],'#b0a173','#e5cb92');
    path(c,q=>{q.moveTo(1,-258);q.bezierCurveTo(-15,-287,-49,-278,-44,-251);q.bezierCurveTo(-40,-236,-59,-224,-64,-236);q.bezierCurveTo(-57,-210,-20,-230,-25,-252);q.bezierCurveTo(-22,-266,-8,-261,1,-258)},grad(c,-50,-280,-10,-220,[[0,cloth[2]],[.5,cloth[0]],[1,cloth[1]]]),'#b16a67',1);
    c.restore();
  }
  function bone(c,ax,ay,bx,by,width=8,col='#c8bea1',edge='#736d54'){
    c.save();c.lineCap='round';line(c,ax,ay,bx,by,edge,width+3);line(c,ax,ay,bx,by,col,width);line(c,ax-1,ay-1,bx-1,by-1,'rgba(255,248,209,.44)',Math.max(1,width*.2));ellipse(c,ax,ay,width*.68,width*.55,col,edge,1);ellipse(c,bx,by,width*.7,width*.56,col,edge,1);c.restore();
  }
  function drawRex(c,x,y,o={}){
    const t=o.time||0,p=o.progress??o.phase??0,pose=o.pose||'idle',f=o.facing===-1?-1:1;
    const attack=pose==='attack'?Math.sin(clamp(p,0,1)*Math.PI):0,walking=pose==='walk';let bob=walking?Math.abs(Math.sin(t*6))*6:Math.sin(t*1.9)*3;
    const col=o.skin==='frost'?'#b6e0dc':o.skin==='obsidian'?'#9894b5':o.skin==='brass'?'#d4b77e':'#c6c0a4',hi=o.skin==='frost'?'#e0fff4':'#e4dfbf',edge=o.skin==='obsidian'?'#524567':'#756f55';
    c.save();c.translate(x,y);ellipse(c,-25,0,156,20,'rgba(0,0,0,.52)');c.scale(f,1);
    if(pose==='dead'){c.translate(-25,-9);c.scale(1,.37);c.rotate(.11)}else if(pose==='dodge'){c.translate(-29,20);c.rotate(-.08)}else if(pose==='hurt'){c.rotate(-.06);c.translate(-8,0)}
    c.translate(attack*35,-bob);
    // Continuous sweeping tail, each fossil vertebra with a dorsal spur.
    const tail=[];for(let i=0;i<13;i++){let a=i/12;tail.push([-57-a*207,-200+a*68+Math.sin(a*3.3+t*1.7)*a*13])}
    for(let i=tail.length-1;i>0;i--){const [a,b]=tail[i],[A,B]=tail[i-1],ww=2+(12-i)*.55;bone(c,a,b,A,B,ww,col,edge);poly(c,[[A-3,B],[A-6,B-10-(12-i)*.9],[A+4,B-2]],col,edge,.8)}
    // The far hindlimb remains a darker fossil in perspective.
    const steps=walking?Math.sin(t*6)*19:Math.sin(t*1.9)*2;
    c.save();c.globalAlpha=.6;bone(c,-52,-178,-77+steps,-109,19,col,edge);bone(c,-77+steps,-109,-61-steps,-38,12,col,edge);bone(c,-61-steps,-38,-47-steps,-9,9,col,edge);[-5,10,24].forEach(z=>bone(c,-47-steps,-10,-29-steps+z,-3,5,col,edge));c.restore();
    // Sacrum, pelvis and all individual curved ribs.
    path(c,q=>{q.moveTo(-88,-208);q.bezierCurveTo(-102,-180,-67,-154,-31,-172);q.lineTo(-13,-196);q.lineTo(-30,-215);q.closePath()},col,edge,2);
    ellipse(c,-59,-192,21,14,'#263a36',edge,2);line(c,-82,-209,-23,-208,hi,3);
    for(let i=0;i<9;i++){
      const xx=-47+i*12,top=-218-Math.sin(i/9*Math.PI)*21,bot=-145+Math.sin(i*.22)*8,wide=22-i*.8;
      c.save();c.lineCap='round';path(c,q=>{q.moveTo(xx,top);q.bezierCurveTo(xx+wide+15,top+25,xx+wide,bot+8,xx-7,bot);q.bezierCurveTo(xx-17,bot-1,xx-21,bot-20,xx-19,bot-31)},null,edge,7.5);
      path(c,q=>{q.moveTo(xx,top);q.bezierCurveTo(xx+wide+15,top+25,xx+wide,bot+8,xx-7,bot);q.bezierCurveTo(xx-17,bot-1,xx-21,bot-20,xx-19,bot-31)},null,col,5.5);
      path(c,q=>{q.moveTo(xx+1,top+4);q.bezierCurveTo(xx+wide+14,top+25,xx+wide-2,bot+5,xx-6,bot-2)},null,hi,1);c.restore();
    }
    // Vertebral column from hip to chest and rising neck.
    let spine=[[-80,-215],[-64,-220],[-48,-227],[-31,-232],[-14,-237],[4,-237],[21,-233],[39,-225],[56,-223],[70,-231],[77,-246],[80,-262],[86,-275]];
    for(let i=0;i<spine.length-1;i++){const [a,b]=spine[i],[A,B]=spine[i+1];bone(c,a,b,A,B,11,col,edge);poly(c,[[a-5,b-1],[a-7,b-22+(i>8?5:0)],[a+3,b-18+(i>8?5:0)],[a+8,b-1]],col,edge,1)}
    bone(c,35,-222,18,-174,10,col,edge);bone(c,18,-174,59,-182,7,col,edge);
    // Tiny unmistakable two-finger forearms.
    c.save();c.globalAlpha=.75;bone(c,48,-205,69,-179,7,col,edge);bone(c,69,-179,91,-178,5,col,edge);bone(c,91,-178,99,-187,3,col,edge);bone(c,91,-178,102,-177,3,col,edge);c.restore();
    bone(c,38,-196,58,-166,8,col,edge);bone(c,58,-166,85,-159-attack*15,5,col,edge);bone(c,85,-159-attack*15,96,-167-attack*15,3,col,edge);bone(c,85,-159-attack*15,97,-156-attack*15,3,col,edge);
    // Near leg: large femur, kneecap, two shin bones and splayed talons.
    bone(c,-52,-189,-19-steps,-114,23,col,edge);ellipse(c,-20-steps,-112,17,14,col,edge,2);
    bone(c,-20-steps,-107,-47+steps,-40,13,col,edge);bone(c,-9-steps,-110,-33+steps,-40,6,col,edge);
    bone(c,-42+steps,-40,-20+steps,-11,11,col,edge);
    [[-4,-2],[15,-1],[29,2]].forEach(([dx,dy],i)=>{bone(c,-21+steps,-12,dx+steps,dy-5,6,col,edge);poly(c,[[dx+steps-2,dy-9],[dx+steps+9,dy-7],[dx+steps+16,dy+1],[dx+steps+3,dy]],'#dcd4b3',edge,1)});
    // Massive skull carried forward over the rib cage.
    c.save();c.translate(82+attack*15,-273-attack*4);c.rotate(pose==='guard'?-.2:attack*.13+Math.sin(t*1.6)*.014);
    // Neck atlas behind skull.
    bone(c,-6,15,-6,-6,12,col,edge);
    path(c,q=>{q.moveTo(-28,-35);q.bezierCurveTo(-13,-63,15,-64,39,-54);q.lineTo(99,-39);q.bezierCurveTo(116,-35,125,-25,123,-13);q.lineTo(114,3);q.lineTo(61,5);q.lineTo(25,18);q.lineTo(-12,13);q.lineTo(-29,-5);q.closePath()},grad(c,-10,-57,70,22,[[0,hi],[.6,col],[1,edge]]),edge,2);
    // Deep temporal openings and triangular orbital socket.
    path(c,q=>{q.moveTo(-16,-34);q.bezierCurveTo(-13,-52,8,-52,14,-39);q.lineTo(8,-14);q.lineTo(-9,-11);q.closePath()},'#182b2c',edge,2);
    path(c,q=>{q.moveTo(24,-40);q.lineTo(50,-31);q.lineTo(43,-10);q.lineTo(22,-13);q.closePath()},'#172b2d',edge,2);
    path(c,q=>{q.moveTo(65,-25);q.lineTo(94,-20);q.lineTo(84,-8);q.lineTo(58,-7);q.closePath()},'#223330',edge,1.5);
    ellipse(c,110,-17,6,4,'#273b36',edge,1);
    // Amber life in a fossil's eye.
    c.save();c.shadowColor=pose==='attack'?'#ff8b46':'#e6bd67';c.shadowBlur=18;ellipse(c,34,-25,5,4,pose==='attack'?'#ffe4ae':'#f8d784');ellipse(c,35,-25,1.7,4,'#372818');c.restore();
    line(c,-16,-57,34,-48,'#f3ead0',1.4);line(c,48,-43,101,-29,hi,1.4);
    // Hinged lower jaw. Idle opens gently, attacks snap wide.
    c.save();c.translate(-11,6);c.rotate(.12+attack*.5+(pose==='guard'?.02:Math.sin(t*2)*.02));
    path(c,q=>{q.moveTo(-5,-1);q.lineTo(16,6);q.lineTo(52,13);q.lineTo(114,8);q.lineTo(110,24);q.lineTo(61,31);q.lineTo(15,24);q.lineTo(-8,8);q.closePath()},col,edge,2);
    path(c,q=>{q.moveTo(26,17);q.lineTo(65,21);q.lineTo(99,17)},null,hi,2);
    for(let i=0;i<9;i++){let z=28+i*9;poly(c,[[z,12],[z+2,-1-i*.2],[z+6,12]],hi,edge,.7)}c.restore();
    for(let i=0;i<10;i++){let z=28+i*9,yy=i<3?8-i:2;poly(c,[[z,yy],[z+3,yy+16-i*.35],[z+7,yy-1]],hi,edge,.8)}
    // Hairline fossil cracks.
    path(c,q=>{q.moveTo(54,-43);q.lineTo(52,-34);q.lineTo(57,-28);q.moveTo(-18,-22);q.lineTo(-23,-16);q.moveTo(91,-28);q.lineTo(87,-20)},null,'#8d886c',.8);
    ellipse(c,-14,10,7,7,col,edge,1.5);c.restore();
    c.restore();
  }
  function drawGuardScene(c,w=1440,h=810,t=0,o={}){
    c.save();c.scale(w/1440,h/810);
    c.fillStyle=grad(c,0,0,1440,810,[[0,'#101f27'],[.5,'#11272b'],[1,'#061219']]);c.fillRect(0,0,1440,810);
    // A quiet museum security room, dawn through a Venetian blind.
    rr(c,820,75,430,385,4,'#2a4144','#65716a',5);c.save();c.beginPath();c.rect(834,88,402,358);c.clip();
    c.fillStyle=grad(c,0,80,0,450,[[0,'#486366'],[.65,'#9b9b79'],[1,'#b3a17b']]);c.fillRect(834,88,402,358);
    for(let i=0;i<12;i++){c.fillStyle='rgba(13,34,38,.64)';c.fillRect(834,99+i*30,402,9)}c.restore();line(c,1034,88,1034,446,'#263c3e',8);
    for(let i=0;i<8;i++)poly(c,[[1217,115+i*38],[1217,128+i*38],[564,810+i*4],[514,810+i*4]],'rgba(219,189,125,.025)');
    // Corkboard, rota, keys and a photograph of the arena.
    rr(c,151,93,390,277,3,'#2b3430','#776e51',7);rr(c,174,116,171,141,2,'#1e3238','#b3a47e',2);
    path(c,q=>arch(q,210,145,90,91),'#17252e','#6d7b6a',2);line(c,178,246,339,246,'#596a54',2);
    c.save();c.translate(382,132);c.rotate(.06);rr(c,0,0,118,157,1,'#c6bf9d');txt(c,'NOCNA ZMIANA',59,22,9,'#313d3a','center','Arial');for(let i=0;i<8;i++)line(c,15,43+i*12,104,43+i*12,'#8a8d75',1);ellipse(c,59,4,3,3,'#9b5545');c.restore();
    for(let j=0;j<3;j++){ellipse(c,212+j*34,308,7,9,null,'#a89b71',3);line(c,212+j*34,316,212+j*34,339,'#aaa07e',3);line(c,212+j*34,334,220+j*34,334,'#aaa07e',3)}
    // Chair and sleepy watchman silhouette.
    rr(c,550,395,235,282,35,'#0b1720','#344a4c',3);rr(c,574,414,187,200,22,'#1b2d35');line(c,591,675,571,790,'#131e26',15);line(c,748,675,774,790,'#131e26',15);
    c.save();c.translate(690,573);c.rotate(o.awake?-.015:-.15);
    poly(c,[[-72,-28],[-103,35],[-82,135],[78,135],[92,35],[50,-30]],grad(c,-80,-20,80,100,[[0,'#344d57'],[1,'#172d39']]),'#5a6b67',2);
    rr(c,-42,-57,80,57,17,'#9a8d72','#c9b591',1);ellipse(c,0,-71,60,65,'#a89a7e','#d0bea0',2);ellipse(c,-54,-69,8,14,'#8e806b');ellipse(c,54,-69,8,14,'#8e806b');
    // A tipped cap, closed eyes and moustache.
    path(c,q=>{q.moveTo(-63,-93);q.lineTo(-58,-132);q.bezierCurveTo(-25,-153,29,-149,60,-129);q.lineTo(63,-94);q.closePath()},'#203a49','#6f857e',2);
    path(c,q=>{q.moveTo(-65,-99);q.bezierCurveTo(-17,-115,35,-108,74,-88);q.bezierCurveTo(30,-72,-12,-85,-65,-91);q.closePath()},'#152b39','#667c73',1.5);
    ellipse(c,2,-120,13,15,'#9d9168','#dec79c',1);txt(c,'M',2,-116,12,'#243c43');
    if(o.awake){
      ellipse(c,-25,-66,11,10,'#e0d8b9','#5e6656',1.2);
      ellipse(c,25,-65,11,10,'#e0d8b9','#5e6656',1.2);
      ellipse(c,-24,-65,4,6,'#293c38');ellipse(c,24,-64,4,6,'#293c38');
      ellipse(c,-23,-67,1.3,1.6,'#fff6d4');ellipse(c,25,-66,1.3,1.6,'#fff6d4');
      path(c,q=>{q.moveTo(-36,-82);q.quadraticCurveTo(-25,-88,-14,-81);q.moveTo(14,-81);q.quadraticCurveTo(25,-88,36,-81)},null,'#4f5145',2.5);
      ellipse(c,0,-17,8,11,'#54473a','#8e7e61',1);
    }else{
      path(c,q=>{q.moveTo(-35,-66);q.quadraticCurveTo(-25,-58,-15,-66);q.moveTo(15,-65);q.quadraticCurveTo(25,-57,35,-64)},null,'#394842',2.5);
    }
    path(c,q=>{q.moveTo(-3,-62);q.lineTo(-8,-42);q.lineTo(7,-39)},null,'#746c59',2);path(c,q=>{q.moveTo(-25,-30);q.quadraticCurveTo(-8,-46,0,-33);q.quadraticCurveTo(11,-47,27,-30);q.quadraticCurveTo(11,-21,0,-29);q.quadraticCurveTo(-13,-20,-25,-30)},'#4f5145');
    rr(c,25,30,26,33,3,'#927f52','#c7b17b',1);txt(c,'M',38,52,16,'#243a40');
    bone(c,-64,20,-92,84,26,'#2c4754','#59706e');bone(c,-92,84,-26,100,25,'#2c4754','#59706e');ellipse(c,-16,101,26,14,'#a99c7e');
    bone(c,63,20,94,89,26,'#2c4754','#59706e');bone(c,94,89,26,100,25,'#2c4754','#59706e');ellipse(c,17,101,25,14,'#a99c7e');c.restore();
    // Foreground desk, lamp and coffee.
    poly(c,[[333,661],[1103,661],[1206,810],[229,810]],grad(c,0,660,0,810,[[0,'#35433a'],[.1,'#58604a'],[1,'#192b2b']]),'#6e7252',2);
    line(c,337,667,1105,667,'#a28f60',2);
    rr(c,847,646,124,13,5,'#202d29','#8d8963');line(c,907,645,915,542,'#5a6654',9);line(c,915,542,1000,487,'#5a6654',9);ellipse(c,915,542,10,10,'#9b9168');
    path(c,q=>{q.moveTo(979,469);q.lineTo(1044,475);q.lineTo(1082,523);q.lineTo(948,513);q.closePath()},'#2e554c','#91a78a',2);ellipse(c,1015,517,67,8,'#a8b17d');
    glow(c,995,649,180,'rgba(220,189,107,.14)');
    rr(c,399,644,59,57,7,'#c3c1a2','#e1d6b1',2);ellipse(c,428,645,28,8,'#878b73','#e5d9b3',1);ellipse(c,429,646,22,5,'#3c3830');path(c,q=>{q.moveTo(459,653);q.bezierCurveTo(491,646,489,691,459,680)},null,'#b7ba9c',7);txt(c,'MUZEUM',428,675,8,'#345252','center','Arial');
    for(let i=0;i<3;i++)path(c,q=>{let xx=420+i*10+Math.sin(t+i)*4;q.moveTo(xx,630);q.bezierCurveTo(xx-12,613,xx+12,600,xx,584)},null,'rgba(210,219,197,.13)',2);
    rr(c,516,724,299,30,3,'#b9b195','#d3c5a0',1);txt(c,'NOCNA ZMIANA · RAPORT STRÓŻA',665,744,12,'#364c49','center','Arial');
    let vig=c.createRadialGradient(720,430,200,720,430,850);vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,8,16,.85)');c.fillStyle=vig;c.fillRect(0,0,1440,810);c.restore();
  }
  window.MuseumArt={drawArena,drawKnight,drawRex,drawGuardScene};
})();
