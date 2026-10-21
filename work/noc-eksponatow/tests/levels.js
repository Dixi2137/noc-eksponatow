/* Levels, exhibits and weapons as data: every entry must be complete and reachable from the game. */
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const levels = window.MuseumLevels, exhibits = window.MuseumExhibits, art = window.MuseumArt, g = window.MuseumGame, t = g._test;

  test('Każdy poziom wskazuje istniejący eksponat, motyw scenerii i rosnący rok', () => {
    let lastYear = -Infinity;
    for (const level of levels.all()) {
      assert.equal(exhibits.get(level.exhibit).id, level.exhibit, `eksponat ${level.exhibit}`);
      assert.ok(art.themes[level.theme], `motyw ${level.theme}`);
      assert.ok(level.year > lastYear, `rok rośnie: ${level.id}`); lastYear = level.year;
      assert.ok(level.reward > 0 && level.card && level.tagline && level.hall && level.yearLabel, `pola poziomu ${level.id}`);
    }
    assert.equal(levels.first().number, 1); assert.equal(levels.count, levels.all().length);
    assert.equal(levels.next(levels.all().at(-1).id), null, 'ostatni poziom nie ma następnego');
    assert.equal(levels.next(levels.first().id).number, 2);
  });
  test('Pierwszy poziom ma trzyczęściowy prolog, pozostałe tylko kartę sali', () => {
    assert.equal(levels.first().prologue.length, 3);
    for (const level of levels.all().slice(1)) assert.equal(level.prologue.length, 0, level.id);
  });
  test('Każdy eksponat ma komplet liczb, klucz rysowania i kostium tam, gdzie trzeba', () => {
    for (const ex of exhibits.all()) {
      const s = ex.stats;
      assert.ok(s.hp > 0 && s.shadow > 0, ex.id);
      assert.ok(art.fighters[s.art], `rysowanie ${s.art} dla ${ex.id}`);
      if (s.art === 'figure') assert.ok(s.figure && s.figure.weapon, `kostium ${ex.id}`);
      for (const key of ['minGap', 'preferredGap', 'engageRange', 'range', 'windup', 'heavyWindup', 'strikeDuration', 'strikeContact', 'recovery', 'heavyRecovery', 'heavyEvery'])
        assert.ok(s.combat[key] > 0, `${ex.id}.combat.${key}`);
      assert.ok(s.combat.strikeContact < s.combat.strikeDuration, `${ex.id}: kontakt przed końcem ciosu`);
      assert.ok(s.combat.minGap < s.combat.preferredGap && s.combat.engageRange >= s.combat.preferredGap, `${ex.id}: dystanse`);
      for (const key of ['light', 'heavy', 'lightBlocked', 'heavyBlocked', 'blockCostLight', 'blockCostHeavy']) assert.ok(s.damage[key] > 0, `${ex.id}.damage.${key}`);
      assert.ok(s.damage.heavy > s.damage.light, `${ex.id}: ciężki cios boli bardziej`);
      assert.ok(ex.alias && ex.name && ex.tag, `${ex.id}: nazwy`);
    }
  });
  test('Każdy eksponat da się narysować w każdej pozie bez wyjątku', () => {
    const c = document.createElement('canvas'); c.width = 400; c.height = 400; const x = c.getContext('2d');
    for (const ex of exhibits.all()) for (const pose of ['idle', 'walk', 'guard', 'attack', 'dodge', 'hurt', 'dead'])
      art.drawExhibit(x, ex, 200, 380, { pose, facing: -1, time: 1, progress: .5 });
    for (const theme of Object.keys(art.themes)) art.drawArena(x, 400, 225, 1, theme);
  });
  test('Walka z każdym eksponatem startuje z jego HP i kończy się po zbiciu go do zera', () => {
    for (const ex of exhibits.all()) {
      g.reset(); const s = g.start({ sound: false, skin: 'verdigris', exhibit: ex.id });
      assert.equal(s.exhibit.id, ex.id); assert.equal(s.foe.maxHP, ex.stats.hp); assert.equal(s.foeHP, ex.stats.hp);
      t.setState({ elapsed: 2, foe: { x: 365 + ex.stats.combat.minGap + 10, state: 'recover', timer: 0, hp: 1 }, player: { x: 365 } });
      t.input('attack', true); t.step(.3); t.input('attack', false);
      assert.equal(g.getState().status, 'won', `${ex.id}: wygrana po ostatnim ciosie`);
    }
  });
  test('Każdy eksponat potrafi zadać rycerzowi obrażenia swoim lekkim ciosem', () => {
    for (const ex of exhibits.all()) {
      g.reset(); g.start({ sound: false, skin: 'verdigris', exhibit: ex.id });
      t.setState({ elapsed: 2, foe: { x: 365 + ex.stats.combat.minGap + 10, state: 'strike', timer: 0, attackDone: false, heavy: false }, player: { x: 365, hp: 120, stamina: 0, attack: .3 } });
      t.step(ex.stats.combat.strikeContact + .1);
      assert.equal(g.getState().player.hp, 120 - ex.stats.damage.light, `${ex.id}: spóźniona parada`);
    }
  });
  test('Motyw scenerii trafia do stanu walki', () => {
    g.reset(); const s = g.start({ sound: false, exhibit: 'leonidas', theme: 'sparta' });
    assert.equal(s.theme, 'sparta'); assert.equal(g.getState().exhibit.name, 'LEONIDAS I');
  });
})();
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const exhibits = window.MuseumExhibits, g = window.MuseumGame, t = g._test, pix = window.MuseumPixel;
  test('Belzebub: finał w piekle, 380 HP, ciężki cios co drugi, rogi i ogień w scenerii', () => {
    const b = exhibits.get('beelzebub'); assert.equal(b.name, 'BELZEBUB'); assert.equal(b.stats.hp, 380); assert.equal(b.stats.combat.heavyEvery, 2); assert.equal(b.stats.figure.hat, 'horns');
    const s = g.start({ skin: 'brass', exhibit: 'beelzebub', weapon: 'sword', theme: 'hell', twist: 'second-wind', specials: true }); assert.equal(s.foe.maxHP, 380); assert.equal(s.special, 'double'); assert.equal(s.twist.id, 'second-wind');
    const c = document.createElement('canvas'); c.width = 288; c.height = 162; const x = c.getContext('2d');
    pix.drawArena(x, 1, 'hell'); pix.drawFigure(x, 200, 133, { pose: 'attack', progress: .5, figure: b.stats.figure, facing: -1 });
    const d = x.getImageData(0, 118, 288, 12).data; let fire = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 220 && d[i + 1] > 100 && d[i + 2] < 120) fire++; assert.ok(fire > 40, `płomienie: ${fire}`);
    assert.ok(window.MuseumArt.themes.hell && window.MuseumHall.trophies.some(tr => tr.level === 'hell'));
  });
})();
