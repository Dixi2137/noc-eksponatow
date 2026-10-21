/* Hidden packs. Each pack is an AES-GCM blob whose key comes from an access code (PBKDF2). Without the code the source
   holds only ciphertext: no names, stats or art. A correct code decrypts the pack and registers its weapons, skins, art
   and perks in the live catalogues; the code is kept in the profile so the pack unlocks again on the next visit. */
(() => {
  'use strict';
  const PACKS = [
    {"id":"x1","hash":"6a505c8fd32aef4582268b852eac782a0a34e046b57f104b31a357a48180a89c","salt":"0cKnvDjCOsta/fzSkK85JA==","iv":"T1FH/ZLVTYLBjG9N","data":"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"}
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
