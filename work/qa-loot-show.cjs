#!/usr/bin/env node
'use strict';
/* Bounded behavior QA for suspense timing; production sources remain untouched. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createUI,DIST}=require('./qa-50-harness.cjs');
const seed={coins:5000,owned:['brass','knight-50'],skin:'knight-50',sound:false,lootVersion:2,freeCrates:0,pendingReward:null,pendingCrateId:null};
function setup(saved=seed,{reduced=false,audio='absent'}={}){
 const read=fs.readFileSync;
 fs.readFileSync=function(file,...args){
  const value=read.call(fs,file,...args);if(path.resolve(String(file))!==path.join(DIST,'ui.js'))return value;
  const pre=`window.matchMedia=globalThis.matchMedia=()=>({matches:${reduced},addEventListener(){},removeEventListener(){}});window.__qaAudioAttempts=0;`+
   (audio==='throwing'?`window.AudioContext=globalThis.AudioContext=class{constructor(){window.__qaAudioAttempts++;throw new Error('Audio unavailable in QA');}};window.Audio=globalThis.Audio=class{constructor(){window.__qaAudioAttempts++;throw new Error('Audio unavailable in QA');}};`:`delete window.AudioContext;delete window.webkitAudioContext;`)+
   `document.getElementById('lootPanel').style.removeProperty=function(key){delete this[key];};\n`;
  const modules=['shop.js','loot-show.js'].map(f=>read.call(fs,path.join(DIST,f),'utf8')).join('\n');
  const track=`\nwindow.__qaReveals=[];window.__qaStartProfiles=[];const __qaShow=window.MuseumLootShow;window.MuseumLootShow={...__qaShow,start(options){window.__qaStartProfiles.push(JSON.parse(localStorage.getItem('museum-night-v1')));const callback=options.onReveal;return __qaShow.start({...options,onReveal(...args){window.__qaReveals.push(performance.now());return callback(...args);}});}};\n`;
  return pre+modules+track+value;
 };
 try{return createUI(saved);}finally{fs.readFileSync=read;}
}
const results=[];
function test(name,fn){try{fn();results.push(true);console.log('PASS:',name);}catch(error){results.push(false);console.error('FAIL:',name,'\n',error.stack);}}
function open(h){h.click('collectionTab');h.click('crateBtn');return h.readProfile();}
function hidden(h,id){return h.el(id).classList.contains('hidden');}
function normalized(profile){return {...profile,owned:[...profile.owned].sort()};}
function assertBusy(h,pending){
 assert.equal(hidden(h,'loot'),false);assert.equal(hidden(h,'lootReward'),true);assert.equal(hidden(h,'lootActions'),true);assert.equal(h.el('startBtn').disabled,true);assert.equal(h.el('lootClose').disabled,true);
 for(const id of ['crateBtn','startBtn','retryBtn','lootClose','lootEquipBtn','lootKeepBtn','shopTab','secretCoinsBtn'])h.el(id).dispatchEvent({type:'click'});
 h.key('Escape');assert.deepEqual(h.readProfile(),pending);assert.equal(h.window.MuseumGame.getState().status,'idle');assert.equal(hidden(h,'loot'),false);assert.equal(h.window.__qaReveals.length,0);
}
test('Payment and exact reward persist before the show; seal, roll and hold cannot reveal or escape early',()=>{
 const h=setup(),pending=open(h);assert.equal(pending.coins,4400);assert.equal(pending.owned.length,3);assert.ok(pending.pendingReward);assert.equal(JSON.stringify(h.window.__qaStartProfiles[0]),JSON.stringify(pending));assertBusy(h,pending);
 h.seconds(.5);assertBusy(h,pending);h.seconds(.5);assertBusy(h,pending);h.seconds(6.45);assertBusy(h,pending);h.seconds(.7);assertBusy(h,pending);
 const now=h.window.performance.now();assert.ok(now>=8140&&now<8200);h.seconds(.1);assert.equal(h.window.__qaReveals.length,1);assert.ok(h.window.__qaReveals[0]>=8200&&h.window.__qaReveals[0]<=8250);assert.equal(hidden(h,'lootReward'),false);assert.equal(hidden(h,'lootActions'),false);assert.equal(hidden(h,'lootSuspense'),true);assert.equal(h.el('lootPanel').classList.contains('is-rolling'),false);assert.equal(h.el('lootClose').disabled,false);assert.deepEqual(h.readProfile(),pending);
 h.seconds(2);assert.equal(h.window.__qaReveals.length,1);assert.deepEqual(h.readProfile(),pending);
});
test('Consecutive crates reveal once each, without late callbacks or additional charges',()=>{
 const h=setup(),first=open(h);h.seconds(8.3);assert.equal(h.window.__qaReveals.length,1);h.click('lootKeepBtn');assert.equal(h.readProfile().pendingReward,null);h.click('crateBtn');const second=h.readProfile();assert.equal(second.coins,3800);assert.equal(second.owned.length,4);assert.notEqual(second.pendingReward,first.pendingReward);h.seconds(8.3);assert.equal(h.window.__qaReveals.length,2);h.seconds(2);assert.equal(h.window.__qaReveals.length,2);assert.deepEqual(h.readProfile(),second);
});
test('Reload during a roll restores the exact already-paid reward immediately',()=>{
 const original=setup(),pending=open(original);original.seconds(3);assertBusy(original,pending);const recovered=setup(pending);assert.deepEqual(normalized(recovered.readProfile()),normalized(pending));assert.equal(hidden(recovered,'lootReward'),false);assert.equal(hidden(recovered,'lootActions'),false);assert.equal(hidden(recovered,'lootSuspense'),true);recovered.seconds(9);assert.deepEqual(normalized(recovered.readProfile()),normalized(pending));assert.equal(recovered.window.__qaReveals.length,0);recovered.click('lootEquipBtn');assert.equal(recovered.readProfile().skin,pending.pendingReward);assert.equal(recovered.readProfile().pendingReward,null);assert.equal(recovered.readProfile().coins,4400);
});
test('Reduced motion reveals within700ms while still reserving exactly once',()=>{
 const h=setup(seed,{reduced:true}),pending=open(h);assert.equal(hidden(h,'lootReward'),true);h.seconds(.7);assert.equal(h.window.__qaReveals.length,1);assert.ok(h.window.__qaReveals[0]<=700);assert.equal(hidden(h,'lootReward'),false);h.seconds(9);assert.equal(h.window.__qaReveals.length,1);assert.deepEqual(h.readProfile(),pending);
});
test('Muted mode never attempts audio and still completes its normal reveal',()=>{
 const h=setup(seed,{audio:'throwing'}),pending=open(h);h.seconds(8.3);assert.equal(h.window.__qaAudioAttempts,0);assert.equal(h.window.__qaReveals.length,1);assert.equal(hidden(h,'lootReward'),false);assert.deepEqual(h.readProfile(),pending);
});
test('Unavailable audio cannot interrupt an enabled-sound opening or lose its reward',()=>{
 for(const audio of ['absent','throwing']){const h=setup({...seed,sound:true},{audio}),pending=open(h);h.seconds(8.3);assert.equal(h.window.__qaReveals.length,1);assert.equal(hidden(h,'lootReward'),false);assert.deepEqual(h.readProfile(),pending);}
});
console.log(`${results.filter(Boolean).length}/${results.length} suspense checks passed`);process.exitCode=results.every(Boolean)?0:1;
