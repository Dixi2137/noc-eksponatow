#!/usr/bin/env node
'use strict';
/* Read-only release QA for the monetization preview. No production edits. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createUI,DIST}=require('./qa-50-harness.cjs');
const window={};
const context=vm.createContext({window,Math,Uint32Array});
for(const f of ['knights.js','perks.js','loot.js'])vm.runInContext(fs.readFileSync(path.join(DIST,f),'utf8'),context,{filename:f});
const L=window.MuseumLoot,plain=x=>JSON.parse(JSON.stringify(x)),results=[];
function createShopUI(saved=null,options={}){
 // The previous harness predates shop.js. Load that shipping module immediately
 // before ui.js, exactly as the document does, without modifying the old harness.
 const read=fs.readFileSync,shopPath=path.join(DIST,'shop.js');
 fs.readFileSync=function(file,...args){const value=read.call(fs,file,...args);return path.resolve(String(file))===path.join(DIST,'ui.js')&&fs.existsSync(shopPath)?read.call(fs,shopPath,'utf8')+'\n'+value:value;};
 try{return createUI(saved,options);}finally{fs.readFileSync=read;}
}
function change(h,id,value){h.el(id).value=value;h.el(id).dispatchEvent({type:'change'});}
function selectOffer(h,id){const b=h.el('shopOffers').children.find(b=>b.dataset.crateId===id)||h.el('shopOffers').querySelector(`[data-crate-id="${id}"]`);assert.ok(b,`Missing ${id} shop offer`);b.click();return b;}
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const expected={gallery:{cost:600,pricePLN:19.99,odds:{common:55,rare:28,epic:14,legendary:3}},treasury:{cost:1800,pricePLN:49.99,odds:{common:0,rare:0,epic:85,legendary:15}},relic:{cost:4500,pricePLN:99.99,odds:{common:0,rare:0,epic:0,legendary:100}}};
const p=(extra={})=>L.migrate({coins:100000,lootVersion:2,freeCrates:0,...extra});
function test(name,fn){try{fn();results.push({name,pass:true});console.log('PASS:',name);}catch(error){results.push({name,pass:false,error:error.message});console.error('FAIL:',name,'\n ',error.stack);}}
function noMutation(profile,fn){const before=JSON.stringify(profile),r=fn();assert.equal(JSON.stringify(profile),before);return r;}
function assertOdds(profile,id,expectedOdds){const actual=L.odds(profile,id);for(const [rarity,chance]of Object.entries(expectedOdds))close(actual[rarity]||0,chance);}

test('Three crate tiers expose the agreed token costs, while the old default is now600',()=>{
 assert.equal(L.COST,600);for(const [id,e]of Object.entries(expected)){const c=L.getCrate(id);assert.equal(c.id,id);assert.equal(c.cost,e.cost);assert.equal(c.pricePLN,e.pricePLN);assert.deepEqual(plain(c.rarityWeights),e.odds);assert.ok(Object.isFrozen(c));assert.ok(Object.isFrozen(c.rarityWeights));}assert.equal(L.getCrate('unknown'),null);
});
test('All57 skins remain unique with original IDs and every gameplay perk',()=>{
 assert.equal(L.skins.length,57);assert.equal(new Set(L.skins.map(s=>s.id)).size,57);assert.deepEqual(plain(L.skins.slice(0,7).map(s=>s.id)),['brass','frost','obsidian','verdigris','ember','royal','solar']);for(const skin of L.skins)assert.equal(window.MuseumPerks.get(skin.id).id,skin.id);
});
test('Every existing progress field, pending reward and free-crate balance survive migration',()=>{
 for(const freeCrates of [0,1]){const saved={coins:481,owned:['brass','frost','solar','knight-50'],skin:'knight-50',sound:true,lootVersion:2,freeCrates,pendingReward:'solar'},r=L.migrate(saved);for(const [k,v]of Object.entries(saved))assert.deepEqual(plain(r[k]),v,k);assert.deepEqual(plain(L.migrate(r)),plain(r));}
});
test('The legacy starter entitlement is granted once, without granting currency or skins',()=>{
 const legacy=L.migrate({coins:99,owned:['brass','knight-50'],skin:'knight-50'});assert.equal(legacy.coins,99);assert.equal(legacy.freeCrates,1);assert.equal(legacy.owned.length,2);const used=L.claim(L.reserve(legacy,()=>0).profile);assert.equal(L.migrate(used).freeCrates,0);
});
test('Default draw and reserve preserve the prior API and select the gallery crate',()=>{
 const profile=p();assert.equal(L.draw(profile,()=>0).id,L.draw(profile,()=>0,'gallery').id);const a=L.reserve(profile,()=>0),b=L.reserve(profile,()=>0,'gallery');assert.equal(a.cost,600);assert.deepEqual(plain(a),plain(b));
});
for(const [id,e]of Object.entries(expected)){
 test(`${id}: exact charge, one new appearance and no profile mutation`,()=>{
  const profile=p({coins:e.cost}),r=noMutation(profile,()=>L.reserve(profile,()=>.5,id));assert.ok(r);assert.equal(r.cost,e.cost);assert.equal(r.free,false);assert.equal(r.profile.coins,0);assert.equal(r.profile.owned.length,2);assert.equal(r.profile.pendingReward,r.reward.id);assert.equal(r.profile.skin,'brass');assert.equal(r.profile.freeCrates,0);
 });
 test(`${id}: insufficient funds rejects without charging or granting`,()=>{
  const profile=p({coins:e.cost-1});assert.equal(noMutation(profile,()=>L.reserve(profile,()=>0,id)),null);
 });
 test(`${id}: initial rarity odds match the advertised eligible pool`,()=>assertOdds(p(),id,e.odds));
 test(`${id}: every eligible rarity and each skin can be reached inside its exact interval`,()=>{
  const profile=p();let start=0;for(const [rarity,weight]of Object.entries(e.odds)){const members=L.skins.filter(s=>s.weight>0&&s.rarity===rarity);if(!weight)continue;for(let i=0;i<members.length;i++){const roll=(start+weight*(i+.5)/members.length)/100;assert.equal(L.draw(profile,()=>roll,id).id,members[i].id,`${rarity}:${i}`);}start+=weight;}
 });
 test(`${id}: sold-out eligible pool never charges or falls back to ineligible skins`,()=>{
  const owned=L.skins.filter(s=>s.rarity==='basic'||e.odds[s.rarity]>0).map(s=>s.id),profile=p({owned,freeCrates:1});assert.equal(noMutation(profile,()=>L.draw(profile,()=>0,id)),null);assert.equal(noMutation(profile,()=>L.reserve(profile,()=>0,id)),null);assertOdds(profile,id,{common:0,rare:0,epic:0,legendary:0});
 });
}
test('The starter voucher is valid only for gallery and cannot buy either premium tier',()=>{
 for(const id of ['treasury','relic']){const empty=p({coins:0,freeCrates:1});assert.equal(noMutation(empty,()=>L.reserve(empty,()=>0,id)),null);const paid=p({coins:expected[id].cost,freeCrates:1}),r=L.reserve(paid,()=>0,id);assert.ok(r);assert.equal(r.cost,expected[id].cost);assert.equal(r.free,false);assert.equal(r.profile.freeCrates,1);}
 const profile=p({coins:0,freeCrates:1}),r=L.reserve(profile,()=>0,'gallery');assert.equal(r.cost,0);assert.equal(r.free,true);assert.equal(r.profile.freeCrates,0);assert.equal(r.profile.coins,0);assert.equal(L.reserve(L.claim(r.profile),()=>0,'gallery'),null);
});
test('Invalid crate identifiers reject draws and reservations without a fallback purchase',()=>{
 for(const id of ['bogus','__proto__','constructor','toString']){const profile=p({freeCrates:1});assert.equal(noMutation(profile,()=>L.draw(profile,()=>0,id)),null);assert.equal(noMutation(profile,()=>L.reserve(profile,()=>0,id)),null);}
});
test('A pending reward blocks all other crates, including a starter voucher',()=>{
 const profile=p({pendingReward:'knight-50',owned:['brass','knight-50'],freeCrates:1});for(const id of Object.keys(expected))assert.equal(noMutation(profile,()=>L.reserve(profile,()=>0,id)),null);
});
test('Rarity odds redistribute only over eligible tiers with missing skins',()=>{
 for(const [id,e]of Object.entries(expected)){const nonzero=Object.entries(e.odds).filter(([,v])=>v>0);for(const [excluded]of nonzero){const profile=p({owned:L.skins.filter(s=>s.rarity===excluded).map(s=>s.id)}),total=nonzero.filter(([tier])=>tier!==excluded).reduce((sum,[,n])=>sum+n,0),want={};for(const [tier,n]of Object.entries(e.odds))want[tier]=tier===excluded||!total?0:n/total*100;assertOdds(profile,id,want);if(total)assert.notEqual(L.draw(profile,()=>0,id).rarity,excluded);}}
});
test('Owning one skin in a rarity does not change that rarity probability',()=>{
 const profile=p({owned:['brass','knight-01','knight-16','knight-31','knight-46']});for(const [id,e]of Object.entries(expected))assertOdds(profile,id,e.odds);
});
test('All56 unlockable skins can be collected once and collection completion never charges again',()=>{
 let profile=p({coins:100000,freeCrates:1});const rewards=[];for(let i=0;i<56;i++){const r=L.reserve(profile,()=>0);assert.ok(r,`drop${i}`);assert.equal(r.cost,i?600:0);assert.ok(!profile.owned.includes(r.reward.id));rewards.push(r.reward.id);profile=L.claim(r.profile);assert.equal(profile.pendingReward,null);const sum=Object.values(L.odds(profile)).reduce((a,b)=>a+b,0);close(sum,i===55?0:100);}assert.equal(new Set(rewards).size,56);assert.equal(profile.coins,67000);assert.equal(profile.owned.length,57);for(const id of Object.keys(expected))assert.equal(noMutation(profile,()=>L.reserve(profile,()=>0,id)),null);
});
test('Premium draws never grant a lower-rarity skin, including after every preferred skin is owned',()=>{
 for(const id of ['treasury','relic']){const allowed=Object.keys(expected[id].odds).filter(tier=>expected[id].odds[tier]>0);for(let step=0;step<=1000;step++){const reward=L.draw(p(),()=>step/1000,id);assert.ok(allowed.includes(reward.rarity));}const profile=p({owned:L.skins.filter(s=>allowed.includes(s.rarity)).map(s=>s.id)});assert.ok(L.skins.some(s=>!profile.owned.includes(s.id)));assert.equal(L.draw(profile,()=>0,id),null);}
});
test('Reserved rewards survive reload and equip only on explicit claim without a second charge',()=>{
 for(const id of Object.keys(expected)){const profile=p(),r=L.reserve(profile,()=>.999,id),reloaded=L.migrate(r.profile);assert.equal(reloaded.pendingReward,r.reward.id);assert.equal(reloaded.coins,profile.coins-expected[id].cost);assert.equal(L.claim(reloaded).skin,'brass');const claim=L.claim(reloaded,{equip:true});assert.equal(claim.skin,r.reward.id);assert.equal(claim.pendingReward,null);assert.equal(claim.coins,reloaded.coins);assert.equal(L.claim(claim,{equip:true}).skin,r.reward.id);}
});
test('Allcrate random boundaries and nonfinite random inputs produce a valid eligible reward',()=>{
 for(const id of Object.keys(expected))for(const roll of [-Infinity,-1,0,.5,1,2,Infinity,NaN]){const reward=L.draw(p(),()=>roll,id);assert.ok(reward);assert.ok(expected[id].odds[reward.rarity]>0);}
});

if(process.env.QA_SHOP_UI==='1'){
 test('UI initializes with all markup and prior progress intact',()=>{const h=createShopUI({coins:222,owned:['brass','knight-50'],skin:'knight-50',lootVersion:2,freeCrates:0});assert.equal(h.readProfile().coins,222);assert.equal(h.readProfile().skin,'knight-50');assert.equal(h.readProfile().owned.length,2);assert.ok(h.window.MuseumShop);});
 test('The shop has three planned PLN offers; browsing and payment clicks grant nothing',()=>{
  const h=createShopUI(p({coins:250,freeCrates:1}));h.click('shopTab');assert.equal(h.el('shop').classList.contains('hidden'),false);assert.equal(h.el('shopOffers').children.filter(b=>b.dataset.crateId).length,3);const before=h.readProfile();for(const [id,e]of Object.entries(expected)){selectOffer(h,id);assert.ok(h.el('shopSelectedName').textContent);assert.match(h.el('shopSelectedPrice').textContent,new RegExp(e.pricePLN.toFixed(2).replace('.', '[,.]')));assert.ok(h.el('shopSelectedGuarantee').textContent);assert.ok(h.el('shopSelectedOdds').textContent);assert.equal(h.el('shopPaymentBtn').disabled,true);h.el('shopPaymentBtn').dispatchEvent({type:'click'});h.seconds(.1);assert.deepEqual(h.readProfile(),before);}assert.match(h.el('shopBalance').textContent,/250/);
 });
 test('Using the shop token route selects a crate without charging, adding coins or granting skins',()=>{
  for(const id of Object.keys(expected)){const h=createShopUI(p({coins:10000,freeCrates:1})),before=h.readProfile();h.click('shopTab');selectOffer(h,id);h.click('shopTokenBtn');assert.deepEqual(h.readProfile(),before);assert.equal(h.el('shop').classList.contains('hidden'),true);assert.equal(h.el('collection').classList.contains('hidden'),false);assert.equal(h.el('crateType').value,id);}
 });
 test('UI tier selection enforces the premium cost even while a free gallery voucher remains',()=>{
  for(const id of ['treasury','relic']){const h=createShopUI(p({coins:0,freeCrates:1}));h.click('collectionTab');change(h,'crateType',id);const before=h.readProfile();assert.equal(h.el('crateBtn').disabled,true);h.el('crateBtn').dispatchEvent({type:'click'});assert.deepEqual(h.readProfile(),before);assert.equal(h.el('loot').classList.contains('hidden'),true);}
 });
 test('UI spends the selected token tier exactly once and uses its own rarity guarantee',()=>{
  for(const [id,e]of Object.entries(expected)){const h=createShopUI(p({coins:e.cost,freeCrates:0}));h.window.crypto={getRandomValues:a=>(a[0]=0,a)};h.click('collectionTab');change(h,'crateType',id);assert.equal(h.el('crateBtn').disabled,false);h.click('crateBtn');const pending=h.readProfile();assert.equal(pending.coins,0);assert.equal(pending.freeCrates,0);assert.equal(pending.owned.length,2);assert.equal(pending.pendingCrateId,id);const reward=L.skins.find(s=>s.id===pending.pendingReward);assert.ok(e.odds[reward.rarity]>0);h.el('crateBtn').dispatchEvent({type:'click'});h.el('shopTab').dispatchEvent({type:'click'});h.el('shopPaymentBtn').dispatchEvent({type:'click'});assert.deepEqual(h.readProfile(),pending);h.seconds(3.6);assert.equal(h.el('lootPanel').dataset.rarity,reward.rarity);h.click('lootKeepBtn');assert.equal(h.readProfile().pendingReward,null);assert.equal(h.readProfile().coins,0);}
 });
 test('UI reload restores a premium pending reward without repeating or upgrading its purchase',()=>{
  const reserved=L.reserve(p({coins:5000,freeCrates:1}),()=>0,'relic'),h=createShopUI(reserved.profile);const restored=h.readProfile();assert.equal(restored.pendingReward,reserved.reward.id);assert.equal(restored.pendingCrateId,'relic');assert.equal(restored.coins,500);assert.equal(restored.freeCrates,1);assert.equal(h.el('loot').classList.contains('hidden'),false);h.el('shopTab').dispatchEvent({type:'click'});h.el('shopPaymentBtn').dispatchEvent({type:'click'});assert.deepEqual(h.readProfile(),restored);h.click('lootEquipBtn');assert.equal(h.readProfile().skin,reserved.reward.id);assert.equal(h.readProfile().coins,500);assert.equal(h.readProfile().pendingReward,null);
 });
 test('A sold-out premium store and collection cannot charge despite uncollected lower rarities',()=>{
  const h=createShopUI(p({coins:10000,freeCrates:1,owned:L.skins.filter(s=>s.rarity==='legendary').map(s=>s.id)}));h.click('shopTab');selectOffer(h,'relic');const before=h.readProfile();assert.equal(h.el('shopTokenBtn').disabled,true);assert.match(h.el('shopTokenHint').textContent,/wszystkie/);for(const text of ['ZWYKŁY 0%','RZADKI 0%','EPICKI 0%','LEGENDARNY 0%'])assert.ok(h.el('shopSelectedOdds').textContent.includes(text),text);h.el('shopTokenBtn').dispatchEvent({type:'click'});assert.deepEqual(h.readProfile(),before);h.document.querySelector('#shop .close-modal').click();h.click('collectionTab');change(h,'crateType','relic');assert.equal(h.el('crateBtn').disabled,true);h.el('crateBtn').dispatchEvent({type:'click'});assert.deepEqual(h.readProfile(),before);assert.equal(h.el('loot').classList.contains('hidden'),true);
 });
 test('Store odds show the current collection and a stale invalid selector retains its last valid crate',()=>{
  const h=createShopUI(p({owned:L.skins.filter(s=>s.rarity==='legendary').map(s=>s.id)}));h.click('shopTab');selectOffer(h,'treasury');assert.ok(h.el('shopSelectedOdds').textContent.includes('EPICKI 100%'));assert.ok(h.el('shopSelectedOdds').textContent.includes('LEGENDARNY 0%'));h.click('shopTokenBtn');assert.equal(h.el('crateType').value,'treasury');assert.match(h.el('crateOdds').textContent,/epicki 100%/);const before=h.readProfile();change(h,'crateType','bogus');assert.equal(h.el('crateType').value,'treasury');assert.deepEqual(h.readProfile(),before);
 });
 test('Shop and crate handlers remain locked during intro, fight and pause',()=>{
  const h=createShopUI(p({coins:10000,freeCrates:1}));h.click('shopTab');const offer=selectOffer(h,'relic');h.document.querySelector('#shop .close-modal').click();h.click('startBtn');const before=h.readProfile();const attackLockedHandlers=()=>{h.el('shopTab').dispatchEvent({type:'click'});offer.dispatchEvent({type:'click'});h.el('shopTokenBtn').dispatchEvent({type:'click'});change(h,'crateType','relic');h.el('crateBtn').dispatchEvent({type:'click'});h.el('shopPaymentBtn').dispatchEvent({type:'click'});assert.deepEqual(h.readProfile(),before);assert.equal(h.el('shop').classList.contains('hidden'),true);assert.equal(h.el('collection').classList.contains('hidden'),true);assert.equal(h.el('loot').classList.contains('hidden'),true);assert.equal(h.el('shopTab').getAttribute('aria-disabled'),'true');};attackLockedHandlers();h.seconds(18.2);assert.equal(h.window.MuseumGame.getState().status,'running');attackLockedHandlers();h.click('pauseBtn');attackLockedHandlers();
 });
 test('Shop becomes available again after the dream result',()=>{
  const h=createShopUI(p());h.click('startBtn');h.seconds(18.2);h.window.dispatchEvent({type:'game:end',detail:{win:true,parries:0,time:2}});h.seconds(8.2);assert.equal(h.el('shopTab').getAttribute('aria-disabled'),'false');h.click('shopTab');assert.equal(h.el('shop').classList.contains('hidden'),false);const before=h.readProfile();h.el('shopPaymentBtn').dispatchEvent({type:'click'});assert.deepEqual(h.readProfile(),before);
 });
}
console.log(`\n${results.filter(r=>r.pass).length}/${results.length} shop checks passed`);
process.exitCode=results.some(r=>!r.pass)?1:0;
