#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHarness}=require('./qa-game.cjs');
const gameFile=path.resolve('work/noc-eksponatow/dist/game.js');
const artFile=path.resolve('work/noc-eksponatow/dist/art.js');
const results=[];
function setup(testMode=true){const h=createHarness(gameFile,{testMode,preload:fs.existsSync(artFile)?[artFile]:[]});return {...h,g:h.window.MuseumGame,t:h.window.MuseumGame._test};}
function test(name,fn){try{fn();results.push({name,pass:true});console.log('PASS:',name);}catch(error){results.push({name,pass:false,error:error.message});console.error('FAIL:',name,'\n ',error.stack);}}
function hp(s){return [s.player.hp,s.rex.hp];}
function hold(t,name,seconds){t.input(name,true);t.step(seconds);t.input(name,false);}

test('Production API does not expose QA state mutation',()=>{const {g}=setup(false);assert.equal(g._test,undefined);});
test('Idle combat cannot move, attack or change HP before start',()=>{const {g,h,t,...rest}=setup();const before=g.getState();t.input('right',true);t.input('attack',true);t.input('guard',true);t.step(20);const after=g.getState();assert.equal(after.status,'idle');assert.equal(after.elapsed,0);assert.equal(after.player.x,before.player.x);assert.deepEqual(hp(after),hp(before));});
test('RAF can draw 120 frames without starting combat',()=>{const h=setup();h.step(120);assert.equal(h.g.getState().status,'idle');assert.equal(h.g.getState().elapsed,0);});
test('Only player and T. rex are active fighters; no character mutation API',()=>{const {g}=setup();const s=g.start({sound:false});assert.ok(s.player&&s.rex);assert.equal(s.player.maxHP,120);assert.equal(s.rex.maxHP,160);assert.equal(g.changeCharacter,undefined);assert.equal(g.selectOpponent,undefined);});
test('Movement remains inside both arena boundaries and collision gap',()=>{const {g,t}=setup();g.start({sound:false});hold(t,'left',10);let s=g.getState();assert.equal(s.player.x,145);assert.ok(s.rex.x<=1290);hold(t,'right',30);s=g.getState();assert.ok(s.player.x>=145&&s.player.x<=1110);assert.ok(s.rex.x<=1290);assert.ok(s.rex.x-s.player.x>=179.999);});
test('Pause freezes time, movement and health; resume restores updates',()=>{const {g,t}=setup();g.start({sound:false});g.pause();const before=g.getState();hold(t,'right',4);hold(t,'attack',4);const after=g.getState();assert.equal(after.status,'paused');assert.equal(after.elapsed,before.elapsed);assert.equal(after.player.x,before.player.x);assert.deepEqual(hp(after),hp(before));g.resume();t.step(.1);assert.equal(g.getState().status,'running');assert.ok(g.getState().elapsed>after.elapsed);});
test('Distant player attack causes T. rex dodge with no damage',()=>{const {g,t}=setup();g.start({sound:false});hold(t,'attack',.16);const s=g.getState();assert.equal(s.rex.hp,160);assert.equal(s.rex.defenseKind,'dodge');assert.ok(s.rex.defense>0);});
test('T. rex parries attacks during windup with no HP damage',()=>{const {g,t}=setup();g.start({sound:false});t.setState({rex:{x:650,state:'windup',timer:0},player:{x:365}});hold(t,'attack',.16);const s=g.getState();assert.equal(s.rex.hp,160);assert.equal(s.rex.defenseKind,'guard');});
test('Tired T. rex parry during recovery lets through damage',()=>{const {g,t}=setup();g.start({sound:false});t.setState({rex:{x:650,state:'recover',timer:0},player:{x:365}});hold(t,'attack',.16);const s=g.getState();assert.equal(s.rex.defenseKind,'guard');assert.equal(s.rex.hp,151);});
test('Undefended Rex strike automatically provokes player dodge',()=>{const {g,t}=setup();g.start({sound:false});t.setState({rex:{x:650,state:'strike',timer:0,attackDone:false},player:{x:365,stamina:100}});t.step(.12);const s=g.getState();assert.equal(s.player.hp,120);assert.ok(s.player.evade>0);assert.ok(s.player.stamina<100);});
test('Fresh guard reflects Rex strike and damages only Rex',()=>{const {g,t}=setup();g.start({sound:false});t.setState({elapsed:2,rex:{x:650,state:'strike',timer:0,attackDone:false},player:{x:365,stamina:100}});t.input('guard',true);t.step(.12);const s=g.getState();assert.equal(s.player.hp,120);assert.equal(s.rex.hp,140);assert.equal(s.parries,1);});
test('Active manual dodge avoids an incoming strike at low remaining stamina',()=>{const {g,t}=setup();g.start({sound:false});t.setState({rex:{x:650,state:'windup',timer:.77,attackDone:false},player:{x:365,stamina:22}});t.input('dodge',true);t.step(.01);t.input('dodge',false);t.setState({rex:{state:'strike',timer:.06,attackDone:false}});t.step(.04);assert.equal(g.getState().player.hp,120);});
test('Eight successive perfect parries can legitimately defeat Rex',()=>{const {g,t}=setup();g.start({sound:false});for(let i=0;i<8;i++){t.input('guard',false);t.setState({elapsed:2+i,rex:{x:650,state:'strike',timer:0,attackDone:false,heavy:false},player:{x:365,stamina:100,attack:0,evade:0,hurt:0}});t.input('guard',true);t.step(.2);}const s=g.getState();assert.equal(s.status,'won');assert.equal(s.rex.hp,0);assert.equal(s.player.hp,120);assert.equal(s.parries,8);});
test('Exhausted late parry can reduce player to zero and lose',()=>{const {g,t}=setup();g.start({sound:false});t.setState({elapsed:2,rex:{x:650,state:'strike',timer:0,attackDone:false},player:{x:365,hp:1,stamina:0,attack:.3}});t.step(.12);const s=g.getState();assert.equal(s.status,'lost');assert.equal(s.player.hp,0);assert.equal(s.rex.hp,160);});
test('After HP defeat, combat state stops responding and no further damage occurs',()=>{const {g,t}=setup();g.start({sound:false});t.setState({elapsed:2,rex:{x:650,state:'recover',timer:0,hp:1},player:{x:365}});hold(t,'attack',.2);assert.equal(g.getState().status,'won');const before=g.getState();hold(t,'left',20);hold(t,'attack',20);hold(t,'guard',20);const after=g.getState();assert.equal(after.elapsed,before.elapsed);assert.equal(after.player.x,before.player.x);assert.deepEqual(hp(after),hp(before));});
test('Five minutes passing cannot produce victory without defeating Rex',()=>{const {g,t}=setup();g.start({sound:false});t.setState({rex:{x:1290,state:'recover',timer:-400},player:{x:145}});t.step(300);const s=g.getState();assert.equal(s.status,'running');assert.equal(s.rex.hp,160);});
const summary={passed:results.filter(r=>r.pass).length,total:results.length,results};
fs.writeFileSync('work/qa-results.json',JSON.stringify(summary,null,2));
console.log(`\n${summary.passed}/${summary.total} passed`);
process.exitCode=summary.passed===summary.total?0:1;
