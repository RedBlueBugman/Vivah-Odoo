'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');

const PORT = process.env.PORT || 4000;
const STATE_FILE = path.join(__dirname, 'data.json');
const COUPLES_FILE = path.join(__dirname, 'couples.json');

/* ── staff passwords ── */
const PW = {
  planner: process.env.PLANNER_PW || 'planner123',
  founder: process.env.FOUNDER_PW || 'founder123',
  vendor:  process.env.VENDOR_PW  || 'vendor123',
};

/* ── state persistence ── */
let DB = { version: 0, state: null };
try { DB = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch(e) {}

/* ── couple accounts persistence ── */
// { [email]: { hash, salt, wid, name } }
let COUPLES = {};
try { COUPLES = JSON.parse(fs.readFileSync(COUPLES_FILE, 'utf8')); } catch(e) {}

const saveState = () => {
  fs.writeFileSync(STATE_FILE + '.tmp', JSON.stringify(DB));
  fs.renameSync(STATE_FILE + '.tmp', STATE_FILE);
};
const saveCouples = () => {
  fs.writeFileSync(COUPLES_FILE + '.tmp', JSON.stringify(COUPLES));
  fs.renameSync(COUPLES_FILE + '.tmp', COUPLES_FILE);
};

/* ── sessions ── */
// { token: { role, wid? } }
const SES = new Map();

/* ── crypto helpers ── */
const hashPw = (pw, salt) => {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const h = crypto.pbkdf2Sync(pw, s, 10000, 32, 'sha256').toString('hex');
  return { hash: h, salt: s };
};
const checkPw = (pw, hash, salt) => {
  const { hash: h } = hashPw(pw, salt);
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(hash));
};

/* ── http helpers ── */
const send = (res, code, b) => {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
  });
  res.end(code === 204 ? undefined : JSON.stringify(b));
};
const body = req => new Promise((ok, no) => {
  let d = '';
  req.on('data', c => { d += c; if (d.length > 5e6) { req.destroy(); no(new Error('Too large')); } });
  req.on('end', () => { try { ok(d ? JSON.parse(d) : {}); } catch(e) { no(new Error('Invalid JSON')); } });
});
const J = (s, skip = []) => JSON.stringify(s, (k, v) => skip.includes(k) ? undefined : v);

/* ── business rules ── */
function check(role, prev, next) {
  if (!next || !Array.isArray(next.w)) return 'Invalid data';
  for (const w of next.w) {
    if (!w.id || !String(w.c || '').trim() || !(w.g > 0))
      return 'Each wedding needs a couple name and a guest count';
    if ((w.rfq || []).length && !w.signed)
      return w.c + ': quotes need a signed agreement first';
    for (const r of w.rfq || []) {
      const won = r.q.filter(q => q.s === 'won').length;
      if (won > 1 || (r.st === 'won') !== (won === 1))
        return w.c + ': exactly one quote can win';
    }
    for (let i = 1; i < (w.pay || []).length; i++)
      if (w.pay[i].paid && !w.pay[i-1].paid)
        return w.c + ': payments must be made in order';
    for (const v of w.vs || [])
      if (v.p < 0 || v.p > (v.b || v.a) + 1e-6)
        return w.c + ': cannot pay ' + v.n + ' more than their bill';
  }
  if (!prev) return null;
  if (role === 'founder' && J(prev) !== J(next)) return 'The founder view is read-only';
  if (role === 'vendor' && J(prev, ['ar']) !== J(next, ['ar'])) return 'Vendors can only check themselves in';
  if (role === 'couple') {
    if (prev.w.length !== next.w.length) return 'Couples cannot create weddings via state PUT';
    for (const w of next.w) {
      const o = prev.w.find(x => x.id === w.id);
      if (!o) return 'Unknown wedding';
      for (const k of ['tasks', 'sched', 'ex', 'iss', 'hrs', 'val'])
        if (J(o[k]) !== J(w[k])) return 'Only the planning team can change ' + k;
      for (const v of o.vs)
        if (J(v) !== J(w.vs.find(x => x.id === v.id)))
          return 'Only the planning team can change vendor details';
    }
  }
  return null;
}

