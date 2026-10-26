/* True pixel art renderer. Everything here is drawn in a 288 x 162 pixel space (factor 5 of the 1440 x 810 arena):
   tiles from Kenney's Tiny Dungeon (CC0) for the room, hand-placed pixels for the fighters. */
(() => {
  'use strict';
  const PX = 5, W = 288, H = 162, FLOOR = 133;              // logical 665 / 5
  const sheet = new Image(); sheet.decoding = 'async';
  sheet.src = 'data:image/png;base64,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';
  const T = 16;
  function tile(c, col, row, x, y, w = T, h = T) { if (sheet.complete && sheet.naturalWidth) c.drawImage(sheet, col * T, row * T, T, T, x, y, w, h); }
  function px(c, x, y, color, w = 1, h = 1) { c.fillStyle = color; c.fillRect(x, y, w, h); }
  function mix(a, b, p) { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); return '#' + [16, 8, 0].map(s => Math.round(((A >> s) & 255) * (1 - p) + ((B >> s) & 255) * p).toString(16).padStart(2, '0')).join(''); }

  // ── Sprites from text layers ──────────────────────────────────────────────
  function blit(c, rows, x, y, palette, flip = false) {
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (let i = 0; i < row.length; i++) {
        const ch = row[i]; if (ch === '.') continue;
        const col = palette[ch]; if (!col) continue;
        c.fillStyle = col; c.fillRect(x + (flip ? row.length - 1 - i : i), y + r, 1, 1);
      }
    }
  }

  // ── The room ──────────────────────────────────────────────────────────────
  const themes = {
    museum: { wall: '#2c3a3f', tint: null, floorTint: 'rgba(20,40,40,.35)', banner: null, sign: 'MUSEUM', window: 'moon' },
    sparta: { tint: 'rgba(170,110,60,.35)', floorTint: 'rgba(90,60,20,.3)', banner: { color: '#8b1a1a', glyph: 'Λ' }, window: 'sun' },
    napoleon: { tint: 'rgba(40,60,110,.35)', floorTint: 'rgba(200,210,230,.55)', banner: { color: '#1f3a6b', glyph: 'N' }, window: 'snow' },
    bunker: { tint: 'rgba(60,60,55,.5)', floorTint: 'rgba(30,30,30,.5)', banner: { color: '#4d4634', glyph: '' }, window: 'none' },
    kremlin: { tint: 'rgba(140,20,20,.45)', floorTint: 'rgba(80,20,20,.4)', banner: { color: '#b3202a', glyph: '★' }, window: 'moon' },
    hall: { tint: 'rgba(120,80,30,.3)', floorTint: 'rgba(60,40,20,.35)', banner: null, window: 'moon' }
  };
  const generic = (color, glyph, tint) => ({ tint, floorTint: 'rgba(30,30,30,.35)', banner: { color, glyph }, window: 'moon' });
  Object.assign(themes, {
    rome: generic('#8b1a1a', 'SPQR', 'rgba(140,110,70,.35)'), persia: generic('#4a1f6b', '☀', 'rgba(90,40,120,.4)'), china: generic('#8a1a1a', '龍', 'rgba(150,30,30,.4)'),
    judea: generic('#7a1f2e', '✡', 'rgba(150,120,70,.35)'), steppe: generic('#2a4a8a', 'ᠮ', 'rgba(60,90,70,.35)'), castle: generic('#5a0f1e', '†', 'rgba(50,50,70,.4)'),
    church: generic('#121212', '✝', 'rgba(50,40,30,.45)'), aztec: generic('#1f6b4a', '☉', 'rgba(60,110,70,.35)'), tsar: generic('#8a1a1a', '☦', 'rgba(120,70,30,.4)'),
    pirate: generic('#111111', '☠', 'rgba(40,70,90,.4)'), revolution: generic('#1f3a6b', '⚜', 'rgba(50,60,90,.35)'), jungle: generic('#1a2a4a', '✶', 'rgba(30,90,40,.4)'),
    speakeasy: generic('#4a4a52', '$', 'rgba(110,50,20,.45)'), fascist: generic('#111111', '⚒', 'rgba(60,60,60,.5)'), japan: generic('#e8e2d0', '●', 'rgba(180,60,60,.3)'),
    desert: generic('#2a8a4a', '☾', 'rgba(170,140,70,.4)'), cartel: generic('#2a3a6a', '$', 'rgba(90,40,110,.4)'), palace: generic('#8a1a1a', '☭', 'rgba(70,70,70,.45)'),
    hell: { tint: 'rgba(120,8,8,.58)', floorTint: 'rgba(160,40,10,.5)', banner: { color: '#2a0606', glyph: '666' }, window: 'none', fire: true }
  });
  // Door signs per era, so the same hall does not read MUSEUM in Sparta, Rome and the bunker alike.
  const signs = { museum: 'MUSEUM', sparta: 'TERMOPILE', persia: 'PERSEPOLIS', china: 'XIANYANG', judea: 'JEROZOLIMA', rome: 'ROMA', steppe: 'STEP', castle: 'ZAMEK', church: 'KATEDRA', aztec: 'TENOCHTITLAN', tsar: 'KREML', pirate: 'PORT', revolution: 'PARYZ', napoleon: 'AUSTERLITZ', jungle: 'KONGO', speakeasy: 'CHICAGO', fascist: 'ROMA', bunker: 'BUNKIER', japan: 'TOKIO', kremlin: 'KREML', desert: 'PUSTYNIA', cartel: 'MEDELLIN', palace: 'PALAC', hell: 'PIEKŁO', hall: 'SALA' };
  function drawArena(c, t = 0, themeKey = 'museum', o = {}) {
    const th = themes[themeKey] || themes.museum;
    c.fillStyle = '#0a1014'; c.fillRect(0, 0, W, H);
    // Brick wall: alternate three brick tiles, shaded darker toward the top.
    for (let r = 0; r < 8; r++) for (let col = 0; col < 18; col++) tile(c, [3, 4, 3, 1][(r + col) % 4], 3, col * T, r * T);
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, 0, W, 16); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, 16, W, 16);
    if (th.tint) { c.fillStyle = th.tint; c.fillRect(0, 0, W, FLOOR - 5); }
    // Cornice and plinth.
    for (let col = 0; col < 18; col++) { tile(c, 0, 3, col * T, 0); }
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, 14, W, 2);
    // Windows with a moon, sun or snow; bricked up in the bunker.
    [[36, 40], [220, 40]].forEach(([x, y]) => {
      px(c, x - 1, y - 1, '#1a2224', 34, 50); px(c, x, y, th.window === 'sun' ? '#8c3f1f' : th.window === 'snow' ? '#6b7c8e' : '#0d1a2a', 32, 48);
      if (th.window === 'moon') { px(c, x + 20, y + 10, '#c9d6c8', 7, 7); px(c, x + 18, y + 9, th.tint ? '#0d1a2a' : '#0d1a2a', 6, 6); for (let k = 0; k < 9; k++) px(c, x + (k * 7 + 3) % 30, y + (k * 11 + 5) % 44, '#9fb3b0'); }
      if (th.window === 'sun') { px(c, x + 12, y + 8, '#ffd98a', 8, 8); px(c, x + 10, y + 10, '#ffd98a', 12, 4); px(c, x, y + 30, '#5a2a14', 32, 18); }
      if (th.window === 'snow') { for (let k = 0; k < 22; k++) px(c, x + (k * 5 + 2) % 31, y + ((k * 9 + t * 14) % 47), '#eef4ff'); }
      if (th.window === 'none') { for (let r = 0; r < 3; r++) tile(c, 3, 3, x, y + r * T); }
      px(c, x + 15, y, '#8a7a50', 2, 48); px(c, x, y + 22, '#8a7a50', 32, 2);
      px(c, x - 2, y + 48, '#4a4a3a', 36, 3);
    });
    // Central entrance arch with the museum sign.
    px(c, 112, 28, '#1a2224', 64, 100); px(c, 114, 30, '#0b1418', 60, 98);
    for (let r = 0; r < 4; r++) for (let col = 0; col < 3; col++) tile(c, 9 + col, r, 120 + col * T, 64 + r * T);   // the great wooden door
    if (th.banner) { c.fillStyle = th.banner.color; c.globalAlpha = .28; c.fillRect(120, 64, 48, 64); c.globalAlpha = 1; }
    px(c, 116, 60, '#3a3a2c', 56, 4);
    px(c, 140, 44, '#2c4a3e', 8, 8); px(c, 143, 46, '#d9c28a', 2, 4);                   // clock
    // Banners or reliefs between the windows and the arch.
    if (th.banner) {
      [84, 182].forEach(x => { px(c, x - 1, 30, '#3b352a', 24, 3); px(c, x, 33, th.banner.color, 22, 44); px(c, x, 77, th.banner.color, 11, 6); px(c, x + 11, 77, th.banner.color, 11, 6); px(c, x + 2, 35, 'rgba(255,255,255,.12)', 2, 40); const letters = [...String(th.banner.glyph || '')], col = mix(th.banner.color, '#ffffff', .6); if (letters.length <= 1) { if (letters[0]) pixelGlyph(c, letters[0], col, x + 11, 56, 1); } else letters.slice(0, 4).forEach((ch, i) => pixelGlyph(c, ch, col, x + 11, 40 + i * 10, .62)); });
    } else { tile(c, 5, 3, 84, 44); tile(c, 5, 3, 188, 44); }
    // Stone pillars (stacked statue blocks) and torches.
    [8, 96, 176, 264].forEach(x => { tile(c, 6, 0, x, 16); for (let r = 1; r < 6; r++) tile(c, 6, 1, x, 16 + r * T); tile(c, 6, 2, x, 112); });
    const flick = Math.floor(t * 8) % 2;
    [60, 212].forEach(x => { tile(c, 5, 2, x, 56); if (flick) px(c, x + 7, 59, '#ffd98a', 2, 2); c.fillStyle = 'rgba(255,180,90,.08)'; c.fillRect(x - 14, 48, 44, 40); });
    // Floor: stone blocks, darker band, rope barrier.
    for (let col = 0; col < 18; col++) { tile(c, 2, 3, col * T, 128); tile(c, 1, 3, col * T, 144); }
    c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(0, 128, W, 34);
    if (th.floorTint) { c.fillStyle = th.floorTint; c.fillRect(0, 128, W, 34); }
    px(c, 0, 127, '#6a6c50', W, 1); px(c, 0, 128, '#293d33', W, 2);
    [[2, 30], [258, 286]].forEach(([a, b]) => { px(c, a, 116, '#9f9061', 2, 14); px(c, b, 116, '#9f9061', 2, 14); for (let k = a + 2; k < b; k += 2) px(c, k, 120 + Math.round(Math.sin((k - a) / (b - a) * Math.PI) * 3), '#6c2637'); });
    // Sign plaque above the door (drawn after the pillars so long names never hide behind them).
    const sign = String(o.sign || signs[themeKey] || (themeKey === 'hall' ? 'SALA' : 'MUSEUM')).slice(0, 20), sw = Math.min(150, sign.length * 5 + 10);
    px(c, 144 - sw / 2 - 1, 44, '#3b352a', sw + 2, 13); px(c, 144 - sw / 2, 45, '#1a1612', sw, 11); px(c, 144 - sw / 2, 45, '#5a5040', sw, 1);
    if (o.texts) o.texts.push({ x: 144, y: 54, text: sign, size: 7, color: '#e2cf8f', plaque: false });
    else { c.fillStyle = '#e2cf8f'; c.font = '7px monospace'; c.textAlign = 'center'; c.fillText(sign, 144, 54); }
    if (th.fire) {   // hell: lava cracks on the floor and flames licking the plinth, flickering with time
      for (let col = 0; col < 18; col++) { const f = Math.floor(Math.sin(t * 7 + col * 1.7) * 2 + 3); px(c, col * T + 3, 127 - f, '#ff8a2a', 4, f); px(c, col * T + 4, 127 - Math.max(1, f - 2), '#ffd36a', 2, Math.max(1, f - 2)); px(c, col * T + 9, 129 - (f >> 1), '#ff5a1a', 3, f >> 1); }
      for (let k = 0; k < 9; k++) px(c, 8 + k * 32 + ((k * 7) % 5), 140 + (k % 3) * 6, '#ff7a2a', 10 + (k % 4) * 3, 1);
      for (let k = 0; k < 6; k++) px(c, 30 + k * 44, 150 + (k % 2) * 5, '#ffb24a', 6, 1);
    }
    // Chests as props by the pillars.
    tile(c, 5, 7, 24, 112); tile(c, 6, 7, 248, 112);
    // Vignette.
    const g = c.createRadialGradient(144, 80, 60, 144, 80, 190); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,4,10,.6)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  }

  // Attack swing shared by the knight and the human rig. `hold` is the vertical sprite (grip at the bottom),
  // `fwd` the horizontal thrust sprite (grip on the left). The front arm is drawn by the same call so the hand stays on the grip.
  // Phases: wind-up (arm up, blade over the head), strike (arm and blade thrust forward), follow-through (lowered).
  // The fist is redrawn over the grip after the weapon, so the weapon visibly passes through the closed hand.
  function swing(B, p, arms, hold, fwd, wpal) {
    const hx = 4 - Math.floor(hold[0].length / 2);
    if (p < .45) { B(arms.raised, 2, 6); B(hold, hx, 10 - hold.length, wpal); B(arms.raised.slice(0, 3), 2, 6); }
    else if (p < .75) { B(arms.fwd, 2, 13); B(fwd, 8, 15 - Math.floor(fwd.length / 2), wpal); B(arms.fwd, 2, 13); }
    else { B(arms.fwd, 2, 15); B(fwd, 8, 17 - Math.floor(fwd.length / 2), wpal); B(arms.fwd, 2, 15); }
  }
  // Resting grip: weapon upright in the front hand (arm at 2,13; fist on its last two rows), pommel peeking under the fist.
  function holdIdle(B, arm, hold, wpal) {
    B(arm, 2, 13); B(hold, 4 - Math.floor(hold[0].length / 2), 22 - hold.length, wpal); B(arm.slice(-2), 2, 13 + arm.length - 2);
  }
  const lunge = p => p < .45 ? -1 : p < .75 ? 2 : 1;   // body lean during the swing, in pixels along the facing direction


  // ── The watchman's room (prologue / epilogue): 288 x 162, hand-placed pixels ──
  const guardParts = {
    cap: [
      "......OOOOOOOOOOOOOO......",
      "....OOCCCCCCCCCCCCCCOO....",
      "...OCCCCCCCCCCCCCCCCCCO...",
      "...OCCCCCCCCGGCCCCCCCCO...",
      "...OCCCCCCCCGGCCCCCCCCO...",
      "..OOCCCCCCCCCCCCCCCCCCOO..",
      ".OuuuuuuuuuuuuuuuuuuuuuuO.",
      ".OOOOOOOOOOOOOOOOOOOOOOOO."],
    face: [
      "...OSSSSSSSSSSSSSSSSSSO...",
      "..OSSSSSSSSSSSSSSSSSSSSO..",
      "..OSSSSSSSSSSSSSSSSSSSSO..",
      "..OSSSWWWSSSSSSSSWWWSSSO..",
      "..OSSSWKWSSSSSSSSWKWSSSO..",
      "..OSSSSSSSSSsSSSSSSSSSSO..",
      "..OSSSSSSSSSsSSSSSSSSSSO..",
      "..OSSSSMMMMMMMMMMMMMSSSO..",
      "..OSSSSMMMMMMMMMMMMMSSSO..",
      "...OSSSSSSSSSSSSSSSSSSO...",
      "...OSSSSSSSsssSSSSSSSSO...",
      "....OSSSSSSSSSSSSSSSSO....",
      ".....OOOSSSSSSSSSOOO......",
      "........OOOOOOOOO........."],
    torso: [
      "..........OOOOOOOOOOOOOOOO..........",
      "......OOOOUUUUUUSSSSUUUUUUOOOO......",
      "....OOUUUUUUUUUuSSSSuUUUUUUUUUOO....",
      "...OUUUUUUUUUUUUuuuuUUUUUUUUUUUUO...",
      "..OUUUUUUUUUUUUUUuuUUUUUUUUUUUUUUO..",
      "..OUUUUUUUUUUUUUUuuUUUUUUUUUUUUUUO..",
      "..OUUUUGGUUUUUUUUuuUUUUUUUUUUUUUUO..",
      "..OUUUUGGUUUUUUUUuuUUUUUUUUUUUUUUO..",
      "..OUUUUUUUUUUUUUUuuUUUUUUUUUUUUUUO..",
      ".OUUUUUUUUUUUUUUUuuUUUUUUUUUUUUUUUO.",
      ".OUUUUUUUUUUUUUUUuuUUUUUUUUUUUUUUUO.",
      ".OUUUUUUUUUUUUUUUuuUUUUUUUUUUUUUUUO.",
      ".OUUUUUUUUUUUUUUUuuUUUUUUUUUUUUUUUO.",
      "OUUUUUUUUUUUUUUUUuuUUUUUUUUUUUUUUUUO",
      "OUUUUUUUUUUUUUUUUuuUUUUUUUUUUUUUUUUO",
      "OUUUUUUUUUUUUUUUUuuUUUUUUUUUUUUUUUUO"],
    hand: [".OOOOO.", "OSSSSSO", "OSSSSSO", ".OOOOO."],
    mug: ["OOOOOOO..", "OLLLLLOO.", "OLLLLLOLO", "OLLLLLOLO", "OLLLLLOO.", ".OOOOO..."],
    can: [".OOOOOOOOOOOO.", "OMMMMMMMMMMMMO", "OMMMMMMOOMMMMO", ".OMMMMMMMMMMO.", ".OWGGGGGGGGGO.", ".OWGGGGGGGGGO.", ".OWGGGGGGGGGO.", ".OKKKKKKKKKKO.", ".OKKKKKKKKKKO.", ".OKKKKKKKKKKO.", ".OKKKKKKKKKKO.", ".OWGGGGGGGGGO.", ".OWGGGGGGGGGO.", ".OWGGGGGGGGGO.", ".OWGGGGGGGGGO.", ".OMMMMMMMMMMO.", ".OMMMMMMMMMMO.", "..OOOOOOOOOO.."],
    lampShade: ["....OOOOOOOOOOOO....", "...OJJJJJJJJJJJJO...", "..OJJJJJJJJJJJJJJO..", ".OJJJJJJJJJJJJJJJJO.", "OjjjjjjjjjjjjjjjjjjO", "OOOOOOOOOOOOOOOOOOOO"],
    key: [".OO.", "OGGO", "OGGO", ".OO.", ".OG.", ".OG.", ".OGG", ".OG."]
  };
  const guardPal = { O: '#0b1418', C: '#203a49', u: '#152b39', G: '#c9b591', S: '#b9a07e', s: '#8e806b', W: '#e0d8b9', K: '#293c38', M: '#5a4a35', U: '#2a4350', L: '#d9d3b6', J: '#2e554c', j: '#91a78a' };
  const canPal = { O: '#0b1418', M: '#c9d2d4', G: '#d9b24a', W: '#f3e2a0', K: '#1b2a22' };   // beer can: silver rim, gold body, dark label band
  function drawGuardRoom(c, t, o = {}) {
    const awake = !!o.awake;
    // Walls: dark teal with a lighter dado band.
    px(c, 0, 0, '#16262e', W, H); px(c, 0, 0, '#1a2d35', W, 70); px(c, 0, 96, '#22363a', W, 2); px(c, 0, 98, '#122026', W, 64);
    // Window with a Venetian blind, dawn creeping in from the bottom.
    px(c, 164, 14, '#65716a', 90, 80); px(c, 166, 16, '#2a4144', 86, 76);
    for (let r = 0; r < 76; r++) { const k = r / 76; c.fillStyle = mix(mix('#486366', '#9b9b79', Math.min(1, k * 1.5)), '#b3a17b', Math.max(0, (k - .65) * 2.8)); c.fillRect(166, 16 + r, 86, 1); }
    for (let i = 0; i < 13; i++) px(c, 166, 18 + i * 6, 'rgba(13,34,38,.7)', 86, 2);
    px(c, 207, 16, '#263c3e', 3, 76);
    // Dawn rays on the wall.
    c.fillStyle = 'rgba(219,189,125,.05)'; for (let i = 0; i < 5; i++) c.fillRect(120 - i * 14, 40 + i * 18, 60, 2);
    // Corkboard: photograph of the arena arch, the duty rota and three keys.
    px(c, 30, 18, '#776e51', 80, 58); px(c, 32, 20, '#2b3430', 76, 54);
    px(c, 36, 24, '#b3a47e', 34, 28); px(c, 37, 25, '#1e3238', 32, 26); px(c, 44, 31, '#17252e', 18, 18); px(c, 46, 29, '#17252e', 14, 4); px(c, 37, 47, '#596a54', 32, 1);
    px(c, 76, 23, '#c6bf9d', 26, 32); for (let i = 0; i < 6; i++) px(c, 79, 29 + i * 4, '#8a8d75', 20, 1); px(c, 79, 25, '#313d3a', 20, 2);
    for (let j = 0; j < 3; j++) blit(c, guardParts.key, 40 + j * 9, 58, guardPal);
    // Chair back behind the watchman.
    px(c, 118, 92, '#344a4c', 48, 40); px(c, 120, 90, '#344a4c', 44, 2); px(c, 121, 94, '#0b1720', 42, 36); px(c, 124, 97, '#1b2d35', 36, 30);
    // The watchman: cap, face, uniform. Asleep: head tipped two pixels and eyes shut.
    const hx = 129, hy = awake ? 78 : 81;
    const face = guardParts.face.map(r => awake ? r : r.replace(/WWW/g, 'SSS').replace(/WKW/g, 'sss'));
    blit(c, guardParts.torso, 124, 100, guardPal);
    blit(c, face, hx, hy + 8, guardPal); blit(c, guardParts.cap, hx, hy, guardPal);
    if (!awake) { px(c, hx + 6, hy + 11, 'rgba(0,0,0,.12)', 14, 12); }
    // Desk, hands, mug with steam, paper, lamp.
    px(c, 40, 128, '#a28f60', 208, 1); px(c, 38, 129, '#58604a', 212, 10); px(c, 30, 139, '#35433a', 228, 23); px(c, 30, 139, '#1f2d2a', 228, 1);
    blit(c, guardParts.hand, 128, 124, guardPal); blit(c, guardParts.hand, 150, 124, guardPal);
    // A cold can of Kustosz on the desk (the watchman's beer), with condensation instead of coffee steam; the label text is drawn crisp by the text layer.
    blit(c, guardParts.can, 78, 110, canPal);
    for (let i = 0; i < 3; i++) { const yy = 114 + ((t * 3 + i * 5) % 11), xx = 81 + i * 4; px(c, xx, yy, 'rgba(230,240,255,.35)', 1, 2); }
    if (o.texts) o.texts.push({ x: 85, y: 120.5, text: 'KUSTOSZ', size: 2.6, color: '#f3e2a0', plaque: false });
    px(c, 100, 144, '#b9b195', 70, 10); px(c, 104, 147, '#364c49', 40, 1); px(c, 104, 150, '#364c49', 54, 1);
    px(c, 203, 125, '#8d8963', 20, 3); px(c, 212, 96, '#5a6654', 2, 29); blit(c, guardParts.lampShade, 203, 88, guardPal);
    const g = c.createRadialGradient(213, 96, 2, 213, 96, 64); g.addColorStop(0, 'rgba(230,200,120,.34)'); g.addColorStop(1, 'rgba(230,200,120,0)'); c.fillStyle = g; c.fillRect(140, 40, 148, 125);
    // Vignette.
    const v = c.createRadialGradient(144, 86, 40, 144, 86, 170); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,8,16,.55)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
  }

  // ── The knight: 28 x 40 pixels, facing right, assembled from parts ───────
  const knightParts = {
    head: [
      "...OOOOOO...",
      "..OLLLLLLO..",
      ".OLBBBBBBBO.",
      ".OBBBBBBBBO.",
      "OBBBBBBBBBBO",
      "OBBDDDDDDDBO",
      "OBBKKKKKKEBO",
      "OBBBBBBBBBBO",
      ".OBBBBBBBBO.",
      ".ODDDDDDDDO.",
      "..OOOOOOOO..",
    ],
    plume: ["..CC.", ".CCCC", "CCcC.", "Ccc..", "cc..."],
    torso: [
      "..OOOOOOOOOO..",
      ".OLLBBBBBBBLO.",
      "OBBBBBGGBBBBBO",
      "OBBBBBBBBBBBBO",
      "OBBBBBBBBBBBBO",
      "ODBBBBGGBBBBDO",
      "ODDBBBBBBBBDDO",
      ".ODDBBBBBBDDO.",
      ".ODDDDDDDDDDO.",
      ".OGGGGGGGGGGO.",
      ".OccCCCCCCccO.",
      "..OCCCCCCCCO..",
      "..OOOOOOOOOO..",
    ],
    armBack: ["OOOO", "OBBO", "OBBO", "ODBO", "ODBO", "ODDO", ".OO."],
    armFront: ["OOOOO", "OLBBO", "OBBBO", "OBBBO", "ODBBO", "ODDBO", "ODDBO", ".OOO."],
    armRaised: [".OOO.", "ODDDO", "ODDBO", "OBBBO", "OBBBO", "OLBBO", "OBBBO", "OOOOO"],
    armFwd: ["OOOOOOOO.", "OLBBBBDDO", "OBBBBBDDO", "OBBBBDDDO", ".OOOOOOO."],
    legA: ["OBBBBO", "OBBBBO", "ODBBDO", "ODBBDO", "ODBBDO", "OBBBBO", "ODDDDO", "ODDDDO", "OOOOOO"],
    legB: ["OBBBBO", "ODBBDO", "ODBBDO", "ODDDDO", ".OBBO.", "OBBBBO", "ODDDDO", "OOOOOO"],
    boot: ["OLLLLO", "ODDDDO", "OOOOOO"],
    sword: [".OO.", ".OEO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OGGO", "GGGG", ".OO.", ".OO.", ".GG."],
    swordFwd: ["...............OO...", "OGG.OWEEEEEEEEEEEEO.", "OGGOEWWWWWWWWWWWWEO.", "...OEEEEEEEEEEEEEO..", "....OOOOOOOOOOOO...."],
    shield: [".OOOOOOO.", "OGBBBBBGO", "OBBCCCBBO", "OBCCGCCBO", "OBCCGCCBO", "OBBCCCBBO", "OBBBBBBBO", ".OBBBBBO.", "..OBBBO..", "...OOO..."],
    cape: ["CCCCCC", "CCCCCCC", "cCCCCCCC", "cCCCCCCC", "ccCCCCCC", "ccCCCCCC", "cccCCCCC", "cccCCCCC", "ccccCCCC", "ccccCCCC", "cccccCCC", "cccccCCC", "ccccccCC", "ccccccCC", "cccccccC", "cccccccC", "ccccccc.", "cccccc..", "ccccc...", "cccc...."]
  };
  const extraPalettes = {};   // knight palettes added by hidden packs: [base, dark, light, glint, cloth, clothDark]
  const extraFigures = {};    // whole human rigs used as player skins (hidden packs): figure definition like an exhibit's
  // A figure skin: the human rig with the player's equipped weapon mapped onto it (by weapon type, or the weapon's own sprite).
  function drawFigureSkin(c, x, y, o = {}) {
    const wdef = window.MuseumWeapons?.get(o.weapon), wtype = wdef?.type;
    const key = wdef?.sprite && human.weapons[wdef.sprite] ? wdef.sprite : ({ blade: 'sabre', heavy: 'axe', polearm: 'spear', light: 'dagger', bow: 'bow', pistol: 'pistol', rifle: 'rifle' })[wtype] || 'sabre';
    drawFigure(c, x, y, { ...o, figure: { ...extraFigures[o.skin], weapon: key } });
  }
  function knightPalette(skin) {
    let base = '#687b7e', dark = '#172b36', light = '#bad2c8', glint = '#e5dfab', cloth = ['#581e32', '#26182b'];
    const special = { brass: ['#947247', '#302b29', '#d9b773', '#ffe1a0', '#581e32', '#26182b'], frost: ['#6c9ca5', '#193747', '#c5f6ed', '#e5ffff', '#35708a', '#16293e'], obsidian: ['#353d55', '#111a29', '#9c8bc1', '#d7b4ff', '#4d2f62', '#1b162a'],
      verdigris: ['#4a947b', '#152f29', '#b8dfad', '#e5ffc5', '#22624e', '#12291f'], ember: ['#a54e37', '#351b24', '#ffc187', '#fff1b7', '#a43127', '#36151d'], royal: ['#67528b', '#211c3c', '#dbb9ef', '#ffebff', '#62408a', '#241637'], solar: ['#b7953c', '#3e321b', '#fff0ac', '#ffffe1', '#b28c38', '#44311e'],
      'stachu-jones': ['#77858b', '#263742', '#c6d1cc', '#dfe8e2', '#18283f', '#0d192b'], 'cassock': ['#f4f1e8', '#5a5046', '#ffffff', '#ffe9a8', '#b3202a', '#7a1119'] }[skin];
    const registered = extraPalettes[skin];
    if (registered) [base, dark, light, glint, cloth[0], cloth[1]] = registered; else if (special) [base, dark, light, glint, cloth[0], cloth[1]] = special;
    const look = window.MuseumKnights?.skins?.find(s => s.id === skin);
    if (look) { base = look.colors[0]; dark = mix(base, '#07111c', .7); light = mix(base, '#f3f5e7', .5); glint = look.colors[3] || mix(look.colors[2], '#fff9e4', .55); cloth = [look.colors[1], mix(look.colors[1], '#071016', .6)]; }
    return { O: mix(dark, '#000000', .55), B: base, D: dark, L: light, G: '#c9a94a', C: cloth[0], c: cloth[1], K: '#0c2530', E: '#b7f9d5', W: '#f5f6d3' };
  }

  // ── Special figure 'cassock': white cassock, red mozzetta with gold trim, zucchetto and pectoral cross (content arrives from a hidden pack) ──
  const popeParts = {
    head: [
      "...OOOOOO...",
      "..OWWWWWWO..",
      ".OHWWWWWWHO.",
      ".OHSSSSSSHO.",
      "OHSSSSSSSSHO",
      "OHSSKSSSSKHO",
      "OHSSSSSSSSHO",
      "OSSSSSNSSSSO",
      ".OSSSSSSSSO.",
      ".OSSSSSSSSO.",
      "..OOOOOOOO..",
    ],
    torso: [
      "..OOOOOOOOOO..",
      ".ORRRRRRRRRRO.",
      "ORRRRRRRRRRRRO",
      "ORRRRRGRRRRRRO",
      "ORRRRRGRRRRRRO",
      "ORRRRGGGRRRRRO",
      "OGGGGGGGGGGGGO",
      ".OCCCCCCCCCCO.",
      ".OCCCCcCCCCCO.",
      ".OCCCCcCCCCCO.",
      ".OcCCCcCCCCcO.",
      ".OcCCCcCCCCcO.",
      "..OOOOOOOOOO..",
    ],
    armBack: ["OOOO", "ORRO", "ORRO", "OCCO", "OcCO", "OccO", "OSSO", ".OO."],
    armFront: ["OOOOO", "ORRRO", "ORRRO", "OCCCO", "OcCCO", "OccCO", "OSSSO", ".OOO."],
    armRaised: [".OOO.", "OSSSO", "OccCO", "OcCCO", "OCCCO", "ORRRO", "ORRRO", "OOOOO"],
    armFwd: ["OOOOOOOO.", "ORRCCCcSO", "ORRCCCcSO", "ORRCCccSO", ".OOOOOOO."],
    skirt: ["OCCCCCCCCCCCCO", "OCCCCcCCCCCCCO", "OcCCCcCCCCCcCO", "OcCCCcCCCCCcCO", "OcCCCcCCCCCcCO", "OccCCcCCCCccCO", "OccccccccccccO", "OOOOOOOOOOOOOO"],
    shoe: ["OBBBBO", "ObbbbO", "OOOOOO"]
  };
  const popePalette = { O: '#1a1416', S: '#e6c1a2', s: '#c49a7c', N: '#b98a6c', K: '#2a2420', H: '#e8e4dc', W: '#f8f6f0', R: '#b3202a', r: '#7a1119', G: '#d9b24a', C: '#f4f1e8', c: '#d2ccbc', B: '#4a2a22', b: '#6b3f34', E: '#b7f9d5' };
  function drawPope(c, x, y, o = {}) {
    const pose = o.pose || 'idle', p = Math.max(0, Math.min(1, o.progress ?? 0)), t = o.time || 0;
    const walk = pose === 'walk' ? Math.round(Math.sin(t * 9)) : 0, bob = pose === 'walk' ? Math.abs(Math.round(Math.sin(t * 9))) : 0;
    const flip = o.facing === -1, pal = { ...popePalette };
    pal.E = pose === 'attack' ? '#eff8df' : pal.E;
    c.save(); c.translate(Math.round(x), Math.round(y));
    if (flip) c.scale(-1, 1);
    c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(-9, -1, 18, 2);
    if (pose === 'dead') { c.translate(-6, -4); c.rotate(-Math.PI / 2); c.translate(-14, 2); }
    else if (pose === 'dodge') c.translate(-4, 2);
    else if (pose === 'hurt') c.translate(-2, 0);
    const oy = -35 - bob;
    const B = (rows, dx, dy, pl = pal) => blit(c, rows, dx, oy + dy, pl);
    B(popeParts.armBack, 4, 12);
    const wdef = window.MuseumWeapons?.get(o.weapon), wtype = wdef?.type, held = wdef?.sprite && human.weapons[wdef.sprite] ? human.weapons[wdef.sprite] : wtype && wtype !== 'blade' ? human.weapons[({ heavy: 'axe', polearm: 'spear', light: 'dagger', bow: 'bow', pistol: 'pistol', rifle: 'rifle' })[wtype]] : null;
    const wpal = { ...pal, M: '#c9d6dc', W: '#f5f6d3', D: '#5a3a22', G: '#c9a94a', ...(wdef?.palette || {}), ...(wdef?.glow ? { L: mix(wdef.palette?.L || '#6ff6ff', '#ffffff', (Math.sin(t * 7) + 1) / 4) } : {}), ...(o.finish ? window.MuseumFinishes?.palette(o.finish, t) || {} : {}) };
    const hold = held ? held.hold : knightParts.sword, fwd = held ? held.fwd : knightParts.swordFwd;
    if (pose === 'attack') c.translate(lunge(p), 0);
    // The cassock reaches the shoes: a long skirt instead of greaves, shoes peeking out underneath.
    B(popeParts.shoe, -6 + (walk > 0 ? 1 : 0), 32); B(popeParts.shoe, 0 + (walk < 0 ? 1 : 0), 32);
    B(popeParts.skirt, -7, 24);
    B(popeParts.torso, -7, 11);
    B(human.neck, -2, 10);
    B(popeParts.head, -6, 0);
    if (pose === 'attack') swing(B, p, { raised: popeParts.armRaised, fwd: popeParts.armFwd }, hold, fwd, wpal);
    else holdIdle(B, popeParts.armFront, hold, wpal);
    c.restore();
  }
  function drawKnight(c, x, y, o = {}) {
    if (o.skin === 'cassock') { drawPope(c, x, y, o); return; }
    if (extraFigures[o.skin]) { drawFigureSkin(c, x, y, o); return; }
    const pose = o.pose || 'idle', p = Math.max(0, Math.min(1, o.progress ?? 0)), t = o.time || 0, pal = knightPalette(o.skin);
    pal.E = pose === 'attack' ? '#eff8df' : pal.E;
    const walk = pose === 'walk' ? Math.round(Math.sin(t * 9)) : 0, bob = pose === 'walk' ? Math.abs(Math.round(Math.sin(t * 9))) : 0;
    const flip = o.facing === -1;
    c.save(); c.translate(Math.round(x), Math.round(y));
    if (flip) c.scale(-1, 1);
    const shadowW = 18; c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(-shadowW / 2, -1, shadowW, 2);
    if (pose === 'dead') { c.translate(-6, -4); c.rotate(-Math.PI / 2); c.translate(-14, 2); }
    else if (pose === 'dodge') c.translate(-4, 2);
    else if (pose === 'hurt') c.translate(-2, 0);
    const oy = -35 - bob;   // boots (legs 23 + 9 rows, boot 32 + 3 rows) end exactly at ground level
    const B = (rows, dx, dy, pl = pal) => blit(c, rows, dx, oy + dy, pl);
    B(knightParts.cape, -12, 8);                                   // cape behind
    B(knightParts.armBack, 4, 12);
    const wdef = window.MuseumWeapons?.get(o.weapon), wtype = wdef?.type, held = wdef?.sprite && human.weapons[wdef.sprite] ? human.weapons[wdef.sprite] : wtype && wtype !== 'blade' ? human.weapons[({ heavy: 'axe', polearm: 'spear', light: 'dagger', bow: 'bow', pistol: 'pistol', rifle: 'rifle' })[wtype]] : null;
    const wpal = { ...pal, M: '#c9d6dc', W: '#f5f6d3', D: '#5a3a22', G: '#c9a94a', ...(wdef?.palette || {}), ...(wdef?.glow ? { L: mix(wdef.palette?.L || '#6ff6ff', '#ffffff', (Math.sin(t * 7) + 1) / 4) } : {}), ...(o.finish ? window.MuseumFinishes?.palette(o.finish, t) || {} : {}) };   // weapon colours (steel, edge, wood, brass), recoloured by a finish
    const Wb = (rows, dx, dy) => B(rows, dx, dy, wpal);
    const hold = held ? held.hold : knightParts.sword, fwd = held ? held.fwd : knightParts.swordFwd;
    if (pose === 'attack') c.translate(lunge(p), 0);
    B(walk > 0 ? knightParts.legB : knightParts.legA, -6, 23); B(walk < 0 ? knightParts.legB : knightParts.legA, 0, 23);
    B(knightParts.boot, -6, 32); B(knightParts.boot, 0, 32);
    B(knightParts.torso, -7, 11);
    B(knightParts.head, -6, 0); B(knightParts.plume, -10, -3);
    if (pose === 'guard') B(knightParts.shield, 4, 10); else B(knightParts.shield, -11, 14);
    if (pose === 'attack') swing(B, p, { raised: knightParts.armRaised, fwd: knightParts.armFwd }, hold, fwd, wpal);
    else holdIdle(B, knightParts.armFront, hold, wpal);
    c.restore();
  }

  // ── The T-rex skeleton: 60 x 40 pixels, facing left ───────────────────────
  const rexParts = {
    skull: [
      "....OOOOOOOOOO....",
      "..OOBBBBBBBBBBOO..",
      ".OBBBBBBBBBBBBBBO.",
      "OBBBBBBBOOBBBBBBBO",
      "OBBBBBBOKKOBBBBBBO",
      "OBBBBBBOKAOBBBBBBO",
      "OBBBBBBBOOBBBBBBBO",
      "OBBBBBBBBBBBBBBBBO",
      ".OBBBBBBBBBBBBBBO.",
      "OWBWBWBWBWBWBWBWBO",
    ],
    jaw: ["OWBWBWBWBWBWBWBO", ".OBBBBBBBBBBBBBO", "..OOOOOOOOOOOOO."],
    jawOpen: ["OWBWBWBWBWBWBWBO", "OBBBBBBBBBBBBBBO", ".OBBBBBBBBBBBBO.", "..OOOOOOOOOOOO.."],
    neck: ["OBBO", "OBBO", "OBBO", "OBBO"],
    spine: ["OBBOBBOBBOBBOBBOBBOBBOBBOBBOBBO", ".OBBBBBBBBBBBBBBBBBBBBBBBBBBBO.", "..OOOOOOOOOOOOOOOOOOOOOOOOOOO.."],
    ribs: [
      ".OB.OB.OB.OB.OB.OB.OB.",
      ".OB.OB.OB.OB.OB.OB.OB.",
      "OB.OB.OB.OB.OB.OB.OB..",
      "OB.OB.OB.OB.OB.OB.OB..",
      "OB.OB.OB.OB.OB.OB.OB..",
      ".OB.OB.OB.OB.OB.OB.OB.",
      ".OB.OB.OB.OB.OB.OB.OB.",
      "..OBOOBOOBOOBOOBOOB...",
    ],
    pelvis: ["..OOOO..", ".OBBBBO.", "OBBOOBBO", "OBBOOBBO", ".OBBBBO.", "..OOOO.."],
    leg: ["OBBO", "OBBO", "OBBO", ".OBBO", ".OBBO", "..OBBO", "..OBBO", "..OBBO", ".OBBO.", ".OBBO.", "OBBO..", "OBBO..", "OBBO..", "OBOOBO", "OBBBBBO", "OOOOOOO"],
    legB: ["OBBO", "OBBO", ".OBBO", ".OBBO", "..OBBO", "..OBBO", "...OBBO", "...OBBO", "...OBBO", "..OBBO.", "..OBBO.", ".OBBO..", ".OBBO..", "OBOOBO.", "OBBBBBO", "OOOOOOO"],
    arm: ["OBO", "OBO", ".OBO", ".OBO", "..OBBO", "..O.O."],
    tail: ["OBBOBBOBBOBBOBBOBBO", ".OBBBBBBBBBBBBBBBO.", "..OOBBBBBBBBBBBBO..", "....OOBBBBBBBBOO...", "......OOBBBBOO.....", "........OOOO......."]
  };
  const rexPal = { O: '#3a3a2c', B: '#d8cfa8', W: '#f3ead0', K: '#1a2a2c', A: '#f8d784' };
  const raptorPal = { O: '#3f4a36', B: '#c4c9a6', W: '#eaeccb', K: '#1a2a2c', A: '#f8d784' };
  function drawRex(c, x, y, o = {}) {
    const pose = o.pose || 'idle', p = Math.max(0, Math.min(1, o.progress ?? 0)), t = o.time || 0, pal = o.skin === 'raptor' ? raptorPal : rexPal, scale = o.scale || 1;
    const attack = pose === 'attack' ? Math.round(Math.sin(p * Math.PI) * 6) : 0, walk = pose === 'walk' ? Math.round(Math.sin(t * 6)) : 0, bob = pose === 'walk' ? Math.abs(Math.round(Math.sin(t * 6))) : Math.round(Math.sin(t * 1.9));
    c.save(); c.translate(Math.round(x), Math.round(y)); if (o.facing !== -1) c.scale(-1, 1); c.scale(scale, scale);
    c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(-26, -1, 52, 2);
    if (pose === 'dead') { c.translate(0, -2); c.rotate(.9); c.translate(-10, 10); }
    else if (pose === 'dodge') c.translate(6, 2);
    else if (pose === 'hurt') c.translate(3, 0);
    const oy = -40 - bob;
    const B = (rows, dx, dy) => blit(c, rows, dx, oy + dy, pal);
    B(rexParts.tail, 24, 6);
    B(walk > 0 ? rexParts.legB : rexParts.leg, 10, 20);
    B(rexParts.pelvis, 16, 12);
    B(rexParts.spine, -8, 6); B(rexParts.ribs, -6, 9);
    B(walk <= 0 ? rexParts.legB : rexParts.leg, 2, 22);
    B(rexParts.arm, -8, 16);
    B(rexParts.neck, -10, 2 - attack / 2);
    const hx = -30 - attack, hy = -6 + (pose === 'guard' ? -3 : attack / 2);
    B(rexParts.skull, hx, hy); B(pose === 'attack' || o.glow ? rexParts.jawOpen : rexParts.jaw, hx + 1, hy + 10);
    c.restore();
  }

  // ── Humans: one 26 x 40 body, costume layers read from the exhibit's `figure` ─────────
  const human = {
    head: [
      "...OOOOOO...",
      "..OHHHHHHO..",
      ".OHHHHHHHHO.",
      ".OSSSSSSSSO.",
      "OSSSSSSSSSSO",
      "OSSKSSSSKSSO",
      "OSSSSSSSSSSO",
      "OSSSSSNSSSSO",
      ".OSSSSSSSSO.",
      ".OSSSSSSSSO.",
      "..OOOOOOOO..",
    ],
    neck: ["OSSO"],
    hairLong: ["..OOOOOOOO..", ".OHHHHHHHHO.", "OHHHHHHHHHHO", "OHHHHHHHHHHO", "OHHHHHHHHHHO", "OHHHHHHHHHHO", "OHHHHHHHHHHO", "OHHHHHHHHHHO", "OHHHHHHHHHHO", "OHHHHHHHHHHO", "OHHHHHHHHHHO", "OHHHHHHHHHHO", "OHHHHHHHHHHO", "OHHHOOOOHHHO", "OHHO....OHHO", "OHHO....OHHO", ".OO......OO."],
    hairFront: ["OH........HO", "OH........HO", "OH........HO", "OHO......OHO"],
    torso: [
      "..OOOOOOOOOO..",
      ".OCCCCCCCCCCO.",
      "OCCCCCCCCCCCCO",
      "OCCCCCcCCCCCCO",
      "OCCCCCcCCCCCCO",
      "OcCCCCcCCCCCcO",
      "OcCCCCcCCCCCcO",
      ".OccCCcCCCccO.",
      ".OcccccccccO..",
      ".OGGGGGGGGGGO.",
      ".OccccccccccO.",
      "..OOOOOOOOOO..",
    ],
    lapel: [".OLL..LL.", ".OLL..LL.", "..LL..LL.", "..L...L..", ".........", "...GG....", "...GG...."],
    armor: ["..OOOOOOOO..", ".OAAAAAAAAO.", "OAAaAAAAaAAO", "OAAAAaaAAAAO", "OaAAAAAAAAaO", "OaaAAAAAAaaO", ".OaaaAAaaaO.", "..OOOOOOOO.."],
    sash: ["Q.........", ".QQ.......", "..QQ......", "...QQ.....", "....QQ....", ".....QQ...", "......QQ..", ".......QQ.", "........QQ"],
    epaulette: ["EEEE", "EeEe"],
    armband: ["RRRR", "RRRR", "RRRR"],
    armBack: ["OOOO", "OCCO", "OCCO", "OcCO", "OcCO", "OccO", "OSSO", ".OO."],
    armFront: ["OOOOO", "OCCCO", "OCCCO", "OCCCO", "OcCCO", "OccCO", "OSSSO", ".OOO."],
    armBare: ["OOOO", "OSSO", "OSSO", "OSSO", "OSSO", "OSSO", "OSSO", ".OO."],
    armRaised: [".OOO.", "OSSSO", "OccCO", "OcCCO", "OCCCO", "OCCCO", "OCCCO", "OOOOO"],
    armFwd: ["OOOOOOOO.", "OCCCCCcSO", "OCCCCCcSO", "OCCCCccSO", ".OOOOOOO."],
    armRaisedBare: [".OOO.", "OSSSO", "OSSSO", "OSSSO", "OSSSO", "OSSSO", "OSSSO", "OOOOO"],
    armFwdBare: ["OOOOOOOO.", "OSSSSSSSO", "OSSSSSSSO", "OSSSSSSSO", ".OOOOOOO."],
    legA: ["OTTTTO", "OTTTTO", "OTtTTO", "OTtTTO", "OTtTTO", "OTTTTO", "OtTTtO", "OtTTtO"],
    legB: ["OTTTTO", "OTtTTO", "OTtTTO", "OtTTtO", ".OTTO.", "OTTTTO", "OtTTtO", "OtTTtO"],
    legBare: ["OSSSSO", "OSSSSO", "OSsSSO", "OSsSSO", "OSsSSO", "OSSSSO", "OsSSsO", "OsSSsO"],
    boot: ["OBBBBO", "OBBBBO", "ObbbbO", "OOOOOO"],
    sandal: ["OSSSSO", "ODDDDO", "OOOOOO"],
    cloak: ["KKKKKK", "KKKKKKK", "kKKKKKKK", "kKKKKKKK", "kkKKKKKK", "kkKKKKKK", "kkkKKKKK", "kkkKKKKK", "kkkkKKKK", "kkkkKKKK", "kkkkkKKK", "kkkkkKKK", "kkkkkkKK", "kkkkkkKK", "kkkkkkk.", "kkkkkk..", "kkkkk...", "kkkk...."],
    shield: [".OOOOOOO.", "OGPPPPPGO", "OPPPPPPPO", "OPPPGPPPO", "OPPPGPPPO", "OPPPPPPPO", "OPPPPPPPO", ".OPPPPPO.", "..OPPPO..", "...OOO..."],
    hair: { full: ["......", ".HHHH.", "HHHHHH", "HHHHHH", ".HHHH.", "..HH.."], long: ["......", ".HHHH.", "HHHHHH", "HHHHHH", "HHHHHH", ".HHHH.", ".HHHH.", "..HH.."], goatee: ["......", "..HH..", "..HH..", "..HH.."],
      thick: ["HHHHHH"], toothbrush: ["..HH.."], handlebar: ["HHHHHH", "H....H"] },
    hats: {
      peaked: ["..OOOOOOOO..", ".OPPPPPPPPO.", "OPPPPGPPPPPO", "OpppppppppppO", "..OOOOOOOOOOO"],
      bicorne: ["OOOO........OOOO", "OPPPOO....OOPPPO", "OPPPPPOOOOPPPPPO", ".OPPPPPPPPPPPPO.", "..OOGGGGGGGGOO.."],
      corinthian: ["....RRRR....", "...RRRRRRR..", "..OGGGGGGO..", ".OGGGGGGGGO.", "OGGGGGGGGGGO", "OGGGGOOGGGGO", "OGGGOOOOGGGO", "OGGGOSSOGGGO", "OGGGGOOGGGGO", ".OGGGGGGGGO."],
      crown: ["G..G..G..G", "GG.GG.GG.GG", "GGGGGGGGGGG", "GRGGRGGRGGG", "GGGGGGGGGGG"],
      mianguan: ["GGGGGGGGGGGGGG", ".G..G..G..G..G", "..OOOOOOOOOO..", "..OPPPPPPPPO..", "..OPPPPPPPPO.."],
      laurel: ["..LL....LL..", ".LLL....LLL.", "LLL......LLL"],
      horns: ["O..........O", "OO........OO", ".OO......OO.", ".OPO....OPO.", "..OPPOOOOPPO", "..OOPPPPPPO."],
      turban: ["...OOOOOO...", "..OWWWWWWO..", ".OWWRWWWWWO.", "OWWWWWWWWWWO", "OWWWWWWWWWWO", ".OOWWWWWWOO."],
      furhat: ["...OOOOOO...", "..OPPPPPPO..", ".OPPPPPPPPO.", "OpppppppppppO", "OpppppppppppO", ".OOOOOOOOOO."],
      hood: ["....OOOO....", "...OPPPPO...", "..OPPPPPPO..", ".OPPPPPPPPO.", "OPPPPPPPPPPO", "OPPOOOOOOPPO", "OPPO....OPPO", "OPPO....OPPO", "OPPO....OPPO", "OPPO....OPPO"],
      tricorn: ["OOO........OOO", "OPPPOO...OOPPPO", ".OPPPPPOOPPPPO.", "..OPPPPPPPPPO..", "...OGGGGGGGO..."],
      fez: ["..OOOOOO..", ".OPPPPPPO.", ".OPPPPPPO.", ".OPPPPPPO.", "OPPPPPPPPO"],
      cap: ["..OOOOOO..", ".OPPPPPPO.", "OPPPPGPPPPO", "OpppppppppOOO", ".OOOOOOOOOOO."],
      beret: ["....OOOO....", "..OOPPPPOO..", ".OPPPPPPPPO.", "OPPPPPPPPPPO", ".OOOOOOOOOO."],
      fedora: ["...OOOOOO...", "..OWWWWWWO..", "..OWWWWWWO..", ".OOOOOOOOOO.", "OWWWWWWWWWWO", ".OOOOOOOOOO."],
      morion: ["....OO....", "...OMMO...", "..OMMMMO..", ".OMMMMMMO.", "OMMMMMMMMO", ".OOMMMMOO.", "OOOOOOOOOO"],
      helmet: ["....OO....", "....OM....", "...OMMO...", "..OMMMMO..", ".OMMMMMMO.", "OMMMMMMMMO", "OPPPPPPPPO"]
    },
    weapons: {
      spear: { hold: [".OO.", "OMMO", "OMMO", ".OO.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD."], fwd: ["DDDDDDDDDDDDDDDDOMMMMO", "................OMMO.."] },
      sabre: { hold: [".OO.", "OMMO", "OMMO", "OMWO", "OMWO", "OMWO", "OMWO", "OMWO", "OMWO", "OMWO", "OMWO", ".OWO", ".OGO", ".GGG", ".OO."], fwd: ["GGOMWWWWWWWWWWMO", "GG.OMMMMMMMMMMO."] },
      dagger: { hold: ["OMO", "OMO", "OWO", "OWO", "OWO", "OGO", "GGG", "ODO", "ODO"], fwd: ["ODOGGOWWWWMO"] },
      axe: { hold: ["....ODO", "..OOODO", ".OMMMDO", "OWMMMDO", "OMMMMDO", ".OMMMDO", "..OOODO", "....ODO", "....ODO", "....ODO", "....ODO", "....ODO", "....ODO", "....OO."], fwd: ["..........OOOOO.", "OODDDDDDDOOMMMWO", "ODDDDDDDDDOMMMMO", "OO........OMMMMO", "...........OOOO."] },
      staff: { hold: [".GG.", "GGGG", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD.", ".DD."], fwd: ["DDDDDDDDDDDDDDDDDDGG", "..................GG"] },
      pistol: { hold: [".OMO.", ".OWO.", ".OMO.", ".OMO.", "OMMMO", "OMMMO", "ODDO.", "ODDO.", "OOO.."], fwd: ["...OOOOOOOO", "...OMWWWWMO", "OOMMMOOOOOO", "ODDOOO.....", "ODDO.......", "OOO........"] },
      // Gatling: three visible barrels with a muzzle ring, a motor block, a grip and an ammo box feeding a brass belt. Carried level at the hip.
      minigun: (() => { const level = [
        "...........OOOOOOOOOOOOOOOOOOOOOOOO..",
        "......OOOOOMWWMMMWWMMMWWMMMWWMMMWMMOO",
        ".....OGGGGOOOOOOOOOOOOOOOOOOOOOOOOMWO",
        "OOOOOOGaaGOMMMMMMMMMMMMMMMMMMMMMMMMMO",
        "OkkkkOGGGGOOOOOOOOOOOOOOOOOOOOOOOOMWO",
        "OkkkkOGaaGOMWWMMMWWMMMWWMMMWWMMMWMMOO",
        "OkkkkOGGGGOOOOOOOOOOOOOOOOOOOOOOOOO..",
        "OkGGGGGGGO....OOOO...................",
        "OOOOOOOOOO....OGGO...................",
        "..............OOOO..................."]; return { hold: level, fwd: level }; })(),
      rifle: { hold: [".OMO.", ".OWO.", ".OMO.", ".OMO.", ".OMO.", ".OMO.", "OMMMO", "OSMSO", "ODDDO", "ODDDO", "ODDDO", ".ODO.", ".ODO.", ".OO.."], fwd: ["...........OOOOOOOOOOOO", "OOOOOODDDOOMMMMWWWWWWMO", "ODDDDDDDDDSMMMMMMMMMMMO", ".ODDDDOOOOSSOOOOOOOOOO.", "..OOO..OSSO............", ".......OOO............."] },
      bow: { hold: ["..O.", ".OD.", "OD..", "OD..", "OD..", "OD..", ".OD.", "..O.", ".OD.", "OD..", "OD..", "OD..", "OD..", ".OD.", "..O."], fwd: ["OD..........", ".OD.........", "..ODDDDDDOMO", ".OD.........", "OD.........."] }
    }
  };
  function figurePalette(F) {
    const skin = F.skin || '#e2bf9f', coat = F.coat || F.tunic || '#4a4a4a', coatDark = F.coatDark || mix(coat, '#000000', .4), trousers = F.trousers || coat, boots = F.boots || '#1a1a1a';
    return {
      O: '#141216', S: skin, s: mix(skin, '#000000', .25), N: mix(skin, '#000000', .4), K: '#1a1410', H: F.hair || '#2a2118',
      C: coat, c: coatDark, T: trousers, t: mix(trousers, '#000000', .35), B: boots, b: mix(boots, '#ffffff', .2), D: '#5a3a22',
      L: F.lapel || '#e8e4d8', A: F.armor || '#9a9aa0', a: F.armorDark || '#5a5a60', Q: F.sash || '#c0392b', E: F.epaulettes || '#d4af37', e: mix(F.epaulettes || '#d4af37', '#000', .3),
      R: F.armband || F.crest || F.star || '#b3202a', G: '#d4af37', W: F.hatColor === '#e8e2d0' || F.hat === 'turban' ? (F.hatColor || '#f0ead6') : (F.hatColor || '#e8e2d0'),
      P: F.hatColor || coat, p: mix(F.hatColor || coat, '#000000', .3), M: '#c9d6dc', k: mix(F.cloak || '#5a3a1e', '#000', .4), ...(F.cloak ? { K: F.cloak } : {}),
      // shield uses P for its field; override below if a shield colour is given
    };
  }
  function drawFigure(c, x, y, o = {}) {
    const F = o.figure || {}, pose = o.pose || 'idle', p = Math.max(0, Math.min(1, o.progress ?? 0)), t = o.time || 0;
    const pal = figurePalette(F); const flip = o.facing === -1;
    const walk = pose === 'walk' ? Math.round(Math.sin(t * 9)) : 0, bob = pose === 'walk' ? Math.abs(Math.round(Math.sin(t * 9))) : 0;
    const bare = F.legs === 'bare';
    c.save(); c.translate(Math.round(x), Math.round(y)); if (flip) c.scale(-1, 1);
    c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(-9, -1, 18, 2);
    if (pose === 'dead') { c.translate(-6, -4); c.rotate(-Math.PI / 2); c.translate(-14, 2); }
    else if (pose === 'dodge') c.translate(-4, 2); else if (pose === 'hurt') c.translate(-2, 0);
    const oy = -33 - bob;   // boots (legs 22 + 9 rows, boot 30 + 3 rows) end exactly at ground level
    const B = (rows, dx, dy, pl = pal) => rows && blit(c, rows, dx, oy + dy, pl);
    if (F.cloak) B(human.cloak, -11, 9);
    const wp = human.weapons[F.weapon] || human.weapons.sabre, attacking = pose === 'attack';
    // Weapon colours live in their own palette so a weapon's letters (A/B/C…) never recolour the figure's coat or skin.
    const wdef = o.weapon ? window.MuseumWeapons?.get(o.weapon) : null;
    const wpal = { ...pal, ...(wdef?.palette || {}), ...(wdef?.glow ? { L: mix(wdef.palette?.L || '#6ff6ff', '#ffffff', (Math.sin(t * 7) + 1) / 4) } : {}) };
    B(bare ? human.armBare : human.armBack, 4, 12);
    if (attacking) c.translate(lunge(p), 0);
    if (bare) { B(human.legBare, -6, 22); B(human.legBare, 0, 22); B(human.sandal, -6, 30); B(human.sandal, 0, 30); }
    else { B(walk > 0 ? human.legB : human.legA, -6, 22); B(walk < 0 ? human.legB : human.legA, 0, 22); B(human.boot, -6, 30); B(human.boot, 0, 30); }
    B(human.torso, -7, 11);
    if (F.armor) B(human.armor, -6, 12);
    if (F.lapel) B(human.lapel, -4, 12);
    if (F.sash) B(human.sash, -6, 12);
    if (F.epaulettes) { B(human.epaulette, -7, 11); B(human.epaulette, 3, 11); }
    if (F.armband) B(human.armband, 4, 15);
    if (F.hairstyle === 'long') B(human.hairLong, -6, 0);
    B(human.neck, -2, 10);
    B(human.head, -6, 0);
    if (F.hairstyle === 'long') B(human.hairFront, -6, 3);
    if (F.beard) B(human.hair[F.beard], -3, 7); if (F.mustache) B(human.hair[F.mustache], -3, 7);
    if (F.hat && F.hat !== 'none' && human.hats[F.hat]) { const h = human.hats[F.hat]; const w = h[0].length; B(h, -Math.round(w / 2), F.hat === 'corinthian' ? -1 : F.hat === 'hood' ? -2 : F.hat === 'laurel' ? 1 : -(h.length - 4)); }
    if (F.shield) B(human.shield, pose === 'guard' ? 4 : -11, pose === 'guard' ? 10 : 14, { ...pal, P: F.shield, G: mix(F.shield, '#000', .5) });
    if (attacking) swing(B, p, { raised: bare ? human.armRaisedBare : human.armRaised, fwd: bare ? human.armFwdBare : human.armFwd }, wp.hold, wp.fwd, wpal);
    else holdIdle(B, bare ? human.armBare : human.armFront, wp.hold, wpal);
    c.restore();
  }
  // ── Weapon icons: 16 x 16 pixel glyphs per icon key, tinted by rarity ─────
  const I = {
    sword:      ["..........OO....", ".........OWO....", "........OWMO....", ".......OWMO.....", "......OWMO......", ".....OWMO.......", "....OWMO........", "...OWMO.........", "..GGMO..........", ".GGGG...........", "GGOGG...........", "ODO.............", "OD..............", "G...............", "................", "................"],
    shortsword: ["................", "................", "..........OO....", ".........OWO....", "........OWMO....", ".......OWMO.....", "......OWMO......", ".....OWMO.......", "...GGMO.........", "..GGGG..........", ".GGOG...........", "ODO.............", "OD..............", "................", "................", "................"],
    greatsword: ["..............OO", ".............OWO", "............OWMO", "...........OWMO.", "..........OWMO..", ".........OWMO...", "........OWMO....", ".......OWMO.....", "......OWMO......", ".....OWMO.......", "...GGMO.........", "..GGGGG.........", ".GGOGGG.........", "ODO.............", "OD..............", "G..............."],
    curved:     [".........OOO....", ".......OOWWO....", ".....OOWMMO.....", "....OWMMO.......", "...OWMMO........", "...OMMO.........", "..OMMO..........", "..OMO...........", ".GGO............", "GGGG............", "ODO.............", "OD..............", "G...............", "................", "................", "................"],
    rapier:     ["..............OO", ".............OWO", "............OWO.", "...........OWO..", "..........OWO...", ".........OWO....", "........OWO.....", ".......OWO......", "......OWO.......", "....GGGO........", "...G..G.........", "..G.GG..........", ".ODO............", "OD..............", "G...............", "................"],
    dagger:     ["................", "................", "................", "........OO......", ".......OWO......", "......OWMO......", ".....OWMO.......", "....OWMO........", "..GGMO..........", ".GGGG...........", "ODO.............", "OD..............", "G...............", "................", "................", "................"],
    karambit:   ["................", "......OOOO......", ".....OWMMMO.....", "....OWMO.OMO....", "...OWMO...OO....", "...OMO..........", "...OMO..........", "...OMO..........", "....OMO.........", ".....OGGO.......", "......ODDO......", "......ODDO......", ".......OGO......", "........OO......", "................", "................"],
    kukri:      ["................", "................", "...........OO...", "..........OWO...", ".........OWMO...", "........OWMMO...", ".......OWMMMO...", "......OWMMMO....", ".....OWMMO......", "....OMMO........", "...GGO..........", "..ODD...........", ".ODD............", "OD..............", "................", "................"],
    machete:    ["................", "..........OOO...", ".........OWMO...", "........OWMMO...", ".......OWMMO....", "......OWMMO.....", ".....OWMMO......", "....OWMMO.......", "...OMMMO........", "..GGMO..........", ".ODD............", "ODD.............", "D...............", "................", "................", "................"],
    axe:        ["................", ".....OOOO.......", "....OWMMMO......", "...OWMMMMMO.....", "...OMMMMMMMO....", "....OMMMMMDO....", ".....OOOMDDO....", "........ODDO....", ".......ODDO.....", "......ODDO......", ".....ODDO.......", "....ODDO........", "...ODDO.........", "..ODDO..........", ".ODDO...........", ".OOO............"],
    doubleaxe:  ["................", "..OO.......OO...", ".OMMO.....OMMO..", "OMMMMO...OMMMMO.", "OWMMMMOOOMMMMWO.", "OMMMMMODDMMMMMO.", ".OMMMODDDOMMMO..", "..OMMODDOMMO....", "...OOODDOOO.....", "......ODDO......", "......ODDO......", "......ODDO......", "......ODDO......", "......ODDO......", "......OOOO......", "................"],
    poleaxe:    ["................", ".........OOO....", "........OMMMO...", ".......OMMMMO...", ".......OMMMMO...", ".......ODMMO....", "......ODDOO.....", ".....ODD........", "....ODD.........", "...ODD..........", "..ODD...........", ".ODD............", "ODD.............", "OO..............", "................", "................"],
    hammer:     ["................", "........OOOOO...", ".......OWMMMMO..", "......OMMSSSMMO.", ".....OMMSSSMMMO.", "....OOMMSSSMMO..", "...OMOOOMMMOO...", "..OMO..ODDO.....", "..OO..ODDO......", ".....ODDO.......", "....ODDO........", "...ODDO.........", "..ODDO..........", ".ODDO...........", ".OOO............", "................"],
    mace:       ["................", "..........OOO...", ".........OMMMO..", "........OMSMSMO.", "........OWMMMMO.", "........OSMSMSO.", ".........OMMMO..", ".......OOODDO...", "......ODDO......", ".....ODDO.......", "....ODDO........", "...ODDO.........", "..ODDO..........", ".ODDO...........", ".OOO............", "................"],
    flail:      ["................", "...........OOO..", "..........OMSMO.", "..........OSWSO.", "..........OMSMO.", "...........OOO..", ".........OSO....", "........OSO.....", ".......OSO......", "......ODDO......", ".....ODDO.......", "....ODDO........", "...ODDO.........", "..ODDO..........", ".ODDO...........", ".OOO............"],
    club:       ["................", "........OOO.....", ".......ODDDO....", ".......ODDDO....", "......ODDDDO....", "......ODDDO.....", ".....ODDDO......", ".....ODDO.......", "....ODDO........", "....ODD.........", "...ODD..........", "...ODD..........", "..ODD...........", "..OO............", "................", "................"],
    spear:      ["..............OO", ".............OMO", "............OMMO", "...........OMMO.", "..........ODDO..", ".........ODD....", "........ODD.....", ".......ODD......", "......ODD.......", ".....ODD........", "....ODD.........", "...ODD..........", "..ODD...........", ".ODD............", "ODD.............", "OO.............."],
    pike:       ["...............O", "..............OM", ".............OMO", "............ODD.", "...........ODD..", "..........ODD...", ".........ODD....", "........ODD.....", ".......ODD......", "......ODD.......", ".....ODD........", "....ODD.........", "...ODD..........", "..ODD...........", ".ODD............", "OO.............."],
    trident:    ["...........O.O.O", "..........OMOMOM", "...........OMMMO", "............OMO.", "...........ODD..", "..........ODD...", ".........ODD....", "........ODD.....", ".......ODD......", "......ODD.......", ".....ODD........", "....ODD.........", "...ODD..........", "..ODD...........", ".ODD............", "OO.............."],
    halberd:    ["..............OO", ".............OMO", "...........OOMMO", "..........OMMMMO", "..........OMMMO.", "...........OOO..", "..........ODD...", ".........ODD....", "........ODD.....", ".......ODD......", "......ODD.......", ".....ODD........", "....ODD.........", "...ODD..........", "..ODD...........", ".OO............."],
    bow:        ["......OOOO......", ".....ODDDDO.....", "....ODD..ODO....", "...ODD....OD....", "...OD.....OD....", "...OD.....OD....", "...OD.....OD....", "...OD.....OD....", "...OD.....OD....", "...ODD....OD....", "....ODD..OD.....", ".....ODDDDO.....", "......OOOO......", "................", "................", "................"],
    crossbow:   ["O..............O", "OWWWWWWWWWWWWWWO", "ODO..........ODO", ".ODO........ODO.", "..ODDO....ODDO..", "...OODDOODDOO...", ".....OODMOO.....", ".......OMO......", ".......OMO......", ".......ODO......", "......ODDDO.....", "......ODSDO.....", "......ODDDO.....", "......ODDDO.....", ".......OOO......", "................"],
    sling:      ["................", "......OOOO......", ".....ODDDDO.....", ".....ODMMDO.....", ".....ODDDDO.....", "......ODDO......", ".....OD..DO.....", ".....OD..DO.....", "....OD....DO....", "....OD....DO....", "...OD......DO...", "...OD......DO...", "..OO........OO..", "................", "................", "................"],
    revolver: ["........................", "........................", "....OOOOOOOOOOOOOOOOOOO.", "...OMMMMMMMWWWWWWWWWWWMO", "..OSMSSSMMMMMMMMMMMMMMMO", "..OSMSOSMOOOOOOOOOOOOOO.", "..OMSSSMO...............", "..OOMMMOOO..............", "..ODDDO.OSO.............", ".ODDDO...O..............", ".ODDDO..................", "ODDDO...................", "OOOO....................", "........................"],
    pistol: ["........................", "........................", "........................", "...OOOOOOOOOOOOOOOOOOOO.", "..OSMMWWWWWWWWWWWWWWWMO.", "..OSMMMMMMMMMMMMMMMMMMMO", "..OSSSSMMMMOOOOOOOOOOOO.", "..OSSSSSOOO.............", "..ODDDDO.OSO............", ".ODDDDO...O.............", ".ODDDO..................", "ODDDDO..................", "OOOOO...................", "........................"],
    flintlock: ["........................", "......OO................", ".....OGGO...............", ".....OGGOOOOOOOOOOOOOOO.", "....OGGOMMWWWWWWWWWWWWMO", "...ODDDOMMMMMMMMMMMMMMMO", "..ODDDDDOOOOOOOOOOOOOOO.", ".ODDDDOOO...............", ".ODDDO.OSO..............", "ODDDDO..O...............", "ODDDO...................", "ODDO....................", ".OO.....................", "........................"],
    musket: ["........................", "........................", ".........OOOOOOOOOOOOOO.", "........OMMMMMWWWWWWWWMO", ".OOOOOOOODDDDGDDDGDDMMMO", "ODDDDDDDDDDDDGDDDGDDOOO.", "ODDDDDDDDDDOOOOOOOOOO...", "ODDDDDDDOOO.OSO.........", ".ODDDDDO....OOO.........", "..ODDDO.................", "...OOO..................", "........................", "........................", "........................"],
    rifle: ["........................", "........................", "...........OOGOOOOOOOOO.", "........OOOOMSMMMWWWWWMO", ".OOOOOOODDDDOMSMMMMMMMMO", "ODDDDDDDDDDDDOOMMMMMOOO.", "ODDDDDDDDDDDDDDOOOOO....", "ODDDDDDOOOOSSOOOSO......", ".ODDDDO...OSSO.OO.......", "..OOOO....OOOO..........", "........................", "........................", "........................", "........................"],
    smg: ["........................", "........................", ".......OOOOOOOOOOOOOOOO.", "OOOOOOOSMMMMMMMWWWWWWWMO", "ODDDDDOSMMMMMMMMMMMMMMMO", "ODDDDDOSSSSSSMMOOOOOOOO.", ".ODDDDOSSOOOSSO...OSO...", "..ODDDOSSOOOOOO...OOO...", "...ODDOOOOGGOO..........", "....OOO..OGGGGO.........", ".........OGGGGO.........", "..........OGGO..........", "...........OO...........", "........................"],
    shotgun: ["........................", "........................", "........................", "..........OOOOOOOOOOOOO.", ".OOOOOOOOOMMMMMMWWWWWWMO", "ODDDDDDDDGMMMMMMMMMMMMMO", "ODDDDDDDDGSSSSSSSSSSSSSO", "ODDDDDDOOOOOOOOOOOOOOOO.", ".ODDDDO..OSO............", "..OOOO...OOO............", "........................", "........................", "........................", "........................"],
    sniper: ["........................", ".........OOOOOO.........", "........OSMMMMSO........", ".........OOOOOOOOOOOOOO.", ".OOOOOOOOSMMMMMMWWWWWWMO", "OSSSSSSOSSMMMMMMMMMMMMMO", "OSSOOOSSSSSSSSMOOOOOOOO.", "OSSO..OSSOOOSSO..OSO....", "OOO...OOO..OOO..OSO.....", "...............OSO......", "...............OO.......", "........................", "........................", "........................"],
    modern: ["........................", "........................", "...OOOOOOOOOOOOOOOOOOOO.", "..OMMMMWWWWWWWWWWWWWWMMO", "..OMMSMMMMMMMMMMMMMMMMMO", "..OSSSSSMMMMMOOOOOOOOOO.", "..OSSSSSSOOOO...........", "..OSSSSSO.OSO...........", "..OSSSSO..O.............", "..OSSSSO................", ".OSSSSO.................", ".OSSSSO.................", ".OOOOO..................", "........................"],
    mp: ["........................", "........................", "........OOOOOOOOOOOOOOO.", "OOOOOOOOSMMMMMMMWWWWWWMO", "OM....OSSMMMMMMMMMMMMMMO", "OM....OSSSSSSSMMOOOOOOO.", "OMOOOOOSSOOOOSSO..OSO...", "OOO....OSO..OSSO..OOO...", ".......OO...OSSO........", "............OSSO........", "............OSSO........", "............OSSO........", ".............OO.........", "........................"],
    bolt: ["........................", "........................", "...........OOGOOOOOOOOO.", "........OOOOMSMMMWWWWWMO", ".OOOOOOODDDDOMSMMMMMMMMO", "ODDDDDDDDDDDDOOMMMMMOOO.", "ODDDDDDDDDDDDDDOOOOO....", "ODDDDDDOOOOSSOOOSO......", ".ODDDDO...OSSO.OO.......", "..OOOO....OOOO..........", "........................", "........................", "........................", "........................"],
    lever: ["........................", "........................", "..........OOOOOOOOOOOOO.", ".........OMMMMMMWWWWWWMO", ".OOOOOOOOOMGGMMMMMMMMMMO", "ODDDDDDDDOMGGMOMMMMMMMMO", "ODDDDDDDDDDOOOOOOOOOOOO.", "ODDDDDDDOOOOGGO.........", ".ODDDDO...OGOOGO........", "..OOOO....OGGGGO........", "...........OOOO.........", "........................", "........................", "........................"],
    garand: ["........................", "........................", "...........OOOOOOOOOOOO.", "........OOOMSMMMWWWWWWMO", ".OOOOOOODDDDMMMMDDDDDMMO", "ODDDDDDDDDDDDOOOODDDDOO.", "ODDDDDDDDDDDDDDOOOOOOO..", "ODDDDDDOOOOOOSO.........", ".ODDDDO.....OO..........", "..OOOO..................", "........................", "........................", "........................", "........................"],
    assault: ["........................", "........................", "..........OOOOOOOOOOOOO.", ".OOOOOOOOOSMMMMMWWWWWWMO", "ODDDDDDOOSSMMMMDDDDMMMMO", "ODDDDDOSSSSSSSSDDDDOOOO.", ".OOOOOOSSOOOOSSOOOOO....", "......OSSO.OSMMO........", "......OSSO..OSMMO.......", "......OOO....OSMMO......", "..............OOOO......", "........................", "........................", "........................"],
    pump: ["........................", "........................", "..........OOOOOOOOOOOOO.", ".OOOOOOOOOMMMMMWWWWWWWMO", "ODDDDDDDOOMMMMDDDDDDMMMO", "ODDDDDDOSSSSSSDDDDDDOOO.", ".OOOOOOOSSOOOOOOOOOOO...", "......OSSO.OSO..........", "......OOO..OOO..........", "........................", "........................", "........................", "........................", "........................"],
    blunderbuss: ["........................", "........................", "...................OOO..", "..........OOOOOOOOOGGGO.", "......OOOOMMMWWWWWWGGGGO", ".OOOOODDDDMMMMMMMMMGGGGO", "ODDDDDDDDDDOOOOOOOOGGGO.", "ODDDDDDDDOOOOSO....OOO..", "ODDDDDOOO...OO..........", ".OOOOO..................", "........................", "........................", "........................", "........................"]
  };
  const rarityTint = { basic: '#c9d6dc', common: '#c9d6dc', rare: '#90cce8', epic: '#c4a1f0', legendary: '#f0ca72', mythic: '#7ff0e0' };
  // Finish overlay: per-pixel colours from MuseumFinishes (sparkles, veins, holographic bands) on top of the recoloured sprite.
  function finishPass(c, rows, x, y, finish, time) {
    const F = window.MuseumFinishes; if (!F || !finish) return;
    for (let r = 0; r < rows.length; r++) for (let i = 0; i < rows[r].length; i++) { const col = F.overlay(finish, rows[r][i], i, r, time); if (col) px(c, x + i, y + r, col); }
  }
  function drawWeaponIcon(c, weapon, x, y, scale = 1, o = {}) {
    const rows = I[weapon?.icon] || I.sword, tint = rarityTint[weapon?.rarity] || '#c9d6dc';
    const fin = o.finish ? window.MuseumFinishes?.palette(o.finish, o.time || 0) : null;
    const pal = { O: '#141216', M: mix(tint, '#5a6a70', .35), W: mix(tint, '#ffffff', .5), S: mix(tint, '#101418', .5), D: '#8a6a42', G: '#d4af37', ...(weapon?.palette || {}), ...(weapon?.glow ? { L: mix(weapon.palette?.L || '#6ff6ff', '#ffffff', (Math.sin((o.time || 0) * 7) + 1) / 4) } : {}), ...(fin || {}) };
    const w = rows[0].length, h = rows.length, s = w > 16 ? Math.max(1, Math.floor(scale * 16 / w)) : scale;   // wide gun glyphs shrink to an integer factor
    const ox = Math.round((16 * scale - w * s) / 2), oy = Math.round((16 * scale - h * s) / 2);                  // ...and sit centred in the 16-unit box callers expect
    c.save(); c.translate(x + ox, y + oy); c.scale(s, s); blit(c, rows, 0, 0, pal); if (fin) finishPass(c, rows, 0, 0, o.finish, o.time || 0); c.restore();
  }
  // ── Trophies: 37 unique 16 x 16 sprites on a pixel pedestal (A main colour of the trophy, B dark, C light) ──
  const trophySprites = {
    'raptor': ["................", "..........OOO...", ".........OAACO..", "........OAACO...", ".......OAACO....", "......OAACO.....", ".....OAACO......", "....OAACO.......", "....OAAO........", "...OAAO.........", "...OBAO.........", "..OBBO..........", "..OBO...........", ".OBO............", ".OO.............", "................"],
    'rex': ["................", ".......OO.......", "......OCCO......", "......OCAO......", ".....OCAAO......", ".....OCAAAO.....", ".....OCAAAO.....", "....OCAAAAO.....", "....OCAAAABO....", "....OAAAAABO....", "...OAAAAAABO....", "...OAAAABBBO....", "..OBBBBBBBBO....", "..OOOOOOOOOO....", "................", "................"],
    'leonidas': ["................", "....OOOOOOO.....", "...OCRRRRRCO....", "..OCRRRRRRRCO...", "..ORRRRRRRRRO...", "..OBRRRRRRRBO...", "..OOOBRRRBOOO...", ".OGGGGBRBGGGGO..", ".OGGGGGOGGGGGO..", ".OGGGGGGGGGGGO..", ".OGGGOOOOOGGGO..", ".OGGO.....OGGO..", ".OGGO.....OGGO..", ".OOOO.....OOOO..", "................", "................"],
    'hitler': ["................", "....OOOO........", "...OAAAAO.......", "..OAOOOOAO......", "..OAO..OAO......", "..OAOOOOAO......", "...OAAAAO.......", "....OAAO........", "....OAAO........", "....OAAO........", "....OAAO........", "....OAAOOO......", "....OAAAAO......", "....OAAOOO......", "....OOO.........", "................"],
    'stalin': ["................", ".........CC.....", "........C..C....", ".........CC.....", "................", "..OOOOOOOOOO....", ".OBBBBBBBBBBO...", ".OOOOOOOOOBBO...", ".........OBBO...", "........OBBBBO..", ".......OBBBBBBO.", ".......OBKKKBBO.", ".......OBBKKBBO.", "........OBBBBO..", ".........OOOO...", "................"],
    'beelzebub': ["................", "..........OOO...", ".........OCAO...", "........OCAAO...", ".......OCAAO....", ".......OAAAO....", "......OAAAO.....", "......OAAAO.....", ".....OAAAO......", ".....OAABO......", "....OAABBO......", "....OABBBO......", "...OBBBBBO......", "...OBBBBO.......", "....OOOO........", "................"],
    'xerxes': ["................", ".......OO.......", "......OCCO......", "...OO.OGGO.OO...", "..OCCOOGGOOCCO..", "..OGGGOGGOGGGO..", "..OGGGGGGGGGGO..", "..OGRGGGWGGRGO..", "..OGGGGGGGGGGO..", "..OGGGGGGGGGGO..", "..OBGGGGGGGGBO..", "...OBBBBBBBBO...", "....OOOOOOOO....", "................", "................", "................"],
    'qin': ["................", ".....OOOOOO.....", "....OAAAAAAO....", "....OACCCCAO....", "....OACBCBAO....", "....OACCCCAO....", ".....OCBBCO.....", "......OCCO......", "....OOOAAOOO....", "...OAAAAAAAAO...", "...OABAAAABAO...", "...OABAAAABAO...", "...OABAAAABAO...", "...OBBBBBBBBO...", "....OOOOOOOO....", "................"],
    'herod': ["................", ".....OOOOOO.....", "....OGGGGGGO....", "...OGGGGGGGGO...", "..OGGGGWGGGGGO..", "..OGGGWWWGGGGO..", "..OGWWWWWWWGGO..", "..OGGGWWWGGGGO..", "..OGGWWGWWGGGO..", "..OGGGGWGGGGGO..", "...OGGGGGGGGO...", "....OBBBBBBO....", ".....OOOOOO.....", "................", "................", "................"],
    'caligula': ["................", "....OOOOOOOO....", "...OMMMMMMMMO...", "..OMMOOOOOOMMO..", "..OMO......OMO..", ".OMMO......OMMO.", ".OMBO......OBMO.", ".OMBO......OBMO.", ".OMBO......OBMO.", ".OMBO......OBMO.", ".OMKO......OKMO.", ".OMBO......OBMO.", ".OBBO......OBBO.", ".OOOO......OOOO.", "................", "................"],
    'nero': ["................", "...OO......OO...", "..OGGO....OGGO..", "..OGGO....OGGO..", "..OGOWOOOOWOGO..", "..OGOWOWWOWOGO..", "..OGOWOWWOWOGO..", "..OGOWOWWOWOGO..", "..OGOWOWWOWOGO..", "..OGGOOOOOOGGO..", "...OGGGGGGGGO...", "....OGGGGGGO....", ".....OBBBBO.....", "......OOOO......", "................", "................"],
    'commodus': ["................", "......RRRR......", ".....RRRRRR.....", "....OOOOOOOO....", "...OCAAAAAACO...", "..OAAAAAAAAAAO..", "..OAAAAAAAAAAO..", "..OAAOOOOOOAAO..", "..OAOAKOOKAOAO..", "..OAOAOOOOAOAO..", "..OAOAAOOAAOAO..", "..OBOBBOOBBOBO..", "..OBOOOOOOOOBO..", "...OOO....OOO...", "................", "................"],
    'attila': ["................", "......OOOO......", ".....OAAAAO.....", "....OAOOOOAO....", "...OAO....OAO...", "...OAO.OO.OAO...", "...OAO.OAOAAO...", "...OAOOAAAAO....", "....OAAAAAO.....", ".....OOOOAO.....", "........OAO.....", ".........OAO....", ".........OBO....", "..........OBO...", "..........OO....", "................"],
    'genghis': ["................", "....OOO.........", "...OGGGO........", "...OGOOGO.......", "...OGO.OGO......", "...OGO..OGO.....", "...OGO...OGO....", "...OGO....OGO...", "...OGO....OGO...", "...OGO...OGO....", "...OGO..OGO.....", "...OGO.OGO......", "...OGOOGO.......", "...OGGGO........", "....OOO.........", "................"],
    'timur': ["................", ".......OO.......", "....OOOOCOOO....", "...OWWWWWWWWO...", "..OWWWCWWWWWWO..", ".OWWWWWWWRWWWWO.", ".OWWCWWWWWWWWWO.", ".OWWWWWWWCWWWWO.", ".OWWWWCWWWWWWWO.", ".OWWWWWWWWWCWWO.", "..OWWWWWWWWWWO..", "...OBBBBBBBBO...", "....OOOOOOOO....", "................", "................", "................"],
    'vlad': ["................", ".......OO.......", "......ORRO......", "......ORRO......", ".....OSSSSO.....", ".....OSDDSO.....", ".....OSDDSO.....", ".....OSDDSO.....", ".....OSDDSO.....", ".....OSDDSO.....", ".....OSDDSO.....", ".....OSDDSO.....", "....OSSDDSSO....", "....OOOOOOOO....", "................", "................"],
    'torquemada': ["................", ".......OO.......", "......OKKO......", "......OKKO......", ".....OKKKKO.....", ".....OKKKKO.....", "....OKKKKKKO....", "....OKKKKKKO....", "...OKKWWWWKKO...", "...OKKWOOWKKO...", "...OKKWWWWKKO...", "..OKKKKKKKKKKO..", "..OKKKKKKKKKKO..", "..OOOOOOOOOOOO..", "................", "................"],
    'cortes': ["................", ".......OO.......", "......OMMO......", "......OMMO......", ".....OMMMMO.....", "....OMMMMMMO....", "...OMMMMMMMMO...", "...OMMMMMMMMO...", "...OMMMMMMMMO...", "..OOOMMMMMMOOO..", ".OMMMOOOOOOMMMO.", ".OMMMMMMMMMMMMO.", "..OOOOOOOOOOOO..", "................", "................", "................"],
    'pizarro': ["................", "................", "................", "......OOOOOOOO..", ".....OCCCCCCCGO.", "....OCGGGGGGGGO.", "...OCGGGGGGGGBO.", "..OCGGGGGGGGBBO.", "..OGGGGGGGGGBO..", "..OGGGGGGGGBBO..", "..OBGGGGGGGBO...", "..OBBBBBBBBBO...", "..OOOOOOOOOO....", "................", "................", "................"],
    'ivan': ["................", "......OOOO......", ".....OGGGGO.....", ".....OGOOGO.....", ".....OGGGGO.....", "......ODDO......", "......ODDO......", "......ODDO......", "......ODDO......", "......ODDO......", "......ODDO......", "......OMMO......", "......OMMO......", ".....OMMMMO.....", "......OOOO......", "................"],
    'bathory': ["................", ".....OOOOOO.....", "....OGGGGGGO....", "...OGCCCCCCGO...", "..OGCWCCCCCCGO..", "..OGCCWCCCCCGO..", "..OGCCCWCCCCGO..", "..OGCCCCWCCCGO..", "..OGCCCCCWCCGO..", "...OGCCCCCCGO...", "....OGGGGGGO....", ".....OOGGOO.....", ".......OGO......", "......OGGGO.....", "......OOOOO.....", "................"],
    'blackbeard': ["................", ".......OO.......", "......OKKO......", ".....OKKKKO.....", "....OKKWWKKO....", "...OKKWOWOWKKO..", "..OKKKWWWWKKKO..", ".OKKKKKWWKKKKKO.", ".OKKKKKKKKKKKKO.", ".OOKKKKKKKKKKOO.", "..OOOKKKKKKOOO..", ".....OOOOOO.....", "................", "................", "................", "................"],
    'robespierre': ["................", ".....OOOOOO.....", "....ORRRRRRO....", "...ORRWWWWRRO...", "..ORRWWBBWWRRO..", "..ORWWBBBBWWRO..", "..ORWWBBBBWWRO..", "..ORRWWBBWWRRO..", "...ORRWWWWRRO...", "....ORRRRRRO....", ".....OOOOOO.....", ".....ORO.ORO....", "....ORO...ORO...", "....OO.....OO...", "................", "................"],
    'napoleon': ["................", "................", "...OO......OO...", "..OAAO....OAAO..", ".OAAAAO..OAAAAO.", ".OAAAAAOOAAAAAO.", ".OAAAAAAAAAAAAO.", ".OAAAAGGGGAAAAO.", "..OAAAGWWGAAAO..", "..OAAAAGGAAAAO..", "...OAAAAAAAAO...", "....OBBBBBBO....", ".....OOOOOO.....", "................", "................", "................"],
    'leopold': ["................", "..O....OO....O..", ".OGO..OGGO..OGO.", ".OGGO.OGGO.OGGO.", ".OGGGOOGGOOGGGO.", ".OGGGGGGGGGGGGO.", ".OGGRGGGGGGRGGO.", ".OGGGGGGWGGGGGO.", ".OGGGGGGGGGGGGO.", ".OGGGGGGGGGGGGO.", ".OBBBBBBBBBBBBO.", "..OOOOOOOOOOOO..", "................", "................", "................", "................"],
    'rasputin': ["................", "......OOOO......", "......OMMO......", "....OOOMMOOO....", "....OMMMMMMO....", "....OOOMMOOO....", "..OOOOOMMOOOOO..", "..OMMMMMMMMMMO..", "..OOOOOMMOOOOO..", "......OMMO......", "....OOOMMOOO....", "...OMMOMMOMMO...", "....OOOMMOOO....", "......OMMO......", "......OOOO......", "................"],
    'capone': ["................", "................", ".....OOOOOO.....", "....OWWWWWWO....", "...OWWWWWWWWO...", "...OWWWWWWWWO...", "...OKKKKKKKKO...", "...OKKKKKKKKO...", ".OOOWWWWWWWWOOO.", "OWWWWWWWWWWWWWWO", "OWWWWWWWWWWWWWWO", ".OOOOOOOOOOOOOO.", "................", "................", "................", "................"],
    'mussolini': ["................", "..........OO....", ".........OGGO...", ".....OOOOOGO....", "....OKKKKKKO....", "....OKKKKKKO....", "....OKKKKKKO....", "....OKKKKKKO....", "....OKKKKKKO....", "....OKKKKKKO....", "...OKKKKKKKKO...", "...OKKKKKKKKO...", "...OOOOOOOOOO...", "................", "................", "................"],
    'tojo': ["................", "..............O.", ".............OWO", "............OWMO", "...........OWMO.", "..........OWMO..", ".........OWMO...", "........OWMO....", ".......OWMO.....", "......OWMO......", ".....OGGO.......", "....OKKO........", "...OKKO.........", "..OKKO..........", "..OOO...........", "................"],
    'mao': ["................", "....OOOOOOOO....", "...ORRRRRRRRO...", "...ORRRRRRRRO...", "...ORRGGGGRRO...", "...ORRGWWGRRO...", "...ORRGWWGRRO...", "...ORRGGGGRRO...", "...ORRRRRRRRO...", "...ORRRRRRRRO...", "...ORRRRRRRRO...", "...OBBBBBBBBO...", "....OOOOOOOO....", "................", "................", "................"],
    'amin': ["................", "..OOO..OOO..OOO.", "..ORRO.ORRO.ORRO", "..ORRO.ORRO.ORRO", "..OGGO.OGGO.OGGO", ".OGGGGOGGGGOGGGG", ".OGWGGOGWGGOGWGG", ".OGGGGOGGGGOGGGG", "..OGGO.OGGO.OGGO", "...OO...OO...OO.", "................", "................", "................", "................", "................", "................"],
    'polpot': ["................", "..OOOOOOOOOOOO..", ".OKKWKKWKKWKKKO.", ".OKWKKWKKWKKWKO.", ".OKKWKKWKKWKKKO.", ".OKWKKWKKWKKWKO.", "..OKKWKKWKKWKO..", "...OKWKKWKKWO...", "....OKKWKKWO....", ".....OKWKKO.....", "......OKKO......", ".......OO.......", "................", "................", "................", "................"],
    'ceausescu': ["................", "......OOOO......", ".....OMMMMO.....", ".....OMBMBO.....", ".....OBMBMO.....", ".....OMBMBO.....", ".....OBMBMO.....", "......OMMO......", ".......OO.......", "......OBBO......", "......OBBO......", "......OBBO......", ".....OBBBBO.....", "....OBBBBBBO....", "....OOOOOOOO....", "................"],
    'saddam': ["................", "................", "......OOOOO.....", "....OOKKKKKOO...", "..OOKKKKKKKKKOO.", ".OKKKKKKKKKKKKKO", ".OKKKKKKKKKKKKKO", ".OKKKKKKKKKKKKKO", "..OKKKKKKKKKKKO.", "...OOOOOOOOOOO..", "...OGGGGGGGGGO..", "....OOOOOOOOO...", "................", "................", "................", "................"],
    'escobar': ["................", "................", "................", "...OOOOOOOOOO...", "..OCAAAAAAAACO..", "..OAAAAAAAAAAO..", "..OAAAAAAAAAAO..", "..OBAAAAAAAABO..", "..OBBAAAAAABBO..", "...OBBBBBBBBO...", "....OOOOOOOO....", "................", "................", "................", "................", "................"],
    'binladen': ["................", "................", "......OOOO......", "....OOCCCAOO....", "...OCCCAAAAAO...", "..OCCAAAAAAAAO..", "..OCAAAAAAAABO..", ".OAAAAAAAAAABBO.", ".OAAAAAAAABBBBO.", ".OBAAAAAABBBBBO.", "..OBBBBBBBBBBO..", "...OOOOOOOOOO...", "................", "................", "................", "................"],
    'gaddafi': ["................", "................", "...OOOOOOOOOOOO.", "..OGGGGGGGGGGGGO", "..OGGGGGGGGGGGGO", "..OGGGGGGOOOOOO.", "..OGGGGGGO......", "..OGGGOGGGO.....", "..OGGGO.OGO.....", "...OGGO..O......", "...OGGO.........", "...OGGO.........", "...OOOO.........", "................", "................", "................"],
  };
  const trophyPedestal = ["....OOOOOOOOOOOO....", "...OPPPPPPPPPPPPO...", "..OPpPPPPPPPPPPpPO..", ".OppppppppppppppppO.", "OOOOOOOOOOOOOOOOOOOO"];
  const trophyUnknown = ["................", ".....OOOOOO.....", "....OBBBBBBO....", "...OBBOOOOBBO...", "...OBBO..OBBO...", "....OOO.OBBO....", "......OBBBO.....", ".....OBBBO......", ".....OBBO.......", ".....OBBO.......", ".....OOOO.......", "................", ".....OOOO.......", ".....OBBO.......", ".....OOOO.......", "................"];
  function trophyPalette(trophy) {
    const col = trophy?.color || '#c9b37a';
    return { O: '#141216', A: col, B: mix(col, '#000000', .45), C: mix(col, '#ffffff', .45), G: '#d4af37', W: '#f4f1e8', K: '#23232a', R: '#b3202a', M: '#c9d6dc', S: '#8a6a42', D: '#5a3a22', P: '#3b2a3a', p: '#6a4a6a' };
  }
  // Draws the trophy sprite centred over a pedestal; x is the centre, y the pedestal's bottom edge. locked: a grey question mark.
  function drawTrophy(c, trophy, x, y, scale = 1, o = {}) {
    const key = String(trophy?.id || '').replace(/^trophy-/, ''), rows = o.locked ? trophyUnknown : trophySprites[key] || trophyUnknown;
    const pal = o.locked ? { O: '#141216', B: '#555555', P: '#2a2228', p: '#3a3038' } : trophyPalette(trophy);
    c.save(); c.translate(x, y); c.scale(scale, scale);
    blit(c, trophyPedestal, -10, -5, pal);
    // soft glow behind the sprite in the trophy colour
    if (!o.locked) { c.fillStyle = mix(trophy?.color || '#c9b37a', '#000000', .7); c.globalAlpha = .35; c.fillRect(-7, -21, 14, 16); c.globalAlpha = 1; }
    blit(c, rows, -8, -22, pal);
    c.restore();
  }
  // ── Crates, cards and the private hall in pixels ─────────────────────────
  const crateGlyphPal = {};
  const glyphCanvas = document.createElement('canvas'); glyphCanvas.width = glyphCanvas.height = 16;
  function pixelGlyph(c, text, color, x, y, sc) {
    const g = glyphCanvas.getContext('2d'); g.clearRect(0, 0, 16, 16); g.fillStyle = color; g.font = '11px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 8, 9);
    c.imageSmoothingEnabled = false; c.drawImage(glyphCanvas, 0, 0, 16, 16, x - 8 * sc, y - 8 * sc, 16 * sc, 16 * sc);
  }
  // Crate showcase: a Kenney chest on a stone plinth, tinted with the crate colour, with the crate glyph as a pixel badge.
  function drawCrate(c, crate, w, h, o = {}) {
    const col = crate?.color || '#c9b37a', fam = crate?.family || 'classic';
    const chest = fam === 'weapons' ? [7, 7] : fam === 'cards' ? [8, 7] : fam === 'mixed' ? [6, 7] : [5, 7];
    const sc = Math.max(1, Math.floor(Math.min(w, h) / 30));
    const cx = Math.round(w / 2), cy = Math.round(h / 2);
    c.clearRect(0, 0, w, h); c.imageSmoothingEnabled = false;
    c.fillStyle = mix(col, '#000000', .8); c.fillRect(0, 0, w, h);
    for (let yy = 0; yy < h; yy += 8 * sc) for (let xx = (yy / (8 * sc)) % 2 ? -8 * sc : 0; xx < w; xx += 16 * sc) px(c, xx + sc, yy + sc, mix(col, '#000000', .72), 14 * sc, 6 * sc);
    const g = c.createRadialGradient(cx, cy, 2, cx, cy, Math.max(w, h) / 2); g.addColorStop(0, mix(col, '#000000', .3)); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    tile(c, 2, 3, cx - 16 * sc, cy + 6 * sc, 16 * sc, 16 * sc); tile(c, 2, 3, cx, cy + 6 * sc, 16 * sc, 16 * sc);
    c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(cx - 16 * sc, cy + 6 * sc, 32 * sc, 16 * sc); px(c, cx - 16 * sc, cy + 6 * sc, mix(col, '#000000', .5), 32 * sc, sc);
    px(c, cx - 10 * sc, cy + 7 * sc, 'rgba(0,0,0,.5)', 20 * sc, 2 * sc);
    tile(c, chest[0], chest[1], cx - 8 * sc, cy - 10 * sc, 16 * sc, 16 * sc);
    c.globalAlpha = .3; c.fillStyle = col; c.fillRect(cx - 8 * sc, cy - 10 * sc, 16 * sc, 16 * sc); c.globalAlpha = 1;
    px(c, cx - 7 * sc, cy - 13 * sc, '#1a1612', 14 * sc, 3 * sc); px(c, cx - 6 * sc, cy - 12 * sc, mix(col, '#000000', .35), 12 * sc, sc);
    pixelGlyph(c, crate?.glyph || '✦', mix(col, '#ffffff', .55), cx, cy - 1 * sc, sc);
    [[-13, -12], [14, -9], [-11, 11], [13, 12], [0, -17]].forEach(([dx, dy], i) => { px(c, cx + dx * sc, cy + dy * sc, mix(col, '#ffffff', .45), sc, sc); if (i % 2) px(c, cx + dx * sc - sc, cy + dy * sc, mix(col, '#ffffff', .2), 3 * sc, sc); });
  }
  function drawCardArt(c, card, w, h, o = {}) {
    const col = card?.color || '#777', sc = Math.max(1, Math.floor(Math.min(w, h) / 32));
    const x0 = Math.round((w - 20 * sc) / 2), y0 = Math.round((h - 28 * sc) / 2), T = o.texts, ox = o.ox || 0, oy = o.oy || 0;
    px(c, x0, y0, '#141216', 20 * sc, 28 * sc); px(c, x0 + sc, y0 + sc, mix(col, '#000', .6), 18 * sc, 26 * sc); px(c, x0 + 2 * sc, y0 + 2 * sc, mix(col, '#000', .4), 16 * sc, 12 * sc);
    px(c, x0 + 6 * sc, y0 + 4 * sc, mix(col, '#fff', .3), 8 * sc, 8 * sc); px(c, x0 + 7 * sc, y0 + 5 * sc, col, 6 * sc, 6 * sc);
    const name = (card?.name || '').replace('KARTA: ', '').split(' ');
    px(c, x0 + 2 * sc, y0 + 16 * sc, '#0d110e', 16 * sc, 9 * sc);
    if (T) { T.push({ x: ox + x0 + 10 * sc, y: oy + y0 + 10 * sc, text: card?.initials || '?', size: 5 * sc, color: '#f6efd8' }); name.slice(0, 2).forEach((wd, i) => T.push({ x: ox + x0 + 10 * sc, y: oy + y0 + (19 + i * 4) * sc, text: wd.slice(0, 9), size: 3.2 * sc, color: '#f3e9cf' })); }
    else {
      c.fillStyle = '#f6efd8'; c.font = `${5 * sc}px monospace`; c.textAlign = 'center'; c.fillText(card?.initials || '?', x0 + 10 * sc, y0 + 10 * sc);
      c.fillStyle = '#f3e9cf'; c.font = `${3 * sc}px monospace`; name.slice(0, 2).forEach((wd, i) => c.fillText(wd.slice(0, 9), x0 + 10 * sc, y0 + (19 + i * 4) * sc));
    }
    for (let k = 0; k < ({ basic: 0, common: 1, rare: 2, epic: 3, legendary: 4 })[card?.rarity] || 0; k++) px(c, x0 + (4 + k * 3) * sc, y0 + 26 * sc, mix(col, '#fff', .6), 2 * sc, sc);
  }
  function drawHall(c, t, shown, o = {}) {
    const T = o.texts;
    drawArena(c, t, 'hall', { sign: (o.name || 'SALA').slice(0, 18), texts: T });
    const at = id => shown.find(e => e.slot.id === id)?.item || null;
    const label = (x, y, text) => { if (T) { T.push({ x, y: y + 5, text: String(text).slice(0, 18), size: 5, color: '#d9c89a', plaque: true }); return; } px(c, x - 14, y, '#120f0b', 28, 7); c.fillStyle = '#d9c89a'; c.font = '5px monospace'; c.textAlign = 'center'; c.fillText(String(text).slice(0, 9), x, y + 5); };
    [['armor-1', 56], ['armor-2', 232]].forEach(([id, x], i) => { const item = at(id); px(c, x - 14, 124, '#4a3b2a', 28, 4); px(c, x - 16, 128, '#241c13', 32, 3); if (item) drawKnight(c, x, 124, { pose: 'idle', facing: i ? -1 : 1, time: t, skin: item.id }); label(x, 118 - (item ? 46 : 0), item ? item.name : 'POSTUMENT'); });
    [['weapon-1', 24], ['weapon-2', 264]].forEach(([id, x]) => { const item = at(id); px(c, x - 13, 40, '#1d1710', 26, 44); if (item) drawWeaponIcon(c, window.MuseumWeapons?.get(item.id), x - 8, 54, 1); label(x, 86, item ? item.name : 'BROŃ'); });
    [['card-1', 84], ['card-2', 182]].forEach(([id, x]) => { const item = at(id); if (item) { c.save(); c.translate(x, 30); drawCardArt(c, window.MuseumCards?.get(item.id), 22, 60, { texts: T, ox: x, oy: 30 }); c.restore(); } else label(x + 11, 56, 'KARTA'); });
    [['trophy-1', 132], ['trophy-2', 156]].forEach(([id, x]) => { const item = at(id); px(c, x - 9, 76, '#2a2219', 18, 30); px(c, x - 8, 78, 'rgba(154,208,232,.18)', 16, 24); if (item) drawTrophy(c, item, x, 104, 1); else label(x, 86, 'GABLOTA'); });
  }
  // Draws texts collected in low-res coordinates on a full-resolution context (scale PX), crisp, in the pixel UI font.
  function drawTexts(c, texts, scale = PX) {
    c.save(); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    for (const t of texts) {
      const size = Math.round(t.size * scale * 1.15); c.font = `400 ${size}px 'Jersey 10', 'Pixelify Sans', monospace`;
      const x = t.x * scale, y = t.y * scale, w = c.measureText(t.text).width;
      if (t.plaque) { c.fillStyle = '#120f0b'; c.fillRect(x - w / 2 - scale * 1.5, y - size * .95, w + scale * 3, size * 1.35); c.fillStyle = '#3b352a'; c.fillRect(x - w / 2 - scale * 1.5, y - size * .95, w + scale * 3, scale * .4); }
      else { c.fillStyle = 'rgba(0,0,0,.55)'; c.fillText(t.text, x + scale * .4, y + scale * .4); }
      c.fillStyle = t.color; c.fillText(t.text, x, y);
    }
    c.restore();
  }
  // Hidden packs register their art at runtime: a 24-wide icon, an in-hand sprite (hold/fwd rows) and a knight palette.
  const registerArt = ({ icons = {}, held = {}, palettes = {}, figures = {} } = {}) => { for (const [k, rows] of Object.entries(icons)) I[k] = rows; for (const [k, v] of Object.entries(held)) human.weapons[k] = v; for (const [k, v] of Object.entries(palettes)) extraPalettes[k] = v; for (const [k, v] of Object.entries(figures)) extraFigures[k] = v; };
  window.MuseumPixel = Object.freeze({ PX, W, H, FLOOR, drawTexts, drawGuardRoom, drawTrophy, ready: () => sheet.complete && sheet.naturalWidth > 0, drawArena, drawKnight, drawRex, drawFigure, drawWeaponIcon, registerArt, drawCrate, drawCardArt, drawHall, icons: I, blit, themes, knightPalette, figurePalette });
})();
