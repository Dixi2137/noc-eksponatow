/* Limited weapon finishes: cosmetic coats that re-colour any weapon in hand and in the collection.
   Mythic rarity, dropped only by the Sejf Kolekcjonera crate. Colours: steel body, edge highlight, dark steel, fittings (gold), haft (wood). */
(() => {
  'use strict';
  const f = (id, name, era, flavour, colors, fx) => Object.freeze({ id, name, era, flavour, rarity: 'mythic', fx, colors: Object.freeze(colors) });
  const finishes = Object.freeze([
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
  ]);
  const byId = new Map(finishes.map(x => [x.id, x]));
  function hue(h, s, l) { return `hsl(${((h % 360) + 360) % 360},${s}%,${l}%)`; }
  // Palette letters shared by icons and in-hand sprites: M steel, W edge, S dark steel, G fittings, D haft.
  function palette(finish, time = 0) {
    const fin = typeof finish === 'string' ? byId.get(finish) : finish;
    if (!fin) return null;
    if (fin.fx === 'holo') { const h = time * 90; return { M: hue(h, 75, 62), W: hue(h + 60, 90, 88), S: hue(h - 50, 60, 34), G: hue(h + 150, 80, 78), D: fin.colors.wood }; }
    const c = fin.colors; return { M: c.steel, W: c.edge, S: c.dark, G: c.gold, D: c.wood };
  }
  // Per-pixel overlay for the special effects: returns a colour for a sprite pixel (letter at col/row) or null.
  function overlay(finish, letter, col, row, time = 0) {
    const fin = typeof finish === 'string' ? byId.get(finish) : finish;
    if (!fin || letter === 'O' || letter === '.') return null;
    const metal = letter === 'M' || letter === 'W' || letter === 'S';
    const tick = Math.floor(time * 6);
    switch (fin.fx) {
      case 'sparkle': return metal && ((col * 7 + row * 13 + tick * 5) % 23 === 0) ? '#ffffff' : null;
      case 'stars': return metal && ((col * 11 + row * 7 + tick * 3) % 19 === 0) ? '#f0e6ff' : null;
      case 'veins': return letter === 'M' && ((col * 2 + row * 3) % 9 === 0 || (col + row * 2) % 11 === 0) ? fin.colors.vein : null;
      case 'brushed': return letter === 'M' && (row % 3 === 1) ? fin.colors.vein : null;
      case 'glow': return letter === 'W' && tick % 2 === 0 ? '#ff8c9a' : null;
      case 'holo': return metal ? hue(time * 90 + row * 22 + col * 8, 85, 70, ) : null;
      default: return null;
    }
  }
  window.MuseumFinishes = Object.freeze({ all: () => finishes, get: id => byId.get(id) || null, has: id => byId.has(id), palette, overlay, count: finishes.length });
})();
