/* Fifty knight appearances: user palettes, collection tiers and one combat benefit each. */
(() => {
 'use strict';
 const rows = [
  ['Srebrny Strażnik','Klasyczny rycerz zamku',['#C0C7D2','#1D3557','#F5F5F5','#707B8A'],'classic','WIERNA WARTA','hp',132],
  ['Krwawy Kruk','Mroczny rycerz z czerwonym płaszczem',['#151515','#9D0208','#7D8597','#F5E6C8'],'crow','KRUCZE OSTRZE','damage',1.18],
  ['Złoty Paladyn','Bohater królewskiej gwardii',['#D4AF37','#F5E6C8','#6A4C93','#CED4DA'],'royal','ZŁOTA TARCZA','armor',.9],
  ['Leśny Wilk','Rycerz ukrywający się w dziczy',['#386641','#6F4E37','#A3A380','#343A40'],'wolf','ODDECH PUSZCZY','regen',1.18],
  ['Lodowy Feniks','Rycerz północy w mroźnej zbroi',['#90E0EF','#CED4DA','#F8F9FA','#507DA0'],'ice','MROŹNY REFLEKS','parry',.33],
  ['Płomień Smoka','Ostrze rozgrzane smoczym ogniem',['#D62828','#F77F00','#222222'],'dragon','SMOCZY ŻAR','damage',1.2],
  ['Rycerz Burzy','Stal zahartowana przez burzę',['#14213D','#4895EF','#CED4DA'],'storm','KROK BURZY','cost',.88],
  ['Szmaragdowy Król','Szmaragdowy pancerz monarchy',['#087F5B','#D4AF37','#202020'],'royal','KRÓLEWSKA ŻYWOTNOŚĆ','hp',136],
  ['Pustynny Wędrowiec','Strażnik dalekich wydm',['#D9B382','#805A3B','#F5E6C8'],'desert','ODDECH PUSTYNI','regen',1.2],
  ['Duch Zamku','Widmowa zbroja starej warowni',['#F5F5F5','#9CA3AF','#B8E1FF'],'ghost','WIDMOWY REFLEKS','parry',.34],
  ['Rycerz Cienia','Cicha straż w fioletowym mroku',['#101014','#542788','#8C96A5'],'shadow','PŁASZCZ CIENIA','armor',.88],
  ['Wilk Północy','Wartownik pod północnym niebem',['#1D3557','#A8B2BD','#F1FAEE'],'wolf','WILCZY INSTYNKT','cost',.86],
  ['Karmazynowy Książę','Dziedzic karmazynowego tronu',['#9D0208','#E9C46A','#252525'],'blood','SZLACHETNE ODNOWIENIE','heal',2],
  ['Miedziany Tytan','Miedziana zbroja nieugiętego tytana',['#B87333','#704214','#343A40'],'mechanic','TYTANOWA WYTRWAŁOŚĆ','hp',136],
  ['Rycerz Róży','Szermierz pod znakiem róży',['#C9184A','#FF8FAB','#D8DDE6'],'rose','KWIAT ŻYCIA','heal',2],
  ['Strażnik Słońca','Wartownik słonecznych murów',['#FFD60A','#F48C06','#FFF8E7'],'sun','SŁONECZNY ODDECH','regen',1.3],
  ['Król Nocy','Władca nocnej straży',['#111111','#14213D','#6A4C93'],'night','PANCERZ PÓŁNOCY','armor',.84],
  ['Rycerz Pioruna','Obrońca szybki jak błyskawica',['#FEE440','#0077B6','#343A40'],'lightning','BŁYSK GARDY','cost',.8],
  ['Żelazny Golem','Nieustępliwa żelazna warownia',['#343A40','#7D8597','#9C6644'],'golem','ŻELAZNE SERCE','hp',145],
  ['Błędny Rycerz','Wędrowny obrońca dawnych szlaków',['#606C38','#6F4E37','#DDAF75'],'wanderer','CZUJNOŚĆ WĘDROWCA','parry',.37],
  ['Kruczy Lord','Władca pod kruczym sztandarem',['#151515','#3C096C','#ADB5BD'],'crow','DZIOB KRUKA','damage',1.3],
  ['Morski Władca','Wojownik głębin i przypływów',['#00B4D8','#023E8A','#CAF0F8'],'sea','SIŁA PRZYPŁYWU','regen',1.32],
  ['Rycerz Lawy','Zbroja rozpalona lawą',['#202020','#FF6D00','#D00000'],'lava','ERUPCJA KONTRY','damage',1.35],
  ['Księżycowy Obrońca','Srebrna straż księżycowego blasku',['#C9D6DF','#283044','#B8C0FF'],'moon','KSIĘŻYCOWY REFLEKS','parry',.39],
  ['Zielony Alchemik','Opiekun zielonego eliksiru',['#386641','#A7C957','#6A4C93'],'alchemist','ELIKSIR ODNOWY','heal',4],
  ['Rycerz Piasków','Obrońca piaskowych bastionów',['#E6CCB2','#CB997E','#7F5539'],'sand','PIASKOWY PANCERZ','armor',.85],
  ['Szkarłatny Łowca','Tropiciel spod szkarłatnego znaku',['#C1121F','#1D1D1D','#774936'],'hunter','CIOS ŁOWCY','damage',1.32],
  ['Królowa Stali','Królowa błękitnej stalowej gwardii',['#CED4DA','#89C2D9','#1D3557'],'queen','STALOWA DYSCYPLINA','cost',.78],
  ['Rycerz Kwarcu','Zbroja z różowego kwarcu',['#F8F9FA','#E0AFA0','#B8A1D9'],'quartz','KWARCOWA ŻYWOTNOŚĆ','hp',142],
  ['Złomiarz Areny','Mistrz naprawianej zbroi',['#A44A3F','#6C757D','#8D5524'],'scrap','AWARYJNY NAPĘD','regen',1.28],
  ['Samuraj Zamku','Szermierz zamkowej dynastii',['#222222','#BC4749','#D4AF37'],'samurai','SPOKÓJ SAMURAJA','cost',.72],
  ['Rycerz Jadowitego Żądła','Wojownik pod znakiem żądła',['#70E000','#161A1D','#7400B8'],'venom','JADOWITA KONTRA','damage',1.38],
  ['Błękitny Smok','Rycerz błękitnego smoczego rodu',['#168AAD','#184E77','#FFD166'],'dragon','SMOCZA CZUJNOŚĆ','parry',.4],
  ['Krwawy Baron','Baron burgundowej twierdzy',['#6A040F','#191919','#B08968'],'blood','BARONOWE ODNOWIENIE','heal',5],
  ['Rycerz Chmur','Lekka zbroja pod białym niebem',['#F8F9FA','#A9DEF9','#ADB5BD'],'cloud','LEKKOŚĆ CHMUR','cost',.7],
  ['Strażnik Kryształu','Strażnik turkusowych kryształów',['#48CAE4','#7B2CBF','#E0E1DD'],'crystal','KRYSZTAŁOWY PANCERZ','armor',.76],
  ['Rycerz Mechanik','Zbroja z miedzianym mechanizmem',['#B87333','#343A40','#FFC300'],'mechanic','NAKRĘCANY ODDECH','regen',1.38],
  ['Rycerz Dynastii','Dziedzic złotoczerwonej dynastii',['#9D0208','#F2E8CF','#D4AF37'],'dynasty','DZIEDZICTWO DYNASTII','hp',148],
  ['Widmowy Gladiator','Widmo dawnego mistrza areny',['#6C757D','#212529','#9D4EDD'],'gladiator','INSTYNKT GLADIATORA','parry',.41],
  ['Rycerz Puszczy','Obrońca najstarszych drzew',['#2D6A4F','#7F5539','#DDB892'],'forest','LEŚNE ODNOWIENIE','heal',5],
  ['Srebrny Jastrząb','Podniebny strażnik srebrnej wieży',['#CED4DA','#264653','#F1FAEE'],'hawk','JASTRZĘBIA LEKKOŚĆ','cost',.73],
  ['Rycerz Gwiazd','Strażnik gwiezdnego sklepienia',['#03045E','#7209B7','#FFD166'],'stars','GWIEZDNY ODDECH','regen',1.4],
  ['Piekielny Książę','Dziedzic płonącej fortecy',['#1A1A1A','#D00000','#F48C06'],'inferno','PIEKIELNA RIPOSTA','damage',1.4],
  ['Rycerz Świtu','Złoty wojownik pierwszego światła',['#F4D35E','#FAF0CA','#90E0EF'],'dawn','SIŁA NOWEGO DNIA','hp',148],
  ['Strażnik Bagien','Opancerzony wartownik mokradeł',['#606C38','#3A5A40','#6B4226'],'swamp','BAGIENNY PANCERZ','armor',.77],
  ['Rycerz Paproci','Legendarny obrońca pradawnej zieleni',['#40916C','#95D5B2','#774936'],'fern','SERCE PUSZCZY','regen',1.45],
  ['Król Mrozu','Władca lodowej korony',['#F8F9FA','#90E0EF','#1D3557'],'frost','SERCE WIECZNEGO LODU','hp',150],
  ['Złoty Skorpion','Złoty wojownik piaskowej legendy',['#E9C46A','#242423','#DDB892'],'scorpion','TANIEC SKORPIONA','cost',.65],
  ['Rycerz Neonowej Areny','Mistrz cyjanowo-magentowej areny',['#00F5D4','#F15BB5','#161616'],'neon','NEONOWA RIPOSTA','damage',1.45],
  ['Ostatni Smok','Ostatni dziedzic smoczego rodu',['#171717','#E09F3E','#9E2A2B'],'last-dragon','ODRODZENIE SMOKA','heal',7]
 ];
 const percent = value => Math.round(value * 100);
 const decimal = value => value.toFixed(2).replace('.', ',');
 function benefit(title, kind, value) {
  const info = {
   hp: ['maxHP', `+${value-120} maks. HP`, [`Zaczynasz każdą walkę ze ${value} HP zamiast 120.`]],
   damage: ['weakGuardDamageMultiplier', `+${percent(value-1)}% obrażeń w słabą gardę`, [`Ataki po ciosie T-Rexa zadają o ${percent(value-1)}% więcej obrażeń. Obrażenia zaokrąglamy w górę.`]],
   armor: ['incomingDamageMultiplier', `−${percent(1-value)}% otrzymywanych obrażeń`, [`Tracisz o ${percent(1-value)}% mniej HP przy spóźnionej paradzie i osłabionej gardzie. Obrażenia zaokrąglamy w górę.`]],
   regen: ['staminaRegenMultiplier', `+${percent(value-1)}% regeneracji wytrzymałości`, [`Wytrzymałość odnawia się o ${percent(value-1)}% szybciej podczas odpoczynku, gardy i ataku.`]],
   parry: ['perfectParryWindow', `+${decimal(value-.27)} s na perfekcyjną paradę`, [`Okno perfekcyjnego parowania trwa ${decimal(value)} s zamiast 0,27 s.`]],
   cost: ['defenseCostMultiplier', `−${percent(1-value)}% kosztu obrony`, [`Garda, parowanie oraz ręczne i automatyczne uniki zużywają o ${percent(1-value)}% mniej wytrzymałości. Koszt ataków pozostaje taki sam.`]],
   heal: ['perfectParryHeal', `+${value} HP za perfekcyjną paradę`, [`Każde perfekcyjne parowanie przywraca ${value} HP, do maksymalnego zdrowia. Leczenie nie wskrzesza pokonanej postaci.`]]
  }[kind];
  return Object.freeze({title,summary:info[1],details:Object.freeze(info[2]),stats:Object.freeze({[info[0]]:value})});
 }
 const skins = Object.freeze(rows.map((row, index) => {
  const [name,description,colors,motif,title,kind,value] = row, number=index+1;
  return Object.freeze({
   id:`knight-${String(number).padStart(2,'0')}`,number,name,description,
   rarity:number<=15?'common':number<=30?'rare':number<=45?'epic':'legendary',
   colors:Object.freeze(colors),motif,perk:benefit(title,kind,value)
  });
 }));
 window.MuseumKnights = Object.freeze({skins});
})();
