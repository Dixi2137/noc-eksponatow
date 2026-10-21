/* Hidden packs. Each pack is an AES-GCM blob whose key comes from an access code (PBKDF2). Without the code the source
   holds only ciphertext: no names, stats or art. A correct code decrypts the pack and registers its weapons, skins, art
   and perks in the live catalogues; the code is kept in the profile so the pack unlocks again on the next visit. */
(() => {
  'use strict';
  const PACKS = [
    {"id":"x1","hash":"409e818eef636bbfa3deeda361332e61d9545b2281b16b81dbb47d5f0d1d4a51","salt":"pjLvtPy417NPQZT/ody5sA==","iv":"zT5eGltEHbkxqZ8Q","data":"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"}
  ];
  const enc = new TextEncoder(), dec = new TextDecoder();
  const norm = code => String(code || '').trim().toUpperCase().replace(/\s+/g, '');
  const b64 = { to: bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))), from: text => Uint8Array.from(atob(text), ch => ch.charCodeAt(0)) };
  const hex = bytes => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
  const subtle = () => (window.crypto && window.crypto.subtle) || null;
  async function digest(code) { return hex(await subtle().digest('SHA-256', enc.encode(norm(code)))); }
  async function keyFor(code, salt) {
    const base = await subtle().importKey('raw', enc.encode(norm(code)), 'PBKDF2', false, ['deriveKey']);
    return subtle().deriveKey({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function encrypt(code, pack) {
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await keyFor(code, salt);
    const data = await subtle().encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(pack)));
    return { id: pack.id, hash: await digest(code), salt: b64.to(salt), iv: b64.to(iv), data: b64.to(data) };
  }
  async function decrypt(code, blob) {
    const key = await keyFor(code, b64.from(blob.salt));
    const plain = await subtle().decrypt({ name: 'AES-GCM', iv: b64.from(blob.iv) }, key, b64.from(blob.data));
    return JSON.parse(dec.decode(plain));
  }
  const unlocked = new Map();   // pack id -> { pack, items }
  function apply(pack) {
    if (unlocked.has(pack.id)) return unlocked.get(pack.id);
    window.MuseumPixel?.registerArt?.(pack.art || {});
    for (const perk of pack.perks || []) window.MuseumPerks?.register?.(perk);
    const items = window.MuseumLoot.register({ weapons: pack.weapons || [], skins: pack.skins || [] });
    const entry = { pack, items }; unlocked.set(pack.id, entry); return entry;
  }
  // Try a code against every pack. Resolves { ok, pack, items, already } or { ok: false, reason }.
  async function unlock(code, packs = PACKS) {
    if (!subtle()) return { ok: false, reason: 'crypto' };
    const clean = norm(code); if (!clean) return { ok: false, reason: 'empty' };
    const hash = await digest(clean), blob = packs.find(p => p.hash === hash);
    if (!blob) return { ok: false, reason: 'unknown' };
    if (unlocked.has(blob.id)) return { ok: true, already: true, ...unlocked.get(blob.id) };
    try { const pack = await decrypt(clean, blob); return { ok: true, already: false, ...apply(pack) }; }
    catch (_) { return { ok: false, reason: 'corrupt' }; }
  }
  async function restore(codes) { const out = []; for (const code of codes || []) { const r = await unlock(code); if (r.ok) out.push(r); } return out; }
  window.MuseumSecret = Object.freeze({ unlock, restore, norm, count: () => PACKS.length, unlockedIds: () => [...unlocked.keys()], _test: { encrypt, digest, apply } });
})();
