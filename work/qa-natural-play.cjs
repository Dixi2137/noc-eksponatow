'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHarness}=require('./qa-game.cjs');
const h=createHarness(path.resolve('work/noc-eksponatow/dist/game.js'),{preload:[path.resolve('work/noc-eksponatow/dist/art.js')]});
const g=h.window.MuseumGame;
g.start({sound:false});
const held={};
function key(code,down){if(held[code]!==down){held[code]=down;h.key(code,down);}}
for(let i=0;i<7200&&g.getState().status==='running';i++){
 const s=g.getState();
 const dist=s.rex.x-s.player.x;
 key('KeyD',dist>305);
 const guard=(s.rex.state==='windup'&&s.rex.timer>(s.rex.heavy?.95:.70)) || s.rex.state==='strike'&&!s.rex.attackDone;
 key('KeyK',guard);
 key('KeyJ',s.rex.state==='recover'&&s.rex.timer<.82&&s.player.stamina>35);
 h.step(1);
}
const result=g.getState();
console.log(JSON.stringify({status:result.status,hp:result.player.hp,rexHP:result.rex.hp,parries:result.parries,seconds:result.elapsed,drawCalls:h.reports.drawCalls},null,2));
assert.equal(result.status,'won','A timing-aware player must be able to win with real keyboard controls and natural AI');
assert.equal(result.rex.hp,0);
assert.ok(result.player.hp>0);
console.log('PASS: natural AI, real keyboard events, no state injection, victory.');
