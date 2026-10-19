#!/usr/bin/env node
'use strict';
/* Focused checks for the offer badge and repeatable museum-token control. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createUI,DIST}=require('./qa-50-harness.cjs');
const grantId=process.env.QA_BONUS_ID;
assert.ok(grantId,'Set QA_BONUS_ID to the shipping hidden grant button ID.');
function setup(saved){
 const read=fs.readFileSync;
 fs.readFileSync=function(file,...args){const value=read.call(fs,file,...args);return path.resolve(String(file))===path.join(DIST,'ui.js')?read.call(fs,path.join(DIST,'shop.js'),'utf8')+'\n'+value:value;};
 try{return createUI(saved);}finally{fs.readFileSync=read;}
}
const seed={coins:113,owned:['brass','knight-50'],skin:'knight-50',sound:true,lootVersion:2,freeCrates:1,pendingReward:null,pendingCrateId:null};
function stateExceptCoins(profile){const copy={...profile};delete copy.coins;return copy;}
const tests=[];
function test(name,fn){try{fn();tests.push(true);console.log('PASS:',name);}catch(error){tests.push(false);console.error('FAIL:',name,error.stack);}}
test('Each invocation adds exactly2137 tokens, persists after reload and preserves inventory/loadout/entitlements',()=>{
 const h=setup(seed),initial=h.readProfile();
 for(let i=1;i<=2;i++){h.click(grantId);const saved=h.readProfile();assert.equal(saved.coins,initial.coins+i*2137);assert.deepEqual(stateExceptCoins(saved),stateExceptCoins(initial));assert.equal(Number(h.el('coins').textContent),saved.coins);}
 const reloaded=setup(h.readProfile()),saved=reloaded.readProfile();assert.equal(saved.coins,4387);assert.deepEqual(stateExceptCoins(saved),stateExceptCoins(initial));reloaded.click(grantId);assert.equal(reloaded.readProfile().coins,6524);assert.deepEqual(stateExceptCoins(reloaded.readProfile()),stateExceptCoins(initial));reloaded.click('shopTab');assert.equal(Number(reloaded.el('shopBalance').textContent.replace(/\D/g,'')),6524);assert.equal(reloaded.el('shopPaymentBtn').disabled,true);
});
test('Only the49.99PLN treasury offer carries the best-offer badge',()=>{
 const h=setup(seed);h.click('shopTab');const products=h.el('shopOffers').children.filter(b=>b.dataset.crateId),badged=products.filter(b=>b.textContent.includes('NAJLEPSZA OFERTA'));assert.equal(products.length,3);assert.equal(badged.length,1);assert.equal(badged[0].dataset.crateId,'treasury');assert.match(badged[0].textContent,/49[,.]99/);
});
if(process.env.QA_BONUS_LOCKED==='1'){
 test('The grant control preserves a pending reward and cannot alter credits during its reveal',()=>{
  const h=setup({...seed,pendingReward:'knight-50',pendingCrateId:'relic'}),initial=h.readProfile();h.el(grantId).dispatchEvent({type:'click'});assert.deepEqual(h.readProfile(),initial);assert.equal(h.el('loot').classList.contains('hidden'),false);
 });
 test('The grant control cannot change credits during intro, fight or pause',()=>{
  const h=setup(seed);h.click('startBtn');const initial=h.readProfile(),attempt=()=>{h.el(grantId).dispatchEvent({type:'click'});assert.deepEqual(h.readProfile(),initial);};attempt();h.seconds(18.2);assert.equal(h.window.MuseumGame.getState().status,'running');attempt();h.click('pauseBtn');attempt();
 });
}
console.log(`${tests.filter(Boolean).length}/${tests.length} focused checks passed`);process.exitCode=tests.every(Boolean)?0:1;
