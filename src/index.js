import { handleApi } from './api.js';
import { ADMIN_HTML } from './admin.js';
import { bangkokNowIso } from './time.js';

const NOT_FOUND_HTML = `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ไม่พบลิงก์ · OEG Link</title>
<style>
  :root { --navy:#152D4A; --orange:#FF893E; }
  * { box-sizing:border-box }
  body { margin:0; min-height:100vh; display:grid; place-items:center;
    font-family:'Inter',system-ui,sans-serif; background:#F6F7F9; color:var(--navy); padding:24px }
  .card { max-width:420px; text-align:center; padding:40px 28px;
    background:#fff; border-radius:16px; box-shadow:0 8px 32px rgba(21,45,74,.08) }
  h1 { font-family:'DM Serif Display',serif; font-size:28px; margin:0 0 8px; color:var(--navy) }
  p { margin:8px 0; color:#516074; line-height:1.55 }
  a { color:var(--orange); font-weight:600; text-decoration:none }
  .code { display:inline-block; padding:2px 8px; background:#F0F2F5;
    border-radius:6px; font-family:ui-monospace,monospace; font-size:13px }
</style>
</head>
<body>
  <div class="card">
    <h1>ไม่พบลิงก์</h1>
    <p>ลิงก์ <span class="code" id="c"></span> ไม่มีอยู่ในระบบ หรือถูกเก็บเข้าคลังแล้ว</p>
    <p>หากคิดว่าเป็นข้อผิดพลาด ติดต่อทีม OEG</p>
  </div>
  <script>document.getElementById('c').textContent = location.pathname;</script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Admin SPA — served at /admin and /admin/* (Cloudflare Access gates this)
    if (path === '/admin' || path.startsWith('/admin/')) {
      return new Response(ADMIN_HTML, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store',
        },
      });
    }

    // REST API — Cloudflare Access gates this too
    if (path.startsWith('/api/')) {
      return handleApi(request, env, ctx);
    }

    // Root: send the curious visitor to the admin
    if (path === '/' || path === '') {
      return Response.redirect(new URL('/admin', url).toString(), 302);
    }

    // Health check
    if (path === '/healthz') {
      return new Response('ok', { headers: { 'content-type': 'text/plain' } });
    }

    // Anything else → treat as a short-link code
    return handleRedirect(request, env, ctx, path.slice(1));
  },
};

async function handleRedirect(request, env, ctx, code) {
  if (!code || code.includes('/')) {
    return new Response(NOT_FOUND_HTML, {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  const row = await env.DB
    .prepare('SELECT target_url, status FROM links WHERE code = ?')
    .bind(code)
    .first();

  if (!row || row.status !== 'active') {
    return new Response(NOT_FOUND_HTML, {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  // Log the click asynchronously — must NOT delay the redirect.
  const referer = request.headers.get('referer') || null;
  const country = request.cf?.country || null;
  const clickedAt = bangkokNowIso();

  ctx.waitUntil(
    env.DB
      .prepare('INSERT INTO clicks (code, clicked_at, referer, country) VALUES (?, ?, ?, ?)')
      .bind(code, clickedAt, referer, country)
      .run()
      .catch((err) => console.error('click log failed', code, err))
  );

  return Response.redirect(row.target_url, 302);
}
