#!/usr/bin/env node
'use strict';
/** Deterministic browser-free combat QA. Does not alter game sources. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

function createHarness(file, options={}) {
  let now = 0, nextId = 1;
  const raf = new Map(), timers = new Map(), events = new Map(), dom = new Map();
  const reports = { drawCalls: 0, events: [], errors: [] };
  function eventTarget(name) {
    const listeners = new Map();
    return {
      addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); },
      removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
      dispatchEvent(event) { for (const cb of listeners.get(event.type) || []) cb(event); return true; },
      _listeners: listeners,
    };
  }
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({
    canvas: null,
    measureText: t => ({width: String(t).length * 8}),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    createPattern: () => gradient,
    getImageData: () => ({data: new Uint8ClampedArray(4)}),
  }, { get(obj, key) { if (key in obj) return obj[key]; if (typeof key === 'symbol') return undefined; return (...args) => { reports.drawCalls++; }; }, set(obj,key,value) {obj[key]=value; return true;} });
  function element(id) {
    if (dom.has(id)) return dom.get(id);
    const e = Object.assign(eventTarget(id), {
      id, width:1280, height:720, clientWidth:1280, clientHeight:720,
      style: {}, dataset:{}, textContent:'', innerHTML:'', hidden:false,
      classList:{add(){},remove(){},toggle(){},contains(){return false;}},
      getContext: () => ctx,
      getBoundingClientRect: () => ({x:0,y:0,left:0,top:0,right:1280,bottom:720,width:1280,height:720}),
      querySelector: () => null, querySelectorAll: () => [],
      appendChild(){},setAttribute(){},removeAttribute(){},focus(){},
    });
    dom.set(id,e);return e;
  }
  const canvas = element('gameCanvas'); ctx.canvas=canvas;
  const window = Object.assign(eventTarget('window'), {innerWidth:1280,innerHeight:720,devicePixelRatio:1});
  const document = Object.assign(eventTarget('document'), {
    hidden:false,visibilityState:'visible',getElementById:element,
    querySelector: selector => element(selector.replace(/^#/,'')),
    querySelectorAll: () => [],createElement: tag => element(tag+nextId++),
    body:element('body'),documentElement:element('html'),
  });
  let randomSeed = 0x771e;
  const math = Object.create(Math);math.random=() => {randomSeed=(Math.imul(1664525,randomSeed)+1013904223)>>>0;return randomSeed/4294967296;};
  class CustomEvent { constructor(type,opts={}) {this.type=type;this.detail=opts.detail;} }
  class Event { constructor(type,opts={}) {this.type=type;Object.assign(this,opts);} preventDefault(){} stopPropagation(){} }
  const requestAnimationFrame = cb => {const id=nextId++;raf.set(id,cb);return id;};
  const cancelAnimationFrame = id => raf.delete(id);
  function setTimeout_(cb,delay=0,...args){const id=nextId++;timers.set(id,{cb:()=>cb(...args),at:now+delay});return id;}
  function clearTimeout_(id){timers.delete(id);}
  const localStorage = {getItem:()=>null,setItem(){},removeItem(){}};
  const sandbox = {
    window, document, console, Math:math, Date, performance:{now:()=>now},
    __MUSEUM_TEST__: !!options.testMode, structuredClone,
    requestAnimationFrame,cancelAnimationFrame,setTimeout:setTimeout_,clearTimeout:clearTimeout_,
    setInterval:setTimeout_,clearInterval:clearTimeout_,CustomEvent,Event,
    localStorage,devicePixelRatio:1,innerWidth:1280,innerHeight:720,
    navigator:{userAgent:'Node QA',maxTouchPoints:0},
    Image:class {constructor(){this.complete=true;this.width=1;this.height=1;}},
    Audio:class {play(){return Promise.resolve();}pause(){}},
    ResizeObserver:class {observe(){}disconnect(){}},
    matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){}}),
  };
  Object.assign(window,sandbox);window.window=window;window.self=window;
  sandbox.self=window;
  sandbox.globalThis=sandbox;
  const context=vm.createContext(sandbox);
  for (const preload of options.preload || []) vm.runInContext(fs.readFileSync(preload,'utf8'),context,{filename:preload});
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
  function step(count=1,dt=1000/60) {
    for(let frame=0;frame<count;frame++){
      now+=dt;
      for(const [id,t] of [...timers]) if(t.at<=now){timers.delete(id);t.cb();}
      const callbacks=[...raf.values()];raf.clear();for(const cb of callbacks)cb(now);
    }
  }
  function key(code,down=true){
    const event=new Event(down?'keydown':'keyup',{code,key:({KeyA:'a',KeyD:'d',KeyJ:'j',KeyK:'k',KeyL:'l',Space:' ',ArrowLeft:'ArrowLeft',ArrowRight:'ArrowRight'})[code]||code,repeat:false});
    window.dispatchEvent(event);document.dispatchEvent(event);
  }
  return {window,document,context,sandbox,canvas,ctx,dom,reports,step,key,get now(){return now;},eval:code=>vm.runInContext(code,context)};
}

function main(){
  const file=path.resolve(process.argv[2]||'work/noc-eksponatow/dist/game.js');
  if(!fs.existsSync(file)){console.error('Game source not written yet: '+file);process.exitCode=2;return;}
  const art=path.join(path.dirname(file),'art.js');
  const h=createHarness(file,{testMode:true,preload:fs.existsSync(art)?[art]:[]});
  console.log('Loaded game.js; browser APIs available. Window exports:',Object.keys(h.window).filter(k=>/game|fight|museum|noc/i.test(k)));
  h.step(120);
  console.log('PASS: 120 pre-start frames without errors.');
}

module.exports={createHarness};
if(require.main===module)main();
