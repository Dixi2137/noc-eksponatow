/* Museum after hours — menu, unskippable prologue, collection and dream epilogue. */
(() => {
 'use strict';
 const $ = id => document.getElementById(id);
 const show = (id, visible = true) => $(id).classList.toggle('hidden', !visible);
 const loot=window.MuseumLoot, skins=loot.skins, perks=window.MuseumPerks, levels=window.MuseumLevels, exhibits=window.MuseumExhibits, weapons=window.MuseumWeapons, cardsApi=window.MuseumCards, hallApi=window.MuseumHall, cloud=window.MuseumCloud;
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
 let collectionKind='skin';
 const KIND_LABEL={skin:'strój',weapon:'broń',card:'karta'};
 const number=n=>Number(n).toLocaleString('pl-PL');
 const outfitCount=n=>`${n} ${n===1?'strój':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'stroje':'strojów'}`;
 const normalizeSkinText=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/gi,'l').toLocaleLowerCase('pl-PL').trim();
 function itemSummary(item){return item.kind==='skin'?perkText(perks.get(item.id)):item.summary||'';}
 function itemSearchText(item){return [item.name,item.description||'',item.motif||'',item.typeName||'',loot.getCategory(item.categoryId)?.name||'',itemSummary(item)].join(' ');}
 function matchingItems(){const query=normalizeSkinText(collectionFilters.search);return loot.items.filter(s=>{if(s.kind!==collectionKind)return false;const owned=loot.has(profile,s);return (!collectionFilters.newOnly||/^knight-\d{2}$/.test(s.id))&&(collectionFilters.category==='all'||s.categoryId===collectionFilters.category)&&(collectionFilters.rarity==='all'||s.rarity===collectionFilters.rarity)&&(collectionFilters.ownership==='all'||(collectionFilters.ownership==='owned'?owned:!owned))&&(!query||(owned&&normalizeSkinText(itemSearchText(s)).includes(query)));}).sort((a,b)=>Number(loot.has(profile,b))-Number(loot.has(profile,a)));}
 const matchingSkins=matchingItems;
 function perkText(perk){return `${perk.title}: ${perk.summary}`;}
 function updateLoadout(){const skin=skins.find(s=>s.id===profile.skin),weapon=weapons.get(profile.weapon),card=cardsApi.get(profile.card);const up=loot.upgradeLevel(profile,skin.id),wup=loot.upgradeLevel(profile,weapon.id);const finish=window.MuseumFinishes?.get(profile.finish);const text=`${skin.name}${up?` +${up}`:''} — ${perkText(perks.get(skin.id))} · ${weapon.name}${wup?` +${wup}`:''}${finish?` (${finish.name})`:''}${card?` · ${card.name}: ${card.summary}`:''}`;if($('loadoutPerk').textContent!==text)$('loadoutPerk').textContent=text;}
 function updateActivePerk(perk){const target=$('activePerk');if(target.dataset.perk===perk.id)return;const title=document.createElement('strong'),summary=document.createElement('span');title.textContent=perk.title;summary.textContent=perk.summary;target.replaceChildren(title,summary);target.dataset.perk=perk.id;target.setAttribute('aria-label',perkText(perk));}
 let pushTimer=null,pushing=false;
 function cloudStats(){const sum=hallApi.summary(profile);return {halls_cleared:profile.cleared.length,prestige:sum.prestige,fastest_night:profile.records?.fastestNight??null,night_coins:profile.records?.nightCoins||0};}
 async function pushCloud(now=false){if(!cloud.user())return null;clearTimeout(pushTimer);if(!now){pushTimer=setTimeout(()=>pushCloud(true),2500);return null;}if(pushing)return null;pushing=true;const r=await cloud.upsertProfile({save:profile,...cloudStats()});pushing=false;setAccountStatus(r.ok?'':`Zapis w chmurze nie powiódł się: ${r.error}`,!r.ok);return r;}
 const pln=gr=>(Number(gr||0)/100).toLocaleString('pl-PL',{style:'currency',currency:'PLN'});
 function persist(){try{localStorage.setItem('museum-night-v1',JSON.stringify(profile));}catch(_){} $('coins').textContent=profile.coins;$('balance').textContent=pln(profile.balance);updateLoadout();pushCloud();}
 function refreshStores(){if(!$('collection').classList.contains('hidden'))renderSkins();if(!$('shop').classList.contains('hidden'))window.MuseumShop.render();}
 function buyFinish(id){const result=loot.buyFinish(profile,id);if(!result){toast('Za mało na saldzie. Wpłać najpierw złotówki.');return;}profile=result.profile;persist();refreshStores();toast(`Kupiono ${result.item.name} za ${pln(result.price)}. Nałóż je w kolekcji, zakładka WYKOŃCZENIA.`);}
// Pixel art is the only look: the vector renderer stays in art.js as a fallback, but nothing in the UI switches to it.
function pixelUI(){profile.pixel=true;window.MuseumArt?.setPixelFactor(window.MuseumPixel?.PX||5);document.body.classList.add('pixel');}
 function soundUI(){ $('soundBtn').classList.toggle('sound-on',profile.sound);$('soundBtn').setAttribute('aria-label',profile.sound?'Wyłącz dźwięk':'Włącz dźwięk');window.MuseumGame?.setSound(profile.sound); }
 function toast(text){$('toast').textContent=text;show('toast');clearTimeout(toastTimer);toastTimer=setTimeout(()=>show('toast',false),3200);}
 function stageState(){const fighting=screen==='fight'||screen==='paused';$('gameFrame').classList.toggle('fighting',fighting);$('touchControls').classList.toggle('enabled',fighting);for(const id of ['collectionTab','shopTab','hallTab','rankTab'])$(id).setAttribute('aria-disabled',String(!['menu','result'].includes(screen)));}
 function renderLevelStrip(){
  const strip=$('levelStrip');strip.replaceChildren();const chosen=currentLevel();
  for(const level of levels.all()){const b=document.createElement('button');const cleared=profile.cleared.includes(level.id),open=isUnlocked(level);b.type='button';b.className=`level-pip ${cleared?'cleared':''} ${level.id===chosen.id?'chosen':''} ${open?'':'locked'}`;b.disabled=!open;b.innerHTML=`<span>${String(level.number).padStart(2,'0')}</span><strong>${level.title}</strong><small>${cleared?'✓ POKONANY':open?level.yearLabel:'◇ ZAMKNIĘTE'}</small>`;b.setAttribute('aria-label',`Poziom ${level.number}: ${level.title}, ${levelExhibit(level).name}${cleared?', pokonany':open?'':', zamknięty'}`);b.setAttribute('aria-pressed',String(level.id===chosen.id));
   b.addEventListener('click',()=>{if(screen!=='menu'||!open)return;profile.level=level.id;persist();renderMenuLevel();});strip.append(b);}
 }
 function renderMenuLevel(){
  const level=currentLevel(),exhibit=levelExhibit(level);
  $('heroTagline').innerHTML=level.tagline;$('exhibitTagName').textContent=exhibit.name;$('exhibitTagInfo').textContent=exhibit.tag;
  $('stageHall').textContent=twistOf(level)?`${level.hall} · ${twistOf(level).name}`:level.hall;$('stageYear').innerHTML=`${level.yearLabel} <span class="meta-live">●</span>`;
  $('heroLevel').textContent=`POZIOM ${String(level.number).padStart(2,'0')} / ${String(levels.count).padStart(2,'0')} · ${level.title}`;
  $('introNote').innerHTML=levels.indexOf(level.id)===0?'<span>◷</span> Najpierw historia. 18 sekund. Bez pomijania.':`<span>◷</span> Noc zaczyna się od sali ${level.number}. Pokonane sale zostają zaliczone.`;
  renderLevelStrip();
 }
 function menu(){screen='menu';night=null;window.MuseumGame?.reset();window.MuseumGame?.setScene('external');['hud','combatHint','intro','card','timejump','choice','ending','pause','results'].forEach(id=>show(id,false));show('menu');show('exhibitTag');show('stageMeta');$('topStatus').innerHTML='ZAMKNIĘTE DLA ZWIEDZAJĄCYCH <span class="muted">/</span> OTWARTE NA POJEDYNKI';renderMenuLevel();stageState();$('startBtn').focus({preventScroll:true});}
 function beginNight(){
  if(crateBusy||!$('loot').classList.contains('hidden')||!['menu','result'].includes(screen))return;closeModal();
  const level=screen==='result'&&night?levels.get(night.levelId):currentLevel();
  night={levelId:level.id,coins:0,wins:0,parries:0,time:0};profile.level=level.id;persist();
  window.MuseumGame?.reset();window.MuseumGame?.setScene('external');['menu','exhibitTag','hud','combatHint','ending','pause','results','stageMeta','timejump','choice','card'].forEach(id=>show(id,false));stageState();$('startBtn').blur();
  if(levels.indexOf(level.id)===0&&level.prologue.length){screen='intro';introTime=0;show('intro');$('topStatus').textContent='PROLOG / OSTATNI OBCHÓD';updateIntro();}
  else showCard(level);
 }
 const twistOf=level=>window.MuseumTwists?.get(level?.twist);
 function twistLine(id,level){const box=$(id),tw=twistOf(level);if(!box)return;show(id,!!tw);if(tw){box.querySelector('strong').textContent=tw.name;box.querySelector('em').textContent=tw.blurb;}}
 function showCard(level){screen='card';cardTime=0;const exhibit=levelExhibit(level);show('card');$('cardLevel').textContent=`SALA ${String(level.number).padStart(2,'0')} / ${String(levels.count).padStart(2,'0')}`;$('cardLabel').textContent=`${level.yearLabel} / ${level.hall}`;$('cardText').textContent=level.card;$('cardFoe').textContent=exhibit.name;twistLine('cardTwist',level);$('topStatus').textContent=`${level.title} / ${level.yearLabel}`;$('cardProgress').style.width='0%';}
 function updateIntro(){const level=levels.get(night.levelId),chapters=level.prologue,per=totalIntro/chapters.length,i=Math.min(chapters.length-1,Math.floor(introTime/per));const c=chapters[i];$('sceneLabel').textContent=c.label;$('sceneText').textContent=c.text;$('introChapter').textContent=`PROLOG / 0${i+1}`;$('introRemaining').textContent=Math.ceil(totalIntro-introTime);$('introProgress').style.width=(introTime/totalIntro*100)+'%';}
 function startFight(){
  if(!(screen==='intro'&&introTime>=totalIntro)&&!(screen==='card'&&cardTime>=totalCard)&&!(screen==='timejump'&&jumpTime>=totalJump))return;
  const level=levels.get(night.levelId),exhibit=levelExhibit(level);
  screen='fight';['intro','card','timejump'].forEach(id=>show(id,false));show('hud');show('combatHint');show('stageMeta');
  $('playerName').textContent=profile.skin==='stachu-jones'?'STACHU JONES':profile.skin==='jan-pawel-ii'?'JAN PAWEŁ II':'ŻELAZNY RYCERZ';$('foeName').textContent=exhibit.name;
  $('stageHall').textContent=twistOf(level)?`${level.hall} · ${twistOf(level).name}`:level.hall;$('stageYear').innerHTML=`${level.yearLabel} <span class="meta-live">●</span>`;
  $('topStatus').textContent=`SALA ${String(level.number).padStart(2,'0')} / RYCERZ KONTRA ${exhibit.alias.toLocaleUpperCase('pl-PL')}`;stageState();
  show('ammoRow',false);window.MuseumGame.start({skin:profile.skin,exhibit:exhibit.id,weapon:profile.weapon||'sword',finish:profile.finish||null,theme:level.theme,twist:level.twist||null,specials:level.number>3,difficulty:level.number,modifiers:loot.modifiers(profile),sound:profile.sound});
 }
 function pause(){if(screen!=='fight')return;screen='paused';window.MuseumGame.pause();renderPauseInfo();show('pause');stageState();}
 // Esc shows who you are fighting: name, era, how he fights (numbers from his combat profile) and what beats him.
 function renderPauseInfo(){const box=$('pauseInfo');if(!box||!night)return;const level=levels.get(night.levelId),ex=levelExhibit(level);if(!ex){show('pauseInfo',false);return;}const cb=ex.stats.combat||{},dmg=ex.stats.damage||{};const fmt=n=>Number(n).toLocaleString('pl-PL',{maximumFractionDigits:1});const style=['pistol','rifle','bow','minigun'].includes(ex.stats.figure?.weapon)?'Strzela z dystansu: unikaj, podejdź po jego strzale i tnij.':cb.windup<=.85?'Szybki szermierz: krótkie zamachy, mało czasu na parowanie, za to szybko odpoczywa.':cb.windup>=1.3?'Powolny osiłek: długi zamach, ciężkie ciosy, długi odpoczynek po nich.':'Klasyczny tyran: równe tempo, ciężki cios co kilka zamachów.';
  box.replaceChildren();const name=document.createElement('strong');name.textContent=ex.name;const tag=document.createElement('small');tag.textContent=`${ex.tag||''}${ex.era?' · '+ex.era:''}`;const desc=document.createElement('p');desc.textContent=ex.description||'';const list=document.createElement('ul');const tw=twistOf(level),sp=({feint:'Finta: potrafi przerwać zamach i uderzyć szybkim, krótkim ciosem zaraz potem.',double:'Podwójny cios: po lekkim ataku bywa drugi, prawie bez zamachu.',burst:'Seria: po strzale często leci drugi, niemal natychmiast.'})[window.MuseumGame.getState().special];for(const text of [...(tw?[`WARUNKI SALI: ${tw.name}. ${tw.blurb}`]:[]),...(sp?[sp]:[]),style,`Zamach ${fmt(cb.windup)} s, ciężki ${fmt(cb.heavyWindup)} s (co ${cb.heavyEvery||3}. atak). Po ciosie odpoczywa ${fmt(cb.recovery)} s: wtedy jego garda jest słaba.`,`Obrażenia: ${dmg.light||'?'} lekki, ${dmg.heavy||'?'} ciężki; sparowane ${dmg.lightBlocked||'?'} / ${dmg.heavyBlocked||'?'}. HP: ${ex.stats.hp}.`,`${level.hall} · ${String(level.yearLabel).replace(/\.$/,'')}. Nagroda za salę: ${level.reward} ✦ (+20 za każdą paradę).`]){const li=document.createElement('li');li.textContent=text;list.append(li);}box.append(name,tag,desc,list);show('pauseInfo');}
 function resume(){if(screen!=='paused')return;screen='fight';show('pause',false);window.MuseumGame.resume();stageState();}
 function formatTime(n){return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}`;}
 window.addEventListener('game:update',e=>{const s=e.detail;if(!['fight','paused'].includes(screen))return;const maxP=s.player?.maxHP||120,maxR=s.exhibit?.maxHP||s.foe?.maxHP||160;$('playerHealth').style.width=Math.max(0,s.playerHP/maxP*100)+'%';$('foeHealth').style.width=Math.max(0,s.foeHP/maxR*100)+'%';$('playerHP').textContent=`${Math.ceil(s.playerHP)} / ${maxP}`;$('foeHP').textContent=`${Math.ceil(s.foeHP)} / ${maxR}`;$('staminaNum').textContent=Math.floor(s.stamina);$('staminaBar').style.width=s.stamina+'%';$('fightTime').textContent=formatTime(s.time||s.elapsed||0);$('hintText').textContent=s.hint||'Wyczuj moment. Paruj tuż przed ciosem.';if(s.perk)updateActivePerk(s.perk);if(s.weapon?.maxAmmo!=null){show('ammoRow');$('ammoNum').textContent=s.weapon.reload>0?'PRZEŁADOWANIE':`${s.weapon.ammo} / ${s.weapon.maxAmmo}`;}const names={idle:'OBSERWUJE',approach:'PODCHODZI',retreat:'ODSTĘPUJE',reposition:'ŁAPIE DYSTANS',windup:'SZYKUJE ATAK',strike:'ATAKUJE',recover:'OSŁABIONA GARDA'};$('foeState').textContent=names[s.foeState]||s.exhibit?.name||'ŻYWY EKSPONAT';});
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
 // After a won hall the player chooses: straight to the next hall, or back to the main menu (the night's loot is already banked).
 function showChoice(level,next){screen='choice';show('hud',false);show('stageMeta',false);show('combatHint',false);const exhibit=levelExhibit(level),reward=endData?level.reward+(endData.parries||0)*20:level.reward;$('choiceLevel').textContent=`SALA ${String(level.number).padStart(2,'0')} / ${String(levels.count).padStart(2,'0')} ZALICZONA`;$('choiceReward').textContent=`+${reward} ✦ · TEJ NOCY ${night.coins} ✦`;$('choiceTitle').textContent=`${exhibit.alias.toLocaleUpperCase('pl-PL')} POKONANY.`;$('choiceText').textContent=`Następna: sala ${String(next.number).padStart(2,'0')} / ${levelExhibit(next).name}, ${next.yearLabel.replace(/\.$/,'')}.`;show('choice');$('nextBtn').focus();stageState();}
 function settleNight(){if(!night)return;profile.records=profile.records||{fastestNight:null,nightCoins:0};if(night.coins>profile.records.nightCoins)profile.records.nightCoins=night.coins;persist();pushCloud(true);}
 function chooseNext(){if(screen!=='choice')return;const level=levels.get(night.levelId),next=levels.next(level.id);show('choice',false);if(next)startTimeJump(level,next);else startEnding();}
 function chooseMenu(){if(screen!=='choice')return;settleNight();show('choice',false);menu();}
 function startTimeJump(from,to){screen='timejump';jumpTime=0;jumpFrom=from;jumpTo=to;night.levelId=to.id;show('hud',false);show('stageMeta',false);show('timejump');$('jumpLevel').textContent=`SALA ${String(to.number).padStart(2,'0')} / ${String(levels.count).padStart(2,'0')}`;$('jumpFrom').textContent=from.yearLabel;$('jumpTo').textContent=`→ ${to.yearLabel}`;$('jumpYear').textContent=from.yearLabel;$('jumpLabel').textContent=`${to.title} / ${to.hall}`;$('jumpText').textContent=to.card;$('jumpFoe').textContent=levelExhibit(to).name;twistLine('jumpTwist',to);$('jumpProgress').style.width='0%';$('topStatus').textContent=`PRZESKOK W CZASIE / ${to.yearLabel}`;stageState();}
 function updateTimeJump(){const k=Math.min(1,jumpTime/(totalJump*.72)),eased=1-Math.pow(1-k,3);const year=Math.round(jumpFrom.year+(jumpTo.year-jumpFrom.year)*eased);$('jumpYear').textContent=k>=1?jumpTo.yearLabel:yearText(year);$('jumpProgress').style.width=(jumpTime/totalJump*100)+'%';$('timejump').classList.toggle('arrived',k>=1);}
 function startEnding(){screen='ending';window.MuseumGame?.setScene('external');show('hud',false);show('stageMeta',false);show('ending');show('results',false);const won=endData?.win&&!levels.next(night.levelId);$('dreamTitle').textContent=won?'ŚWIT. MUZEUM OCALONE.':'TO BYŁ TYLKO SEN.';$('dreamText').innerHTML=won?'Stróż otwiera oczy o 06:00. Wszystkie sale są ciche. Wszystkie eksponaty stoją tam, gdzie powinny.<br>„Dobra zmiana.”':'„Znowu zasnąłem na zmianie…”<br>Stróż otwiera oczy. Wszystkie eksponaty stoją na swoich miejscach.';stageState();}
 function revealResults(){screen='result';show('results');stageState();const level=levels.get(night.levelId),next=levels.next(night.levelId);profile.records=profile.records||{fastestNight:null,nightCoins:0};if(night.coins>profile.records.nightCoins)profile.records.nightCoins=night.coins;if(endData?.win&&!next&&night.wins===levels.count&&(profile.records.fastestNight===null||night.time<profile.records.fastestNight))profile.records.fastestNight=Math.round(night.time*10)/10;persist();pushCloud(true);$('resultTime').textContent=formatTime(night.time);$('resultParries').textContent=night.parries;$('resultCoins').textContent=`+${night.coins} ✦`;$('resultLevel').textContent=`${night.wins} / ${levels.count}`;$('retryBtn').innerHTML=endData?.win&&!next?'JESZCZE RAZ OD POCZĄTKU <span>↗</span>':`${endData?.win?'DALEJ':'JESZCZE RAZ'}: SALA ${String(level.number).padStart(2,'0')} <span>↗</span>`;if(endData?.win&&!next){night.levelId=levels.first().id;profile.level=night.levelId;persist();}$('topStatus').textContent='06:00 / MUZEUM OTWIERA SIĘ ZA DWIE GODZINY';}
 function renderHall(){
  const shown=hallApi.exhibition(profile),sum=hallApi.summary(profile),name=profile.hall?.name||hallApi.DEFAULT_NAME;
  if($('hallName').value!==name&&document.activeElement!==$('hallName'))$('hallName').value=name;
  const canvas=$('hallCanvas'),ctx=canvas.getContext('2d');if(ctx&&window.MuseumArt?.drawHall){const d=canvas.width/1440;ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,1440,810);const pix=window.MuseumArt.pixelFactor&&window.MuseumPixel?window.MuseumPixel:null;const texts=[];window.MuseumArt.pixelFrame(ctx,1440,810,c=>{if(pix){c.save();c.setTransform(1,0,0,1,0,0);pix.drawHall(c,0,shown,{name,texts});c.restore();}else window.MuseumArt.drawHall(c,1440,810,0,shown,{name});});if(pix&&texts.length)pix.drawTexts(ctx,texts,pix.PX);}
  $('hallSummary').replaceChildren(...[['PRESTIŻ',String(sum.prestige)],['WARTOŚĆ EKSPOZYCJI',`${number(sum.value)} ✦`],['TROFEA',`${sum.trophies} / ${sum.trophiesTotal}`]].map(([k,v])=>{const span=document.createElement('span'),strong=document.createElement('strong');strong.textContent=v;span.append(k,strong);return span;}));
  $('hallFilled').textContent=`${sum.filled} / ${sum.total}${sum.fullBonus?' · PEŁNA SALA +20':''}`;
  const busy=()=>crateBusy||!['menu','result'].includes(screen);
  $('hallSlots').replaceChildren(...shown.map(({slot,item})=>{
   const box=document.createElement('div');box.className=`hall-slot ${item?'filled':''}`;
   const label=document.createElement('span');label.textContent=slot.name;const title=document.createElement('strong');title.textContent=item?item.name:'PUSTE MIEJSCE';
   const select=document.createElement('select');select.setAttribute('aria-label',`${slot.name}: wybierz przedmiot`);
   const empty=document.createElement('option');empty.value='';empty.textContent='— puste —';select.append(empty);
   for(const candidate of hallApi.candidates(profile,slot.id)){const option=document.createElement('option');option.value=candidate.id;option.textContent=`${candidate.name} · ${loot.rarities[candidate.rarity].name}`;select.append(option);}
   select.value=item?item.id:'';
   select.addEventListener('change',()=>{if(busy())return;const next=hallApi.setSlot(profile,slot.id,select.value||null);if(!next){toast('Tego przedmiotu nie możesz tu wystawić.');renderHall();return;}profile=next;persist();renderHall();});
   const hint=document.createElement('small');hint.textContent=select.options.length>1?slot.hint:slot.kind==='trophy'?'Trofea zdobywasz, pokonując sale nocnego obchodu.':`Nie masz jeszcze żadnego przedmiotu tego rodzaju.`;
   box.append(label,title,select,hint);return box;
  }));
  $('hallTrophyCount').textContent=`${sum.trophies} / ${sum.trophiesTotal}`;
  $('hallTrophies').replaceChildren(...hallApi.trophies.map(trophy=>{
   const owned=hallApi.hasTrophy(profile,trophy.id),card=document.createElement('div');card.className=`hall-trophy ${owned?'':'locked'}`;card.title=trophy.description;
   const canvas=document.createElement('canvas');canvas.width=180;canvas.height=180;const ctx=canvas.getContext('2d');if(ctx&&window.MuseumPixel?.drawTrophy){ctx.imageSmoothingEnabled=false;window.MuseumPixel.drawTrophy(ctx,trophy,90,160,6,{locked:!owned});}
   const name=document.createElement('strong');name.textContent=owned?trophy.name:'???';const era=document.createElement('small');era.textContent=owned?trophy.era:`ZA SALĘ: ${levels.get(trophy.level).title}`;
   card.append(canvas,name,era);return card;
  }));
 }
 function hall(){if(crateBusy||!$('loot').classList.contains('hidden'))return;if(!['menu','result'].includes(screen)){toast('Swoją salę urządzisz przed następnym pojedynkiem.');return;}closeModal();renderHall();openModal('hall');}
 let accountMode='login';
 function setAccountStatus(text,error=false){$('accountMsg').textContent=text;$('accountMsg').classList.toggle('error',!!error);}
 function renderAccount(){const me=cloud.user();$('accountBtn').classList.toggle('online',!!me);$('accountLabel').textContent=me?(me.nickname||me.email).toLocaleUpperCase('pl-PL'):'GOŚĆ';show('accountGuest',!me);show('accountUser',!!me);show('accountOffline',!cloud.enabled());if(me)$('accountWho').textContent=me.nickname?`${me.nickname} (${me.email})`:me.email;show('accountModBtn',!!me&&isMod());show('accountRole',!!me&&isMod());if(me&&isMod())$('accountRole').textContent=`Twoja rola: ${cloudRole==='admin'?'ADMINISTRATOR':'MODERATOR'}. Panel pokazuje graczy, ich postęp i salda; akcje są sprawdzane po stronie serwera.`;if(!me){cloudRole='player';cloudTitle=null;}const tt=cloud.titles?.[cloudTitle];show('accountTitle',!!me&&!!tt);if(me&&tt){$('accountTitle').textContent=`${tt.name} · ${tt.note}`;$('accountTitle').style.color=tt.color;}
  $('accountModeLogin').setAttribute('aria-pressed',String(accountMode==='login'));$('accountModeRegister').setAttribute('aria-pressed',String(accountMode==='register'));show('accountNicknameLabel',accountMode==='register');$('accountPassword').autocomplete=accountMode==='register'?'new-password':'current-password';$('accountSubmit').innerHTML=accountMode==='register'?'ZAŁÓŻ KONTO <span>↗</span>':'ZALOGUJ <span>↗</span>';$('accountSubmit').disabled=!cloud.enabled();}
 function account(){if(crateBusy||!$('loot').classList.contains('hidden'))return;if(!['menu','result'].includes(screen)){toast('Konto obsłużysz przed następnym pojedynkiem.');return;}closeModal();renderAccount();setAccountStatus('');openModal('account');}
 function adoptCloudSave(save){profile=loot.migrate(save);persist();renderMenuLevel();renderDaily();soundUI();renderAccount();applySecrets();}
 // Hidden packs: codes stored in the profile unlock their content again on every load; a newly entered code adds it.
 async function applySecrets(){const secret=window.MuseumSecret;if(!secret||!profile.secrets?.length)return;const results=await secret.restore(profile.secrets);if(results.length){profile=loot.migrate({...profile,weapons:[...profile.weapons,...results.flatMap(r=>r.items.filter(i=>i.kind==='weapon').map(i=>i.id))]});persist();refreshStores();}}
 async function enterSecret(code){const secret=window.MuseumSecret;const msg=$('secretMsg');if(!secret){msg.textContent='Kody dostępu nie są dostępne w tej przeglądarce.';return;}const r=await secret.unlock(code);
  if(!r.ok){msg.textContent=r.reason==='empty'?'Wpisz kod.':r.reason==='crypto'?'Ta przeglądarka nie obsługuje szyfrowania.':'Nieznany kod.';msg.classList.add('error');return;}
  msg.classList.remove('error');const clean=secret.norm(code);const names=r.items.map(i=>i.name).join(', ');
  if(!profile.secrets.includes(clean))profile=loot.migrate({...profile,secrets:[...profile.secrets,clean],weapons:[...profile.weapons,...r.items.filter(i=>i.kind==='weapon').map(i=>i.id)]});
  persist();refreshStores();updateLoadout();$('secretCode').value='';msg.textContent=r.already?`Ten pakiet jest już odblokowany: ${names}.`:`Odblokowano: ${names}. Znajdziesz je w kolekcji.`;toast(r.already?'Pakiet już odblokowany.':`Odblokowano: ${names}.`);}
 // Maintenance mode: an admin flips one setting; players get a full-screen stop (the game is paused and every panel closed),
 // moderators keep playing behind a red banner. Arrives live over Realtime, with the 15 s poll as backup.
 let maintenance={enabled:false,message:''};
 function applyMaintenance(){const on=!!maintenance.enabled,modPass=on&&isMod()&&cloud.user();show('maintenance',on&&!modPass);show('maintenanceMod',modPass);if(on&&!modPass){$('maintenanceText').textContent=maintenance.message||'Kustosz przestawia eksponaty. Wracamy za chwilę.';$('maintenanceSince').textContent=maintenance.since?`OD ${new Date(maintenance.since).toLocaleString('pl-PL',{dateStyle:'short',timeStyle:'short'})}`:'';if(screen==='fight')pause();document.body.style.overflow='hidden';}else if(!on){document.body.style.overflow=$('loot').classList.contains('hidden')&&![...document.querySelectorAll('.modal:not(.hidden)')].length?'':document.body.style.overflow;}const st=$('modMaintenanceState');if(st){st.textContent=on?`WŁĄCZONY${maintenance.message?` · „${maintenance.message}”`:''}`:'WYŁĄCZONY';st.className=on?'on':'off';}}
 function onMaintenance(value){maintenance=value||{enabled:false,message:''};applyMaintenance();}
 function maintenanceLogin(){document.body.classList.add('maintenance-login');renderAccount();setAccountStatus('Zaloguj się kontem moderatora, żeby wejść mimo serwisu.');show('account');$('accountEmail')?.focus();}
 if(cloud.enabled()&&cloud.announcements)cloud.announcements.onMaintenance(onMaintenance);
 async function setMaintenance(enabled){const r=await cloud.mod.setMaintenance(enabled,$('modMaintenanceText').value.trim());if(!r.ok){modMessage(r.error,true);return;}onMaintenance(r.data);modMessage(enabled?'Tryb serwisowy włączony: gracze widzą ekran serwisowy.':'Tryb serwisowy wyłączony.');}
 // Announcements ticker: active rows (live over Realtime or caught by the poll) take turns flying across the bar above the arena,
 // one pass every few seconds, until each one expires or is withdrawn. Closing the bar hides it until the next new announcement.
 const announceKinds={info:'OGŁOSZENIE',event:'WYDARZENIE',warning:'OSTRZEŻENIE',sponsored:'MATERIAŁ SPONSOROWANY'};
 const ticker={active:new Map(),order:[],index:0,anim:null,timer:null};
 function announceRows(){const now=Date.now();for(const [id,row] of ticker.active)if(new Date(row.expires_at).getTime()<=now)ticker.active.delete(id);return [...ticker.active.values()].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));}
 function onAnnouncement(row,changed){const live=new Date(row.expires_at)>new Date();if(live){const fresh=!ticker.active.has(row.id);ticker.active.set(row.id,row);if(fresh&&!changed){if(['menu','result'].includes(screen))toast(`${announceKinds[row.kind]||'Ogłoszenie'}: ${row.body.slice(0,80)}${row.body.length>80?'…':''}`);ticker.index=Math.max(0,announceRows().indexOf(row));runTicker(true);const b=$('announceBar');b.classList.remove('pulse');void b.offsetWidth;b.classList.add('pulse');}}else ticker.active.delete(row.id);if(!announceRows().length)stopTicker();}
 function stopTicker(){clearTimeout(ticker.timer);ticker.timer=null;if(ticker.anim){ticker.anim.cancel();ticker.anim=null;}if(!$('announceBar').classList.contains('hidden')){show('announceBar',false);fitStage();}}
 function runTicker(now=false){clearTimeout(ticker.timer);ticker.timer=null;const rows=announceRows();if(!rows.length){stopTicker();return;}
  const bar=$('announceBar');if(bar.classList.contains('hidden')){show('announceBar');fitStage();}
  const row=rows[ticker.index%rows.length];ticker.index=(ticker.index+1)%rows.length;
  bar.className=`announce-bar ${row.kind||'info'}${bar.classList.contains('pulse')?' pulse':''}`;$('announceKind').textContent=announceKinds[row.kind]||'OGŁOSZENIE';
  const text=$('announceText');text.textContent=`${row.body}  ·  ${row.author||'kustosz'}`;
  const track=text.parentElement,trackW=track.clientWidth||600,textW=text.scrollWidth||200,duration=Math.max(7000,(trackW+textW)/90*1000);
  if(ticker.anim)ticker.anim.cancel();
  ticker.anim=text.animate([{transform:`translateX(${trackW}px)`},{transform:`translateX(${-textW}px)`}],{duration,easing:'linear'});
  ticker.anim.onfinish=()=>{ticker.anim=null;ticker.timer=setTimeout(()=>runTicker(),announceRows().length?4000:0);};
 }
  setInterval(()=>{if(ticker.active.size&&!announceRows().length)stopTicker();},5000);
 if(cloud.enabled()&&cloud.announcements)cloud.announcements.subscribe(onAnnouncement);
 async function renderAnnouncements(){const root=$('modAnnounceList');if(!root)return;const r=await cloud.announcements.list();if(!r.ok){root.textContent='';return;}const live=(r.data||[]).filter(a=>new Date(a.expires_at)>new Date());root.replaceChildren(...live.map(a=>{const row=document.createElement('div');row.className='mod-announce-item';const kind=document.createElement('small');kind.textContent=announceKinds[a.kind]||a.kind;const body=document.createElement('span');body.textContent=a.body;const meta=document.createElement('small');meta.textContent=`${a.author||''} · do ${new Date(a.expires_at).toLocaleString('pl-PL',{dateStyle:'short',timeStyle:'short'})}`;const btn=document.createElement('button');btn.type='button';btn.textContent='WYCOFAJ';btn.addEventListener('click',async()=>{const x=await cloud.mod.unannounce(a.id);modMessage(x.ok?'Ogłoszenie wycofane.':x.error,!x.ok);renderAnnouncements();});row.append(kind,body,meta,btn);return row;}));if(!live.length){const none=document.createElement('small');none.textContent='Brak aktywnych ogłoszeń.';root.append(none);}}
 // Moderator panel: stats, player list with search, and the actions (coins/balance, ban, reset, role, note). Server-side checks decide.
 const plnText=gr=>(Number(gr||0)/100).toLocaleString('pl-PL',{style:'currency',currency:'PLN'});
 function modMessage(text,error=false){$('modMsg').textContent=text;$('modMsg').classList.toggle('error',!!error);}
 function moderation(){if(crateBusy||!$('loot').classList.contains('hidden'))return;if(!cloud.user()||!isMod()){toast('Panel moderatora wymaga konta z rolą moderatora.');return;}if(!['menu','result'].includes(screen)){toast('Moderacja czeka na koniec pojedynku.');return;}closeModal();openModal('moderation');modMessage('');renderModeration();}
 async function renderModeration(){
  const stats=await cloud.mod.stats();
  $('modStats').textContent=stats.ok?`Graczy: ${stats.data.players} · aktywnych dziś: ${stats.data.active_today} · zbanowanych: ${stats.data.banned} · moderatorów: ${stats.data.mods} · sal pokonanych łącznie: ${stats.data.halls}.`:`Statystyki niedostępne: ${stats.error}`;
  renderAnnouncements();
  const list=await cloud.mod.list($('modQuery').value.trim(),100);
  if(!list.ok){modMessage(list.error,true);$('modList').replaceChildren();return;}
  const me=cloud.user();
  $('modList').replaceChildren(...(list.data||[]).map(p=>{
   const row=document.createElement('div');row.className='mod-row';row.dataset.id=p.id;
   const banned=p.banned_until&&new Date(p.banned_until)>new Date(),perm=banned&&new Date(p.banned_until).getFullYear()-new Date().getFullYear()>50;
   row.innerHTML=`<div><strong></strong><small></small></div><span class="mod-role ${p.role}">${p.role}</span><span>${p.halls_cleared} / ${levels.count}</span><span>${number(p.coins)} ✦</span><span>${plnText(p.balance)}</span><span class="${banned?'mod-banned':'mod-ok'}"></span>`;
   row.querySelector('strong').textContent=p.nickname+(p.id===me?.id?' (ty)':'');if(cloud.titles?.[p.title]){const badge=document.createElement('small');badge.className='rank-title';badge.textContent=cloud.titles[p.title].name;badge.style.color=cloud.titles[p.title].color;row.querySelector('strong').append(badge);}row.querySelector('div>small').textContent=`prestiż ${p.prestige} · ostatnio ${new Date(p.updated_at).toLocaleString('pl-PL')}${p.mod_note?` · notatka: ${p.mod_note}`:''}`;
   row.querySelector('.mod-ok,.mod-banned').textContent=banned?`BAN ${perm?'∞':'do '+new Date(p.banned_until).toLocaleDateString('pl-PL')}${p.ban_reason?' · '+p.ban_reason:''}`:'AKTYWNY';
   const actions=document.createElement('div');actions.className='mod-actions';const self=p.id===me?.id;
   const act=(label,fn,danger=false,disabled=false)=>{const b=document.createElement('button');b.type='button';b.textContent=label;if(danger)b.className='danger';b.disabled=disabled;b.addEventListener('click',async()=>{const r=await fn();if(r===undefined)return;modMessage(r.ok?`${p.nickname}: zrobione.`:r.error||'Nie udało się.',!r.ok);if(r.ok)renderModeration();});actions.append(b);};
   act('ŻETONY ±',()=>{const v=window.prompt(`Zmiana żetonów dla ${p.nickname} (np. 500 albo -500):`,'500');if(v===null||!Number.isFinite(Number(v)))return;return cloud.mod.adjust(p.id,Math.trunc(Number(v)),0);});
   act('SALDO ±',()=>{const v=window.prompt(`Zmiana salda w zł dla ${p.nickname} (np. 50 albo -50):`,'50');if(v===null||!Number.isFinite(Number(v)))return;return cloud.mod.adjust(p.id,0,Math.round(Number(v)*100));});
   act('NOTATKA',()=>{const v=window.prompt(`Notatka moderatora o ${p.nickname}:`,p.mod_note||'');if(v===null)return;return cloud.mod.note(p.id,v);});
   if(banned)act('ODBANUJ',()=>cloud.mod.unban(p.id),false,self);
   else act('BAN',()=>{const h=window.prompt(`Ban dla ${p.nickname}: na ile godzin? (0 = bezterminowo)`,'24');if(h===null||!Number.isFinite(Number(h)))return;const reason=window.prompt('Powód (widoczny dla gracza):','')||'';return cloud.mod.ban(p.id,Math.trunc(Number(h)),reason);},true,self);
   act('RANGA',()=>{const keys=Object.keys(cloud.titles||{});const v=window.prompt(`Ranga dla ${p.nickname}: ${keys.join(', ')} albo puste, żeby zdjąć.`,p.title||(p.id===me?.id?'owner':'first-to-arrive'));if(v===null)return;const t=v.trim();if(t&&!keys.includes(t)){modMessage(`Nieznana ranga. Dostępne: ${keys.join(', ')}.`,true);return;}return cloud.mod.setTitle(p.id,t);});
   act('RESET ZAPISU',()=>{if(!window.confirm(`Wyzerować zapis gry ${p.nickname}? Konto i pseudonim zostają.`))return;return cloud.mod.reset(p.id);},true);
   if(cloudRole==='admin')act('ROLA',()=>{const v=window.prompt(`Nowa rola dla ${p.nickname}: player, moderator albo admin`,p.role);if(v===null)return;if(!['player','moderator','admin'].includes(v.trim())){modMessage('Rola musi być: player, moderator albo admin.',true);return;}return cloud.mod.setRole(p.id,v.trim());},false,self);
   row.append(actions);return row;}));
  if(!(list.data||[]).length)modMessage('Brak graczy pasujących do wyszukiwania.');
 }
 function saveLooksEmpty(save){return !save||typeof save!=='object'||!Object.keys(save).length||(!(save.cleared||[]).length&&(Number(save.coins)||0)<100&&(save.owned||[]).length<=2);}
 function localLooksEmpty(){return !profile.cleared.length&&profile.coins<100&&profile.owned.length<=2;}
 let cloudRole='player',cloudTitle=null;
 const isMod=()=>cloudRole==='moderator'||cloudRole==='admin';
 async function afterLogin(){
  const r=await cloud.fetchProfile();if(!r.ok){setAccountStatus(`Zalogowano, ale nie udało się pobrać profilu: ${r.error}`,true);return;}
  const remote=r.data;cloudRole=remote?.role||'player';cloudTitle=remote?.title||null;renderAccount();document.body.classList.remove('maintenance-login');applyMaintenance();
  if(remote?.banned_until&&new Date(remote.banned_until)>new Date()){const until=new Date(remote.banned_until);const perm=until.getFullYear()-new Date().getFullYear()>50;await cloud.signOut();cloudRole='player';renderAccount();setAccountStatus(`Konto zablokowane ${perm?'bezterminowo':'do '+until.toLocaleString('pl-PL')}${remote.ban_reason?`. Powód: ${remote.ban_reason}`:''}.`,true);return;}
  if(remote&&!saveLooksEmpty(remote.save)&&(localLooksEmpty()||window.confirm('W chmurze jest zapis gry. Wczytać go? Lokalny postęp w tej przeglądarce zostanie nadpisany.'))){adoptCloudSave(remote.save);setAccountStatus('Wczytano zapis z chmury.');}
  else{const push=await pushCloud(true);setAccountStatus(push?.ok?'Lokalny postęp zapisany w chmurze.':`Nie udało się zapisać w chmurze: ${push?.error||''}`,!push?.ok);}
  await claimServerDaily();renderAccount();
 }
 async function claimServerDaily(){
  if(!cloud.user())return;const r=await cloud.claimDaily();if(!r.ok||!r.data||r.data.error)return;
  const d=r.data;if(d.claimed){profile.coins+=d.bonus;profile.login={last:d.today,streak:d.streak};persist();renderDaily();toast(d.reset?`Seria przerwana. Bonus z serwera za dziś: +${d.bonus} ✦.`:`Bonus z serwera za ${d.streak}. dzień z rzędu: +${d.bonus} ✦`);}
  else if(profile.login?.streak!==d.streak){profile.login={last:d.today,streak:d.streak};persist();renderDaily();}
 }
 async function submitAccount(event){
  event.preventDefault();if(!cloud.enabled())return;const email=$('accountEmail').value.trim(),password=$('accountPassword').value,nickname=$('accountNickname').value.trim();
  if(!email||password.length<6){setAccountStatus('Podaj e-mail i hasło (co najmniej 6 znaków).',true);return;}
  $('accountSubmit').disabled=true;setAccountStatus(accountMode==='register'?'Zakładam konto…':'Loguję…');
  try{
   if(accountMode==='register'){
    if(nickname.length<3||nickname.length>20){setAccountStatus('Pseudonim: 3–20 znaków.',true);return;}
    const taken=await cloud.nicknameTaken(nickname);if(taken){setAccountStatus('Ten pseudonim jest zajęty.',true);return;}
    const r=await cloud.signUp(email,password,nickname);if(!r.ok){setAccountStatus(r.error,true);return;}
    if(r.data.confirmEmail){setAccountStatus('Konto założone. Potwierdź e-mail linkiem z wiadomości, potem zaloguj się.');accountMode='login';renderAccount();return;}
    renderAccount();await afterLogin();
   }else{const r=await cloud.signIn(email,password);if(!r.ok){setAccountStatus(r.error,true);return;}renderAccount();await afterLogin();}
  }finally{$('accountSubmit').disabled=!cloud.enabled();}
 }
 function formatNight(seconds){return seconds==null?'—':formatTime(Number(seconds));}
 async function renderRanking(){
  $('rankMsg').textContent=cloud.enabled()?'Pobieram…':'Chmura nie jest skonfigurowana. Ranking pojawi się po podaniu kluczy w dist/config.js.';$('rankList').replaceChildren();if(!cloud.enabled())return;
  const r=await cloud.leaderboard(50);if(!r.ok){$('rankMsg').textContent=`Nie udało się pobrać rankingu: ${r.error}`;return;}
  const rows=Array.isArray(r.data)?r.data:[],me=cloud.user();$('rankMsg').textContent=rows.length?'':'Ranking jest jeszcze pusty. Zaloguj się i przejdź pierwszą salę.';
  $('rankList').replaceChildren(...rows.map((row,i)=>{const li=document.createElement('li');li.className=`rank-row ${me&&row.nickname===me.nickname?'me':''}`;const no=document.createElement('span');no.className='rank-no';no.textContent=String(i+1).padStart(2,'0');const name=document.createElement('strong');name.textContent=row.nickname;const tt=cloud.titles?.[row.title];if(tt){const badge=document.createElement('small');badge.className='rank-title';badge.textContent=tt.name;badge.style.color=tt.color;badge.title=tt.note;name.append(badge);}const halls=document.createElement('span');halls.textContent=`${row.halls_cleared} / ${levels.count}`;const prestige=document.createElement('span');prestige.textContent=String(row.prestige);const time=document.createElement('span');time.textContent=formatNight(row.fastest_night);li.append(no,name,halls,prestige,time);return li;}));
 }
 function ranking(){if(crateBusy||!$('loot').classList.contains('hidden'))return;if(!['menu','result'].includes(screen)){toast('Ranking sprawdzisz przed następnym pojedynkiem.');return;}closeModal();openModal('ranking');renderRanking();}
 function openModal(id){lastFocus=document.activeElement;show(id);$(id).querySelector('button:not(:disabled)')?.focus();document.body.style.overflow='hidden';}
 function closeModal(){if(crateBusy){toast('Skrzynia się otwiera. Za chwilę poznasz swój nowy wygląd.');return;}if(!$('loot').classList.contains('hidden')){claimReward(false);return;}for(const id of ['help','collection','shop','hall','account','ranking','moderation'])show(id,false);document.body.style.overflow='';document.body.classList.remove('maintenance-login');if(maintenance.enabled)applyMaintenance();if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});if(helpWasPlaying){helpWasPlaying=false;resume();}}
 function collection(){if(crateBusy||!$('loot').classList.contains('hidden'))return;if(!['menu','result'].includes(screen)){toast('Wygląd możesz zmienić przed następnym pojedynkiem.');return;}renderSkins();openModal('collection');}
 function canOpenShop(){return !crateBusy&&['menu','result'].includes(screen)&&$('loot').classList.contains('hidden');}
 function shop(){if(!canOpenShop()){toast('Sklep czeka na koniec pojedynku i odbiór nagrody.');return;}closeModal();window.MuseumShop.render(selectedCrateId);openModal('shop');}
 function chooseShopCrate(id){if(!canOpenShop()||!loot.getCrate(id))return;selectedCrateId=id;openCrate();}
 function drawItem(canvas,item){
  const ctx0=canvas.getContext('2d'),d=canvas.width/360;let cardTexts=null;ctx0.setTransform(d,0,0,d,0,0);ctx0.clearRect(0,0,360,360);window.MuseumArt.pixelFrame(ctx0,360,360,ctx=>{
  const g=ctx.createRadialGradient(180,175,15,180,180,230);g.addColorStop(0,loot.rarities[item.rarity].color+'30');g.addColorStop(1,'#10180e');if(canvas.id!=='lootCanvas'){ctx.fillStyle=g;ctx.fillRect(0,0,360,360);}
  const a=window.MuseumArt;if(!a)return;const pix=a.pixelFactor&&window.MuseumPixel?window.MuseumPixel:null;
  if(pix){ctx.save();ctx.setTransform(1,0,0,1,0,0);const sz=Math.round(360/pix.PX);if(item.kind==='weapon')pix.drawWeaponIcon(ctx,weapons.get(item.id),Math.round(sz/2-32),Math.round(sz/2-32),4,{finish:loot.equipped(profile,item)&&profile.finish?profile.finish:null,time:performance.now()/1000});else if(item.kind==='finish')pix.drawWeaponIcon(ctx,weapons.get(profile.weapon)||weapons.get('sword'),Math.round(sz/2-32),Math.round(sz/2-32),4,{finish:item.id,time:performance.now()/1000});else if(item.kind==='card'){cardTexts=[];pix.drawCardArt(ctx,cardsApi.get(item.id),sz,sz,{texts:cardTexts});}else pix.drawKnight(ctx,sz/2,sz-6,{pose:'idle',facing:1,time:0,skin:item.id});ctx.restore();return;}
  if(item.kind==='weapon'){ctx.save();ctx.translate(180,185);ctx.scale(1.05,1.05);a.drawWeaponIcon(ctx,weapons.get(item.id));ctx.restore();}
  else if(item.kind==='finish'){drawFinishVector(ctx,weapons.get(profile.weapon)||weapons.get('sword'),item);}
  else if(item.kind==='card'){a.drawCardArt(ctx,cardsApi.get(item.id),360,360);}
  else{ctx.save();ctx.translate(180,320);ctx.scale(.95,.95);a.drawKnight(ctx,0,0,{pose:'idle',facing:1,time:0,skin:item.id});ctx.restore();}
  });
  if(cardTexts&&cardTexts.length){ctx0.setTransform(d,0,0,d,0,0);window.MuseumPixel.drawTexts(ctx0,cardTexts,window.MuseumPixel.PX);}
 }
 // Vector fallback for finishes: draw the weapon on a layer, tint it source-atop with the finish colours, add a few sparks.
 const finishLayer=document.createElement('canvas');finishLayer.width=finishLayer.height=360;
 function drawFinishVector(ctx,weapon,item){const a=window.MuseumArt,l=finishLayer.getContext('2d');l.setTransform(1,0,0,1,0,0);l.clearRect(0,0,360,360);l.save();l.translate(180,185);l.scale(1.05,1.05);a.drawWeaponIcon(l,weapon);l.restore();const c=item.colors||{};l.save();l.globalCompositeOperation='source-atop';const g=l.createLinearGradient(60,60,300,300);g.addColorStop(0,c.edge||'#fff');g.addColorStop(.5,c.steel||'#ccc');g.addColorStop(1,c.dark||'#333');l.fillStyle=g;l.globalAlpha=.72;l.fillRect(0,0,360,360);l.restore();ctx.drawImage(finishLayer,0,0);ctx.save();ctx.fillStyle=c.edge||'#fff';for(let k=0;k<6;k++){const sx=80+(k*97)%200,sy=70+(k*61)%220;ctx.fillRect(sx,sy,3,3);ctx.fillRect(sx-3,sy+1,9,1);ctx.fillRect(sx+1,sy-3,1,9);}ctx.restore();}
 const drawSkin=drawItem;
 function renderDropContents(target,entries){const rows=entries.map(({item,chance})=>{const row=document.createElement('div'),name=document.createElement('span'),rarity=document.createElement('small'),odds=document.createElement('strong');row.className='drop-row';name.textContent=item.name;rarity.textContent=loot.rarities[item.rarity].name;rarity.style.color=loot.rarities[item.rarity].color;odds.textContent=chance.toLocaleString('pl-PL',{maximumFractionDigits:2})+'%';row.append(name,rarity,odds);return row;});target.replaceChildren(...rows);if(!rows.length){const text=document.createElement('p');text.textContent='Masz już wszystko, co może wypaść z tej skrzyni. Żetony nie zostaną pobrane.';target.append(text);}}
 function itemCount(n,kind){const forms={skin:['strój','stroje','strojów'],weapon:['broń','bronie','broni'],card:['karta','karty','kart'],finish:['wykończenie','wykończenia','wykończeń'],any:['przedmiot','przedmioty','przedmiotów']}[kind]||['przedmiot','przedmioty','przedmiotów'];return `${n} ${n===1?forms[0]:n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?forms[1]:forms[2]}`;}
 function drawCrate(canvas,crate){const ctx=canvas.getContext('2d');if(!ctx||!window.MuseumArt?.drawCrate)return;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);const pix=window.MuseumArt.pixelFactor&&window.MuseumPixel?window.MuseumPixel:null;if(pix){pix.drawCrate(ctx,crate,canvas.width,canvas.height);return;}window.MuseumArt.pixelFrame(ctx,canvas.width,canvas.height,c=>window.MuseumArt.drawCrate(c,crate,canvas.width,canvas.height,{time:1.3}));}
 function equipLabel(item,selected){if(item.kind==='card')return cardsApi.get(item.id)?.type==='hero'?(selected?'● AKTYWNA':'AKTYWUJ KARTĘ ↗'):'✓ DZIAŁA Z BRONIĄ';if(item.kind==='finish')return selected?'● NAŁOŻONE · ZDEJMIJ':'NAŁÓŻ NA BROŃ ↗';return selected?'● WYBRANY':item.kind==='weapon'?'ZAŁÓŻ BROŃ ↗':'WYBIERZ SKIN ↗';}
 function renderSkins(){
  const grid=$('skinGrid');grid.replaceChildren();
  for(const [id,kind] of [['kindSkins','skin'],['kindWeapons','weapon'],['kindCards','card'],['kindFinishes','finish']])$(id).setAttribute('aria-pressed',String(collectionKind===kind));
  show('newSkinsOnly',collectionKind==='skin');$('categoryFilter').disabled=collectionKind==='card'||collectionKind==='finish';
  const matches=matchingItems(),pages=Math.max(1,Math.ceil(matches.length/SKINS_PER_PAGE));collectionPage=Math.max(0,Math.min(collectionPage,pages-1));const page=matches.slice(collectionPage*SKINS_PER_PAGE,(collectionPage+1)*SKINS_PER_PAGE);
  $('skinResultsCount').textContent=matches.length?`${itemCount(matches.length,collectionKind)} · ${collectionPage*SKINS_PER_PAGE+1}–${Math.min((collectionPage+1)*SKINS_PER_PAGE,matches.length)} na stronie`:itemCount(0,collectionKind);
  $('skinPageInfo').textContent=`Strona ${collectionPage+1} / ${pages}`;$('skinPagePrev').disabled=collectionPage===0;$('skinPageNext').disabled=collectionPage>=pages-1;show('skinPagination',matches.length>SKINS_PER_PAGE);show('skinEmpty',!matches.length);$('newSkinsOnly').setAttribute('aria-pressed',String(collectionFilters.newOnly));
  const equippedSkin=skins.find(s=>s.id===profile.skin),equippedWeapon=weapons.get(profile.weapon),equippedCard=cardsApi.get(profile.card);
  $('equippedSkin').textContent=`ZAŁOŻONO: ${equippedSkin.name} · ${equippedWeapon.name}${equippedCard?` · KARTA: ${equippedCard.name}`:' · BEZ KARTY'} · ${perks.get(profile.skin).summary}`;
  const busy=()=>crateBusy||!['menu','result'].includes(screen);
  const ownedTotal=matches.filter(s=>loot.has(profile,s)).length,lockedTotal=matches.length-ownedTotal;
  const divider=(label,count)=>{const d=document.createElement('div');d.className='skin-divider';d.innerHTML=`<span>${label}</span><small>${count}</small>`;return d;};
  let lockedDivider=false;
  if(page.length&&loot.has(profile,page[0])&&lockedTotal)grid.appendChild(divider('ODKRYTE',ownedTotal));
  for(const s of page){
   const owned=loot.has(profile,s),selected=loot.equipped(profile,s),level=loot.upgradeLevel(profile,s.id),cell=document.createElement('div'),b=document.createElement('button');cell.className='skin-cell';
   if(!owned&&!lockedDivider){lockedDivider=true;if(ownedTotal||lockedTotal)grid.appendChild(divider('ZABLOKOWANE',lockedTotal));}
   b.className=`skin-card ${selected?'selected':''} ${owned?'':'locked'}`;b.dataset.rarity=s.rarity;b.dataset.skinId=s.id;b.dataset.category=s.categoryId;b.style.setProperty('--rarity',loot.rarities[s.rarity].color);b.setAttribute('aria-pressed',String(selected));b.setAttribute('aria-label',`${s.name}. ${loot.getCategory(s.categoryId)?.name||''}. ${itemSummary(s)}${owned?(selected?' — wybrany':' — wybierz'):' — do odkrycia'}`);
   const badge=s.number?`<span class="skin-number">${String(s.number).padStart(2,'0')} / 50</span>`:s.gift?'<span class="skin-number">★ SPECJALNY</span>':level?`<span class="skin-number">ULEPSZENIE +${level}</span>`:'';
   const lockSvg='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 7V5a4 4 0 0 1 8 0v2h1v8H3V7h1Zm2 0h4V5a2 2 0 0 0-4 0v2Zm1 4v2h2v-2H7Z" fill="currentColor"/></svg>';
   if(owned)b.innerHTML=`${badge}<canvas width="360" height="360" aria-hidden="true"></canvas><small>${s.era}</small><strong>${s.name}</strong><span class="skin-category"></span><span class="skin-perk"><strong></strong><span></span></span><span class="skin-state">${equipLabel(s,selected)}</span>`;
   else{b.innerHTML=`<span class="skin-number">${loot.rarities[s.rarity].name}</span><span class="skin-art"><canvas width="360" height="360" aria-hidden="true"></canvas><span class="skin-lock">${lockSvg}<span>ZABLOKOWANE</span></span></span><small>NIEODKRYTY EKSPONAT</small><strong>? ? ?</strong><span class="skin-category"></span><span class="skin-perk"><strong>${loot.rarities[s.rarity].name}</strong><span>Wypada ze skrzyni. Otwórz ją w sklepie.</span></span><span class="skin-state">${lockSvg} ZABLOKOWANE</span>`;b.setAttribute('aria-label',`Zablokowany ${s.kind==='skin'?'strój':s.kind==='weapon'?'broń':s.kind==='card'?'karta':'wykończenie'}, ${loot.rarities[s.rarity].name.toLowerCase()}, ${loot.getCategory(s.categoryId)?.name||''}. Wypada ze skrzyni w sklepie.`);}
   b.querySelector('.skin-category').textContent=loot.getCategory(s.categoryId)?.name||'';
   if(owned){const perkTitle=s.kind==='skin'?perks.get(s.id).title:s.kind==='card'?cardsApi.get(s.id).era:s.kind==='finish'?`${s.era} · WARTOŚĆ ${new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',maximumFractionDigits:0}).format(s.pricePLN||0)}`:(s.typeName||s.era),perkSummary=s.kind==='skin'?perks.get(s.id).summary:s.summary;
   b.querySelector('.skin-perk strong').textContent=perkTitle;b.querySelector('.skin-perk span').textContent=level&&s.kind!=='card'?`${perkSummary} · ${loot.upgradeEffect(s,level)}`:perkSummary;}
   b.addEventListener('click',()=>{if(busy())return;if(!owned){const from=loot.crates.filter(c=>loot.remaining(profile,c.id).some(i=>i.id===s.id)).map(c=>c.name);$('collectionMessage').textContent=from.length?`Zablokowane. Wypada z: ${from.slice(0,3).join(', ')}${from.length>3?` i ${from.length-3} innych`:''}. Skrzynie otwierasz w sklepie.`:'Zablokowane. Ten eksponat nie wypada obecnie z żadnej skrzyni.';return;}const next=loot.equip(profile,s.id);if(!next){$('collectionMessage').textContent=`${s.name} działa automatycznie, kiedy masz założoną pasującą broń.`;return;}profile=next;persist();renderSkins();$('collectionMessage').textContent=s.kind==='card'&&profile.card!==s.id?`Karta ${s.name} odłożona.`:`Wybrano ${s.name}. ${itemSummary(s)}`;});
   cell.append(b);
   if(owned&&(s.kind!=='card')){
    const actions=document.createElement('div');actions.className='skin-actions';
    const cost=loot.upgradeCost(level),up=document.createElement('button');up.type='button';up.className='skin-action';up.disabled=cost===null||profile.coins<cost;up.textContent=cost===null?`MAKS. +${level}`:`ULEPSZ +${level+1} · ${number(cost)} ✦`;up.title=cost===null?'Maksymalny poziom ulepszenia.':`${s.kind==='skin'?'+6 maks. HP':'+8% obrażeń'} za poziom.`;
    up.addEventListener('click',()=>{if(busy())return;const result=loot.upgrade(profile,s.id);if(!result){toast(`Brakuje żetonów na ulepszenie. Koszt: ${number(cost)} ✦.`);return;}profile=result.profile;persist();renderSkins();toast(`${s.name} ulepszono do +${result.level}: ${loot.upgradeEffect(s,result.level)}.`);});
    if(s.kind!=='finish')actions.append(up);
    if(s.kind==='finish'){const cash=loot.sellPricePLN(s),sellable=loot.canSell(profile,s.id),sell=document.createElement('button');sell.type='button';sell.className='skin-action sell';sell.disabled=!sellable;sell.textContent=`SPRZEDAJ · ${pln(cash)}`;sell.title=selected?'Zdejmij wykończenie, żeby je sprzedać.':`Cena ${pln(loot.pricePLN(s))}, odkup przez muzeum za 75%.`;
     sell.addEventListener('click',()=>{if(busy()||!loot.canSell(profile,s.id))return;if(!window.confirm(`Sprzedać ${s.name} za ${pln(cash)} na saldo?`))return;const result=loot.sellFinish(profile,s.id);if(!result)return;profile=result.profile;persist();renderSkins();toast(`Sprzedano ${result.item.name} za ${pln(result.price)}. Saldo: ${pln(profile.balance)}.`);});
     actions.append(sell);cell.append(actions);}
    else{const price=loot.sellPrice(s),sellable=loot.canSell(profile,s.id),sell=document.createElement('button');sell.type='button';sell.className='skin-action sell';sell.disabled=!sellable;sell.textContent=price?`SPRZEDAJ · ${number(price)} ✦`:'NIE NA SPRZEDAŻ';sell.title=selected?'Zdejmij przedmiot, żeby go sprzedać.':price?`Wartość ${number(loot.value(s))} ✦, sprzedaż za 40%.`:'Przedmiotów podstawowych i prezentów nie da się sprzedać.';
    sell.addEventListener('click',()=>{if(busy()||!loot.canSell(profile,s.id))return;if(!window.confirm(`Sprzedać ${s.name} za ${number(price)} ✦? Ulepszenia przepadną.`))return;const result=loot.sell(profile,s.id);if(!result)return;profile=result.profile;persist();renderSkins();toast(`Sprzedano ${result.item.name} za ${number(result.price)} ✦.`);});
    actions.append(sell);cell.append(actions);}
   }
   grid.appendChild(cell);drawItem(b.querySelector('canvas'),s);
  }
  const kindItems=loot.items.filter(i=>i.kind===collectionKind);$('collectionCount').textContent=`${kindItems.filter(i=>loot.has(profile,i)).length} / ${kindItems.length} ODKRYTYCH`;
 }
 function setLootBusy(value){crateBusy=value;document.querySelectorAll('.close-modal').forEach(b=>b.disabled=value);$('startBtn').disabled=value;$('retryBtn').disabled=value;}
 function showLoot(){
  lootReturnFocus=document.activeElement;for(const id of ['collection','shop'])if(!$(id).classList.contains('hidden'))$(id).inert=true;show('loot');$('lootPanel').setAttribute('tabindex','-1');$('lootPanel').focus({preventScroll:true});document.body.style.overflow='hidden';
 }
 function revealReward(recovered=false){
  const s=loot.getItem(profile.pendingReward);if(!s)return;
  if(recovered)window.MuseumLootShow.cancel();setLootBusy(false);delete $('lootPanel').dataset.lootPhase;$('lootPanel').classList.remove('is-rolling');$('lootPanel').classList.add('is-revealed');$('lootPanel').dataset.rarity=s.rarity;$('lootPanel').style.setProperty('--rarity',loot.rarities[s.rarity].color);
  $('lootEyebrow').textContent=recovered?'TWOJA SKRZYNIA NIE PRZEPADŁA':'PIECZĘĆ ZERWANA / NOWE ODKRYCIE';$('lootTitle').textContent='NOWY EKSPONAT.';$('lootSubtitle').textContent=recovered?'Odzyskano odkryty wygląd. Czeka bezpiecznie w twojej kolekcji.':'Ten wygląd już należy do ciebie. Załóż go na kolejny pojedynek.';
  show('lootWindow',false);show('lootSuspense',false);show('lootReward');show('lootActions');$('lootRarity').textContent=loot.rarities[s.rarity].name;$('lootName').textContent=s.name;$('lootEra').textContent=s.era;$('lootPerk').textContent=itemSummary(s);drawItem($('lootCanvas'),s);const weaponCard=s.kind==='card'&&cardsApi.get(s.id)?.type==='weapon';show('lootEquipBtn',!weaponCard);$('lootEquipBtn').innerHTML=s.kind==='weapon'?'ZAŁÓŻ BROŃ <span>↗</span>':s.kind==='card'?'AKTYWUJ KARTĘ <span>↗</span>':s.kind==='finish'?'NAŁÓŻ NA BROŃ <span>↗</span>':'ZAŁÓŻ SKIN <span>↗</span>';(weaponCard?$('lootKeepBtn'):$('lootEquipBtn')).focus({preventScroll:true});refreshStores();updateAgainBtn();
 }
 function claimReward(equip){
  if(crateBusy||!['menu','result'].includes(screen))return;
  if(profile.pendingReward){profile=loot.claim(profile,{equip});persist();}
  show('loot',false);$('collection').inert=false;$('shop').inert=false;refreshStores();const host=['shop','collection'].find(id=>!$(id).classList.contains('hidden'));if(lootReturnFocus?.isConnected&&lootReturnFocus!==document.body&&!lootReturnFocus.disabled)lootReturnFocus.focus({preventScroll:true});else if(host)$(host).querySelector('button:not(:disabled)')?.focus({preventScroll:true});
  $('collectionMessage').textContent=equip?`Założono. ${updateLoadout()||$('loadoutPerk').textContent}`:'Nowy przedmiot zachowany w kolekcji. Możesz go założyć przed walką.';
 }
 // "Open again": keeps the reward in the collection and rolls the same crate without leaving the loot window.
 function updateAgainBtn(){
  const btn=$('lootAgainBtn'),crate=loot.getCrate(profile.pendingCrateId||selectedCrateId);if(!btn||!crate)return;
  const after=profile.pendingReward?loot.claim(profile,{equip:false}):profile;const left=loot.remaining(after,crate.id).length,free=crate.id==='gallery'&&after.freeCrates>0,cost=free?0:crate.cost;
  btn.disabled=!left||(!free&&after.coins<cost);
  btn.innerHTML=!left?'SKRZYNIA WYCZERPANA':free?'OTWÓRZ PONOWNIE · GRATIS <span>↻</span>':after.coins<cost?`OTWÓRZ PONOWNIE · BRAKUJE ${number(cost-after.coins)} ✦`:`OTWÓRZ PONOWNIE · ${number(cost)} ✦ <span>↻</span>`;
  btn.title=!left?'Zebrano wszystko z tej skrzyni.':`${crate.name}: ${crate.guarantee}.`;
 }
 function openAgain(){
  if(crateBusy||!['menu','result'].includes(screen)||!profile.pendingReward)return;
  const crate=loot.getCrate(profile.pendingCrateId||selectedCrateId);if(!crate)return;selectedCrateId=crate.id;
  const keepFocus=lootReturnFocus;profile=loot.claim(profile,{equip:false});persist();
  if(!loot.remaining(profile,crate.id).length){toast('Zebrano wszystko z tej skrzyni.');updateAgainBtn();renderSkins();return;}
  openCrate();lootReturnFocus=keepFocus;
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
   const s=i===winner?reservation.reward:loot.draw(profile,Math.random,reservation.crate.id)||reservation.reward,card=document.createElement('div');card.className='loot-card';card.dataset.rarity=s.rarity;card.style.setProperty('--rarity',loot.rarities[s.rarity].color);card.innerHTML=`<canvas width="240" height="240" aria-hidden="true"></canvas><small>${loot.rarities[s.rarity].name}</small><strong>${s.name}</strong>`;reel.appendChild(card);drawItem(card.querySelector('canvas'),s);cards.push(card);
  }
  window.MuseumLootShow.start({reel,viewport:$('lootWindow'),cards,winner,isSoundEnabled:()=>profile.sound,onReveal:()=>{if(token===rollToken)revealReward();}});
 }
 function changeCollectionFilter(){if(crateBusy||!['menu','result'].includes(screen))return;collectionFilters.search=$('skinSearch').value;collectionFilters.category=$('categoryFilter').value;collectionFilters.rarity=$('rarityFilter').value;collectionFilters.ownership=$('ownershipFilter').value;collectionPage=0;renderSkins();}
 for(const [id,kind] of [['kindSkins','skin'],['kindWeapons','weapon'],['kindCards','card'],['kindFinishes','finish']])$(id).addEventListener('click',()=>{if(crateBusy||!['menu','result'].includes(screen))return;collectionKind=kind;collectionPage=0;collectionFilters.newOnly=false;renderSkins();});
 for(const category of [{id:'all',name:'Wszystkie kategorie'},...loot.categories]){const option=document.createElement('option');option.value=category.id;option.textContent=category.name;$('categoryFilter').append(option);}
 $('categoryFilter').value='all';
 window.MuseumShop.mount({getProfile:()=>profile,canOpen:canOpenShop,onOpenWithTokens:chooseShopCrate,onBuyFinish:buyFinish,notify:toast});
 $('secretForm').addEventListener('submit',event=>{event.preventDefault();enterSecret($('secretCode').value);});
 $('shopTab').addEventListener('click',shop);$('hallTab').addEventListener('click',hall);$('rankTab').addEventListener('click',ranking);$('rankRefresh').addEventListener('click',renderRanking);$('accountBtn').addEventListener('click',account);$('accountModBtn').addEventListener('click',moderation);$('modRefresh').addEventListener('click',renderModeration);$('modSearch').addEventListener('submit',e=>{e.preventDefault();renderModeration();});$('modMaintenanceOn').addEventListener('click',()=>{if(!window.confirm('Włączyć tryb serwisowy? Wszyscy gracze poza moderatorami zobaczą ekran serwisowy i nie zagrają.'))return;setMaintenance(true);});$('modMaintenanceOff').addEventListener('click',()=>setMaintenance(false));$('maintenanceLoginBtn').addEventListener('click',maintenanceLogin);$('modAnnounce').addEventListener('submit',async e=>{e.preventDefault();const body=$('modAnnounceText').value.trim();if(!body){modMessage('Wpisz treść ogłoszenia.',true);return;}const r=await cloud.mod.announce(body,$('modAnnounceKind').value,Number($('modAnnounceSeconds').value)||60);if(!r.ok){modMessage(r.error,true);return;}$('modAnnounceText').value='';modMessage('Ogłoszenie wysłane do wszystkich graczy.');renderAnnouncements();});$('accountForm').addEventListener('submit',submitAccount);$('accountModeLogin').addEventListener('click',()=>{accountMode='login';renderAccount();setAccountStatus('');});$('accountModeRegister').addEventListener('click',()=>{accountMode='register';renderAccount();setAccountStatus('');});$('accountLogout').addEventListener('click',async()=>{await pushCloud(true);await cloud.signOut();renderAccount();setAccountStatus('Wylogowano. Grasz dalej jako gość na lokalnym zapisie.');});$('accountPush').addEventListener('click',async()=>{const r=await pushCloud(true);setAccountStatus(r?.ok?'Zapisano w chmurze.':`Nie udało się: ${r?.error||''}`,!r?.ok);});$('accountPull').addEventListener('click',async()=>{const r=await cloud.fetchProfile();if(!r.ok||!r.data){setAccountStatus(r.error||'Brak zapisu w chmurze.',true);return;}if(saveLooksEmpty(r.data.save)){setAccountStatus('W chmurze nie ma jeszcze zapisu.',true);return;}if(!window.confirm('Nadpisać lokalny postęp zapisem z chmury?'))return;adoptCloudSave(r.data.save);setAccountStatus('Wczytano zapis z chmury.');});$('hallName').addEventListener('change',()=>{profile=hallApi.rename(profile,$('hallName').value);persist();renderHall();toast(`Sala nazywa się teraz: ${profile.hall.name}.`);});
 $('skinSearch').addEventListener('input',changeCollectionFilter);$('categoryFilter').addEventListener('change',changeCollectionFilter);$('rarityFilter').addEventListener('change',changeCollectionFilter);$('ownershipFilter').addEventListener('change',changeCollectionFilter);
 $('newSkinsOnly').addEventListener('click',()=>{if(crateBusy||!['menu','result'].includes(screen))return;collectionFilters.newOnly=!collectionFilters.newOnly;collectionPage=0;renderSkins();});
 $('resetSkinFilters').addEventListener('click',()=>{if(crateBusy||!['menu','result'].includes(screen))return;collectionFilters.newOnly=false;$('skinSearch').value='';$('categoryFilter').value='all';$('rarityFilter').value='all';$('ownershipFilter').value='all';changeCollectionFilter();});
 $('skinPagePrev').addEventListener('click',()=>{if(crateBusy||!['menu','result'].includes(screen)||collectionPage<=0)return;collectionPage--;renderSkins();$('skinResultsCount').scrollIntoView({block:'nearest'});});
 $('skinPageNext').addEventListener('click',()=>{if(crateBusy||!['menu','result'].includes(screen)||collectionPage>=Math.ceil(matchingSkins().length/SKINS_PER_PAGE)-1)return;collectionPage++;renderSkins();$('skinResultsCount').scrollIntoView({block:'nearest'});});
 $('startBtn').addEventListener('click',beginNight);$('retryBtn').addEventListener('click',beginNight);$('menuBtn').addEventListener('click',menu);$('nextBtn').addEventListener('click',chooseNext);$('choiceMenuBtn').addEventListener('click',chooseMenu);$('pauseBtn').addEventListener('click',pause);$('resumeBtn').addEventListener('click',resume);$('collectionTab').addEventListener('click',collection);$('lootEquipBtn').addEventListener('click',()=>claimReward(true));$('lootAgainBtn').addEventListener('click',openAgain);$('lootKeepBtn').addEventListener('click',()=>claimReward(false));
 $('arenaTab').addEventListener('click',()=>{if(screen==='menu')$('gameFrame').scrollIntoView({behavior:'smooth',block:'center'});});
 document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();if(screen==='menu')window.scrollTo({top:0,behavior:'smooth'});});
 $('soundBtn').addEventListener('click',()=>{profile.sound=!profile.sound;persist();soundUI();toast(profile.sound?'Dźwięk włączony. Muzeum już nie śpi.':'Dźwięk wyłączony.');});
 $('helpBtn').addEventListener('click',()=>{if(crateBusy||!$('loot').classList.contains('hidden'))return;if(['intro','card','timejump','ending','ko','choice'].includes(screen)){toast('Historia trwa. Instrukcja będzie dostępna po scenie.');return;}helpWasPlaying=screen==='fight';if(helpWasPlaying)pause();openModal('help');});
 $('helpClose').addEventListener('click',closeModal);document.querySelectorAll('.close-modal').forEach(b=>b.addEventListener('click',closeModal));document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal();}));
 document.addEventListener('keydown',e=>{const modals=[...document.querySelectorAll('.modal:not(.hidden)')],modal=modals.find(m=>m.id==='loot')||modals.at(-1);if(modal){if(e.key==='Escape'){e.preventDefault();closeModal();}if(e.key==='Tab'){const buttons=[...modal.querySelectorAll('button:not(:disabled)')].filter(b=>b.getClientRects().length);const first=buttons[0],last=buttons.at(-1);if(!first){e.preventDefault();$('lootPanel').focus();}else if(e.shiftKey&&(document.activeElement===first||!modal.contains(document.activeElement))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||!modal.contains(document.activeElement))){e.preventDefault();first.focus();}}return;}if(screen==='choice'&&(e.key==='Enter'||e.key==='Escape')){e.preventDefault();if(e.key==='Enter')chooseNext();else chooseMenu();return;}if(e.key==='Escape'){e.preventDefault();if(screen==='fight')pause();else if(screen==='paused')resume();}});
 document.addEventListener('visibilitychange',()=>{frameTime=0;if(document.hidden&&screen==='fight')pause();});
 window.addEventListener('blur',()=>{if(screen==='fight')pause();frameTime=0;});
 function renderScene(time){const c=$('arena'),ctx0=c.getContext('2d'),a=window.MuseumArt;if(!ctx0||!a)return;const d=c.width/1440;ctx0.setTransform(d,0,0,d,0,0);ctx0.clearRect(0,0,1440,810);const sceneTexts=[];a.pixelFrame(ctx0,1440,810,ctx=>{ctx.save();
  const level=night?levels.get(night.levelId):currentLevel(),exhibit=levelExhibit(level),big=exhibit.stats.art==='rex';
  const pix=a.pixelFactor&&window.MuseumPixel?window.MuseumPixel:null;const inPixels=fn=>{ctx.save();ctx.setTransform(1,0,0,1,0,0);fn();ctx.restore();};
  const arena=(theme)=>pix?inPixels(()=>pix.drawArena(ctx,time,theme,{texts:sceneTexts})):a.drawArena(ctx,1440,810,time,theme);
  const knight=(x,o)=>pix?inPixels(()=>pix.drawKnight(ctx,x/pix.PX,pix.FLOOR,{...o,skin:profile.skin,weapon:profile.weapon,finish:profile.finish||null})):a.drawKnight(ctx,x,665,{...o,skin:profile.skin});
  const drawFoe=(x,o)=>{const art=exhibit.stats.art;if(pix&&(art==='rex'||art==='raptor')){inPixels(()=>pix.drawRex(ctx,x/pix.PX,pix.FLOOR,{...o,skin:art==='raptor'?'raptor':null,scale:art==='raptor'?.9:1.4}));return;}if(pix&&art==='figure'){inPixels(()=>pix.drawFigure(ctx,x/pix.PX,pix.FLOOR,{...o,figure:exhibit.stats.figure}));return;}ctx.save();ctx.translate(x,665);if(big)ctx.scale(1.18,1.18);a.drawExhibit(ctx,exhibit,0,0,o);ctx.restore();};
  if(screen==='menu'){arena(level.theme);knight(325,{pose:'idle',facing:1,time});drawFoe(big?1085:1040,{pose:'idle',facing:-1,time});}
  else if(screen==='intro'){if(introTime<6&&a.drawGuardScene){if(pix)inPixels(()=>pix.drawGuardRoom(ctx,time,{awake:false}));else a.drawGuardScene(ctx,1440,810,time);}else{arena(level.theme);const awake=Math.min(1,Math.max(0,(introTime-6)/3));drawFoe(big?1055:1030,{pose:introTime<11?'guard':'idle',facing:-1,time,phase:awake,glow:introTime<11});knight(365,{pose:introTime<12?'idle':'guard',facing:1,time});ctx.fillStyle=`rgba(0,8,5,${Math.max(0,.65-awake*.65)})`;ctx.fillRect(0,0,1440,810);}const boundary=[0,6,12].some(t=>introTime>=t&&introTime<t+.6);if(boundary){const at=introTime%6;ctx.fillStyle=`rgba(4,9,6,${1-at/.6})`;ctx.fillRect(0,0,1440,810);}}
  else if(screen==='card'){arena(level.theme);const awake=Math.min(1,cardTime/totalCard);drawFoe(big?1055:1030,{pose:cardTime<totalCard*.6?'guard':'idle',facing:-1,time,phase:awake,glow:cardTime<totalCard*.6});knight(365,{pose:'guard',facing:1,time});ctx.fillStyle=`rgba(0,4,8,${Math.max(0,.7-awake*.7)})`;ctx.fillRect(0,0,1440,810);}
  else if(screen==='timejump'){const k=Math.min(1,jumpTime/totalJump);const from=jumpFrom,to=jumpTo;if(k<.5){arena(from.theme);}else{arena(to.theme);const awake=Math.min(1,(k-.5)/.4);drawFoe(big?1055:1030,{pose:'guard',facing:-1,time,phase:awake,glow:true});knight(365,{pose:'guard',facing:1,time});}
   // Rushing light streaks sell the jump; the swap hides behind the brightest frame.
   const burst=Math.sin(k*Math.PI);ctx.save();ctx.globalCompositeOperation='screen';for(let i=0;i<26;i++){const y=60+((i*131+time*900*(1+i%4))%720),len=120+burst*520+(i%5)*40;ctx.fillStyle=`rgba(255,236,180,${.04+burst*.16})`;ctx.fillRect((i*197+time*1800)%1900-400,y,len,2+(i%3));}ctx.restore();
   ctx.fillStyle=`rgba(255,244,214,${Math.pow(burst,6)*.9})`;ctx.fillRect(0,0,1440,810);ctx.fillStyle=`rgba(0,0,0,${.35*(1-Math.abs(k-.5)*2)})`;ctx.fillRect(0,0,1440,810);}
  else if(screen==='ending'||screen==='result'){if(pix)inPixels(()=>pix.drawGuardRoom(ctx,time,{awake:endingTime>3}));else if(a.drawGuardScene)a.drawGuardScene(ctx,1440,810,time,{awake:endingTime>3});else arena(level.theme);ctx.fillStyle='#08110a65';ctx.fillRect(0,0,1440,810);if(endingTime<3){ctx.fillStyle=`rgba(0,0,0,${Math.max(0,1-(endingTime-1.8)/1.2)})`;ctx.fillRect(0,0,1440,810);}}ctx.restore();});if(sceneTexts.length&&window.MuseumPixel){ctx0.setTransform(d,0,0,d,0,0);window.MuseumPixel.drawTexts(ctx0,sceneTexts,window.MuseumPixel.PX);}}
 function loop(now){const dt=frameTime?Math.min(.1,(now-frameTime)/1000):0;frameTime=now;if(!document.hidden){
   if(screen==='intro'){introTime=Math.min(totalIntro,introTime+dt);updateIntro();if(introTime>=totalIntro)startFight();}
   else if(screen==='card'){cardTime=Math.min(totalCard,cardTime+dt);$('cardProgress').style.width=(cardTime/totalCard*100)+'%';if(cardTime>=totalCard)startFight();}
   else if(screen==='timejump'){jumpTime=Math.min(totalJump,jumpTime+dt);updateTimeJump();if(jumpTime>=totalJump)startFight();}
   else if(screen==='ko'){endingTime+=dt;if(endingTime>=1.8){const level=levels.get(night.levelId),next=endData?.win?levels.next(level.id):null;if(next)showChoice(level,next);else startEnding();}}
   else if(screen==='ending'){endingTime+=dt;if(endingTime>=7.8)revealResults();}
   if(['menu','intro','card','timejump','ending','result'].includes(screen))renderScene(now/1000);}requestAnimationFrame(loop);}
 const daily=cloud.user()?null:loot.dailyBonus(profile);if(daily){profile=daily.profile;}
 function renderDaily(){const streak=profile.login?.streak||0;$('dailyLine').textContent=streak?`SERIA LOGOWAŃ: ${streak} ${streak===1?'DZIEŃ':'DNI'} · JUTRO +${Math.min(300,50+streak*25)} ✦`:'';show('dailyLine',streak>0);}
 persist();pixelUI();soundUI();renderMenuLevel();renderDaily();stageState();window.MuseumGame?.setScene('external');applySecrets();if(daily)setTimeout(()=>toast(daily.reset?`Seria przerwana. Bonus za dziś: +${daily.bonus} ✦. Wracaj jutro, seria rośnie.`:`Bonus za ${daily.streak}. dzień z rzędu: +${daily.bonus} ✦`),600);
 // Fit the stage to the window: the frame shrinks to the free height (top bar + section line + controls take --chrome),
 // and the in-frame UI zooms by the ratio of the frame to the full content width, so nothing is ever clipped.
 function fitStage(){const frame=$('gameFrame'),parent=frame.parentElement;if(!frame||!parent)return;const top=frame.getBoundingClientRect().top+window.scrollY,under=document.querySelector('.understage')?.getBoundingClientRect().height||0;document.documentElement.style.setProperty('--chrome',`${Math.round(top+under+18)}px`);const z=Math.min(1,frame.clientWidth/Math.max(1,parent.clientWidth));frame.style.setProperty('--ui-zoom',z.toFixed(4));}
 fitStage();window.addEventListener('resize',fitStage);window.addEventListener('orientationchange',fitStage);if(document.fonts?.ready)document.fonts.ready.then(fitStage);setTimeout(fitStage,300);
 // Boot sequence: studio card → title with the seal → login / guest. Click or Esc skips to the choice; a restored session skips the choice.
 const boot={timers:[],done:false,restored:null};
 function bootShow(id){for(const s of ['bootStudio','bootTitle','bootLogin'])show(s,s===id);}
 function bootLeave(id,next,after){const el=$(id);el.classList.add('leave');boot.timers.push(setTimeout(()=>{el.classList.remove('leave');bootShow(next);if(after)after();},480));}
 function bootChoice(){boot.timers.forEach(clearTimeout);boot.timers=[];if(boot.done)return;const me=cloud.user();show('bootSkip',false);
  if(me){$('bootHello').textContent=`WITAJ, ${(me.nickname||me.email).toLocaleUpperCase('pl-PL')}.`;$('bootLead').textContent='Sesja przywrócona. Postęp zapisuje się w chmurze po każdej zmianie.';show('bootEnterBtn');$('bootEnterBtn').focus();for(const b of ['bootLoginBtn','bootRegisterBtn','bootGuestBtn'])show(b,false);}
  else if(!cloud.enabled()){$('bootLead').textContent='Chmura nie jest skonfigurowana, dziś gra tylko jako gość.';show('bootLoginBtn',false);show('bootRegisterBtn',false);}
  bootShow('bootLogin');}
 function bootEnd(){if(boot.done)return;boot.done=true;boot.timers.forEach(clearTimeout);const el=$('boot');el.classList.add('out');document.body.classList.remove('booting');setTimeout(()=>show('boot',false),800);fitStage();}
 function bootStart(){document.body.classList.add('booting');const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;if(reduced){bootChoice();return;}
  bootShow('bootStudio');boot.timers.push(setTimeout(()=>bootLeave('bootStudio','bootTitle'),2300));boot.timers.push(setTimeout(()=>bootLeave('bootTitle','bootLogin',bootChoice),5600));}
 $('bootSkip').addEventListener('click',bootChoice);$('bootStudio').addEventListener('click',bootChoice);$('bootTitle').addEventListener('click',bootChoice);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!boot.done&&!$('bootLogin').classList.contains('hidden')===false)bootChoice();},true);
 $('bootGuestBtn').addEventListener('click',bootEnd);$('bootEnterBtn').addEventListener('click',bootEnd);
 $('bootLoginBtn').addEventListener('click',()=>{bootEnd();accountMode='login';setTimeout(()=>account(),250);});
 $('bootRegisterBtn').addEventListener('click',()=>{bootEnd();accountMode='register';setTimeout(()=>account(),250);});
 bootStart();
 renderAccount();cloud.restore().then(async me=>{renderAccount();boot.restored=me;if(me&&!boot.done&&!$('bootLogin').classList.contains('hidden'))bootChoice();if(me){const r=await cloud.fetchProfile();if(r.ok&&r.data){cloudRole=r.data.role||'player';cloudTitle=r.data.title||null;renderAccount();applyMaintenance();}await claimServerDaily();}});if(profile.pendingReward){renderSkins();openModal('collection');showLoot();revealReward(true);}requestAnimationFrame(loop);
})();
