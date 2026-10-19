'use strict';
/* Browser-free regression harness. It does not modify any shipping source. */
const fs=require('node:fs');
const path=require('node:path');
const {createHarness}=require('./qa-game.cjs');
const DIST=path.resolve('work/noc-eksponatow/dist');
function createUI(saved=null,options={}) {
 const h=createHarness(path.join(DIST,'game.js'),{testMode:!!options.testMode,preload:[path.join(DIST,"knights.js"),path.join(DIST,"perks.js")]});
 const doc=h.document, elements=new Map(),storage=new Map();
 if(saved!==null)storage.set('museum-night-v1',typeof saved==='string'?saved:JSON.stringify(saved));
 const noop=()=>{};
 class El {
  constructor(tag='div') {this.tagName=tag.toUpperCase();this.children=[];this.parentElement=null;this.listeners={};this.attrs={};this.style={setProperty(k,v){this[k]=v;}};this.clientWidth=900;this.offsetWidth=160;this.dataset={};this.disabled=false;this.value='';this.isConnected=true;this._text='';this._html='';this._classes=new Set();this.width=1440;this.height=810;this.classList={add:(...v)=>v.forEach(x=>this._classes.add(x)),remove:(...v)=>v.forEach(x=>this._classes.delete(x)),contains:v=>this._classes.has(v),toggle:(v,force)=>{const val=force===undefined?!this._classes.has(v):!!force;if(val)this._classes.add(v);else this._classes.delete(v);return val;}};}
  set className(v){this._classes=new Set(String(v).split(/\s+/).filter(Boolean));}get className(){return [...this._classes].join(' ');}
  set textContent(v){this._text=String(v??'');this.children=[];this._html='';}get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
  set innerHTML(v){this._html=String(v);this._text='';this.children=[];parse(this._html,this);}get innerHTML(){return this._html;}
  setAttribute(k,v){this.attrs[k]=String(v);if(k==='id'){this.id=String(v);elements.set(this.id,this);}if(k==='class')this.className=v;if(k==='disabled')this.disabled=true;if(k==='value')this.value=String(v);if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(v);}
  getAttribute(k){return this.attrs[k]??null;}removeAttribute(k){delete this.attrs[k];if(k==='disabled')this.disabled=false;}
  addEventListener(t,cb){(this.listeners[t]??=[]).push(cb);}removeEventListener(t,cb){this.listeners[t]=(this.listeners[t]||[]).filter(x=>x!==cb);}
  dispatchEvent(e){e.target??=this;e.preventDefault??=noop;e.stopPropagation??=noop;for(const cb of this.listeners[e.type]||[])cb(e);return true;}
  click(){if(!this.disabled)this.dispatchEvent({type:'click',target:this});}
  appendChild(c){this.children.push(c);c.parentElement=this;return c;}append(...cs){cs.forEach(c=>this.appendChild(c));}
  replaceChildren(...cs){this.children=[];this._text='';cs.forEach(c=>this.appendChild(c));}
  querySelectorAll(selector){const all=[];for(const c of this.children){if(match(c,selector))all.push(c);all.push(...c.querySelectorAll(selector));}return all;}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
  closest(selector){for(let e=this;e;e=e.parentElement)if(match(e,selector))return e;return null;}
  matches(selector){return match(this,selector);}getContext(){return h.ctx;}focus(){doc.activeElement=this;}blur(){if(doc.activeElement===this)doc.activeElement=null;}
  scrollIntoView(){}setPointerCapture(){}contains(node){return node===this||this.children.some(c=>c.contains(node));}getClientRects(){return this.classList.contains('hidden')?[]:[this.getBoundingClientRect()];}get offsetLeft(){return Math.max(0,this.parentElement?.children.indexOf(this)||0)*180;}getBoundingClientRect(){return{x:0,y:0,left:0,top:0,right:1440,bottom:810,width:1440,height:810};}
 }
 function match(e,s){return s.split(',').some(part=>{let v=part.trim();const chain=v.split(/\s+/);if(chain.length>1){const tail=chain.pop(),prefix=chain.join(' ');if(!match(e,tail))return false;for(let parent=e.parentElement;parent;parent=parent.parentElement)if(match(parent,prefix))return true;return false;}if(v.includes(':not(.hidden)')&&e.classList.contains('hidden'))return false;if(v.includes(':not(:disabled)')&&e.disabled)return false;v=v.replace(/:not\([^)]*\)/g,'');if(v.startsWith('#'))return e.id===v.slice(1);const attr=v.match(/\[([^=\]]+)(?:=["']?([^"'\]]+)["']?)?\]/);if(attr){if(!(attr[1] in e.attrs))return false;if(attr[2]!==undefined&&e.attrs[attr[1]]!==attr[2])return false;v=v.replace(attr[0],'');}const classes=[...v.matchAll(/\.([\w-]+)/g)].map(m=>m[1]);if(classes.some(c=>!e.classList.contains(c)))return false;const tag=v.split('.')[0];return !tag||e.tagName===tag.toUpperCase();});}
 function parse(html,parent){let stack=[parent];const voids=new Set(['meta','link','img','input','br','hr','source','path']);const tags=/<\/?([a-zA-Z][\w-]*)(\s[^<>]*?)?\s*\/?>/g;let m;while((m=tags.exec(html))){const tag=m[1].toLowerCase();if(m[0][1]==='/'){const idx=stack.map(e=>e.tagName.toLowerCase()).lastIndexOf(tag);if(idx>0)stack.length=idx;continue;}const el=new El(tag);for(const a of(m[2]||'').matchAll(/([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))el.setAttribute(a[1],a[2]??a[3]??a[4]??'');stack.at(-1).appendChild(el);if(!voids.has(tag)&&!m[0].endsWith('/>'))stack.push(el);}}
 const root=new El('root');parse(fs.readFileSync(path.join(DIST,'index.html'),'utf8'),root);for(const select of root.querySelectorAll('select')){select.value=(select.children.find(o=>'selected' in o.attrs)||select.children[0])?.value||'';}
 doc.getElementById=id=>{if(!elements.has(id))throw new Error('UI requested missing markup #'+id);return elements.get(id);};doc.querySelector=s=>root.querySelector(s);doc.querySelectorAll=s=>root.querySelectorAll(s);doc.createElement=t=>new El(t);doc.body=root.querySelector('body');doc.documentElement=root.querySelector('html');
 const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};h.sandbox.localStorage=localStorage;h.window.localStorage=localStorage;h.window.scrollTo=noop;h.window.MuseumArt={drawArena:noop,drawKnight:noop,drawRex:noop,drawGuardScene:noop};
 for(const f of ['loot.js','ui.js']){const p=path.join(DIST,f);if(fs.existsSync(p))h.eval(fs.readFileSync(p,'utf8'));}
 return {...h,el:id=>doc.getElementById(id),readProfile:()=>JSON.parse(storage.get('museum-night-v1')),storage,root,seconds(n){h.step(Math.ceil(n*60));},click(id){doc.getElementById(id).click();}};
}
module.exports={createUI,DIST};
