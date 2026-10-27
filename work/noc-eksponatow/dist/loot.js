/* Crates spend earned museum tokens. PLN prices are previews, not live payments.
   Items (skins, weapons, cards) share one catalogue with a value per rarity; selling, upgrades and the daily bonus live here too. */
(() => {
 'use strict';
 const weaponsApi=window.MuseumWeapons,cardsApi=window.MuseumCards,finishesApi=window.MuseumFinishes;
 const categories=Object.freeze([
  {id:'arsenal',name:'Arsenał',color:'#c9b37a'},
  {id:'heroes',name:'Bohaterowie',color:'#d9a0c6'},
  {id:'antiquity',name:'Starożytność',color:'#d8ba86'},
  {id:'medieval',name:'Średniowiecze',color:'#9fb8c9'},
  {id:'renaissance',name:'Nowożytność',color:'#c9a65a'},
  {id:'modern',name:'Wiek XIX i XX',color:'#8a9aa8'},
  {id:'contemporary',name:'Współczesność',color:'#7ab0a0'},
  {id:'elements',name:'Smoki i Żywioły',color:'#f69b55'},
  {id:'shadow',name:'Mrok i Widma',color:'#b997ee'},
  {id:'nature',name:'Dzika Natura',color:'#84ca91'},
  {id:'royal',name:'Korona i Honor',color:'#eccd76'},
  {id:'forge',name:'Kuźnia i Technika',color:'#d99c7b'},
  {id:'desert',name:'Piaski i Szlaki',color:'#d8ba86'},
  {id:'special',name:'Eksponaty Specjalne',color:'#76d5d9'},
  {id:'finishes',name:'Limitowane wykończenia',color:'#7ff0e0'}
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
  if(Object.prototype.hasOwnProperty.call(originalCategories,id))return originalCategories[id];
  const number=Number(id.replace(/^knight-/,''));
  return Object.keys(categoryNumbers).find(category=>categoryNumbers[category].includes(number));
 }
 const crates = Object.freeze([
  {id:'gallery',name:'Skrzynia Galerii',title:'Skrzynia Galerii',tag:'KLASYK',cost:900,pricePLN:29.99,
   description:'Nowy strój z całej kolekcji muzealnej. Od klasycznej stali po legendarny blask.',
   guarantee:'1 nowy skin · wszystkie rzadkości',glyph:'✦',color:'#90cce8',
   rarityWeights:Object.freeze({common:55,rare:28,epic:14,legendary:3})},
  {id:'treasury',name:'Skarbiec Królów',title:'Skarbiec Królów',tag:'EPICKA+',cost:3000,pricePLN:79.99,
   description:'Królewski wybór wyłącznie spośród epickich i legendarnych zbroi.',
   guarantee:'1 nowy skin · minimum epicki',glyph:'♜',color:'#c4a1f0',
   rarityWeights:Object.freeze({common:0,rare:0,epic:85,legendary:15})},
  {id:'relic',name:'Relikwiarz Legend',title:'Relikwiarz Legend',tag:'LEGENDA',cost:7500,pricePLN:149.99,
   description:'Najrzadsze eksponaty w jednym relikwiarzu. Każde otwarcie to nowa legenda.',
   guarantee:'1 nowy skin · gwarantowany legendarny',glyph:'✪',color:'#f0ca72',
   rarityWeights:Object.freeze({common:0,rare:0,epic:0,legendary:100})},
  {id:'elements',categoryId:'elements',name:'Archiwum Żywiołów',title:'Archiwum Żywiołów',tag:'ŻYWIOŁY',cost:1800,pricePLN:44.99,
   description:'Smoczy ogień, lodowe pancerze i potęga burzy. Zbroje władające siłami natury.',
   guarantee:'1 nowy skin · tylko smoki i żywioły',glyph:'⚡',color:'#f69b55',
   rarityWeights:Object.freeze({common:35,rare:38,epic:22,legendary:5})},
  {id:'shadow',categoryId:'shadow',name:'Sarkofag Cieni',title:'Sarkofag Cieni',tag:'MROK',cost:1500,pricePLN:39.99,
   description:'Widmowe pancerze, krucze płaszcze i tajemnice nocnej straży.',
   guarantee:'1 nowy skin · tylko mrok i widma',glyph:'☾',color:'#b997ee',
   rarityWeights:Object.freeze({common:40,rare:42,epic:18,legendary:0})},
  {id:'nature',categoryId:'nature',name:'Skrzynia Pradawnej Puszczy',title:'Skrzynia Pradawnej Puszczy',tag:'NATURA',cost:1600,pricePLN:42.99,
   description:'Leśni obrońcy, dzikie bestie i zbroje z najdalszych zakątków puszczy.',
   guarantee:'1 nowy skin · tylko dzika natura',glyph:'✿',color:'#84ca91',
   rarityWeights:Object.freeze({common:38,rare:40,epic:18,legendary:4})},
  {id:'royal',categoryId:'royal',name:'Królewski Arsenał',title:'Królewski Arsenał',tag:'KORONA',cost:2200,pricePLN:54.99,
   description:'Herby wielkich rodów, królewskie płaszcze i stal zaprzysiężonej gwardii.',
   guarantee:'1 nowy skin · tylko korona i honor',glyph:'♛',color:'#eccd76',
   rarityWeights:Object.freeze({common:30,rare:40,epic:24,legendary:6})},
  {id:'forge',categoryId:'forge',name:'Warsztat Mechanika',title:'Warsztat Mechanika',tag:'KUŹNIA',cost:1900,pricePLN:47.99,
   description:'Miedź, kryształ i maszyny. Pancerze wykute z pomysłowości muzealnych mistrzów.',
   guarantee:'1 nowy skin · tylko kuźnia i technika',glyph:'⚙',color:'#d99c7b',
   rarityWeights:Object.freeze({common:30,rare:42,epic:23,legendary:5})},
  {id:'desert',categoryId:'desert',name:'Karawana Piasków',title:'Karawana Piasków',tag:'PIASKI',cost:1500,pricePLN:39.99,
   description:'Wędrowcy, błędni rycerze i złote skorpiony ze szlaków poza horyzontem.',
   guarantee:'1 nowy skin · tylko piaski i szlaki',glyph:'✧',color:'#d8ba86',
   rarityWeights:Object.freeze({common:42,rare:50,epic:0,legendary:8})},
  {id:'heroes-gallery',categoryId:'heroes',name:'Galeria Legend',title:'Galeria Legend',tag:'POSTACI',cost:2400,pricePLN:59.99,
   description:'Grywalne postaci z kart historii: od Aleksandra i Kleopatry po Piłsudskiego i Gagarina. Każda z własnym kostiumem i atutem.',
   guarantee:'1 nowa postać · rzadkie i lepsze',glyph:'♛',color:'#d9a0c6',
   rarityWeights:Object.freeze({common:0,rare:30,epic:55,legendary:15})},
  {id:'armory',family:'weapons',pool:'weapon',name:'Arsenał Kustosza',title:'Arsenał Kustosza',tag:'BROŃ',cost:1500,pricePLN:39.99,
   description:'Sto dwadzieścia broni od maczugi po Barretta. Każda zmienia rytm walki.',
   guarantee:'1 nowa broń · wszystkie rzadkości',glyph:'⚔',color:'#c9b37a',
   rarityWeights:Object.freeze({common:45,rare:30,epic:18,legendary:7})},
  {id:'heroes',family:'cards',pool:'card',name:'Archiwum Bohaterów',title:'Archiwum Bohaterów',tag:'KARTY',cost:1200,pricePLN:34.99,
   description:'Karty prawdziwych bohaterów historii z pasywnym bonusem oraz karty broni.',
   guarantee:'1 nowa karta · bohaterowie i broń',color:'#d9a0c6',glyph:'♞',
   rarityWeights:Object.freeze({common:40,rare:35,epic:19,legendary:6})},
  {id:'pantheon',family:'cards',pool:'card',categoryId:'heroes',name:'Panteon Bohaterów',title:'Panteon Bohaterów',tag:'KARTY',cost:1500,pricePLN:39.99,
   description:'Tylko karty bohaterów: Sobieski, Joanna d\u2019Arc, Chrobry i reszta panteonu. Każda z pasywnym bonusem.',
   guarantee:'1 nowa karta · tylko bohaterowie',color:'#e8a0c8',glyph:'♚',
   rarityWeights:Object.freeze({common:35,rare:35,epic:22,legendary:8})},
  {id:'blueprints',family:'cards',pool:'card',categoryId:'arsenal',name:'Plany Broni',title:'Plany Broni',tag:'KARTY',cost:800,pricePLN:22.99,
   description:'Karty broni: +10% obrażeń do pasującej broni, rewolwer dostaje dodatkowe naboje.',
   guarantee:'1 nowa karta broni',color:'#9fb8c9',glyph:'✎',
   rarityWeights:Object.freeze({common:45,rare:30,epic:18,legendary:7})},
  {id:'blades',family:'weapons',group:'weapon-type',pool:'weapon',weaponType:'blade',name:'Zbrojownia Ostrzy',title:'Zbrojownia Ostrzy',tag:'OSTRZA',cost:1800,pricePLN:44.99,
   description:'Od xiphosa i gladiusa po katanę, zweihänder i Szczerbiec. Wszystko, co tnie.',guarantee:'1 nowa broń · tylko ostrza',color:'#c9d6dc',glyph:'⚔',
   rarityWeights:Object.freeze({common:42,rare:30,epic:20,legendary:8})},
  {id:'heavy',family:'weapons',group:'weapon-type',pool:'weapon',weaponType:'heavy',name:'Kuźnia Ciężka',title:'Kuźnia Ciężka',tag:'CIĘŻKA',cost:1800,pricePLN:44.99,
   description:'Topory, młoty, morgensztern. Wolne, ale po jednym ciosie nikt nie wstaje.',guarantee:'1 nowa broń · tylko ciężka',color:'#a8a8b0',glyph:'⚒',
   rarityWeights:Object.freeze({common:45,rare:32,epic:23,legendary:0})},
  {id:'polearms',family:'weapons',group:'weapon-type',pool:'weapon',weaponType:'polearm',name:'Sala Drzewcowa',title:'Sala Drzewcowa',tag:'DRZEWCOWA',cost:1600,pricePLN:39.99,
   description:'Włócznie, trójząb, halabarda, pika. Trafiają, zanim przeciwnik dojdzie.',guarantee:'1 nowa broń · tylko drzewcowa',color:'#b89a6a',glyph:'↑',
   rarityWeights:Object.freeze({common:45,rare:32,epic:23,legendary:0})},
  {id:'light',family:'weapons',group:'weapon-type',pool:'weapon',weaponType:'light',name:'Gabinet Sztyletów',title:'Gabinet Sztyletów',tag:'LEKKA',cost:1600,pricePLN:39.99,
   description:'Pugio, tantō, kris, kukri, karambit, nóż motylkowy, bagnety. Szybko, blisko, w serii.',guarantee:'1 nowa broń · noże i sztylety',color:'#9ab0c0',glyph:'/',
   rarityWeights:Object.freeze({common:40,rare:36,epic:24,legendary:0})},
  {id:'bows',family:'weapons',group:'weapon-type',pool:'weapon',weaponType:'bow',name:'Łucznia',title:'Łucznia',tag:'ŁUKI I KUSZE',cost:1900,pricePLN:47.99,
   description:'Proca, łuki długie i kompozytowe, kusze z korbą i powtarzalne. Cicho i z daleka.',guarantee:'1 nowa broń · tylko łuki i kusze',color:'#b89a6a',glyph:'⟩',
   rarityWeights:Object.freeze({common:35,rare:40,epic:25,legendary:0})},
  {id:'pistols',family:'weapons',group:'weapon-type',pool:'weapon',weaponType:'pistol',name:'Gabinet Pistoletów',title:'Gabinet Pistoletów',tag:'PISTOLETY',cost:2400,pricePLN:59.99,
   description:'Od skałkowych pojedynkówek po Glocka i Desert Eagle. Rewolwer Kustosza też tu mieszka.',guarantee:'1 nowa broń · tylko pistolety',color:'#d8a060',glyph:'◎',
   rarityWeights:Object.freeze({common:30,rare:35,epic:25,legendary:10})},
  {id:'rifles',family:'weapons',group:'weapon-type',pool:'weapon',weaponType:'rifle',name:'Zbrojownia Karabinów',title:'Zbrojownia Karabinów',tag:'KARABINY',cost:2800,pricePLN:69.99,
   description:'Arkebuz, Mosin, Thompson, AK-47, Barrett. Wszystko, co ma lufę dłuższą niż przedramię.',guarantee:'1 nowa broń · tylko karabiny i strzelby',color:'#8a9aa8',glyph:'▬',
   rarityWeights:Object.freeze({common:30,rare:35,epic:25,legendary:10})},
  {id:'era-antiquity',family:'weapons',group:'weapon-era',pool:'weapon',categoryId:'antiquity',name:'Arsenał Antyku',title:'Arsenał Antyku',tag:'STAROŻYTNOŚĆ',cost:1700,pricePLN:42.99,
   description:'Xiphos, gladius, falcata, labrys, pilum, sarissa, pugio, proca. Brąz i żelazo.',guarantee:'1 nowa broń · starożytność',color:'#d8ba86',glyph:'Λ',
   rarityWeights:Object.freeze({common:55,rare:45,epic:0,legendary:0})},
  {id:'era-medieval',family:'weapons',group:'weapon-era',pool:'weapon',categoryId:'medieval',name:'Arsenał Średniowiecza',title:'Arsenał Średniowiecza',tag:'ŚREDNIOWIECZE',cost:2000,pricePLN:49.99,
   description:'Miecze, topory, młoty, halabardy, łuki i kusze. Pełna zbrojownia zamku, ze Szczerbcem na czele.',guarantee:'1 nowa broń · średniowiecze',color:'#9fb8c9',glyph:'♜',
   rarityWeights:Object.freeze({common:40,rare:32,epic:22,legendary:6})},
  {id:'era-renaissance',family:'weapons',group:'weapon-era',pool:'weapon',categoryId:'renaissance',name:'Arsenał Nowożytny',title:'Arsenał Nowożytny',tag:'NOWOŻYTNOŚĆ',cost:2000,pricePLN:49.99,
   description:'Szabla husarska, katana, zweihänder, kopia, rapier, pistolety skałkowe, muszkiety.',guarantee:'1 nowa broń · nowożytność',color:'#c9a65a',glyph:'♛',
   rarityWeights:Object.freeze({common:35,rare:40,epic:25,legendary:0})},
  {id:'era-modern',family:'weapons',group:'weapon-era',pool:'weapon',categoryId:'modern',name:'Arsenał XX Wieku',title:'Arsenał XX Wieku',tag:'XIX–XX W.',cost:2800,pricePLN:69.99,
   description:'Szable kawaleryjskie, bagnety, Mauser, Luger, Mosin, Thompson i Rewolwer Kustosza. Proch zamiast stali.',guarantee:'1 nowa broń · XIX i XX wiek',color:'#8a9aa8',glyph:'●',
   rarityWeights:Object.freeze({common:30,rare:35,epic:25,legendary:10})},
  {id:'era-contemporary',family:'weapons',group:'weapon-era',pool:'weapon',categoryId:'contemporary',name:'Arsenał Współczesny',title:'Arsenał Współczesny',tag:'WSPÓŁCZESNOŚĆ',cost:3000,pricePLN:74.99,
   description:'Karambit, maczeta, Glock, AK-47, M16, Dragunow, Barrett. Najnowsze eksponaty muzeum.',guarantee:'1 nowa broń · współczesność',color:'#7ab0a0',glyph:'◈',
   rarityWeights:Object.freeze({common:25,rare:35,epic:28,legendary:12})},
  {id:'starter',family:'mixed',pool:'any',name:'Skrzynia Startowa',title:'Skrzynia Startowa',tag:'START',cost:400,pricePLN:9.99,
   description:'Strój, broń albo karta na dobry początek. Tanio i bez niespodzianek.',
   guarantee:'1 nowy przedmiot · zwykły lub rzadki',color:'#a8d08d',glyph:'●',
   rarityWeights:Object.freeze({common:70,rare:30,epic:0,legendary:0})},
  {id:'night',family:'mixed',pool:'any',name:'Skrzynia Nocnej Zmiany',title:'Skrzynia Nocnej Zmiany',tag:'MIESZANA',cost:1200,pricePLN:29.99,
   description:'Wszystko, co może wypaść w muzeum po zmroku: stroje, bronie i karty w jednej skrzyni.',
   guarantee:'1 nowy przedmiot · wszystkie rodzaje i rzadkości',color:'#d5ed71',glyph:'☆',
   rarityWeights:Object.freeze({common:50,rare:30,epic:15,legendary:5})},
  {id:'vault',family:'mixed',pool:'any',name:'Skarbiec Kustosza',title:'Skarbiec Kustosza',tag:'EPICKA+',cost:4000,pricePLN:89.99,
   description:'Epickie i legendarne przedmioty każdego rodzaju. Klucz ma tylko kustosz.',
   guarantee:'1 nowy przedmiot · minimum epicki',color:'#c4a1f0',glyph:'◆',
   rarityWeights:Object.freeze({common:0,rare:0,epic:80,legendary:20})},
  {id:'legends',family:'mixed',pool:'any',name:'Skrzynia Legend',title:'Skrzynia Legend',tag:'LEGENDA',cost:9000,pricePLN:199.99,
   description:'Wyłącznie legendy: najrzadsze stroje, rewolwer, karta Chrobrego. Jedno otwarcie, jedna historia.',
   guarantee:'1 nowy przedmiot · gwarantowany legendarny',color:'#f0ca72',glyph:'★',
   rarityWeights:Object.freeze({common:0,rare:0,epic:0,legendary:100})},
  {id:'collector',name:'Sejf Kolekcjonera',title:'Sejf Kolekcjonera',tag:'LIMITOWANE',cost:12000,pricePLN:199.99,pool:'any',family:'finishes',group:'finishes',
   description:'Stroje, bronie i karty wymieszane z mitycznymi wykończeniami broni: diament i szmaragd, złoty marmur, hologram, aurora, plazma, pieczęć kustosza i reszta limitowanej dwudziestki ósemki. Najwyższa szansa na mityczne poza Atelier, ale wciąż tylko 3%.',
   guarantee:'1 nowy przedmiot · 3% na mityczne wykończenie',color:'#7ff0e0',glyph:'◆',
   rarityWeights:Object.freeze({common:40,rare:30,epic:20,legendary:7,mythic:3})},
  {id:'lacquer',name:'Lakiernia Muzealna',title:'Lakiernia Muzealna',tag:'WYKOŃCZENIA',cost:1200,pricePLN:34.99,pool:'finish',family:'finishes',group:'finishes',
   description:'Cały katalog wykończeń broni w jednej skrzyni: od farby z puszki za parę złotych, przez paski i kropki, po klejnoty, żywioły i mityczne powłoki. Prawie czterysta powłok, większość to bieda.',
   guarantee:'1 nowe wykończenie · wszystkie rzadkości',color:'#e0b060',glyph:'✎',
   rarityWeights:Object.freeze({common:55,rare:28,epic:12,legendary:4.5,mythic:.5})},
  {id:'atelier',name:'Atelier Płatnerza',title:'Atelier Płatnerza',tag:'EPICKIE+',cost:6000,pricePLN:129.99,pool:'finish',family:'finishes',group:'finishes',
   description:'Tylko klejnoty, żywioły i mityczne powłoki. Żadnej farby z puszki, ale mityczne wciąż tylko 3%.',
   guarantee:'1 nowe wykończenie · minimum epickie',color:'#c4a1f0',glyph:'◈',
   rarityWeights:Object.freeze({common:0,rare:0,epic:72,legendary:25,mythic:3})},
  {id:'halloween',season:'halloween',name:'Dynia Kustosza',title:'Dynia Kustosza',tag:'HALLOWEEN',cost:1500,pricePLN:39.99,pool:'finish',family:'finishes',group:'seasonal',
   description:'Sześć wykończeń tylko na Halloween: dynia, kość, pajęczyna, krew, mgła i widmo. Po sezonie skrzynia znika ze sklepu, zdobyte powłoki zostają na zawsze.',
   guarantee:'1 nowe wykończenie · tylko halloweenowe',color:'#e07a2a',glyph:'☾',
   rarityWeights:Object.freeze({common:0,rare:45,epic:35,legendary:20,mythic:0})},
  {id:'christmas',season:'christmas',name:'Gwiazdka Kustosza',title:'Gwiazdka Kustosza',tag:'ŚWIĘTA',cost:1500,pricePLN:39.99,pool:'finish',family:'finishes',group:'seasonal',
   description:'Sześć wykończeń tylko na święta: szron, laska cukrowa, choinka, bombka, piernik i zorza wigilijna. Po Trzech Królach skrzynia znika ze sklepu, zdobyte powłoki zostają.',
   guarantee:'1 nowe wykończenie · tylko świąteczne',color:'#b3202a',glyph:'✶',
   rarityWeights:Object.freeze({common:0,rare:45,epic:35,legendary:20,mythic:0})}
 ].map(crate=>Object.freeze({family:crate.categoryId?'themed':'classic',categoryId:null,pool:'skin',glyph:'✦',weaponType:null,...crate,group:crate.group||crate.family||(crate.categoryId?'themed':'classic'),
  rarityWeights:Object.freeze({...crate.rarityWeights,mythic:crate.rarityWeights.mythic??(crate.cost>=7000?1.2:crate.cost>=2500?.6:.35)})})));
 // Mythic finishes sneak into every crate with a tiny weight (a fraction of a percent), on top of the crate's own pool.
 const crateGroups=Object.freeze([{id:'classic',name:'Skrzynie klasyczne'},{id:'themed',name:'Stroje według motywu'},{id:'weapons',name:'Cała zbrojownia'},{id:'weapon-type',name:'Broń według typu'},{id:'weapon-era',name:'Broń według epoki'},{id:'cards',name:'Karty'},{id:'mixed',name:'Skrzynie mieszane'},{id:'finishes',name:'Limitowane wykończenia broni'},{id:'seasonal',name:'Skrzynie sezonowe'}]);
 // Seasons: month/day windows that repeat every year; the christmas one crosses New Year.
 const SEASONS=Object.freeze({halloween:{from:[10,20],to:[11,3],label:'DO 3 LISTOPADA'},christmas:{from:[12,6],to:[1,6],label:'DO 6 STYCZNIA'}});
 function seasonActive(id,date=new Date()){const s=SEASONS[id];if(!s)return false;const md=(date.getMonth()+1)*100+date.getDate(),a=s.from[0]*100+s.from[1],b=s.to[0]*100+s.to[1];return a<=b?(md>=a&&md<=b):(md>=a||md<=b);}
 function seasonLabel(id){return SEASONS[id]?.label||'';}
 function activeCrates(date=new Date()){return crates.filter(c=>!c.season||seasonActive(c.season,date));}
 function getCrate(id='gallery') { return crates.find(crate=>crate.id===id)||null; }
 const COST = crates[0].cost;
 const rarityWeights = crates[0].rarityWeights;
 const rarities = Object.freeze({
  basic: {name:'PODSTAWOWY',color:'#d5b878'},
  common: {name:'ZWYKŁY',color:'#b8c4cf'},
  rare: {name:'RZADKI',color:'#90cce8'},
  epic: {name:'EPICKI',color:'#c4a1f0'},
  legendary: {name:'LEGENDARNY',color:'#f0ca72'},
  mythic: {name:'MITYCZNY',color:'#7ff0e0'}
 });
 const skins = [
  {id:'brass',name:'STARA GWARDIA',era:'STAL · KOLEKCJA PODSTAWOWA',rarity:'basic',weight:0},
  {id:'stachu-jones',name:'Stachu Jones',era:'EKSPONAT SPECJALNY · PREZENT DLA CIEBIE',description:'Siwy wąs, granatowy płaszcz i kosa. Rycerz ostatniego obchodu.',rarity:'legendary',weight:0,gift:true},
  {id:'frost',name:'MROŹNY RELIKT',era:'SREBRO · RZADKI EKSPONAT',rarity:'rare',weight:20},
  {id:'obsidian',name:'CZARNY KUSTOSZ',era:'OBSYDIAN · RZADKI EKSPONAT',rarity:'rare',weight:20},
  {id:'verdigris',name:'PATYNA WIEKÓW',era:'PATYNA · RZADKI EKSPONAT',rarity:'rare',weight:20},
  {id:'ember',name:'ŻAR KUŹNI',era:'OGIEŃ · EPICKI EKSPONAT',rarity:'epic',weight:15},
  {id:'royal',name:'KRÓLEWSKA WARTA',era:'AMETYST · EPICKI EKSPONAT',rarity:'epic',weight:15},
  {id:'solar',name:'SŁONECZNY PALADYN',era:'ZŁOTO · LEGENDARNY EKSPONAT',rarity:'legendary',weight:10},
  ...window.MuseumKnights.skins.map(skin => ({...skin,era:skin.description.toLocaleUpperCase('pl'),weight:rarityWeights[skin.rarity]}))
 ].map(skin=>Object.freeze({...skin,categoryId:skin.categoryId||skinCategory(skin.id)}));   // mutable: hidden packs add skins at runtime
 // One catalogue for everything a crate can drop or a player can sell.
 const values=Object.freeze({basic:0,common:240,rare:700,epic:1800,legendary:4500,mythic:15000});
 const SELL_RATE=.4, UPGRADE_MAX=5;
 const weaponItem=w=>({kind:'weapon',id:w.id,name:w.name,era:w.era,rarity:w.rarity,icon:w.icon,type:w.type,typeName:w.typeName,summary:w.summary,description:(w.details&&w.details[0])||w.summary,weight:w.rarity==='basic'||w.hidden?0:rarityWeights[w.rarity],categoryId:w.categoryId,...(w.hidden?{hidden:true,gift:true}:{})});
 const items=[
  ...skins.map(skin=>({kind:'skin',...skin})),
  ...weaponsApi.all().map(weaponItem),
  ...cardsApi.all().map(c=>({kind:'card',...c,weight:rarityWeights[c.rarity],categoryId:c.type==='hero'?'heroes':'arsenal'})),
  ...(finishesApi?finishesApi.all():[]).map(x=>({kind:'finish',id:x.id,name:x.name,era:x.era,rarity:x.rarity||'mythic',summary:x.rarity==='mythic'?'Nakładasz na dowolną broń: nowy kolor stali, krawędzi i okuć w walce i w kolekcji. Limitowane, z animacją.':'Nakładasz na dowolną broń: nowy kolor stali, krawędzi i okuć w walce i w kolekcji.',description:x.flavour,weight:100,categoryId:'finishes',fx:x.fx,colors:x.colors,pricePLN:x.pricePLN,...(x.season?{season:x.season}:{})}))
 ].map(Object.freeze);
 const itemsById=new Map(items.map(item=>[item.id,item]));
 // Hidden packs: a weapon or skin registered after the catalogue was built. Weight 0 keeps them out of every crate; gift keeps them unsellable and auto-owned once unlocked.
 function register(pack){
  const added=[];
  for(const w of pack.weapons||[]){if(itemsById.has(w.id))continue;const weapon=weaponsApi.register(w);const item=Object.freeze(weaponItem(weapon));items.push(item);itemsById.set(item.id,item);added.push(item);}
  for(const sk of pack.skins||[]){if(itemsById.has(sk.id))continue;const skin=Object.freeze({id:sk.id,name:sk.name,era:sk.era||'EKSPONAT EKSPERYMENTALNY · ODBLOKOWANY KODEM',description:sk.description||'',rarity:sk.rarity||'mythic',weight:0,gift:true,hidden:true,categoryId:'special',...(Array.isArray(sk.shouts)&&sk.shouts.length?{shouts:Object.freeze(sk.shouts.map(String))}:{}),...(sk.bio?{bio:String(sk.bio)}:{})});skins.push(skin);const item=Object.freeze({kind:'skin',...skin});items.push(item);itemsById.set(item.id,item);added.push(item);}
  return added;
 }
 function getItem(id){return itemsById.get(id)||null;}
 function value(item){const it=typeof item==='string'?getItem(item):item;return it&&!it.gift?values[it.rarity]||0:0;}
 function sellPrice(item){return Math.floor(value(item)*SELL_RATE);}
 function listFor(profile,kind){return kind==='weapon'?profile.weapons:kind==='card'?profile.cards:kind==='finish'?(profile.finishes||[]):profile.owned;}
 function has(profile,item){const it=typeof item==='string'?getItem(item):item;return !!it&&listFor(profile,it.kind).includes(it.id);}
 function equipped(profile,item){const it=typeof item==='string'?getItem(item):item;return !!it&&(it.kind==='skin'?profile.skin===it.id:it.kind==='weapon'?profile.weapon===it.id:it.kind==='finish'?profile.finish===it.id:profile.card===it.id);}
 const integer = value => Number.isFinite(Number(value)) ? Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Number(value)))) : 0;
 function migrate(saved) {
  const source = saved && typeof saved === 'object' ? saved : {};
  const inventory = Array.isArray(source.owned) ? source.owned : [];
  // Ids the catalogue does not know yet (hidden packs register their items only after the profile loads) are kept, capped, never dropped.
  const unknown = id => typeof id === 'string' && id.length <= 40 && !itemsById.has(id);
  const keepUnknown = list => [...new Set(list.filter(unknown))].slice(0, 50);
  const owned = [...skins.filter(s => s.id === 'brass' || s.gift || inventory.includes(s.id)).map(s => s.id), ...keepUnknown(inventory)];
  const weaponsIn=Array.isArray(source.weapons)?source.weapons:[];
  const weapons=['sword',...weaponsIn.filter(id=>id!=='sword'&&weaponsApi.has(id)),...keepUnknown(weaponsIn)];
  const cards=(Array.isArray(source.cards)?source.cards:[]).filter(id=>cardsApi.get(id));
  const finishesIn=Array.isArray(source.finishes)?source.finishes:[];
  const finishes=[...finishesIn.filter(id=>finishesApi?.has(id)),...keepUnknown(finishesIn)];
  const pendingItem=getItem(source.pendingReward);
  const pendingReward=pendingItem&&pendingItem.id!=='brass'&&(pendingItem.kind==='skin'?owned:pendingItem.kind==='weapon'?weapons:pendingItem.kind==='finish'?finishes:cards).includes(pendingItem.id) ? pendingItem.id : null;
  const upgrades={};for(const [key,level] of Object.entries(source.upgrades&&typeof source.upgrades==='object'?source.upgrades:{})){const [kind,id]=String(key).split(':');const item=getItem(id);if(!(kind==='skin'||kind==='weapon'))continue;if(item?item.kind===kind:unknown(id))upgrades[key]=Math.min(UPGRADE_MAX,integer(level));}   // unknown id = hidden item not registered yet: keep its level
  return {
   coins:integer(source.coins),owned,
   skin:owned.includes(source.skin) ? source.skin : 'brass',sound:!!source.sound,pixel:true,   // pixel art is the only look
   lootVersion:2,freeCrates:Number(source.lootVersion)>=2 ? Math.min(1,integer(source.freeCrates)) : 1,
   pendingReward,pendingCrateId:pendingReward ? (getCrate(source.pendingCrateId)||crates[0]).id : null,pendingPay:pendingReward&&source.pendingPay==='pln'?'pln':'coins',
   // Night patrol progress: ids of cleared levels and the level chosen for the next night.
   cleared:Array.isArray(source.cleared) ? source.cleared.filter(id=>typeof id==='string') : [],
   level:typeof source.level==='string' ? source.level : null,
   exhibit:typeof source.exhibit==='string' ? source.exhibit : null,
   weapons,weapon:weapons.includes(source.weapon) ? source.weapon : 'sword',
   cards,card:cards.includes(source.card)&&cardsApi.get(source.card)?.type==='hero' ? source.card : null,
   finishes,finish:finishes.includes(source.finish) ? source.finish : null,
   balance:Math.min(100000000,integer(source.balance)),   // PLN wallet in grosze (demo: no real payments yet)
   pendingKind:pendingReward ? (getItem(pendingReward)?.kind||'skin') : null,
   upgrades,login:{last:typeof source.login?.last==='string' ? source.login.last : null,streak:Math.min(3650,integer(source.login?.streak))},
   hall:window.MuseumHall ? window.MuseumHall.migrate(source.hall) : {name:'',slots:{}},
   savedAt:typeof source.savedAt==='string' ? source.savedAt : null,   // when this save was last written (cloud vs local comparison)
   secrets:Array.isArray(source.secrets) ? [...new Set(source.secrets.filter(code=>typeof code==='string'&&code.length<=64))].slice(0,20) : [],   // access codes already entered (hidden packs re-unlock on load)
   gifts:Array.isArray(source.gifts) ? [...new Set(source.gifts.filter(code=>typeof code==='string'&&code.length<=32))].slice(0,50) : [],   // one-off gift codes already claimed (owner presents: once per user, ever)
   records:{fastestNight:Number.isFinite(Number(source.records?.fastestNight))&&source.records.fastestNight!==null ? Number(source.records.fastestNight) : null,nightCoins:integer(source.records?.nightCoins)}
  };
 }
 function remaining(profile,crateId='gallery') {
  const crate=getCrate(crateId);
  const fits=s=>s.kind==='finish'?(crate.pool==='finish'?(crate.season?s.season===crate.season:!s.season):(s.rarity==='mythic'&&!s.season&&crate.rarityWeights.mythic>0)):(crate.pool==='any' || s.kind===crate.pool) && (!crate.categoryId||s.categoryId===crate.categoryId) && (!crate.weaponType||s.type===crate.weaponType);
  return crate ? items.filter(s => fits(s) && s.weight > 0 && crate.rarityWeights[s.rarity]>0 && !has(profile,s)) : [];
 }
 function odds(profile,crateId='gallery') {
  const crate=getCrate(crateId),pool=remaining(profile,crateId);
  const result={common:0,rare:0,epic:0,legendary:0,mythic:0};
  if(!crate)return result;
  const tiers=Object.keys(crate.rarityWeights).filter(tier=>crate.rarityWeights[tier]>0&&pool.some(s=>s.rarity===tier));
  const total=tiers.reduce((sum,tier)=>sum+crate.rarityWeights[tier],0);
  for(const tier of tiers) result[tier]=crate.rarityWeights[tier]/total*100;
  return result;
 }
 function entries(profile,crateId='gallery') {
  const pool=remaining(profile,crateId),chances=odds(profile,crateId);
  const counts=pool.reduce((result,skin)=>(result[skin.rarity]=(result[skin.rarity]||0)+1,result),{});
  return pool.map(item=>({item,skin:item,chance:chances[item.rarity]/counts[item.rarity]}));
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
  return pool[pool.length-1];
 }
 function cratePricePLN(crate){const c=typeof crate==='string'?getCrate(crate):crate;return c?Math.round((c.pricePLN||0)*100):0;}
 function canPayPLN(profile,crateId){const price=cratePricePLN(crateId);return price>0&&integer(profile.balance)>=price;}
 function reserve(profile, random=randomValue,crateId='gallery',pay='coins') {
  const crate=getCrate(crateId);
  if(!crate||profile.pendingReward||(crate.season&&!seasonActive(crate.season)))return null;
  const pln=pay==='pln',price=pln?cratePricePLN(crate):0;
  const free=!pln&&crate.id==='gallery'&&profile.freeCrates>0,cost=pln||free?0:crate.cost;
  if(pln?!canPayPLN(profile,crate.id):profile.coins<cost)return null;
  const reward=draw(profile,random,crateId);
  if(!reward)return null;
  const next={...profile,coins:profile.coins-cost,balance:integer(profile.balance)-price,freeCrates:free?profile.freeCrates-1:profile.freeCrates,pendingReward:reward.id,pendingKind:reward.kind,pendingCrateId:crate.id,pendingPay:pln?'pln':'coins'};
  if(reward.kind==='skin')next.owned=[...profile.owned,reward.id];else if(reward.kind==='weapon')next.weapons=[...profile.weapons,reward.id];else if(reward.kind==='finish')next.finishes=[...(profile.finishes||[]),reward.id];else next.cards=[...profile.cards,reward.id];
  return {reward,cost,free,crate,profile:next,pln:price};
 }
 function claim(profile, {equip=false}={}) {
  const reward=getItem(profile.pendingReward),next={...profile,pendingReward:null,pendingKind:null,pendingCrateId:null,pendingPay:'coins'};
  if(equip&&reward&&has(profile,reward)){if(reward.kind==='skin')next.skin=reward.id;else if(reward.kind==='weapon')next.weapon=reward.id;else if(reward.kind==='finish')next.finish=reward.id;else if(reward.type==='hero')next.card=reward.id;}
  return next;
 }
 function equip(profile,id){
  const item=getItem(id);if(!item||!has(profile,item))return null;
  if(item.kind==='skin')return {...profile,skin:item.id};if(item.kind==='weapon')return {...profile,weapon:item.id};
  if(item.kind==='finish')return {...profile,finish:profile.finish===item.id?null:item.id};
  if(item.type==='hero')return {...profile,card:profile.card===item.id?null:item.id};return null;
 }
 // Selling: owned, not equipped, not a gift or basic item. Pays SELL_RATE of the value and forgets the upgrades.
 function canSell(profile,id){const item=getItem(id);return !!item&&has(profile,item)&&!equipped(profile,item)&&value(item)>0&&!item.gift&&profile.pendingReward!==item.id;}
 function sell(profile,id){
  if(!canSell(profile,id))return null;const item=getItem(id),price=sellPrice(item),upgrades={...profile.upgrades};delete upgrades[`${item.kind}:${item.id}`];
  const next={...profile,coins:profile.coins+price,upgrades};
  if(item.kind==='skin')next.owned=profile.owned.filter(x=>x!==item.id);else if(item.kind==='weapon')next.weapons=profile.weapons.filter(x=>x!==item.id);else if(item.kind==='finish')next.finishes=(profile.finishes||[]).filter(x=>x!==item.id);else next.cards=profile.cards.filter(x=>x!==item.id);
  return {profile:next,price,item};
 }
 // PLN wallet (grosze). Deposits are simulated until payments go live; finishes are bought at pricePLN and bought back at SELL_RATE_PLN.
 const SELL_RATE_PLN=.75;
 // One-off presents from the owner: a code gives coins and PLN exactly once per profile (guests: this browser; accounts: the cloud save).
