/* Store preview. PLN prices are a catalogue only; earned tokens open crates in the collection. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const loot=window.MuseumLoot;
 const currency=new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'});
 const number=new Intl.NumberFormat('pl-PL');
 const percent=value=>`${new Intl.NumberFormat('pl-PL',{maximumFractionDigits:2}).format(value)}%`;
 let selectedId='gallery',familyFilter='all',mounted=false;
 let callbacks={getProfile:()=>({coins:0,owned:[],freeCrates:0}),canOpen:()=>false,onOpenWithTokens:()=>{},onDeposit:()=>{},onBuyFinish:()=>{},notify:()=>{}};
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
 function validCrate(id){return loot.crates.find(crate=>crate.id===id);}
 function matchesFamily(crate){return familyFilter==='all'||crate.family===familyFilter;}
 function scrollToSummary(){let reduced=false;try{reduced=!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}catch(_){}$('shopSummary').scrollIntoView({behavior:reduced?'instant':'smooth',block:'nearest'});}
 function render(crateId){
  const requested=validCrate(crateId);
  if(requested){selectedId=requested.id;if(!matchesFamily(requested))familyFilter='all';}
  const visible=loot.crates.filter(matchesFamily);
  if(!visible.some(crate=>crate.id===selectedId))selectedId=visible[0]?.id||loot.crates[0]?.id;
  const selected=validCrate(selectedId)||loot.crates[0];
  if(!selected||!$('shopOffers'))return;
  selectedId=selected.id;
  const current=profile(),coins=Math.max(0,Number(current.coins)||0);
  const focused=document.activeElement?.closest?.('.shop-product')?.dataset.crateId;
  const products=visible.map(crate=>{
   const index=loot.crates.indexOf(crate),category=loot.getCategory(crate.categoryId),typeName=crate.weaponType?window.MuseumWeapons.types[crate.weaponType].name:null;
   const available=loot.remaining(current,crate.id).length>0;
   const button=node('button',`shop-product${crate.id===selectedId?' is-selected':''}`);
   button.type='button';button.dataset.crateId=crate.id;button.style.setProperty('--crate-color',crate.color);
   if(crate.id==='treasury'){button.classList.add('is-best-offer');button.append(node('span','shop-best-offer','NAJLEPSZA OFERTA'));}
   button.setAttribute('aria-pressed',String(crate.id===selectedId));
   button.setAttribute('aria-label',`${crate.name}. ${crate.guarantee}. Planowana cena ${currency.format(crate.pricePLN)}. Wybierz szczegóły.`);
   const heading=node('span','shop-product-head');heading.append(node('span','shop-product-number',String(index+1).padStart(2,'0')),node('small','shop-product-tag',typeName||category?.name||crate.tag||crate.title||'MUZEALNA KOLEKCJA'));
   const art=node('span','shop-product-art');const canvas=document.createElement('canvas');canvas.width=284;canvas.height=240;art.append(canvas);const ctx=canvas.getContext('2d');if(ctx&&window.MuseumArt?.drawCrate){const pix=window.MuseumArt.pixelFactor&&window.MuseumPixel?window.MuseumPixel:null;if(pix){canvas.style.imageRendering='pixelated';pix.drawCrate(ctx,crate,canvas.width,canvas.height);}else window.MuseumArt.drawCrate(ctx,crate,canvas.width,canvas.height,{time:1.3});}
   const price=node('span','shop-product-price');price.append(node('strong','',currency.format(crate.pricePLN)),node('small','shop-product-planned','PLANOWANA CENA'));
   button.append(heading,art,node('h3','',crate.name),node('p','shop-product-guarantee',crate.guarantee));
   if(category&&crate.pool==='skin'){const pool=loot.items.filter(item=>item.kind===crate.pool&&item.categoryId===category.id&&item.weight>0),owned=pool.filter(item=>loot.has(current,item)).length;button.append(node('span','shop-product-progress',`${owned} / ${pool.length} STROJÓW W KATEGORII`));}
   else if(crate.id==='collector'){const pool=loot.items.filter(item=>item.kind==='finish'&&item.rarity==='mythic'),owned=pool.filter(item=>loot.has(current,item)).length;button.append(node('span','shop-product-progress',`${owned} / ${pool.length} WYKOŃCZEŃ MITYCZNYCH`));}
   else if(crate.pool==='finish'){const pool=loot.remaining(current,crate.id),all=loot.items.filter(item=>item.kind==='finish'&&crate.rarityWeights[item.rarity]>0);button.append(node('span','shop-product-progress',`${all.length-pool.length} / ${all.length} WYKOŃCZEŃ`));}
   else if(crate.pool==='weapon'&&(crate.weaponType||category)){const pool=loot.items.filter(item=>item.kind==='weapon'&&item.weight>0&&(!crate.weaponType||item.type===crate.weaponType)&&(!category||item.categoryId===category.id)),owned=pool.filter(item=>loot.has(current,item)).length;button.append(node('span','shop-product-progress',`${owned} / ${pool.length} BRONI W PULI`));}
   else if(crate.pool!=='skin'){const pool=loot.items.filter(item=>(crate.pool==='any'||item.kind===crate.pool)&&item.weight>0&&crate.rarityWeights[item.rarity]>0),owned=pool.filter(item=>loot.has(current,item)).length;button.append(node('span','shop-product-progress',`${owned} / ${pool.length} ${crate.pool==='weapon'?'BRONI':crate.pool==='card'?'KART':'PRZEDMIOTÓW'} W PULI`));}
   else button.append(node('span','shop-product-progress','WSZYSTKIE KATEGORIE STROJÓW'));
   button.append(price,node('span','shop-product-tokens',`LUB ${number.format(crate.cost)} ✦ Z GRY`),node('span','shop-inspect',crate.id===selectedId?'● WYBRANA SKRZYNIA':'ZOBACZ ZAWARTOŚĆ ↗'));
   if(!available)button.append(node('span','shop-product-state','ZAWARTOŚĆ ZEBRANA'));
   else if(isFree(crate,current))button.append(node('span','shop-product-state','PREZENT NA START'));
   button.addEventListener('click',()=>{
    if(!callbacks.canOpen()){callbacks.notify('Sklep jest dostępny przed następnym pojedynkiem.');return;}
    render(crate.id);scrollToSummary();
   });
   return button;
  });
  $('shopOffers').replaceChildren(...products);
  renderFinishes(current);
  if(focused)products.find(product=>product.dataset.crateId===focused)?.focus({preventScroll:true});
  for(const [id,filter]of [['shopFilterAll','all'],['shopFilterClassic','classic'],['shopFilterThemed','themed'],['shopFilterWeapons','weapons'],['shopFilterCards','cards'],['shopFilterMixed','mixed'],['shopFilterFinishes','finishes']])$(id).setAttribute('aria-pressed',String(familyFilter===filter));
  $('shopOffersCount').textContent=`${products.length} / ${loot.crates.length} SKRZYŃ`;
  $('shopBalance').textContent=`${number.format(coins)} ✦`;
  $('shopSelectedName').textContent=selected.name;
  $('shopSelectedPrice').textContent=currency.format(selected.pricePLN);
  $('shopSelectedGuarantee').textContent=`${selected.guarantee}. Bez duplikatów.`;
  const category=loot.getCategory(selected.categoryId);
  $('shopSelectedCategory').textContent=selected.pool==='any'?'MIESZANA · STROJE, BROŃ I KARTY':category?`${category.name} · SKRZYNIA ${selected.pool==='card'?'KART':'TEMATYCZNA'}`:selected.pool==='weapon'?'BROŃ · ARSENAŁ':selected.pool==='card'?'KARTY BOHATERÓW I BRONI':'WSZYSTKIE KATEGORIE · SKRZYNIA KLASYCZNA';
  $('shopSummary').style.setProperty('--crate-color',selected.color);
  const available=loot.remaining(current,selected.id).length>0,odds=loot.odds(current,selected.id);
  const tiers=['common','rare','epic','legendary',...(odds.mythic>0?['mythic']:[])];
  $('shopSelectedOdds').replaceChildren(...tiers.map(tier=>node('span','shop-odd',`${loot.rarities[tier].name} ${percent(odds[tier]||0)}`)));
  const entries=loot.entries(current,selected.id);
  $('shopContentsSummary').textContent=entries.length?`MOŻLIWE ODKRYCIA: ${entries.length} · SZANSA KAŻDEGO PRZEDMIOTU`:'ZAWARTOŚĆ ZEBRANA · 0 NOWYCH PRZEDMIOTÓW';
  $('shopContentsList').replaceChildren(...entries.map(({item,chance})=>{const row=node('li','drop-row');row.style.setProperty('--rarity',loot.rarities[item.rarity].color);row.append(node('span','',item.name),node('small','',loot.rarities[item.rarity].name),node('strong','',percent(chance)));return row;}));
  const free=isFree(selected,current),cost=free?0:selected.cost;
  const tokenButton=$('shopTokenBtn');
  tokenButton.disabled=!available||!!current.pendingReward||!callbacks.canOpen();
  tokenButton.textContent=!available?'ZAWARTOŚĆ ZEBRANA ✓':current.pendingReward?'ODBIERZ POPRZEDNIĄ NAGRODĘ':free?'WYBIERZ DARMOWĄ SKRZYNIĘ':coins<cost?`ZOBACZ ZA ${number.format(cost)} ✦`:`WYBIERZ ZA ${number.format(cost)} ✦`;
  const paymentButton=$('shopPaymentBtn');paymentButton.disabled=true;paymentButton.textContent='PŁATNOŚCI WKRÓTCE';
  $('shopTokenHint').textContent=!available?'Masz już wszystko, co może wypaść z tej skrzyni.':current.pendingReward?'Odbierz zapisaną nagrodę w kolekcji, aby otworzyć następną skrzynię.':free?'Masz 1 darmową skrzynię Galerii na start. Otworzysz ją w kolekcji.':coins<cost?`Masz ${number.format(coins)} / ${number.format(cost)} żetonów. Do zdobycia ${number.format(cost-coins)}. Żetony zdobywasz w walkach.`:`Masz ${number.format(coins)} / ${number.format(cost)} żetonów. Potwierdzisz otwarcie w kolekcji.`;
 }
 // Direct sale of the eight limited finishes: planned PLN price each, payments not live yet; owned ones are marked.
 const plain=new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',maximumFractionDigits:0});
 function renderFinishes(current){
  const root=$('shopFinishes');if(!root||!window.MuseumFinishes)return;
  const list=loot.items.filter(item=>item.kind==='finish'&&item.rarity==='mythic');
  const cards=list.map((item,index)=>{
   const owned=loot.has(current,item),equipped=current.finish===item.id,card=node('article',`shop-product shop-finish${owned?' is-owned':''}`);
   card.style.setProperty('--crate-color',item.colors?.steel||'#7ff0e0');
   const heading=node('span','shop-product-head');heading.append(node('span','shop-product-number',String(index+1).padStart(2,'0')),node('small','shop-product-tag','MITYCZNE'));
   const art=node('span','shop-product-art');const canvas=document.createElement('canvas');canvas.width=canvas.height=96;art.append(canvas);
   const ctx=canvas.getContext('2d');if(ctx){const pix=window.MuseumPixel,weapon=window.MuseumWeapons.get(current.weapon)||window.MuseumWeapons.get('sword');if(pix){ctx.imageSmoothingEnabled=false;ctx.fillStyle='#10180e';ctx.fillRect(0,0,96,96);pix.drawWeaponIcon(ctx,weapon,16,16,4,{finish:item.id,time:1});}}
   card.append(heading,art,node('h3','',item.name),node('p','shop-product-guarantee',item.description||''));
   const price=node('span','shop-finish-price');price.append(node('strong','',plain.format(item.pricePLN||0)),node('small','',owned?'CENA KATALOGOWA':'CENA · PŁATNE Z SALDA'));card.append(price);
   if(owned)card.append(node('span','shop-finish-state',equipped?'● NAŁOŻONE NA TWOJĄ BROŃ':'✓ MASZ W KOLEKCJI'));
   else{const cost=loot.pricePLN(item),missing=cost-(Number(current.balance)||0),buy=node('button','primary-btn shop-finish-buy',`KUP ZA ${pln(cost)}`);buy.type='button';buy.disabled=missing>0;buy.addEventListener('click',()=>{if(!callbacks.canOpen()){callbacks.notify('Sklep jest dostępny przed następnym pojedynkiem.');return;}callbacks.onBuyFinish(item.id);});card.append(buy);if(missing>0)card.append(node('span','shop-finish-missing',`BRAKUJE ${pln(missing)} · WPŁAĆ WYŻEJ`));}
   return card;
  });
  root.replaceChildren(...cards);
  $('shopBalancePLN').textContent=pln(current.balance);
  const owned=list.filter(item=>loot.has(current,item)).length;$('shopFinishesCount').textContent=`${owned} / ${list.length} W KOLEKCJI · OD ${plain.format(Math.min(...list.map(i=>i.pricePLN)))} DO ${plain.format(Math.max(...list.map(i=>i.pricePLN)))}`;
 }
 function mount(options={}){
  for(const key of Object.keys(callbacks))if(typeof options[key]==='function')callbacks[key]=options[key];
  if(!mounted){
   for(const [id,filter]of [['shopFilterAll','all'],['shopFilterClassic','classic'],['shopFilterThemed','themed'],['shopFilterWeapons','weapons'],['shopFilterCards','cards'],['shopFilterMixed','mixed'],['shopFilterFinishes','finishes']])$(id).addEventListener('click',()=>{if(!callbacks.canOpen()){callbacks.notify('Sklep jest dostępny przed następnym pojedynkiem.');return;}familyFilter=filter;render();});
   for(const b of document.querySelectorAll('.shop-deposit-btn'))b.addEventListener('click',()=>{if(!callbacks.canOpen())return;callbacks.onDeposit(Number(b.dataset.amount)||0);});
   $('shopDepositBtn')?.addEventListener('click',()=>{if(!callbacks.canOpen())return;const zl=Number($('shopDepositInput').value);if(!(zl>0&&zl<=100000)){callbacks.notify('Podaj kwotę od 1 do 100 000 zł.');return;}$('shopDepositInput').value='';callbacks.onDeposit(Math.round(zl*100));});
   $('shopTokenBtn')?.addEventListener('click',()=>{
    const selected=validCrate(selectedId),current=profile();
    if(!selected||!callbacks.canOpen()||current.pendingReward||!loot.remaining(current,selected.id).length)return;
    callbacks.onOpenWithTokens(selected.id);
   });
   mounted=true;
  }
  render();
 }
 window.MuseumShop=Object.freeze({mount,render});
})();
