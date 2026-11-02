/* Store. Crates open for earned tokens or from the PLN balance (demo balance topped up by a moderator). */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const loot=window.MuseumLoot;
 const currency=new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'});
 const number=new Intl.NumberFormat('pl-PL');
 const percent=value=>`${new Intl.NumberFormat('pl-PL',{maximumFractionDigits:2}).format(value)}%`;
 let selectedId='gallery',familyFilter='all',mounted=false;
 let callbacks={getProfile:()=>({coins:0,owned:[],freeCrates:0}),canOpen:()=>false,onOpenWithTokens:()=>{},onBuyFinish:()=>{},onOpenWithPLN:()=>{},onRoulette:()=>null,onRouletteSettle:()=>{},onSlots:()=>null,onSlotsSettle:()=>{},notify:()=>{}};
 const pln=gr=>(Number(gr||0)/100).toLocaleString('pl-PL',{style:'currency',currency:'PLN'});
 const chest='<svg viewBox="0 0 180 145" fill="none" aria-hidden="true" focusable="false"><ellipse cx="90" cy="129" rx="64" ry="9" fill="currentColor" opacity=".09"/><path d="m28 62 62-24 62 24v57l-62 19-62-19V62Z" fill="currentColor" fill-opacity=".09" stroke="currentColor" stroke-width="1.4"/><path d="m28 62 62 23 62-23M90 85v53M28 87l62 22 62-22" stroke="currentColor" stroke-opacity=".65" stroke-width="1.3"/><path d="m53 52 62 23v55M123 51 61 74v55" stroke="currentColor" stroke-width="7"/><path d="m81 81 18 1v25l-9 7-9-7V81Z" fill="currentColor"/><path d="M90 89v12" stroke="#182014" stroke-width="3"/><path d="m90 7 4 13 13 4-13 4-4 13-4-13-13-4 13-4 4-13ZM143 26l2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7Z" fill="currentColor"/><path d="M35 26v11m-5-5h10" stroke="currentColor" stroke-opacity=".4"/></svg>';
 const emblems={
  elements:'<path d="M0-24C8-8 23-5 18 12 14 31-17 31-21 12-25-3-9-13-8-20-4-13-4-6 0-3 6-11 2-16 0-24Z" fill="currentColor"/><path d="M1 1C8 12 13 14 8 22 2 29-9 23-8 15-7 9-2 7 1 1Z" fill="#1b241d"/>',
  shadow:'<path d="M14-22C-27-28-31 23 10 26-12 11-12-9 14-22Z" fill="currentColor"/><path d="m19-15 2 6 7 2-7 2-2 7-2-7-7-2 7-2 2-6ZM23 11l2 4 4 2-4 1-2 5-1-5-5-1 5-2 1-4Z" fill="currentColor"/>',
  nature:'<path d="M-17 23C-33-9-6-22 24-25 24 4 12 27-17 23Z" fill="currentColor"/><path d="M-20 28 14-14M-8 12-15 0M1 1 14 2M7-6 5-17" stroke="#1b241d" stroke-width="2.5"/>',
  royal:'<path d="m-25-13 13 10 2-22 12 17 13-17 1 22 13-10-6 32h-43l-5-32Z" fill="currentColor"/><path d="M-20 24h43M-14 11h30" stroke="currentColor" stroke-width="4"/><circle cx="1" cy="6" r="4" fill="#1b241d"/>',
  forge:'<path d="m-7-28 14 0 2 10 7 3 9-5 7 12-8 6v8l8 6-7 12-9-4-7 3-2 10H-7l-2-10-7-3-9 4-7-12 8-6v-8l-8-6 7-12 9 5 7-3 2-10Z" fill="currentColor"/><circle r="12" fill="#1b241d"/><circle r="5" fill="currentColor"/>',
  desert:'<circle cx="13" cy="-17" r="9" fill="currentColor"/><path d="M-33 19-10-16 13 19M-18 21 8-5 33 21" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M-33 28h66M-5-7 5 11" stroke="currentColor" stroke-width="2"/>'
 };
 function node(tag,className,text){const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;}
 function profile(){return callbacks.getProfile();}
 function isFree(crate,current){return crate.id==='gallery'&&current.freeCrates>0;}
 function validCrate(id){return loot.activeCrates().find(crate=>crate.id===id);}
 function scrollToSummary(){let reduced=false;try{reduced=!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}catch(_){}$('shopSummary').scrollIntoView({behavior:reduced?'instant':'smooth',block:'nearest'});}
 let view='crates';
 const filters=[['shopFilterAll','all'],['shopFilterClassic','classic'],['shopFilterThemed','themed'],['shopFilterWeapons','weapons'],['shopFilterCards','cards'],['shopFilterMixed','mixed'],['shopFilterFinishes','finishes']];
 const familyOfGroup={classic:'classic',themed:'themed',weapons:'weapons','weapon-type':'weapons','weapon-era':'weapons',cards:'cards',mixed:'mixed',finishes:'finishes'};
 function matchesFamily(crate){return familyFilter==='all'||familyOfGroup[crate.group]===familyFilter||crate.family===familyFilter;}
 function drawCrateInto(canvas,crate,time){const ctx=canvas.getContext('2d');if(!ctx||!window.MuseumArt?.drawCrate)return;ctx.clearRect(0,0,canvas.width,canvas.height);const pix=window.MuseumArt.pixelFactor&&window.MuseumPixel?window.MuseumPixel:null;if(pix){canvas.style.imageRendering='pixelated';pix.drawCrate(ctx,crate,canvas.width,canvas.height);}else window.MuseumArt.drawCrate(ctx,crate,canvas.width,canvas.height,{time});}
 function poolLine(crate,current){
  const category=loot.getCategory(crate.categoryId);
  if(category&&crate.pool==='skin'){const pool=loot.items.filter(item=>item.kind==='skin'&&item.categoryId===category.id&&item.weight>0);return [pool.filter(item=>loot.has(current,item)).length,pool.length,'STROJÓW'];}
  if(crate.id==='collector'){const pool=loot.items.filter(item=>item.kind==='finish'&&item.rarity==='mythic');return [pool.filter(item=>loot.has(current,item)).length,pool.length,'MITYCZNYCH'];}
  if(crate.pool==='finish'){const all=loot.items.filter(item=>item.kind==='finish'&&crate.rarityWeights[item.rarity]>0&&(crate.season?item.season===crate.season:!item.season));return [all.length-loot.remaining(current,crate.id).length,all.length,'WYKOŃCZEŃ'];}
  const pool=loot.items.filter(item=>(crate.pool==='any'||item.kind===crate.pool)&&item.weight>0&&crate.rarityWeights[item.rarity]>0&&(!category||item.categoryId===category.id)&&(!crate.weaponType||item.type===crate.weaponType));
  return [pool.filter(item=>loot.has(current,item)).length,pool.length,crate.pool==='weapon'?'BRONI':crate.pool==='card'?'KART':crate.pool==='skin'?'STROJÓW':'PRZEDMIOTÓW'];
 }
 function tile(crate,current){
  const index=loot.activeCrates().indexOf(crate),category=loot.getCategory(crate.categoryId),typeName=crate.weaponType?window.MuseumWeapons.types[crate.weaponType].name:null;
  const available=loot.remaining(current,crate.id).length>0,selected=crate.id===selectedId,[have,total,what]=poolLine(crate,current);
  const button=node('button',`shop-tile${selected?' is-selected':''}${available?'':' is-done'}${crate.id==='treasury'?' is-best':''}`);
  button.type='button';button.dataset.crateId=crate.id;button.style.setProperty('--crate-color',crate.color);
  button.setAttribute('aria-pressed',String(selected));
  const promo=loot.promoFor(crate),cost=loot.crateCost(crate),plnPrice=loot.cratePricePLN(crate)/100;
  button.setAttribute('aria-label',`${crate.name}. ${crate.guarantee}. ${number.format(cost)} żetonów lub planowo ${currency.format(plnPrice)}.${promo?` ${promo.label}.`:''}`);
  const art=node('span','shop-tile-art');const canvas=document.createElement('canvas');canvas.width=142;canvas.height=120;art.append(canvas);drawCrateInto(canvas,crate,1.3);
  const body=node('span','shop-tile-body');
  body.append(node('small','shop-tile-tag',`${String(index+1).padStart(2,'0')} · ${crate.season?`${crate.tag} · ${loot.seasonLabel(crate.season)}`:(typeName||category?.name||crate.tag||'KOLEKCJA')}`),node('strong','shop-tile-name',crate.name),node('span','shop-tile-cost',`${number.format(cost)} ✦`),node('span','shop-tile-pln',currency.format(plnPrice)));
  if(promo){for(const [cls,old] of [['shop-tile-cost',`${number.format(crate.cost)} ✦`],['shop-tile-pln',currency.format(crate.pricePLN)]]){const el=body.querySelector('.'+cls),was=document.createElement('s');was.textContent=old;el.prepend(was,' ');}}
  body.append(node('span','shop-tile-progress',!available?'ZEBRANA ✓':isFree(crate,current)?'PREZENT NA START':`${have} / ${total} ${what}`));
  if(promo)button.append(node('span','shop-tile-badge is-promo',promo.label));else if(crate.id==='treasury')button.append(node('span','shop-tile-badge','HIT'));
  button.append(art,body);
  button.addEventListener('click',()=>{
   if(!callbacks.canOpen()){callbacks.notify('Sklep jest dostępny przed następnym pojedynkiem.');return;}
   render(crate.id);if(window.innerWidth<=900)scrollToSummary();
  });
  return button;
 }
 function render(crateId){
  const requested=validCrate(crateId);
  if(requested){selectedId=requested.id;if(!matchesFamily(requested))familyFilter='all';}
  const visible=loot.activeCrates().filter(matchesFamily);
  if(!visible.some(crate=>crate.id===selectedId))selectedId=visible[0]?.id||loot.activeCrates()[0]?.id;
  const selected=validCrate(selectedId)||loot.activeCrates()[0];
  if(!selected||!$('shopOffers'))return;
  selectedId=selected.id;
  const current=profile(),coins=Math.max(0,Number(current.coins)||0);
  const focused=document.activeElement?.closest?.('.shop-tile')?.dataset.crateId;
  // Crates grouped into titled sections; a family filter narrows to the matching groups.
  const sections=loot.crateGroups.map(group=>({group,crates:visible.filter(crate=>crate.group===group.id)})).filter(section=>section.crates.length);
  const blocks=sections.map(({group,crates})=>{
   const section=node('section','shop-group');
   const head=node('header','shop-group-head');head.append(node('h4','',group.name),node('small','',`${crates.length} ${crates.length===1?'SKRZYNIA':crates.length<5?'SKRZYNIE':'SKRZYŃ'}`));
   const grid=node('div','shop-grid');grid.append(...crates.map(crate=>tile(crate,current)));
   section.append(head,grid);return section;
  });
  $('shopOffers').replaceChildren(...blocks);
  if(focused)$('shopOffers').querySelector(`[data-crate-id="${focused}"]`)?.focus({preventScroll:true});
  for(const [id,filter] of filters)$(id).setAttribute('aria-pressed',String(familyFilter===filter));
  $('shopOffersCount').textContent=String(loot.activeCrates().length);
  $('shopBalance').textContent=`${number.format(coins)} ✦`;
  $('shopBalancePLN').textContent=pln(current.balance);
  // Selected crate panel.
  drawCrateInto($('shopSelectedArt'),selected,1.3);
  $('shopSelectedName').textContent=selected.name;
  $('shopSelectedPrice').textContent=currency.format(loot.cratePricePLN(selected)/100);
  $('shopSelectedGuarantee').textContent=`${selected.guarantee}. Bez duplikatów. ${selected.description||''}`;
  const category=loot.getCategory(selected.categoryId);
  $('shopSelectedCategory').textContent=selected.pool==='any'?'MIESZANA · STROJE, BROŃ I KARTY':selected.pool==='finish'?'WYKOŃCZENIA BRONI':category?`${category.name} · SKRZYNIA ${selected.pool==='card'?'KART':'TEMATYCZNA'}`:selected.pool==='weapon'?'BROŃ · ARSENAŁ':selected.pool==='card'?'KARTY BOHATERÓW I BRONI':'WSZYSTKIE KATEGORIE · SKRZYNIA KLASYCZNA';
  $('shopSummary').style.setProperty('--crate-color',selected.color);
  const available=loot.remaining(current,selected.id).length>0,odds=loot.odds(current,selected.id);
  const tiers=['common','rare','epic','legendary',...(odds.mythic>0?['mythic']:[])].filter(tier=>odds[tier]>0);
  $('shopSelectedOdds').replaceChildren(...tiers.map(tier=>{const chip=node('span','shop-odd',`${loot.rarities[tier].name} ${percent(odds[tier]||0)}`);chip.style.setProperty('--rarity',loot.rarities[tier].color);return chip;}));
  const entries=loot.entries(current,selected.id);
  $('shopContentsSummary').textContent=entries.length?`ZAWARTOŚĆ: ${entries.length} MOŻLIWYCH ODKRYĆ`:'ZAWARTOŚĆ ZEBRANA · 0 NOWYCH';
  $('shopContentsList').replaceChildren(...entries.map(({item,chance})=>{const row=node('li','drop-row');row.style.setProperty('--rarity',loot.rarities[item.rarity].color);row.append(node('span','',item.name),node('small','',loot.rarities[item.rarity].name),node('strong','',percent(chance)));return row;}));
  const free=isFree(selected,current),cost=free?0:loot.crateCost(selected);
  const tokenButton=$('shopTokenBtn');
  tokenButton.disabled=!available||!!current.pendingReward||!callbacks.canOpen();
  tokenButton.textContent=!available?'ZAWARTOŚĆ ZEBRANA ✓':current.pendingReward?'ODBIERZ POPRZEDNIĄ NAGRODĘ':free?'WYBIERZ DARMOWĄ SKRZYNIĘ':coins<cost?`BRAKUJE ${number.format(cost-coins)} ✦`:`WYBIERZ ZA ${number.format(cost)} ✦`;
  const payBtn=$('shopPaymentBtn'),price=loot.cratePricePLN(selected),missingPLN=price-(Number(current.balance)||0);
  payBtn.disabled=!available||!!current.pendingReward||!callbacks.canOpen()||missingPLN>0;
  payBtn.textContent=!available?'ZAWARTOŚĆ ZEBRANA ✓':current.pendingReward?'ODBIERZ POPRZEDNIĄ NAGRODĘ':missingPLN>0?`BRAKUJE ${pln(missingPLN)}`:`KUP ZA ${pln(price)}`;
  $('shopPaymentHint').textContent=missingPLN>0?`Masz ${pln(current.balance)} na saldzie. Saldo zasila moderator w zakładce PORTFEL.`:'Zakup z salda w złotówkach. Skrzynia otworzy się od razu.';
  $('shopTokenHint').textContent=!available?'Masz już wszystko, co może wypaść z tej skrzyni.':current.pendingReward?'Odbierz zapisaną nagrodę w kolekcji, żeby otworzyć następną.':free?'Masz 1 darmową skrzynię Galerii na start. Otworzysz ją w kolekcji.':coins<cost?`Masz ${number.format(coins)} / ${number.format(cost)} ✦. Żetony zdobywasz w walkach.`:`Masz ${number.format(coins)} / ${number.format(cost)} ✦. Otwarcie potwierdzisz w kolekcji.`;
  renderFinishes(current);
 }
 // Direct sale of the mythic finishes: big preview on the player's own weapon, one selected finish in the side panel, paid from the balance.
 const plain=new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',maximumFractionDigits:0});
 let selectedFinishId=null,finishAnim=0;
 function finishList(){return loot.items.filter(item=>item.kind==='finish'&&item.rarity==='mythic');}
 function finishWeapon(current){return window.MuseumWeapons.get(current.weapon)||window.MuseumWeapons.get('sword');}
 function drawFinish(canvas,weapon,finishId,scale,time){const ctx=canvas.getContext('2d');if(!ctx||!window.MuseumPixel)return;ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,canvas.width,canvas.height);
  window.MuseumPixel.drawWeaponIcon(ctx,weapon,Math.round((canvas.width-16*scale)/2),Math.round((canvas.height-16*scale)/2),scale,{finish:finishId,time});}
 function renderFinishes(current){
  const root=$('shopFinishes');if(!root||!window.MuseumFinishes)return;
  const list=finishList(),weapon=finishWeapon(current);
  if(!list.some(item=>item.id===selectedFinishId))selectedFinishId=(list.find(item=>!loot.has(current,item))||list[0])?.id||null;
  const tiles=list.map((item,index)=>{
   const owned=loot.has(current,item),equipped=current.finish===item.id,tile=node('button',`shop-fin${owned?' is-owned':''}`);tile.type='button';tile.dataset.finishId=item.id;tile.setAttribute('aria-pressed',String(item.id===selectedFinishId));
   tile.style.setProperty('--crate-color',item.colors?.edge||item.colors?.steel||'#7ff0e0');
   const art=node('span','shop-fin-art');const canvas=document.createElement('canvas');canvas.width=192;canvas.height=128;art.append(canvas);drawFinish(canvas,weapon,item.id,7,1);
   const foot=node('span','shop-fin-foot');foot.append(node('strong','shop-fin-price',plain.format(item.pricePLN||0)),node('span','shop-fin-state',equipped?'● NAŁOŻONE':owned?'✓ MASZ':`${String(index+1).padStart(2,'0')} / ${list.length}`));
   tile.append(art,node('strong','shop-fin-name',item.name),foot);
   tile.setAttribute('aria-label',`${item.name}. ${plain.format(item.pricePLN||0)}. ${equipped?'Nałożone.':owned?'Masz.':'Do kupienia.'}`);
   tile.addEventListener('click',()=>{selectedFinishId=item.id;for(const t of root.querySelectorAll('.shop-fin'))t.setAttribute('aria-pressed',String(t.dataset.finishId===item.id));renderFinishPanel(profile());});
   return tile;
  });
  root.replaceChildren(...tiles);
  $('shopWalletPLN').textContent=pln(current.balance);
  const owned=list.filter(item=>loot.has(current,item)).length;$('shopFinishesCount').textContent=`${owned}/${list.length}`;
  renderFinishPanel(current);
 }
 function renderFinishPanel(current){
  const item=loot.getItem(selectedFinishId),panel=$('shopFinSummary');if(!panel)return;
  if(!item){panel.classList.add('hidden');return;}panel.classList.remove('hidden');
  const weapon=finishWeapon(current),owned=loot.has(current,item),equipped=current.finish===item.id,cost=loot.pricePLN(item),missing=cost-(Number(current.balance)||0);
  panel.style.setProperty('--crate-color',item.colors?.edge||item.colors?.steel||'#7ff0e0');
  drawFinish($('shopFinArt'),weapon,item.id,13,performance.now()/1000);
  $('shopFinName').textContent=item.name;$('shopFinWeapon').textContent=`MITYCZNE · PODGLĄD NA: ${weapon.name}`;$('shopFinDesc').textContent=`${item.description||''} Nakłada się na dowolną broń z twojej kolekcji.`;
  $('shopFinPrice').textContent=plain.format(item.pricePLN||0);
  const buy=$('shopFinBuy');buy.disabled=owned||missing>0||!callbacks.canOpen();
  buy.textContent=equipped?'NAŁOŻONE NA BROŃ ●':owned?'MASZ W KOLEKCJI ✓':missing>0?`BRAKUJE ${pln(missing)}`:`KUP ZA ${pln(cost)}`;
  $('shopFinHint').textContent=owned?'Nałożysz lub zdejmiesz je w kolekcji, w zakładce WYKOŃCZENIA.':missing>0?`Masz ${pln(current.balance)} na saldzie. Saldo zasila moderator.`:'Zakup z salda w złotówkach. Wykończenie trafia od razu do kolekcji.';
  startFinishAnim();
 }
 function startFinishAnim(){
  if(finishAnim)return;
  const tick=()=>{finishAnim=0;const shop=document.getElementById('shop');const item=loot.getItem(selectedFinishId);
   if(!shop||shop.classList.contains('hidden')||view!=='finishes'||!item||$('shopViewFinishes').classList.contains('hidden'))return;
   drawFinish($('shopFinArt'),finishWeapon(profile()),item.id,13,performance.now()/1000);finishAnim=requestAnimationFrame(tick);};
  finishAnim=requestAnimationFrame(tick);
 }
 function showView(next){
  view=next;if(view==='finishes')startFinishAnim();
  for(const [id,name] of [['shopTabCrates','crates'],['shopTabFinishes','finishes'],['shopTabWallet','wallet'],['shopTabRoulette','roulette'],['shopTabSlots','slots']])$(id).setAttribute('aria-selected',String(view===name));
  for(const [id,name] of [['shopViewCrates','crates'],['shopViewFinishes','finishes'],['shopViewWallet','wallet'],['shopViewRoulette','roulette'],['shopViewSlots','slots']])$(id).classList.toggle('hidden',view!==name);
  if(view==='roulette')roulette.render();if(view==='slots')slots.render();
 }
 function mount(options={}){
  for(const key of Object.keys(callbacks))if(typeof options[key]==='function')callbacks[key]=options[key];
  if(!mounted){
   for(const [id,filter] of filters)$(id).addEventListener('click',()=>{if(!callbacks.canOpen()){callbacks.notify('Sklep jest dostępny przed następnym pojedynkiem.');return;}familyFilter=filter;render();});
   for(const [id,name] of [['shopTabCrates','crates'],['shopTabFinishes','finishes'],['shopTabWallet','wallet'],['shopTabRoulette','roulette'],['shopTabSlots','slots']])$(id).addEventListener('click',()=>showView(name));
   roulette.mount();slots.mount();
   const soon=()=>callbacks.notify('Płatności nie są jeszcze podpięte. Wpłaty ruszą razem z operatorem płatności.');
   for(const b of document.querySelectorAll('.shop-deposit-btn'))b.addEventListener('click',soon);
   $('shopDepositBtn')?.addEventListener('click',soon);
   $('shopTokenBtn')?.addEventListener('click',()=>{
    const selected=validCrate(selectedId),current=profile();
    if(!selected||!callbacks.canOpen()||current.pendingReward||!loot.remaining(current,selected.id).length)return;
    callbacks.onOpenWithTokens(selected.id);
   });
   $('shopFinBuy')?.addEventListener('click',()=>{const item=loot.getItem(selectedFinishId);if(!item)return;if(!callbacks.canOpen()){callbacks.notify('Sklep jest dostępny przed następnym pojedynkiem.');return;}callbacks.onBuyFinish(item.id);});
   $('shopPaymentBtn')?.addEventListener('click',()=>{
    const selected=validCrate(selectedId),current=profile();
    if(!selected||!callbacks.canOpen()||current.pendingReward||!loot.remaining(current,selected.id).length||!loot.canPayPLN(current,selected.id))return;
    callbacks.onOpenWithPLN(selected.id);
   });
   mounted=true;
  }
  showView(view);
  render();
 }
 // ── Ruletka Kustosza: a strip of 15 fields scrolls under the pointer and eases out on the drawn one ──
 const roulette=(()=>{
  const R=()=>window.MuseumRoulette,CELL=48,LAPS=4,SPIN_MS=3400;
  const colors={red:['#b3202a','#7a1119'],black:['#2a2a30','#141418'],green:['#2f8f4e','#1b5a30']};
  let currency='coins',spinning=false,offset=0,anim=0,history=[];
  const amountEl=()=>$('rouAmount');
  const grosze=v=>Math.round(Number(v)*100);
  const stake=()=>currency==='pln'?grosze(amountEl().value):Math.floor(Number(amountEl().value)||0);
  const fmt=(amount,cur)=>cur==='pln'?pln(amount):`${number.format(amount)} ✦`;
  function drawStrip(){const c=$('rouStrip');if(!c)return;const x=c.getContext('2d');const W=c.width,H=c.height,wheel=R().WHEEL,n=wheel.length;x.imageSmoothingEnabled=false;x.fillStyle='#0d120c';x.fillRect(0,0,W,H);
   const start=Math.floor(offset/CELL)-1;for(let i=start;i<start+Math.ceil(W/CELL)+2;i++){const idx=((i%n)+n)%n,px=Math.round(i*CELL-offset),[a,b]=colors[wheel[idx]];x.fillStyle=b;x.fillRect(px+2,10,CELL-4,H-20);x.fillStyle=a;x.fillRect(px+4,12,CELL-8,H-28);x.fillStyle='#0d120c';x.fillRect(px,0,2,H);
    if(wheel[idx]==='green'){x.fillStyle='#d6f27a';x.fillRect(px+CELL/2-6,H/2-8,12,4);x.fillRect(px+CELL/2-2,H/2-12,4,12);x.fillRect(px+CELL/2-6,H/2+4,12,4);}}
   x.fillStyle='#0d120c';x.fillRect(0,0,W,10);x.fillRect(0,H-10,W,10);}
  function render(){const p=profile(),st=R().stats(p);$('rouCoins').textContent=`${number.format(p.coins)} ✦`;$('rouPLN').textContent=pln(p.balance);$('shopBalance').textContent=`${number.format(p.coins)} ✦`;$('shopBalancePLN').textContent=pln(p.balance);
   $('rouNet').textContent=`${st.coinsNet>=0?'+':''}${number.format(st.coinsNet)} ✦ · ${st.plnNet>=0?'+':''}${pln(st.plnNet)}`;
   for(const b of document.querySelectorAll('.roulette-currency button'))b.setAttribute('aria-pressed',String(b.dataset.currency===currency));
   $('rouAmountLabel').textContent=currency==='pln'?'STAWKA (ZŁ)':'STAWKA (✦)';const quick=document.querySelectorAll('.roulette-quick button');quick[0].textContent=currency==='pln'?'+5':'+100';quick[1].textContent=currency==='pln'?'+20':'+500';
   const can=!spinning&&callbacks.canOpen();for(const b of document.querySelectorAll('.roulette-bet'))b.disabled=!can;
   const hist=$('rouHistory');hist.replaceChildren(...history.slice(-12).map(h=>{const d=document.createElement('span');d.className=`roulette-chip is-${h.color}${h.win?' is-win':''}`;d.title=h.win?`+${fmt(h.payout,h.currency)}`:`−${fmt(h.amount,h.currency)}`;d.textContent=h.color==='green'?'K':'';return d;}));
   drawStrip();}
  function setAmount(v){const el=amountEl();const n=currency==='pln'?Math.max(1,Math.round(v)):Math.max(10,Math.floor(v));el.value=String(n);}
  function quick(kind){const p=profile(),cur=stake();const cap=currency==='pln'?p.balance:p.coins,unit=currency==='pln'?100:1;
   const next=kind==='a'?cur+(currency==='pln'?500:100):kind==='b'?cur+(currency==='pln'?2000:500):kind==='x2'?cur*2:kind==='half'?Math.floor(cur/2):cap;setAmount(Math.min(cap,Math.max(R().MIN[currency],next))/unit);}
  function bet(color){if(spinning)return;const p=profile(),check=R().canBet(p,{color,amount:stake(),currency});
   if(!callbacks.canOpen()){callbacks.notify('Ruletka jest dostępna przed następnym pojedynkiem.');return;}
   if(!check.ok){const why={min:`Minimalna stawka to ${fmt(R().MIN[currency],currency)}.`,funds:currency==='pln'?'Za mało na saldzie.':'Za mało żetonów.',pending:'Poprzednia wygrana jeszcze się księguje.'}[check.reason]||'Niepoprawny zakład.';$('rouResult').textContent=why;callbacks.notify(why);return;}
   const r=callbacks.onRoulette({color,amount:check.amount,currency});if(!r)return;
   spinning=true;render();$('rouResult').textContent=`Postawione ${fmt(r.amount,r.currency)} na ${({red:'czerwone',black:'czarne',green:'Kustosza'})[color]}. Kręci się…`;
   const c=$('rouStrip'),n=R().WHEEL.length,centre=c.width/2;const startOffset=offset;
   // The pointer sits at the strip's centre; land it on the drawn field a few laps ahead, with a little random slack inside the cell.
   const base=Math.ceil((startOffset+centre)/(n*CELL))*n*CELL;const target=base+LAPS*n*CELL+r.index*CELL+CELL/2+(Math.random()-.5)*CELL*.6-centre;
   const t0=performance.now();cancelAnimationFrame(anim);
   const step=now=>{const k=Math.min(1,(now-t0)/SPIN_MS),e=1-Math.pow(1-k,3);offset=startOffset+(target-startOffset)*e;drawStrip();if(k<1){anim=requestAnimationFrame(step);return;}
    spinning=false;history.push(r);callbacks.onRouletteSettle();
    $('rouResult').textContent=r.win?`${({red:'CZERWONE',black:'CZARNE',green:'KUSTOSZ'})[r.color]}! Wygrywasz ${fmt(r.payout,r.currency)}.`:`${({red:'Czerwone',black:'Czarne',green:'Kustosz'})[r.color]}. Przepadło ${fmt(r.amount,r.currency)}.`;
    render();};
   anim=requestAnimationFrame(step);}
  function mount(){for(const b of document.querySelectorAll('.roulette-currency button'))b.addEventListener('click',()=>{if(spinning)return;currency=b.dataset.currency;setAmount(currency==='pln'?5:100);render();});
   for(const b of document.querySelectorAll('.roulette-quick button'))b.addEventListener('click',()=>{if(!spinning)quick(b.dataset.quick);});
   for(const b of document.querySelectorAll('.roulette-bet'))b.addEventListener('click',()=>bet(b.dataset.color));
   amountEl()?.addEventListener('change',()=>setAmount(Number(amountEl().value)||0));}
  return {mount,render};
 })();
 // ── Automaty Kustosza: three reels of pixel symbols, each eases to a stop in turn ──
 const slots=(()=>{
  const S=()=>window.MuseumSlots,CELL=16,SCALE=4,VIEW=3;   // a reel shows three symbols; the middle row is the pay line
  const pal={O:'#141216',W:'#f2efe6',A:'#e07a2a',a:'#a2531d',G:'#d4af37',g:'#8a6a1a',R:'#b3202a',L:'#5c8a2a',X:'#ffd166',M:'#c9d6dc',S:'#6d757a',D:'#5a3a22'};
  const art={
   kufel:["................","....WWWWWWW.....","...WWWWWWWWW....","...OWWWWWWWO....","...OAAAAAAAOOO..","...OAaAAAaAOAO..","...OAaAAAaAO.AO.","...OAaAAAaAO.AO.","...OAaAAAaAO.AO.","...OAaAAAaAOAO..","...OAaAAAaAOO...","...OAAAAAAAO....","...OaaaaaaaO....","....OOOOOOO.....","................","................"],
   crown:["................","................","..O.....O.....O.",".OGO...OGO...OGO",".OGO..OGGGO..OGO",".OGGO.OGGGO.OGGO",".OGGGOGGGGGOGGGO",".OGGGGGGGGGGGGGO",".OGGRGGGGRGGGGRO",".OGGGGGGGGGGGGGO",".OgggggggggggggO",".OGGGGGGGGGGGGGO",".OOOOOOOOOOOOOOO","................","................","................"],
   skull:["................",".....OOOOOO.....","....OWWWWWWO....","...OWWWWWWWWO...","...OWWWWWWWWO...","...OWOOWWOOWO...","...OWOOWWOOWO...","...OWWWWWWWWO...","...OWWWOOWWWO...","....OWWWWWWO....","....OWOWWOWO....","....OWOWWOWO....",".....OOOOOO.....","................","................","................"],
   pumpkin:["................",".......OLO......",".......OLO......","....OOOOLOOOO...","...OAAAOAOAAAO..","..OAAAAAAAAAAAO.","..OAAOOAAAOOAAO.","..OAAOXAAAXOAAO.","..OAAAAAAAAAAAO.","..OAAAAAOAAAAAO.","..OAAOOOOOOOAAO.","..OAAAOXXXOAAAO.","...OAAAOOOAAAO..","....OOOOOOOOO...","................","................"],
   coin:["................",".....OOOOOO.....","....OGGGGGGO....","...OGGGGGGGGO...","..OGGGGggGGGGO..","..OGGGgGGgGGGO..","..OGGGgGGGGGGO..","..OGGGGggGGGGO..","..OGGGGGGgGGGO..","..OGGGgGGgGGGO..","..OGGGGggGGGGO..","...OGGGGGGGGO...","....OGGGGGGO....",".....OOOOOO.....","................","................"]};
  const rows=sym=>sym==='sword'?window.MuseumPixel.icons.sword:art[sym];
  let currency='coins',spinning=false,offsets=[0,0,0],anim=0;
  const amountEl=()=>$('slAmount');
  const stake=()=>currency==='pln'?Math.round(Number(amountEl().value)*100):Math.floor(Number(amountEl().value)||0);
  const fmt=(amount,cur)=>cur==='pln'?pln(amount):`${number.format(amount)} ✦`;
  const reels=()=>[...document.querySelectorAll('.slots-reel')];
  function drawReel(c,offset){const x=c.getContext('2d');const strip=S().REEL,n=strip.length;x.setTransform(1,0,0,1,0,0);x.imageSmoothingEnabled=false;x.fillStyle='#0d120c';x.fillRect(0,0,c.width,c.height);x.setTransform(SCALE,0,0,SCALE,0,0);
   const first=Math.floor(offset/CELL)-1;for(let i=first;i<first+VIEW+2;i++){const idx=((i%n)+n)%n;window.MuseumPixel.blit(x,rows(strip[idx]),0,Math.round(i*CELL-offset),pal);}
   x.setTransform(1,0,0,1,0,0);const g=x.createLinearGradient(0,0,0,c.height);g.addColorStop(0,'rgba(13,18,12,.85)');g.addColorStop(.3,'rgba(13,18,12,0)');g.addColorStop(.7,'rgba(13,18,12,0)');g.addColorStop(1,'rgba(13,18,12,.85)');x.fillStyle=g;x.fillRect(0,0,c.width,c.height);}
  function drawAll(){reels().forEach((c,i)=>drawReel(c,offsets[i]));}
  function paytable(){const host=$('slPaytable');if(host.childElementCount)return;const line=(syms,mult,note)=>{const row=document.createElement('div');row.className='slots-pay';const icons=document.createElement('span');icons.className='slots-pay-icons';for(const s of syms){const cv=document.createElement('canvas');cv.width=cv.height=32;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.setTransform(2,0,0,2,0,0);window.MuseumPixel.blit(x,rows(s),0,0,pal);icons.append(cv);}
    const m=document.createElement('strong');m.textContent=`×${mult}`;const t=document.createElement('small');t.textContent=note;row.append(icons,m,t);host.append(row);};
   for(const s of S().SYMBOLS)line([s,s,s],S().TRIPLE[s],`3 × ${S().NAMES[s]}`);line(['kufel','kufel'],S().KUFEL[2],'2 kufle gdziekolwiek');line(['kufel'],S().KUFEL[1],'1 kufel gdziekolwiek');
   const rtp=$('slRtp');if(rtp)rtp.textContent=String(Math.round(S().rtp()*100));}
  function render(){const p=profile(),st=S().stats(p);$('slCoins').textContent=`${number.format(p.coins)} ✦`;$('slPLN').textContent=pln(p.balance);$('shopBalance').textContent=`${number.format(p.coins)} ✦`;$('shopBalancePLN').textContent=pln(p.balance);
   $('slNet').textContent=`${st.coinsNet>=0?'+':''}${number.format(st.coinsNet)} ✦ · ${st.plnNet>=0?'+':''}${pln(st.plnNet)}`;
   for(const b of document.querySelectorAll('#shopViewSlots .roulette-currency button'))b.setAttribute('aria-pressed',String(b.dataset.currency===currency));
   $('slAmountLabel').textContent=currency==='pln'?'STAWKA (ZŁ)':'STAWKA (✦)';const quick=document.querySelectorAll('#shopViewSlots .roulette-quick button');quick[0].textContent=currency==='pln'?'+5':'+100';quick[1].textContent=currency==='pln'?'+20':'+500';
   $('slSpin').disabled=spinning||!callbacks.canOpen();paytable();drawAll();}
  function setAmount(v){const el=amountEl();el.value=String(currency==='pln'?Math.max(1,Math.round(v)):Math.max(10,Math.floor(v)));}
  function quick(kind){const p=profile(),cur=stake(),cap=currency==='pln'?p.balance:p.coins,unit=currency==='pln'?100:1;
   const next=kind==='a'?cur+(currency==='pln'?500:100):kind==='b'?cur+(currency==='pln'?2000:500):kind==='x2'?cur*2:kind==='half'?Math.floor(cur/2):cap;setAmount(Math.min(cap,Math.max(S().MIN[currency],next))/unit);}
  function pull(){if(spinning)return;const p=profile(),check=S().canBet(p,{amount:stake(),currency});
   if(!callbacks.canOpen()){callbacks.notify('Automaty są dostępne przed następnym pojedynkiem.');return;}
   if(!check.ok){const why={min:`Minimalna stawka to ${fmt(S().MIN[currency],currency)}.`,funds:currency==='pln'?'Za mało na saldzie.':'Za mało żetonów.',pending:'Poprzednia wygrana jeszcze się księguje.'}[check.reason]||'Niepoprawny zakład.';$('slResult').textContent=why;callbacks.notify(why);return;}
   const r=callbacks.onSlots({amount:check.amount,currency});if(!r)return;
   spinning=true;render();$('slResult').textContent=`Postawione ${fmt(r.amount,r.currency)}. Bębny się kręcą…`;
   const n=S().REEL.length,starts=offsets.slice(),t0=performance.now(),durations=[1300,1900,2500],centre=CELL;   // the middle row sits one cell down
   const targets=r.stops.map((stop,i)=>{const base=Math.ceil((starts[i]+centre)/(n*CELL))*n*CELL;return base+(3+i)*n*CELL+stop*CELL-centre;});
   cancelAnimationFrame(anim);
   const step=now=>{let done=true;for(let i=0;i<3;i++){const k=Math.min(1,(now-t0)/durations[i]),e=1-Math.pow(1-k,3);offsets[i]=starts[i]+(targets[i]-starts[i])*e;if(k<1)done=false;}drawAll();if(!done){anim=requestAnimationFrame(step);return;}
    spinning=false;callbacks.onSlotsSettle();
    const names=r.symbols.map(s=>S().NAMES[s]).join(' · ');
    $('slResult').textContent=r.win?`${names}. ${r.rule==='triple'?'TRÓJKA!':r.count===2?'DWA KUFLE!':'Kufel.'} Wygrywasz ${fmt(r.payout,r.currency)} (×${r.multiplier}).`:`${names}. Nic z tego, przepadło ${fmt(r.amount,r.currency)}.`;
    render();};
   anim=requestAnimationFrame(step);}
  function mount(){for(const b of document.querySelectorAll('#shopViewSlots .roulette-currency button'))b.addEventListener('click',()=>{if(spinning)return;currency=b.dataset.currency;setAmount(currency==='pln'?5:100);render();});
   for(const b of document.querySelectorAll('#shopViewSlots .roulette-quick button'))b.addEventListener('click',()=>{if(!spinning)quick(b.dataset.quick);});
   $('slSpin')?.addEventListener('click',pull);amountEl()?.addEventListener('change',()=>setAmount(Number(amountEl().value)||0));}
  return {mount,render};
 })();
 window.MuseumShop=Object.freeze({mount,render,showView});
})();
