/* Combat rules. Ported from Codex's Node harness (work/qa-suite.cjs) so they run without Node. */
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const g = window.MuseumGame, t = g._test;
  const hp = s => [s.player.hp, s.foe.hp];
  function hold(name, seconds) { t.input(name, true); t.step(seconds); t.input(name, false); }
  // Drugi Oddech zmienia tylko tempo regeneracji, więc liczby HP i obrażeń w testach są bazowe (120 HP).
  const BASE = 'verdigris';
  function start(options = {}) { g.reset(); return g.start({ sound: false, skin: BASE, ...options }); }
  // Cios T-rexa ląduje po 0,18 s; krok 0,25 s obejmuje go nawet po hitstopie poprzedniego trafienia.
  const STRIKE = .25;

  test('Tryb testowy udostępnia _test, a pętla RAF nie startuje sama', () => {
    assert.ok(g._test, '_test present');
    const s = start(); t.step(0); const before = s.elapsed;
    assert.equal(g.getState().elapsed, before, 'time only moves through _test.step');
  });
  test('Bezczynna walka nie reaguje na ruch, atak ani nie zmienia HP przed startem', () => {
    g.reset(); const before = g.getState();
    t.input('right', true); t.input('attack', true); t.input('guard', true); t.step(20);
    const after = g.getState();
    assert.equal(after.status, 'idle'); assert.equal(after.elapsed, 0);
    assert.equal(after.player.x, before.player.x); assert.deepEqual(hp(after), hp(before));
  });
  test('120 klatek rysowania nie rozpoczyna walki', () => {
    g.reset(); for (let i = 0; i < 120; i++) t.frame(1 / 60);
    assert.equal(g.getState().status, 'idle'); assert.equal(g.getState().elapsed, 0);
  });
  test('Domyślny start: Stara Gwardia 140 HP z mieczem kontra T-rex 160 HP, bez API podmiany postaci', () => {
    g.reset(); const s = g.start({ sound: false });
    assert.ok(s.player && s.foe); assert.equal(s.player.maxHP, 140); assert.equal(s.foe.maxHP, 160); assert.equal(s.skin, 'brass');
    assert.equal(start().player.maxHP, 120, 'bazowy skin testów ma 120 HP');
    assert.equal(s.exhibit.id, 'trex'); assert.equal(s.weapon.id, 'sword');
    assert.equal(g.changeCharacter, undefined); assert.equal(g.selectOpponent, undefined);
  });
  test('Ruch zostaje w granicach areny i nie przekracza odstępu kolizji', () => {
    start(); hold('left', 10); let s = g.getState();
    assert.equal(s.player.x, 145); assert.ok(s.foe.x <= 1290);
    hold('right', 30); s = g.getState();
    assert.ok(s.player.x >= 145 && s.player.x <= 1110); assert.ok(s.foe.x <= 1290);
    assert.ok(s.foe.x - s.player.x >= 179.999);
  });
  test('Pauza zatrzymuje czas, ruch i HP; wznowienie przywraca aktualizacje', () => {
    start(); g.pause(); const before = g.getState();
    hold('right', 4); hold('attack', 4); const after = g.getState();
    assert.equal(after.status, 'paused'); assert.equal(after.elapsed, before.elapsed);
    assert.equal(after.player.x, before.player.x); assert.deepEqual(hp(after), hp(before));
    g.resume(); t.step(.1); assert.equal(g.getState().status, 'running'); assert.ok(g.getState().elapsed > after.elapsed);
  });
  test('Atak z daleka kończy się unikiem T-rexa bez obrażeń', () => {
    start(); hold('attack', .16); const s = g.getState();
    assert.equal(s.foe.hp, 160); assert.equal(s.foe.defenseKind, 'dodge'); assert.ok(s.foe.defense > 0);
  });
  test('T-rex paruje ataki podczas zamachu bez utraty HP', () => {
    start(); t.setState({ foe: { x: 650, state: 'windup', timer: 0 }, player: { x: 365 } });
    hold('attack', .16); const s = g.getState();
    assert.equal(s.foe.hp, 160); assert.equal(s.foe.defenseKind, 'guard');
  });
  test('Zmęczona parada T-rexa w czasie odpoczynku przepuszcza 9 obrażeń miecza', () => {
    start(); t.setState({ foe: { x: 650, state: 'recover', timer: 0 }, player: { x: 365 } });
    hold('attack', .16); const s = g.getState();
    assert.equal(s.foe.defenseKind, 'guard'); assert.equal(s.foe.hp, 151);
  });
  test('Od trzeciego ciosu w serii miecz zadaje 12 obrażeń', () => {
    start(); t.setState({ combo: 2, foe: { x: 650, state: 'recover', timer: 0 }, player: { x: 365 } });
    hold('attack', .16); assert.equal(g.getState().foe.hp, 148);
  });
  test('Niebroniony cios T-rexa wymusza automatyczny unik rycerza', () => {
    start(); t.setState({ foe: { x: 650, state: 'strike', timer: 0, attackDone: false }, player: { x: 365, stamina: 100 } });
    t.step(STRIKE); const s = g.getState();
    assert.equal(s.player.hp, 120); assert.ok(s.player.evade > 0); assert.ok(s.player.stamina < 100);
  });
  test('Świeża garda odbija cios i rani wyłącznie T-rexa (20 HP)', () => {
    start(); t.setState({ elapsed: 2, foe: { x: 650, state: 'strike', timer: 0, attackDone: false }, player: { x: 365, stamina: 100 } });
    t.input('guard', true); t.step(STRIKE); const s = g.getState();
    assert.equal(s.player.hp, 120); assert.equal(s.foe.hp, 140); assert.equal(s.parries, 1);
  });
  test('Perfekcyjna parada ciężkiego ataku odbija 25 HP', () => {
    start(); t.setState({ elapsed: 2, foe: { x: 650, state: 'strike', timer: 0, attackDone: false, heavy: true }, player: { x: 365, stamina: 100 } });
    t.input('guard', true); t.step(STRIKE); assert.equal(g.getState().foe.hp, 135);
  });
  test('Ręczny unik przy niskiej wytrzymałości omija nadchodzący cios', () => {
    start(); t.setState({ foe: { x: 650, state: 'windup', timer: .77, attackDone: false }, player: { x: 365, stamina: 22 } });
    t.input('dodge', true); t.step(.01); t.input('dodge', false);
    t.setState({ foe: { state: 'strike', timer: .06, attackDone: false } }); t.step(.15);
    const s = g.getState(); assert.equal(s.foe.attackDone, true, 'cios padł'); assert.equal(s.player.hp, 120);
  });
  test('Osiem perfekcyjnych parad z rzędu legalnie pokonuje T-rexa', () => {
    start();
    for (let i = 0; i < 8; i++) {
      t.input('guard', false);
      t.setState({ elapsed: 2 + i, foe: { x: 650, state: 'strike', timer: 0, attackDone: false, heavy: false }, player: { x: 365, stamina: 100, attack: 0, evade: 0, hurt: 0 } });
      t.input('guard', true); t.step(.3);
    }
    const s = g.getState();
    assert.equal(s.status, 'won'); assert.equal(s.foe.hp, 0); assert.equal(s.player.hp, 120); assert.equal(s.parries, 8);
  });
  test('Wyczerpana spóźniona parada może zbić rycerza do zera i przegrać', () => {
    start(); t.setState({ elapsed: 2, foe: { x: 650, state: 'strike', timer: 0, attackDone: false }, player: { x: 365, hp: 1, stamina: 0, attack: .3 } });
    t.step(STRIKE); const s = g.getState();
    assert.equal(s.status, 'lost'); assert.equal(s.player.hp, 0); assert.equal(s.foe.hp, 160);
  });
  test('Spóźniona parada kosztuje 16 HP, ciężka 23 HP', () => {
    start(); t.setState({ elapsed: 2, foe: { x: 650, state: 'strike', timer: 0, attackDone: false }, player: { x: 365, hp: 120, stamina: 0, attack: .3 } });
    t.step(STRIKE); assert.equal(g.getState().player.hp, 104);
    start(); t.setState({ elapsed: 2, foe: { x: 650, state: 'strike', timer: 0, attackDone: false, heavy: true }, player: { x: 365, hp: 120, stamina: 0, attack: .3 } });
    t.step(STRIKE); assert.equal(g.getState().player.hp, 97);
  });
  test('Po zwycięstwie walka przestaje reagować i nie ma dalszych obrażeń', () => {
    start(); t.setState({ elapsed: 2, foe: { x: 650, state: 'recover', timer: 0, hp: 1 }, player: { x: 365 } });
    hold('attack', .2); assert.equal(g.getState().status, 'won');
    const before = g.getState(); hold('left', 20); hold('attack', 20); hold('guard', 20); const after = g.getState();
    assert.equal(after.elapsed, before.elapsed); assert.equal(after.player.x, before.player.x); assert.deepEqual(hp(after), hp(before));
  });
  test('Pięć minut bez pokonania T-rexa nie daje zwycięstwa', () => {
    start(); t.setState({ foe: { x: 1290, state: 'recover', timer: -400 }, player: { x: 145 } });
    t.step(300); const s = g.getState();
    assert.equal(s.status, 'running'); assert.equal(s.foe.hp, 160);
  });
  test('Zdarzenie game:end niesie id eksponatu, broni i skina', () => {
    let detail = null; const listener = e => { detail = e.detail; };
    window.addEventListener('game:end', listener);
    start({ skin: 'frost' }); t.setState({ elapsed: 2, foe: { x: 650, state: 'recover', timer: 0, hp: 1 }, player: { x: 365 } }); hold('attack', .2);
    window.removeEventListener('game:end', listener);
    assert.ok(detail, 'event fired'); assert.equal(detail.win, true);
    assert.equal(detail.exhibit, 'trex'); assert.equal(detail.weapon, 'sword'); assert.equal(detail.skin, 'frost');
  });
  test('Perk skina nadal działa: Mroźny Relikt ma dłuższe okno parady', () => {
    const s = start({ skin: 'frost' });
    assert.close(s.perk.stats.perfectParryWindow, .39);
    // Cios pada przy elapsed 2,18; garda postawiona 0,33 s wcześniej: za późno dla bazowych 0,27 s, w sam raz dla 0,39 s.
    t.setState({ elapsed: 2, foe: { x: 650, state: 'strike', timer: 0, attackDone: false }, player: { x: 365, stamina: 100 } });
    t.input('guard', true); t.setState({ player: { guardSince: 2 - .15 } }); t.step(STRIKE);
    assert.equal(g.getState().foe.hp, 140, 'parada 0,33 s przed ciosem jest perfekcyjna dla Mroźnego Reliktu');
    start(); t.setState({ elapsed: 2, foe: { x: 650, state: 'strike', timer: 0, attackDone: false }, player: { x: 365, stamina: 100 } });
    t.input('guard', true); t.setState({ player: { guardSince: 2 - .15 } }); t.step(STRIKE);
    assert.equal(g.getState().foe.hp, 160, 'ta sama parada bez perka to zwykły blok');
  });
  test('Nieznany eksponat lub broń wraca do domyślnych', () => {
    const s = start({ exhibit: 'nie-ma', weapon: 'nie-ma' });
    assert.equal(s.exhibit.id, 'trex'); assert.equal(s.weapon.id, 'sword');
  });
})();