const GIFTS=Object.freeze({DIXI:{coins:10000,balance:213700,label:'Prezent od Ownera'}});
function normGift(code){return String(code||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/\s+/g,'');}
function getGift(code){const key=normGift(code);return GIFTS[key]?{id:key,...GIFTS[key]}:null;}
function claimGift(profile,code){const gift=getGift(code);if(!gift)return {ok:false,reason:'unknown'};const claimed=Array.isArray(profile.gifts)?profile.gifts:[];if(claimed.includes(gift.id))return {ok:false,reason:'claimed',gift};
 return {ok:true,gift,profile:{...profile,coins:integer(profile.coins)+gift.coins,balance:Math.min(100000000,integer(profile.balance)+gift.balance),gifts:[...claimed,gift.id]}};}
function deposit(profile,grosze){const gr=integer(grosze);if(!gr)return null;return {...profile,balance:Math.min(100000000,integer(profile.balance)+gr)};}
 function pricePLN(item){const it=typeof item==='string'?getItem(item):item;return it&&it.kind==='finish'?Math.round((it.pricePLN||0)*100):0;}
 function sellPricePLN(item){return Math.round(pricePLN(item)*SELL_RATE_PLN);}
 function canBuyFinish(profile,id){const item=getItem(id);return !!item&&item.kind==='finish'&&!has(profile,item)&&integer(profile.balance)>=pricePLN(item)&&pricePLN(item)>0;}
 function buyFinish(profile,id){
  if(!canBuyFinish(profile,id))return null;const item=getItem(id),price=pricePLN(item);
  return {profile:{...profile,balance:integer(profile.balance)-price,finishes:[...(profile.finishes||[]),item.id]},item,price};
 }
 function sellFinish(profile,id){
  const item=getItem(id);if(!item||item.kind!=='finish'||!canSell(profile,id))return null;const price=sellPricePLN(item);
  return {profile:{...profile,balance:Math.min(100000000,integer(profile.balance)+price),finishes:(profile.finishes||[]).filter(x=>x!==item.id)},item,price};
 }
 // Upgrades: skins gain +6 max HP per level, weapons +8% weak-guard damage per level. Five levels, rising price.
 const upgradeKey=(kind,id)=>`${kind}:${id}`;
 function upgradeLevel(profile,id){const item=getItem(id);return item?integer(profile.upgrades?.[upgradeKey(item.kind,item.id)]):0;}
 function upgradeCost(level){return level>=UPGRADE_MAX?null:400+level*600;}
 function upgradeEffect(item,level){const it=typeof item==='string'?getItem(item):item;if(!it||!level)return null;return it.kind==='skin'?`+${6*level} maks. HP`:it.kind==='weapon'?`+${8*level}% obrażeń`:null;}
 function canUpgrade(profile,id){const item=getItem(id);if(!item||!has(profile,item)||!(item.kind==='skin'||item.kind==='weapon'))return false;const cost=upgradeCost(upgradeLevel(profile,id));return cost!==null&&profile.coins>=cost;}
 function upgrade(profile,id){
  if(!canUpgrade(profile,id))return null;const item=getItem(id),level=upgradeLevel(profile,id),cost=upgradeCost(level);
  return {profile:{...profile,coins:profile.coins-cost,upgrades:{...profile.upgrades,[upgradeKey(item.kind,item.id)]:level+1}},level:level+1,cost,item};
 }
 // Everything that changes the next fight beyond the skin perk: hero card, weapon card for the equipped weapon, upgrades.
 function modifiers(profile){
  const result={};const add=(key,v)=>{result[key]=key.endsWith('Multiplier')?(result[key]??1)*v:(result[key]??0)+v;};
  const hero=cardsApi.get(profile.card);if(hero&&profile.cards.includes(hero.id))for(const [k,v] of Object.entries(hero.modifiers))add(k,v);
  const weaponCard=cardsApi.weaponCards().find(c=>c.weapon===profile.weapon);if(weaponCard&&profile.cards.includes(weaponCard.id))for(const [k,v] of Object.entries(weaponCard.modifiers))add(k,v);
  const skinLevel=upgradeLevel(profile,profile.skin);if(skinLevel)add('maxHP',6*skinLevel);
  const weaponLevel=upgradeLevel(profile,profile.weapon);if(weaponLevel)add('weaponDamageMultiplier',1+.08*weaponLevel);
  return result;
 }
 // Daily bonus: grows 25 a day from 50, caps at 300, resets after a missed day. Local clock for now; the server takes over in phase 4.
 function dateKey(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
 function dailyBonus(profile,now=new Date()){
  const today=dateKey(now);if(profile.login?.last===today)return null;
  const yesterday=dateKey(new Date(now.getFullYear(),now.getMonth(),now.getDate()-1));
  const streak=profile.login?.last===yesterday?integer(profile.login.streak)+1:1;
  const bonus=Math.min(500,80+(streak-1)*40);
  return {profile:{...profile,coins:profile.coins+bonus,login:{last:today,streak}},bonus,streak,reset:profile.login?.last&&profile.login.last!==yesterday};
 }
 window.MuseumLoot=Object.freeze({COST,GIFTS,getGift,claimGift,categories,getCategory,crates,crateGroups,getCrate,activeCrates,seasonActive,seasonLabel,skins,items,getItem,register,value,values,sellPrice,has,equipped,equip,canSell,sell,upgradeLevel,upgradeCost,upgradeEffect,canUpgrade,upgrade,UPGRADE_MAX,modifiers,dailyBonus,dateKey,rarities,rarityWeights,migrate,remaining,odds,entries,draw,reserve,claim,deposit,pricePLN,cratePricePLN,canPayPLN,sellPricePLN,SELL_RATE_PLN,canBuyFinish,buyFinish,sellFinish});
})();
