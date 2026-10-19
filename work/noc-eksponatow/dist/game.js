/* Noc Eksponatów — two-fighter canvas combat. No external runtime. */
(() => {
  'use strict';
  const W = 1440, H = 810, FLOOR = 665;
  // Anchors account for the full fossil skull/tail, not just its hind legs.
  const LEFT = 145, RIGHT = 1140, GAP = 330;
  const COMBAT = Object.freeze({ minGap: GAP, preferredGap: 365, engageRange: 400,
    playerRange: 410, rexRange: 395, approachSpeed: 82, retreatSpeed: 114,
    windup: 1.1, heavyWindup: 1.4, strikeDuration: .42, strikeContact: .18,
    recovery: 1.8, heavyRecovery: 2.1, left: LEFT, right: RIGHT });
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const input = { left: false, right: false, attack: false, guard: false, dodge: false };
  let canvas, ctx, ratio = 1, last = 0, frame = 0, soundEnabled = true, audio, scene = 'arena', visualTime = 0;
  let state = fresh();
  const particles = [], labels = [], rings = [];
  let shake = 0, flash = 0, hitstop = 0, eventClock = 0, lastHint = '';

  function fresh(skin = 'brass') {
    const perk = window.MuseumPerks.get(skin), stats = perk.stats;
    return {
      status: 'idle', elapsed: 0, combo: 0, parries: 0, damage: 0, skin: perk.id, perk,
      hint: 'Zbliż się do T-Rexa. Obserwuj jego ruchy.', hintUntil: 0,
      player: { x: 365, hp: stats.maxHP, maxHP: stats.maxHP, stamina: stats.maxStamina, maxStamina: stats.maxStamina, facing: 1, attack: 0, attackDone: false,
        cooldown: 0, guardSince: -99, guarding: false, hurt: 0, evade: 0, defense: 0, step: 0, lastDamage: -99 },
      rex: { x: 1060, hp: 160, maxHP: 160, state: 'idle', timer: 0, cycle: 0, attackTargetX: null,
        heavy: false, hurt: 0, defense: 0, defenseKind: 'guard', attackDone: false, walk: false }
    };
  }

  function emit(name, detail) {
    if (typeof window.dispatchEvent === 'function') window.dispatchEvent(new CustomEvent(name, { detail }));
  }
  function snapshot() {
    return {
      status: state.status, elapsed: state.elapsed, time: state.elapsed,
      playerHP: state.player.hp, rexHP: state.rex.hp, stamina: state.player.stamina,
      parries: state.parries, combo: state.combo, hint: state.hint, rexState: state.rex.state,
      player: { ...state.player }, rex: { ...state.rex }, skin: state.skin, perk: state.perk, scene, combat: { ...COMBAT }
    };
  }
  function updateEvent(force = false) {
    if (force || eventClock <= 0) {
      eventClock = .055;
      emit('game:update', snapshot());
    }
  }
  function hint(text, seconds = 2) {
    state.hint = text;
    state.hintUntil = state.elapsed + seconds;
    if (text !== lastHint) { lastHint = text; updateEvent(true); }
  }

  function audioReady() {
    if (!soundEnabled) return;
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
    } catch (_) { /* Audio is optional. */ }
  }
  function tone(kind) {
    if (!soundEnabled || !audio) return;
    try {
      const t = audio.currentTime;
      const sounds = {
        hit: [100, 48, .14, 'sawtooth', .075], parry: [550, 1150, .19, 'triangle', .085],
        swing: [190, 75, .09, 'sawtooth', .035], dodge: [280, 540, .07, 'sine', .035],
        warning: [75, 61, .26, 'sawtooth', .055], hurt: [125, 35, .17, 'square', .045],
        win: [440, 880, .65, 'triangle', .08], loss: [140, 40, .8, 'sawtooth', .06]
      };
      const [from, to, duration, type, volume] = sounds[kind] || sounds.hit;
      const oscillator = audio.createOscillator(), gain = audio.createGain();
      oscillator.type = type; oscillator.frequency.setValueAtTime(from, t);
      oscillator.frequency.exponentialRampToValueAtTime(to, t + duration);
      gain.gain.setValueAtTime(.001, t); gain.gain.exponentialRampToValueAtTime(volume, t + .008);
      gain.gain.exponentialRampToValueAtTime(.001, t + duration);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(t); oscillator.stop(t + duration + .01);
    } catch (_) { /* Do not interrupt combat for audio. */ }
  }

  function burst(x, y, color, count = 16, power = 1) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2, speed = (70 + Math.random() * 310) * power;
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 80,
        life: .3 + Math.random() * .35, max: .65, color, size: 2 + Math.random() * 4 });
    }
  }
  function label(text, x, y, color = '#f3deaf', size = 24) {
    labels.push({ text, x, y, color, size, life: 1.1, max: 1.1 });
  }
  function impact(x, y, color, power = 1) {
    shake = Math.max(shake, 7 * power); hitstop = .055 * power;
    flash = Math.max(flash, .10 * power);
    burst(x, y, color, 20, power);
    rings.push({ x, y, life: .3, max: .3, color });
  }
  function damagePlayer(amount) {
    const p = state.player;
    amount = Math.ceil(amount * state.perk.stats.incomingDamageMultiplier);
    p.hp = Math.max(0, p.hp - amount); p.hurt = .33; p.lastDamage = state.elapsed;
    state.combo = 0;
    label('−' + amount, p.x, FLOOR - 250, '#ff9d8e', 31);
    impact(p.x + 45, FLOOR - 130, '#ff8565'); tone('hurt');
  }
  function damageRex(amount, perfect = false) {
    const r = state.rex;
    r.hp = Math.max(0, r.hp - amount); r.hurt = .3; state.damage += amount;
    label('−' + amount, r.x - 35, FLOOR - 315, perfect ? '#a9fff0' : '#fff0c7', perfect ? 37 : 30);
    impact(r.x - 100, FLOOR - 155, perfect ? '#9affdf' : '#f8cf88', perfect ? 1.1 : .8);
    tone(perfect ? 'parry' : 'hit');
  }
  function finish(win) {
    if (state.status !== 'running') return;
    state.status = win ? 'won' : 'lost';
    for (const key in input) input[key] = false;
    hint(win ? 'T-REX POKONANY' : 'KONIEC SNU', 99);
    tone(win ? 'win' : 'loss'); updateEvent(true);
    emit('game:end', { win, parries: state.parries, time: state.elapsed, combo: state.combo,
      coins: win ? 180 + state.parries * 20 : 40, playerHP: state.player.hp, rexHP: state.rex.hp });
  }
  function checkEnd() {
    if (state.rex.hp <= 0) finish(true);
    else if (state.player.hp <= 0) finish(false);
  }

  function attack() {
    const p = state.player;
    if (state.status !== 'running' || p.cooldown > 0 || p.attack > 0 || p.hurt > .13 || p.evade > 0) return;
    if (p.stamina < 12) { hint('Złap oddech — wytrzymałość wraca, gdy nie atakujesz.'); return; }
    p.stamina -= 12; p.attack = .36; p.attackDone = false; p.cooldown = .46;
    tone('swing');
  }

  // Every blow provokes a dodge or a parry. A tired guard still lets damage through.
  function playerHit() {
    if (state.status !== 'running' || state.player.hp <= 0 || state.rex.hp <= 0) return;
    const p = state.player, r = state.rex, distance = r.x - p.x;
    r.defense = .35;
    if (distance > COMBAT.playerRange) {
      r.defenseKind = 'dodge'; tone('dodge');
      hint('Podejdź bliżej. T-Rex jest poza zasięgiem.');
      label('UNIK', r.x - 60, FLOOR - 285, '#adb6b9', 20);
    } else if (r.state === 'recover') {
      r.defenseKind = 'guard';
      state.combo++;
      const amount = Math.ceil((9 + (state.combo >= 3 ? 3 : 0)) * state.perk.stats.weakGuardDamageMultiplier);
      damageRex(amount);
      label('SŁABA GARDA', r.x - 80, FLOOR - 255, '#edc37d', 19);
      hint('Słaba garda! Atakuj, dopóki T-Rex odzyskuje siły.', 1.5);
    } else if (r.state === 'windup' || r.state === 'strike') {
      r.defenseKind = 'guard';
      burst(r.x - 135, FLOOR - 155, '#eac584', 14, .7); tone('parry');
      label('PAROWANIE', r.x - 65, FLOOR - 285, '#efc27c', 20);
      p.stamina = Math.max(0, p.stamina - 10);
      hint('Twarda garda! Poczekaj na jego atak, potem odpowiedz.');
    } else {
      r.defenseKind = 'dodge'; tone('dodge');
      label('UNIK', r.x - 70, FLOOR - 285, '#adb6b9', 20);
      hint('T-Rex unika. Sprowokuj go i uderz po jego ataku.');
    }
    checkEnd();
  }

  function rexHit() {
    if (state.status !== 'running' || state.player.hp <= 0 || state.rex.hp <= 0) return;
    const p = state.player, r = state.rex;
    const stats = state.perk.stats;
    // A strike is committed when the tell begins; it cannot home in on a retreating knight.
    const target = r.attackTargetX ?? p.x;
    const inRange = r.x - p.x <= COMBAT.rexRange && Math.abs(p.x - target) <= 110;
    const cost = (r.heavy ? 23 : 18) * stats.defenseCostMultiplier;
    const parryCost = 8 * stats.defenseCostMultiplier;
    p.defense = .34;
    if (!inRange || p.evade > 0) {
      p.evade = Math.max(p.evade, .34);
      label('UNIK', p.x, FLOOR - 265, '#9bd9d1', 22); tone('dodge');
      hint('Dobry dystans. Teraz podejdź i przełam jego gardę.', 1.7);
    } else if (p.guarding && state.elapsed - p.guardSince <= stats.perfectParryWindow && p.stamina >= parryCost) {
      p.stamina = Math.max(0, p.stamina - parryCost); p.defense = .48;
      state.parries++; state.combo++;
      damageRex(r.heavy ? 25 : 20, true);
      const healing = Math.min(stats.perfectParryHeal, p.maxHP - p.hp);
      if (healing > 0) {
        p.hp += healing;
        label('+' + healing + ' HP', p.x - 35, FLOOR - 350, '#ffe4a1', 25);
        burst(p.x, FLOOR - 175, '#ffe4a1', 12, .6);
      }
      label('PERFEKCYJNE PAROWANIE', p.x + 130, FLOOR - 305, '#a8fff0', 25);
      hint('Perfekcyjne parowanie! Odbity atak rani T-Rexa.', 2.1);
    } else if (p.guarding) {
      tone('parry'); burst(p.x + 65, FLOOR - 130, '#b8daef', 16, .7);
      if (p.stamina >= cost) {
        p.stamina -= cost;
        label('BLOK', p.x, FLOOR - 260, '#bed8e2', 22);
        hint('Blok! Naciśnij gardę tuż przed ciosem, żeby go odbić.', 1.8);
      } else {
        p.stamina = 0; damagePlayer(r.heavy ? 19 : 14);
        label('OSŁABIONA GARDA', p.x + 50, FLOOR - 300, '#ff9d8e', 21);
        hint('Brakuje wytrzymałości. Odstąp i pozwól jej wrócić.', 2);
      }
    } else if (p.stamina >= cost && p.attack <= 0) {
      p.stamina -= cost; p.evade = .42;
      label('UNIK', p.x, FLOOR - 265, '#9bd9d1', 22); tone('dodge');
      hint('Automatyczny unik. Atakuj teraz — garda T-Rexa jest słaba!', 1.8);
    } else {
      // Exhaustion and overcommitting produce an imperfect parry, never an undefended blow.
      p.stamina = Math.max(0, p.stamina - parryCost);
      damagePlayer(r.heavy ? 23 : 16);
      label('SPÓŹNIONE PAROWANIE', p.x + 50, FLOOR - 300, '#ff9d8e', 21);
      hint('Spóźnione parowanie! Oszczędzaj siły na obronę.', 2);
    }
    checkEnd();
  }

  function startWindup() {
    const r = state.rex;
    r.state = 'windup'; r.timer = 0; r.cycle++; r.heavy = r.cycle % 3 === 0; r.attackDone = false;
    r.attackTargetX = state.player.x;
    tone('warning');
    hint(r.heavy ? 'CIĘŻKI ATAK — zaczekaj na błysk, potem postaw gardę!' : 'T-Rex szykuje cios. Cofnij się lub postaw gardę przy błysku!', 2);
  }

  function step(dt) {
    dt = Math.max(0, Math.min(dt, .05));
    visualTime += dt;
    const cosmeticDt = dt;
    particles.forEach(p => { p.life -= cosmeticDt; p.x += p.vx * cosmeticDt; p.y += p.vy * cosmeticDt; p.vy += 550 * cosmeticDt; });
    labels.forEach(l => { l.life -= cosmeticDt; l.y -= 29 * cosmeticDt; });
    rings.forEach(r => { r.life -= cosmeticDt; });
    for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);
    for (let i = labels.length - 1; i >= 0; i--) if (labels[i].life <= 0) labels.splice(i, 1);
    for (let i = rings.length - 1; i >= 0; i--) if (rings[i].life <= 0) rings.splice(i, 1);
    shake = Math.max(0, shake - dt * 31); flash = Math.max(0, flash - dt);
    if (state.status !== 'running') return;
    if (hitstop > 0) { hitstop -= dt; return; }
    state.elapsed += dt; eventClock -= dt;
    const p = state.player, r = state.rex;
    p.cooldown = Math.max(0, p.cooldown - dt); p.hurt = Math.max(0, p.hurt - dt);
    p.evade = Math.max(0, p.evade - dt); p.defense = Math.max(0, p.defense - dt);
    r.hurt = Math.max(0, r.hurt - dt); r.defense = Math.max(0, r.defense - dt);
    p.guarding = input.guard && p.attack <= 0 && p.evade <= 0;
    if (input.attack && !p.guarding) attack();
    const dodgeCost = 20 * state.perk.stats.defenseCostMultiplier;
    if (input.dodge && p.evade <= 0 && p.cooldown <= 0 && p.stamina >= dodgeCost) {
      p.stamina -= dodgeCost; p.evade = .4; p.cooldown = .52;
      p.x = clamp(p.x - 70, LEFT, r.x - GAP); tone('dodge');
    }
    const direction = Number(input.right) - Number(input.left);
    if (direction && p.attack <= 0 && p.hurt <= .12) {
      p.x += direction * (p.guarding ? 96 : 265) * dt;
      p.step += dt * (p.guarding ? .6 : 1);
    }
    p.x = clamp(p.x, LEFT, Math.min(RIGHT - GAP, r.x - GAP));
    const recovering = p.attack <= 0 && p.evade <= 0;
    p.stamina = clamp(p.stamina + dt * (recovering ? (p.guarding ? 7 : 19) : 2) * state.perk.stats.staminaRegenMultiplier, 0, p.maxStamina);
    if (p.attack > 0) {
      const before = p.attack; p.attack = Math.max(0, p.attack - dt);
      if (!p.attackDone && before > .23 && p.attack <= .23) { p.attackDone = true; playerHit(); }
    }
    if (state.status !== 'running') return;
    r.timer += dt; r.walk = false;
    const distance = r.x - p.x;
    const setRexState = next => { r.state = next; r.timer = 0; };
    const moveRex = target => {
      const amount = clamp(target - r.x, -COMBAT.approachSpeed * dt, COMBAT.retreatSpeed * dt);
      const next = clamp(r.x + amount, p.x + GAP, RIGHT);
      r.walk = Math.abs(next - r.x) > .01; r.x = next;
    };
    if (r.state === 'idle') {
      // Give the player breathing room before choosing the next attack.
      if (distance < GAP + 22 && r.x < RIGHT - 1) setRexState('retreat');
      else if (r.timer >= .75) {
        if (distance <= COMBAT.engageRange) startWindup();
        else setRexState('approach');
      }
    } else if (r.state === 'approach') {
      if (distance < GAP + 22) setRexState('retreat');
      else if (distance > COMBAT.preferredGap + 2) moveRex(p.x + COMBAT.preferredGap);
      else setRexState('idle');
    } else if (r.state === 'retreat') {
      moveRex(p.x + COMBAT.preferredGap);
      // A corner never traps the AI in an endless retreat/chase loop.
      if (r.timer >= .65 || distance >= COMBAT.preferredGap - 2 || r.x >= RIGHT - 1) {
        setRexState('idle');
      }
    } else if (r.state === 'windup') {
      // No positional tracking during the telegraph or the actual strike.
      const duration = r.heavy ? COMBAT.heavyWindup : COMBAT.windup;
      if (r.timer >= duration) { setRexState('strike'); r.attackDone = false; }
    } else if (r.state === 'strike') {
      if (!r.attackDone && r.timer >= COMBAT.strikeContact) { r.attackDone = true; rexHit(); }
      if (r.timer >= COMBAT.strikeDuration && state.status === 'running') {
        setRexState('recover');
        hint('TERAZ! T-Rex odpoczywa — podejdź i przełam słabą gardę.', 1.8);
      }
    } else if (r.state === 'recover') {
      if (r.timer >= (r.heavy ? COMBAT.heavyRecovery : COMBAT.recovery)) {
        setRexState('reposition');
        hint('Złap oddech. T-Rex ustawia się do kolejnego pojedynku.', 1.7);
      }
    } else if (r.state === 'reposition') {
      // A short reset separates attacks. Never pursue during this safe interval.
      if (distance < 385 && r.x < RIGHT - 1) moveRex(p.x + 385);
      if (r.timer >= 1.05) setRexState('idle');
    }
    r.x = clamp(r.x, p.x + GAP, RIGHT);
    if (state.elapsed > state.hintUntil && state.hint !== 'J / SPACJA — atak  ·  K / SHIFT — garda  ·  A D — ruch') {
      state.hint = 'J / SPACJA — atak  ·  K / SHIFT — garda  ·  A D — ruch';
    }
    updateEvent();
  }

  function ensureCanvas() {
    if (canvas) return true;
    canvas = document.getElementById('arena');
    if (!canvas) return false;
    ctx = canvas.getContext('2d');
    ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * ratio; canvas.height = H * ratio;
    return !!ctx;
  }
  function fallbackArena() {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, '#101b20'); gradient.addColorStop(1, '#27363b');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#324045'; ctx.fillRect(0, FLOOR, W, H - FLOOR);
    for (let x = 110; x < W; x += 240) {
      ctx.fillStyle = '#384744'; ctx.fillRect(x, 90, 35, FLOOR - 90);
      ctx.fillStyle = '#c9ad7222'; ctx.fillRect(x - 50, 90, 135, 5);
    }
  }
  function fallbackFighter(x, pose, rex = false) {
    ctx.save(); ctx.translate(x, FLOOR);
    ctx.fillStyle = rex ? '#a69a70' : '#bdc6cc';
    if (rex) { ctx.fillRect(-85, -220, 145, 145); ctx.fillRect(-155, -295, 120, 85); ctx.fillRect(-40, -80, 35, 80); ctx.fillRect(35, -80, 35, 80); }
    else { ctx.fillRect(-38, -175, 76, 110); ctx.fillRect(-28, -242, 56, 60); ctx.fillRect(-29, -65, 22, 65); ctx.fillRect(9, -65, 22, 65); ctx.fillRect(40, -170, 12, 140); }
    ctx.restore();
  }
  function shadow(x, width) {
    ctx.save(); ctx.translate(x, FLOOR + 9); ctx.scale(width, 15);
    const g = ctx.createRadialGradient(0, 0, .1, 0, 0, 1);
    g.addColorStop(0, '#0008'); g.addColorStop(1, '#0000'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function drawTelegraph() {
    const r = state.rex;
    if (state.status !== 'running') return;
    if (r.state === 'windup') {
      const fraction = clamp(r.timer / (r.heavy ? COMBAT.heavyWindup : COMBAT.windup), 0, 1);
      const x = r.x - 70, y = FLOOR - 345;
      ctx.save();
      ctx.strokeStyle = '#a9463970'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = fraction > .94 ? '#fff1b6' : '#e7a360'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(x, y, 30, -Math.PI / 2, -Math.PI / 2 + fraction * Math.PI * 2); ctx.stroke();
      ctx.fillStyle = fraction > .94 ? '#fff1b6' : '#f0a579';
      ctx.font = '700 28px system-ui'; ctx.textAlign = 'center'; ctx.fillText('!', x, y + 10);
      if (fraction > .7) {
        ctx.globalAlpha = .07 + (fraction - .7) * .16; ctx.fillStyle = '#ffc47a';
        ctx.beginPath(); ctx.ellipse(r.x - 150, FLOOR + 6, 240, 30, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    } else if (r.state === 'recover') {
      ctx.save(); ctx.globalAlpha = .6 + Math.sin(state.elapsed * 8) * .15;
      ctx.textAlign = 'center'; ctx.font = '600 17px system-ui'; ctx.fillStyle = '#b6e3c6';
      ctx.fillText('SŁABA GARDA', r.x - 25, FLOOR - 350); ctx.restore();
    }
  }
  function drawGuard(x, perfect) {
    ctx.save(); ctx.translate(x + 45, FLOOR - 126);
    ctx.strokeStyle = perfect ? '#c8fff0' : '#b6dcf0'; ctx.lineWidth = perfect ? 5 : 3;
    ctx.globalAlpha = perfect ? .9 : .45;
    ctx.beginPath(); ctx.ellipse(0, 0, 45, 94, -.1, -1.35, 1.35); ctx.stroke();
    ctx.restore();
  }
  function draw() {
    if (scene === 'external' && state.status !== 'running') return;
    if (!ensureCanvas()) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (shake && state.status === 'running') ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);
    const art = window.MuseumArt;
    if (scene === 'guard' && state.status !== 'running' && art?.drawGuardScene) {
      art.drawGuardScene(ctx, W, H, visualTime); ctx.restore(); return;
    }
    const artTime = state.status === 'idle' ? visualTime : state.elapsed;
    if (art?.drawArena) art.drawArena(ctx, W, H, artTime); else fallbackArena();
    const p = state.player, r = state.rex;
    shadow(p.x, 94); shadow(r.x, 170);
    drawTelegraph();
    let rexPose = r.walk ? 'walk' : 'idle', rexProgress = r.timer;
    if (r.state === 'windup') { rexPose = 'guard'; rexProgress = r.timer / (r.heavy ? COMBAT.heavyWindup : COMBAT.windup); }
    if (r.state === 'strike') { rexPose = 'attack'; rexProgress = r.timer / COMBAT.strikeDuration; }
    if (r.state === 'recover') { rexPose = 'hurt'; rexProgress = r.timer / (r.heavy ? COMBAT.heavyRecovery : COMBAT.recovery); }
    if (r.defense > 0) { rexPose = r.defenseKind; rexProgress = 1 - r.defense / .35; }
    if (r.hurt > 0) { rexPose = 'hurt'; rexProgress = 1 - r.hurt / .3; }
    if (r.hp <= 0) { rexPose = 'dead'; rexProgress = 1; }
    let playerPose = (input.left || input.right) && state.status === 'running' ? 'walk' : 'idle';
    let playerProgress = p.step;
    if (p.guarding) playerPose = 'guard';
    if (p.attack > 0) { playerPose = 'attack'; playerProgress = 1 - p.attack / .36; }
    if (p.evade > 0) { playerPose = 'dodge'; playerProgress = 1 - p.evade / .42; }
    if (p.hurt > 0) { playerPose = 'hurt'; playerProgress = 1 - p.hurt / .33; }
    if (p.hp <= 0) { playerPose = 'dead'; playerProgress = 1; }
    const pEvadeX = p.evade > 0 ? Math.max(LEFT - p.x, -Math.sin(clamp(playerProgress, 0, 1) * Math.PI) * 55) : 0;
    const rEvadeX = rexPose === 'dodge' ? Math.min(RIGHT - r.x - 29, Math.sin(clamp(rexProgress, 0, 1) * Math.PI) * 48) : 0;
    const drawR = () => art?.drawRex ? art.drawRex(ctx, r.x + rEvadeX, FLOOR, { facing: -1, pose: rexPose,
      progress: clamp(rexProgress, 0, 1), phase: clamp(rexProgress, 0, 1), time: artTime, heavy: r.heavy, glow: r.hurt > 0 }) : fallbackFighter(r.x, rexPose, true);
    const drawP = () => art?.drawKnight ? art.drawKnight(ctx, p.x + pEvadeX, FLOOR, { facing: 1, pose: playerPose,
      progress: clamp(playerProgress, 0, 1), phase: clamp(playerProgress, 0, 1), time: artTime, skin: state.skin, glow: p.hurt > 0 }) : fallbackFighter(p.x, playerPose);
    drawR(); drawP();
    if (p.guarding || p.defense > 0 && p.evade <= 0) drawGuard(p.x, state.elapsed - p.guardSince < state.perk.stats.perfectParryWindow);
    if (p.attack > .1 && p.attack < .3) {
      ctx.save(); ctx.strokeStyle = '#ffe4a1'; ctx.lineWidth = 5; ctx.globalAlpha = Math.sin((.3 - p.attack) / .2 * Math.PI) * .7;
      ctx.beginPath(); ctx.ellipse(p.x + 75, FLOOR - 150, 95, 110, -.2, -.9, 1.1); ctx.stroke(); ctx.restore();
    }
    particles.forEach(particle => {
      ctx.globalAlpha = clamp(particle.life / particle.max, 0, 1); ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size * .55);
    }); ctx.globalAlpha = 1;
    rings.forEach(ring => {
      const fraction = 1 - ring.life / ring.max;
      ctx.globalAlpha = 1 - fraction; ctx.strokeStyle = ring.color; ctx.lineWidth = 3 * (1 - fraction);
      ctx.beginPath(); ctx.arc(ring.x, ring.y, 15 + fraction * 70, 0, Math.PI * 2); ctx.stroke();
    }); ctx.globalAlpha = 1;
    labels.forEach(l => {
      ctx.save(); ctx.globalAlpha = clamp(l.life / .25, 0, 1); ctx.textAlign = 'center';
      ctx.font = `800 ${l.size}px system-ui, sans-serif`; ctx.shadowColor = '#07131a'; ctx.shadowBlur = 12;
      ctx.fillStyle = l.color; ctx.fillText(l.text, clamp(l.x, 185, W - 185), l.y); ctx.restore();
    });
    if (flash > 0) { ctx.fillStyle = `rgba(250,225,181,${flash * .35})`; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
    if (state.status === 'paused') {
      ctx.fillStyle = '#061018b8'; ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center'; ctx.fillStyle = '#f3e2bd'; ctx.font = '600 48px Georgia'; ctx.fillText('PAUZA', W / 2, H / 2);
    }
  }
  function loop(now) {
    const dt = last ? Math.min(.05, (now - last) / 1000) : 1 / 60; last = now;
    step(dt); draw(); frame = requestAnimationFrame(loop);
  }
  function setInput(name, down) {
    if (!(name in input)) return;
    if (state.status !== 'running') { input[name] = false; return; }
    if (down) audioReady();
    if (name === 'guard' && down && !input.guard) state.player.guardSince = state.elapsed;
    input[name] = down;
    if (name === 'attack' && down) attack();
  }
  const keyMap = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    KeyJ: 'attack', Space: 'attack', KeyK: 'guard', ShiftLeft: 'guard', ShiftRight: 'guard', KeyL: 'dodge' };
  document.addEventListener('keydown', event => {
    if (state.status !== 'running' || event.target?.matches?.('input, textarea, select')) return;
    const name = keyMap[event.code];
    if (name) { event.preventDefault(); if (!event.repeat) setInput(name, true); }
  });
  document.addEventListener('keyup', event => {
    const name = keyMap[event.code]; if (name) { if (state.status === 'running') event.preventDefault(); setInput(name, false); }
  });
  const pointers = new Map();
  document.addEventListener('pointerdown', event => {
    const button = event.target?.closest?.('[data-control]');
    if (!button || state.status !== 'running') return;
    event.preventDefault(); const name = button.dataset.control;
    pointers.set(event.pointerId, name); setInput(name, true); button.classList.add('pressed');
    try { button.setPointerCapture(event.pointerId); } catch (_) {}
  });
  function releasePointer(event) {
    const name = pointers.get(event.pointerId); if (!name) return;
    pointers.delete(event.pointerId); setInput(name, false);
    document.querySelectorAll(`[data-control="${name}"]`).forEach(el => el.classList.remove('pressed'));
  }
  document.addEventListener('pointerup', releasePointer); document.addEventListener('pointercancel', releasePointer);
  window.addEventListener('blur', () => { for (const key in input) input[key] = false; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) for (const key in input) input[key] = false; });

  window.MuseumGame = {
    start(options = {}) {
      state = fresh(options.skin); scene = 'arena'; state.status = 'running';
      if (typeof options.sound === 'boolean') soundEnabled = options.sound;
      for (const key in input) input[key] = false;
      particles.length = labels.length = rings.length = 0; shake = flash = hitstop = 0; lastHint = ''; eventClock = 0;
      audioReady(); hint('Zbliż się. Odbij cios gardą lub zaatakuj po uniku.', 4); updateEvent(true); draw();
      return snapshot();
    },
    pause() { if (state.status === 'running') { state.status = 'paused'; for (const key in input) input[key] = false; updateEvent(true); draw(); } },
    resume() { if (state.status === 'paused') { state.status = 'running'; last = 0; audioReady(); updateEvent(true); } },
    reset() { state = fresh(); scene = 'arena'; for (const key in input) input[key] = false; particles.length = labels.length = rings.length = 0; updateEvent(true); draw(); },
    setScene(name) { if (name === 'arena' || name === 'guard' || name === 'external') { scene = name; draw(); } },
    setSound(enabled) { soundEnabled = !!enabled; if (soundEnabled) audioReady(); },
    getState: snapshot
  };
  if (window.__MUSEUM_TEST__) window.MuseumGame._test = {
    step(seconds) { for (let elapsed = 0; elapsed < seconds - 1e-8; elapsed += .01) step(Math.min(.01, seconds - elapsed)); return snapshot(); },
    input: setInput,
    setState(patch) { for (const key in patch) { if (key === 'player' || key === 'rex') Object.assign(state[key], patch[key]); else state[key] = patch[key]; } return snapshot(); },
    playerHit, rexHit
  };
  if (typeof requestAnimationFrame === 'function') frame = requestAnimationFrame(loop);
})();
