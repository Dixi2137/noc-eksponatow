/* Noc eksponatów — original, resolution independent museum illustration. */
(() => {
  'use strict';
  const TAU=Math.PI*2;
  const knightLooks=new Map((window.MuseumKnights?.skins||[]).map(s=>[s.id,s]));
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
  const themes={
    museum:{bg:[[0,'#050b12'],[.65,'#172824'],[1,'#090f14']],wall:['#132124','#122023'],sign:['MUSEUM','HISTORIA NATURALIS'],consoles:['ARMA · XV','CRETACEOUS'],floor:[[0,'#24392f'],[.25,'#243732'],[1,'#101e23']],window:'moon',particles:'dust',light:'rgba(255,203,116,.09)',banner:null},
    sparta:{bg:[[0,'#140b05'],[.65,'#3b2a1b'],[1,'#130c07']],wall:['#2b2219','#27201a'],sign:['ΘΕΡΜΟΠΥΛΑΙ','SALA ANTYKU · 480 P.N.E.'],consoles:['SPARTA','HOPLITAI'],floor:[[0,'#4d3d27'],[.25,'#3f3121'],[1,'#1a130d']],window:'sun',particles:'dust',light:'rgba(255,176,96,.12)',banner:{color:'#8b1a1a',edge:'#d08a4a',glyph:'Λ'}},
    napoleon:{bg:[[0,'#0a0e15'],[.65,'#27313e'],[1,'#0c1118']],wall:['#1d2531','#1b222d'],sign:['BORODINO','SALA EMPIRE · 1812'],consoles:['GRANDE ARMÉE','1812'],floor:[[0,'#d6dbe0'],[.25,'#b4bcc5'],[1,'#56606b']],window:'snow',particles:'snow',light:'rgba(200,222,255,.10)',banner:{color:'#1f3a6b',edge:'#d4af37',glyph:'N'}},
    bunker:{bg:[[0,'#0f0f0e'],[.65,'#2b2b27'],[1,'#121211']],wall:['#3b3b37','#373733'],sign:['FÜHRERBUNKER','BERLIN · 1945'],consoles:['1945','BERLIN'],floor:[[0,'#3c3b36'],[.25,'#34332f'],[1,'#17171a']],window:'none',particles:'ash',light:'rgba(255,222,160,.07)',banner:{color:'#4d4634',edge:'#8a7f5e',glyph:''}},
    hall:{bg:[[0,'#0c0a06'],[.65,'#2d2416'],[1,'#0e0b07']],wall:['#2a2219','#271f18'],sign:['SALA PRYWATNA','KOLEKCJA NOCNEGO STRÓŻA'],consoles:['ZBROJE','BROŃ'],floor:[[0,'#3a2f1f'],[.25,'#32291c'],[1,'#15100b']],window:'moon',particles:'dust',light:'rgba(255,214,140,.11)',banner:null},
    rome:{bg:[[0,'#1a1410'],[.65,'#4a3a2a'],[1,'#171210']],wall:['#4a4238','#453d34'],sign:['SPQR','SALA CESARSKA'],consoles:['ROMA','AVE'],floor:[[0,'#6a5a48'],[.25,'#5a4c3c'],[1,'#241c14']],window:'sun',particles:'dust',light:'rgba(255,200,120,.12)',banner:{color:'#8b1a1a',edge:'#d4af37',glyph:'SPQR'}},
    persia:{bg:[[0,'#120a1a'],[.65,'#3a2050'],[1,'#120a18']],wall:['#3a2a4a','#352644'],sign:['ΠΕΡΣΙΣ','SALA PERSKA'],consoles:['PARSA','ŠĀH'],floor:[[0,'#5a4a30'],[.25,'#4a3c28'],[1,'#1e180f']],window:'sun',particles:'dust',light:'rgba(255,214,120,.12)',banner:{color:'#4a1f6b',edge:'#d4af37',glyph:'☀'}},
    china:{bg:[[0,'#1a0808'],[.65,'#4a1414'],[1,'#160606']],wall:['#4a1a1a','#441818'],sign:['秦','SALA TERAKOTOWA'],consoles:['秦','兵'],floor:[[0,'#3a3028'],[.25,'#302820'],[1,'#141010']],window:'none',particles:'dust',light:'rgba(255,180,100,.12)',banner:{color:'#8a1a1a',edge:'#d4af37',glyph:'龍'}},
    judea:{bg:[[0,'#14100a'],[.65,'#4a3a22'],[1,'#141008']],wall:['#5a4a30','#54452c'],sign:['HIEROSOLYMA','SALA JUDEI'],consoles:['JUDAEA','REX'],floor:[[0,'#7a6a48'],[.25,'#6a5a3c'],[1,'#2a2214']],window:'sun',particles:'dust',light:'rgba(255,220,150,.10)',banner:{color:'#7a1f2e',edge:'#c9a040',glyph:'✡'}},
    steppe:{bg:[[0,'#0e1420'],[.65,'#3a4a5a'],[1,'#0e1418']],wall:['#4a3a2a','#443424'],sign:['ULUS','SALA STEPU'],consoles:['ORDA','CHAN'],floor:[[0,'#5a6a3a'],[.25,'#4a5a30'],[1,'#1a2010']],window:'sun',particles:'dust',light:'rgba(200,220,255,.10)',banner:{color:'#2a4a8a',edge:'#c9a040',glyph:'ᠮ'}},
    castle:{bg:[[0,'#0a0a10'],[.65,'#2a2a34'],[1,'#0a0a0e']],wall:['#3a3a44','#34343e'],sign:['POENARI','SALA DRAKULI'],consoles:['VLAD','III'],floor:[[0,'#3a3a44'],[.25,'#30303a'],[1,'#141418']],window:'moon',particles:'dust',light:'rgba(255,120,120,.10)',banner:{color:'#5a0f1e',edge:'#8a8a90',glyph:'†'}},
    church:{bg:[[0,'#0c0a08'],[.65,'#2a2420'],[1,'#0a0806']],wall:['#2e2824','#2a2420'],sign:['SANCTUM OFFICIUM','SALA INKWIZYCJI'],consoles:['FIDES','IGNIS'],floor:[[0,'#3a3028'],[.25,'#302820'],[1,'#141010']],window:'none',particles:'dust',light:'rgba(255,200,120,.14)',banner:{color:'#121212',edge:'#c9a040',glyph:'✝'}},
    aztec:{bg:[[0,'#0a140e'],[.65,'#2a4a30'],[1,'#0a120c']],wall:['#4a4a3a','#444434'],sign:['TENOCHTITLAN','SALA KONKWISTY'],consoles:['MEXICA','ORO'],floor:[[0,'#6a6a4a'],[.25,'#5a5a3c'],[1,'#242418']],window:'sun',particles:'dust',light:'rgba(255,220,120,.12)',banner:{color:'#1f6b4a',edge:'#d4af37',glyph:'☉'}},
    tsar:{bg:[[0,'#0e0a08'],[.65,'#3a2a1a'],[1,'#0e0a06']],wall:['#4a2a1a','#442616'],sign:['ЦАРЬ','SALA CARÓW'],consoles:['МОСКВА','ЦАРЬ'],floor:[[0,'#d8dde2'],[.25,'#b8c0c8'],[1,'#5f6a74']],window:'snow',particles:'snow',light:'rgba(255,214,120,.12)',banner:{color:'#8a1a1a',edge:'#d4af37',glyph:'☦'}},
    pirate:{bg:[[0,'#06101a'],[.65,'#1a3a4a'],[1,'#06100f']],wall:['#4a3a2a','#443424'],sign:['QUEEN ANNE\u2019S REVENGE','SALA PIRATÓW'],consoles:['RUM','☠'],floor:[[0,'#5a4a30'],[.25,'#4a3c28'],[1,'#1e180f']],window:'moon',particles:'dust',light:'rgba(200,220,255,.10)',banner:{color:'#111111',edge:'#e8e2d0',glyph:'☠'}},
    revolution:{bg:[[0,'#0a0c14'],[.65,'#2a3040'],[1,'#0a0c10']],wall:['#3a3a4a','#343444'],sign:['LIBERTÉ','SALA REWOLUCJI'],consoles:['1789','1794'],floor:[[0,'#4a4a4a'],[.25,'#3c3c3c'],[1,'#181818']],window:'moon',particles:'dust',light:'rgba(255,220,180,.10)',banner:{color:'#1f3a6b',edge:'#c0392b',glyph:'⚜'}},
    jungle:{bg:[[0,'#06120a'],[.65,'#1a3a20'],[1,'#06100a']],wall:['#2a4a2a','#264426'],sign:['CONGO','SALA KOLONIALNA'],consoles:['RZEKA','DŻUNGLA'],floor:[[0,'#4a5a30'],[.25,'#3c4a28'],[1,'#141c10']],window:'sun',particles:'dust',light:'rgba(200,255,160,.10)',banner:{color:'#1a2a4a',edge:'#d4af37',glyph:'✶'}},
    speakeasy:{bg:[[0,'#0e0806'],[.65,'#3a1a10'],[1,'#0e0806']],wall:['#4a2a1a','#442616'],sign:['SPEAKEASY','SALA PROHIBICJI'],consoles:['1929','GIN'],floor:[[0,'#3a2a1a'],[.25,'#302216'],[1,'#140e0a']],window:'none',particles:'ash',light:'rgba(255,160,80,.14)',banner:{color:'#4a4a52',edge:'#d4af37',glyph:'$'}},
    fascist:{bg:[[0,'#0c0c0c'],[.65,'#2a2a2a'],[1,'#0c0c0c']],wall:['#3a3a3a','#343434'],sign:['PALAZZO VENEZIA','SALA FASZYZMU'],consoles:['DUX','1940'],floor:[[0,'#4a4a4a'],[.25,'#3c3c3c'],[1,'#181818']],window:'none',particles:'ash',light:'rgba(255,220,180,.08)',banner:{color:'#111111',edge:'#8a8a90',glyph:'⚒'}},
    japan:{bg:[[0,'#140808'],[.65,'#3a1414'],[1,'#120606']],wall:['#e8e2d0','#dcd6c4'],sign:['大本営','SALA PACYFIKU'],consoles:['東京','1941'],floor:[[0,'#4a3a2a'],[.25,'#3c2e22'],[1,'#181210']],window:'sun',particles:'dust',light:'rgba(255,200,200,.10)',banner:{color:'#e8e2d0',edge:'#b3202a',glyph:'●'}},
    hell:{bg:[[0,'#1a0404'],[.6,'#5a1010'],[1,'#120202']],wall:['#4a1a1a','#3a1414'],sign:['INFERNO','PIEKŁO'],consoles:['∞','666'],floor:[[0,'#8a2a10'],[.25,'#6a2010'],[1,'#200404']],window:'none',particles:'ash',light:'rgba(255,120,60,.16)',banner:{color:'#2a0606',edge:'#ff6a3a',glyph:'666'}},
    desert:{bg:[[0,'#1a1408'],[.65,'#5a4a28'],[1,'#1a1408']],wall:['#6a5a3a','#645434'],sign:['الصحراء','SALA PUSTYNI'],consoles:['1991','2011'],floor:[[0,'#8a7a50'],[.25,'#7a6a44'],[1,'#2e2816']],window:'sun',particles:'dust',light:'rgba(255,230,160,.12)',banner:{color:'#2a8a4a',edge:'#d4af37',glyph:'☾'}},
    cartel:{bg:[[0,'#0c0a14'],[.65,'#2a1a3a'],[1,'#0c0a12']],wall:['#3a2a4a','#342644'],sign:['MEDELLÍN','SALA KARTELI'],consoles:['PLATA','PLOMO'],floor:[[0,'#4a3a3a'],[.25,'#3c2e2e'],[1,'#181212']],window:'moon',particles:'dust',light:'rgba(255,120,200,.12)',banner:{color:'#2a3a6a',edge:'#f0f0f0',glyph:'$'}},
    palace:{bg:[[0,'#0c0c10'],[.65,'#2a2a30'],[1,'#0c0c0e']],wall:['#4a4a4a','#444444'],sign:['CASA POPORULUI','SALA DYKTATORÓW'],consoles:['1989','KC'],floor:[[0,'#5a5a5a'],[.25,'#4a4a4a'],[1,'#1c1c1c']],window:'none',particles:'ash',light:'rgba(255,220,180,.08)',banner:{color:'#8a1a1a',edge:'#d4af37',glyph:'☭'}},
    kremlin:{bg:[[0,'#170808'],[.65,'#3f1414'],[1,'#130606']],wall:['#4b1b1b','#451919'],sign:['КРЕМЛЬ','MOSKWA · 1953'],consoles:['1953','МОСКВА'],floor:[[0,'#5c2323'],[.25,'#4b1d1d'],[1,'#1f0b0b']],window:'moon',particles:'dust',light:'rgba(255,204,124,.10)',banner:{color:'#b3202a',edge:'#e8c547',glyph:'★'}}
  };
  function banner(c,x,y,w,h,b){
    rr(c,x-6,y-10,w+12,12,2,'#3b352a','#8a7f5e');
    path(c,q=>{q.moveTo(x,y);q.lineTo(x+w,y);q.lineTo(x+w,y+h-24);q.lineTo(x+w/2,y+h);q.lineTo(x,y+h-24);q.closePath()},grad(c,x,y,x+w,y+h,[[0,b.color],[.5,b.color],[1,'#000000']]),b.edge,2);
    line(c,x+10,y+10,x+10,y+h-30,'rgba(255,255,255,.12)',3);
    if(b.glyph){c.save();c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=6;txt(c,b.glyph,x+w/2,y+h*.56,58,b.edge,'center','Georgia');c.restore()}
  }
  function windowArch(c,x,y,w,h,t,kind='moon'){
    path(c,q=>arch(q,x-15,y-17,w+30,h+20),'#131c22','#615b45',2);
    path(c,q=>arch(q,x-8,y-8,w+16,h+8),'#070e17','#77827b',1);
    c.save();path(c,q=>arch(q,x,y,w,h),null);c.clip();
    c.fillStyle=grad(c,0,y,0,y+h,[[0,'#274858'],[.6,'#112d3d'],[1,'#07141c']]);c.fillRect(x,y,w,h);
    for(let i=0;i<13;i++){let sx=x+((i*71+19)%Math.round(w)),sy=y+24+((i*43)%170);ellipse(c,sx,sy,.7,.7,'#b6d3d0')}
    if(kind==='none'){c.fillStyle='#2f2f2b';c.fillRect(x,y,w,h);for(let r=0;r<9;r++)for(let k=0;k<3;k++)rr(c,x+(k+(r%2)*.5)*w/3-w/6,y+r*h/9,w/3-3,h/9-3,1,'#3a3a35','#232320',1);}
    else if(kind==='sun'){c.fillStyle=grad(c,0,y,0,y+h,[[0,'#d98c3a'],[.6,'#8c3f1f'],[1,'#3a1a10']]);c.fillRect(x,y,w,h);glow(c,x+w*.5,y+90,90,'rgba(255,200,120,.45)');ellipse(c,x+w*.5,y+90,30,30,'#ffd98a');}
    else if(kind==='snow'){c.fillStyle=grad(c,0,y,0,y+h,[[0,'#5c6c7c'],[.6,'#8d99a6'],[1,'#c9d2da']]);c.fillRect(x,y,w,h);for(let i=0;i<40;i++){let sx=x+((i*53+11)%Math.round(w)),sy=y+((i*37+t*18*(1+i%3))%h);ellipse(c,sx,sy,1.4,1.4,'rgba(255,255,255,.8)')}}
    else if(x>800){glow(c,x+w*.63,y+70,66,'rgba(188,225,214,.22)');ellipse(c,x+w*.63,y+70,27,27,'#a2bcb1');ellipse(c,x+w*.63-10,y+63,26,27,'#264353')}
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
  function drawArena(c,w=1440,h=810,t=0,themeKey='museum',overrides=null){
    const T=overrides?{...(themes[themeKey]||themes.museum),...overrides}:(themes[themeKey]||themes.museum);
    c.save();c.scale(w/1440,h/810);
    c.fillStyle=grad(c,0,0,0,810,T.bg);c.fillRect(0,0,1440,810);
    // Deep gallery and coffered stonework.
    for(let x=0;x<1440;x+=160){c.fillStyle=(x/160)%2?T.wall[0]:T.wall[1];c.fillRect(x,100,159,488);line(c,x,105,x,587,'#29352e',1)}
    for(let y=150;y<570;y+=70)line(c,0,y,1440,y,'rgba(155,149,108,.055)',1);
    rr(c,0,80,1440,17,1,'#25312d','#575b47',1);rr(c,0,98,1440,9,1,'#0b161b','#343e36');
    windowArch(c,226,164,170,335,t,T.window);windowArch(c,1044,164,170,335,t,T.window);
    if(T.banner){banner(c,452,200,105,210,T.banner);banner(c,883,200,105,210,T.banner)}else if(T.frames!==false){wallFrame(c,452,238,105,158);wallFrame(c,883,238,105,158)}
    // Center entrance, pediment and museum identity.
    path(c,q=>arch(q,598,210,244,342),'#0b171b','#4b5144',3);
    path(c,q=>arch(q,613,225,214,327),'#0a151a','#343f38',2);
    c.fillStyle=grad(c,613,260,825,530,[[0,'#13272b'],[.5,'#0a181e'],[1,'#050e15']]);c.fillRect(616,332,208,217);
    for(let x=630;x<820;x+=32)line(c,x,337,x,550,'#162827',1);
    ellipse(c,720,281,29,29,'#26392f','#8a7a50',2);ellipse(c,720,281,22,22,null,'#53634a');
    path(c,q=>{q.moveTo(720,262);q.lineTo(720,282);q.lineTo(734,290)},null,'#d9c28a',2);
    txt(c,T.sign[0],720,187,22,'#a8a17c');txt(c,T.sign[1],720,206,8,'#7f8a73','center','Arial');
    // Exhibit consoles.
    [176,1280].forEach((x,i)=>{rr(c,x-45,501,90,63,3,'#182824','#4e5643');rr(c,x-50,495,100,8,2,'#66715b','#888b6b');line(c,x-41,508,x+41,508,'#9b9771',1);txt(c,T.consoles[i],x,533,9,'#939875','center','Arial');line(c,x-25,544,x+25,544,'#454d3d',1)});
    [128,421,1019,1312].forEach(x=>column(c,x));
    // Warm overhead exhibition lights, cold moonlight through glass.
    c.save();c.globalCompositeOperation='screen';
    [311,1129].forEach((x,i)=>{const g=grad(c,x,190,x+(i?-200:200),664,[[0,'rgba(103,168,172,.04)'],[.6,'rgba(57,117,126,.12)'],[1,'rgba(93,157,152,0)']]);poly(c,[[x-55,210],[x+55,210],[x+(i?-30:260),666],[x+(i?-260:30),666]],g)});
    [505,935].forEach(x=>{poly(c,[[x,145],[x-180,649],[x+180,649]],grad(c,x,145,x,650,[[0,T.light],[1,'rgba(255,193,105,0)']]));glow(c,x,146,28,'rgba(241,198,108,.12)')});c.restore();
    [505,935].forEach(x=>{rr(c,x-21,128,42,13,3,'#141b1c','#696447');poly(c,[[x-15,140],[x-10,148],[x+10,148],[x+15,140]],'#97855c');line(c,x-8,148,x+8,148,'#ffe1a1',3)});
    // Continuous plinth and shadowed floor.
    rr(c,0,561,1440,13,1,'#293d33','#6a6c50');rr(c,0,576,1440,26,1,'#101e1f','#314435');
    c.fillStyle=grad(c,0,600,0,810,T.floor);c.fillRect(0,602,1440,208);
    const horizon=572,vanish=720;
    for(let j=0;j<5;j++){const y1=602+j*j*9,y2=602+(j+1)*(j+1)*9;for(let k=-9;k<10;k++){let x1=vanish+k*(y1-horizon)*2,x2=vanish+k*(y2-horizon)*2,xx1=vanish+(k+1)*(y1-horizon)*2,xx2=vanish+(k+1)*(y2-horizon)*2;poly(c,[[x1,y1],[xx1,y1],[xx2,y2],[x2,y2]],(k+j)%2?'rgba(4,16,21,.32)':'rgba(131,142,104,.08)','rgba(156,164,127,.05)',1)}}
    glow(c,311,645,230,'rgba(86,140,131,.09)');glow(c,1129,645,230,'rgba(86,140,131,.09)');
    ellipse(c,720,686,460,70,null,'rgba(154,155,109,.13)',2);ellipse(c,720,686,440,66,null,'rgba(154,155,109,.05)',1);
    // Gilt inlay marks the fighting ground.
    line(c,90,668,1350,668,'rgba(206,183,114,.23)',2);[90,1350].forEach(x=>{poly(c,[[x-8,668],[x,660],[x+8,668],[x,676]],'#8b8052')});
    rope(c,0,161,575);rope(c,1279,1440,575);
    // Fine dust catches both colors of light.
    c.save();const snow=T.particles==='snow',ash=T.particles==='ash';
    for(let i=0;i<(snow?90:49);i++){let x=(i*137.81+Math.sin(t*.08+i)*19)%1440,y=snow?(130+(i*71.2+t*(28+i%5*9))%560):130+(i*71.2+t*(1+i%3))%450;const r=snow?1.2+(i%3)*.5:ash?.9+(i%3)*.4:.6+(i%3)*.2;ellipse(c,x,y,r,r,snow?`rgba(240,246,255,${.35+Math.sin(i+t)*.2})`:ash?`rgba(120,110,100,${.18+Math.sin(i+t*.6)*.08})`:`rgba(208,218,180,${.06+Math.sin(i+t*.6)*.04})`)}c.restore();
    const vig=c.createRadialGradient(720,390,290,720,390,870);vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,4,10,.82)');c.fillStyle=vig;c.fillRect(0,0,1440,810);
    c.restore();
  }
  function armor(c,p,a,b){return grad(c,-45,-230,65,-20,[[0,a],[.33,p],[.5,b],[.67,p],[1,a]])}
  function mixColor(a,b,p){
    const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);
    return '#'+[16,8,0].map(s=>Math.round(((A>>s)&255)*(1-p)+((B>>s)&255)*p).toString(16).padStart(2,'0')).join('');
  }
  function knightEmblem(c,s,ink,shade){
    const m=s.motif;
    c.save();c.lineJoin='round';c.lineCap='round';
    if(['crow','hawk'].includes(m)){
      poly(c,[[-1,-14],[-7,-5],[-21,-15],[-14,0],[-23,-3],[-12,9],[-4,5],[0,19],[5,5],[14,8],[23,-5],[14,-1],[21,-16],[7,-6],[3,-15]],ink,shade,1);
      poly(c,[[0,-13],[9,-8],[1,-5]],ink,shade,.8);
    }else if(['royal','queen','dynasty'].includes(m)){
      poly(c,[[-20,-9],[-12,-3],[-10,-17],[-1,-7],[8,-18],[12,-3],[20,-10],[16,10],[-16,10]],ink,shade,1.1);
      rr(c,-16,10,32,5,1,ink);[-10,0,10].forEach(x=>ellipse(c,x,6,2,2,shade));
    }else if(['ice','frost','quartz','crystal'].includes(m)){
      poly(c,[[0,-24],[13,-5],[9,16],[0,24],[-9,16],[-13,-5]],ink,shade,1.2);
      line(c,0,-22,0,22,shade,1.3);line(c,-12,-5,12,-5,shade,1.2);line(c,0,-5,8,15,shade,1);line(c,0,-5,-8,15,shade,1);
      if(m==='ice'||m==='frost'){line(c,-20,-13,20,13,ink,2);line(c,-20,13,20,-13,ink,2)}
    }else if(['dragon','last-dragon','inferno','lava'].includes(m)){
      poly(c,[[-13,20],[-5,7],[-16,-1],[-8,-14],[-4,-8],[4,-22],[7,-10],[20,-6],[12,0],[21,6],[5,8],[0,18]],ink,shade,1);
      poly(c,[[-9,1],[-21,-13],[-20,6],[-13,13]],ink,shade,1);ellipse(c,8,-5,2,2,shade);
    }else if(['storm','lightning','neon'].includes(m)){
      poly(c,[[4,-24],[-17,4],[-2,3],[-7,23],[18,-7],[3,-5],[10,-24]],ink,shade,1);
      if(m==='neon'){line(c,-21,-17,-21,15,ink,1.5);line(c,20,-18,20,17,ink,1.5)}
    }else if(['sun','dawn'].includes(m)){
      ellipse(c,0,0,9,9,ink,shade,1);for(let i=0;i<12;i++){const a=i*TAU/12;line(c,Math.cos(a)*13,Math.sin(a)*13,Math.cos(a)*21,Math.sin(a)*21,ink,2.2)}
    }else if(['moon','night','shadow','ghost','gladiator'].includes(m)){
      path(c,q=>{q.moveTo(10,-22);q.bezierCurveTo(-24,-22,-25,22,9,22);q.bezierCurveTo(-7,11,-7,-10,10,-22)},ink,shade,1);
      if(m==='ghost'||m==='gladiator'){rr(c,5,-7,12,14,4,ink,shade,1);line(c,8,-3,8,1,shade,1.5);line(c,14,-3,14,1,shade,1.5)}
    }else if(m==='rose'){
      for(let i=0;i<5;i++){const a=i*TAU/5;ellipse(c,Math.sin(a)*7,Math.cos(a)*7,7,7,ink,shade,1)}ellipse(c,0,0,4,4,shade);line(c,0,14,0,23,ink,2);poly(c,[[0,18],[-10,12],[-7,21]],ink);
    }else if(m==='wolf'){
      poly(c,[[-17,-21],[-4,-12],[0,-15],[5,-12],[17,-21],[14,3],[6,17],[0,22],[-6,17],[-14,3]],ink,shade,1);
      line(c,-10,-2,-4,1,shade,2);line(c,10,-2,4,1,shade,2);poly(c,[[-4,9],[4,9],[0,14]],shade);
    }else if(['forest','fern','swamp','wanderer'].includes(m)){
      line(c,0,-23,0,23,ink,2.4);for(let i=0;i<5;i++){const y=-15+i*7,w=5+i*1.8;path(c,q=>{q.moveTo(0,y+5);q.quadraticCurveTo(-w*2,y-9,-w,y-8);q.quadraticCurveTo(-1,y-5,0,y+5);q.moveTo(0,y+5);q.quadraticCurveTo(w*2,y-9,w,y-8);q.quadraticCurveTo(1,y-5,0,y+5)},ink,shade,.6)}
    }else if(m==='scorpion'){
      ellipse(c,0,4,7,12,ink,shade,1);line(c,-5,-2,-16,-12,ink,3);line(c,5,-2,16,-12,ink,3);ellipse(c,-17,-14,5,6,null,ink,3);ellipse(c,17,-14,5,6,null,ink,3);for(let i=0;i<3;i++){line(c,-6,i*6,-15,4+i*6,ink,2);line(c,6,i*6,15,4+i*6,ink,2)}path(c,q=>{q.moveTo(0,15);q.bezierCurveTo(26,25,29,-11,10,-18);q.lineTo(12,-10)},null,ink,4);
    }else if(['mechanic','scrap','golem'].includes(m)){
      for(let i=0;i<8;i++){c.save();c.rotate(i*TAU/8);rr(c,-4,-22,8,10,1,ink,shade,.8);c.restore()}ellipse(c,0,0,15,15,ink,shade,1);ellipse(c,0,0,6,6,shade);
      if(m==='scrap')line(c,-14,14,14,-14,shade,3);
    }else if(['desert','sand'].includes(m)){
      poly(c,[[-22,18],[0,-19],[22,18]],ink,shade,1);poly(c,[[-10,18],[0,0],[10,18]],shade);ellipse(c,12,-17,5,5,ink);
    }else if(m==='venom'||m==='alchemist'){
      path(c,q=>{q.moveTo(-7,-21);q.lineTo(7,-21);q.lineTo(5,-6);q.lineTo(17,13);q.quadraticCurveTo(20,22,10,23);q.lineTo(-10,23);q.quadraticCurveTo(-20,22,-17,13);q.lineTo(-5,-6);q.closePath()},ink,shade,1);line(c,-12,10,12,10,shade,2);ellipse(c,-3,15,2,2,shade);ellipse(c,5,18,2,2,shade);
    }else if(m==='blood'){
      path(c,q=>{q.moveTo(0,-24);q.bezierCurveTo(-6,-9,-18,0,-14,12);q.bezierCurveTo(-10,28,15,25,15,9);q.bezierCurveTo(15,-3,5,-10,0,-24)},ink,shade,1);path(c,q=>{q.moveTo(-8,7);q.quadraticCurveTo(-11,15,-3,18)},null,shade,1.5);
    }else if(m==='cloud'){
      path(c,q=>{q.moveTo(-17,10);q.bezierCurveTo(-31,7,-22,-9,-12,-6);q.bezierCurveTo(-15,-24,11,-26,12,-9);q.bezierCurveTo(27,-12,30,11,15,11);q.closePath()},ink,shade,1.2);line(c,-13,17,13,17,ink,2);
    }else if(m==='stars'){
      poly(c,[[0,-23],[5,-6],[22,-7],[9,4],[14,21],[0,11],[-14,21],[-9,4],[-22,-7],[-5,-6]],ink,shade,1.2);ellipse(c,0,0,4,4,shade);
    }else if(m==='hunter'){
      path(c,q=>{q.moveTo(-12,-23);q.quadraticCurveTo(22,0,-12,23);q.closePath()},null,ink,2.5);line(c,-12,-23,-12,23,ink,1);line(c,-21,0,22,0,ink,2);poly(c,[[22,0],[13,-5],[13,5]],ink);
    }else if(m==='sea'){
      line(c,0,-23,0,20,ink,3);path(c,q=>{q.moveTo(-20,6);q.bezierCurveTo(-15,25,15,25,20,6);q.moveTo(-15,-9);q.lineTo(15,-9)},null,ink,3);ellipse(c,0,-21,5,5,null,ink,2);poly(c,[[-20,6],[-22,16],[-11,11]],ink);poly(c,[[20,6],[22,16],[11,11]],ink);
    }else if(m==='samurai'){
      ellipse(c,0,0,18,18,null,ink,3);[-9,0,9].forEach(x=>poly(c,[[x,-13],[x+4,0],[x,13],[x-4,0]],ink));
    }else{
      poly(c,[[-5,-23],[5,-23],[5,-6],[18,-6],[18,4],[5,4],[5,23],[-5,23],[-5,4],[-18,4],[-18,-6],[-5,-6]],ink,shade,1);ellipse(c,0,-1,3,3,shade);
    }
    c.restore();
  }
  function knightCrest(c,s,C,t){
    const {base,dark,light,edge,glint,cloth}=C,m=s.motif,n=s.number;
    c.save();c.lineJoin='round';
    if(['royal','queen','dynasty','sun','dawn'].includes(m)){
      poly(c,[[-25,-249],[-24,-273],[-14,-263],[-5,-282],[3,-264],[16,-279],[20,-259],[29,-269],[24,-246]],edge,dark,1.3);
      line(c,-22,-250,24,-250,glint,2);[-15,-3,10,21].forEach((x,i)=>ellipse(c,x,-254,2.3,3,i%2?cloth[0]:light,dark,.6));
    }else if(['ice','frost','quartz','crystal'].includes(m)){
      [[-22,-277],[-9,-284],[7,-278],[20,-273]].forEach(([x,y],i)=>{poly(c,[[x-6,-246],[x-7,y+7],[x,y],[x+6,y+11],[x+4,-246]],i%2?light:edge,dark,1);line(c,x,y+3,x,-249,glint,.9)});
    }else if(['dragon','last-dragon','inferno','lava','venom'].includes(m)){
      poly(c,[[-19,-246],[-31,-264],[-30,-281],[-22,-268],[-6,-251]],edge,dark,1.2);poly(c,[[16,-250],[24,-269],[21,-281],[32,-269],[29,-251]],edge,dark,1.2);
      poly(c,[[-4,-253],[0,-282],[8,-267],[7,-249]],n===50?glint:cloth[0],dark,1);
      if(m==='last-dragon'){poly(c,[[-26,-191],[-41,-209],[-39,-184],[-53,-194],[-48,-173]],edge,dark,1);poly(c,[[17,-192],[34,-207],[31,-178],[42,-186],[42,-169]],edge,dark,1)}
    }else if(['crow','hawk'].includes(m)){
      for(let i=0;i<5;i++)poly(c,[[-8+i*5,-252],[-42+i*9,-281+i*2],[-38+i*9,-262],[-18+i*6,-248]],i%2?edge:cloth[0],dark,.9);
      poly(c,[[16,-239],[34,-236],[24,-229]],edge,dark,.9);
    }else if(m==='wolf'||m==='forest'){
      poly(c,[[-23,-246],[-28,-280],[-8,-258]],edge,dark,1.2);poly(c,[[8,-257],[22,-279],[27,-246]],edge,dark,1.2);
      poly(c,[[-21,-254],[-24,-270],[-14,-258]],cloth[0]);poly(c,[[14,-257],[21,-270],[22,-254]],cloth[0]);
      for(let i=0;i<5;i++)poly(c,[[-42+i*13,-188],[-35+i*13,-201],[-27+i*13,-183]],n===12?light:edge,dark,.6);
    }else if(m==='samurai'){
      path(c,q=>{q.moveTo(-25,-250);q.quadraticCurveTo(-40,-270,-22,-281);q.quadraticCurveTo(-19,-257,2,-262);q.quadraticCurveTo(21,-258,25,-281);q.quadraticCurveTo(40,-267,24,-249)},edge,dark,1.5);
      poly(c,[[-24,-220],[-34,-214],[-30,-198],[-18,-207]],base,edge,1);poly(c,[[23,-222],[34,-215],[31,-200],[20,-209]],base,edge,1);
    }else if(['storm','lightning','neon','stars'].includes(m)){
      poly(c,[[-8,-251],[0,-282],[7,-265],[17,-276],[13,-252]],edge,dark,1.3);
      line(c,-19,-242,20,-246,edge,2);if(m==='neon'){c.shadowColor=edge;c.shadowBlur=5;line(c,-15,-222,20,-225,cloth[0],2);line(c,-22,-174,-36,-164,edge,2);line(c,10,-187,21,-177,cloth[0],2);c.shadowBlur=0}
    }else if(['desert','sand','wanderer','hunter','swamp','fern'].includes(m)){
      path(c,q=>{q.moveTo(-24,-246);q.quadraticCurveTo(1,-263,23,-244);q.lineTo(25,-235);q.quadraticCurveTo(0,-247,-23,-235);q.closePath()},cloth[0],edge,1);
      rr(c,-19,-218,45,9,3,cloth[0],edge,1);path(c,q=>{q.moveTo(-18,-216);q.bezierCurveTo(-42,-219,-39,-183,-57,-185);q.lineTo(-49,-174);q.bezierCurveTo(-28,-188,-30,-203,-12,-206)},cloth[0],edge,.8);
      if(m==='fern'||m==='swamp'){for(let i=0;i<4;i++)poly(c,[[-14+i*6,-248],[-30+i*9,-275+i*2],[-7+i*5,-258]],edge,dark,.8)}
    }else if(['ghost','shadow','night','gladiator','moon'].includes(m)){
      path(c,q=>{q.moveTo(-30,-211);q.lineTo(-32,-247);q.quadraticCurveTo(-26,-282,-3,-277);q.quadraticCurveTo(20,-282,28,-251);q.lineTo(32,-235);q.lineTo(20,-243);q.quadraticCurveTo(4,-265,-16,-248);q.lineTo(-18,-215);q.closePath()},cloth[0],edge,1.2);
      if(m==='moon')path(c,q=>{q.moveTo(-2,-281);q.quadraticCurveTo(-29,-260,-4,-252);q.quadraticCurveTo(-14,-264,-2,-281)},edge,dark,1);
      if(m==='ghost'){path(c,q=>{q.moveTo(-22,-211);q.bezierCurveTo(-51,-215,-41,-188,-59,-176);q.lineTo(-50,-194);q.lineTo(-45,-173);q.bezierCurveTo(-28,-184,-34,-200,-17,-203)},cloth[0],edge,.7)}
    }else if(['mechanic','scrap','golem'].includes(m)){
      const gx=-13,gy=-252;for(let i=0;i<8;i++){c.save();c.translate(gx,gy);c.rotate(i*TAU/8);rr(c,-3,-24,6,8,1,edge,dark,.7);c.restore()}ellipse(c,gx,gy,17,17,base,edge,1.5);ellipse(c,gx,gy,7,7,dark,glint,1);ellipse(c,gx,gy,3,3,edge);
      rr(c,-20,-234,48,12,3,dark,edge,1.3);ellipse(c,-7,-228,8,5,light,edge,1);ellipse(c,15,-228,8,5,light,edge,1);line(c,-20,-228,28,-228,edge,1);
    }else if(m==='rose'){
      for(let i=0;i<5;i++)ellipse(c,-5+Math.cos(i*TAU/5)*8,-261+Math.sin(i*TAU/5)*8,7,7,cloth[0],edge,.8);ellipse(c,-5,-261,4,4,edge);line(c,-10,-253,-26,-242,edge,2);poly(c,[[-21,-247],[-29,-259],[-29,-246]],edge);
    }else if(m==='sea'){
      poly(c,[[-21,-250],[-21,-276],[-14,-267],[-5,-282],[4,-266],[20,-276],[22,-249]],edge,dark,1.2);[-16,-5,6,17].forEach(x=>ellipse(c,x,-252,2,3,cloth[0]));
    }else if(m==='alchemist'){
      poly(c,[[-27,-249],[-8,-281],[19,-252]],cloth[0],edge,1.2);rr(c,-28,-254,52,7,2,edge,dark,1);ellipse(c,-7,-267,4,4,light);
    }else if(m==='scorpion'){
      path(c,q=>{q.moveTo(-15,-252);q.bezierCurveTo(-41,-261,-19,-288,-3,-280);q.bezierCurveTo(11,-278,9,-265,17,-263);q.lineTo(8,-257)},null,edge,7);poly(c,[[17,-263],[18,-252],[4,-257]],edge,dark,.8);
    }else if(m==='blood'){
      poly(c,[[-16,-252],[-19,-280],[-3,-261],[4,-282],[9,-261],[24,-274],[20,-249]],edge,dark,1);line(c,-15,-219,8,-214,cloth[0],2);
    }else if(m==='cloud'){
      path(c,q=>{q.moveTo(-24,-250);q.bezierCurveTo(-38,-260,-24,-275,-13,-267);q.bezierCurveTo(-14,-284,10,-284,12,-270);q.bezierCurveTo(28,-276,34,-252,20,-250)},light,edge,1);
    }else{
      path(c,q=>{q.moveTo(0,-254);q.bezierCurveTo(-9,-285,-35,-281,-30,-260);q.lineTo(-43,-246);q.bezierCurveTo(-22,-246,-18,-266,0,-254)},cloth[0],edge,1);
    }
    // Lamellar skirts, utility belts and heraldic shoulder plates distinguish materials too.
    if(m==='samurai'||m==='dynasty'){for(let j=0;j<3;j++)for(let i=0;i<4;i++)rr(c,-29+i*15,-113+j*10,13,8,1,j%2?base:cloth[0],edge,.9)}
    if(['alchemist','mechanic','scrap','hunter','wanderer'].includes(m)){[-24,24].forEach((x,i)=>{rr(c,x-6,-116,12,17,3,cloth[0],edge,1);line(c,x-5,-110,x+5,-110,glint,1);if(m==='alchemist')ellipse(c,x,-101,3,4,i?edge:light)})}
    if(['golem','scrap','gladiator'].includes(m)){[-27,23].forEach(x=>{poly(c,[[x-18,-185],[x-10,-200],[x+13,-196],[x+23,-180],[x+13,-174],[x-13,-174]],base,edge,1.2);[-8,4,14].forEach(d=>ellipse(c,x+d,-184,2,2,glint))})}
    if(['lava','inferno','last-dragon'].includes(m)){path(c,q=>{q.moveTo(17,-182);q.lineTo(12,-170);q.lineTo(20,-158);q.lineTo(12,-145);q.moveTo(-30,-177);q.lineTo(-36,-160);q.lineTo(-28,-147)},null,edge,1.8)}
    // Each of the fifty exhibit seals also has its own small edging pattern.
    for(let i=0;i<2+n%4;i++)line(c,-48+i*7,-63-i%2*3,-44+i*7,-71-i%2*3,edge,.8);
    c.restore();
  }
  function drawStachu(c,x,y,o={}){
    const t=o.time||0,p=o.progress??o.phase??0,pose=o.pose||'idle',f=o.facing===-1?-1:1;
    const walk=pose==='walk'?Math.sin(t*9):Math.sin(t*2)*.09,bob=pose==='walk'?Math.abs(Math.sin(t*9))*4:Math.sin(t*2.3)*1.7;
    const attack=pose==='attack'?Math.sin(clamp(p,0,1)*Math.PI):0,guard=pose==='guard';
    c.save();c.translate(x,y);ellipse(c,0,0,76,12,'rgba(0,0,0,.48)');c.scale(f,1);c.lineJoin='round';c.lineCap='round';
    if(pose==='dead'){c.translate(-35,-10);c.rotate(-1.44)}else if(pose==='dodge'){c.translate(-23,25);c.rotate(-.16)}else if(pose==='hurt'){c.translate(-12,3);c.rotate(-.08)}
    c.translate(attack*15,-bob);
    const steel=armor(c,'#77858b','#263742','#c6d1cc'),skin=grad(c,-25,-260,26,-210,[[0,'#ad8065'],[.46,'#e1bca0'],[1,'#a67862']]);
    // The long, folded navy cloak is the silhouette of the photographed outfit.
    path(c,q=>{q.moveTo(-24,-208);q.bezierCurveTo(-66,-182,-57,-103,-73-walk*6,-19);q.lineTo(-40,-30);q.lineTo(-18,-11);q.lineTo(12,-37);q.lineTo(48,-8);q.lineTo(65,-19);q.bezierCurveTo(63,-100,47,-185,23,-208);q.closePath()},grad(c,-60,-195,58,-26,[[0,'#35445a'],[.3,'#18283f'],[.66,'#0d192b'],[1,'#2d3b51']]),'#536073',1.4);
    path(c,q=>{q.moveTo(-23,-197);q.bezierCurveTo(-39,-157,-26,-80,-44,-32);q.moveTo(26,-189);q.bezierCurveTo(44,-129,31,-68,47,-18);q.moveTo(-4,-187);q.bezierCurveTo(-13,-104,5,-56,8,-38)},null,'#49576d',1.3);
    // Blue trousers and worn steel greaves remain visible below the long tunic.
    [{x:-19,step:-walk*.17},{x:19,step:walk*.18}].forEach((leg,i)=>{c.save();c.translate(leg.x,-93);c.rotate((i?-.08:.08)+leg.step);poly(c,[[-15,-14],[15,-14],[13,45],[-13,45]],i?'#285e80':'#16415f','#133146',1.4);line(c,-7,-8,-8,35,'#5c87a0',1.5);ellipse(c,0,43,15,11,steel,'#859696',1.4);poly(c,[[-13,45],[13,45],[10,80],[17,87],[12,92],[-14,92]],steel,'#788d92',1.4);line(c,-3,52,-4,78,'#c1cfcb',1.2);poly(c,[[-15,82],[12,82],[28,90],[29,95],[-17,95]],'#24323c','#91a2a4',1.4);line(c,-10,90,19,92,'#b1b9aa',1);c.restore()});
    // Burgundy coat, split hem, a pale shirt and battered breastplate.
    poly(c,[[-27,-194],[22,-196],[35,-155],[38,-64],[13,-54],[2,-83],[-13,-53],[-44,-67],[-34,-157]],grad(c,-39,-187,35,-60,[[0,'#8c3f4c'],[.5,'#602336'],[1,'#963f4c']]),'#b47775',1.2);
    line(c,-14,-123,-23,-64,'#ad6570',1.2);line(c,16,-126,27,-65,'#3c192a',2);
    poly(c,[[-14,-198],[4,-204],[19,-196],[8,-172]],'#ded8c2','#9d9f94',1);
    poly(c,[[-21,-190],[-3,-180],[20,-188],[27,-163],[20,-140],[-21,-139],[-29,-164]],steel,'#a8b5b0',1.7);
    line(c,-18,-177,19,-174,'#ccd3c4',1);line(c,-21,-158,18,-153,'#495d66',1.6);line(c,-14,-166,-6,-160,'#d0d7cb',1);line(c,10,-173,18,-166,'#d0d7cb',.8);
    rr(c,-31,-139,64,10,2,'#49352a','#9c7d4c',1);rr(c,-4,-141,14,14,2,'#a88d4e','#dec58a',1.5);rr(c,0,-137,6,6,1,'#382b24');
    // Small blue field pouch and red glass keepsake echo his original belt.
    rr(c,20,-130,20,29,6,'#195976','#72a5ad',1.2);path(c,q=>{q.moveTo(20,-121);q.quadraticCurveTo(30,-111,40,-121)},null,'#b9c8b8',1.2);ellipse(c,30,-123,2,2,'#c5ab66');
    line(c,-16,-131,-17,-116,'#bba26e',2);ellipse(c,-17,-108,6,11,'#7f2538','#d18974',1);ellipse(c,-19,-111,1.5,5,'#d98384');
    // The wooden scythe pivots around the front hand for both attacks and parries.
    c.save();c.translate(61,-163);c.rotate(guard?.23:attack*.98-.025);
    line(c,0,157,-5,-122,'#362a24',8);line(c,-1,156,-6,-122,'#9d7950',5);line(c,-2,138,-7,-114,'#c0a079',1.2);
    rr(c,-11,-132,13,20,2,'#43494a','#a2aaa2',1);line(c,-7,-118,0,-118,'#bac0b5',1.4);
    path(c,q=>{q.moveTo(-6,-130);q.bezierCurveTo(-48,-145,-100,-117,-145,-103);q.bezierCurveTo(-112,-126,-56,-151,-13,-141);q.lineTo(0,-132);q.closePath()},grad(c,-70,-147,-65,-102,[[0,'#b6c2bd'],[.25,'#3a4548'],[.8,'#182328'],[1,'#9eaaa5']]),'#b6c5bd',1.2);
    path(c,q=>{q.moveTo(-14,-139);q.bezierCurveTo(-66,-145,-109,-119,-141,-105)},null,'#d4d9c8',1.3);
    line(c,-2,57,-23,63,'#66513c',6);line(c,-22,62,-28,71,'#a58b69',5);c.restore();
    // Cloth sleeves, weathered shoulder plates and the two uncovered hands.
    poly(c,[[20,-190],[36,-187],[49,-160],[61,-171],[66,-154],[47,-141],[34,-150]],'#7c3443','#b87979',1.2);
    ellipse(c,25,-184,20,13,steel,'#8c9e9e',1.6);line(c,14,-187,35,-183,'#c8d0c3',1);ellipse(c,39,-154,9,10,steel,'#8b9e9e',1);
    ellipse(c,61,-165,8.5,11,skin,'#956b55',1);[-171,-166,-161].forEach(yy=>line(c,56,yy,66,yy+1,'#8c654f',1));
    poly(c,[[-27,-189],[-44,-180],[-43,-143],[-34,-126],[-22,-135],[-28,-153]],'#73303e','#ad7171',1.2);ellipse(c,-30,-185,18,12,steel,'#9aaba7',1.4);ellipse(c,-33,-128,8,11,skin,'#9d735b',1);line(c,-36,-131,-30,-124,'#8d634e',1);
    // The cloak crosses at the neck, rather than hiding the recognizable face.
    path(c,q=>{q.moveTo(-29,-207);q.lineTo(-10,-215);q.lineTo(4,-197);q.lineTo(26,-210);q.lineTo(35,-199);q.lineTo(2,-184);q.closePath()},'#23334a','#5a6879',1.2);ellipse(c,1,-194,4,4,'#ad945c','#d8c48f',1);
    // Larger open face: swept silver hair, hooded eyes, strong nose and dark moustache.
    ellipse(c,-24,-235,5,9,'#bd9275','#7c5c4c',.9);ellipse(c,27,-234,5,9,'#c49c80','#8a654e',.9);
    path(c,q=>{q.moveTo(-23,-256);q.bezierCurveTo(-10,-273,17,-269,27,-252);q.lineTo(25,-223);q.bezierCurveTo(17,-202,-8,-199,-19,-218);q.closePath()},skin,'#9b735d',1.2);
    path(c,q=>{q.moveTo(-25,-237);q.bezierCurveTo(-36,-263,-18,-283,5,-280);q.bezierCurveTo(24,-280,34,-264,29,-244);q.lineTo(20,-255);q.bezierCurveTo(8,-263,-7,-259,-20,-247);q.lineTo(-20,-230);q.closePath()},grad(c,-27,-278,25,-243,[[0,'#b4bab8'],[.42,'#e1e1d5'],[1,'#778d96']]),'#73848b',1.1);
    path(c,q=>{q.moveTo(-21,-258);q.bezierCurveTo(-6,-274,12,-275,25,-262);q.moveTo(-25,-264);q.bezierCurveTo(-10,-279,7,-281,21,-270);q.moveTo(-20,-252);q.bezierCurveTo(-7,-264,7,-267,17,-261)},null,'#eef0e2',1.6);
    line(c,-14,-246,-3,-248,'#707675',2.7);line(c,8,-248,20,-245,'#727775',2.7);ellipse(c,-7,-242,3,2.1,'#252d2c');ellipse(c,14,-241,3,2.1,'#252d2c');ellipse(c,-7.8,-242.4,.7,.7,'#dedfca');ellipse(c,13.2,-241.4,.7,.7,'#dedfca');
    path(c,q=>{q.moveTo(4,-244);q.lineTo(1,-231);q.quadraticCurveTo(6,-227,11,-231)},null,'#92644e',1.6);line(c,-16,-237,-12,-234,'#a5785e',1);line(c,17,-236,22,-232,'#9a6e56',1);line(c,-10,-253,15,-254,'#a5856e',.9);
    path(c,q=>{q.moveTo(4,-227);q.bezierCurveTo(-5,-232,-13,-225,-15,-220);q.bezierCurveTo(-6,-224,-1,-219,5,-223);q.bezierCurveTo(12,-219,18,-221,24,-216);q.bezierCurveTo(22,-225,12,-231,4,-227)},'#4b5050','#757871',.9);
    line(c,-6,-215,15,-214,'#815644',1.5);path(c,q=>{q.moveTo(-9,-209);q.quadraticCurveTo(3,-203,16,-210)},null,'#b38c72',1.3);line(c,-17,-226,-14,-217,'#987058',1);line(c,22,-226,20,-215,'#987058',1);
    c.restore();
  }
  function drawKnight(c,x,y,o={}){
    if(o.skin==='stachu-jones'){drawStachu(c,x,y,o);return;}
    const t=o.time||0,p=o.progress??o.phase??0,pose=o.pose||'idle',f=o.facing===-1?-1:1;
    const look=knightLooks.get(o.skin);
    const walk=pose==='walk'?Math.sin(t*9):Math.sin(t*2)*.13;
    const bob=pose==='walk'?Math.abs(Math.sin(t*9))*5:Math.sin(t*2.3)*2;
    const attack=pose==='attack'?Math.sin(clamp(p,0,1)*Math.PI):0;
    let base='#687b7e',dark='#172b36',light='#bad2c8',edge='#8ea597',glint='#e5dfab';
    if(o.skin==='brass'){base='#947247';dark='#302b29';light='#d9b773';edge='#c4a668';glint='#ffe1a0'}
    if(o.skin==='frost'){base='#6c9ca5';dark='#193747';light='#c5f6ed';edge='#92e8e5';glint='#e5ffff'}
    if(o.skin==='obsidian'){base='#353d55';dark='#111a29';light='#9c8bc1';edge='#9d83bd';glint='#d7b4ff'}
    const special={verdigris:['#4a947b','#152f29','#b8dfad','#91c9a4','#e5ffc5'],ember:['#a54e37','#351b24','#ffc187','#d88c57','#fff1b7'],royal:['#67528b','#211c3c','#dbb9ef','#bba0df','#ffebff'],solar:['#b7953c','#3e321b','#fff0ac','#edcf76','#ffffe1'],'jan-pawel-ii':['#f4f1e8','#5a5046','#ffffff','#e6dcc2','#ffe9a8']}[o.skin];
    if(special)[base,dark,light,edge,glint]=special;
    if(look){base=look.colors[0];dark=mixColor(base,'#07111c',.76);light=mixColor(base,'#f3f5e7',.53);edge=look.colors[2];glint=look.colors[3]||mixColor(edge,'#fff9e4',.55)}
    const cloth=look?[look.colors[1],mixColor(look.colors[1],'#071016',.67),mixColor(look.colors[1],look.colors[2],.35)]:({brass:['#581e32','#26182b','#7a3041'],frost:['#35708a','#16293e','#77b7bd'],obsidian:['#4d2f62','#1b162a','#805e91'],verdigris:['#22624e','#12291f','#6f9f60'],ember:['#a43127','#36151d','#e77b37'],royal:['#62408a','#241637','#a46ace'],solar:['#b28c38','#44311e','#e9cf7d'],'jan-pawel-ii':['#b3202a','#7a1119','#d9b24a']}[o.skin]||['#581e32','#26182b','#7a3041']);
    c.save();c.translate(x,y);ellipse(c,0,0,77,13,'rgba(0,0,0,.49)');c.scale(f,1);
    if(look?.motif==='ghost')c.globalAlpha*=.82;
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
    line(c,-1,-188,0,-122,light,1);if(look){c.save();c.translate(3,-160);c.scale(.48,.48);knightEmblem(c,look,edge,dark);c.restore()}else{ellipse(c,3,-160,10,13,null,'#c4b279',1.3);path(c,q=>{q.moveTo(8,-171);q.bezierCurveTo(-5,-170,-5,-150,8,-149);q.bezierCurveTo(-12,-145,-17,-174,8,-171)},'#cabd86')}
    for(let i=0;i<3;i++)poly(c,[[-26-i,-123+i*10],[25+i,-121+i*10],[30+i,-107+i*10],[0,-101+i*10],[-32-i,-108+i*10]],metal,edge,1.3);
    rr(c,-29,-124,57,8,2,'#332c25','#917a53',1);rr(c,-4,-125,11,11,2,'#a08a58','#ddc28b',1);
    // Near shoulder and shield arm.
    ellipse(c,-27,-177,26,20,metal,edge,2);path(c,q=>{q.moveTo(-50,-177);q.quadraticCurveTo(-28,-189,-6,-175)},null,light,1);
    let shieldX=pose==='guard'?47:4,shieldY=pose==='guard'?-154:-128;
    poly(c,[[-44,-170],[-23,-168],[-10,-133],[-24,-115],[-41,-137]],metal,edge,1.5);line(c,-28,-119,shieldX,shieldY,'#829391',16);
    c.save();c.translate(shieldX,shieldY);c.rotate(pose==='guard'?-.07:-.14);
    path(c,q=>{q.moveTo(-31,-35);q.lineTo(26,-35);q.lineTo(34,-9);q.bezierCurveTo(36,27,13,54,0,62);q.bezierCurveTo(-23,46,-39,19,-39,-9);q.closePath()},'#283d43','#c4b27f',3);
    path(c,q=>{q.moveTo(-25,-28);q.lineTo(21,-28);q.lineTo(27,-6);q.bezierCurveTo(26,21,12,42,0,51);q.bezierCurveTo(-19,36,-30,14,-31,-7);q.closePath()},grad(c,-30,-30,27,50,[[0,base],[.6,dark],[1,cloth[1]]]),'#617a73',1);
    if(look){c.save();c.translate(-2,4);c.scale(.94,.94);knightEmblem(c,look,edge,cloth[1]);c.restore();line(c,-20,29,-11,39,edge,1);line(c,18,27,9,39,edge,1)}else{line(c,-28,-3,26,-3,'#a3905e',4);line(c,-3,-27,-1,45,'#a3905e',4);ellipse(c,-2,-3,11,11,'#9c8956','#dbca92',1);ellipse(c,-4,-6,3,3,'#e7dfb2')}
    [[-25,-27],[20,-27],[-29,-7],[25,-7],[0,48]].forEach(([a,b])=>ellipse(c,a,b,2,2,'#dfc68a'));c.restore();
    // Gorget and expressive closed visor.
    ellipse(c,-2,-205,21,10,metal,edge,1.5);
    path(c,q=>{q.moveTo(-23,-228);q.bezierCurveTo(-23,-256,9,-269,24,-243);q.lineTo(27,-217);q.lineTo(14,-205);q.lineTo(-13,-207);q.lineTo(-25,-219);q.closePath()},metal,edge,2);
    poly(c,[[-23,-231],[21,-238],[33,-224],[21,-210],[-19,-213]],grad(c,-25,-230,30,-215,[[0,look?dark:'#3d555d'],[.4,look?base:'#7b9698'],[1,look?dark:'#203643']]),edge,1.5);
    path(c,q=>{q.moveTo(-17,-229);q.lineTo(24,-232);q.lineTo(29,-226);q.lineTo(-15,-223);q.closePath()},'#071b24','#9fb4a3',1);
    c.save();c.shadowColor='#b7f9d5';c.shadowBlur=8;line(c,-13,-226,22,-229,'#b2e9cf',1.5);c.restore();
    for(let j=0;j<5;j++)line(c,4+j*4,-219,5+j*4,-213,'#0c2530',1.6);
    poly(c,[[-4,-254],[2,-263],[7,-249],[6,-237],[-1,-235]],'#b0a173','#e5cb92');
    if(look)knightCrest(c,look,{base,dark,light,edge,glint,cloth},t);
    else path(c,q=>{q.moveTo(1,-258);q.bezierCurveTo(-15,-287,-49,-278,-44,-251);q.bezierCurveTo(-40,-236,-59,-224,-64,-236);q.bezierCurveTo(-57,-210,-20,-230,-25,-252);q.bezierCurveTo(-22,-266,-8,-261,1,-258)},grad(c,-50,-280,-10,-220,[[0,cloth[2]],[.5,cloth[0]],[1,cloth[1]]]),'#b16a67',1);
    c.restore();
  }
  function bone(c,ax,ay,bx,by,width=8,col='#c8bea1',edge='#736d54'){
    c.save();c.lineCap='round';line(c,ax,ay,bx,by,edge,width+3);line(c,ax,ay,bx,by,col,width);line(c,ax-1,ay-1,bx-1,by-1,'rgba(255,248,209,.44)',Math.max(1,width*.2));ellipse(c,ax,ay,width*.68,width*.55,col,edge,1);ellipse(c,bx,by,width*.7,width*.56,col,edge,1);c.restore();
  }
  function drawRex(c,x,y,o={}){
    const t=o.time||0,p=o.progress??o.phase??0,pose=o.pose||'idle',f=o.facing===-1?-1:1;
    const attack=pose==='attack'?Math.sin(clamp(p,0,1)*Math.PI):0,walking=pose==='walk';let bob=walking?Math.abs(Math.sin(t*6))*6:Math.sin(t*1.9)*3;
    const col=o.skin==='raptor'?'#c4c9a6':o.skin==='frost'?'#b6e0dc':o.skin==='obsidian'?'#9894b5':o.skin==='brass'?'#d4b77e':'#c6c0a4',hi=o.skin==='raptor'?'#eaeccb':o.skin==='frost'?'#e0fff4':'#e4dfbf',edge=o.skin==='raptor'?'#5f6a4c':o.skin==='obsidian'?'#524567':'#756f55';
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
  // One human rig, many costumes. Figures from exhibits.js describe hat, coat, facial hair and weapon.
  function drawFigure(c,x,y,o={}){
    const F=o.figure||{},t=o.time||0,p=o.progress??o.phase??0,pose=o.pose||'idle',f=o.facing===-1?-1:1;
    const walk=pose==='walk'?Math.sin(t*9):Math.sin(t*2)*.1,bob=pose==='walk'?Math.abs(Math.sin(t*9))*4:Math.sin(t*2.2)*1.6;
    const attack=pose==='attack'?Math.sin(clamp(p,0,1)*Math.PI):0,guard=pose==='guard';
    const skin=F.skin||'#e2bf9f',coat=F.coat||F.tunic||'#4a4a4a',coatDark=F.coatDark||mixColor(coat,'#000000',.4),trousers=F.trousers||coat,boots=F.boots||'#1a1a1a',hair=F.hair||'#2a2118';
    c.save();c.translate(x,y);ellipse(c,0,0,60,11,'rgba(0,0,0,.45)');c.scale(f,1);c.lineJoin='round';c.lineCap='round';
    if(pose==='dead'){c.translate(-35,-10);c.rotate(-1.44)}else if(pose==='dodge'){c.translate(-23,25);c.rotate(-.16)}else if(pose==='hurt'){c.translate(-12,3);c.rotate(-.08)}
    c.translate(attack*14,-bob);
    // Cloak behind everything (Leonidas).
    if(F.cloak)path(c,q=>{q.moveTo(-20,-196);q.bezierCurveTo(-58,-170,-50,-100,-66-walk*6,-26);q.lineTo(-28,-36);q.lineTo(-4,-30);q.bezierCurveTo(2,-96,14,-160,8,-192);q.closePath()},grad(c,-60,-190,20,-45,[[0,F.cloak],[.55,mixColor(F.cloak,'#000',.45)],[1,F.cloak]]),mixColor(F.cloak,'#fff',.25),1);
    // Legs: trousers and boots, or bare legs with sandals.
    [{x:-17,step:-walk*.17},{x:16,step:walk*.18}].forEach((leg,i)=>{c.save();c.translate(leg.x,-100);c.rotate((i?-.07:.07)+leg.step);
      if(F.legs==='bare'){poly(c,[[-12,-10],[12,-10],[10,40],[-10,40]],F.tunic||coat,coatDark,1.2);poly(c,[[-10,38],[10,38],[9,86],[-9,86]],skin,mixColor(skin,'#000',.35),1.2);poly(c,[[-11,84],[11,84],[22,96],[-12,96]],boots,'#2b1d12',1.2);line(c,-6,60,8,62,boots,2);line(c,-6,72,8,74,boots,2)}
      else{poly(c,[[-13,-10],[13,-10],[12,62],[-12,62]],trousers,mixColor(trousers,'#000',.35),1.3);if(F.lapel)line(c,0,-5,1,55,mixColor(trousers,'#000',.2),1);poly(c,[[-13,60],[13,60],[12,88],[24,95],[22,100],[-14,100]],boots,mixColor(boots,'#fff',.25),1.3);line(c,-6,66,-6,90,mixColor(boots,'#fff',.2),1)}
      c.restore()});
    // Rear arm holds the weapon; it swings on attack and rises on guard.
    c.save();c.translate(22,-176);c.rotate(guard?(F.shield?-.9:-.45):attack*1.25-.2);
    ellipse(c,0,0,15,12,coat,coatDark,1.3);poly(c,[[-8,6],[10,5],[12,48],[-6,50]],coat,coatDark,1.3);ellipse(c,3,52,8,9,skin,mixColor(skin,'#000',.35),1);
    c.translate(3,52);
    if(F.weapon==='spear'){c.rotate(-1.35+attack*.25);line(c,-8,40,-8,-200,'#5a3a22',6);line(c,-8,40,-8,-200,'#8a6a42',3);poly(c,[[-14,-198],[-8,-238],[-2,-198]],'#b9c0b5','#5b6660',1);rr(c,-13,-202,10,8,1,'#8f7a3e')}
    else if(F.weapon==='sabre'){c.rotate(-.9+attack*.3);rr(c,-4,-8,8,22,2,'#3a2a1a','#8f7a3e',1);ellipse(c,0,-10,9,4,'#c9a94a');path(c,q=>{q.moveTo(-3,-12);q.bezierCurveTo(-6,-60,0,-110,24,-150);q.lineTo(30,-146);q.bezierCurveTo(10,-105,6,-60,4,-12);q.closePath()},grad(c,-6,-80,30,-80,[[0,'#6e8a90'],[.5,'#e5efe8'],[1,'#8aa0a4']]),'#c4d6cf',1)}
    else if(F.weapon==='pistol'){c.rotate(-1.5+attack*.4);rr(c,-5,-6,10,20,2,'#2b2b2b','#6b6b6b',1);rr(c,-6,-16,30,10,2,'#1f1f1f','#7a7a7a',1);rr(c,20,-14,12,5,1,'#3a3a3a');if(attack>.6)glow(c,36,-11,22,'rgba(255,220,120,.7)')}
    else if(F.weapon==='rifle'||F.weapon==='minigun'){c.rotate(-1.4+attack*.35);rr(c,-6,-4,12,34,3,'#4a3420','#8a6a42',1);rr(c,-5,-70,8,70,2,'#2b2b2b','#6b6b6b',1);rr(c,-7,-30,12,10,2,'#4a3420','#8a6a42',1);if(attack>.6)glow(c,0,-78,22,'rgba(255,220,120,.7)')}
    else if(F.weapon==='dagger'){c.rotate(-1.2+attack*.5);rr(c,-3,-6,6,18,2,'#3a2a1a','#8f7a3e',1);ellipse(c,0,-8,8,3,'#c9a94a');poly(c,[[-4,-10],[-3,-52],[0,-62],[3,-52],[4,-10]],grad(c,-5,-30,5,-30,[[0,'#6e8a90'],[.5,'#e5efe8'],[1,'#8aa0a4']]),'#c4d6cf',1)}
    else if(F.weapon==='axe'){c.rotate(-1.3+attack*.3);line(c,0,30,0,-90,'#4a3420',8);line(c,0,30,0,-90,'#8a6a42',4);path(c,q=>{q.moveTo(0,-82);q.bezierCurveTo(30,-96,46,-70,40,-44);q.bezierCurveTo(26,-58,12,-60,0,-54);q.closePath()},grad(c,0,-80,40,-50,[[0,'#d8e8de'],[1,'#627d85']]),'#b6d9cc',1.5)}
    else if(F.weapon==='staff'){c.rotate(-1.35+attack*.25);line(c,0,40,0,-150,'#3a2416',8);line(c,0,40,0,-150,'#8a6a42',4);ellipse(c,0,-152,7,7,'#c9a94a','#e7d08a',1);if(F.hat==='hood'){line(c,-8,-130,8,-130,'#c9a94a',3)}}
    else if(F.weapon==='bow'){c.rotate(-1.5+attack*.2);path(c,q=>{q.moveTo(0,70);q.bezierCurveTo(-42,20,-42,-60,0,-110)},null,'#8a6a42',6);line(c,0,70,0,-110,'#e8e2d0',1.2);line(c,0,-20,-60-attack*40,-28,'#4a3420',3);poly(c,[[-60-attack*40,-32],[-72-attack*40,-28],[-60-attack*40,-24]],'#b6c0b5','#5b6660',1)}
    c.restore();
    // Coat and torso.
    poly(c,[[-26,-192],[24,-194],[32,-150],[30,-98],[8,-92],[0,-108],[-8,-92],[-30,-98],[-34,-150]],grad(c,-34,-190,32,-92,[[0,coat],[.5,coatDark],[1,coat]]),mixColor(coat,'#fff',.2),1.3);
    if(F.lapel){poly(c,[[-24,-190],[-2,-192],[-8,-130],[-26,-150]],F.lapel,mixColor(F.lapel,'#000',.3),1);poly(c,[[22,-192],[0,-192],[6,-130],[26,-150]],F.lapel,mixColor(F.lapel,'#000',.3),1);for(let k=0;k<4;k++)ellipse(c,-13,-178+k*18,2.3,2.3,'#d4af37')}
    if(F.armor){poly(c,[[-24,-190],[22,-192],[30,-150],[24,-110],[-26,-110],[-32,-150]],grad(c,-30,-190,30,-110,[[0,F.armorDark||'#6e5321'],[.4,F.armor],[1,F.armorDark||'#6e5321']]),mixColor(F.armor,'#fff',.35),1.5);path(c,q=>{q.moveTo(-18,-170);q.bezierCurveTo(-8,-160,8,-160,18,-170);q.moveTo(-2,-150);q.bezierCurveTo(-10,-140,-10,-125,-2,-118);q.moveTo(2,-150);q.bezierCurveTo(10,-140,10,-125,2,-118)},null,mixColor(F.armor,'#000',.35),1.2)}
    if(F.sash){line(c,-26,-186,26,-120,F.sash,8)}
    if(F.epaulettes){ellipse(c,-24,-188,12,6,F.epaulettes,mixColor(F.epaulettes,'#000',.3),1);ellipse(c,22,-190,12,6,F.epaulettes,mixColor(F.epaulettes,'#000',.3),1);for(let k=0;k<5;k++){line(c,-30+k*3,-184,-31+k*3,-176,F.epaulettes,1.2);line(c,16+k*3,-186,15+k*3,-178,F.epaulettes,1.2)}}
    if(!F.armor&&!F.lapel){line(c,0,-186,0,-100,coatDark,1.2);for(let k=0;k<4;k++)ellipse(c,0,-176+k*20,2.2,2.2,mixColor(coat,'#fff',.4))}
    rr(c,-30,-112,60,8,2,'#2b2219','#6f5a3a',1);rr(c,-5,-113,10,10,2,'#8f7a3e','#d4af37',1);
    if(F.armband){poly(c,[[-34,-170],[-18,-172],[-16,-156],[-32,-154]],F.armband,mixColor(F.armband,'#000',.3),1)}
    // Front arm: shield or free hand.
    c.save();c.translate(-22,-176);c.rotate(guard?-.7:F.shield?-.35:.25-attack*.3);
    ellipse(c,0,0,15,12,coat,coatDark,1.3);poly(c,[[-9,6],[9,5],[9,46],[-9,48]],F.armor&&F.legs==='bare'?skin:coat,F.armor&&F.legs==='bare'?mixColor(skin,'#000',.3):coatDark,1.3);ellipse(c,0,50,8,9,skin,mixColor(skin,'#000',.35),1);
    if(F.shield){c.translate(-4,30);ellipse(c,0,0,42,46,grad(c,-40,-40,40,40,[[0,mixColor(F.shield,'#fff',.3)],[.5,F.shield],[1,mixColor(F.shield,'#000',.4)]]),mixColor(F.shield,'#000',.45),4);ellipse(c,0,0,30,34,null,mixColor(F.shield,'#000',.3),2);if(F.shieldGlyph)txt(c,F.shieldGlyph,0,16,44,mixColor(F.shield,'#000',.55),'center','Georgia')}
    c.restore();
    // Head, hair, facial hair and headgear.
    ellipse(c,0,-205,10,8,skin,mixColor(skin,'#000',.3),1);
    ellipse(c,0,-230,21,24,skin,mixColor(skin,'#000',.3),1.2);
    if(F.hat!=='corinthian'){path(c,q=>{q.moveTo(-21,-232);q.bezierCurveTo(-22,-258,22,-258,21,-232);q.lineTo(16,-240);q.bezierCurveTo(6,-250,-8,-250,-16,-240);q.closePath()},hair,mixColor(hair,'#fff',.2),1)}
    ellipse(c,-8,-233,2.6,2.2,'#2a2320');ellipse(c,8,-233,2.6,2.2,'#2a2320');line(c,-12,-240,-4,-241,hair,2);line(c,4,-241,12,-240,hair,2);
    path(c,q=>{q.moveTo(1,-233);q.lineTo(-2,-222);q.quadraticCurveTo(2,-219,6,-222)},null,mixColor(skin,'#000',.35),1.3);
    if(F.beard==='long'){path(c,q=>{q.moveTo(-20,-226);q.bezierCurveTo(-28,-190,-16,-150,0,-146);q.bezierCurveTo(16,-150,28,-190,20,-226);q.lineTo(12,-218);q.bezierCurveTo(6,-212,-6,-212,-12,-218);q.closePath()},hair,mixColor(hair,'#fff',.15),1);for(let k=0;k<4;k++)line(c,-12+k*8,-200,-13+k*8,-160,mixColor(hair,'#000',.3),1)}
    else if(F.beard==='goatee'){path(c,q=>{q.moveTo(-8,-216);q.bezierCurveTo(-10,-200,-6,-192,0,-190);q.bezierCurveTo(6,-192,10,-200,8,-216);q.closePath()},hair,mixColor(hair,'#fff',.15),1);line(c,-10,-218,10,-218,hair,2)}
    if(F.mustache==='handlebar'){path(c,q=>{q.moveTo(-18,-212);q.bezierCurveTo(-10,-224,10,-224,18,-212);q.bezierCurveTo(10,-216,-10,-216,-18,-212)},hair,mixColor(hair,'#fff',.15),1);line(c,-18,-212,-24,-206,hair,2);line(c,18,-212,24,-206,hair,2)}
    if(F.mustache==='toothbrush'){rr(c,-5,-219,10,6,1,hair)}else if(F.mustache==='thick'){path(c,q=>{q.moveTo(-14,-215);q.bezierCurveTo(-8,-223,8,-223,14,-215);q.bezierCurveTo(8,-213,-8,-213,-14,-215)},hair,mixColor(hair,'#fff',.15),1)}else if(F.beard==='full'){path(c,q=>{q.moveTo(-19,-226);q.bezierCurveTo(-24,-200,-10,-192,0,-194);q.bezierCurveTo(10,-192,24,-200,19,-226);q.lineTo(12,-218);q.bezierCurveTo(6,-212,-6,-212,-12,-218);q.closePath()},hair,mixColor(hair,'#fff',.15),1)}else{path(c,q=>{q.moveTo(-7,-214);q.quadraticCurveTo(0,-209,7,-214)},null,mixColor(skin,'#000',.4),1.2)}
    if(F.hat==='peaked'){const hc=F.hatColor||coat;path(c,q=>{q.moveTo(-24,-246);q.bezierCurveTo(-26,-270,26,-270,24,-246);q.lineTo(26,-242);q.lineTo(-26,-242);q.closePath()},hc,mixColor(hc,'#000',.35),1.3);rr(c,-26,-246,52,6,1,mixColor(hc,'#000',.3),'#1a1a1a',1);poly(c,[[-2,-242],[28,-240],[30,-234],[2,-236]],'#1a1a1a','#444',1);if(F.star){txt(c,'★',0,-250,14,F.star,'center','Arial')}else{ellipse(c,0,-254,4,4,'#c9b37a','#6b5a30',1)}}
    else if(F.hat==='bicorne'){const hc=F.hatColor||'#15191f';path(c,q=>{q.moveTo(-44,-252);q.bezierCurveTo(-30,-284,30,-284,44,-252);q.bezierCurveTo(30,-262,-30,-262,-44,-252);q.closePath()},hc,mixColor(hc,'#fff',.25),1.5);path(c,q=>{q.moveTo(-40,-254);q.bezierCurveTo(-26,-274,26,-274,40,-254)},null,'#d4af37',1.2);if(F.cockade){ellipse(c,14,-266,6,6,F.cockade,'#fff',1);ellipse(c,14,-266,2.5,2.5,'#1f3a6b')}}
    else if(F.hat==='crown'){const hc=F.hatColor||'#d4af37';poly(c,[[-22,-246],[-22,-268],[-14,-256],[-7,-272],[0,-258],[7,-272],[14,-256],[22,-268],[22,-246]],hc,mixColor(hc,'#000',.35),1.2);[-14,0,14].forEach(x=>ellipse(c,x,-250,2.5,2.5,'#b3202a'));rr(c,-22,-248,44,4,1,mixColor(hc,'#fff',.2))}
    else if(F.hat==='mianguan'){const hc=F.hatColor||'#111';rr(c,-18,-256,36,10,2,hc,'#444',1);rr(c,-30,-262,60,6,1,hc,'#555',1);for(let k=0;k<6;k++){line(c,-26+k*10,-262,-26+k*10,-236,'#c9a94a',1);ellipse(c,-26+k*10,-236,1.5,1.5,'#e7d08a')}}
    else if(F.hat==='laurel'){const hc=F.hatColor||'#4a8a3a';for(let side=-1;side<=1;side+=2)for(let k=0;k<6;k++){c.save();c.translate(side*(6+k*4),-252+k*1.5);c.rotate(side*(.5+k*.25));ellipse(c,0,0,5,2.5,hc,mixColor(hc,'#000',.3),.8);c.restore()}}
    else if(F.hat==='turban'){const hc=F.hatColor||'#f0e8d0';path(c,q=>{q.moveTo(-25,-244);q.bezierCurveTo(-28,-276,28,-276,25,-244);q.closePath()},hc,mixColor(hc,'#000',.3),1.2);path(c,q=>{q.moveTo(-24,-250);q.bezierCurveTo(-8,-262,8,-240,24,-252);q.moveTo(-22,-258);q.bezierCurveTo(-4,-268,6,-250,22,-260)},null,mixColor(hc,'#000',.25),1.5);ellipse(c,0,-262,3,3,'#b3202a')}
    else if(F.hat==='furhat'){const hc=F.hatColor||'#4a3620';rr(c,-26,-256,52,12,4,'#6a4a2a','#3a2616',1.2);path(c,q=>{q.moveTo(-20,-256);q.bezierCurveTo(-18,-280,18,-280,20,-256);q.closePath()},hc,mixColor(hc,'#000',.35),1.2);if(F.hatColor==='#d4af37'){ellipse(c,0,-278,3,3,'#b3202a');line(c,-10,-266,10,-266,'#d4af37',1.5)}}
    else if(F.hat==='hood'){const hc=F.hatColor||'#121212';path(c,q=>{q.moveTo(-26,-200);q.bezierCurveTo(-30,-250,-10,-290,0,-292);q.bezierCurveTo(10,-290,30,-250,26,-200);q.lineTo(20,-204);q.bezierCurveTo(16,-240,8,-256,0,-258);q.bezierCurveTo(-8,-256,-16,-240,-20,-204);q.closePath()},hc,mixColor(hc,'#fff',.25),1.2)}
    else if(F.hat==='tricorn'){const hc=F.hatColor||'#111';path(c,q=>{q.moveTo(-40,-250);q.lineTo(0,-284);q.lineTo(40,-250);q.bezierCurveTo(28,-258,-28,-258,-40,-250);q.closePath()},hc,mixColor(hc,'#fff',.3),1.5);line(c,-34,-252,34,-252,'#c9a94a',1.2)}
    else if(F.hat==='fez'){const hc=F.hatColor||'#8a1a1a';poly(c,[[-18,-246],[-16,-272],[16,-272],[18,-246]],hc,mixColor(hc,'#fff',.25),1.2);line(c,14,-272,20,-258,'#222',2);if(F.star)txt(c,'★',0,-256,10,F.star,'center','Arial');else ellipse(c,0,-260,3,3,'#c9a94a')}
    else if(F.hat==='cap'){const hc=F.hatColor||coat;path(c,q=>{q.moveTo(-23,-246);q.bezierCurveTo(-24,-266,24,-266,23,-246);q.closePath()},hc,mixColor(hc,'#000',.35),1.2);poly(c,[[-2,-246],[24,-245],[26,-240],[2,-241]],mixColor(hc,'#000',.4),'#222',1);if(F.star)txt(c,'★',0,-250,11,F.star,'center','Arial');else if(hc==='#7a1020')ellipse(c,0,-258,3,4,'#d4af37','#b3202a',1)}
    else if(F.hat==='beret'){const hc=F.hatColor||'#1a1a1a';path(c,q=>{q.moveTo(-26,-246);q.bezierCurveTo(-30,-262,-8,-270,10,-268);q.bezierCurveTo(26,-266,30,-256,24,-246);q.closePath()},hc,mixColor(hc,'#fff',.25),1.2);rr(c,-22,-248,44,4,1,mixColor(hc,'#fff',.15))}
    else if(F.hat==='fedora'){const hc=F.hatColor||'#e8e2d0';path(c,q=>{q.moveTo(-22,-248);q.bezierCurveTo(-22,-276,22,-276,22,-248);q.closePath()},hc,mixColor(hc,'#000',.3),1.2);rr(c,-34,-250,68,5,2,hc,mixColor(hc,'#000',.3),1);rr(c,-22,-258,44,5,1,'#1a1a1a')}
    else if(F.hat==='morion'){const hc=F.hatColor||'#8a8a90';path(c,q=>{q.moveTo(-26,-246);q.bezierCurveTo(-26,-270,26,-270,26,-246);q.closePath()},hc,mixColor(hc,'#000',.4),1.5);path(c,q=>{q.moveTo(-6,-262);q.bezierCurveTo(-4,-286,4,-286,6,-262)},hc,mixColor(hc,'#000',.4),1.2);path(c,q=>{q.moveTo(-34,-244);q.bezierCurveTo(-20,-250,20,-250,34,-244);q.bezierCurveTo(20,-240,-20,-240,-34,-244)},hc,mixColor(hc,'#000',.4),1.2)}
    else if(F.hat==='helmet'){const hc=F.hatColor||'#7a7a80';path(c,q=>{q.moveTo(-24,-244);q.bezierCurveTo(-26,-272,26,-272,24,-244);q.closePath()},hc,mixColor(hc,'#000',.4),1.5);poly(c,[[-3,-268],[0,-290],[3,-268]],hc,mixColor(hc,'#000',.4),1);rr(c,-26,-246,52,5,1,'#6a4a2a','#3a2616',1)}
    else if(F.hat==='corinthian'){const hc=F.hatColor||'#b08a3e';path(c,q=>{q.moveTo(-23,-236);q.bezierCurveTo(-26,-272,26,-272,23,-236);q.lineTo(23,-214);q.lineTo(12,-214);q.lineTo(9,-226);q.lineTo(3,-226);q.lineTo(0,-212);q.lineTo(-3,-226);q.lineTo(-9,-226);q.lineTo(-12,-214);q.lineTo(-23,-214);q.closePath()},grad(c,-24,-270,24,-214,[[0,mixColor(hc,'#fff',.3)],[.5,hc],[1,mixColor(hc,'#000',.4)]]),mixColor(hc,'#000',.45),1.5);ellipse(c,-8,-232,3,2.5,'#1a140e');ellipse(c,8,-232,3,2.5,'#1a140e');
      path(c,q=>{q.moveTo(-6,-262);q.bezierCurveTo(-10,-290,10,-300,40,-288);q.bezierCurveTo(28,-280,14,-282,8,-272);q.bezierCurveTo(10,-266,6,-262,-6,-262);q.closePath()},F.crest||'#b3202a',mixColor(F.crest||'#b3202a','#000',.35),1.2);for(let k=0;k<6;k++)line(c,-2+k*7,-266-k*2,6+k*7,-282-k*2,mixColor(F.crest||'#b3202a','#fff',.2),1)}
    c.restore();
  }
  // Opponents are drawn by key so a new exhibit is one entry here plus one in exhibits.js.
  const fighters={
    rex:drawRex,
    raptor:(c,x,y,o={})=>{c.save();c.translate(x,y);c.scale(.62,.62);drawRex(c,0,0,{...o,skin:'raptor'});c.restore()},
    figure:drawFigure
  };
  function drawExhibit(c,exhibit,x,y,o={}){
    const def=typeof exhibit==='string'?window.MuseumExhibits?.get(exhibit):exhibit;
    const key=def?.stats?.art||exhibit;
    (fighters[key]||drawRex)(c,x,y,{figure:def?.stats?.figure||null,...o});
  }
  // Collection thumbnails for weapons and cards. Centered on (0,0), roughly 200 units tall.
  function drawWeaponIcon(c,weapon,o={}){
    const key=weapon?.icon||weapon?.id||'sword';
    c.save();c.lineCap='round';c.lineJoin='round';
    const steel=grad(c,-10,0,10,0,[[0,'#627d85'],[.46,'#d8e8de'],[.52,'#eff8df'],[.6,'#8ca9ac'],[1,'#3c555f']]);
    const wood=(y0,y1,wdt=8)=>{line(c,0,y0,0,y1,'#4a3420',wdt+3);line(c,0,y0,0,y1,'#8a6a42',wdt-2)};
    const grip=(y,len=40)=>{rr(c,-5,y,10,len,2,'#372d25','#a68b56',1);for(let z=y+4;z<y+len-2;z+=5)line(c,-4,z,4,z-3,'#8f7950',1);ellipse(c,0,y+len+4,7,7,'#a58e57','#dfc58b')};
    const guard=(y,wd=28)=>poly(c,[[-wd,y],[-wd+1,y-6],[-7,y-8],[0,y-13],[7,y-8],[wd-1,y-6],[wd,y],[6,y-3],[-6,y-3]],'#a18d59','#e2c68c',1);
    const blade=(len,wd=9,curve=0)=>{path(c,q=>{q.moveTo(-wd,0);q.bezierCurveTo(-wd-curve,-len*.5,-wd*.4-curve*1.6,-len*.95,-curve*2,-len);q.lineTo(wd*.9-curve*2,-len*.92);q.bezierCurveTo(wd-curve,-len*.5,wd,-len*.3,wd,0);q.closePath()},steel,'#b6d9cc',1);line(c,-curve*.3,-8,-curve*1.4,-len*.85,'#f5f6d3',1)};
    const gun=(len,stock=true,barrels=1)=>{c.rotate(.65);if(stock)poly(c,[[-60,-4],[-30,-4],[-30,14],[-50,30],[-70,26],[-72,8]],'#5a3a22','#8a6a42',1.5);rr(c,-34,-18,len,14,3,'#2b2b2b','#6b6b6b',1.5);if(barrels>1)rr(c,-34,-30,len,12,3,'#2b2b2b','#6b6b6b',1.5);rr(c,-28,-6,22,22,3,'#1f1f1f','#7a7a7a',1.5);path(c,q=>{q.moveTo(-14,8);q.bezierCurveTo(-10,22,0,26,4,18)},null,'#8a8a8a',3);rr(c,len-44,-22,10,8,2,'#444','#888',1);line(c,-30,-12,len-40,-12,'#9a9a9a',1)};
    c.rotate(-.65);
    switch(key){
      case 'sword':grip(60,40);guard(55,28);c.translate(0,48);blade(145,8);break;
      case 'shortsword':grip(50,34);guard(46,24);c.translate(0,40);blade(100,10);break;
      case 'greatsword':grip(70,58);guard(66,34);c.translate(0,58);blade(165,11);break;
      case 'curved':grip(60,40);poly(c,[[-20,56],[-18,50],[14,48],[18,56],[6,53],[-6,53]],'#a18d59','#e2c68c',1);c.translate(0,48);blade(140,7,10);break;
      case 'rapier':rr(c,-3,55,6,45,2,'#2b2420','#8f7a3e',1);ellipse(c,0,100,6,6,'#c9a94a','#e7d08a');ellipse(c,0,50,22,10,null,'#d4af37',3);path(c,q=>{q.moveTo(-18,50);q.bezierCurveTo(-30,20,30,20,18,50)},null,'#d4af37',2);poly(c,[[-3,40],[-3,-110],[0,-130],[3,-110],[3,40]],steel,'#b6d9cc',1);break;
      case 'dagger':grip(20,28);guard(16,16);c.translate(0,10);blade(70,9);break;
      case 'axe':wood(-110,110,11);path(c,q=>{q.moveTo(0,-95);q.bezierCurveTo(55,-110,95,-70,90,-10);q.bezierCurveTo(60,-30,30,-30,0,-20);q.closePath()},steel,'#b6d9cc',1.5);path(c,q=>{q.moveTo(0,-95);q.bezierCurveTo(-55,-110,-95,-70,-90,-10);q.bezierCurveTo(-60,-30,-30,-30,0,-20);q.closePath()},steel,'#b6d9cc',1.5);line(c,-80,-15,80,-15,'#f5f6d3',1);break;
      case 'doubleaxe':wood(-100,110,10);[-1,1].forEach(sgn=>path(c,q=>{q.moveTo(0,-80);q.bezierCurveTo(sgn*60,-96,sgn*92,-40,sgn*60,10);q.bezierCurveTo(sgn*30,-10,sgn*20,-20,0,-20);q.closePath()},steel,'#b6d9cc',1.5));ellipse(c,0,-50,8,8,'#a18d59','#e2c68c',1);break;
      case 'hammer':wood(-80,115,10);rr(c,-44,-110,88,44,4,grad(c,-44,-110,44,-66,[[0,'#9aa3ad'],[.5,'#5a6470'],[1,'#2e3640']]),'#1e2430',2);poly(c,[[44,-100],[80,-88],[44,-76]],'#8ca9ac','#3c555f',1.5);for(let k=0;k<3;k++)line(c,-30+k*20,-104,-30+k*20,-72,'#2e3640',1.5);break;
      case 'mace':wood(-30,115,9);line(c,0,-30,0,-70,'#555',4);for(let k=0;k<6;k++)ellipse(c,0,-36-k*7,3,3,'#8a8a8a','#333',1);ellipse(c,0,-100,26,26,grad(c,-26,-126,26,-74,[[0,'#8a94a0'],[1,'#2e3640']]),'#1e2430',2);for(let k=0;k<8;k++){const a=k*Math.PI/4;poly(c,[[Math.cos(a)*22,-100+Math.sin(a)*22],[Math.cos(a)*40,-100+Math.sin(a)*40],[Math.cos(a+.35)*22,-100+Math.sin(a+.35)*22]],'#c0c6cc','#3c555f',1)}break;
      case 'poleaxe':wood(-120,120,8);path(c,q=>{q.moveTo(0,-110);q.bezierCurveTo(50,-125,80,-80,66,-30);q.bezierCurveTo(44,-50,20,-52,0,-40);q.closePath()},steel,'#b6d9cc',1.5);rr(c,-8,-114,16,10,2,'#8f7a3e','#d4af37',1);break;
      case 'spear':wood(-70,130,8);poly(c,[[-12,-70],[0,-135],[12,-70],[0,-60]],steel,'#b6d9cc',1.5);rr(c,-8,-72,16,10,2,'#8f7a3e','#d4af37',1);line(c,0,-125,0,-70,'#f5f6d3',1);break;
      case 'pike':wood(-120,140,6);poly(c,[[-7,-120],[0,-150],[7,-120],[0,-114]],steel,'#b6d9cc',1.2);rr(c,-6,-122,12,8,1,'#8f7a3e','#d4af37',1);break;
      case 'trident':wood(-70,130,8);rr(c,-26,-78,52,8,2,'#8f7a3e','#d4af37',1);[-22,0,22].forEach(x=>poly(c,[[x-6,-78],[x,-130],[x+6,-78]],steel,'#b6d9cc',1.2));break;
      case 'halberd':wood(-120,130,8);poly(c,[[-6,-110],[0,-150],[6,-110]],steel,'#b6d9cc',1.2);path(c,q=>{q.moveTo(4,-108);q.bezierCurveTo(50,-116,70,-70,54,-40);q.bezierCurveTo(36,-56,18,-56,4,-50);q.closePath()},steel,'#b6d9cc',1.5);path(c,q=>{q.moveTo(-4,-100);q.lineTo(-40,-90);q.lineTo(-30,-60);q.lineTo(-4,-62);q.closePath()},steel,'#b6d9cc',1.5);rr(c,-8,-112,16,8,2,'#8f7a3e','#d4af37',1);break;
      case 'bow':path(c,q=>{q.moveTo(0,110);q.bezierCurveTo(-60,50,-60,-50,0,-110)},null,'#5a3a22',9);path(c,q=>{q.moveTo(0,110);q.bezierCurveTo(-60,50,-60,-50,0,-110)},null,'#9a7a4a',5);line(c,0,110,0,-110,'#e8e2d0',1.5);rr(c,-7,-14,14,28,3,'#3a2416');line(c,-40,0,70,0,'#4a3420',3);poly(c,[[70,-5],[86,0],[70,5]],'#b6c0b5','#5b6660',1);poly(c,[[-40,-6],[-28,0],[-40,6]],'#c9643a');break;
      case 'crossbow':rr(c,-10,-20,20,130,3,'#5a3a22','#8a6a42',1.5);path(c,q=>{q.moveTo(-90,-30);q.bezierCurveTo(-60,-60,60,-60,90,-30)},null,'#3c555f',9);path(c,q=>{q.moveTo(-90,-30);q.bezierCurveTo(-60,-60,60,-60,90,-30)},null,'#8ca9ac',5);line(c,-90,-30,90,-30,'#e8e2d0',1.5);rr(c,-4,-60,8,80,2,'#2b2b2b','#6b6b6b',1);poly(c,[[-6,-62],[0,-78],[6,-62]],'#c0c6cc','#3c555f',1);rr(c,-18,40,36,12,3,'#2b2b2b','#6b6b6b',1);break;
      case 'revolver':c.scale(1.7,1.7);gun(72,false);break;
      case 'pistol':c.rotate(.65);c.scale(1.7,1.7);rr(c,-36,-16,76,14,3,'#2b2b2b','#6b6b6b',1.5);rr(c,-30,-4,20,30,4,'#1f1f1f','#7a7a7a',1.5);rr(c,-27,-1,14,26,2,'#3a3a3a');path(c,q=>{q.moveTo(-8,0);q.bezierCurveTo(-4,12,4,14,8,6)},null,'#8a8a8a',3);rr(c,34,-20,6,6,1,'#444','#888',1);line(c,-32,-10,36,-10,'#9a9a9a',1);break;
      case 'flintlock':c.rotate(.65);c.scale(1.5,1.5);poly(c,[[-30,-2],[-10,-2],[-6,8],[-18,30],[-40,34],[-46,18]],'#5a3a22','#8a6a42',1.5);rr(c,-20,-16,96,12,3,'#3a3a3a','#8a8a8a',1.5);rr(c,-14,-10,30,8,2,'#c9a94a','#e7d08a',1);poly(c,[[6,-18],[12,-30],[18,-26],[14,-16]],'#c9a94a','#8f7a3e',1);path(c,q=>{q.moveTo(-6,4);q.bezierCurveTo(-2,14,6,14,8,6)},null,'#c9a94a',2.5);break;
      case 'minigun':
      case 'rifle':c.rotate(.65);c.scale(1.15,1.15);poly(c,[[-96,-6],[-56,-6],[-52,14],[-78,30],[-100,26],[-104,8]],'#5a3a22','#8a6a42',1.5);rr(c,-60,-18,156,13,3,'#2b2b2b','#6b6b6b',1.5);rr(c,-56,-8,70,10,3,'#5a3a22','#8a6a42',1.5);rr(c,-20,0,16,26,3,'#1f1f1f','#7a7a7a',1.5);path(c,q=>{q.moveTo(-40,4);q.bezierCurveTo(-36,14,-28,16,-26,8)},null,'#8a8a8a',3);rr(c,88,-22,8,8,2,'#444','#888',1);rr(c,-30,-24,10,6,2,'#444','#888',1);line(c,-56,-12,94,-12,'#9a9a9a',1);break;
      case 'smg':c.rotate(.65);c.scale(1.25,1.25);rr(c,-70,-14,120,16,4,'#2b2b2b','#6b6b6b',1.5);rr(c,-78,-10,20,10,2,'#3a3a3a','#7a7a7a',1);rr(c,-30,2,16,34,3,'#1f1f1f','#7a7a7a',1.5);rr(c,8,2,14,40,3,'#1f1f1f','#7a7a7a',1.5);path(c,q=>{q.moveTo(-12,4);q.bezierCurveTo(-8,14,0,16,2,8)},null,'#8a8a8a',3);for(let k=0;k<6;k++)ellipse(c,-56+k*16,-6,2.2,2.2,'#111');rr(c,46,-18,10,8,2,'#444','#888',1);break;
      case 'sniper':c.rotate(.65);c.scale(1.1,1.1);poly(c,[[-104,-6],[-64,-6],[-60,14],[-86,32],[-108,28],[-112,8]],'#2a3a2a','#4a6a4a',1.5);rr(c,-66,-18,190,12,3,'#2b2b2b','#6b6b6b',1.5);rr(c,-60,-8,80,10,3,'#2a3a2a','#4a6a4a',1.5);rr(c,-24,0,16,24,3,'#1f1f1f','#7a7a7a',1.5);rr(c,-40,-36,58,12,5,'#1a1a1a','#8a8a8a',1.5);ellipse(c,-40,-30,6,6,'#8ac0e8','#1a1a1a',1);ellipse(c,18,-30,5,5,'#8ac0e8','#1a1a1a',1);rr(c,-36,-26,8,8,1,'#444');rr(c,120,-20,12,6,2,'#444','#888',1);poly(c,[[60,-6],[64,16],[58,16]],'#3a3a3a','#777',1);poly(c,[[76,-6],[80,16],[74,16]],'#3a3a3a','#777',1);break;
      case 'karambit':c.rotate(-.3);rr(c,-6,20,12,60,5,'#1a1a1a','#555',1.5);ellipse(c,0,90,11,11,null,'#777',4);path(c,q=>{q.moveTo(-6,20);q.bezierCurveTo(-40,-10,-50,-60,-10,-100);q.bezierCurveTo(-26,-60,-18,-20,6,10);q.closePath()},steel,'#b6d9cc',1.2);break;
      case 'kukri':grip(40,34);c.translate(0,36);path(c,q=>{q.moveTo(-8,0);q.bezierCurveTo(-30,-40,-44,-80,-18,-130);q.lineTo(-4,-126);q.bezierCurveTo(-20,-80,-4,-40,10,0);q.closePath()},steel,'#b6d9cc',1.2);break;
      case 'machete':grip(40,34);c.translate(0,36);path(c,q=>{q.moveTo(-12,0);q.lineTo(-14,-110);q.bezierCurveTo(-14,-130,6,-136,14,-118);q.lineTo(12,0);q.closePath()},steel,'#b6d9cc',1.2);line(c,-6,-10,-8,-110,'#f5f6d3',1);break;
      case 'flail':wood(-10,120,9);line(c,0,-10,0,-24,'#555',4);for(let k=0;k<8;k++)ellipse(c,Math.sin(k*.6)*10,-30-k*9,3,3,'#8a8a8a','#333',1);ellipse(c,8,-108,20,20,grad(c,-12,-128,28,-88,[[0,'#8a94a0'],[1,'#2e3640']]),'#1e2430',2);for(let k=0;k<8;k++){const a=k*Math.PI/4;poly(c,[[8+Math.cos(a)*17,-108+Math.sin(a)*17],[8+Math.cos(a)*32,-108+Math.sin(a)*32],[8+Math.cos(a+.4)*17,-108+Math.sin(a+.4)*17]],'#c0c6cc','#3c555f',1)}break;
      case 'club':path(c,q=>{q.moveTo(-6,120);q.lineTo(-12,-60);q.bezierCurveTo(-14,-110,14,-110,12,-60);q.lineTo(6,120);q.closePath()},grad(c,-14,0,14,0,[[0,'#4a3420'],[.5,'#9a7a4a'],[1,'#4a3420']]),'#2a1a10',1.5);for(let k=0;k<4;k++)line(c,-10,-20+k*18,10,-24+k*18,'#3a2416',1);break;
      case 'sling':path(c,q=>{q.moveTo(-40,100);q.bezierCurveTo(-30,20,-10,-40,0,-90)},null,'#8a6a42',3);path(c,q=>{q.moveTo(40,100);q.bezierCurveTo(30,20,10,-40,0,-90)},null,'#8a6a42',3);ellipse(c,0,-96,18,12,'#5a3a22','#8a6a42',1.5);ellipse(c,0,-96,8,8,'#7a7a7a','#444',1);break;
      case 'musket':gun(190,true);rr(c,120,-10,10,6,1,'#c9a94a');break;
      case 'shotgun':gun(150,true,2);break;
      default:grip(60,40);guard(55,28);c.translate(0,48);blade(145,8);
    }
    c.restore();
  }
  function drawCardArt(c,card,w=360,h=360){
    const col=card?.color||'#777',tier=card?.rarity||'common';
    c.save();
    rr(c,40,24,w-80,h-48,14,grad(c,0,0,0,h,[[0,mixColor(col,'#000',.55)],[1,mixColor(col,'#000',.8)]]),mixColor(col,'#fff',.35),4);
    rr(c,52,36,w-104,h-72,10,null,mixColor(col,'#fff',.15),1);
    // Portrait medallion with initials; a laurel for heroes, crossed marks for weapons.
    glow(c,w/2,h*.42,110,mixColor(col,'#fff',.1)+'66');
    ellipse(c,w/2,h*.42,74,74,grad(c,w/2-70,h*.42-70,w/2+70,h*.42+70,[[0,mixColor(col,'#fff',.3)],[1,col]]),mixColor(col,'#fff',.5),3);
    txt(c,card?.initials||'?',w/2,h*.42+(card?.initials?.length>1?22:24),card?.initials?.length>1?56:62,'#f6efd8','center','Georgia');
    if(card?.type==='hero'){for(let side=-1;side<=1;side+=2)for(let i=0;i<7;i++){const a=-Math.PI/2+side*(.35+i*.17),x=w/2+Math.cos(a)*96,y=h*.42+Math.sin(a)*96;c.save();c.translate(x,y);c.rotate(a+side*.9);ellipse(c,0,0,10,4,mixColor(col,'#fff',.45));c.restore()}}
    rr(c,64,h-118,w-128,34,6,'#0d110e','#5a5a4a',1);txt(c,(card?.name||'').toLocaleUpperCase('pl-PL'),w/2,h-95,card?.name?.length>18?14:17,'#f3e9cf','center','Arial');
    txt(c,card?.era||'',w/2,h-66,11,mixColor(col,'#fff',.55),'center','Arial');
    txt(c,(card?.summary||'').toLocaleUpperCase('pl-PL'),w/2,h-46,10,'#cfd6c4','center','Arial');
    for(let k=0;k<{basic:0,common:1,rare:2,epic:3,legendary:4}[tier];k++)txt(c,'★',w/2-30+k*20,56,16,mixColor(col,'#fff',.6),'center','Arial');
    c.restore();
  }
  // A trophy under glass: a glowing glyph on a velvet cushion.
  function drawTrophy(c,trophy,o={}){
    const col=trophy?.color||'#c9b37a',size=o.size||1;c.save();c.scale(size,size);
    ellipse(c,0,22,36,10,'#1a1410','#4a3a2a',1);rr(c,-40,14,80,10,3,'#3b2a3a','#6a4a6a',1);
    glow(c,0,-20,60,mixColor(col,'#fff',.2)+'77');
    c.save();c.shadowColor=col;c.shadowBlur=18;txt(c,trophy?.glyph||'?',0,-2,54,mixColor(col,'#fff',.45),'center','Georgia');c.restore();
    c.restore();
  }
  // The player's hall: the arena room filled with their exhibition. `shown` comes from MuseumHall.exhibition().
  function drawHall(c,w=1440,h=810,t=0,shown=[],o={}){
    drawArena(c,w,h,t,'hall',{sign:[o.name||'SALA PRYWATNA','KOLEKCJA NOCNEGO STRÓŻA'],frames:false});
    c.save();c.scale(w/1440,h/810);
    const at=id=>shown.find(e=>e.slot.id===id)?.item||null;
    const pedestal=(x,label)=>{rr(c,x-70,640,140,26,3,'#3a2f22','#8a7352',1.5);rr(c,x-80,664,160,10,2,'#241c13','#6e5a3e',1);rr(c,x-60,628,120,14,2,'#4a3b2a','#a08a60',1);txt(c,label,x,658,9,'#d9c89a','center','Arial')};
    const emptyTag=(x,y,text)=>{rr(c,x-52,y-9,104,18,2,'#120f0b','#5a4a36',1);txt(c,text,x,y+4,8,'#8a7a5e','center','Arial')};
    // Armour pedestals by the windows.
    [['armor-1',320],['armor-2',1120]].forEach(([id,x],i)=>{const item=at(id);pedestal(x,item?item.name:'WOLNY POSTUMENT');if(item){c.save();c.translate(x,628);c.scale(.92,.92);drawKnight(c,0,0,{pose:'idle',facing:i?-1:1,time:t,skin:item.id});c.restore();glow(c,x,520,120,'rgba(255,220,160,.08)')}else emptyTag(x,560,'ZBROJA')});
    // Weapon mounts on the wall above the consoles.
    [['weapon-1',176],['weapon-2',1280]].forEach(([id,x])=>{const item=at(id);rr(c,x-34,250,68,200,4,'#1d1710','#8a7352',1.5);rr(c,x-28,256,56,188,3,'#241c13','#5a4a36',1);if(item){c.save();c.translate(x,352);c.scale(.62,.62);drawWeaponIcon(c,window.MuseumWeapons?.get(item.id)||item);c.restore();rr(c,x-30,452,60,14,2,'#120f0b','#8a7352',1);txt(c,item.name.split(' ')[0],x,462,8,'#d9c89a','center','Arial')}else emptyTag(x,352,'BROŃ')});
    // Card frames where the reliefs used to hang.
    [['card-1',452],['card-2',883]].forEach(([id,x])=>{const item=at(id);rr(c,x-7,231,119,172,2,'#181f20','#716448',2);rr(c,x,238,105,158,1,'#0e1a20','#ac9360',2);if(item){c.save();c.translate(x+3,241);c.scale(99/360,152/360);drawCardArt(c,window.MuseumCards?.get(item.id)||item,360,360);c.restore()}else emptyTag(x+52,317,'KARTA')});
    // Glass cases inside the central arch.
    [['trophy-1',660],['trophy-2',782]].forEach(([id,x])=>{const item=at(id);rr(c,x-48,392,96,150,3,'#2a2219','#a08a60',1.5);c.save();c.globalAlpha=.18;rr(c,x-44,396,88,120,2,'#9ad0e8');c.restore();rr(c,x-44,396,88,120,2,null,'rgba(190,230,255,.35)',1);if(item){c.save();c.translate(x,480);drawTrophy(c,item,{size:.8});c.restore();rr(c,x-44,520,88,18,2,'#120f0b','#8a7352',1);txt(c,item.name.split(' ')[0],x,533,8,'#d9c89a','center','Arial')}else{txt(c,'GABLOTA',x,460,9,'#6a5a46','center','Arial');txt(c,'WOLNA',x,474,9,'#6a5a46','center','Arial')}});
    c.restore();
  }
  // A loot crate drawn to fit a w x h box. Family picks the material; crate.color tints bands, glow and the emblem.
  function drawCrate(c,crate,w=240,h=200,o={}){
    const col=crate?.color||'#c9b37a',fam=crate?.family||'classic',t=o.time||0,open=o.open||0;
    const wood=fam==='weapons'?'#4a4f58':fam==='cards'?'#3b2a4a':fam==='mixed'?'#1e2a22':fam==='themed'?mixColor(col,'#000',.62):'#5a3c22';
    const woodHi=mixColor(wood,'#fff',.22),woodLo=mixColor(wood,'#000',.35),band=fam==='weapons'?'#9aa3ad':col,bandLo=mixColor(band,'#000',.4);
    c.save();c.translate(w/2,h*.58);const sx=w/240,sy=h/200;c.scale(sx,sy);
    glow(c,0,-10,120,mixColor(col,'#000',.1)+'55');
    ellipse(c,0,62,88,12,'rgba(0,0,0,.45)');
    // Body.
    rr(c,-84,-20,168,80,8,grad(c,-84,-20,84,60,[[0,woodHi],[.5,wood],[1,woodLo]]),woodLo,2);
    for(let k=0;k<4;k++)line(c,-80,-2+k*16,80,-2+k*16,'rgba(0,0,0,.18)',1);
    // Lid, lifted when opening.
    c.save();c.translate(0,-20);c.rotate(-open*.9);
    path(c,q=>{q.moveTo(-86,0);q.lineTo(-86,-26);q.bezierCurveTo(-86,-58,86,-58,86,-26);q.lineTo(86,0);q.closePath()},grad(c,-86,-58,86,0,[[0,woodHi],[.6,wood],[1,woodLo]]),woodLo,2);
    [-56,56].forEach(x=>{rr(c,x-8,-50,16,52,2,band,bandLo,1.5);line(c,x-3,-46,x-3,-2,mixColor(band,'#fff',.4),1)});
    c.restore();
    [-56,56].forEach(x=>{rr(c,x-8,-20,16,80,2,band,bandLo,1.5);line(c,x-3,-16,x-3,56,mixColor(band,'#fff',.4),1);[[x,-12],[x,52]].forEach(([px,py])=>ellipse(c,px,py,2.5,2.5,bandLo))});
    rr(c,-84,-22,168,6,2,band,bandLo,1);
    // Lock plate with the emblem.
    ellipse(c,0,10,24,24,grad(c,-24,-14,24,34,[[0,mixColor(col,'#fff',.35)],[1,mixColor(col,'#000',.3)]]),bandLo,2);
    ellipse(c,0,10,17,17,'#0f140f',mixColor(col,'#000',.2),1.5);
    c.save();c.shadowColor=col;c.shadowBlur=12;txt(c,crate?.glyph||'✦',0,19,22,mixColor(col,'#fff',.2),'center','Georgia');c.restore();
    if(fam==='weapons')[-30,30].forEach(x=>{line(c,x-10,30,x+10,30,'#c0c6cc',3);line(c,x,20,x,40,'#c0c6cc',3)});
    if(fam==='cards'){rr(c,-70,-12,22,30,2,mixColor(col,'#fff',.1),bandLo,1);rr(c,48,-12,22,30,2,mixColor(col,'#fff',.1),bandLo,1)}
    if(fam==='mixed'||fam==='classic'&&crate?.id!=='gallery'){for(let k=0;k<5;k++){const a=t*.7+k*1.26,r=100+Math.sin(t*2+k)*6;ellipse(c,Math.cos(a)*r,-10+Math.sin(a)*r*.5,2+(k%2),2+(k%2),mixColor(col,'#fff',.5))}}
    // Sparkles.
    [[-96,-66],[98,-40],[-70,-80]].forEach(([x,y],k)=>{const sIz=4+Math.sin(t*3+k)*1.5;poly(c,[[x,y-sIz*2],[x+sIz*.6,y],[x,y+sIz*2],[x-sIz*.6,y]],mixColor(col,'#fff',.5));poly(c,[[x-sIz*2,y],[x,y+sIz*.6],[x+sIz*2,y],[x,y-sIz*.6]],mixColor(col,'#fff',.5))});
    c.restore();
  }
  // Pixel mode: everything is drawn onto a small offscreen canvas and blown up with nearest-neighbour sampling,
  // so the same procedural art reads as chunky pixel art. `factor` is the pixel size in logical units.
  const lowCanvases=new WeakMap();
  let pixelFactor=0;
  function setPixelFactor(f){pixelFactor=Math.max(0,Number(f)||0);}
  function pixelFrame(ctx,logicalW,logicalH,draw){
    if(!pixelFactor){draw(ctx);return;}
    const target=ctx.canvas;let low=lowCanvases.get(target);
    const lw=Math.round(logicalW/pixelFactor),lh=Math.round(logicalH/pixelFactor);
    if(!low){low=document.createElement('canvas');lowCanvases.set(target,low)}
    if(low.width!==lw||low.height!==lh){low.width=lw;low.height=lh}
    const lctx=low.getContext('2d');lctx.setTransform(1/pixelFactor,0,0,1/pixelFactor,0,0);lctx.clearRect(0,0,logicalW,logicalH);
    draw(lctx);
    const m=ctx.getTransform();ctx.save();ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,logicalW,logicalH);ctx.drawImage(low,0,0,lw,lh,0,0,logicalW,logicalH);ctx.restore();ctx.setTransform(m);
  }
  window.MuseumArt={drawArena,drawKnight,drawRex,drawFigure,drawExhibit,drawWeaponIcon,drawCardArt,drawTrophy,drawHall,drawCrate,fighters,themes,drawGuardScene,pixelFrame,setPixelFactor,get pixelFactor(){return pixelFactor}};
})();
