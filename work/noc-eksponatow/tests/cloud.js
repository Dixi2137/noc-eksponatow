/* Cloud client: offline behaviour, session handling and request shapes, with a fake fetch. */
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const cloud = window.MuseumCloud, loot = window.MuseumLoot;
  const realFetch = window.fetch;
  function withConfig(fn) { const old = window.MuseumConfig; window.MuseumConfig = { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'anon-key' }; return Promise.resolve().then(fn).finally(() => { window.MuseumConfig = old; }); }
  function fakeFetch(handler) { const calls = []; window.fetch = async (url, init) => { calls.push({ url, init }); const r = handler(url, init) || { status: 200, body: {} }; return { ok: r.status < 400, status: r.status, text: async () => JSON.stringify(r.body) }; }; return calls; }

  test('Bez konfiguracji chmura jest wyłączona i każde wywołanie kończy się offline', async () => {
    assert.equal(cloud.enabled(), false); const r = await cloud.leaderboard(); assert.equal(r.ok, false); assert.equal(r.offline, true);
    assert.equal(cloud.user(), null); assert.equal(await cloud.restore(), null);
  });
  test('Profil migruje rekordy nocy', () => {
    const p = loot.migrate({ records: { fastestNight: 123.4, nightCoins: 900 } }); assert.equal(p.records.fastestNight, 123.4); assert.equal(p.records.nightCoins, 900);
    assert.equal(loot.migrate(null).records.fastestNight, null);
  });
  test('Logowanie zapisuje sesję, żądania niosą apikey i token, wylogowanie czyści sesję', () => withConfig(async () => {
    const calls = fakeFetch((url) => url.includes('grant_type=password') ? { status: 200, body: { access_token: 'tok', refresh_token: 'ref', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: 'u1', email: 'a@b.pl', user_metadata: { nickname: 'Jakub' } } } } : url.includes('/rest/v1/profiles') ? { status: 200, body: [{ id: 'u1', nickname: 'Jakub', save: {} }] } : { status: 200, body: {} });
    try {
      const login = await cloud.signIn('a@b.pl', 'haslo123'); assert.equal(login.ok, true); assert.equal(cloud.user().nickname, 'Jakub');
      const profile = await cloud.fetchProfile(); assert.equal(profile.ok, true); assert.equal(profile.data.nickname, 'Jakub');
      const last = calls.at(-1); assert.equal(last.init.headers.apikey, 'anon-key'); assert.equal(last.init.headers.Authorization, 'Bearer tok'); assert.ok(last.url.includes('id=eq.u1'));
      const up = await cloud.upsertProfile({ save: { coins: 5 }, halls_cleared: 2 }); assert.equal(up.ok, true);
      const body = JSON.parse(calls.at(-1).init.body); assert.equal(body.id, 'u1'); assert.equal(body.halls_cleared, 2); assert.ok(calls.at(-1).init.headers.Prefer.includes('merge-duplicates'));
      await cloud.signOut(); assert.equal(cloud.user(), null); assert.equal(localStorage.getItem('museum-night-session'), null);
    } finally { window.fetch = realFetch; }
  }));
  test('Wygasła sesja jest odświeżana przed żądaniem, a nieudane odświeżenie wylogowuje', () => withConfig(async () => {
    cloud._test.store({ access_token: 'old', refresh_token: 'ref', expires_at: Math.floor(Date.now() / 1000) - 10, user: { id: 'u1', email: 'a@b.pl' } });
    assert.equal(cloud._test.expired(), true);
    let calls = fakeFetch((url) => url.includes('grant_type=refresh_token') ? { status: 200, body: { access_token: 'new', refresh_token: 'ref2', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: 'u1', email: 'a@b.pl' } } } : { status: 200, body: { claimed: true, bonus: 50, streak: 1 } });
    try {
      const r = await cloud.claimDaily(); assert.equal(r.ok, true); assert.equal(r.data.bonus, 50);
      assert.ok(calls[0].url.includes('refresh_token')); assert.equal(calls[1].init.headers.Authorization, 'Bearer new');
      cloud._test.store({ access_token: 'old', refresh_token: 'bad', expires_at: 0, user: { id: 'u1', email: 'a@b.pl' } });
      calls = fakeFetch(() => ({ status: 400, body: { error: 'invalid_grant' } }));
      await cloud.claimDaily(); assert.equal(cloud.user(), null, 'złe odświeżenie czyści sesję');
    } finally { window.fetch = realFetch; cloud._test.store(null); }
  }));
  test('Komunikaty błędów są po polsku, a rejestracja bez sesji prosi o potwierdzenie e-maila', () => withConfig(async () => {
    assert.equal(cloud.messageFor({ msg: 'Invalid login credentials' }), 'Zły e-mail albo hasło.'); assert.equal(cloud.messageFor({ message: 'Database error saving new user' }), 'Pseudonim zajęty albo nieprawidłowy (3–20 znaków).');
    fakeFetch(() => ({ status: 200, body: { id: 'u2', email: 'x@y.pl' } }));
    try { const r = await cloud.signUp('x@y.pl', 'haslo123', 'Nowy'); assert.equal(r.ok, true); assert.equal(r.data.confirmEmail, true); assert.equal(cloud.user(), null); } finally { window.fetch = realFetch; }
  }));
  test('Ranking jest pobierany bez logowania z właściwym porządkiem', () => withConfig(async () => {
    const calls = fakeFetch(() => ({ status: 200, body: [{ nickname: 'A', halls_cleared: 6, prestige: 90 }] }));
    try { const r = await cloud.leaderboard(10); assert.equal(r.ok, true); assert.equal(r.data[0].nickname, 'A'); assert.ok(calls[0].url.includes('/rest/v1/leaderboard')); assert.ok(calls[0].url.includes('halls_cleared.desc')); assert.equal(calls[0].init.headers.Authorization, 'Bearer anon-key'); } finally { window.fetch = realFetch; }
  }));
})();
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const cloud = window.MuseumCloud, realFetch = window.fetch;
  function withConfig(fn) { const old = window.MuseumConfig; window.MuseumConfig = { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'anon-key' }; return Promise.resolve().then(fn).finally(() => { window.MuseumConfig = old; }); }
  test('Moderacja: wywołania RPC niosą token i właściwe parametry, a odmowa serwera ma polski komunikat', () => withConfig(async () => {
    const calls = [];
    window.fetch = async (url, init) => { calls.push({ url, init }); const forbidden = url.includes('mod_set_role'); return { ok: !forbidden, status: forbidden ? 400 : 200, text: async () => JSON.stringify(forbidden ? { message: 'forbidden' } : url.includes('mod_list') ? [{ id: 'u2', nickname: 'Zbyszek', role: 'player', coins: 10, balance: 2137 }] : { ok: true }) }; };
    try {
      cloud._test.store({ access_token: 'tok', refresh_token: 'ref', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: 'u1', email: 'a@b.pl', user_metadata: { nickname: 'Jakub' } } });
      const list = await cloud.mod.list('zby', 20); assert.equal(list.ok, true); assert.equal(list.data[0].nickname, 'Zbyszek');
      assert.ok(calls.at(-1).url.endsWith('/rest/v1/rpc/mod_list')); assert.deepEqual(JSON.parse(calls.at(-1).init.body), { q: 'zby', lim: 20 }); assert.equal(calls.at(-1).init.headers.Authorization, 'Bearer tok');
      await cloud.mod.ban('u2', 24, 'spam'); assert.deepEqual(JSON.parse(calls.at(-1).init.body), { target: 'u2', hours: 24, reason: 'spam' });
      await cloud.mod.adjust('u2', -500, 2137); assert.deepEqual(JSON.parse(calls.at(-1).init.body), { target: 'u2', coins_delta: -500, balance_delta: 2137 });
      await cloud.mod.stats(); assert.ok(calls.at(-1).url.endsWith('/rpc/mod_stats'));
      const role = await cloud.mod.setRole('u2', 'moderator'); assert.equal(role.ok, false); assert.equal(role.error, 'Brak uprawnień moderatora.');
      const profileCall = cloud.fetchProfile(); await profileCall; assert.ok(calls.at(-1).url.includes('role,banned_until,ban_reason'), 'profil niesie rolę i ban');
      await cloud.signOut();
    } finally { window.fetch = realFetch; }
  }));
})();
