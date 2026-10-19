#!/usr/bin/env node
'use strict';
/* Run the prior behavioral suite with the intentional new 140 HP starter expectation. */
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
for(const part of ['game','loot']){
 const file=path.resolve(`work/qa-v2-${part}.cjs`);let source=fs.readFileSync(file,'utf8');
 source=source.replace("require('./qa-v2-harness.cjs')","require('./qa-perks-harness.cjs')");
 source=source.replace("{testMode});","{testMode,preload:[path.join(DIST,'perks.js')]});");
 source=source.replaceAll('.maxHP,120)','.maxHP,140)').replaceAll('.hp,120)','.hp,140)');
 source=source.replaceAll(`work/qa-v2-${part}-results.json`,`work/qa-perks-regression-${part}-results.json`);
 const loaded=new Module(file,module);loaded.filename=file;loaded.paths=Module._nodeModulePaths(path.dirname(file));loaded._compile(source,file);
}
const reports=['game','loot'].map(part=>JSON.parse(fs.readFileSync(`work/qa-perks-regression-${part}-results.json`,'utf8')));
const passed=reports.reduce((sum,r)=>sum+r.passed,0),total=reports.reduce((sum,r)=>sum+r.total,0);
console.log(`\nPrior behavioral regression suite: ${passed}/${total} passed`);process.exitCode=passed===total?0:1;
