/* Weapons are data. Seven types set the rhythm, five eras sort them into crates, rarity nudges the damage.
   Each entry: how the knight strikes, what a parry reflects, what the item is worth. */
(() => {
  'use strict';
  const baseline = Object.freeze({
    kind: 'melee', range: 410, staminaCost: 12, swing: .36, contact: .23, cooldown: .46,
    weakGuardDamage: 9, comboBonus: 3, comboAt: 3, parryDrain: 10,
    parryReflect: Object.freeze({ light: 20, heavy: 25 }), ammo: null, reload: 0
  });
  const ranged = { kind: 'ranged', comboBonus: 0, comboAt: 99, parryDrain: 4, parryReflect: { light: 14, heavy: 18 } };
  const types = Object.freeze({
    blade:   { name: 'Ostrza', stats: {} },
    heavy:   { name: 'Broń ciężka', stats: { staminaCost: 16, swing: .46, contact: .3, cooldown: .6, weakGuardDamage: 13, comboBonus: 2, parryReflect: { light: 24, heavy: 30 } } },
    polearm: { name: 'Broń drzewcowa', stats: { range: 470, weakGuardDamage: 8, comboBonus: 2, parryDrain: 6, parryReflect: { light: 18, heavy: 23 } } },
    light:   { name: 'Noże i sztylety', stats: { staminaCost: 8, swing: .28, contact: .17, cooldown: .32, range: 350, weakGuardDamage: 7, comboBonus: 5, comboAt: 2, parryReflect: { light: 17, heavy: 21 } } },
    bow:     { name: 'Łuki i kusze', stats: { ...ranged, range: 900, staminaCost: 6, swing: .5, contact: .25, cooldown: .6, weakGuardDamage: 10, ammo: 8, reload: 1.2 } },
    pistol:  { name: 'Pistolety', stats: { ...ranged, range: 700, staminaCost: 6, swing: .42, contact: .2, cooldown: .5, weakGuardDamage: 14, ammo: 6, reload: 1.6 } },
    rifle:   { name: 'Karabiny i strzelby', stats: { ...ranged, range: 900, staminaCost: 8, swing: .5, contact: .22, cooldown: .7, weakGuardDamage: 18, ammo: 5, reload: 2.2 } }
  });
  const eras = Object.freeze({ antiquity: 'Starożytność', medieval: 'Średniowiecze', renaissance: 'Nowożytność', modern: 'Wiek XIX i XX', contemporary: 'Współczesność' });
  const rarityBonus = { basic: 0, common: 0, rare: 1, epic: 2, legendary: 3 };
  const rarityLabel = { basic: 'KOLEKCJA PODSTAWOWA', common: 'ZWYKŁY EKSPONAT', rare: 'RZADKI EKSPONAT', epic: 'EPICKI EKSPONAT', legendary: 'LEGENDARNY EKSPONAT' };
  // w(id, name, era, type, rarity, icon, flavour, overrides)
  const w = (id, name, era, type, rarity, icon, flavour, overrides = {}) => ({ id, name, categoryId: era, type, rarity, icon, flavour, overrides });
  const A = 'antiquity', M = 'medieval', R = 'renaissance', X = 'modern', C = 'contemporary';
  const definitions = [
    // ── Ostrza ───────────────────────────────────────────────────────────────
    w('sword', 'MIECZ RYCERSKI', M, 'blade', 'basic', 'sword', 'Klasyczne ostrze muzealnego rycerza. Wszystko w nim jest średnie, i o to chodzi.'),
    w('xiphos', 'XIPHOS', A, 'blade', 'common', 'shortsword', 'Krótki miecz hoplity, dobywany, gdy włócznia pęknie.', { range: 370, swing: .32, contact: .2, cooldown: .42 }),
    w('gladius', 'GLADIUS', A, 'blade', 'common', 'shortsword', 'Krótki miecz legionisty. Szybszy od rycerskiego, ale sięga bliżej.', { swing: .32, contact: .2, cooldown: .42, range: 380 }),
    w('spatha', 'SPATHA', A, 'blade', 'common', 'sword', 'Długi miecz jazdy rzymskiej. Przodek wszystkich mieczy średniowiecza.', { range: 420 }),
    w('falcata', 'FALCATA', A, 'blade', 'rare', 'curved', 'Iberyjska klinga wygięta do przodu. Tnie jak topór, waży jak miecz.', { weakGuardDamage: 11, comboBonus: 2 }),
    w('jian', 'JIAN', A, 'blade', 'rare', 'sword', 'Prosty miecz chińskich uczonych. Lekki, precyzyjny, szybki w serii.', { swing: .3, cooldown: .4, comboBonus: 4 }),
    w('seax', 'SEAX', M, 'blade', 'common', 'shortsword', 'Nóż bojowy Sasów, prawie miecz. Tani i uczciwy.', { range: 360, swing: .3, cooldown: .4 }),
    w('longsword', 'MIECZ DŁUGI', M, 'blade', 'common', 'sword', 'Oburęczny miecz z podręczników szermierki. Dłuższy zasięg, odrobinę wolniej.', { range: 440, swing: .38 }),
    w('falchion', 'FALCHION', M, 'blade', 'common', 'curved', 'Szeroka, jednosieczna klinga piechoty. Prosta w obsłudze, ciężka w skutkach.', { weakGuardDamage: 10 }),
    w('bastard', 'MIECZ PÓŁTORARĘCZNY', M, 'blade', 'rare', 'sword', 'Jedna ręka albo dwie. Wyważony we wszystkim.', { range: 430, parryReflect: { light: 22, heavy: 27 } }),
    w('scimitar', 'SZABLA DAMASCEŃSKA', M, 'blade', 'common', 'curved', 'Zakrzywiona klinga z damastu. Tnie w serii.', { comboBonus: 4 }),
    w('dao', 'DAO', M, 'blade', 'common', 'curved', 'Chińska szabla piechoty. Szerokie cięcia, niski koszt energii.', { staminaCost: 10 }),
    w('tachi', 'TACHI', M, 'blade', 'epic', 'curved', 'Samurajski miecz noszony ostrzem w dół. Dłuższy i bardziej zakrzywiony od katany.', { range: 430, swing: .32, comboBonus: 5, comboAt: 2 }),
    w('claymore', 'CLAYMORE', M, 'blade', 'rare', 'greatsword', 'Dwuręczny miecz Highlandów. Wolniejszy, ale mocniejszy i dłuższy.', { staminaCost: 14, swing: .4, contact: .26, cooldown: .52, range: 440, weakGuardDamage: 11 }),
    w('szczerbiec', 'SZCZERBIEC', M, 'blade', 'legendary', 'sword', 'Miecz koronacyjny królów Polski. Szczerba w ostrzu, legenda w rękojeści.', { weakGuardDamage: 12, parryReflect: { light: 26, heavy: 32 }, comboBonus: 4 }),
    w('zulfikar', 'ZULFIKAR', M, 'blade', 'legendary', 'curved', 'Rozdwojona klinga z legend Wschodu. Każde cięcie liczy się podwójnie.', { comboBonus: 6, comboAt: 2, weakGuardDamage: 11 }),
    w('husaria', 'SZABLA HUSARSKA', R, 'blade', 'rare', 'curved', 'Szabla skrzydlatej jazdy. Perfekcyjna parada odbija mocniej niż u miecza.', { parryReflect: { light: 24, heavy: 29 } }),
    w('palasz', 'PAŁASZ', R, 'blade', 'rare', 'sword', 'Prosty, ciężki miecz jazdy. Rąbie, nie tnie.', { weakGuardDamage: 11, swing: .38 }),
    w('katana', 'KATANA', R, 'blade', 'epic', 'curved', 'Stal składana tysiąc razy. Szybkie cięcia i wysoki bonus serii.', { swing: .3, contact: .19, cooldown: .38, comboBonus: 5, comboAt: 2 }),
    w('wakizashi', 'WAKIZASHI', R, 'blade', 'rare', 'curved', 'Krótszy towarzysz katany. W ciasnej sali lepszy od niej.', { range: 370, swing: .28, cooldown: .36, comboBonus: 4, comboAt: 2 }),
    w('zweihander', 'ZWEIHÄNDER', R, 'blade', 'epic', 'greatsword', 'Półtora metra stali landsknechta. Najdłuższe ostrze w muzeum.', { staminaCost: 16, swing: .44, contact: .28, cooldown: .58, range: 470, weakGuardDamage: 13 }),
    w('cutlass', 'KORDELAS', R, 'blade', 'common', 'curved', 'Krótka szabla piratów. W abordażu nikt nie pyta o technikę.', { range: 380, cooldown: .4 }),
    w('cavalry', 'SZABLA KAWALERYJSKA', X, 'blade', 'common', 'curved', 'Szabla wz. 34 polskiej kawalerii. Ostatnia szabla, która walczyła.', { comboBonus: 4 }),
    w('shashka', 'SZASZKA', X, 'blade', 'rare', 'curved', 'Kozacka szabla bez jelca. Dobywana i tnąca jednym ruchem.', { swing: .3, cooldown: .38 }),
    // ── Broń ciężka ──────────────────────────────────────────────────────────
    w('club', 'MACZUGA', A, 'heavy', 'common', 'mace', 'Najstarsza broń świata. Nie potrzebuje instrukcji.', { weakGuardDamage: 12, staminaCost: 14 }),
    w('labrys', 'LABRYS', A, 'heavy', 'common', 'doubleaxe', 'Dwusieczny topór z Krety. Dwa ostrza, dwa razy więcej powodów, żeby się nie zbliżać.', { comboBonus: 3 }),
    w('francisca', 'FRANCISKA', M, 'heavy', 'common', 'axe', 'Topór Franków do rzucania. Tu tylko do rąbania, ale rąbie dobrze.', { swing: .42, cooldown: .54 }),
    w('axe', 'TOPÓR BOJOWY', M, 'heavy', 'common', 'axe', 'Wolny, ale 13 obrażeń w słabą gardę i mocniejsze odbicie parady.'),
    w('daneaxe', 'TOPÓR DUŃSKI', M, 'heavy', 'rare', 'poleaxe', 'Dwuręczny topór wikingów na długim stylisku. Zasięg i siła w jednym.', { range: 440, weakGuardDamage: 14 }),
    w('flail', 'KIŚCIEŃ', M, 'heavy', 'common', 'flail', 'Kolczasta kula na łańcuchu. Nie da się jej sparować elegancko.', { parryReflect: { light: 20, heavy: 26 }, weakGuardDamage: 13 }),
    w('warflail', 'CEP BOJOWY', M, 'heavy', 'common', 'flail', 'Chłopski cep z okuciem. Husyci rozbijali nim rycerstwo.', { range: 440 }),
    w('warhammer', 'MŁOT BOJOWY', M, 'heavy', 'rare', 'hammer', 'Młot na zbroje. Ciężkie, rzadkie uderzenia, odbicie parady jak od ściany.', { parryReflect: { light: 28, heavy: 34 }, cooldown: .66 }),
    w('maul', 'MŁOT OBURĘCZNY', M, 'heavy', 'epic', 'hammer', 'Młot, który rozbija bramy. Najwolniejszy cios w muzeum i jeden z najmocniejszych.', { staminaCost: 18, swing: .52, contact: .34, cooldown: .7, weakGuardDamage: 16 }),
    w('morningstar', 'MORGENSZTERN', M, 'heavy', 'epic', 'mace', 'Kolczasta kula na trzonku. Największe obrażenia w słabą gardę wśród broni wręcz.', { weakGuardDamage: 15, comboBonus: 3 }),
    w('czekan', 'CZEKAN', R, 'heavy', 'common', 'hammer', 'Lekki młotek z dziobem. Szybszy od innych ciężkich.', { swing: .4, cooldown: .5, weakGuardDamage: 12 }),
    w('nadziak', 'NADZIAK', R, 'heavy', 'rare', 'hammer', 'Szlachecki młotek z ostrym dziobem. Przebija blachę i dobre maniery.', { weakGuardDamage: 14, comboBonus: 3 }),
    w('buzdygan', 'BUZDYGAN', R, 'heavy', 'rare', 'mace', 'Oznaka władzy i narzędzie jej egzekwowania.', { parryReflect: { light: 26, heavy: 31 } }),
    w('berdysz', 'BERDYSZ', R, 'heavy', 'rare', 'poleaxe', 'Topór na długim drzewcu. Zasięg drzewca, siła topora.', { range: 450, weakGuardDamage: 12 }),
    w('crowbar', 'ŁOM', X, 'heavy', 'common', 'club', 'Stalowy łom z zaplecza muzeum. Nie jest eksponatem, ale działa.', { swing: .42, cooldown: .5 }),
    w('bat', 'KIJ BEJSBOLOWY', C, 'heavy', 'common', 'club', 'Drewniany kij z zaplecza. W niektórych muzeach to jednak eksponat.', { swing: .4, cooldown: .48, weakGuardDamage: 12 }),
    w('sledge', 'MŁOT KOWALSKI', C, 'heavy', 'rare', 'hammer', 'Pięciokilogramowy młot z warsztatu. Przeciwnik też to czuje.', { weakGuardDamage: 15, staminaCost: 18 }),
    // ── Broń drzewcowa ───────────────────────────────────────────────────────
    w('pilum', 'PILUM', A, 'polearm', 'common', 'spear', 'Oszczep legionisty. Grot wygina się po trafieniu, żeby nikt go nie odrzucił.', { range: 450 }),
    w('spear', 'WŁÓCZNIA HOPLITY', A, 'polearm', 'rare', 'spear', 'Trafia przeciwnika, zanim ten wejdzie w zasięg własnego ciosu.'),
    w('sarissa', 'SARISSA', A, 'polearm', 'rare', 'pike', 'Sześciometrowa pika falangi macedońskiej. Zasięg bez konkurencji.', { range: 540, weakGuardDamage: 7 }),
    w('trident', 'TRÓJZĄB RETIARIUSA', A, 'polearm', 'common', 'trident', 'Trzy groty gladiatora z siecią. Trochę krótszy od włóczni, ale tnie szerzej.', { range: 450, weakGuardDamage: 9 }),
    w('warfork', 'WIDŁY BOJOWE', M, 'polearm', 'common', 'trident', 'Chłopskie widły z okuciem. Tanie i zaskakująco skuteczne.', { range: 440 }),
    w('glaive', 'GLEWIA', M, 'polearm', 'rare', 'halberd', 'Jednosieczne ostrze na drzewcu. Tnie szeroko z dystansu.', { comboBonus: 3 }),
    w('yari', 'YARI', M, 'polearm', 'rare', 'spear', 'Japońska włócznia piechoty ashigaru. Proste pchnięcia, szybka seria.', { swing: .32, cooldown: .42 }),
    w('naginata', 'NAGINATA', M, 'polearm', 'epic', 'halberd', 'Zakrzywione ostrze na długim drzewcu. Łuk cięcia obejmuje całą arenę.', { range: 480, weakGuardDamage: 10, comboBonus: 4 }),
    w('halberd', 'HALABARDA', M, 'polearm', 'epic', 'halberd', 'Ostrze, hak i grot na jednym drzewcu. Daleko i boleśnie.', { range: 480, weakGuardDamage: 10, comboBonus: 3, parryReflect: { light: 21, heavy: 26 } }),
    w('rohatyna', 'ROHATYNA', R, 'polearm', 'common', 'spear', 'Włócznia myśliwska z poprzeczką. Dzik się nie przedrze, przeciwnik też nie.', { parryReflect: { light: 21, heavy: 26 } }),
    w('partisan', 'PARTYZANA', R, 'polearm', 'common', 'halberd', 'Szerokie ostrze z dwoma skrzydełkami. Broń straży pałacowych.', { weakGuardDamage: 9 }),
    w('pike', 'PIKA', R, 'polearm', 'common', 'pike', 'Najdłuższa broń piechoty. Sięga daleko, zadaje mało.', { range: 520, weakGuardDamage: 7 }),
    w('kopia', 'KOPIA HUSARSKA', R, 'polearm', 'epic', 'pike', 'Pięć metrów drzewca i proporzec. Jedno uderzenie rozstrzyga szarżę.', { range: 560, weakGuardDamage: 12, comboBonus: 0, cooldown: .6 }),
    w('lance', 'LANCA UŁAŃSKA', X, 'polearm', 'rare', 'pike', 'Lanca ułanów z proporczykiem. Ostatnia broń drzewcowa, która poszła na wojnę.', { range: 500, weakGuardDamage: 9 }),
    // ── Noże i sztylety ──────────────────────────────────────────────────────
    w('pugio', 'PUGIO', A, 'light', 'common', 'dagger', 'Sztylet legionisty. Tym Brutus załatwił sprawę z Cezarem.'),
    w('sica', 'SICA', A, 'light', 'rare', 'karambit', 'Zakrzywiony sztylet Traków. Sięga za tarczę.', { comboBonus: 6 }),
    w('dagger', 'SZTYLET', A, 'light', 'common', 'dagger', 'Krótki i podstępny. Prawie nie kosztuje energii, ale musisz podejść bardzo blisko.', { staminaCost: 7, range: 340, cooldown: .3 }),
    w('misericordia', 'MIZERYKORDIA', M, 'light', 'common', 'dagger', 'Sztylet miłosierdzia. Wchodzi między płyty zbroi.', { weakGuardDamage: 8 }),
    w('rondel', 'SZTYLET RONDELOWY', M, 'light', 'common', 'dagger', 'Długa, wąska klinga z tarczkami. Standard rycerza w XV wieku.', { range: 360 }),
    w('tanto', 'TANTŌ', M, 'light', 'rare', 'dagger', 'Krótki nóż samuraja. Precyzyjne pchnięcia i wysoki bonus serii.', { comboBonus: 6, comboAt: 2 }),
    w('kris', 'KRIS', R, 'light', 'rare', 'dagger', 'Falista klinga z Jawy. Rana po nim nie chce się zamknąć.', { weakGuardDamage: 8, comboBonus: 5 }),
    w('stiletto', 'STYLET', R, 'light', 'rare', 'dagger', 'Wąskie ostrze między płytami zbroi. Bonus serii od pierwszego powtórzenia.', { comboBonus: 6, comboAt: 2, range: 350 }),
    w('rapier', 'RAPIER SZLACHECKI', R, 'light', 'epic', 'rapier', 'Bardzo szybkie pchnięcia: 7 obrażeń, +5 już od drugiego trafienia.', { range: 410, staminaCost: 9 }),
    w('smallsword', 'SZPADA', R, 'light', 'epic', 'rapier', 'Lżejsza i szybsza od rapiera. Broń pojedynków o honor.', { range: 400, swing: .26, cooldown: .3, comboBonus: 6, comboAt: 2 }),
    w('bowie', 'NÓŻ BOWIE', X, 'light', 'rare', 'machete', 'Szeroki nóż z Dzikiego Zachodu. Bardziej tasak niż sztylet.', { weakGuardDamage: 9 }),
    w('kukri', 'KUKRI', X, 'light', 'rare', 'kukri', 'Zakrzywiony nóż Gurkhów. Tnie jak mały topór.', { weakGuardDamage: 10, comboBonus: 4 }),
    w('trench', 'NÓŻ SZTURMOWY', X, 'light', 'common', 'dagger', 'Nóż z okopów z kastetem w rękojeści. Dwie bronie w jednej.', { comboBonus: 6 }),
    w('bayonet', 'BAGNET', X, 'light', 'rare', 'dagger', 'Bagnet z okopów. Szybki jak sztylet, sięga jak miecz.', { range: 410 }),
    w('balisong', 'NÓŻ MOTYLKOWY', C, 'light', 'common', 'dagger', 'Balisong. Pół czasu walki to otwieranie go z fasonem.', { swing: .26, cooldown: .3 }),
    w('karambit', 'KARAMBIT', C, 'light', 'epic', 'karambit', 'Zakrzywiony pazur z Sumatry. Trzymany odwrotnie, tnie w każdym ruchu.', { comboBonus: 7, comboAt: 2, weakGuardDamage: 8, cooldown: .28 }),
    w('machete', 'MACZETA', C, 'light', 'common', 'machete', 'Długi tasak do trzciny. W muzeum trzciny nie ma, ale przeciwnicy są.', { range: 400, weakGuardDamage: 9, comboBonus: 3 }),
    w('tactical', 'NÓŻ TAKTYCZNY', C, 'light', 'rare', 'dagger', 'Czarne ostrze, ząbkowana część, uchwyt G10. Produkt, nie eksponat, ale działa.', { comboBonus: 6 }),
    w('m9', 'BAGNET M9', C, 'light', 'common', 'dagger', 'Bagnet do M16. Z pochwą robi za nożyce do drutu.', { range: 400 }),
    // ── Łuki i kusze ─────────────────────────────────────────────────────────
    w('sling', 'PROCA', A, 'bow', 'common', 'sling', 'Pasek skóry i kamień. Dawid też zaczynał skromnie.', { ammo: 12, reload: 1.0, weakGuardDamage: 8, range: 700 }),
    w('composite', 'ŁUK KOMPOZYTOWY', A, 'bow', 'common', 'bow', 'Róg, drewno i ścięgno. Łuk Scytów i Persów.', { ammo: 10 }),
    w('bow', 'ŁUK REFLEKSYJNY', M, 'bow', 'rare', 'bow', 'Łuk ze stepu. Dużo strzał, mniejsze obrażenia, szybkie przeładowanie kołczanu.', { ammo: 10, reload: 1.0 }),
    w('longbow', 'ŁUK DŁUGI', M, 'bow', 'rare', 'bow', 'Angielski długi łuk z cisu. Pod Azincourt odebrał rycerstwu pewność siebie.', { weakGuardDamage: 13, ammo: 8, reload: 1.4 }),
    w('yumi', 'YUMI', M, 'bow', 'rare', 'bow', 'Asymetryczny łuk samurajów. Dłuższy niż strzelec.', { weakGuardDamage: 12, ammo: 8 }),
    w('stirrup', 'KUSZA STRZEMIONOWA', M, 'bow', 'common', 'crossbow', 'Naciągana nogą w strzemieniu. Mocniejsza od łuku, wolniejsza w ładowaniu.', { ammo: 4, reload: 2.0, weakGuardDamage: 15 }),
    w('crossbow', 'KUSZA', M, 'bow', 'epic', 'crossbow', 'Bełt przebija wszystko. Trzy strzały, długie naciąganie, największe obrażenia na dystans.', { ammo: 3, reload: 2.4, weakGuardDamage: 18 }),
    w('chukonu', 'CHU-KO-NU', M, 'bow', 'epic', 'crossbow', 'Chińska kusza powtarzalna. Dziesięć bełtów bez naciągania.', { ammo: 10, reload: 2.6, weakGuardDamage: 9, cooldown: .4 }),
    w('arbalest', 'ARBALETA', R, 'bow', 'rare', 'crossbow', 'Kusza ze stalowym łuczyskiem i korbą. Jeden bełt, duża dziura.', { ammo: 2, reload: 2.8, weakGuardDamage: 21 }),
    w('compound', 'ŁUK BLOCZKOWY', C, 'bow', 'epic', 'bow', 'Bloczki, linki, celownik. Łuk, który nie wymaga siły, tylko cierpliwości.', { weakGuardDamage: 14, ammo: 8, reload: 1.1 }),
    // ── Pistolety ────────────────────────────────────────────────────────────
    w('flintlock', 'PISTOLET SKAŁKOWY', R, 'pistol', 'common', 'flintlock', 'Jeden strzał, dym i modlitwa, żeby proch był suchy.', { ammo: 1, reload: 2.6, weakGuardDamage: 19, range: 500 }),
    w('wheellock', 'PISTOLET KOŁOWY', R, 'pistol', 'rare', 'flintlock', 'Zamek kołowy nakręcany kluczykiem. Droższy od konia, na którym jechał jego właściciel.', { ammo: 1, reload: 2.4, weakGuardDamage: 20, range: 520 }),
    w('duelling', 'PISTOLET POJEDYNKOWY', R, 'pistol', 'rare', 'flintlock', 'Para w mahoniowej skrzynce. Tu masz tylko jeden, i tylko jeden strzał.', { ammo: 1, reload: 2.2, weakGuardDamage: 22, range: 560 }),
    w('derringer', 'DERRINGER', X, 'pistol', 'common', 'pistol', 'Mieści się w rękawie. Dwa strzały z bardzo bliska.', { ammo: 2, reload: 1.4, weakGuardDamage: 13, range: 420 }),
    w('peacemaker', 'COLT PEACEMAKER', X, 'pistol', 'rare', 'revolver', 'Rewolwer Dzikiego Zachodu. Sześć naboi, które zakończyły wiele sporów.', { ammo: 6, reload: 1.8, weakGuardDamage: 15 }),
    w('nagant', 'NAGANT', X, 'pistol', 'common', 'revolver', 'Rewolwer carskiej armii. Siedem naboi i spust twardy jak zima.', { ammo: 7, reload: 2.0, weakGuardDamage: 13 }),
    w('revolver', 'REWOLWER KUSTOSZA', X, 'pistol', 'legendary', 'revolver', 'Strzał z całej areny w słabą gardę: 17 obrażeń. 6 naboi na walkę, przeładowanie 1,6 s.', { range: 900 }),
    w('mauser', 'MAUSER C96', X, 'pistol', 'rare', 'pistol', 'Pistolet z drewnianą kolbą-kaburą. Dziesięć naboi z łódki.', { ammo: 10, reload: 1.8, weakGuardDamage: 13, range: 620 }),
    w('luger', 'LUGER P08', X, 'pistol', 'epic', 'pistol', 'Kolankowy zamek i ósemka w magazynku. Najbardziej pożądane trofeum z okopów.', { ammo: 8, reload: 1.5, weakGuardDamage: 14 }),
    w('colt1911', 'COLT 1911', X, 'pistol', 'epic', 'pistol', 'Kaliber .45. Sto lat w służbie i dalej aktualny.', { ammo: 7, reload: 1.4, weakGuardDamage: 16 }),
    w('vis', 'VIS WZ. 35', X, 'pistol', 'epic', 'pistol', 'Polski pistolet z Radomia. Uznawany za jeden z najlepszych swojej epoki.', { ammo: 8, reload: 1.4, weakGuardDamage: 15 }),
    w('p38', 'WALTHER P38', X, 'pistol', 'rare', 'pistol', 'Następca Lugera, prostszy i tańszy. Osiem naboi.', { ammo: 8, reload: 1.5, weakGuardDamage: 14 }),
    w('glock', 'GLOCK 17', C, 'pistol', 'common', 'pistol', 'Polimerowa rama, siedemnaście naboi, zero ozdób.', { ammo: 17, reload: 1.3, weakGuardDamage: 12 }),
    w('beretta', 'BERETTA 92', C, 'pistol', 'rare', 'pistol', 'Włoska elegancja i piętnaście naboi.', { ammo: 15, reload: 1.3, weakGuardDamage: 13 }),
    w('magnum', 'MAGNUM .44', C, 'pistol', 'epic', 'revolver', 'Najpotężniejszy rewolwer, jak mawiał pewien inspektor. Sześć naboi.', { ammo: 6, reload: 1.9, weakGuardDamage: 19 }),
    w('deagle', 'DESERT EAGLE', C, 'pistol', 'legendary', 'pistol', 'Pistolet, który wygląda, jakby wymyślono go dla filmów. Bo tak.', { ammo: 7, reload: 1.7, weakGuardDamage: 20, range: 650 }),
    // ── Karabiny i strzelby ──────────────────────────────────────────────────
    w('arquebus', 'ARKEBUZ', R, 'rifle', 'common', 'musket', 'Lont, proch i huk. Pierwsza broń palna piechoty.', { ammo: 1, reload: 3.2, weakGuardDamage: 20, range: 700 }),
    w('musket', 'MUSZKIET', R, 'rifle', 'rare', 'musket', 'Jeden strzał, chmura dymu i długie ładowanie przez lufę.', { ammo: 1, reload: 3.0, weakGuardDamage: 22 }),
    w('blunderbuss', 'GARŁACZ', R, 'rifle', 'rare', 'shotgun', 'Lejkowata lufa i garść siekańców. Z bliska nie trzeba celować.', { ammo: 1, reload: 2.8, weakGuardDamage: 24, range: 480 }),
    w('brownbess', 'BROWN BESS', R, 'rifle', 'common', 'musket', 'Muszkiet brytyjskiej piechoty przez sto lat. Niezawodny jak herbata o piątej.', { ammo: 1, reload: 2.8, weakGuardDamage: 21 }),
    w('sztucer', 'SZTUCER', X, 'rifle', 'common', 'rifle', 'Gwintowana lufa myśliwego. Celniejszy od muszkietu, wolniejszy od wszystkiego nowszego.', { ammo: 1, reload: 2.4, weakGuardDamage: 22 }),
    w('winchester', 'WINCHESTER 1873', X, 'rifle', 'rare', 'rifle', 'Karabin, który zdobył Zachód. Dźwignia i dwanaście naboi.', { ammo: 12, reload: 2.4, weakGuardDamage: 14, cooldown: .5 }),
    w('double', 'DUBELTÓWKA', X, 'rifle', 'common', 'shotgun', 'Dwie lufy, dwa strzały. Klasyka dworów i dworków.', { ammo: 2, reload: 1.6, weakGuardDamage: 19, range: 520 }),
    w('mosin', 'MOSIN', X, 'rifle', 'common', 'rifle', 'Karabin trzech wojen. Pięć naboi i zamek, który działa w każdym błocie.', { ammo: 5, reload: 2.2, weakGuardDamage: 18 }),
    w('springfield', 'SPRINGFIELD 1903', X, 'rifle', 'common', 'rifle', 'Amerykański karabin powtarzalny. Pięć naboi w łódce.', { ammo: 5, reload: 2.1, weakGuardDamage: 18 }),
    w('leeenfield', 'LEE-ENFIELD', X, 'rifle', 'rare', 'rifle', 'Dziesięć naboi i zamek tak szybki, że Niemcy brali go za karabin maszynowy.', { ammo: 10, reload: 2.2, weakGuardDamage: 17, cooldown: .5 }),
    w('mauser98', 'MAUSER 98K', X, 'rifle', 'rare', 'rifle', 'Wzorzec karabinu zamkowego. Pięć naboi, celność, waga.', { ammo: 5, reload: 2.0, weakGuardDamage: 19 }),
    w('garand', 'M1 GARAND', X, 'rifle', 'epic', 'rifle', 'Samopowtarzalny, osiem naboi i słynne „ping" pustej łódki.', { ammo: 8, reload: 1.8, weakGuardDamage: 18, cooldown: .45 }),
    w('shotgun', 'STRZELBA KUSTOSZA', X, 'rifle', 'epic', 'shotgun', 'Dwie lufy. Z bliska bardzo boli, z daleka nie ma sensu.', { ammo: 2, reload: 1.3, weakGuardDamage: 20, range: 520 }),
    w('thompson', 'THOMPSON', X, 'rifle', 'epic', 'smg', 'Pistolet maszynowy Chicago. Bęben na pięćdziesiąt naboi, każdy osobno.', { ammo: 20, reload: 2.6, weakGuardDamage: 10, cooldown: .25, swing: .3, contact: .15 }),
    w('mp40', 'MP 40', X, 'rifle', 'rare', 'smg', 'Pistolet maszynowy z blachy i rur. Trzydzieści dwa naboje.', { ammo: 16, reload: 2.4, weakGuardDamage: 9, cooldown: .25, swing: .3, contact: .15 }),
    w('sten', 'STEN', X, 'rifle', 'common', 'smg', 'Najtańszy pistolet maszynowy wojny. Czasem strzela sam, czasem wcale.', { ammo: 14, reload: 2.2, weakGuardDamage: 8, cooldown: .25, swing: .3, contact: .15 }),
    w('ppsh', 'PPSZ-41', X, 'rifle', 'rare', 'smg', 'Pepesza z bębnem na siedemdziesiąt jeden naboi. Tu dostajesz dwadzieścia pięć.', { ammo: 25, reload: 3.0, weakGuardDamage: 8, cooldown: .22, swing: .28, contact: .14 }),
    w('pump', 'STRZELBA POMPKA', C, 'rifle', 'common', 'shotgun', 'Dźwięk przeładowania robi połowę roboty.', { ammo: 5, reload: 2.0, weakGuardDamage: 18, range: 500 }),
    w('ak47', 'AK-47', C, 'rifle', 'epic', 'rifle', 'Najczęściej produkowany karabin świata. Działa po zakopaniu, zalaniu i upuszczeniu.', { ammo: 15, reload: 2.2, weakGuardDamage: 12, cooldown: .3, swing: .34, contact: .16 }),
    w('m16', 'M16', C, 'rifle', 'epic', 'rifle', 'Lekki, celny, kapryśny w dżungli. Trzydzieści naboi.', { ammo: 15, reload: 2.0, weakGuardDamage: 11, cooldown: .28, swing: .32, contact: .15 }),
    w('dragunov', 'DRAGUNOW SWD', C, 'rifle', 'legendary', 'sniper', 'Karabin wyborowy z lunetą. Dziesięć naboi, każdy w słabą gardę z drugiego końca sali.', { ammo: 10, reload: 2.4, weakGuardDamage: 22, range: 1000, cooldown: .9, swing: .6, contact: .3 }),
    w('barrett', 'BARRETT M82', C, 'rifle', 'legendary', 'sniper', 'Kaliber .50. Nie strzela się z niego do ludzi, tylko do sprzętu. Tu robimy wyjątek.', { ammo: 5, reload: 3.2, weakGuardDamage: 30, range: 1000, cooldown: 1.1, swing: .7, contact: .35 })
  ];
  const weapons = Object.freeze(definitions.map(d => {
    const type = types[d.type], merged = { ...baseline, ...type.stats, ...d.overrides };
    merged.parryReflect = Object.freeze({ ...baseline.parryReflect, ...(type.stats.parryReflect || {}), ...(d.overrides.parryReflect || {}) });
    merged.weakGuardDamage += rarityBonus[d.rarity] || 0;
    const shots = merged.kind === 'ranged' ? `${merged.ammo} ${merged.ammo === 1 ? 'strzał' : merged.ammo < 5 ? 'strzały' : 'strzałów'}, przeładowanie ${merged.reload.toLocaleString('pl-PL')} s. ` : '';
    const summary = `${type.name}. ${merged.weakGuardDamage} obrażeń w słabą gardę${merged.comboBonus ? `, +${merged.comboBonus} od ${merged.comboAt}. ciosu` : ''}. ${shots}Zasięg ${merged.range}.`;
    return Object.freeze({ id: d.id, name: d.name, era: `${eras[d.categoryId].toUpperCase()} · ${rarityLabel[d.rarity]}`, categoryId: d.categoryId, type: d.type, typeName: type.name, rarity: d.rarity, icon: d.icon,
      summary, details: Object.freeze([d.flavour]), stats: Object.freeze(merged) });
  }));
  const byId = new Map(weapons.map(weapon => [weapon.id, weapon]));
  if (byId.size !== weapons.length) throw new Error('weapons.js: powtórzone id');
  window.MuseumWeapons = Object.freeze({
    baseline, types, eras,
    get(id) { return byId.get(id) || weapons[0]; },
    has(id) { return byId.has(id); },
    all() { return weapons; }
  });
})();