/* ── server ── */
http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://x');
    if (req.method === 'OPTIONS') return send(res, 204);

    /* health */
    if (u.pathname === '/api/health')
      return send(res, 200, { ok: true, version: DB.version });

    /* ── STAFF LOGIN ── */
    if (u.pathname === '/api/login' && req.method === 'POST') {
      const b = await body(req);
      const a = Buffer.from(String(b.password || ''));
      const p = Buffer.from(PW[b.role] || '\0');
      if (!PW[b.role] || a.length !== p.length || !crypto.timingSafeEqual(a, p))
        return send(res, 401, { error: 'Wrong role or password' });
      const token = crypto.randomBytes(24).toString('hex');
      SES.set(token, { role: b.role });
      return send(res, 200, { token, role: b.role });
    }

    /* ── COUPLE REGISTER ── */
    if (u.pathname === '/api/couple/register' && req.method === 'POST') {
      const b = await body(req);
      const email = String(b.email || '').trim().toLowerCase();
      const pw    = String(b.password || '');
      const wid   = String(b.wid || '');
      const name  = String(b.name || '').trim();

      if (!email || !pw || pw.length < 6)
        return send(res, 400, { error: 'Email and a password (min 6 chars) are required' });
      if (!wid || !name)
        return send(res, 400, { error: 'Wedding ID and couple name are required' });
      if (COUPLES[email])
        return send(res, 409, { error: 'An account with this email already exists. Please sign in.' });

      const { hash, salt } = hashPw(pw);
      COUPLES[email] = { hash, salt, wid, name };
      saveCouples();

      const token = crypto.randomBytes(24).toString('hex');
      SES.set(token, { role: 'couple', wid });
      return send(res, 200, { token, role: 'couple', wid, name });
    }

    /* ── COUPLE LOGIN ── */
    if (u.pathname === '/api/couple/login' && req.method === 'POST') {
      const b = await body(req);
      const email = String(b.email || '').trim().toLowerCase();
      const pw    = String(b.password || '');

      // Built-in demo account — always works, maps to w1
      if (email === 'demo@royalknot.com' && pw === 'couple123') {
        const token = crypto.randomBytes(24).toString('hex');
        SES.set(token, { role: 'couple', wid: 'w1' });
        // If state is empty or w1 missing, mark for re-seed by clearing state
        if (!DB.state || !DB.state.w || !DB.state.w.find(w => w.id === 'w1')) {
          DB = { version: 0, state: null };
        }
        return send(res, 200, { token, role: 'couple', wid: 'w1', name: 'Aarav & Meera' });
      }

      const acc = COUPLES[email];
      if (!acc || !checkPw(pw, acc.hash, acc.salt))
        return send(res, 401, { error: 'Email or password is incorrect' });

      const token = crypto.randomBytes(24).toString('hex');
      SES.set(token, { role: 'couple', wid: acc.wid });
      return send(res, 200, { token, role: 'couple', wid: acc.wid, name: acc.name });
    }

    /* ── STATE endpoints (require auth) ── */
    if (u.pathname !== '/api/state') return send(res, 404, { error: 'Not found' });

    const ses = SES.get((req.headers.authorization || '').replace('Bearer ', ''));
    if (!ses) return send(res, 401, { error: 'Please sign in again' });
    const { role, wid } = ses;

    if (req.method === 'GET') {
      if (u.searchParams.get('since') !== null && +u.searchParams.get('since') === DB.version)
        return send(res, 200, { unchanged: true, version: DB.version });
      return send(res, 200, { state: DB.state, version: DB.version, wid: wid || null });
    }

    if (req.method === 'PUT') {
      const b = await body(req);
      if (b.version !== DB.version)
        return send(res, 409, { error: 'Someone else just changed this. The latest data has been loaded.' });
      const err = check(role, DB.state, b.state);
      if (err) return send(res, 422, { error: err });
      DB = { version: DB.version + 1, state: b.state };
      saveState();
      return send(res, 200, { version: DB.version });
    }

    send(res, 405, { error: 'Method not allowed' });
  } catch(e) {
    send(res, 400, { error: e.message });
  }
}).listen(PORT, () => console.log('Royal Knot API on http://localhost:' + PORT));
