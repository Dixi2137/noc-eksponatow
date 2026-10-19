/* Crates spend earned museum tokens. PLN prices are previews, not live payments. */
(() => {
 'use strict';
 const categories=Object.freeze([
  {id:'elements',name:'Smoki i Żywioły',color:'#f69b55'},
  {id:'shadow',name:'Mrok i Widma',color:'#b997ee'},
  {id:'nature',name:'Dzika Natura',color:'#84ca91'},
  {id:'royal',name:'Korona i Honor',color:'#eccd76'},
  {id:'forge',name:'Kuźnia i Technika',color:'#d99c7b'},
  {id:'desert',name:'Piaski i Szlaki',color:'#d8ba86'},
  {id:'special',name:'Eksponaty Specjalne',color:'#76d5d9'}
 ].map(Object.freeze));
 function getCategory(id) { return categories.find(category=>category.id===id)||null; }
 const categoryNumbers=Object.freeze({
  elements:[5,6,7,16,18,22,23,33,35,42,43,44,47,50],
  shadow:[2,10,11,13,17,21,24,27,34,39],
  nature:[4,12,25,32,40,45,46],
  royal:[1,3,8,15,28,31,38,41],
  forge:[14,19,29,30,36,37,49],
  desert:[9,20,26,48]
 });
 const originalCategories=Object.freeze({brass:'forge',frost:'elements',obsidian:'shadow',verdigris:'nature',ember:'elements',royal:'royal',solar:'royal','stachu-jones':'special'});
 function skinCategory(id) {
  if(Object.hasOwn(originalCategories,id))return originalCategories[id];
  const number=Number(id.replace(/^knight-/,''));
  return Object.keys(categoryNumbers).find(category=>categoryNumbers[category].includes(number));
 }
 const crates = Object.freeze([
  {id:'gallery',name:'Skrzynia Galerii',title:'Skrzynia Galerii',tag:'KLASYK',cost:600,pricePLN:19.99,
   description:'Nowy strój z całej kolekcji muzealnej. Od klasycznej stali po legendarny blask.',
   guarantee:'1 nowy skin · wszystkie rzadkości',color:'#90cce8',
   rarityWeights:Object.freeze({common:55,rare:28,epic:14,legendary:3})},
  {id:'treasury',name:'Skarbiec Królów',title:'Skarbiec Królów',tag:'EPICKA+',cost:1800,pricePLN:49.99,
   description:'Królewski wybór wyłącznie spośród epickich i legendarnych zbroi.',
   guarantee:'1 nowy skin · minimum epicki',color:'#c4a1f0',
   rarityWeights:Object.freeze({common:0,rare:0,epic:85,legendary:15})},
  {id:'relic',name:'Relikwiarz Legend',title:'Relikwiarz Legend',tag:'LEGENDA',cost:4500,pricePLN:99.99,
   description:'Najrzadsze eksponaty w jednym relikwiarzu. Każde otwarcie to nowa legenda.',
   guarantee:'1 nowy skin · gwarantowany legendarny',color:'#f0ca72',
   rarityWeights:Object.freeze({common:0,rare:0,epic:0,legendary:100})},
  {id:'elements',categoryId:'elements',name:'Archiwum Żywiołów',title:'Archiwum Żywiołów',tag:'ŻYWIOŁY',cost:1200,pricePLN:34.99,
   description:'Smoczy ogień, lodowe pancerze i potęga burzy. Zbroje władające siłami natury.',
   guarantee:'1 nowy skin · tylko smoki i żywioły',color:'#f69b55',
   rarityWeights:Object.freeze({common:35,rare:38,epic:22,legendary:5})},
  {id:'shadow',categoryId:'shadow',name:'Sarkofag Cieni',title:'Sarkofag Cieni',tag:'MROK',cost:1000,pricePLN:29.99,
   description:'Widmowe pancerze, krucze płaszcze i tajemnice nocnej straży.',
   guarantee:'1 nowy skin · tylko mrok i widma',color:'#b997ee',
   rarityWeights:Object.freeze({common:40,rare:42,epic:18,legendary:0})},
  {id:'nature',categoryId:'nature',name:'Skrzynia Pradawnej Puszczy',title:'Skrzynia Pradawnej Puszczy',tag:'NATURA',cost:1100,pricePLN:32.99,
   description:'Leśni obrońcy, dzikie bestie i zbroje z najdalszych zakątków puszczy.',
   guarantee:'1 nowy skin · tylko dzika natura',color:'#84ca91',
   rarityWeights:Object.freeze({common:38,rare:40,epic:18,legendary:4})},
  {id:'royal',categoryId:'royal',name:'Królewski Arsenał',title:'Królewski Arsenał',tag:'KORONA',cost:1500,pricePLN:44.99,
   description:'Herby wielkich rodów, królewskie płaszcze i stal zaprzysiężonej gwardii.',
   guarantee:'1 nowy skin · tylko korona i honor',color:'#eccd76',
   rarityWeights:Object.freeze({common:30,rare:40,epic:24,legendary:6})},
  {id:'forge',categoryId:'forge',name:'Warsztat Mechanika',title:'Warsztat Mechanika',tag:'KUŹNIA',cost:1300,pricePLN:39.99,
   description:'Miedź, kryształ i maszyny. Pancerze wykute z pomysłowości muzealnych mistrzów.',
   guarantee:'1 nowy skin · tylko kuźnia i technika',color:'#d99c7b',
   rarityWeights:Object.freeze({common:30,rare:42,epic:23,legendary:5})},
  {id:'desert',categoryId:'desert',name:'Karawana Piasków',title:'Karawana Piasków',tag:'PIASKI',cost:1000,pricePLN:29.99,
   description:'Wędrowcy, błędni rycerze i złote skorpiony ze szlaków poza horyzontem.',
   guarantee:'1 nowy skin · tylko piaski i szlaki',color:'#d8ba86',
   rarityWeights:Object.freeze({common:42,rare:50,epic:0,legendary:8})}
 ].map(crate=>Object.freeze({family:crate.categoryId?'themed':'classic',categoryId:null,...crate})));
 function getCrate(id='gallery') { return crates.find(crate=>crate.id===id)||null; }
 const COST = crates[0].cost;
 const rarityWeights = crates[0].rarityWeights;
 const rarities = Object.freeze({
  basic: {name:'PODSTAWOWY',color:'#d5b878'},
  common: {name:'ZWYKŁY',color:'#b8c4cf'},
  rare: {name:'RZADKI',color:'#90cce8'},
  epic: {name:'EPICKI',color:'#c4a1f0'},
  legendary: {name:'LEGENDARNY',color:'#f0ca72'}
 });
 const skins = Object.freeze([
  {id:'brass',name:'STARA GWARDIA',era:'STAL · KOLEKCJA PODSTAWOWA',rarity:'basic',weight:0},
  {id:'stachu-jones',name:'Stachu Jones',era:'EKSPONAT SPECJALNY · PREZENT DLA CIEBIE',description:'Siwy wąs, granatowy płaszcz i kosa. Rycerz ostatniego obchodu.',rarity:'legendary',weight:0,gift:true},
  {id:'frost',name:'MROŹNY RELIKT',era:'SREBRO · RZADKI EKSPONAT',rarity:'rare',weight:20},
  {id:'obsidian',name:'CZARNY KUSTOSZ',era:'OBSYDIAN · RZADKI EKSPONAT',rarity:'rare',weight:20},
  {id:'verdigris',name:'PATYNA WIEKÓW',era:'PATYNA · RZADKI EKSPONAT',rarity:'rare',weight:20},
  {id:'ember',name:'ŻAR KUŹNI',era:'OGIEŃ · EPICKI EKSPONAT',rarity:'epic',weight:15},
  {id:'royal',name:'KRÓLEWSKA WARTA',era:'AMETYST · EPICKI EKSPONAT',rarity:'epic',weight:15},
  {id:'solar',name:'SŁONECZNY PALADYN',era:'ZŁOTO · LEGENDARNY EKSPONAT',rarity:'legendary',weight:10},
  ...window.MuseumKnights.skins.map(skin => ({...skin,era:skin.description.toLocaleUpperCase('pl'),weight:rarityWeights[skin.rarity]}))
 ].map(skin=>Object.freeze({...skin,categoryId:skinCategory(skin.id)})));
 const integer = value => Number.isFinite(Number(value)) ? Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Number(value)))) : 0;
 function migrate(saved) {
  const source = saved && typeof saved === 'object' ? saved : {};
  const inventory = Array.isArray(source.owned) ? source.owned : [];
  const owned = skins.filter(s => s.id === 'brass' || s.gift || inventory.includes(s.id)).map(s => s.id);
  const pendingReward=source.pendingReward !== 'brass' && owned.includes(source.pendingReward) ? source.pendingReward : null;
  return {
   coins:integer(source.coins),owned,
   skin:owned.includes(source.skin) ? source.skin : 'brass',sound:!!source.sound,
   lootVersion:2,freeCrates:Number(source.lootVersion)>=2 ? Math.min(1,integer(source.freeCrates)) : 1,
   pendingReward,pendingCrateId:pendingReward ? (getCrate(source.pendingCrateId)||crates[0]).id : null,
   // Night patrol progress: ids of cleared levels and the level chosen for the next night.
   cleared:Array.isArray(source.cleared) ? source.cleared.filter(id=>typeof id==='string') : [],
   level:typeof source.level==='string' ? source.level : null,
   exhibit:typeof source.exhibit==='string' ? source.exhibit : null,
   weapon:typeof source.weapon==='string' ? source.weapon : 'sword'
  };
 }
 function remaining(profile,crateId='gallery') {
  const crate=getCrate(crateId);
  return crate ? skins.filter(s => s.weight > 0 && crate.rarityWeights[s.rarity]>0 && (!crate.categoryId||s.categoryId===crate.categoryId) && !profile.owned.includes(s.id)) : [];
 }
 function odds(profile,crateId='gallery') {
  const crate=getCrate(crateId),pool=remaining(profile,crateId);
  const result={common:0,rare:0,epic:0,legendary:0};
  if(!crate)return result;
  const tiers=Object.keys(crate.rarityWeights).filter(tier=>crate.rarityWeights[tier]>0&&pool.some(s=>s.rarity===tier));
  const total=tiers.reduce((sum,tier)=>sum+crate.rarityWeights[tier],0);
  for(const tier of tiers) result[tier]=crate.rarityWeights[tier]/total*100;
  return result;
 }
 function entries(profile,crateId='gallery') {
  const pool=remaining(profile,crateId),chances=odds(profile,crateId);
  const counts=pool.reduce((result,skin)=>(result[skin.rarity]=(result[skin.rarity]||0)+1,result),{});
  return pool.map(skin=>({skin,chance:chances[skin.rarity]/counts[skin.rarity]}));
 }
 function randomValue() {
  if(window.crypto?.getRandomValues){const value=new Uint32Array(1);window.crypto.getRandomValues(value);return value[0]/4294967296;}
  return Math.random();
 }
 function draw(profile, random=randomValue,crateId='gallery') {
  const crate=getCrate(crateId);
  if(!crate)return null;
  const pool=remaining(profile,crateId);
  const tiers=Object.keys(crate.rarityWeights).map(rarity=>({rarity,weight:crate.rarityWeights[rarity],skins:pool.filter(s=>s.rarity===rarity)})).filter(tier=>tier.weight>0&&tier.skins.length);
  const total=tiers.reduce((sum,tier)=>sum+tier.weight,0);
  if(!total)return null;
  const value=Number(random());
  let roll=Math.min(1-Number.EPSILON,Math.max(0,Number.isFinite(value)?value:.5))*total;
  for(const tier of tiers){
   if(roll<tier.weight) return tier.skins[Math.min(tier.skins.length-1,Math.floor(roll/tier.weight*tier.skins.length))];
   roll-=tier.weight;
  }
  return pool.at(-1);
 }
 function reserve(profile, random=randomValue,crateId='gallery') {
  const crate=getCrate(crateId);
  if(!crate||profile.pendingReward)return null;
  const free=crate.id==='gallery'&&profile.freeCrates>0,cost=free?0:crate.cost;
  if(profile.coins<cost)return null;
  const reward=draw(profile,random,crateId);
  if(!reward)return null;
  return {reward,cost,free,crate,profile:{...profile,coins:profile.coins-cost,freeCrates:free?profile.freeCrates-1:profile.freeCrates,owned:[...profile.owned,reward.id],pendingReward:reward.id,pendingCrateId:crate.id}};
 }
 function claim(profile, {equip=false}={}) {
  const reward=skins.find(s=>s.id===profile.pendingReward);
  return {...profile,skin:equip&&reward&&profile.owned.includes(reward.id)?reward.id:profile.skin,pendingReward:null,pendingCrateId:null};
 }
 window.MuseumLoot=Object.freeze({COST,categories,getCategory,crates,getCrate,skins,rarities,rarityWeights,migrate,remaining,odds,entries,draw,reserve,claim});
})();
