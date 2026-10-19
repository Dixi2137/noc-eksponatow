#!/usr/bin/env node
'use strict';
/* Comparative gameplay checks: use normal controls and frame stepping after arranging encounters. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHarness}=require('./qa-game.cjs');
const {createUI,DIST}=require('./qa-perks-harness.cjs');
const results=[],report={};
const close=(a,b,message='')=>assert.ok(Math.abs(a-b)<1e-7,`${message}: expected ${b}, got ${a}`);
const plain=x=>JSON.parse(JSON.stringify(x));
function test(name,fn){try{fn();results.push({name,pass:true});console.log('PASS:',name);}catch(e){results.push({name,pass:false,error:e.message});console.error('FAIL:',name,'\n ',e.stack);}}
function setup(skin='brass',testMode=true){const h=createHarness(path.join(DIST,'game.js'),{testMode,preload:[path.join(DIST,'perks.js')]});const g=h.window.MuseumGame;g.start({skin,sound:false});return{...h,g,t:g._test};}
function strike(skin,{guard=false,age=.5,heavy=false,hp=70,stamina=100,attack=0}={}){
 const h=setup(skin);h.t.setState({elapsed:1,player:{x:365,hp,stamina,attack,evade:0},rex:{x:730,state:'strike',timer:.16,attackTargetX:365,heavy,attackDone:false}});
 if(guard){h.key('KeyK',true);h.t.setState({player:{guardSince:1-age}});}
 h.t.step(.03);return{...h,s:h.g.getState()};
}
function hitRecover(skin,combo=0){const h=setup(skin);h.t.setState({combo,player:{x:365},rex:{x:730,state:'recover',timer:0}});h.key('KeyJ',true);h.t.step(.16);return h.g.getState();}
function regenerate(skin,mode){const h=setup(skin);h.t.setState({player:{stamina:40,attack:mode==='attack'?5:0},rex:{state:'recover',timer:-100}});if(mode==='guard')h.key('KeyK',true);h.t.step(1);return h.g.getState().player.stamina;}

test('Seven named benefits share a read-only registry; unknown skins use the brass fallback',()=>{
 const h=setup(),P=h.window.MuseumPerks,all=P.all();assert.equal(all.length,7);assert.equal(new Set(all.map(p=>p.id)).size,7);for(const p of all){assert.ok(p.title&&p.summary&&p.details.length);assert.ok(Object.isFrozen(p)&&Object.isFrozen(p.stats));}
 const unknown=setup('does-not-exist').g.getState();assert.equal(unknown.skin,'brass');assert.equal(unknown.player.hp,140);assert.equal(P.get('unknown').id,'brass');assert.equal(P.get(null).id,'brass');
 report.perks=all.map(p=>({id:p.id,title:p.title,summary:p.summary}));
});
test('Brass adds 20 maximum and starting HP; each other skin starts with 120',()=>{
 for(const id of ['brass','frost','obsidian','verdigris','ember','royal','solar']){const s=setup(id).g.getState();assert.equal(s.player.hp,id==='brass'?140:120);assert.equal(s.player.maxHP,s.player.hp);assert.equal(s.player.maxStamina,100);assert.equal(s.player.stamina,100);assert.equal(s.perk.id,id);}
});
test('Starting another fight replaces the equipped benefit and cannot stack HP or effects',()=>{
 const h=setup('brass');for(let i=0;i<5;i++){h.g.start({skin:'brass',sound:false});assert.equal(h.g.getState().player.maxHP,140);}
 h.g.start({skin:'frost',sound:false});let s=h.g.getState();assert.equal(s.player.maxHP,120);assert.equal(s.perk.id,'frost');assert.equal(s.player.hp,120);h.g.reset();h.g.start({skin:'brass',sound:false});assert.equal(h.g.getState().player.maxHP,140);
});
test('Frost turns a 0.34 second guard into a perfect parry; the base window remains shorter',()=>{
 const base=strike('brass',{guard:true,age:.31}).s,frost=strike('frost',{guard:true,age:.31}).s;
 assert.equal(base.parries,0);assert.equal(base.rex.hp,160);assert.equal(frost.parries,1);assert.equal(frost.rex.hp,140);assert.equal(frost.player.hp,70);
 assert.equal(strike('frost',{guard:true,age:.42}).s.parries,0);
});
test('Obsidian reduces late-parry and exhausted-guard damage by 20%, rounded up',()=>{
 const damage=[];for(const heavy of [false,true])for(const guard of [false,true]){const options={guard,heavy,stamina:0,attack:guard?0:.3};const base=strike('frost',options).s,obs=strike('obsidian',options).s;const before=70-base.player.hp,after=70-obs.player.hp;assert.ok(before>0);assert.equal(after,Math.ceil(before*.8));damage.push({heavy,guard,before,after});}report.obsidianDamage=damage;
});
test('Verdigris regenerates stamina 30% faster while resting, guarding and attacking',()=>{
 for(const mode of ['rest','guard','attack']){const base=regenerate('frost',mode),green=regenerate('verdigris',mode);close(green-40,(base-40)*1.3,mode);assert.ok(green>base);}const h=setup('verdigris');h.t.setState({player:{stamina:99},rex:{state:'recover',timer:-100}});h.t.step(1);assert.equal(h.g.getState().player.stamina,100);
});
test('Ember breaks weak guards for 35% more damage, including the combo bonus',()=>{
 for(const combo of [0,2]){const base=160-hitRecover('frost',combo).rex.hp,fire=160-hitRecover('ember',combo).rex.hp;assert.ok(base>0);assert.equal(fire,Math.ceil(base*1.35));}
 const base=strike('frost',{guard:true,age:0}).s,fire=strike('ember',{guard:true,age:0}).s;assert.equal(base.rex.hp,fire.rex.hp,'Ember must not boost reflected parries');
});
test('Ember cannot damage a fully prepared guard by attacking outside recovery',()=>{
 const h=setup('ember');h.t.setState({player:{x:365},rex:{x:730,state:'windup',timer:0,attackTargetX:365}});h.key('KeyJ',true);h.t.step(.16);const s=h.g.getState();assert.equal(s.rex.hp,160);assert.equal(s.rex.defenseKind,'guard');
});
test('Royal spends exactly 25% less stamina on manual dodges',()=>{
 const values={};for(const id of ['frost','royal']){const h=setup(id);h.key('KeyL',true);h.t.step(.01);values[id]=100-h.g.getState().player.stamina;}
 close(values.frost-values.royal,5);assert.ok(values.royal<values.frost);
});
test('Royal discounts normal and heavy blocks, automatic dodges, perfect and late parries',()=>{
 for(const [options,cost] of [[{guard:true,age:.5},18],[{guard:true,age:.5,heavy:true},23],[{guard:false},18],[{guard:false,heavy:true},23],[{guard:true,age:0},8],[{guard:false,attack:.3},8]]){
  const base=strike('frost',options).s,royal=strike('royal',options).s;assert.ok(100-base.player.stamina>0);close(royal.player.stamina-base.player.stamina,cost*.25,JSON.stringify(options));
 }
});
test('Royal preserves attack costs and the energy drained when Rex parries the player',()=>{
 for(const id of ['frost','royal']){const h=setup(id);h.t.setState({player:{x:365},rex:{x:730,state:'windup',timer:0,attackTargetX:365}});h.key('KeyJ',true);assert.equal(h.g.getState().player.stamina,88);h.t.step(.16);assert.equal(h.g.getState().rex.hp,160);close(h.g.getState().player.stamina,78.32,id);}
});
test('Solar heals six HP on a perfect parry and caps healing at its current maximum',()=>{
 assert.equal(strike('solar',{guard:true,age:0,hp:70}).s.player.hp,76);assert.equal(strike('solar',{guard:true,age:0,hp:118}).s.player.hp,120);assert.equal(strike('solar',{guard:true,age:0,hp:120}).s.player.hp,120);assert.equal(strike('solar',{guard:true,age:.5,hp:70}).s.player.hp,70);
});
test('Solar never revives a fallen knight or heals after the fight is over',()=>{
 const dead=strike('solar',{hp:1,stamina:0,attack:.3});assert.equal(dead.g.getState().player.hp,0);assert.equal(dead.g.getState().status,'lost');dead.t.setState({player:{guarding:true,stamina:100,guardSince:dead.g.getState().elapsed}});dead.t.rexHit();assert.equal(dead.g.getState().player.hp,0);assert.equal(dead.g.getState().status,'lost');
 const h=setup('solar');h.t.setState({player:{hp:70,guarding:true,guardSince:0}});h.g.pause();const before=h.g.getState();h.t.rexHit();const after=h.g.getState();assert.equal(after.player.hp,before.player.hp);assert.equal(after.rex.hp,before.rex.hp);
});
test('Healing a finishing Solar parry still ends only when Rex HP reaches zero',()=>{
 const h=setup('solar');h.t.setState({elapsed:1,player:{x:365,hp:70},rex:{hp:15,x:730,state:'strike',timer:.16,attackDone:false,attackTargetX:365}});h.key('KeyK',true);h.t.step(.03);const s=h.g.getState();assert.equal(s.status,'won');assert.equal(s.rex.hp,0);assert.equal(s.player.hp,76);
});
test('Only the equipped skin applies; merely owning all seven adds no stacked benefits',()=>{
 const h=createUI({coins:240,owned:['brass','frost','obsidian','verdigris','ember','royal','solar'],skin:'ember',lootVersion:2,freeCrates:0});h.click('startBtn');h.seconds(18.2);const s=h.window.MuseumGame.getState();assert.equal(s.skin,'ember');assert.equal(s.perk.id,'ember');assert.equal(s.player.maxHP,120);assert.equal(s.perk.stats.staminaRegenMultiplier,1);assert.equal(s.perk.stats.incomingDamageMultiplier,1);
});
test('Collection and HUD describe the same selected benefit from the shared data',()=>{
 const h=createUI({coins:240,owned:['brass','frost'],skin:'frost',lootVersion:2,freeCrates:0}),P=h.window.MuseumPerks;h.click('collectionTab');const cards=h.el('skinGrid').children;assert.equal(cards.length,7);for(const card of cards){assert.match(card.innerHTML,/skin-perk/);assert.equal(card.querySelector('.skin-perk span').textContent,P.all()[cards.indexOf(card)].summary);}
 assert.ok(h.el('loadoutPerk').textContent.includes(P.get('frost').summary));cards[0].click();assert.equal(h.readProfile().skin,'brass');assert.ok(h.el('loadoutPerk').textContent.includes(P.get('brass').summary));h.document.querySelector('.close-modal').click();h.click('startBtn');h.seconds(18.2);assert.ok(h.el('activePerk').textContent.includes(P.get('brass').summary));assert.equal(h.el('playerHP').textContent,'140 / 140');
});
test('Reward reveals its actual benefit and equipping applies it on the next fight',()=>{
 const h=createUI();h.click('collectionTab');h.click('crateBtn');h.seconds(3.6);const pending=h.readProfile().pendingReward,perk=h.window.MuseumPerks.get(pending);assert.ok(h.el('lootPerk').textContent.includes(perk.title));assert.ok(h.el('lootPerk').textContent.includes(perk.summary));h.click('lootEquipBtn');assert.equal(h.readProfile().skin,pending);assert.ok(h.el('loadoutPerk').textContent.includes(perk.summary));h.document.querySelector('.close-modal').click();h.click('startBtn');h.seconds(18.2);assert.equal(h.window.MuseumGame.getState().perk.id,pending);
});
test('Collection handlers cannot change benefits during active or paused combat',()=>{
 const h=createUI({coins:240,owned:['brass','frost'],skin:'brass',lootVersion:2,freeCrates:0});h.click('collectionTab');const frost=h.el('skinGrid').children[1];h.document.querySelector('.close-modal').click();h.click('startBtn');h.seconds(18.2);const before=h.readProfile();for(const paused of [false,true]){if(paused)h.click('pauseBtn');h.click('collectionTab');frost.dispatchEvent({type:'click'});h.el('crateBtn').dispatchEvent({type:'click'});h.el('lootEquipBtn').dispatchEvent({type:'click'});assert.deepEqual(h.readProfile(),before);const s=h.window.MuseumGame.getState();assert.equal(s.skin,'brass');assert.equal(s.perk.id,'brass');assert.equal(s.player.maxHP,140);}
});
test('The mandatory prologue still consumes 18 visible seconds before benefits can fight',()=>{
 const h=createUI({owned:['brass','solar'],skin:'solar'});h.click('startBtn');h.key('Escape');h.key('Space');h.key('KeyJ');h.click('collectionTab');h.seconds(17.5);assert.equal(h.window.MuseumGame.getState().status,'idle');assert.equal(h.el('intro').classList.contains('hidden'),false);h.seconds(.6);assert.equal(h.window.MuseumGame.getState().status,'running');assert.equal(h.window.MuseumGame.getState().skin,'solar');
});
test('Natural AI stays spaced and remains beatable with the new starter benefit',()=>{
 const h=setup('brass',false);assert.equal(h.g._test,undefined);const held={};let min=Infinity;const keys=(code,down)=>{if(held[code]!==down){held[code]=down;h.key(code,down);}};
 for(let i=0;i<9000&&h.g.getState().status==='running';i++){const s=h.g.getState();min=Math.min(min,s.rex.x-s.player.x);assert.ok(s.rex.x-s.player.x>=329.999);keys('KeyD',s.rex.x-s.player.x>390);keys('KeyK',s.rex.state==='strike'&&s.rex.timer>.035&&!s.rex.attackDone);keys('KeyJ',s.rex.state==='recover'&&s.rex.timer<1.1&&s.player.stamina>35);h.step(1);}
 const s=h.g.getState();assert.equal(s.status,'won');assert.equal(s.rex.hp,0);assert.ok(s.player.hp>0);assert.ok(min>=329.999);report.naturalVictory={seconds:s.elapsed,hp:s.player.hp,parries:s.parries,minGap:min};
});

const summary={passed:results.filter(r=>r.pass).length,total:results.length,results,report};fs.writeFileSync('work/qa-perks-results.json',JSON.stringify(summary,null,2));console.log(`\n${summary.passed}/${summary.total} passed`);process.exitCode=summary.passed===summary.total?0:1;
