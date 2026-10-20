/* Opponents are data. Every exhibit that wakes up at night is one entry: numbers, rhythm, costume and art key.
   The night patrol's bosses are real historical villains; they are enemies to defeat, never collectibles. */
(() => {
  'use strict';
  const baseline = Object.freeze({
    hp: 160,
    shadow: 170,              // width of the floor shadow
    art: 'rex',               // key into MuseumArt.fighters
    figure: null,             // costume for the human rig (art: 'figure')
    combat: Object.freeze({
      minGap: 330, preferredGap: 365, engageRange: 400, range: 395, strikeReach: 110,
      approachSpeed: 82, retreatSpeed: 114,
      windup: 1.1, heavyWindup: 1.4, strikeDuration: .42, strikeContact: .18,
      recovery: 1.8, heavyRecovery: 2.1, heavyEvery: 3,
      idleDelay: .75, retreatTime: .65, repositionGap: 385, repositionTime: 1.05
    }),
    damage: Object.freeze({ light: 16, heavy: 23, lightBlocked: 14, heavyBlocked: 19, blockCostLight: 18, blockCostHeavy: 23 })
  });
  // Humans stand closer than a fossil the size of a bus.
  const human = Object.freeze({ shadow: 96, art: 'figure',
    combat: { minGap: 230, preferredGap: 285, engageRange: 330, range: 300, strikeReach: 95, repositionGap: 300 } });
  // Fighting styles for the historical bosses. Tier 1..6 scales HP and damage along the night.
  const archetypes = {
    tyrant:    { windup: 1.0, heavyWindup: 1.3, strikeDuration: .40, strikeContact: .17, recovery: 1.6, heavyRecovery: 2.0, heavyEvery: 3, idleDelay: .7 },
    brute:     { windup: 1.3, heavyWindup: 1.7, strikeDuration: .50, strikeContact: .22, recovery: 2.0, heavyRecovery: 2.5, heavyEvery: 2, idleDelay: .8, approachSpeed: 70 },
    duelist:   { windup: .85, heavyWindup: 1.1, strikeDuration: .34, strikeContact: .15, recovery: 1.3, heavyRecovery: 1.6, heavyEvery: 4, idleDelay: .55, approachSpeed: 105, retreatSpeed: 130 },
    trickster: { windup: .7, heavyWindup: 1.5, strikeDuration: .36, strikeContact: .14, recovery: 1.9, heavyRecovery: 2.3, heavyEvery: 3, idleDelay: .45 },
    gunman:    { range: 350, engageRange: 380, windup: .8, heavyWindup: 1.5, strikeDuration: .34, strikeContact: .13, recovery: 1.5, heavyRecovery: 2.3, heavyEvery: 3, idleDelay: .5 }
  };
  function villain(id, name, alias, aliasGen, tag, era, archetype, tier, figure, description) {
    const t = tier;
    return { id, name, alias, aliasGen, tag, era, kind: 'postać historyczna', description,
      stats: { ...human, archetype, hp: 150 + t * 18, combat: { ...human.combat, ...archetypes[archetype] },
        damage: { light: 13 + t, heavy: Math.round(20 + t * 1.5), lightBlocked: 11 + t, heavyBlocked: 16 + t, blockCostLight: 16 + t, blockCostHeavy: 22 + t },
        figure } };
  }
  const definitions = [
    { id: 'raptor', name: 'VELOCIRAPTOR', alias: 'Raptor', aliasGen: 'Raptora', tag: 'KREDA PÓŹNA · NR INW. 075', era: '75 milionów lat temu', kind: 'dinozaur',
      description: 'Szybki, lekki, nerwowy. Krótkie zamachy, krótki odpoczynek.',
      stats: { hp: 110, shadow: 120, art: 'raptor',
        combat: { minGap: 260, preferredGap: 300, engageRange: 340, range: 310, strikeReach: 100, approachSpeed: 110, retreatSpeed: 140,
          windup: .85, heavyWindup: 1.15, strikeDuration: .36, strikeContact: .15, recovery: 1.3, heavyRecovery: 1.6, heavyEvery: 4, idleDelay: .55, repositionGap: 320, repositionTime: .8 },
        damage: { light: 11, heavy: 17, lightBlocked: 9, heavyBlocked: 14, blockCostLight: 14, blockCostHeavy: 19 } } },
    { id: 'trex', name: 'TYRANNOSAURUS REX', alias: 'T-Rex', aliasGen: 'T-Rexa', tag: 'KREDA PÓŹNA · NR INW. 066', era: '66 milionów lat temu', kind: 'dinozaur',
      description: 'Stal kontra 66 milionów lat furii.', stats: {} },
    { id: 'leonidas', name: 'LEONIDAS I', alias: 'Leonidas', aliasGen: 'Leonidasa', tag: 'SPARTA · 480 P.N.E.', era: 'Termopile, 480 p.n.e.', kind: 'postać historyczna',
      description: 'Król Sparty. Włócznia zza tarczy, ciężki cios co drugi raz.',
      stats: { ...human, hp: 180, combat: { ...human.combat, range: 330, windup: 1.0, heavyWindup: 1.3, recovery: 1.6, heavyRecovery: 2.0, heavyEvery: 2 },
        damage: { light: 15, heavy: 24, lightBlocked: 12, heavyBlocked: 20, blockCostLight: 18, blockCostHeavy: 26 },
        figure: { skin: '#c9956b', hair: '#2b1d14', cloak: '#8b1a1a', tunic: '#7a1616', armor: '#b08a3e', armorDark: '#6e5321', legs: 'bare', boots: '#5a3a22', hat: 'corinthian', hatColor: '#b08a3e', crest: '#b3202a', weapon: 'spear', shield: '#a8792f', shieldGlyph: 'Λ', beard: 'full' } } },
    villain('xerxes', 'KSERKSES I', 'Kserkses', 'Kserksesa', 'PERSJA · 479 P.N.E.', 'Plateje, 479 p.n.e.', 'tyrant', 1,
      { skin: '#c8a07a', hair: '#1f1510', coat: '#4a1f6b', coatDark: '#2e1245', trousers: '#3b2a5a', boots: '#3a2616', hat: 'crown', hatColor: '#d4af37', beard: 'full', weapon: 'spear', sash: '#d4af37' },
      'Król królów. Spalił Ateny i kazał wychłostać morze. Włócznia i tempo tyrana.'),
    villain('qin', 'QIN SHI HUANG', 'Qin Shi Huang', 'Qin Shi Huanga', 'CHINY · 210 P.N.E.', 'Xianyang, 210 p.n.e.', 'tyrant', 1,
      { skin: '#e0b892', hair: '#141010', coat: '#141414', coatDark: '#000000', trousers: '#1c1c1c', boots: '#0d0d0d', hat: 'mianguan', hatColor: '#111111', beard: 'goatee', weapon: 'sabre', sash: '#d4af37' },
      'Pierwszy cesarz. Palił księgi i grzebał uczonych. Miecz jian i spokój człowieka, który chciał żyć wiecznie.'),
    villain('herod', 'HEROD WIELKI', 'Herod', 'Heroda', 'JUDEA · 4 P.N.E.', 'Jerozolima, 4 p.n.e.', 'trickster', 1,
      { skin: '#d3a279', hair: '#2a1a12', coat: '#7a1f2e', coatDark: '#4d1220', trousers: '#5a3a2a', boots: '#3a2616', hat: 'crown', hatColor: '#d4af37', beard: 'full', weapon: 'dagger' },
      'Król z nadania Rzymu, paranoik na tronie. Szybki sztylet i długie chwile bezradności po ciosie.'),
    villain('caligula', 'KALIGULA', 'Kaligula', 'Kaliguli', 'RZYM · 40', 'Rzym, 40 r.', 'trickster', 1,
      { skin: '#e3c1a0', hair: '#4a3620', coat: '#f0ead6', coatDark: '#c9bf9f', trousers: '#f0ead6', legs: 'bare', boots: '#7a4e2a', hat: 'laurel', weapon: 'dagger', sash: '#6b1f8a' },
      'Cesarz, który mianował konia senatorem. Nieprzewidywalny: lekkie ciosy błyskawiczne, ciężkie z opóźnieniem.'),
    villain('nero', 'NERON', 'Neron', 'Nerona', 'RZYM · 64', 'Rzym, 64 r.', 'tyrant', 1,
      { skin: '#e8c6a4', hair: '#8a5a2a', coat: '#5a1a6b', coatDark: '#3a1045', trousers: '#5a1a6b', legs: 'bare', boots: '#7a4e2a', hat: 'laurel', hatColor: '#d4af37', beard: 'goatee', weapon: 'staff', sash: '#d4af37' },
      'Grał na lirze, gdy płonął Rzym. Liry nie ma, została laska. Wyważony rytm.'),
    villain('commodus', 'KOMMODUS', 'Kommodus', 'Kommodusa', 'KOLOSEUM · 192', 'Koloseum, 192 r.', 'duelist', 2,
      { skin: '#e0bd98', hair: '#6a4a26', coat: '#8a2a2a', coatDark: '#5a1a1a', trousers: '#8a2a2a', legs: 'bare', boots: '#5a3a22', armor: '#c9a65a', armorDark: '#7a6030', beard: 'full', weapon: 'sabre' },
      'Cesarz-gladiator. Walczył na arenie z przeciwnikami, którym dawano drewniane miecze. Szybki, rzadko ciężki.'),
    villain('attila', 'ATTYLA', 'Attyla', 'Attyli', 'HUNOWIE · 451', 'Pola Katalaunijskie, 451 r.', 'brute', 2,
      { skin: '#d9b48a', hair: '#1a120c', coat: '#6b4a2a', coatDark: '#3f2a16', trousers: '#4a3620', boots: '#2a1a10', hat: 'helmet', hatColor: '#7a7a80', beard: 'goatee', weapon: 'sabre', cloak: '#5a3a1e' },
      'Bicz Boży. Wolny zamach, ciężki cios co drugi raz, długi odpoczynek. Czekaj i karz.'),
    villain('genghis', 'CZYNGIS-CHAN', 'Czyngis-chan', 'Czyngis-chana', 'MONGOLIA · 1211', 'Step, 1211 r.', 'duelist', 2,
      { skin: '#d8b48c', hair: '#1a120c', coat: '#2a4a8a', coatDark: '#182c55', trousers: '#3a3a3a', boots: '#2a1a10', hat: 'furhat', hatColor: '#4a3620', beard: 'goatee', weapon: 'bow', sash: '#c9a040' },
      'Zjednoczył stepy i zrównał z ziemią pół Azji. Strzela z łuku z bliska, potem odskakuje.'),
    villain('timur', 'TAMERLAN', 'Tamerlan', 'Tamerlana', 'SAMARKANDA · 1398', 'Samarkanda, 1398 r.', 'tyrant', 3,
      { skin: '#d2a67e', hair: '#1a120c', coat: '#1f6b4a', coatDark: '#124430', trousers: '#2a2a2a', boots: '#2a1a10', hat: 'turban', hatColor: '#f0e8d0', beard: 'full', weapon: 'sabre', sash: '#d4af37' },
      'Budował piramidy z czaszek. Kulawy, ale szabla nie kuleje.'),
    villain('vlad', 'WŁAD PALOWNIK', 'Wład Palownik', 'Włada Palownika', 'WOŁOSZCZYZNA · 1462', 'Târgoviște, 1462 r.', 'trickster', 3,
      { skin: '#e6c9ae', hair: '#1a120c', coat: '#5a0f1e', coatDark: '#360812', trousers: '#2a1a1a', boots: '#1a1010', hat: 'cap', hatColor: '#7a1020', mustache: 'handlebar', weapon: 'spear', cloak: '#2a0a10' },
      'Drakula z krwi i kości. Zamiast włóczni pal. Lekkie pchnięcia bez ostrzeżenia, ciężkie z długim zamachem.'),
    villain('torquemada', 'TORQUEMADA', 'Torquemada', 'Torquemady', 'INKWIZYCJA · 1483', 'Sewilla, 1483 r.', 'tyrant', 3,
      { skin: '#e2c4a4', hair: '#3a2a1a', coat: '#121212', coatDark: '#000000', trousers: '#121212', boots: '#0d0d0d', hat: 'hood', hatColor: '#121212', weapon: 'staff' },
      'Wielki inkwizytor. Laska zakończona krzyżem, miarowy rytm przesłuchania.'),
    villain('cortes', 'HERNÁN CORTÉS', 'Cortés', 'Cortésa', 'KONKWISTA · 1521', 'Tenochtitlan, 1521 r.', 'duelist', 3,
      { skin: '#dcb594', hair: '#2a1a12', coat: '#3a3a3a', coatDark: '#1e1e1e', trousers: '#2a2a2a', boots: '#1a1010', hat: 'morion', hatColor: '#8a8a90', armor: '#9a9aa0', armorDark: '#5a5a60', beard: 'full', weapon: 'sabre' },
      'Spalił własne okręty i zburzył Tenochtitlan. Szybki rapier konkwistadora.'),
    villain('pizarro', 'FRANCISCO PIZARRO', 'Pizarro', 'Pizarra', 'KONKWISTA · 1532', 'Cajamarca, 1532 r.', 'gunman', 3,
      { skin: '#d8b08c', hair: '#3a2a1a', coat: '#4a3a2a', coatDark: '#2a2016', trousers: '#2a2a2a', boots: '#1a1010', hat: 'morion', hatColor: '#8a8a90', armor: '#8a8a90', armorDark: '#505056', beard: 'full', weapon: 'rifle' },
      'Pojmał Atahualpę podstępem. Arkebuz z bliska: błysk, dym, długie przeładowanie.'),
    villain('ivan', 'IWAN GROŹNY', 'Iwan Groźny', 'Iwana Groźnego', 'MOSKWA · 1570', 'Nowogród, 1570 r.', 'brute', 4,
      { skin: '#e0bd98', hair: '#3a2a1a', coat: '#8a1a1a', coatDark: '#5a1010', trousers: '#2a1a1a', boots: '#1a1010', hat: 'furhat', hatColor: '#d4af37', beard: 'long', weapon: 'staff', sash: '#d4af37' },
      'Car, który zabił własnego syna. Okuta laska bije ciężko i rzadko.'),
    villain('bathory', 'ELŻBIETA BATORY', 'Elżbieta Batory', 'Elżbiety Batory', 'WĘGRY · 1610', 'Czachtice, 1610 r.', 'trickster', 3,
      { skin: '#eed6c2', hair: '#1a120c', coat: '#2a0a2a', coatDark: '#160416', trousers: '#2a0a2a', boots: '#1a1010', hat: 'none', weapon: 'dagger', sash: '#8a1a2a' },
      'Krwawa hrabina. Sztylet, cisza i pchnięcie, kiedy się najmniej spodziewasz.'),
    villain('blackbeard', 'CZARNOBRODY', 'Czarnobrody', 'Czarnobrodego', 'PIRACI · 1718', 'Ocracoke, 1718 r.', 'gunman', 4,
      { skin: '#d0a07a', hair: '#0d0d0d', coat: '#1a1a1a', coatDark: '#000000', trousers: '#2a2a2a', boots: '#0d0d0d', hat: 'tricorn', hatColor: '#111111', beard: 'long', weapon: 'pistol', sash: '#8a1a1a' },
      'Lonty w brodzie, sześć pistoletów za pasem. Strzela z bliska, potem przeładowuje za długo.'),
    villain('robespierre', 'ROBESPIERRE', 'Robespierre', 'Robespierre’a', 'TERROR · 1794', 'Paryż, 1794 r.', 'duelist', 4,
      { skin: '#eacfb6', hair: '#d8d2c4', coat: '#1f3a6b', coatDark: '#13254a', lapel: '#e8e4d8', trousers: '#ece7d8', boots: '#1a1a1a', hat: 'none', weapon: 'sabre', sash: '#c0392b' },
      'Nieprzekupny. Posłał na gilotynę tysiące, w końcu sam. Szybkie, precyzyjne cięcia.'),
    villain('leopold', 'LEOPOLD II', 'Leopold II', 'Leopolda II', 'KONGO · 1900', 'Wolne Państwo Kongo, 1900 r.', 'tyrant', 4,
      { skin: '#e8cdb2', hair: '#d8d8d0', coat: '#1a2a4a', coatDark: '#0f1a30', trousers: '#1a2a4a', boots: '#1a1010', hat: 'peaked', hatColor: '#1a2a4a', beard: 'long', weapon: 'rifle', epaulettes: '#d4af37' },
      'Król Belgów, prywatny właściciel Konga. Karabin i spokój księgowego.'),
    villain('rasputin', 'RASPUTIN', 'Rasputin', 'Rasputina', 'PIOTROGRÓD · 1916', 'Piotrogród, 1916 r.', 'brute', 4,
      { skin: '#dcbfa2', hair: '#2a1a12', coat: '#1a1a1a', coatDark: '#000000', trousers: '#1a1a1a', boots: '#0d0d0d', hat: 'none', beard: 'long', weapon: 'staff' },
      'Otruty, postrzelony, utopiony. Dużo HP i ciosy jak kłoda. Nie chce upaść.'),
    villain('capone', 'AL CAPONE', 'Al Capone', 'Ala Capone’a', 'CHICAGO · 1929', 'Chicago, 1929 r.', 'gunman', 5,
      { skin: '#e6c2a6', hair: '#2a1a12', coat: '#4a4a52', coatDark: '#2a2a30', lapel: '#d8d8d8', trousers: '#4a4a52', boots: '#1a1010', hat: 'fedora', hatColor: '#e8e2d0', weapon: 'rifle', sash: '#8a1a1a' },
      'Masakra w dniu świętego Walentego. Tommy gun z bliska, potem bęben pusty i garda w dół.'),
    villain('mussolini', 'MUSSOLINI', 'Mussolini', 'Mussoliniego', 'RZYM · 1940', 'Rzym, 1940 r.', 'brute', 5,
      { skin: '#e3c1a0', hair: '#2a2a2a', coat: '#1a1a1a', coatDark: '#000000', trousers: '#1a1a1a', boots: '#0d0d0d', hat: 'fez', hatColor: '#111111', weapon: 'sabre', epaulettes: '#d4af37' },
      'Duce z balkonu. Szabla, wypięta pierś i ciężkie, powolne cięcia.'),
    villain('tojo', 'HIDEKI TŌJŌ', 'Tōjō', 'Tōjō', 'TOKIO · 1941', 'Tokio, 1941 r.', 'duelist', 5,
      { skin: '#e8c9a8', hair: '#1a1a1a', coat: '#5a5a3a', coatDark: '#3a3a24', trousers: '#5a5a3a', boots: '#0d0d0d', hat: 'peaked', hatColor: '#5a5a3a', mustache: 'thick', weapon: 'sabre', epaulettes: '#d4af37' },
      'Generał i premier w jednym. Katana w rytmie szermierza: szybko, rzadko ciężko.'),
    villain('mao', 'MAO ZEDONG', 'Mao', 'Mao', 'PEKIN · 1966', 'Pekin, 1966 r.', 'tyrant', 5,
      { skin: '#e6c8a8', hair: '#1a1a1a', coat: '#5a5a5a', coatDark: '#3a3a3a', trousers: '#5a5a5a', boots: '#0d0d0d', hat: 'cap', hatColor: '#5a5a5a', weapon: 'staff', star: '#d33a3a' },
      'Wielki Skok i rewolucja kulturalna. Laska w miarowym tempie przewodniczącego.'),
    villain('amin', 'IDI AMIN', 'Idi Amin', 'Idiego Amina', 'KAMPALA · 1976', 'Kampala, 1976 r.', 'brute', 5,
      { skin: '#6b4a32', hair: '#0d0d0d', coat: '#6b6a4a', coatDark: '#44432e', trousers: '#6b6a4a', boots: '#0d0d0d', hat: 'peaked', hatColor: '#6b6a4a', weapon: 'pistol', epaulettes: '#d4af37', sash: '#d4af37' },
      'Pierś pełna orderów, które sam sobie nadał. Ciężki, wolny, boli.'),
    villain('polpot', 'POL POT', 'Pol Pot', 'Pol Pota', 'KAMBODŻA · 1977', 'Phnom Penh, 1977 r.', 'trickster', 5,
      { skin: '#d8b08c', hair: '#1a1a1a', coat: '#1a1a1a', coatDark: '#000000', trousers: '#1a1a1a', boots: '#0d0d0d', hat: 'cap', hatColor: '#1a1a1a', weapon: 'rifle', sash: '#8a1a1a' },
      'Rok zero. Nieprzewidywalny rytm, szybkie serie i długie przerwy.'),
    villain('ceausescu', 'CEAUȘESCU', 'Ceaușescu', 'Ceaușescu', 'BUKARESZT · 1989', 'Bukareszt, 1989 r.', 'tyrant', 5,
      { skin: '#e3c1a0', hair: '#4a4a4a', coat: '#2a2a2a', coatDark: '#141414', lapel: '#d8d8d8', trousers: '#2a2a2a', boots: '#0d0d0d', hat: 'none', weapon: 'pistol' },
      'Geniusz Karpat, do ostatniego przemówienia z balkonu. Pistolet i uparty rytm.'),
    villain('saddam', 'SADDAM HUSAJN', 'Saddam', 'Saddama', 'BAGDAD · 1991', 'Bagdad, 1991 r.', 'gunman', 6,
      { skin: '#d6ad88', hair: '#1a1a1a', coat: '#4a5a3a', coatDark: '#2e3a24', trousers: '#4a5a3a', boots: '#0d0d0d', hat: 'beret', hatColor: '#1a1a1a', mustache: 'thick', weapon: 'rifle', epaulettes: '#d4af37' },
      'Strzelał z karabinu z balkonu do tłumu. Tu strzela do ciebie, z bliska i z przerwami.'),
    villain('escobar', 'PABLO ESCOBAR', 'Escobar', 'Escobara', 'MEDELLÍN · 1993', 'Medellín, 1993 r.', 'trickster', 6,
      { skin: '#dcb08e', hair: '#1a1a1a', coat: '#2a3a6a', coatDark: '#1a2444', lapel: '#f0f0f0', trousers: '#3a3a3a', boots: '#1a1010', hat: 'none', mustache: 'thick', weapon: 'pistol' },
      'Plata o plomo. Szybki strzał bez ostrzeżenia, potem długie chowanie się.'),
    villain('binladen', 'OSAMA BIN LADEN', 'bin Laden', 'bin Ladena', 'TORA BORA · 2001', 'Tora Bora, 2001 r.', 'gunman', 6,
      { skin: '#d6b08c', hair: '#1a1a1a', coat: '#e8e2d0', coatDark: '#b8b2a0', trousers: '#e8e2d0', boots: '#3a2616', hat: 'turban', hatColor: '#f0ead6', beard: 'long', weapon: 'rifle', cloak: '#5a5a3a' },
      'Ukryty w jaskiniach. Karabin z dystansu, chwila słabości po każdej serii.'),
    villain('gaddafi', 'MUAMMAR KADDAFI', 'Kaddafi', 'Kaddafiego', 'SYRTA · 2011', 'Syrta, 2011 r.', 'brute', 6,
      { skin: '#c89a74', hair: '#1a1a1a', coat: '#6b4a2a', coatDark: '#44301a', trousers: '#6b4a2a', boots: '#1a1010', hat: 'peaked', hatColor: '#6b4a2a', weapon: 'pistol', epaulettes: '#d4af37', sash: '#2a8a4a' },
      'Ostatni boss nocy. Złoty pistolet, ciężka ręka i najwięcej HP w muzeum.'),
    { id: 'napoleon', name: 'NAPOLEON BONAPARTE', alias: 'Napoleon', aliasGen: 'Napoleona', tag: 'CESARSTWO · 1812', era: 'Borodino, 1812', kind: 'postać historyczna',
      description: 'Cesarz Francuzów. Szybka szabla, krótkie przerwy między natarciami.',
      stats: { ...human, hp: 170, combat: { ...human.combat, approachSpeed: 95, windup: .9, heavyWindup: 1.2, strikeDuration: .38, recovery: 1.4, heavyRecovery: 1.8, heavyEvery: 3, idleDelay: .6 },
        damage: { light: 14, heavy: 21, lightBlocked: 12, heavyBlocked: 17, blockCostLight: 16, blockCostHeavy: 22 },
        figure: { skin: '#e8c3a5', hair: '#3a2a1f', coat: '#1f3a6b', coatDark: '#13254a', lapel: '#e8e4d8', trousers: '#ece7d8', boots: '#1a1a1a', hat: 'bicorne', hatColor: '#15191f', cockade: '#c0392b', sash: '#c0392b', weapon: 'sabre', epaulettes: '#d4af37' } } },
    { id: 'hitler', name: 'ADOLF HITLER', alias: 'Hitler', aliasGen: 'Hitlera', tag: 'BERLIN · 1945', era: 'Bunkier, 1945', kind: 'postać historyczna',
      description: 'Osaczony tyran. Pistolet z bliska, nerwowe, nieregularne natarcia.',
      stats: { ...human, hp: 150, combat: { ...human.combat, range: 340, engageRange: 360, windup: .8, heavyWindup: 1.5, strikeDuration: .34, strikeContact: .14, recovery: 1.5, heavyRecovery: 2.3, heavyEvery: 3, idleDelay: .5 },
        damage: { light: 17, heavy: 26, lightBlocked: 13, heavyBlocked: 21, blockCostLight: 20, blockCostHeavy: 27 },
        figure: { skin: '#e6c2a6', hair: '#2a2118', coat: '#6b6349', coatDark: '#4d4634', trousers: '#5a5340', boots: '#1d1a16', hat: 'peaked', hatColor: '#5e5740', mustache: 'toothbrush', armband: '#b3202a', weapon: 'pistol' } } },
    { id: 'stalin', name: 'JÓZEF STALIN', alias: 'Stalin', aliasGen: 'Stalina', tag: 'MOSKWA · 1953', era: 'Kreml, 1953', kind: 'postać historyczna',
      description: 'Najwięcej HP wśród dawnych bossów, ciężka szaszka, długie zamachy.',
      stats: { ...human, hp: 220, combat: { ...human.combat, approachSpeed: 70, windup: 1.2, heavyWindup: 1.6, strikeDuration: .46, strikeContact: .2, recovery: 1.9, heavyRecovery: 2.4, heavyEvery: 2, idleDelay: .8 },
        damage: { light: 18, heavy: 28, lightBlocked: 15, heavyBlocked: 23, blockCostLight: 21, blockCostHeavy: 30 },
        figure: { skin: '#e3bd9c', hair: '#3b3028', coat: '#6f7a4e', coatDark: '#4e5736', trousers: '#5f6a45', boots: '#1d1a16', hat: 'peaked', hatColor: '#6f7a4e', star: '#d33a3a', mustache: 'thick', weapon: 'sabre', epaulettes: '#d4af37' } } }
  ];
  const exhibits = Object.freeze(definitions.map(definition => Object.freeze({
    ...definition,
    aliasGen: definition.aliasGen || definition.alias + 'a',
    stats: Object.freeze({
      ...baseline, ...definition.stats,
      combat: Object.freeze({ ...baseline.combat, ...(definition.stats.combat || {}) }),
      damage: Object.freeze({ ...baseline.damage, ...(definition.stats.damage || {}) }),
      figure: definition.stats.figure ? Object.freeze({ ...definition.stats.figure }) : null
    })
  })));
  const byId = new Map(exhibits.map(exhibit => [exhibit.id, exhibit]));
  window.MuseumExhibits = Object.freeze({
    baseline, archetypes,
    get(id) { return byId.get(id) || byId.get('trex'); },
    all() { return exhibits; }
  });
})();
