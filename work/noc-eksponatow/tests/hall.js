/* The private hall: slots accept only owned items of the right kind, trophies come from cleared levels, prestige adds up. */
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const hall = window.MuseumHall, loot = window.MuseumLoot, levels = window.MuseumLevels, art = window.MuseumArt;
  const base = () => ({ ...loot.migrate(null), weapons: ['sword', 'axe'], cards: ['card-zawisza'], cleared: ['cretaceous-raptor', 'cretaceous-rex'] });

  test('Każdy poziom ma dokładnie jedno trofeum', () => {
    for (const level of levels.all()) assert.equal(hall.trophies.filter(t => t.level === level.id).length, 1, level.id);
    assert.equal(hall.trophies.length, levels.count);
  });
  test('Trofea przychodzą z zaliczonych sal; nie da się ich kupić ani sprzedać', () => {
    const p = base(); assert.equal(hall.ownedTrophies(p).length, 2); assert.ok(hall.hasTrophy(p, 'trophy-rex')); assert.ok(!hall.hasTrophy(p, 'trophy-stalin'));
    assert.equal(loot.getItem('trophy-rex'), null, 'trofea nie są w katalogu skrzyń'); assert.equal(loot.canSell(p, 'trophy-rex'), false);
  });
  test('Świeży profil ma pustą salę z domyślną nazwą', () => {
    const p = loot.migrate(null); assert.deepEqual(p.hall, { name: hall.DEFAULT_NAME, slots: {} }); assert.equal(hall.summary(p).filled, 0);
  });
  test('Miejsce przyjmuje tylko posiadany przedmiot właściwego rodzaju', () => {
    let p = base();
    assert.ok(hall.setSlot(p, 'armor-1', 'brass')); assert.ok(hall.setSlot(p, 'weapon-1', 'axe')); assert.ok(hall.setSlot(p, 'card-1', 'card-zawisza')); assert.ok(hall.setSlot(p, 'trophy-1', 'trophy-rex'));
    assert.equal(hall.setSlot(p, 'armor-1', 'axe'), null, 'broń na postumencie'); assert.equal(hall.setSlot(p, 'weapon-1', 'revolver'), null, 'nieposiadana broń');
    assert.equal(hall.setSlot(p, 'trophy-1', 'trophy-stalin'), null, 'niezdobyte trofeum'); assert.equal(hall.setSlot(p, 'nie-ma', 'brass'), null);
    p = hall.setSlot(p, 'armor-1', 'brass'); p = hall.setSlot(p, 'armor-1', null); assert.equal(hall.exhibition(p)[0].item, null, 'opróżnianie');
  });
  test('Sprzedany przedmiot znika z ekspozycji, a wartość i prestiż się przeliczają', () => {
    let p = base(); p = hall.setSlot(p, 'weapon-1', 'axe'); p = hall.setSlot(p, 'trophy-1', 'trophy-rex'); p = hall.setSlot(p, 'armor-1', 'brass');
    let sum = hall.summary(p); assert.equal(sum.filled, 3); assert.equal(sum.value, 150, 'topór 150, trofeum i strój podstawowy 0'); assert.equal(sum.prestige, 2 + 12 + 1);
    p = loot.sell(p, 'axe').profile; sum = hall.summary(p); assert.equal(sum.filled, 2); assert.equal(sum.value, 0); assert.equal(hall.exhibition(p).find(e => e.slot.id === 'weapon-1').item, null);
  });
  test('Ulepszenia i pełna sala podbijają prestiż', () => {
    let p = { ...base(), weapons: ['sword', 'axe', 'spear'], cards: ['card-zawisza', 'card-sobieski'], owned: ['brass', 'stachu-jones', 'frost'], upgrades: { 'weapon:axe': 3 } };
    for (const [slot, id] of [['armor-1', 'brass'], ['armor-2', 'frost'], ['weapon-1', 'axe'], ['weapon-2', 'spear'], ['card-1', 'card-zawisza'], ['card-2', 'card-sobieski'], ['trophy-1', 'trophy-rex'], ['trophy-2', 'trophy-raptor']]) { p = hall.setSlot(p, slot, id); assert.ok(p, slot); }
    const sum = hall.summary(p); assert.equal(sum.filled, 8); assert.equal(sum.fullBonus, 20);
    assert.equal(sum.prestige, 1 + 4 + 2 + 4 + 4 + 8 + 12 + 12 + 3 * 2 + 20);
  });
  test('Nazwa sali jest przycinana i nigdy pusta', () => {
    assert.equal(hall.rename(base(), '  sala   jakuba  ').hall.name, 'sala jakuba'); assert.equal(hall.rename(base(), '').hall.name, hall.DEFAULT_NAME);
    assert.equal(hall.rename(base(), 'x'.repeat(40)).hall.name.length, 28);
    assert.equal(loot.migrate({ hall: { name: 'MOJA', slots: { 'armor-1': 'brass', zzz: 'x', 'weapon-1': 5 } } }).hall.slots['weapon-1'], undefined);
  });
  test('Salę i trofea da się narysować', () => {
    const c = document.createElement('canvas'); c.width = 720; c.height = 405; const x = c.getContext('2d');
    let p = base(); p = hall.setSlot(p, 'armor-1', 'brass'); p = hall.setSlot(p, 'weapon-2', 'axe'); p = hall.setSlot(p, 'card-1', 'card-zawisza'); p = hall.setSlot(p, 'trophy-2', 'trophy-rex');
    art.drawHall(x, 720, 405, 1, hall.exhibition(p), { name: 'TEST' });
    for (const trophy of hall.trophies) { x.save(); x.translate(100, 100); art.drawTrophy(x, trophy); x.restore(); }
  });
})();
