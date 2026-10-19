/* The night patrol: an ordered list of levels. One level is one opponent, one era, one scenery. */
(() => {
  'use strict';
  const definitions = [
    {
      id: 'cretaceous-raptor', number: 1, year: -75000000, yearLabel: '75 MLN LAT TEMU', title: 'KREDA PÓŹNA', hall: 'SALA PALEONTOLOGII',
      exhibit: 'raptor', theme: 'museum', reward: 120,
      tagline: 'Mały szkielet. Szybkie szczęki.<br>Rozgrzewka przed prawdziwą historią.',
      card: 'Gablota z napisem VELOCIRAPTOR właśnie pękła.',
      prologue: [
        { label: '23:58 / OSTATNI OBCHÓD', text: 'W muzeum zapada cisza. Stróż kończy swój ostatni obchód.' },
        { label: '00:00 / COŚ SIĘ OBUDZIŁO', text: 'Z sali paleontologii dobiega trzask. Stal porusza się. Kości łapią oddech.' },
        { label: '00:01 / HISTORIA KONTRA HISTORIA', text: 'Jeden rycerz. Jedna noc. Każda sala to inna epoka. Przetrwa tylko jeden.' }
      ]
    },
    {
      id: 'cretaceous-rex', number: 2, year: -66000000, yearLabel: '66 MLN LAT TEMU', title: 'KONIEC KREDY', hall: 'GŁÓWNA GALERIA',
      exhibit: 'trex', theme: 'museum', reward: 180,
      tagline: 'Stal kontra 66 milionów lat furii.<br>Wejdź do muzeum, w którym nie wolno dotykać.<br>Chyba że zadajesz cios.',
      card: 'Główna galeria. Król kredy schodzi z postumentu.'
    },
    {
      id: 'thermopylae', number: 3, year: -480, yearLabel: '480 P.N.E.', title: 'TERMOPILE', hall: 'SALA ANTYKU',
      exhibit: 'leonidas', theme: 'sparta', reward: 240,
      tagline: 'Trzystu już nie ma. Został jeden.<br>Król Sparty nie cofa się o krok.',
      card: 'Wąwóz Termopil. Leonidas zasłania przejście tarczą.'
    },
    {
      id: 'borodino', number: 4, year: 1812, yearLabel: '1812', title: 'BORODINO', hall: 'SALA EMPIRE',
      exhibit: 'napoleon', theme: 'napoleon', reward: 300,
      tagline: 'Cesarz Francuzów w śniegu pod Moskwą.<br>Szabla w dłoni, Europa za plecami.',
      card: 'Pole pod Borodino. Napoleon wyciąga szablę z pochwy.'
    },
    {
      id: 'berlin', number: 5, year: 1945, yearLabel: '1945', title: 'BERLIN', hall: 'BUNKIER',
      exhibit: 'hitler', theme: 'bunker', reward: 380,
      tagline: 'Beton, kurz i koniec wojny.<br>Tyran w bunkrze nie ma już dokąd uciec.',
      card: 'Bunkier pod Kancelarią Rzeszy. Hitler nie ma już dokąd uciec.'
    },
    {
      id: 'moscow', number: 6, year: 1953, yearLabel: '1953', title: 'MOSKWA', hall: 'KREML',
      exhibit: 'stalin', theme: 'kremlin', reward: 460,
      tagline: 'Czerwone mury, czerwona gwiazda.<br>Ostatni pojedynek nocy.',
      card: 'Kreml. Stalin odkłada fajkę i sięga po szaszkę.'
    }
  ];
  const levels = Object.freeze(definitions.map(level => Object.freeze({ ...level, prologue: Object.freeze((level.prologue || []).map(Object.freeze)) })));
  const byId = new Map(levels.map(level => [level.id, level]));
  window.MuseumLevels = Object.freeze({
    all() { return levels; },
    get(id) { return byId.get(id) || levels[0]; },
    at(index) { return levels[Math.max(0, Math.min(levels.length - 1, index | 0))]; },
    indexOf(id) { return Math.max(0, levels.findIndex(level => level.id === id)); },
    next(id) { const index = levels.findIndex(level => level.id === id); return index >= 0 && index + 1 < levels.length ? levels[index + 1] : null; },
    first() { return levels[0]; },
    count: levels.length
  });
})();
