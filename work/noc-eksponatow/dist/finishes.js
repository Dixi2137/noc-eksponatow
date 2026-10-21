/* Limited weapon finishes: cosmetic coats that re-colour any weapon in hand and in the collection.
   Five rarities: from one-colour paint jobs to animated mythic coats. Mythics also sneak into every crate; the Lakiernia crates drop the whole catalogue. Colours: steel body, edge highlight, dark steel, fittings (gold), haft (wood). */
(() => {
  'use strict';
  const f = (id, name, era, flavour, colors, fx, rarity = 'mythic', pricePLN = PRICES[id]) => Object.freeze({ id, name, era, flavour, rarity, fx, colors: Object.freeze(colors), pricePLN });
  // Planned direct-sale prices in PLN (payments are not live yet): a few hundred to a few thousand zł.
  const PRICES = Object.freeze({'diamond-emerald': 2499, 'gold-marble': 1499, 'titanium': 499, 'holo': 3499, 'obsidian-ruby': 1199, 'damascus': 699, 'rose-gold': 899, 'void': 1999});
  const handmade = [
    f('diamond-emerald', 'DIAMENTOWY SZMARAGD', 'SZMARAGD I DIAMENT · WYKOŃCZENIE LIMITOWANE', 'Szlifowany szmaragd oprawiony w diament. Każde ostrze rzuca zielone iskry.',
      { steel: '#5fd9b4', edge: '#eafff8', dark: '#1d6f58', gold: '#d6fff2', wood: '#1a4a3a' }, 'sparkle'),
    f('gold-marble', 'ZŁOTY MARMUR', 'MARMUR KARRARYJSKI I ZŁOTO · WYKOŃCZENIE LIMITOWANE', 'Biały marmur z żyłkami złota. Broń, która wygląda jak posąg.',
      { steel: '#efe9dc', edge: '#ffffff', dark: '#b9ae99', gold: '#e8b84a', wood: '#c9a24e', vein: '#e0b34a' }, 'veins'),
    f('titanium', 'TYTAN', 'SZCZOTKOWANY TYTAN · WYKOŃCZENIE LIMITOWANE', 'Matowy, szczotkowany metal. Lżejszy, twardszy, bez jednego błysku za dużo.',
      { steel: '#8f99a8', edge: '#e2e8f0', dark: '#3b424e', gold: '#b7c0cf', wood: '#2b3038', vein: '#a9b3c2' }, 'brushed'),
    f('holo', 'HOLOGRAM', 'WIDMO ŚWIATŁA · WYKOŃCZENIE LIMITOWANE', 'Powłoka, która zmienia kolor z każdym ruchem. Tęcza zamknięta w stali.',
      { steel: '#9ad7ff', edge: '#ffffff', dark: '#3a5a8a', gold: '#ffd6ff', wood: '#2a2a44' }, 'holo'),
    f('obsidian-ruby', 'OBSYDIAN I RUBIN', 'WULKANICZNE SZKŁO I RUBIN · WYKOŃCZENIE LIMITOWANE', 'Czarne szkło z rubinową krawędzią, która żarzy się w ciemności.',
      { steel: '#2a2230', edge: '#ff5a6e', dark: '#120d16', gold: '#c81e3a', wood: '#1a1418' }, 'glow'),
    f('damascus', 'STAL DAMASCEŃSKA', 'STAL WARSTWOWA · WYKOŃCZENIE LIMITOWANE', 'Setki warstw kutej stali układają się w falisty wzór.',
      { steel: '#6b7a86', edge: '#d2e0e8', dark: '#2a353e', gold: '#c9a24e', wood: '#4a3222', vein: '#b9c8d2' }, 'veins'),
    f('rose-gold', 'RÓŻOWE ZŁOTO', 'RÓŻOWE ZŁOTO I PERŁA · WYKOŃCZENIE LIMITOWANE', 'Ciepły połysk różowego złota i perłowa krawędź. Elegancja, która boli.',
      { steel: '#e4a59c', edge: '#ffe8e2', dark: '#9a564f', gold: '#f7d3cb', wood: '#6a3a38' }, 'sparkle'),
    f('void', 'NOCNA PUSTKA', 'GWIAZDY I PUSTKA · WYKOŃCZENIE LIMITOWANE', 'Głęboki fiolet nocy, w którym migoczą gwiazdy. Broń z innego muzeum.',
      { steel: '#241640', edge: '#c4a0ff', dark: '#0d0820', gold: '#7a5cff', wood: '#161028' }, 'stars')
  ];

  // ── Generated catalogue: ~380 coats in five rarities ──────────────────────
  const hue = (h, s, l) => `hsl(${((h % 360) + 360) % 360},${s}%,${l}%)`;
  const hsl2hex = (h, s, l) => { s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join(''); };
  const slug = s => s.toLowerCase().replace(/ł/g, 'l').replace(/ą/g, 'a').replace(/ę/g, 'e').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ć/g, 'c').replace(/ń/g, 'n').replace(/ż|ź/g, 'z').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const generated = [];
  const hues = [['CZERWIEŃ', 0], ['POMARAŃCZ', 24], ['BURSZTYN', 38], ['ŻÓŁĆ', 52], ['OLIWKA', 78], ['ZIELEŃ', 120], ['SZMARAGD', 150], ['TURKUS', 175], ['BŁĘKIT', 200], ['LAZUR', 212], ['KOBALT', 228], ['INDYGO', 250], ['FIOLET', 275], ['PURPURA', 300], ['RÓŻ', 330], ['MALINA', 345]];
  const neutrals = [['SADZA', 0, 0, 12], ['GRAFIT', 210, 6, 24], ['STAL SZARA', 210, 8, 42], ['POPIÓŁ', 30, 5, 58], ['KREDA', 40, 12, 84], ['KOŚĆ', 45, 30, 86], ['BEŻ', 35, 35, 70], ['OCHRA', 38, 55, 48], ['BRĄZ', 25, 45, 32], ['KHAKI', 70, 25, 40], ['SEPIA', 30, 35, 26], ['ŚLIWKA', 310, 18, 24]];
  // Common: one colour, five kinds of cheap paint. 16 hues × 5 coats + 12 neutrals × 2 coats = 104, then 16 "bieda" leftovers = 120.
  const coats = [['FARBA', 38, 42, 'flat', 'Jedna warstwa farby z puszki. Bez połysku, bez pretensji.'], ['MAT', 22, 36, 'flat', 'Matowa powłoka, która nie odbija nawet latarki strażnika.'], ['LAKIER', 62, 50, 'gloss', 'Błyszczący lakier samochodowy. Odbija światło i odciski palców.'], ['EMALIA', 56, 60, 'gloss', 'Gęsta emalia w kolorze z katalogu. Trwała jak garnek babci.'], ['PASTEL', 48, 74, 'flat', 'Jasny pastel. Broń, która wygląda jak z pokoju dziecinnego.']];
  const priceAt = (lo, hi, i, n) => Math.round((lo + (hi - lo) * (n > 1 ? i / (n - 1) : 0)) * 100) / 100;
  let commons = [];
  for (const [coat, s, l, fx, flavour] of coats) for (const [name, h] of hues) commons.push({ name: `${coat} · ${name}`, colors: { steel: hsl2hex(h, s, l), edge: hsl2hex(h, s, Math.min(92, l + 26)), dark: hsl2hex(h, s, Math.max(8, l - 24)), gold: hsl2hex(h, Math.max(10, s - 20), Math.min(70, l + 8)), wood: hsl2hex(h, Math.max(8, s - 25), Math.max(10, l - 30)) }, fx, flavour });
  for (const [name, h, s, l] of neutrals) for (const coat of ['FARBA', 'LAKIER']) commons.push({ name: `${coat} · ${name}`, colors: { steel: hsl2hex(h, s, l), edge: hsl2hex(h, s, Math.min(94, l + 24)), dark: hsl2hex(h, s, Math.max(6, l - 20)), gold: hsl2hex(h, s, Math.min(80, l + 10)), wood: hsl2hex(h, s, Math.max(8, l - 28)) }, fx: coat === 'FARBA' ? 'flat' : 'gloss', flavour: coat === 'FARBA' ? 'Szara codzienność w puszce. Jedna warstwa, zero blasku.' : 'Lakier w kolorze, którego nikt nie wybiera pierwszy.' });
  for (const [name, h] of hues) commons.push({ name: `BIEDA · ${name}`, colors: { steel: hsl2hex(h, 18, 30), edge: hsl2hex(h, 18, 46), dark: hsl2hex(h, 18, 16), gold: hsl2hex(h, 12, 34), wood: hsl2hex(h, 10, 18) }, fx: 'flat', flavour: 'Spłowiała farba z remontu. Kolor, który był kiedyś ładny.' });
  commons.forEach((x, i) => generated.push({ ...x, rarity: 'common', era: 'LAKIERNIA · ZWYKŁE WYKOŃCZENIE', pricePLN: priceAt(2.99, 9.99, i, commons.length) }));
  // Rare: two-tone patterns on 16 hues (5 patterns = 80) and six cheap metals with five accents (30) = 110.
  const patterns = [['PASKI', 'stripes', 'Poziome pasy w dwóch odcieniach. Wyścigowa stal.'], ['KROPKI', 'dots', 'Drobne kropki na całej powierzchni. Dziwne, ale czyste.'], ['SZACHOWNICA', 'checker', 'Pola jak na szachownicy. Każde cięcie to ruch skoczkiem.'], ['SZCZOTKA', 'brushed', 'Szczotkowany metal w kolorze. Widać każde pociągnięcie.'], ['DWUBARWNY', 'flat', 'Korpus w jednym kolorze, krawędź w kontrze. Prosty patent, który działa.']];
  const rares = [];
  for (const [pat, fx, flavour] of patterns) for (const [name, h] of hues) { const h2 = fx === 'flat' ? h + 180 : h + 30; rares.push({ name: `${pat} · ${name}`, colors: { steel: hsl2hex(h, 55, 46), edge: hsl2hex(h2, 70, 78), dark: hsl2hex(h, 55, 22), gold: hsl2hex(h2, 55, 60), wood: hsl2hex(h, 30, 20), vein: hsl2hex(h2, 60, 62) }, fx, flavour }); }
  const metals = [['STAL', 210, 8, 56], ['SREBRO', 220, 10, 74], ['MOSIĄDZ', 45, 50, 56], ['MIEDŹ', 20, 55, 50], ['BRĄZ', 30, 40, 38], ['CYNA', 200, 6, 66]];
  for (const [metal, mh, ms, ml] of metals) for (const [name, h] of [hues[0], hues[5], hues[8], hues[12], hues[3]]) rares.push({ name: `${metal} · KRAWĘDŹ ${name}`, colors: { steel: hsl2hex(mh, ms, ml), edge: hsl2hex(h, 85, 70), dark: hsl2hex(mh, ms, Math.max(10, ml - 28)), gold: hsl2hex(h, 60, 55), wood: hsl2hex(mh, 20, 22), vein: hsl2hex(h, 70, 60) }, fx: 'edge', flavour: `Surowy metal z krawędzią w kolorze. Ostrze podkreślone jak flamastrem.` });
  rares.forEach((x, i) => generated.push({ ...x, rarity: 'rare', era: 'LAKIERNIA · RZADKIE WYKOŃCZENIE', pricePLN: priceAt(14.99, 39.99, i, rares.length) }));
  // Epic: 20 precious materials × 4 treatments = 80.
  const gems = [['ZŁOTO', 46, 80, 58], ['SREBRO PRÓBY', 215, 12, 78], ['PLATYNA', 220, 8, 82], ['BRĄZ ANTYCZNY', 32, 48, 36], ['RUBIN', 350, 85, 46], ['SZAFIR', 225, 85, 44], ['SZMARAGD', 150, 75, 40], ['AMETYST', 275, 65, 52], ['TOPAZ', 42, 90, 60], ['JADEIT', 140, 45, 52], ['ONYKS', 240, 10, 14], ['PERŁA', 50, 25, 88], ['BURSZTYN', 36, 95, 54], ['TURKUS', 176, 70, 52], ['MALACHIT', 160, 65, 34], ['LAPIS LAZULI', 230, 75, 38], ['OPAL', 190, 40, 80], ['GRANAT', 355, 70, 34], ['AKWAMARYN', 185, 70, 68], ['CYTRYN', 50, 85, 64]];
  const treatments = [['POLEROWANY', 'sparkle', 'Wypolerowany na wysoki połysk. Co chwilę łapie iskrę światła.'], ['ŻYŁKOWANY', 'veins', 'Naturalne żyłki materiału biegną przez całe ostrze.'], ['ŻARZĄCY', 'glow', 'Krawędź żarzy się własnym światłem. Noc w muzeum robi się jaśniejsza.'], ['FASETOWANY', 'facets', 'Szlif jak w jubilerskim kamieniu. Każda faseta inaczej łapie blask.']];
  const epics = [];
  for (const [treat, fx, flavour] of treatments) for (const [name, h, s, l] of gems) epics.push({ name: `${name} · ${treat}`, colors: { steel: hsl2hex(h, s, l), edge: hsl2hex(h, Math.max(20, s - 10), Math.min(95, l + 28)), dark: hsl2hex(h, s, Math.max(8, l - 26)), gold: hsl2hex((h + 20), Math.min(90, s + 5), Math.min(85, l + 14)), wood: hsl2hex(h, Math.max(10, s - 30), Math.max(10, l - 34)), vein: hsl2hex(h, Math.max(15, s - 20), Math.min(96, l + 36)) }, fx, flavour });
  epics.forEach((x, i) => generated.push({ ...x, rarity: 'epic', era: 'SKARBIEC · EPICKIE WYKOŃCZENIE', pricePLN: priceAt(49.99, 149.99, i, epics.length) }));
  // Legendary: 25 living themes × 2 animations = 50.
  const themes = [['OGIEŃ', 18, 95, 52, 'Płomień zamknięty w stali.'], ['LÓD', 195, 70, 80, 'Szron, który nigdy nie topnieje.'], ['BURZA', 215, 60, 46, 'Chmura burzowa z błyskiem w środku.'], ['KREW', 352, 80, 36, 'Ciemna czerwień, która nie schnie.'], ['NOC', 245, 50, 22, 'Granat północy z gwiazdami.'], ['SŁOŃCE', 44, 100, 62, 'Południowy blask, którego nie da się zgasić.'], ['KSIĘŻYC', 210, 20, 84, 'Srebrne światło pełni.'], ['LAS', 130, 55, 32, 'Zieleń starej puszczy.'], ['OCEAN', 198, 75, 42, 'Głębia, w której coś się rusza.'], ['PUSTYNIA', 36, 60, 64, 'Rozgrzany piasek i miraż.'], ['WULKAN', 8, 90, 40, 'Zastygła lawa z żarem pod spodem.'], ['ZORZA', 160, 80, 60, 'Zielone fale polarnego nieba.'], ['MGŁA', 200, 12, 70, 'Mleczna mgła o świcie.'], ['JESIEŃ', 28, 85, 50, 'Złoto i rdza spadających liści.'], ['WIOSNA', 95, 70, 62, 'Świeża zieleń i pierwsze kwiaty.'], ['ZIMA', 205, 30, 90, 'Biel śniegu i chłód stali.'], ['ŚWIT', 20, 80, 72, 'Pierwsza łuna nad horyzontem.'], ['ZMIERZCH', 290, 55, 40, 'Fiolet ostatnich promieni.'], ['TĘCZA', 300, 70, 60, 'Siedem kolorów na jednym ostrzu.'], ['PIORUN', 55, 100, 72, 'Wyładowanie uwięzione w metalu.'], ['SMOK', 150, 60, 28, 'Łuska starego smoka.'], ['FENIKS', 30, 95, 58, 'Popiół i odrodzenie.'], ['WIDMO', 180, 30, 76, 'Półprzezroczysty blask ducha.'], ['KORONA', 48, 85, 54, 'Złoto królów i purpura tronu.'], ['KUSTOSZ', 40, 35, 58, 'Barwy pieczęci kustosza. Dla tych, co znają muzeum na pamięć.']];
  const legends = [];
  for (const [anim, fx, suffix] of [['ŻAR', 'pulse', ' Krawędź pulsuje jak oddech.'], ['ISKRY', 'stars', ' Nad stalą unoszą się iskry.']]) for (const [name, h, s, l, flavour] of themes) legends.push({ name: `${name} · ${anim}`, colors: { steel: hsl2hex(h, s, l), edge: hsl2hex(h, Math.max(30, s - 10), Math.min(96, l + 30)), dark: hsl2hex(h, s, Math.max(8, l - 30)), gold: hsl2hex(h + 40, Math.min(95, s + 10), Math.min(88, l + 18)), wood: hsl2hex(h, Math.max(10, s - 35), Math.max(8, l - 38)), vein: hsl2hex(h + 30, 90, 85), hue: h }, fx, flavour: flavour + suffix });
  legends.forEach((x, i) => generated.push({ ...x, rarity: 'legendary', era: 'RELIKWIARZ · LEGENDARNE WYKOŃCZENIE', pricePLN: priceAt(199, 499, i, legends.length) }));
  // Mythic extras: twenty animated coats on top of the eight handmade ones.
  const mythics = [['AURORA', 'aurora', 150, 'Powłoka faluje zielenią i fioletem jak polarne niebo.', 799], ['PLAZMA', 'plasma', 280, 'Rozżarzona plazma pełznie po ostrzu.', 1299], ['LAWA', 'lava', 12, 'Czarna skorupa pęka i prześwituje lawą.', 999], ['PRYZMAT', 'prism', 0, 'Światło rozszczepia się na krawędzi na całe widmo.', 2999], ['MGŁAWICA', 'nebula', 265, 'Gwiezdny pył i fiolet mgławicy. Kosmos w dłoni.', 1799], ['CHROM', 'chrome', 210, 'Lustrzany chrom, w którym odbija się cała sala.', 899], ['KRIOGEN', 'frost', 195, 'Ciekły azot pełznie po stali i zamarza w locie.', 1099], ['ZŁOTY PŁOMIEŃ', 'lava', 42, 'Złoto, które się pali. Nikt nie wie, dlaczego.', 2499], ['CZARNA DZIURA', 'nebula', 240, 'Wszystko wokół ciemnieje. Nawet latarka strażnika.', 3999], ['SMOCZE SERCE', 'pulse', 356, 'Bije w rytm twojego pulsu. Szybciej, kiedy walczysz.', 1999], ['KORONA SŁOŃCA', 'prism', 40, 'Korona słoneczna zamknięta w pięciu minutach walki.', 3299], ['WIDMOWA PERŁA', 'aurora', 200, 'Perłowy połysk, który zmienia kolor pod spojrzeniem.', 1499], ['BURSZTYNOWA KOMNATA', 'veins', 36, 'Ostrze z zaginionej komnaty. Żyłki bursztynu i złota.', 2799], ['SREBRO KSIĘŻYCA', 'stars', 215, 'Srebro przywiezione prosto z pełni. Ciężkie od gwiazd.', 1699], ['ELEKTRUM', 'plasma', 50, 'Stop złota i srebra, przez który biegnie prąd.', 1899], ['RUBINOWY LASER', 'glow', 350, 'Krawędź tak czerwona, że tnie samym światłem.', 2199], ['PŁYNNY METAL', 'chrome', 190, 'Rtęć, która trzyma kształt tylko wtedy, kiedy tniesz.', 2399], ['ZIELONY ZMIERZCH', 'aurora', 120, 'Zieleń, która ciemnieje z każdym pokonanym eksponatem.', 1399], ['BIAŁA FURIA', 'frost', 0, 'Czysta biel, która oślepia przy każdym uderzeniu.', 2999], ['PIECZĘĆ KUSTOSZA', 'prism', 44, 'Oficjalna pieczęć muzeum na ostrzu. Jedyna broń, której nie zatrzyma alarm.', 4999]];
  for (const [name, fx, h, flavour, price] of mythics) {
    const s = fx === 'chrome' ? 8 : 85, l = fx === 'nebula' || name === 'CZARNA DZIURA' ? 18 : fx === 'chrome' ? 72 : 52;
    generated.push({ name, rarity: 'mythic', era: `${name} · WYKOŃCZENIE LIMITOWANE`, pricePLN: price, fx, flavour, colors: { steel: hsl2hex(h, s, l), edge: hsl2hex(h, Math.max(10, s - 20), Math.min(96, l + 32)), dark: hsl2hex(h, s, Math.max(6, l - 30)), gold: hsl2hex(h + 40, 80, 75), wood: hsl2hex(h, 30, 14), vein: hsl2hex(h + 60, 90, 80), hue: h } });
  }
  const finishes = Object.freeze([...handmade, ...generated.map(x => { const id = slug(x.name); return f(id, x.name, x.era, x.flavour, x.colors, x.fx, x.rarity, x.pricePLN); })]);
  const byId = new Map(finishes.map(x => [x.id, x]));
  if (byId.size !== finishes.length) throw new Error('Duplicate finish id');
  // Palette letters shared by icons and in-hand sprites: M steel, W edge, S dark steel, G fittings, D haft.
  function palette(finish, time = 0) {
    const fin = typeof finish === 'string' ? byId.get(finish) : finish;
    if (!fin) return null;
    const c = fin.colors;
    if (fin.fx === 'holo') { const h = time * 90; return { M: hue(h, 75, 62), W: hue(h + 60, 90, 88), S: hue(h - 50, 60, 34), G: hue(h + 150, 80, 78), D: c.wood }; }
    if (fin.fx === 'prism') { const h = time * 160; return { M: hue(h, 90, 66), W: '#ffffff', S: hue(h + 40, 80, 30), G: hue(h + 180, 90, 80), D: c.wood }; }
    if (fin.fx === 'aurora') { const h = (c.hue || 0) + Math.sin(time * 1.4) * 45; return { M: hue(h, 80, 58), W: hue(h + 30, 90, 88), S: hue(h - 20, 70, 28), G: hue(h + 120, 70, 78), D: c.wood }; }
    if (fin.fx === 'pulse') { const k = (Math.sin(time * 5) + 1) / 2; return { M: c.steel, W: k > .5 ? c.vein || c.edge : c.edge, S: c.dark, G: c.gold, D: c.wood }; }
    return { M: c.steel, W: c.edge, S: c.dark, G: c.gold, D: c.wood };
  }
  // Per-pixel overlay for the special effects: returns a colour for a sprite pixel (letter at col/row) or null.
  function overlay(finish, letter, col, row, time = 0) {
    const fin = typeof finish === 'string' ? byId.get(finish) : finish;
    if (!fin || letter === 'O' || letter === '.') return null;
    const metal = letter === 'M' || letter === 'W' || letter === 'S', c = fin.colors;
    const tick = Math.floor(time * 6);
    switch (fin.fx) {
      case 'sparkle': return metal && ((col * 7 + row * 13 + tick * 5) % 23 === 0) ? '#ffffff' : null;
      case 'stars': return metal && ((col * 11 + row * 7 + tick * 3) % 19 === 0) ? '#f0e6ff' : null;
      case 'veins': return letter === 'M' && ((col * 2 + row * 3) % 9 === 0 || (col + row * 2) % 11 === 0) ? c.vein : null;
      case 'brushed': return letter === 'M' && (row % 3 === 1) ? c.vein : null;
      case 'glow': return letter === 'W' && tick % 2 === 0 ? '#ff8c9a' : null;
      case 'holo': return metal ? hue(time * 90 + row * 22 + col * 8, 85, 70) : null;
      case 'gloss': return letter === 'M' && (col + row) % 7 === 0 ? c.edge : null;
      case 'stripes': return letter === 'M' && row % 2 === 0 ? c.vein : null;
      case 'dots': return letter === 'M' && row % 2 === 0 && col % 2 === 0 ? c.vein : null;
      case 'checker': return letter === 'M' && (col + row) % 2 === 0 ? c.vein : null;
      case 'edge': return letter === 'W' ? c.vein : null;
      case 'facets': return letter === 'M' && ((col + row * 2) % 5 === 0) ? c.vein : letter === 'M' && ((col * 2 + row) % 7 === 0) ? c.dark : null;
      case 'pulse': return metal && ((col * 3 + row * 5 + tick) % 17 === 0) ? c.vein || '#ffffff' : null;
      case 'aurora': return metal && ((col * 5 + row * 3 + tick * 2) % 13 === 0) ? hue((c.hue || 0) + 60 + tick * 10, 90, 85) : null;
      case 'plasma': return metal ? hue((c.hue || 0) + Math.sin((col + row * 2) * .6 + time * 4) * 40, 95, 55 + Math.sin(col * .9 - time * 6) * 15) : null;
      case 'lava': return letter === 'M' && ((col * 5 + row * 7 + tick) % 13 < 3) ? hue((c.hue || 0) + Math.sin(time * 3 + col) * 12, 100, 58) : letter === 'M' ? c.dark : null;
      case 'prism': return letter === 'M' ? hue(time * 160 + row * 30 + col * 12, 95, 62) : null;
      case 'nebula': return metal && ((col * 11 + row * 7 + tick * 3) % 11 === 0) ? '#ffffff' : metal && ((col * 3 + row * 5) % 7 === 0) ? hue((c.hue || 0) + 40 + col * 6, 80, 55) : null;
      case 'chrome': return letter === 'M' ? ((col + row + tick) % 9 < 3 ? '#ffffff' : (col + row + tick) % 9 < 6 ? c.steel : c.dark) : null;
      case 'frost': return metal && ((col * 7 + row * 11 + tick * 2) % 15 < 2) ? '#ffffff' : letter === 'M' && (col * 3 + row) % 6 === 0 ? c.edge : null;
      default: return null;
    }
  }
  const byRarity = rarity => finishes.filter(x => x.rarity === rarity);
  window.MuseumFinishes = Object.freeze({ all: () => finishes, get: id => byId.get(id) || null, has: id => byId.has(id), palette, overlay, count: finishes.length, byRarity, handmade: Object.freeze(handmade.map(x => x.id)) });
})();
