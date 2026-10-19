#!/usr/bin/env node
'use strict';
/* Reuse existing behavioral perk checks against the expanded catalog and paginated UI. */
const fs=require('fs'),path=require('path'),Module=require('module');
let source=fs.readFileSync(path.resolve('work/qa-perks.cjs'),'utf8')
 .replace("require('./qa-perks-harness.cjs')","require('./qa-50-harness.cjs')")
 .replace("preload:[path.join(DIST,'perks.js')]","preload:[path.join(DIST,'knights.js'),path.join(DIST,'perks.js')]")
 .replace('assert.equal(all.length,7)','assert.equal(all.length,57)')
 .replace('assert.equal(new Set(all.map(p=>p.id)).size,7)','assert.equal(new Set(all.map(p=>p.id)).size,57)')
 .replace('assert.equal(cards.length,7)','assert.equal(cards.length,12)')
 .replace('work/qa-perks-results.json','work/qa-50-perks-regression-results.json');
const target=new Module(path.resolve('work/qa-50-adapted-perks.cjs'),module);
target.filename=path.resolve('work/qa-50-adapted-perks.cjs');target.paths=module.paths;target._compile(source,target.filename);
