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
    desert: generic('#2a8a4a', '☾', 'rgba(170,140,70,.4)'), cartel: generic('#2a3a6a', '$', 'rgba(90,40,110,.4)'), palace: generic('#8a1a1a', '☭', 'rgba(70,70,70,.45)')
  });
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
    px(c, 116, 60, '#3a3a2c', 56, 4);
    c.fillStyle = '#c9b37a'; c.font = '7px monospace'; c.textAlign = 'center'; c.fillText(o.sign || (themeKey === 'hall' ? 'SALA' : 'MUSEUM'), 144, 24);
    px(c, 140, 44, '#2c4a3e', 8, 8); px(c, 143, 46, '#d9c28a', 2, 4);                   // clock
    // Banners or reliefs between the windows and the arch.
    if (th.banner) {
      [84, 182].forEach(x => { px(c, x - 1, 30, '#3b352a', 24, 3); px(c, x, 33, th.banner.color, 22, 44); px(c, x, 77, th.banner.color, 11, 6); px(c, x + 11, 77, th.banner.color, 11, 6); px(c, x + 2, 35, 'rgba(255,255,255,.12)', 2, 40); c.fillStyle = mix(th.banner.color, '#ffffff', .6); c.font = '8px monospace'; c.fillText(th.banner.glyph, x + 11, 60); });
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
    // Chests as props by the pillars.
    tile(c, 5, 7, 24, 112); tile(c, 6, 7, 248, 112);
    // Vignette.
    const g = c.createRadialGradient(144, 80, 60, 144, 80, 190); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,4,10,.6)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
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
    legA: ["OBBBBO", "OBBBBO", "ODBBDO", "ODBBDO", "ODBBDO", "OBBBBO", "ODDDDO", "ODDDDO", "OOOOOO"],
    legB: ["OBBBBO", "ODBBDO", "ODBBDO", "ODDDDO", ".OBBO.", "OBBBBO", "ODDDDO", "OOOOOO"],
    boot: ["OLLLLO", "ODDDDO", "OOOOOO"],
    sword: [".OO.", ".OEO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OEWO", "OGGO", "GGGG", ".OO.", ".OO.", ".GG."],
    swordFwd: ["...............OO...", "OGG.OWEEEEEEEEEEEEO.", "OGGOEWWWWWWWWWWWWEO.", "...OEEEEEEEEEEEEEO..", "....OOOOOOOOOOOO...."],
    shield: [".OOOOOOO.", "OGBBBBBGO", "OBBCCCBBO", "OBCCGCCBO", "OBCCGCCBO", "OBBCCCBBO", "OBBBBBBBO", ".OBBBBBO.", "..OBBBO..", "...OOO..."],
    cape: ["CCCCCC", "CCCCCCC", "cCCCCCCC", "cCCCCCCC", "ccCCCCCC", "ccCCCCCC", "cccCCCCC", "cccCCCCC", "ccccCCCC", "ccccCCCC", "cccccCCC", "cccccCCC", "ccccccCC", "ccccccCC", "cccccccC", "cccccccC", "ccccccc.", "cccccc..", "ccccc...", "cccc...."]
  };
  function knightPalette(skin) {
    let base = '#687b7e', dark = '#172b36', light = '#bad2c8', glint = '#e5dfab', cloth = ['#581e32', '#26182b'];
    const special = { brass: ['#947247', '#302b29', '#d9b773', '#ffe1a0', '#581e32', '#26182b'], frost: ['#6c9ca5', '#193747', '#c5f6ed', '#e5ffff', '#35708a', '#16293e'], obsidian: ['#353d55', '#111a29', '#9c8bc1', '#d7b4ff', '#4d2f62', '#1b162a'],
      verdigris: ['#4a947b', '#152f29', '#b8dfad', '#e5ffc5', '#22624e', '#12291f'], ember: ['#a54e37', '#351b24', '#ffc187', '#fff1b7', '#a43127', '#36151d'], royal: ['#67528b', '#211c3c', '#dbb9ef', '#ffebff', '#62408a', '#241637'], solar: ['#b7953c', '#3e321b', '#fff0ac', '#ffffe1', '#b28c38', '#44311e'],
      'stachu-jones': ['#77858b', '#263742', '#c6d1cc', '#dfe8e2', '#18283f', '#0d192b'] }[skin];
    if (special) [base, dark, light, glint, cloth[0], cloth[1]] = special;
    const look = window.MuseumKnights?.skins?.find(s => s.id === skin);
    if (look) { base = look.colors[0]; dark = mix(base, '#07111c', .7); light = mix(base, '#f3f5e7', .5); glint = look.colors[3] || mix(look.colors[2], '#fff9e4', .55); cloth = [look.colors[1], mix(look.colors[1], '#071016', .6)]; }
    return { O: mix(dark, '#000000', .55), B: base, D: dark, L: light, G: '#c9a94a', C: cloth[0], c: cloth[1], K: '#0c2530', E: '#b7f9d5', W: '#f5f6d3' };
  }
  function drawKnight(c, x, y, o = {}) {
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
    const oy = -40 - bob;
    const B = (rows, dx, dy, pl = pal) => blit(c, rows, dx, oy + dy, pl);
    B(knightParts.cape, -12, 8);                                   // cape behind
    B(knightParts.armBack, 4, 12);
    if (pose === 'attack' && p < .45) B(knightParts.sword, 6, -14);   // raised behind the head
    B(walk > 0 ? knightParts.legB : knightParts.legA, -6, 27); B(walk < 0 ? knightParts.legB : knightParts.legA, 0, 27);
    B(knightParts.boot, -6, 36); B(knightParts.boot, 0, 36);
    B(knightParts.torso, -7, 11);
    B(knightParts.head, -6, 0); B(knightParts.plume, -10, -3);
    if (pose === 'guard') B(knightParts.shield, 4, 10); else B(knightParts.shield, -11, 14);
    B(knightParts.armFront, 2, 13);
    if (pose === 'attack' && p >= .45) B(knightParts.swordFwd, 4, 14);
    else if (pose !== 'attack') B(knightParts.sword, 7, -6);
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

  window.MuseumPixel = Object.freeze({ PX, W, H, FLOOR, ready: () => sheet.complete && sheet.naturalWidth > 0, drawArena, drawKnight, drawRex, blit, themes, knightPalette });
})();
