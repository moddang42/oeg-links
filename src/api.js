import { bangkokNowIso, bangkokIsoDaysAgo } from './time.js';

const CODE_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const RESERVED = new Set(['admin', 'api', 'healthz', 'favicon.ico', 'robots.txt']);

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const error = (msg, status = 400) => json({ error: msg }, status);

function validCode(code) {
  if (!code || typeof code !== 'string') return 'code is required';
  if (!CODE_RE.test(code)) return 'code must be a-z, 0-9, hyphen (cannot start/end with hyphen)';
  if (RESERVED.has(code)) return `code "${code}" is reserved`;
  return null;
}

function validUrl(u) {
  if (!u || typeof u !== 'string') return 'target_url is required';
  let parsed;
  try {
    parsed = new URL(u);
  } catch {
    return 'target_url is not a valid URL';
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return 'target_url must use http or https';
  }
  return null;
}

export async function handleApi(request, env, ctx) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean); // ['api', 'links', ':code', ...]

  if (parts[0] !== 'api') return error('not found', 404);
  if (parts[1] !== 'links') return error('not found', 404);

  // GET /api/links — list with stats
  if (parts.length === 2 && request.method === 'GET') {
    return listLinks(env);
  }

  // POST /api/links — create
  if (parts.length === 2 && request.method === 'POST') {
    return createLink(request, env);
  }

  const code = parts[2];
  if (!code) return error('not found', 404);

  // PUT /api/links/:code — update
  if (parts.length === 3 && request.method === 'PUT') {
    return updateLink(request, env, code);
  }

  // DELETE /api/links/:code — hard delete (also wipes clicks)
  if (parts.length === 3 && request.method === 'DELETE') {
    return deleteLink(env, code);
  }

  // PATCH /api/links/:code/status — archive / unarchive
  if (parts.length === 4 && parts[3] === 'status' && request.method === 'PATCH') {
    return updateStatus(request, env, code);
  }

  // GET /api/links/:code/analytics — daily clicks + countries
  if (parts.length === 4 && parts[3] === 'analytics' && request.method === 'GET') {
    return analytics(env, code);
  }

  return error('not found', 404);
}

async function listLinks(env) {
  const cutoff30 = bangkokIsoDaysAgo(30);
  const { results } = await env.DB
    .prepare(
      `SELECT l.code, l.target_url, l.title, l.category, l.tags, l.note, l.status,
              l.created_at, l.updated_at,
              COUNT(c.id) AS total_clicks,
              SUM(CASE WHEN c.clicked_at >= ?1 THEN 1 ELSE 0 END) AS clicks_30d,
              MAX(c.clicked_at) AS last_clicked_at
       FROM links l
       LEFT JOIN clicks c ON c.code = l.code
       GROUP BY l.code
       ORDER BY l.created_at DESC`
    )
    .bind(cutoff30)
    .all();

  const links = (results || []).map((r) => ({
    ...r,
    total_clicks: Number(r.total_clicks || 0),
    clicks_30d: Number(r.clicks_30d || 0),
  }));
  return json({ links });
}

async function createLink(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return error('invalid JSON body');
  }

  const code = (body.code || '').trim().toLowerCase();
  const target_url = (body.target_url || '').trim();
  const title = (body.title || '').trim() || null;
  const category = (body.category || '').trim() || null;
  const tags = (body.tags || '').trim() || null;
  const note = (body.note || '').trim() || null;

  const codeErr = validCode(code);
  if (codeErr) return error(codeErr);
  const urlErr = validUrl(target_url);
  if (urlErr) return error(urlErr);

  const now = bangkokNowIso();
  try {
    await env.DB
      .prepare(
        `INSERT INTO links (code, target_url, title, category, tags, note, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`
      )
      .bind(code, target_url, title, category, tags, note, now, now)
      .run();
  } catch (e) {
    const msg = String(e?.message || e);
    if (msg.includes('UNIQUE') || msg.includes('PRIMARY KEY')) {
      return error(`code "${code}" already exists`, 409);
    }
    return error(msg, 500);
  }

  return json({ ok: true, code }, 201);
}

async function updateLink(request, env, code) {
  let body;
  try {
    body = await request.json();
  } catch {
    return error('invalid JSON body');
  }

  const existing = await env.DB
    .prepare('SELECT code FROM links WHERE code = ?')
    .bind(code)
    .first();
  if (!existing) return error('link not found', 404);

  const target_url = (body.target_url || '').trim();
  const urlErr = validUrl(target_url);
  if (urlErr) return error(urlErr);

  const title = (body.title || '').trim() || null;
  const category = (body.category || '').trim() || null;
  const tags = (body.tags || '').trim() || null;
  const note = (body.note || '').trim() || null;
  const now = bangkokNowIso();

  await env.DB
    .prepare(
      `UPDATE links
       SET target_url = ?, title = ?, category = ?, tags = ?, note = ?, updated_at = ?
       WHERE code = ?`
    )
    .bind(target_url, title, category, tags, note, now, code)
    .run();

  return json({ ok: true });
}

async function updateStatus(request, env, code) {
  let body;
  try {
    body = await request.json();
  } catch {
    return error('invalid JSON body');
  }

  const status = body.status;
  if (status !== 'active' && status !== 'archived') {
    return error('status must be "active" or "archived"');
  }

  const res = await env.DB
    .prepare('UPDATE links SET status = ?, updated_at = ? WHERE code = ?')
    .bind(status, bangkokNowIso(), code)
    .run();

  if (!res.meta?.changes) return error('link not found', 404);
  return json({ ok: true, status });
}

async function deleteLink(env, code) {
  const res = await env.DB.batch([
    env.DB.prepare('DELETE FROM clicks WHERE code = ?').bind(code),
    env.DB.prepare('DELETE FROM links WHERE code = ?').bind(code),
  ]);
  const linkChanges = res[1]?.meta?.changes ?? 0;
  if (!linkChanges) return error('link not found', 404);
  return json({ ok: true });
}

async function analytics(env, code) {
  const link = await env.DB
    .prepare('SELECT code, target_url, title, status, created_at FROM links WHERE code = ?')
    .bind(code)
    .first();
  if (!link) return error('link not found', 404);

  const cutoff = bangkokIsoDaysAgo(30);

  const { results: dailyRows } = await env.DB
    .prepare(
      `SELECT substr(clicked_at, 1, 10) AS day, COUNT(*) AS n
       FROM clicks
       WHERE code = ? AND clicked_at >= ?
       GROUP BY day
       ORDER BY day`
    )
    .bind(code, cutoff)
    .all();

  const dailyMap = new Map((dailyRows || []).map((r) => [r.day, Number(r.n)]));
  const daily = [];
  for (let i = 29; i >= 0; i--) {
    const day = bangkokIsoDaysAgo(i).slice(0, 10);
    daily.push({ day, n: dailyMap.get(day) || 0 });
  }

  const { results: countryRows } = await env.DB
    .prepare(
      `SELECT COALESCE(country, 'XX') AS country, COUNT(*) AS n
       FROM clicks WHERE code = ?
       GROUP BY country
       ORDER BY n DESC
       LIMIT 20`
    )
    .bind(code)
    .all();

  const totalRow = await env.DB
    .prepare('SELECT COUNT(*) AS n, MAX(clicked_at) AS last FROM clicks WHERE code = ?')
    .bind(code)
    .first();

  return json({
    link,
    total_clicks: Number(totalRow?.n || 0),
    last_clicked_at: totalRow?.last || null,
    daily,
    countries: (countryRows || []).map((r) => ({ country: r.country, n: Number(r.n) })),
  });
}
