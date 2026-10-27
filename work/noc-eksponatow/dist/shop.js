/* Store. Crates open for earned tokens or from the PLN balance (demo balance topped up by a moderator). */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const loot=window.MuseumLoot;
 const currency=new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'});
 const number=new Intl.NumberFormat('pl-PL');
 const percent=value=>`${new Intl.NumberFormat('pl-PL',{maximumFractionDigits:2}).format(value)}%`;
 let selectedId='gallery',familyFilter='all',mounted=false;
 let callbacks={getProfile:()=>({coins:0,owned:[],freeCrates:0}),canOpen:()=>false,onOpenWithTokens:()=>{},onBuyFinish:()=>{},onOpenWithPLN:()=>{},notify:()=>{}};
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
  button.setAttribute('aria-label',`${crate.name}. ${crate.guarantee}. ${number.format(crate.cost)} żetonów lub planowo ${currency.format(crate.pricePLN)}.`);
  const art=node('span','shop-tile-art');const canvas=document.createElement('canvas');canvas.width=142;canvas.height=120;art.append(canvas);drawCrateInto(canvas,crate,1.3);
  const body=node('span','shop-tile-body');
  body.append(node('small','shop-tile-tag',`${String(index+1).padStart(2,'0')} · ${crate.season?`${crate.tag} · ${loot.seasonLabel(crate.season)}`:(typeName||category?.name||crate.tag||'KOLEKCJA')}`),node('strong','shop-tile-name',crate.name),node('span','shop-tile-cost',`${number.format(crate.cost)} ✦`),node('span','shop-tile-pln',currency.format(crate.pricePLN)));
  body.append(node('span','shop-tile-progress',!available?'ZEBRANA ✓':isFree(crate,current)?'PREZENT NA START':`${have} / ${total} ${what}`));
  if(crate.id==='treasury')button.append(node('span','shop-tile-badge','HIT'));
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
  $('shopSelectedPrice').textContent=currency.format(selected.pricePLN);
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
  const free=isFree(selected,current),cost=free?0:selected.cost;
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
  for(const [id,name] of [['shopTabCrates','crates'],['shopTabFinishes','finishes'],['shopTabWallet','wallet']])$(id).setAttribute('aria-selected',String(view===name));
  for(const [id,name] of [['shopViewCrates','crates'],['shopViewFinishes','finishes'],['shopViewWallet','wallet']])$(id).classList.toggle('hidden',view!==name);
 }
 function mount(options={}){
  for(const key of Object.keys(callbacks))if(typeof options[key]==='function')callbacks[key]=options[key];
  if(!mounted){
   for(const [id,filter] of filters)$(id).addEventListener('click',()=>{if(!callbacks.canOpen()){callbacks.notify('Sklep jest dostępny przed następnym pojedynkiem.');return;}familyFilter=filter;render();});
   for(const [id,name] of [['shopTabCrates','crates'],['shopTabFinishes','finishes'],['shopTabWallet','wallet']])$(id).addEventListener('click',()=>showView(name));
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
 window.MuseumShop=Object.freeze({mount,render,showView});
})();
