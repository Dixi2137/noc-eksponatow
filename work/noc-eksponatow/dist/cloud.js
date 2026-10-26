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
    if (/email rate limit|over_email_send_rate_limit/i.test(text)) return 'Serwer wysłał już limit maili (Supabase bez własnego SMTP: kilka na godzinę). Spróbuj za godzinę albo poproś kustosza o wyłączenie potwierdzania e-maila.';
    if (/security purposes|rate limit|too many requests/i.test(text)) return 'Za dużo prób. Odczekaj minutę i spróbuj ponownie.';
    if (/otp_expired|expired|invalid.*token/i.test(text)) return 'Link wygasł albo został już użyty. Poproś o nowy.';
    if (/same.*password|different from the old/i.test(text)) return 'Nowe hasło musi różnić się od starego.';
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
  async function request(path, { method = 'GET', body, auth = true, headers = {}, prefer, keepalive = false } = {}) {
    if (!enabled()) return { ok: false, error: 'Chmura jest wyłączona: brak konfiguracji.', offline: true };
    const base = config().supabaseUrl.replace(/\/$/, '');
    const h = { apikey: config().supabaseAnonKey, 'Content-Type': 'application/json', ...headers };
    if (auth && session?.access_token) { if (expired()) await refresh(); if (session?.access_token) h.Authorization = `Bearer ${session.access_token}`; }
    // Legacy anon keys are JWTs and double as the bearer for anonymous calls; new publishable keys (sb_publishable_…) go in apikey only.
    if (!h.Authorization && /^eyJ/.test(config().supabaseAnonKey)) h.Authorization = `Bearer ${config().supabaseAnonKey}`;
    if (prefer) h.Prefer = prefer;
    try {
      const response = await fetch(`${base}${path}`, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body), ...(keepalive ? { keepalive: true } : {}) });
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
  // Password recovery: Supabase e-mails a link that returns to this page with tokens in the URL hash (type=recovery).
  const returnUrl = () => (typeof location !== 'undefined' ? location.origin + location.pathname : '');
  async function recover(email) {
    const r = await request(`/auth/v1/recover?redirect_to=${encodeURIComponent(returnUrl())}`, { method: 'POST', body: { email }, auth: false });
    return r.ok ? { ok: true } : r;
  }
  async function updatePassword(password) {
    if (!session?.access_token) return { ok: false, error: 'Brak sesji odzyskiwania. Kliknij link z e-maila jeszcze raz.' };
    const r = await request('/auth/v1/user', { method: 'PUT', body: { password } });
    if (r.ok && r.data?.id) { store({ ...session, user: r.data }); return { ok: true, data: user() }; }
    return r;
  }
  // Tokens arriving in the URL hash (recovery, e-mail confirmation, magic link) become the session; the hash is wiped afterwards.
  async function consumeAuthHash(hash = typeof location !== 'undefined' ? location.hash : '') {
    const params = new URLSearchParams(String(hash || '').replace(/^#/, ''));
    const clear = () => { try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {} };
    if (params.get('error') || params.get('error_description')) { clear(); return { ok: false, error: messageFor(params.get('error_description') || params.get('error')), type: params.get('type') || null }; }
    const access = params.get('access_token'); if (!access) return null;
    const type = params.get('type') || 'session';
    store({ access_token: access, refresh_token: params.get('refresh_token') || null, expires_at: Math.floor(Date.now() / 1000) + (Number(params.get('expires_in')) || 3600), user: null });
    const me = await request('/auth/v1/user');
    if (me.ok && me.data?.id) store({ ...session, user: me.data }); else { store(null); clear(); return { ok: false, error: me.error || 'Link wygasł. Poproś o nowy.', type }; }
    clear(); return { ok: true, type, data: user() };
  }
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
  async function upsertProfile(fields, { keepalive = false } = {}) {
    const me = user(); if (!me) return { ok: false, error: 'Nie jesteś zalogowany.' };
    const body = { ...fields, updated_at: new Date().toISOString() };
    const r = await request(`/rest/v1/profiles?id=eq.${me.id}`, { method: 'PATCH', body, prefer: 'return=representation', keepalive });
    if (!r.ok || (Array.isArray(r.data) && r.data.length)) return r;
    return request('/rest/v1/profiles', { method: 'POST', body: { id: me.id, nickname: me.nickname || `gracz-${me.id.slice(0, 8)}`, ...body }, prefer: 'return=representation' });
  }
  async function claimDaily() { const r = await request('/rest/v1/rpc/claim_daily_bonus', { method: 'POST', body: {} }); return r; }
  // Moderator adjustments wait on the server until the player's game picks them up (the local save is authoritative for the client).
  async function claimAdjustments() { const r = await request('/rest/v1/rpc/claim_adjustments', { method: 'POST', body: {} }); return r.ok ? { ok: true, coins: Number(r.data?.coins) || 0, balance: Number(r.data?.balance) || 0 } : r; }
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
    setTitle: (target, title) => rpc('mod_set_title', { target, new_title: title || '' }),
    announce: (body, kind = 'info', seconds = 60) => rpc('mod_announce', { body, kind, seconds }),
    setMaintenance: (enabled, message = '') => rpc('mod_set_maintenance', { enabled: !!enabled, message }),
    unannounce: id => rpc('mod_unannounce', { target: id })
  });
  // Announcements for everyone: a public table, read without login. Live delivery over Supabase Realtime (Phoenix protocol
  // spoken by hand: join, heartbeat, postgres_changes) with a 15 s poll as the safety net, so no message is missed.
  const announcements = (() => {
    const handlers = new Set(); const seen = new Set(); const settingHandlers = new Set(); let socket = null, timer = null, poll = null, ref = 0, backoff = 2000, lastMaintenance = null;
    const settingsGet = key => request(`/rest/v1/settings?key=eq.${encodeURIComponent(key)}&select=key,value,updated_at`, { auth: false });
    const emitSetting = row => { if (!row || row.key !== 'maintenance') return; const sig = JSON.stringify(row.value); if (sig === lastMaintenance) return; lastMaintenance = sig; for (const fn of settingHandlers) { try { fn(row.value || {}); } catch (_) {} } };
    async function sweepSettings() { const r = await settingsGet('maintenance'); if (r.ok && Array.isArray(r.data) && r.data[0]) emitSetting(r.data[0]); }
    const list = () => request('/rest/v1/announcements?select=*&order=created_at.desc&limit=10', { auth: false });
    const deliver = (row, changed = false) => { if (!row) return; if (!changed) { if (seen.has(row.id)) return; seen.add(row.id); } for (const fn of handlers) { try { fn(row, changed); } catch (_) {} } };
    async function sweep() { const r = await list(); if (r.ok && Array.isArray(r.data)) for (const row of [...r.data].reverse()) { if (new Date(row.expires_at) > new Date()) deliver(row); else if (seen.has(row.id)) deliver(row, true); } }
    function connect() {
      if (!enabled() || typeof WebSocket === 'undefined' || socket) return;
      const url = `${config().supabaseUrl.replace(/^http/, 'ws').replace(/\/$/, '')}/realtime/v1/websocket?apikey=${encodeURIComponent(config().supabaseAnonKey)}&vsn=1.0.0`;
      try { socket = new WebSocket(url); } catch (_) { socket = null; return; }
      const send = msg => { try { socket.send(JSON.stringify({ ...msg, ref: String(++ref) })); } catch (_) {} };
      socket.onopen = () => { backoff = 2000; send({ topic: 'realtime:announcements', event: 'phx_join', payload: { config: { broadcast: { self: false }, presence: { key: '' }, postgres_changes: [{ event: 'INSERT', schema: 'public', table: 'announcements' }, { event: 'UPDATE', schema: 'public', table: 'announcements' }, { event: '*', schema: 'public', table: 'settings' }] }, access_token: session?.access_token || config().supabaseAnonKey } }); timer = setInterval(() => send({ topic: 'phoenix', event: 'heartbeat', payload: {} }), 25000); };
      socket.onmessage = e => { let m = null; try { m = JSON.parse(e.data); } catch (_) { return; } if (m?.event === 'postgres_changes') { const row = m.payload?.data?.record || m.payload?.record, type = m.payload?.data?.type || m.payload?.type, table = m.payload?.data?.table || m.payload?.table; if (row && table === 'settings') emitSetting(row); else if (row) deliver(row, type === 'UPDATE'); } };
      socket.onclose = socket.onerror = () => { clearInterval(timer); timer = null; if (socket) { socket.onclose = socket.onerror = null; socket = null; } setTimeout(connect, backoff); backoff = Math.min(60000, backoff * 2); };
    }
    function subscribe(fn) { handlers.add(fn); if (!poll) { sweep(); sweepSettings(); poll = setInterval(() => { sweep(); sweepSettings(); }, 15000); connect(); document.addEventListener('visibilitychange', () => { if (!document.hidden) { sweep(); sweepSettings(); } }); } return () => handlers.delete(fn); }
    function onMaintenance(fn) { settingHandlers.add(fn); if (!poll) subscribe(() => {}); return () => settingHandlers.delete(fn); }
    return Object.freeze({ list, subscribe, onMaintenance, maintenance: () => settingsGet('maintenance'), markSeen: id => seen.add(id), _test: { deliver, seen, emitSetting } });
  })();
  // Honorary titles a moderator can grant; 'first-to-arrive' is unique on the server.
  const titles = Object.freeze({
    owner: { name: 'OWNER', color: '#ff8c9a', note: 'Właściciel muzeum.' },
    'first-to-arrive': { name: 'FIRST TO ARRIVE', color: '#f0ca72', note: 'Pierwsza osoba, która zalogowała się po założycielu.' },
    founder: { name: 'ZAŁOŻYCIEL', color: '#7ff0e0', note: 'Twórca muzeum.' },
    veteran: { name: 'WETERAN', color: '#c4a1f0', note: 'Przeszedł całą noc.' },
    patron: { name: 'MECENAS', color: '#9ad28b', note: 'Wsparł muzeum.' },
    'demon-slayer': { name: 'DEMON SLAYER', color: '#ff4a3a', note: 'Pokonał Belzebuba w piekle.' }
  });
  async function leaderboard(limit = 50) { return request(`/rest/v1/leaderboard?select=*&order=halls_cleared.desc,prestige.desc,fastest_night.asc.nullslast&limit=${limit}`, { auth: false }); }
  window.MuseumCloud = Object.freeze({ enabled, user, restore, signUp, signIn, signOut, recover, updatePassword, consumeAuthHash, claimAdjustments, nicknameTaken, fetchProfile, upsertProfile, claimDaily, leaderboard, messageFor, mod, titles, announcements,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    _test: { store, expired: () => expired(), request } });
})();
