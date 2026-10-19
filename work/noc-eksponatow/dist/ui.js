/* Museum after hours — menu, unskippable prologue, collection and dream epilogue. */
(() => {
 'use strict';
 const $ = id => document.getElementById(id);
 const show = (id, visible = true) => $(id).classList.toggle('hidden', !visible);
 const loot=window.MuseumLoot, skins=loot.skins, perks=window.MuseumPerks, levels=window.MuseumLevels, exhibits=window.MuseumExhibits;
 let profile=loot.migrate(null);
 try { profile=loot.migrate(JSON.parse(localStorage.getItem('museum-night-v1')||'null')); } catch(_){}
 let selectedCrateId=profile.pendingCrateId||'gallery';
 let screen='menu', introTime=0, endingTime=0, endData=null, frameTime=0, toastTimer, helpWasPlaying=false, lastFocus, lootReturnFocus, crateBusy=false, rollToken=0;
 const totalIntro=18, totalCard=2.6, totalJump=4.2;
 // One night = one run through the patrol. It starts at the chosen level and ends on a loss or after the last hall.
 let night=null, cardTime=0, jumpTime=0, jumpFrom=null, jumpTo=null;
 function currentLevel(){const chosen=profile.level&&levels.get(profile.level);if(chosen&&isUnlocked(chosen))return chosen;return firstOpenLevel();}
 function isUnlocked(level){const index=levels.indexOf(level.id);return index===0||profile.cleared.includes(levels.at(index-1).id);}
 function firstOpenLevel(){return levels.all().find(l=>!profile.cleared.includes(l.id))||levels.all().at(-1);}
 function yearText(year){if(Math.abs(year)>=1e6)return `${(Math.abs(year)/1e6).toLocaleString('pl-PL',{maximumFractionDigits:1})} MLN LAT TEMU`;if(year<0)return `${Math.abs(year).toLocaleString('pl-PL')} P.N.E.`;return String(year);}
 function levelExhibit(level){return exhibits.get(level.exhibit);}
 const SKINS_PER_PAGE=12;let collectionPage=0;
 const collectionFilters={search:'',category:'all',rarity:'all',ownership:'all',newOnly:false};
 const outfitCount=n=>`${n} ${n===1?'strój':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'stroje':'strojów'}`;
 const normalizeSkinText=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/gi,'l').toLocaleLowerCase('pl-PL').trim();
 function matchingSkins(){const query=normalizeSkinText(collectionFilters.search);return skins.filter(s=>{const owned=profile.owned.includes(s.id);return (!collectionFilters.newOnly||/^knight-\d{2}$/.test(s.id))&&(collectionFilters.category==='all'||s.categoryId===collectionFilters.category)&&(collectionFilters.rarity==='all'||s.rarity===collectionFilters.rarity)&&(collectionFilters.ownership==='all'||(collectionFilters.ownership==='owned'?owned:!owned))&&(!query||normalizeSkinText([s.name,s.description||'',s.motif||'',loot.getCategory(s.categoryId)?.name||'',perks.get(s.id).title,perks.get(s.id).summary].join(' ')).includes(query));});}
 function perkText(perk){return `${perk.title}: ${perk.summary}`;}
 function updateLoadout(){const skin=skins.find(s=>s.id===profile.skin),text=`${skin.name} — ${perkText(perks.get(skin.id))}`;if($('loadoutPerk').textContent!==text)$('loadoutPerk').textContent=text;}
 function updateActivePerk(perk){const target=$('activePerk');if(target.dataset.perk===perk.id)return;const title=document.createElement('strong'),summary=document.createElement('span');title.textContent=perk.title;summary.textContent=perk.summary;target.replaceChildren(title,summary);target.dataset.perk=perk.id;target.setAttribute('aria-label',perkText(perk));}
 function persist(){try{localStorage.setItem('museum-night-v1',JSON.stringify(profile));}catch(_){} $('coins').textContent=profile.coins;updateLoadout();}
 function soundUI(){ $('soundBtn').classList.toggle('sound-on',profile.sound);$('soundBtn').setAttribute('aria-label',profile.sound?'Wyłącz dźwięk':'Włącz dźwięk');window.MuseumGame?.setSound(profile.sound); }
 function toast(text){$('toast').textContent=text;show('toast');clearTimeout(toastTimer);toastTimer=setTimeout(()=>show('toast',false),3200);}
 function stageState(){const fighting=screen==='fight'||screen==='paused';$('gameFrame').classList.toggle('fighting',fighting);$('touchControls').classList.toggle('enabled',fighting);for(const id of ['collectionTab','shopTab'])$(id).setAttribute('aria-disabled',String(!['menu','result'].includes(screen)));$('secretCoinsBtn').disabled=!['menu','result'].includes(screen);}
 function renderLevelStrip(){
  const strip=$('levelStrip');strip.replaceChildren();const chosen=currentLevel();
  for(const level of levels.all()){const b=document.createElement('button');const cleared=profile.cleared.includes(level.id),open=isUnlocked(level);b.type='button';b.className=`level-pip ${cleared?'cleared':''} ${level.id===chosen.id?'chosen':''} ${open?'':'locked'}`;b.disabled=!open;b.innerHTML=`<span>${String(level.number).padStart(2,'0')}</span><strong>${level.title}</strong><small>${cleared?'✓ POKONANY':open?level.yearLabel:'◇ ZAMKNIĘTE'}</small>`;b.setAttribute('aria-label',`Poziom ${level.number}: ${level.title}, ${levelExhibit(level).name}${cleared?', pokonany':open?'':', zamknięty'}`);b.setAttribute('aria-pressed',String(level.id===chosen.id));
   b.addEventListener('click',()=>{if(screen!=='menu'||!open)return;profile.level=level.id;persist();renderMenuLevel();});strip.append(b);}
 }
 function renderMenuLevel(){
  const level=currentLevel(),exhibit=levelExhibit(level);
  $('heroTagline').innerHTML=level.tagline;$('exhibitTagName').textContent=exhibit.name;$('exhibitTagInfo').textContent=exhibit.tag;
  $('stageHall').textContent=level.hall;$('stageYear').innerHTML=`${level.yearLabel} <span class="meta-live">●</span>`;
  $('heroLevel').textContent=`POZIOM ${String(level.number).padStart(2,'0')} / ${String(levels.count).padStart(2,'0')} · ${level.title}`;
  $('introNote').innerHTML=levels.indexOf(level.id)===0?'<span>◷</span> Najpierw historia. 18 sekund. Bez pomijania.':`<span>◷</span> Noc zaczyna się od sali ${level.number}. Pokonane sale zostają zaliczone.`;
  renderLevelStrip();
 }
 function menu(){screen='menu';night=null;window.MuseumGame?.reset();window.MuseumGame?.setScene('external');['hud','combatHint','intro','card','timejump','ending','pause','results'].forEach(id=>show(id,false));show('menu');show('exhibitTag');show('stageMeta');$('topStatus').innerHTML='ZAMKNIĘTE DLA ZWIEDZAJĄCYCH <span class="muted">/</span> OTWARTE NA POJEDYNKI';renderMenuLevel();stageState();$('startBtn').focus({preventScroll:true});}
 function beginNight(){
  if(crateBusy||!$('loot').classList.contains('hidden')||!['menu','result'].includes(screen))return;closeModal();
  const level=screen==='result'&&night?levels.get(night.levelId):currentLevel();
  night={levelId:level.id,coins:0,wins:0,parries:0,time:0};profile.level=level.id;persist();
  window.MuseumGame?.reset();window.MuseumGame?.setScene('external');['menu','exhibitTag','hud','combatHint','ending','pause','results','stageMeta','timejump','card'].forEach(id=>show(id,false));stageState();$('startBtn').blur();
  if(levels.indexOf(level.id)===0&&level.prologue.length){screen='intro';introTime=0;show('intro');$('topStatus').textContent='PROLOG / OSTATNI OBCHÓD';updateIntro();}
  else showCard(level);
 }
 function showCard(level){screen='card';cardTime=0;const exhibit=levelExhibit(level);show('card');$('cardLevel').textContent=`SALA ${String(level.number).padStart(2,'0')} / ${String(levels.count).padStart(2,'0')}`;$('cardLabel').textContent=`${level.yearLabel} / ${level.hall}`;$('cardText').textContent=level.card;$('cardFoe').textContent=exhibit.name;$('topStatus').textContent=`${level.title} / ${level.yearLabel}`;$('cardProgress').style.width='0%';}
 function updateIntro(){const level=levels.get(night.levelId),chapters=level.prologue,per=totalIntro/chapters.length,i=Math.min(chapters.length-1,Math.floor(introTime/per));const c=chapters[i];$('sceneLabel').textContent=c.label;$('sceneText').textContent=c.text;$('introChapter').textContent=`PROLOG / 0${i+1}`;$('introRemaining').textContent=Math.ceil(totalIntro-introTime);$('introProgress').style.width=(introTime/totalIntro*100)+'%';}
 function startFight(){
  if(!(screen==='intro'&&introTime>=totalIntro)&&!(screen==='card'&&cardTime>=totalCard)&&!(screen==='timejump'&&jumpTime>=totalJump))return;
  const level=levels.get(night.levelId),exhibit=levelExhibit(level);
  screen='fight';['intro','card','timejump'].forEach(id=>show(id,false));show('hud');show('combatHint');show('stageMeta');
  $('playerName').textContent=profile.skin==='stachu-jones'?'STACHU JONES':'ŻELAZNY RYCERZ';$('foeName').textContent=exhibit.name;
  $('stageHall').textContent=level.hall;$('stageYear').innerHTML=`${level.yearLabel} <span class="meta-live">●</span>`;
  $('topStatus').textContent=`SALA ${String(level.number).padStart(2,'0')} / RYCERZ KONTRA ${exhibit.alias.toLocaleUpperCase('pl-PL')}`;stageState();
  window.MuseumGame.start({skin:profile.skin,exhibit:exhibit.id,weapon:profile.weapon||'sword',theme:level.theme,sound:profile.sound});
 }
 function pause(){if(screen!=='fight')return;screen='paused';window.MuseumGame.pause();show('pause');stageState();}
 function resume(){if(screen!=='paused')return;screen='fight';show('pause',false);window.MuseumGame.resume();stageState();}
 function formatTime(n){return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}`;}
 window.addEventListener('game:update',e=>{const s=e.detail;if(!['fight','paused'].includes(screen))return;const maxP=s.player?.maxHP||120,maxR=s.exhibit?.maxHP||s.foe?.maxHP||160;$('playerHealth').style.width=Math.max(0,s.playerHP/maxP*100)+'%';$('foeHealth').style.width=Math.max(0,s.foeHP/maxR*100)+'%';$('playerHP').textContent=`${Math.ceil(s.playerHP)} / ${maxP}`;$('foeHP').textContent=`${Math.ceil(s.foeHP)} / ${maxR}`;$('staminaNum').textContent=Math.floor(s.stamina);$('staminaBar').style.width=s.stamina+'%';$('fightTime').textContent=formatTime(s.time||s.elapsed||0);$('hintText').textContent=s.hint||'Wyczuj moment. Paruj tuż przed ciosem.';if(s.perk)updateActivePerk(s.perk);const names={idle:'OBSERWUJE',approach:'PODCHODZI',retreat:'ODSTĘPUJE',reposition:'ŁAPIE DYSTANS',windup:'SZYKUJE ATAK',strike:'ATAKUJE',recover:'OSŁABIONA GARDA'};$('foeState').textContent=names[s.foeState]||s.exhibit?.name||'ŻYWY EKSPONAT';});
 window.addEventListener('game:end',e=>{
  if(screen!=='fight')return;endData=e.detail;screen='ko';endingTime=0;show('combatHint',false);
  const level=levels.get(night.levelId),exhibit=levelExhibit(level),beaten=exhibit.alias.toLocaleUpperCase('pl-PL');
  const reward=endData.win?level.reward+(endData.parries||0)*20:40;
  profile.coins+=reward;night.coins+=reward;night.parries+=endData.parries||0;night.time+=endData.time||0;
  if(endData.win){night.wins++;if(!profile.cleared.includes(level.id))profile.cleared.push(level.id);const next=levels.next(level.id);profile.level=next?next.id:level.id;}
  persist();
  $('outcomeLabel').textContent=endData.win?`${beaten} POKONANY / SALA ${String(level.number).padStart(2,'0')} ZALICZONA`:'RYCERZ POKONANY / KONIEC GRY';
  $('topStatus').textContent=endData.win?`ZWYCIĘSTWO / ${level.hall} OCALONA`:'KONIEC GRY / OSTATNIE ŚWIATŁO GAŚNIE';stageState();
 });
 function startTimeJump(from,to){screen='timejump';jumpTime=0;jumpFrom=from;jumpTo=to;night.levelId=to.id;show('hud',false);show('stageMeta',false);show('timejump');$('jumpLevel').textContent=`SALA ${String(to.number).padStart(2,'0')} / ${String(levels.count).padStart(2,'0')}`;$('jumpFrom').textContent=from.yearLabel;$('jumpTo').textContent=`→ ${to.yearLabel}`;$('jumpYear').textContent=from.yearLabel;$('jumpLabel').textContent=`${to.title} / ${to.hall}`;$('jumpText').textContent=to.card;$('jumpFoe').textContent=levelExhibit(to).name;$('jumpProgress').style.width='0%';$('topStatus').textContent=`PRZESKOK W CZASIE / ${to.yearLabel}`;stageState();}
 function updateTimeJump(){const k=Math.min(1,jumpTime/(totalJump*.72)),eased=1-Math.pow(1-k,3);const year=Math.round(jumpFrom.year+(jumpTo.year-jumpFrom.year)*eased);$('jumpYear').textContent=k>=1?jumpTo.yearLabel:yearText(year);$('jumpProgress').style.width=(jumpTime/totalJump*100)+'%';$('timejump').classList.toggle('arrived',k>=1);}
 function startEnding(){screen='ending';window.MuseumGame?.setScene('external');show('hud',false);show('stageMeta',false);show('ending');show('results',false);const won=endData?.win&&!levels.next(night.levelId);$('dreamTitle').textContent=won?'ŚWIT. MUZEUM OCALONE.':'TO BYŁ TYLKO SEN.';$('dreamText').innerHTML=won?'Stróż otwiera oczy o 06:00. Wszystkie sale są ciche. Wszystkie eksponaty stoją tam, gdzie powinny.<br>„Dobra zmiana.”':'„Znowu zasnąłem na zmianie…”<br>Stróż otwiera oczy. Wszystkie eksponaty stoją na swoich miejscach.';stageState();}
 function revealResults(){screen='result';show('results');stageState();const level=levels.get(night.levelId),next=levels.next(night.levelId);$('resultTime').textContent=formatTime(night.time);$('resultParries').textContent=night.parries;$('resultCoins').textContent=`+${night.coins} ✦`;$('resultLevel').textContent=`${night.wins} / ${levels.count}`;$('retryBtn').innerHTML=endData?.win&&!next?'JESZCZE RAZ OD POCZĄTKU <span>↗</span>':`${endData?.win?'DALEJ':'JESZCZE RAZ'}: SALA ${String(level.number).padStart(2,'0')} <span>↗</span>`;if(endData?.win&&!next){night.levelId=levels.first().id;profile.level=night.levelId;persist();}$('topStatus').textContent='06:00 / MUZEUM OTWIERA SIĘ ZA DWIE GODZINY';}
 function openModal(id){lastFocus=document.activeElement;show(id);$(id).querySelector('button:not(:disabled)')?.focus();document.body.style.overflow='hidden';}
 function closeModal(){if(crateBusy){toast('Skrzynia się otwiera. Za chwilę poznasz swój nowy wygląd.');return;}if(!$('loot').classList.contains('hidden')){claimReward(false);return;}for(const id of ['help','collection','shop'])show(id,false);document.body.style.overflow='';if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});if(helpWasPlaying){helpWasPlaying=false;resume();}}
 function collection(){if(crateBusy||!$('loot').classList.contains('hidden'))return;if(!['menu','result'].includes(screen)){toast('Wygląd możesz zmienić przed następnym pojedynkiem.');return;}renderSkins();openModal('collection');}
 function canOpenShop(){return !crateBusy&&['menu','result'].includes(screen)&&$('loot').classList.contains('hidden');}
 function shop(){if(!canOpenShop()){toast('Sklep czeka na koniec pojedynku i odbiór nagrody.');return;}closeModal();window.MuseumShop.render(selectedCrateId);openModal('shop');}
 function chooseShopCrate(id){if(!canOpenShop()||!loot.getCrate(id))return;closeModal();selectedCrateId=id;collection();}
 function drawSkin(canvas,skin){
  const ctx=canvas.getContext('2d'),d=canvas.width/360;ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,360,360);
  const g=ctx.createRadialGradient(180,175,15,180,180,230);g.addColorStop(0,loot.rarities[skin.rarity].color+'30');g.addColorStop(1,'#10180e');if(canvas.id!=='lootCanvas'){ctx.fillStyle=g;ctx.fillRect(0,0,360,360);}
  ctx.save();ctx.translate(180,320);ctx.scale(.95,.95);window.MuseumArt?.drawKnight(ctx,0,0,{pose:'idle',facing:1,time:0,skin:skin.id});ctx.restore();
 }
 function renderDropContents(target,entries){const rows=entries.map(({skin,chance})=>{const row=document.createElement('div'),name=document.createElement('span'),rarity=document.createElement('small'),odds=document.createElement('strong');row.className='drop-row';name.textContent=skin.name;rarity.textContent=loot.rarities[skin.rarity].name;rarity.style.color=loot.rarities[skin.rarity].color;odds.textContent=chance.toLocaleString('pl-PL',{maximumFractionDigits:2})+'%';row.append(name,rarity,odds);return row;});target.replaceChildren(...rows);if(!rows.length){const text=document.createElement('p');text.textContent='Masz już wszystkie stroje dostępne w tej skrzyni. Żetony nie zostaną pobrane.';target.append(text);}}
 function renderSkins(){
  const grid=$('skinGrid');grid.replaceChildren();
  const matches=matchingSkins(),pages=Math.max(1,Math.ceil(matches.length/SKINS_PER_PAGE));collectionPage=Math.max(0,Math.min(collectionPage,pages-1));const page=matches.slice(collectionPage*SKINS_PER_PAGE,(collectionPage+1)*SKINS_PER_PAGE);
  $('skinResultsCount').textContent=matches.length?`${outfitCount(matches.length)} · ${collectionPage*SKINS_PER_PAGE+1}–${Math.min((collectionPage+1)*SKINS_PER_PAGE,matches.length)} na stronie`:'0 strojów';
  $('skinPageInfo').textContent=`Strona ${collectionPage+1} / ${pages}`;$('skinPagePrev').disabled=collectionPage===0;$('skinPageNext').disabled=collectionPage>=pages-1;show('skinPagination',matches.length>SKINS_PER_PAGE);show('skinEmpty',!matches.length);$('newSkinsOnly').setAttribute('aria-pressed',String(collectionFilters.newOnly));
  const equipped=skins.find(s=>s.id===profile.skin);$('equippedSkin').textContent=`ZAŁOŻONO: ${equipped.name} · ${perks.get(profile.skin).summary}`;
  for(const s of page){
   const owned=profile.owned.includes(s.id),selected=profile.skin===s.id,perk=perks.get(s.id),b=document.createElement('button');
   b.className=`skin-card ${selected?'selected':''} ${owned?'':'locked'}`;b.dataset.rarity=s.rarity;b.dataset.skinId=s.id;b.dataset.category=s.categoryId;b.style.setProperty('--rarity',loot.rarities[s.rarity].color);b.setAttribute('aria-pressed',String(selected));b.setAttribute('aria-label',`${s.name}. ${loot.getCategory(s.categoryId)?.name||''}. ${perkText(perk)}${owned?(selected?' — wybrany':' — wybierz'):' — do odkrycia'}`);
   b.innerHTML=`${s.number?`<span class="skin-number">${String(s.number).padStart(2,'0')} / 50</span>`:s.gift?'<span class="skin-number">★ SPECJALNY</span>':''}<canvas width="360" height="360" aria-hidden="true"></canvas><small>${s.era}</small><strong>${s.name}</strong><span class="skin-category"></span><span class="skin-perk"><strong></strong><span></span></span><span class="skin-state">${selected?'● WYBRANY':owned?'WYBIERZ SKIN ↗':'◇ DO ODKRYCIA'}</span>`;
   b.querySelector('.skin-category').textContent=loot.getCategory(s.categoryId)?.name||'';
   b.querySelector('.skin-perk strong').textContent=perk.title;b.querySelector('.skin-perk span').textContent=perk.summary;
   b.addEventListener('click',()=>{if(crateBusy||!['menu','result'].includes(screen))return;if(!profile.owned.includes(s.id)){$('collectionMessage').textContent=`${s.name} czeka w muzealnej skrzyni. ${perkText(perk)}`;return;}profile.skin=s.id;persist();renderSkins();$('collectionMessage').textContent=`Wybrano ${s.name}. ${perkText(perk)}`;});grid.appendChild(b);drawSkin(b.querySelector('canvas'),s);
  }
  const crate=loot.getCrate(selectedCrateId)||loot.getCrate('gallery');selectedCrateId=crate.id;
  const entries=loot.entries(profile,crate.id),all=!entries.length,free=crate.id==='gallery'&&profile.freeCrates>0,odds=loot.odds(profile,crate.id);
  $('crateType').value=crate.id;$('crateTitle').textContent=crate.name;$('crateGuarantee').textContent=crate.guarantee+'. Bez duplikatów.';$('crateCategory').textContent=loot.getCategory(crate.categoryId)?.name||'Wszystkie kategorie';$('crateCategory').style.color=crate.color;
  $('crateContentsSummary').textContent=`ZAWARTOŚĆ I SZANSE · ${outfitCount(entries.length)}`;renderDropContents($('crateContentsList'),entries);
  $('crateBtn').disabled=all||crateBusy||!!profile.pendingReward||(!free&&profile.coins<crate.cost);
  $('crateBtn').innerHTML=all?'ZAWARTOŚĆ ZEBRANA <span>✓</span>':free?'OTWÓRZ GRATIS <span>◇</span>':`OTWÓRZ SKRZYNIĘ <span>${crate.cost.toLocaleString('pl-PL')} ✦</span>`;
  $('collectionCount').textContent=`${profile.owned.length} / ${skins.length} ODKRYTYCH`;
  $('freeCrateCount').textContent=all?'ZEBRANO ZAWARTOŚĆ TEJ SKRZYNI':free?'1 DARMOWA SKRZYNIA GALERII NA START':`${crate.cost.toLocaleString('pl-PL')} ✦${profile.freeCrates>0?' · PREZENT DOTYCZY GALERII':''}`;
  const percent=n=>(Math.round(n*10)/10).toLocaleString('pl-PL')+'%';
  $('crateOdds').textContent=all?'Zebrano wszystkie stroje dostępne w tej skrzyni. Wybierz inną skrzynię, aby sprawdzić pozostałe.':`Szanse w następnej skrzyni: zwykły ${percent(odds.common||0)} · rzadki ${percent(odds.rare)} · epicki ${percent(odds.epic)} · legendarny ${percent(odds.legendary)}. Bez duplikatów. Szanse przeliczają się po zebraniu całej rzadkości.`;
  $('collectionMessage').textContent=all?'Ta skrzynia nie pobierze kolejnych żetonów. Wybierz inny rodzaj lub załóż odkryty strój.':free?'Pierwsza Skrzynia Galerii czeka na ciebie. Otwórz ją za darmo i odkryj skin z bonusem do walki.':profile.coins<crate.cost?`Do tej skrzyni brakuje ${(crate.cost-profile.coins).toLocaleString('pl-PL')} żetonów. Zwycięstwo daje co najmniej 180 ✦.`:'Każda skrzynia zawiera nowy skin z własnym bonusem. Wybierz go przed walką — jeden skin, jeden aktywny bonus.';
 }
 function setLootBusy(value){crateBusy=value;document.querySelectorAll('.close-modal').forEach(b=>b.disabled=value);$('startBtn').disabled=value;$('retryBtn').disabled=value;}
 function showLoot(){
  lootReturnFocus=document.activeElement;$('collection').inert=true;show('loot');$('lootPanel').setAttribute('tabindex','-1');$('lootPanel').focus({preventScroll:true});document.body.style.overflow='hidden';
 }
 function revealReward(recovered=false){
  const s=skins.find(s=>s.id===profile.pendingReward);if(!s)return;
  if(recovered)window.MuseumLootShow.cancel();setLootBusy(false);delete $('lootPanel').dataset.lootPhase;$('lootPanel').classList.remove('is-rolling');$('lootPanel').classList.add('is-revealed');$('lootPanel').dataset.rarity=s.rarity;$('lootPanel').style.setProperty('--rarity',loot.rarities[s.rarity].color);
  $('lootEyebrow').textContent=recovered?'TWOJA SKRZYNIA NIE PRZEPADŁA':'PIECZĘĆ ZERWANA / NOWE ODKRYCIE';$('lootTitle').textContent='NOWY EKSPONAT.';$('lootSubtitle').textContent=recovered?'Odzyskano odkryty wygląd. Czeka bezpiecznie w twojej kolekcji.':'Ten wygląd już należy do ciebie. Załóż go na kolejny pojedynek.';
  show('lootWindow',false);show('lootSuspense',false);show('lootReward');show('lootActions');$('lootRarity').textContent=loot.rarities[s.rarity].name;$('lootName').textContent=s.name;$('lootEra').textContent=s.era;$('lootPerk').textContent=perkText(perks.get(s.id));drawSkin($('lootCanvas'),s);$('lootEquipBtn').focus({preventScroll:true});renderSkins();
 }
 function claimReward(equip){
  if(crateBusy||!['menu','result'].includes(screen))return;
  if(profile.pendingReward){profile=loot.claim(profile,{equip});persist();}
  show('loot',false);$('collection').inert=false;renderSkins();if(lootReturnFocus?.isConnected&&lootReturnFocus!==document.body&&!lootReturnFocus.disabled)lootReturnFocus.focus({preventScroll:true});else $('collection').querySelector('button:not(:disabled)')?.focus({preventScroll:true});
  $('collectionMessage').textContent=equip?`Skin wybrany. ${perkText(perks.get(profile.skin))}`:'Nowy skin zachowany w kolekcji. Możesz założyć go przed walką, aby aktywować jego bonus.';
 }
 function openCrate(){
  if(crateBusy||!['menu','result'].includes(screen))return;
  if(profile.pendingReward){showLoot();revealReward(true);return;}
  const reservation=loot.reserve(profile,undefined,selectedCrateId);if(!reservation)return;
  // Persist the exact reward and payment before any visual effects. Reloading cannot eat a crate.
  profile=reservation.profile;persist();setLootBusy(true);renderSkins();showLoot();
  const token=++rollToken,reel=$('lootReel');window.MuseumLootShow.cancel();reel.replaceChildren();$('lootPanel').classList.remove('is-revealed');$('lootPanel').classList.add('is-rolling');delete $('lootPanel').dataset.rarity;$('lootPanel').style.removeProperty('--rarity');
  $('lootEyebrow').textContent=reservation.crate.name.toLocaleUpperCase('pl-PL')+' / LOSOWANIE';$('lootTitle').textContent='CO KRYJE SKRZYNIA?';$('lootSubtitle').textContent=reservation.free?'Darmowa skrzynia. Jeden nowy wygląd, zero duplikatów.':`Wymieniono ${reservation.cost.toLocaleString('pl-PL')} żetonów. ${reservation.crate.guarantee}.`;show('lootReward',false);show('lootActions',false);show('lootWindow');
  show('lootSuspense');$('lootProgressFill').style.width='0%';
  const winner=48,cards=[];
  for(let i=0;i<54;i++){
   const s=i===winner?reservation.reward:loot.draw(profile,Math.random,reservation.crate.id)||reservation.reward,card=document.createElement('div');card.className='loot-card';card.dataset.rarity=s.rarity;card.style.setProperty('--rarity',loot.rarities[s.rarity].color);card.innerHTML=`<canvas width="240" height="240" aria-hidden="true"></canvas><small>${loot.rarities[s.rarity].name}</small><strong>${s.name}</strong>`;reel.appendChild(card);drawSkin(card.querySelector('canvas'),s);cards.push(card);
  }
  window.MuseumLootShow.start({reel,viewport:$('lootWindow'),cards,winner,isSoundEnabled:()=>profile.sound,onReveal:()=>{if(token===rollToken)revealReward();}});
 }
 function changeCollectionFilter(){if(crateBusy||!['menu','result'].includes(screen))return;collectionFilters.search=$('skinSearch').value;collectionFilters.category=$('categoryFilter').value;collectionFilters.rarity=$('rarityFilter').value;collectionFilters.ownership=$('ownershipFilter').value;collectionPage=0;renderSkins();}
 for(const crate of loot.crates){const option=document.createElement('option');option.value=crate.id;option.textContent=`${crate.name} · ${crate.cost.toLocaleString('pl-PL')} ✦`;$('crateType').append(option);}
 for(const category of [{id:'all',name:'Wszystkie kategorie'},...loot.categories]){const option=document.createElement('option');option.value=category.id;option.textContent=category.name;$('categoryFilter').append(option);}
 $('categoryFilter').value='all';
 $('crateType').addEventListener('change',()=>{if(crateBusy||!['menu','result'].includes(screen))return;const crate=loot.getCrate($('crateType').value);if(crate)selectedCrateId=crate.id;renderSkins();});
 window.MuseumShop.mount({getProfile:()=>profile,canOpen:canOpenShop,onOpenWithTokens:chooseShopCrate,notify:toast});
 $('shopTab').addEventListener('click',shop);$('crateShopBtn').addEventListener('click',shop);
 $('secretCoinsBtn').addEventListener('click',()=>{if(!canOpenShop())return;profile.coins+=2137;persist();if(!$('collection').classList.contains('hidden'))renderSkins();if(!$('shop').classList.contains('hidden'))window.MuseumShop.render();toast('Sekret stróża odkryty. +2137 monet ✦');});
 $('skinSearch').addEventListener('input',changeCollectionFilter);$('categoryFilter').addEventListener('change',changeCollectionFilter);$('rarityFilter').addEventListener('change',changeCollectionFilter);$('ownershipFilter').addEventListener('change',changeCollectionFilter);
 $('newSkinsOnly').addEventListener('click',()=>{if(crateBusy||!['menu','result'].includes(screen))return;collectionFilters.newOnly=!collectionFilters.newOnly;collectionPage=0;renderSkins();});
 $('resetSkinFilters').addEventListener('click',()=>{if(crateBusy||!['menu','result'].includes(screen))return;collectionFilters.newOnly=false;$('skinSearch').value='';$('categoryFilter').value='all';$('rarityFilter').value='all';$('ownershipFilter').value='all';changeCollectionFilter();});
 $('skinPagePrev').addEventListener('click',()=>{if(crateBusy||!['menu','result'].includes(screen)||collectionPage<=0)return;collectionPage--;renderSkins();$('skinResultsCount').scrollIntoView({block:'nearest'});});
 $('skinPageNext').addEventListener('click',()=>{if(crateBusy||!['menu','result'].includes(screen)||collectionPage>=Math.ceil(matchingSkins().length/SKINS_PER_PAGE)-1)return;collectionPage++;renderSkins();$('skinResultsCount').scrollIntoView({block:'nearest'});});
 $('startBtn').addEventListener('click',beginNight);$('retryBtn').addEventListener('click',beginNight);$('menuBtn').addEventListener('click',menu);$('pauseBtn').addEventListener('click',pause);$('resumeBtn').addEventListener('click',resume);$('collectionTab').addEventListener('click',collection);$('crateBtn').addEventListener('click',openCrate);$('lootEquipBtn').addEventListener('click',()=>claimReward(true));$('lootKeepBtn').addEventListener('click',()=>claimReward(false));
 $('arenaTab').addEventListener('click',()=>{if(screen==='menu')$('gameFrame').scrollIntoView({behavior:'smooth',block:'center'});});
 document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();if(screen==='menu')window.scrollTo({top:0,behavior:'smooth'});});
 $('soundBtn').addEventListener('click',()=>{profile.sound=!profile.sound;persist();soundUI();toast(profile.sound?'Dźwięk włączony. Muzeum już nie śpi.':'Dźwięk wyłączony.');});
 $('helpBtn').addEventListener('click',()=>{if(crateBusy||!$('loot').classList.contains('hidden'))return;if(['intro','card','timejump','ending','ko'].includes(screen)){toast('Historia trwa. Instrukcja będzie dostępna po scenie.');return;}helpWasPlaying=screen==='fight';if(helpWasPlaying)pause();openModal('help');});
 $('helpClose').addEventListener('click',closeModal);document.querySelectorAll('.close-modal').forEach(b=>b.addEventListener('click',closeModal));document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal();}));
 document.addEventListener('keydown',e=>{const modals=[...document.querySelectorAll('.modal:not(.hidden)')],modal=modals.find(m=>m.id==='loot')||modals.at(-1);if(modal){if(e.key==='Escape'){e.preventDefault();closeModal();}if(e.key==='Tab'){const buttons=[...modal.querySelectorAll('button:not(:disabled)')].filter(b=>b.getClientRects().length);const first=buttons[0],last=buttons.at(-1);if(!first){e.preventDefault();$('lootPanel').focus();}else if(e.shiftKey&&(document.activeElement===first||!modal.contains(document.activeElement))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||!modal.contains(document.activeElement))){e.preventDefault();first.focus();}}return;}if(e.key==='Escape'){e.preventDefault();if(screen==='fight')pause();else if(screen==='paused')resume();}});
 document.addEventListener('visibilitychange',()=>{frameTime=0;if(document.hidden&&screen==='fight')pause();});
 window.addEventListener('blur',()=>{if(screen==='fight')pause();frameTime=0;});
 function renderScene(time){const c=$('arena'),ctx=c.getContext('2d'),a=window.MuseumArt;if(!ctx||!a)return;const d=c.width/1440;ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,1440,810);ctx.save();
  const level=night?levels.get(night.levelId):currentLevel(),exhibit=levelExhibit(level),big=exhibit.stats.art==='rex';
  const drawFoe=(x,o)=>{ctx.save();ctx.translate(x,665);if(big)ctx.scale(1.18,1.18);a.drawExhibit(ctx,exhibit,0,0,o);ctx.restore();};
  if(screen==='menu'){a.drawArena(ctx,1440,810,time,level.theme);a.drawKnight(ctx,325,665,{pose:'idle',facing:1,time,skin:profile.skin});drawFoe(big?1085:1040,{pose:'idle',facing:-1,time});}
  else if(screen==='intro'){if(introTime<6&&a.drawGuardScene){a.drawGuardScene(ctx,1440,810,time);}else{a.drawArena(ctx,1440,810,time,level.theme);const awake=Math.min(1,Math.max(0,(introTime-6)/3));drawFoe(big?1055:1030,{pose:introTime<11?'guard':'idle',facing:-1,time,phase:awake,glow:introTime<11});a.drawKnight(ctx,365,665,{pose:introTime<12?'idle':'guard',facing:1,time,skin:profile.skin});ctx.fillStyle=`rgba(0,8,5,${Math.max(0,.65-awake*.65)})`;ctx.fillRect(0,0,1440,810);}const boundary=[0,6,12].some(t=>introTime>=t&&introTime<t+.6);if(boundary){const at=introTime%6;ctx.fillStyle=`rgba(4,9,6,${1-at/.6})`;ctx.fillRect(0,0,1440,810);}}
  else if(screen==='card'){a.drawArena(ctx,1440,810,time,level.theme);const awake=Math.min(1,cardTime/totalCard);drawFoe(big?1055:1030,{pose:cardTime<totalCard*.6?'guard':'idle',facing:-1,time,phase:awake,glow:cardTime<totalCard*.6});a.drawKnight(ctx,365,665,{pose:'guard',facing:1,time,skin:profile.skin});ctx.fillStyle=`rgba(0,4,8,${Math.max(0,.7-awake*.7)})`;ctx.fillRect(0,0,1440,810);}
  else if(screen==='timejump'){const k=Math.min(1,jumpTime/totalJump);const from=jumpFrom,to=jumpTo;if(k<.5){a.drawArena(ctx,1440,810,time,from.theme);}else{a.drawArena(ctx,1440,810,time,to.theme);const awake=Math.min(1,(k-.5)/.4);drawFoe(big?1055:1030,{pose:'guard',facing:-1,time,phase:awake,glow:true});a.drawKnight(ctx,365,665,{pose:'guard',facing:1,time,skin:profile.skin});}
   // Rushing light streaks sell the jump; the swap hides behind the brightest frame.
   const burst=Math.sin(k*Math.PI);ctx.save();ctx.globalCompositeOperation='screen';for(let i=0;i<26;i++){const y=60+((i*131+time*900*(1+i%4))%720),len=120+burst*520+(i%5)*40;ctx.fillStyle=`rgba(255,236,180,${.04+burst*.16})`;ctx.fillRect((i*197+time*1800)%1900-400,y,len,2+(i%3));}ctx.restore();
   ctx.fillStyle=`rgba(255,244,214,${Math.pow(burst,6)*.9})`;ctx.fillRect(0,0,1440,810);ctx.fillStyle=`rgba(0,0,0,${.35*(1-Math.abs(k-.5)*2)})`;ctx.fillRect(0,0,1440,810);}
  else if(screen==='ending'||screen==='result'){if(a.drawGuardScene)a.drawGuardScene(ctx,1440,810,time,{awake:endingTime>3});else a.drawArena(ctx,1440,810,time,level.theme);ctx.fillStyle='#08110a65';ctx.fillRect(0,0,1440,810);if(endingTime<3){ctx.fillStyle=`rgba(0,0,0,${Math.max(0,1-(endingTime-1.8)/1.2)})`;ctx.fillRect(0,0,1440,810);}}ctx.restore();}
 function loop(now){const dt=frameTime?Math.min(.1,(now-frameTime)/1000):0;frameTime=now;if(!document.hidden){
   if(screen==='intro'){introTime=Math.min(totalIntro,introTime+dt);updateIntro();if(introTime>=totalIntro)startFight();}
   else if(screen==='card'){cardTime=Math.min(totalCard,cardTime+dt);$('cardProgress').style.width=(cardTime/totalCard*100)+'%';if(cardTime>=totalCard)startFight();}
   else if(screen==='timejump'){jumpTime=Math.min(totalJump,jumpTime+dt);updateTimeJump();if(jumpTime>=totalJump)startFight();}
   else if(screen==='ko'){endingTime+=dt;if(endingTime>=1.8){const level=levels.get(night.levelId),next=endData?.win?levels.next(level.id):null;if(next)startTimeJump(level,next);else startEnding();}}
   else if(screen==='ending'){endingTime+=dt;if(endingTime>=7.8)revealResults();}
   if(['menu','intro','card','timejump','ending','result'].includes(screen))renderScene(now/1000);}requestAnimationFrame(loop);}
 persist();soundUI();renderMenuLevel();stageState();window.MuseumGame?.setScene('external');if(profile.pendingReward){renderSkins();openModal('collection');showLoot();revealReward(true);}requestAnimationFrame(loop);
})();
