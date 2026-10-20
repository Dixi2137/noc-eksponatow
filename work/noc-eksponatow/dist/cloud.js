/* Supabase without a client library: auth and PostgREST over fetch. Session lives in localStorage.
   Every call resolves to {ok, data|error}; the game keeps working offline when the cloud is off or unreachable. */
(() => {
  'use strict';
  const SESSION_KEY = 'museum-night-session';
  const config = () => window.MuseumConfig || {};
  const enabled = () => !!(config().supabaseUrl && config().supabaseAnonKey);
  let session = null;
  const listeners = new Set();
  try { session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (_) { session = null; }

  function emit() { for (const fn of listeners) { try { fn(user()); } catch (_) {} } }
  function store(next) { session = next; try { if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next)); else localStorage.removeItem(SESSION_KEY); } catch (_) {} emit(); }
  function user() { return session?.user ? { id: session.user.id, email: session.user.email, nickname: session.user.user_metadata?.nickname || null } : null; }
  function expired() { return !session?.expires_at || session.expires_at * 1000 - Date.now() < 60000; }
  function messageFor(error) {
    const text = String(error?.msg || error?.message || error?.error_description || error?.error || error || 'Nieznany błąd');
    if (/invalid login credentials/i.test(text)) return 'Zły e-mail albo hasło.';
    if (/email not confirmed/i.test(text)) return 'Potwierdź e-mail linkiem z wiadomości, potem zaloguj się.';
    if (/already registered|already been registered/i.test(text)) return 'Ten e-mail ma już konto. Zaloguj się.';
    if (/password/i.test(text) && /6|short|weak/i.test(text)) return 'Hasło musi mieć co najmniej 6 znaków.';
    if (/null value in column/i.test(text)) return `Brak wymaganego pola w zapisie (${text.match(/column "?(\w+)"?/)?.[1] || '?'}).`;
    if (/row-level security/i.test(text)) return 'Serwer odrzucił zapis (brak uprawnień albo konto zablokowane).';
    if (/nickname|profiles_nickname_key|duplicate key/i.test(text)) return 'Ten pseudonim jest zajęty.';
    if (/database error saving new user/i.test(text)) return 'Pseudonim zajęty albo nieprawidłowy (3–20 znaków).';
    if (/failed to fetch|networkerror|load failed/i.test(text)) return 'Brak połączenia z chmurą.';
    return text;
  }
  async function request(path, { method = 'GET', body, auth = true, headers = {}, prefer } = {}) {
    if (!enabled()) return { ok: false, error: 'Chmura jest wyłączona: brak konfiguracji.', offline: true };
    const base = config().supabaseUrl.replace(/\/$/, '');
    const h = { apikey: config().supabaseAnonKey, 'Content-Type': 'application/json', ...headers };
    if (auth && session?.access_token) { if (expired()) await refresh(); if (session?.access_token) h.Authorization = `Bearer ${session.access_token}`; }
    // Legacy anon keys are JWTs and double as the bearer for anonymous calls; new publishable keys (sb_publishable_…) go in apikey only.
    if (!h.Authorization && /^eyJ/.test(config().supabaseAnonKey)) h.Authorization = `Bearer ${config().supabaseAnonKey}`;
    if (prefer) h.Prefer = prefer;
    try {
      const response = await fetch(`${base}${path}`, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
      const text = await response.text(); let data = null; try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }
      if (!response.ok) return { ok: false, error: messageFor(data), status: response.status, raw: data };
      return { ok: true, data };
    } catch (error) { return { ok: false, error: messageFor(error), offline: true }; }
  }
  async function refresh() {
    if (!session?.refresh_token) return false;
    const result = await request('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: session.refresh_token }, auth: false });
    if (result.ok && result.data?.access_token) { store(result.data); return true; }
    if (result.status === 400 || result.status === 401) store(null);
    return false;
  }
  async function signUp(email, password, nickname) {
    const result = await request('/auth/v1/signup', { method: 'POST', body: { email, password, data: { nickname } }, auth: false });
    if (!result.ok) return result;
    if (result.data?.access_token) { store(result.data); return { ok: true, data: { session: true, user: user() } }; }
    return { ok: true, data: { session: false, confirmEmail: true } };
  }
  async function signIn(email, password) {
    const result = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password }, auth: false });
    if (result.ok && result.data?.access_token) { store(result.data); return { ok: true, data: user() }; }
    return result.ok ? { ok: false, error: 'Brak sesji w odpowiedzi.' } : result;
  }
  async function signOut() { if (session?.access_token) await request('/auth/v1/logout', { method: 'POST' }); store(null); return { ok: true }; }
  async function restore() { if (!enabled() || !session) return null; if (expired()) await refresh(); return user(); }
  async function nicknameTaken(nickname) { const r = await request('/rest/v1/rpc/nickname_taken', { method: 'POST', body: { name: nickname }, auth: false }); return r.ok ? !!r.data : null; }
  async function fetchProfile() {
    const me = user(); if (!me) return { ok: false, error: 'Nie jesteś zalogowany.' };
    // Newer columns (moderation, titles) may be missing until the matching migration is applied; fall back to the base set.
    const base = 'id,nickname,save,halls_cleared,prestige,fastest_night,night_coins,daily_last,daily_streak,updated_at';
    let r = await request(`/rest/v1/profiles?id=eq.${me.id}&select=${base},role,banned_until,ban_reason,title`);
    if (!r.ok && /does not exist/i.test(String(r.raw?.message || r.error))) r = await request(`/rest/v1/profiles?id=eq.${me.id}&select=${base},role,banned_until,ban_reason`);
    if (!r.ok && /does not exist/i.test(String(r.raw?.message || r.error))) r = await request(`/rest/v1/profiles?id=eq.${me.id}&select=${base}`);
    return r.ok ? { ok: true, data: Array.isArray(r.data) ? r.data[0] || null : null } : r;
  }
  // The profile row is created by a database trigger at sign-up, so saving is an UPDATE. (An upsert without the nickname
  // fails on the NOT NULL check before the conflict is even resolved.) If the row is somehow missing, insert it with a nickname.
  async function upsertProfile(fields) {
    const me = user(); if (!me) return { ok: false, error: 'Nie jesteś zalogowany.' };
    const body = { ...fields, updated_at: new Date().toISOString() };
    const r = await request(`/rest/v1/profiles?id=eq.${me.id}`, { method: 'PATCH', body, prefer: 'return=representation' });
    if (!r.ok || (Array.isArray(r.data) && r.data.length)) return r;
    return request('/rest/v1/profiles', { method: 'POST', body: { id: me.id, nickname: me.nickname || `gracz-${me.id.slice(0, 8)}`, ...body }, prefer: 'return=representation' });
  }
  async function claimDaily() { const r = await request('/rest/v1/rpc/claim_daily_bonus', { method: 'POST', body: {} }); return r; }
  // Moderation: every call is an RPC guarded on the server by is_mod()/is_admin(); the client only shapes requests.
  function modMessage(r) { if (r.ok) return r; const t = String(r.raw?.message || r.error || ''); if (/title_taken|profiles_first_to_arrive/i.test(t)) return { ...r, error: 'Rangę FIRST TO ARRIVE ma już ktoś inny. Najpierw ją zdejmij.' }; if (/forbidden/i.test(t)) return { ...r, error: 'Brak uprawnień moderatora.' }; if (/self_ban/i.test(t)) return { ...r, error: 'Nie zbanujesz samego siebie.' }; if (/self_role/i.test(t)) return { ...r, error: 'Własnej roli nie zmienisz z gry.' }; if (/cannot_ban_admin/i.test(t)) return { ...r, error: 'Administratora może zbanować tylko inny administrator.' }; return r; }
  const rpc = async (name, body) => modMessage(await request(`/rest/v1/rpc/${name}`, { method: 'POST', body }));
  const mod = Object.freeze({
    stats: () => rpc('mod_stats', {}),
    list: (q = '', lim = 50) => rpc('mod_list', { q, lim }),
    ban: (target, hours, reason = '') => rpc('mod_ban', { target, hours, reason }),
    unban: target => rpc('mod_unban', { target }),
    note: (target, note) => rpc('mod_note', { target, note }),
    adjust: (target, coinsDelta = 0, balanceDelta = 0) => rpc('mod_adjust', { target, coins_delta: coinsDelta, balance_delta: balanceDelta }),
    reset: target => rpc('mod_reset', { target }),
    setRole: (target, role) => rpc('mod_set_role', { target, new_role: role }),
    setTitle: (target, title) => rpc('mod_set_title', { target, new_title: title || '' })
  });
  // Honorary titles a moderator can grant; 'first-to-arrive' is unique on the server.
  const titles = Object.freeze({
    owner: { name: 'OWNER', color: '#ff8c9a', note: 'Właściciel muzeum.' },
    'first-to-arrive': { name: 'FIRST TO ARRIVE', color: '#f0ca72', note: 'Pierwsza osoba, która zalogowała się po założycielu.' },
    founder: { name: 'ZAŁOŻYCIEL', color: '#7ff0e0', note: 'Twórca muzeum.' },
    veteran: { name: 'WETERAN', color: '#c4a1f0', note: 'Przeszedł całą noc.' },
    patron: { name: 'MECENAS', color: '#9ad28b', note: 'Wsparł muzeum.' }
  });
  async function leaderboard(limit = 50) { return request(`/rest/v1/leaderboard?select=*&order=halls_cleared.desc,prestige.desc,fastest_night.asc.nullslast&limit=${limit}`, { auth: false }); }
  window.MuseumCloud = Object.freeze({ enabled, user, restore, signUp, signIn, signOut, nicknameTaken, fetchProfile, upsertProfile, claimDaily, leaderboard, messageFor, mod, titles,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    _test: { store, expired: () => expired(), request } });
})();
