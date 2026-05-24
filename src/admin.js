// Admin SPA — single-page app served at /admin. All HTML/CSS/JS inlined.
// Cloudflare Access gates this route, so we trust the caller is authenticated.

export const ADMIN_HTML = String.raw`<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>OEG Link Manager</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&display=swap">
<style>
  :root {
    --navy: #152D4A;
    --navy-soft: #2A4366;
    --orange: #FF893E;
    --orange-soft: #FFE7D5;
    --ink: #1F2A3D;
    --muted: #5E6B7E;
    --line: #E4E7EC;
    --bg: #F6F7F9;
    --surface: #FFFFFF;
    --danger: #D6452C;
    --success: #2B8754;
    --radius: 12px;
    --radius-sm: 8px;
    --shadow: 0 1px 2px rgba(21,45,74,.04), 0 4px 16px rgba(21,45,74,.06);
  }
  * { box-sizing: border-box }
  html, body { margin: 0; padding: 0 }
  body {
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--bg);
    color: var(--ink);
    font-size: 14px;
    line-height: 1.5;
  }
  h1, h2, h3 { font-family: 'DM Serif Display', serif; font-weight: 400; color: var(--navy); margin: 0 }
  a { color: var(--orange); text-decoration: none }
  a:hover { text-decoration: underline }

  /* Header */
  header.app-header {
    background: var(--navy);
    color: #fff;
    padding: 16px 24px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .brand { display: flex; align-items: baseline; gap: 12px }
  .brand .mark {
    font-family: 'DM Serif Display', serif; font-size: 22px;
    background: var(--orange); color: var(--navy);
    padding: 2px 10px; border-radius: 6px;
  }
  .brand h1 { color: #fff; font-size: 22px; line-height: 1 }
  .brand .sub { font-size: 12px; color: #B7C2D4; letter-spacing: .05em; text-transform: uppercase }

  /* Layout */
  main { max-width: 1280px; margin: 0 auto; padding: 24px }

  /* Toolbar */
  .toolbar {
    background: var(--surface); border-radius: var(--radius); padding: 16px;
    box-shadow: var(--shadow); margin-bottom: 20px;
    display: grid; grid-template-columns: 1fr 200px 200px auto; gap: 12px;
  }
  .toolbar input, .toolbar select {
    border: 1px solid var(--line); border-radius: var(--radius-sm);
    padding: 10px 12px; font: inherit; color: var(--ink); background: #fff;
    width: 100%;
  }
  .toolbar input:focus, .toolbar select:focus {
    outline: none; border-color: var(--orange); box-shadow: 0 0 0 3px var(--orange-soft);
  }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    border: none; border-radius: var(--radius-sm); cursor: pointer;
    font: inherit; font-weight: 600; padding: 10px 16px;
    transition: transform .04s, box-shadow .15s;
  }
  .btn:active { transform: translateY(1px) }
  .btn-primary { background: var(--orange); color: var(--navy) }
  .btn-primary:hover { box-shadow: 0 4px 14px rgba(255,137,62,.4) }
  .btn-ghost { background: transparent; color: var(--navy); padding: 6px 10px; font-weight: 500 }
  .btn-ghost:hover { background: #EFF1F5 }
  .btn-danger { background: var(--danger); color: #fff }
  .btn-danger:hover { box-shadow: 0 4px 14px rgba(214,69,44,.35) }
  .btn-sm { padding: 6px 12px; font-size: 13px }
  .btn:disabled { opacity: .5; cursor: not-allowed }

  /* Card / table */
  .card {
    background: var(--surface); border-radius: var(--radius);
    box-shadow: var(--shadow); overflow: hidden;
  }
  table.links { width: 100%; border-collapse: collapse; table-layout: fixed }
  table.links th, table.links td {
    text-align: left; padding: 14px 16px; border-bottom: 1px solid var(--line);
    vertical-align: middle;
    overflow: hidden;
  }
  table.links th:nth-child(1) { width: 22% }   /* ลิงก์ */
  table.links th:nth-child(2) { width: 26% }   /* ปลายทาง */
  table.links th:nth-child(3) { width: 10% }   /* หมวด */
  table.links th:nth-child(4) { width: 7%  }   /* คลิกรวม */
  table.links th:nth-child(5) { width: 7%  }   /* 30 วัน */
  table.links th:nth-child(6) { width: 11% }   /* คลิกล่าสุด */
  table.links th:nth-child(7) { width: 7%  }   /* สถานะ */
  table.links th:nth-child(8) { width: 10%; min-width: 130px }  /* actions */

  table.links th {
    font-size: 11px; text-transform: uppercase; letter-spacing: .08em;
    color: var(--muted); font-weight: 600; background: #FAFBFC;
  }
  table.links tr:last-child td { border-bottom: none }
  table.links tr:hover td { background: #FAFBFC }

  .link-title {
    font-weight: 600; color: var(--navy);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .link-code-row {
    display: flex; align-items: center; gap: 6px; margin-top: 4px;
    font-size: 12px; flex-wrap: wrap;
  }
  .link-code {
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    color: var(--muted); background: #F0F2F5; padding: 2px 7px; border-radius: 4px;
    max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .copy-btn {
    border: none; background: transparent; cursor: pointer; color: var(--muted);
    padding: 2px 6px; border-radius: 4px; font-size: 11px;
    white-space: nowrap; flex-shrink: 0;
  }
  .copy-btn:hover { background: var(--orange-soft); color: var(--navy) }
  .copy-btn.copied { color: var(--success); font-weight: 600 }
  .copy-btn-line { color: #06C755; font-weight: 600 }
  .copy-btn-line:hover { background: #E5F8EE; color: #06C755 }

  .target {
    display: block; color: var(--muted); font-size: 13px;
    max-width: 100%;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .num { font-variant-numeric: tabular-nums; font-weight: 600; color: var(--navy) }
  .num.zero { color: var(--muted); font-weight: 400 }

  .pill {
    display: inline-block; padding: 2px 8px; border-radius: 999px;
    font-size: 11px; font-weight: 600; letter-spacing: .03em;
  }
  .pill-active { background: #E8F5EE; color: var(--success) }
  .pill-archived { background: #F0F2F5; color: var(--muted) }
  .pill-cat { background: var(--orange-soft); color: #B5571C }

  .actions { display: flex; gap: 4px; justify-content: flex-end }
  .icon-btn {
    border: none; background: transparent; cursor: pointer;
    padding: 6px 8px; border-radius: 6px; color: var(--navy-soft); font-size: 14px;
  }
  .icon-btn:hover { background: #EFF1F5; color: var(--navy) }
  .icon-btn.danger:hover { background: #FCEEEB; color: var(--danger) }

  /* Empty state */
  .empty {
    padding: 60px 20px; text-align: center; color: var(--muted);
  }
  .empty h2 { font-size: 22px; margin-bottom: 8px }
  .empty p { margin: 4px 0 20px }

  /* Modal */
  .modal-back {
    position: fixed; inset: 0; background: rgba(21,45,74,.5);
    display: flex; align-items: center; justify-content: center;
    padding: 20px; z-index: 100;
    animation: fade .15s ease-out;
  }
  @keyframes fade { from { opacity: 0 } to { opacity: 1 } }
  .modal {
    background: var(--surface); border-radius: var(--radius);
    width: 100%; max-width: 540px; max-height: 90vh; overflow: auto;
    box-shadow: 0 16px 48px rgba(21,45,74,.25);
  }
  .modal.wide { max-width: 760px }
  .modal-head {
    padding: 20px 24px; border-bottom: 1px solid var(--line);
    display: flex; align-items: center; justify-content: space-between;
  }
  .modal-head h2 { font-size: 22px }
  .modal-body { padding: 20px 24px }
  .modal-foot {
    padding: 16px 24px; border-top: 1px solid var(--line);
    display: flex; gap: 8px; justify-content: flex-end;
  }

  /* Form */
  .field { margin-bottom: 16px }
  .field label {
    display: block; font-weight: 600; font-size: 12px; color: var(--navy);
    text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px;
  }
  .field label .req { color: var(--danger) }
  .field input, .field textarea, .field select {
    width: 100%; border: 1px solid var(--line); border-radius: var(--radius-sm);
    padding: 10px 12px; font: inherit; color: var(--ink); background: #fff;
  }
  .field input:focus, .field textarea:focus, .field select:focus {
    outline: none; border-color: var(--orange); box-shadow: 0 0 0 3px var(--orange-soft);
  }
  .field .hint { font-size: 12px; color: var(--muted); margin-top: 4px }
  .field .err { color: var(--danger); font-size: 12px; margin-top: 4px; font-weight: 500 }
  .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px }

  /* Analytics */
  .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px }
  .stat {
    background: #FAFBFC; padding: 14px; border-radius: var(--radius-sm);
    border: 1px solid var(--line);
  }
  .stat .label { font-size: 11px; text-transform: uppercase; color: var(--muted); letter-spacing: .05em }
  .stat .value { font-family: 'DM Serif Display', serif; font-size: 26px; color: var(--navy); margin-top: 4px }
  .stat .value small { font-family: 'Inter', sans-serif; font-size: 13px; color: var(--muted); font-weight: 400 }

  .chart-title { font-size: 12px; text-transform: uppercase; color: var(--muted); margin: 12px 0 8px; font-weight: 600; letter-spacing: .05em }
  .chart svg { display: block; width: 100% }
  .chart .bar { fill: var(--orange); transition: fill .1s }
  .chart .bar:hover { fill: var(--navy) }
  .chart .axis { stroke: var(--line); stroke-width: 1 }
  .chart .label { font-size: 10px; fill: var(--muted) }

  .countries { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px }
  .country-pill {
    background: #F0F2F5; padding: 4px 10px; border-radius: 6px; font-size: 12px;
    color: var(--ink);
  }
  .country-pill strong { color: var(--navy); margin-right: 4px }

  /* Toast */
  .toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: var(--navy); color: #fff; padding: 12px 20px;
    border-radius: var(--radius-sm); box-shadow: 0 8px 32px rgba(21,45,74,.3);
    font-weight: 500; z-index: 200;
    animation: slideup .2s ease-out;
  }
  .toast.error { background: var(--danger) }
  @keyframes slideup { from { transform: translate(-50%, 20px); opacity: 0 } to { transform: translate(-50%, 0); opacity: 1 } }

  /* Loading */
  .loading { padding: 60px; text-align: center; color: var(--muted) }
  .spinner {
    display: inline-block; width: 24px; height: 24px;
    border: 3px solid var(--line); border-top-color: var(--orange);
    border-radius: 50%; animation: spin .8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg) } }

  /* Responsive */
  @media (max-width: 880px) {
    .toolbar { grid-template-columns: 1fr 1fr; }
    .toolbar .btn-primary { grid-column: 1 / -1 }
    .stats-row { grid-template-columns: 1fr }
    .row-2 { grid-template-columns: 1fr }

    /* Convert table to cards */
    table.links { table-layout: auto }
    table.links thead { display: none }
    table.links tr {
      display: block; padding: 16px; border-bottom: 1px solid var(--line);
    }
    table.links tr:hover td { background: transparent }
    table.links th, table.links td { width: auto; overflow: visible }
    table.links td {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 6px 0; border: none; gap: 12px;
    }
    table.links td::before {
      content: attr(data-label); font-size: 11px; text-transform: uppercase;
      letter-spacing: .05em; color: var(--muted); font-weight: 600;
      flex-shrink: 0; padding-top: 2px; min-width: 80px;
    }
    table.links td:first-child { display: block; padding-bottom: 10px }
    table.links td:first-child::before { display: none }
    table.links td.actions {
      justify-content: flex-end; padding-top: 12px; flex-wrap: wrap;
    }
    table.links td.actions::before { display: none }

    /* Title: wrap freely on mobile (was single-line ellipsis on desktop) */
    .link-title { white-space: normal; overflow: visible; }

    /* Long URLs: break wherever they need to */
    .target {
      white-space: normal; word-break: break-all;
      text-align: right; max-width: 70%;
    }

    /* Bigger touch targets */
    .icon-btn { padding: 10px 12px; font-size: 16px }
    .copy-btn { padding: 4px 10px; font-size: 12px }
  }

  @media (max-width: 540px) {
    header.app-header { padding: 14px 16px }
    .brand h1 { font-size: 18px }
    .brand .sub { display: none }
    main { padding: 12px }
    .toolbar { grid-template-columns: 1fr; padding: 12px }
    .toolbar .btn-primary { grid-column: auto }
    .modal { border-radius: 12px 12px 0 0; max-height: 95vh }
    .modal-back { padding: 0; align-items: flex-end }
    .modal-head { padding: 16px 18px }
    .modal-body { padding: 16px 18px }
    .modal-foot { padding: 12px 18px }
    .stat .value { font-size: 22px }
  }
</style>
</head>
<body>

<header class="app-header">
  <div class="brand">
    <span class="mark">O</span>
    <div>
      <h1>OEG Link Manager</h1>
      <div class="sub">Short-link control panel</div>
    </div>
  </div>
</header>

<main>
  <div class="toolbar">
    <input id="search" type="search" placeholder="ค้นหา title, code, target, tags..." autocomplete="off">
    <select id="filter-cat"><option value="">หมวดทั้งหมด</option></select>
    <select id="sort">
      <option value="created_desc">ใหม่ → เก่า</option>
      <option value="created_asc">เก่า → ใหม่</option>
      <option value="total_desc">คลิกรวมมาก → น้อย</option>
      <option value="d30_desc">30 วันมาก → น้อย</option>
      <option value="last_desc">คลิกล่าสุด → เก่า</option>
      <option value="code_asc">code A → Z</option>
    </select>
    <button class="btn btn-primary" id="btn-add">+ เพิ่มลิงก์</button>
  </div>

  <div class="card">
    <div id="list-area">
      <div class="loading"><div class="spinner"></div><div style="margin-top:12px">กำลังโหลด...</div></div>
    </div>
  </div>
</main>

<div id="modal-root"></div>
<div id="toast-root"></div>

<script>
//============================================================
// State + utilities
//============================================================
const ORIGIN = location.origin;
let LINKS = [];
let FILTER = { q: '', cat: '', sort: 'created_desc' };

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function esc(s) {
  return (s == null ? '' : String(s))
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function shortUrl(code) { return ORIGIN + '/' + code }
function lineUrl(code) { return shortUrl(code) + '?openExternalBrowser=1' }

function fmtDateTime(iso) {
  if (!iso) return '—';
  // iso looks like 2026-05-24T15:30:00.000+07:00 — show as "24 May 26, 15:30"
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const opts = { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' };
  return new Intl.DateTimeFormat('en-GB', opts).format(d).replace(',', '');
}

function fmtRelative(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'เพิ่งคลิก';
  if (diff < 3600) return Math.floor(diff/60) + ' นาทีที่แล้ว';
  if (diff < 86400) return Math.floor(diff/3600) + ' ชม.ที่แล้ว';
  if (diff < 86400*7) return Math.floor(diff/86400) + ' วันที่แล้ว';
  return fmtDateTime(iso);
}

function toast(msg, kind = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + kind;
  t.textContent = msg;
  $('#toast-root').appendChild(t);
  setTimeout(() => t.remove(), 2400);
}

async function api(method, path, body) {
  const res = await fetch('/api' + path, {
    method,
    headers: body ? { 'content-type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
  return data;
}

//============================================================
// Load + render list
//============================================================
async function loadLinks() {
  try {
    const data = await api('GET', '/links');
    LINKS = data.links || [];
    refreshCategoryFilter();
    renderList();
  } catch (e) {
    $('#list-area').innerHTML = '<div class="empty"><h2>โหลดข้อมูลไม่ได้</h2><p>' + esc(e.message) + '</p></div>';
  }
}

function refreshCategoryFilter() {
  const cats = Array.from(new Set(LINKS.map(l => l.category).filter(Boolean))).sort();
  const sel = $('#filter-cat');
  const current = sel.value;
  sel.innerHTML = '<option value="">หมวดทั้งหมด</option>' +
    cats.map(c => '<option value="' + esc(c) + '"' + (c === current ? ' selected' : '') + '>' + esc(c) + '</option>').join('');
}

function applyFilters(links) {
  const q = FILTER.q.trim().toLowerCase();
  const cat = FILTER.cat;
  let out = links.filter(l => {
    if (cat && l.category !== cat) return false;
    if (!q) return true;
    const hay = [l.code, l.title, l.target_url, l.tags, l.category, l.note].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q);
  });
  const sorters = {
    created_desc: (a,b) => (b.created_at || '').localeCompare(a.created_at || ''),
    created_asc:  (a,b) => (a.created_at || '').localeCompare(b.created_at || ''),
    total_desc:   (a,b) => b.total_clicks - a.total_clicks,
    d30_desc:     (a,b) => b.clicks_30d - a.clicks_30d,
    last_desc:    (a,b) => (b.last_clicked_at || '').localeCompare(a.last_clicked_at || ''),
    code_asc:     (a,b) => a.code.localeCompare(b.code),
  };
  out.sort(sorters[FILTER.sort] || sorters.created_desc);
  return out;
}

function renderList() {
  const filtered = applyFilters(LINKS);
  const area = $('#list-area');
  if (LINKS.length === 0) {
    area.innerHTML =
      '<div class="empty">' +
        '<h2>ยังไม่มีลิงก์</h2>' +
        '<p>เริ่มต้นด้วยการเพิ่มลิงก์แรก</p>' +
        '<button class="btn btn-primary" onclick="openAddModal()">+ เพิ่มลิงก์</button>' +
      '</div>';
    return;
  }
  if (filtered.length === 0) {
    area.innerHTML =
      '<div class="empty">' +
        '<h2>ไม่พบลิงก์ที่ตรงกับเงื่อนไข</h2>' +
        '<p>ลองล้างคำค้นหาหรือเปลี่ยนหมวด</p>' +
      '</div>';
    return;
  }

  const rows = filtered.map(l => {
    const isArchived = l.status === 'archived';
    const cat = l.category ? '<span class="pill pill-cat">' + esc(l.category) + '</span>' : '<span style="color:var(--muted);font-size:12px">—</span>';
    const statusPill = isArchived
      ? '<span class="pill pill-archived">เก็บแล้ว</span>'
      : '<span class="pill pill-active">ใช้งาน</span>';
    return (
      '<tr data-code="' + esc(l.code) + '">' +
        '<td data-label="ลิงก์">' +
          '<div class="link-title">' + esc(l.title || l.code) + '</div>' +
          '<div class="link-code-row">' +
            '<span class="link-code">/' + esc(l.code) + '</span>' +
            '<button class="copy-btn" onclick="copyShort(\'' + esc(l.code) + '\', this)" title="คัดลอก URL ปกติ">คัดลอก</button>' +
            '<button class="copy-btn copy-btn-line" onclick="copyLine(\'' + esc(l.code) + '\', this)" title="คัดลอกสำหรับ LINE — บังคับเปิดในเบราว์เซอร์ภายนอก">LINE</button>' +
          '</div>' +
        '</td>' +
        '<td data-label="ปลายทาง"><a class="target" href="' + esc(l.target_url) + '" target="_blank" rel="noopener" title="' + esc(l.target_url) + '">' + esc(l.target_url) + '</a></td>' +
        '<td data-label="หมวด">' + cat + '</td>' +
        '<td data-label="คลิกรวม"><span class="num ' + (l.total_clicks ? '' : 'zero') + '">' + l.total_clicks + '</span></td>' +
        '<td data-label="30 วัน"><span class="num ' + (l.clicks_30d ? '' : 'zero') + '">' + l.clicks_30d + '</span></td>' +
        '<td data-label="คลิกล่าสุด"><span style="color:var(--muted);font-size:13px">' + esc(fmtRelative(l.last_clicked_at)) + '</span></td>' +
        '<td data-label="สถานะ">' + statusPill + '</td>' +
        '<td class="actions" data-label="">' +
          '<button class="icon-btn" title="ดูสถิติ" onclick="openAnalytics(\'' + esc(l.code) + '\')">📊</button>' +
          '<button class="icon-btn" title="แก้ไข" onclick="openEditModal(\'' + esc(l.code) + '\')">✏️</button>' +
          '<button class="icon-btn" title="' + (isArchived ? 'เปิดใช้งาน' : 'เก็บเข้าคลัง') + '" onclick="toggleArchive(\'' + esc(l.code) + '\', ' + isArchived + ')">' + (isArchived ? '↩️' : '📦') + '</button>' +
          '<button class="icon-btn danger" title="ลบถาวร" onclick="confirmDelete(\'' + esc(l.code) + '\')">🗑️</button>' +
        '</td>' +
      '</tr>'
    );
  }).join('');

  area.innerHTML =
    '<table class="links">' +
      '<thead><tr>' +
        '<th>ลิงก์</th><th>ปลายทาง</th><th>หมวด</th>' +
        '<th>คลิกรวม</th><th>30 วัน</th><th>คลิกล่าสุด</th>' +
        '<th>สถานะ</th><th></th>' +
      '</tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table>';
}

//============================================================
// Copy short URL
//============================================================
window.copyShort = async (code, btn) => {
  try {
    await navigator.clipboard.writeText(shortUrl(code));
    const orig = btn.textContent;
    btn.textContent = '✓ คัดลอก!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
  } catch {
    toast('คัดลอกไม่ได้ ลองใหม่', 'error');
  }
};

window.copyLine = async (code, btn) => {
  try {
    await navigator.clipboard.writeText(lineUrl(code));
    const orig = btn.textContent;
    btn.textContent = '✓ LINE!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
  } catch {
    toast('คัดลอกไม่ได้ ลองใหม่', 'error');
  }
};

//============================================================
// Modals — generic
//============================================================
function closeModal() { $('#modal-root').innerHTML = '' }

function showModal(html) {
  const root = $('#modal-root');
  root.innerHTML = '<div class="modal-back" id="modal-back">' + html + '</div>';
  $('#modal-back').addEventListener('click', (e) => {
    if (e.target.id === 'modal-back') closeModal();
  });
  document.addEventListener('keydown', escClose);
}
function escClose(e) {
  if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escClose); }
}

//============================================================
// Add / Edit modal
//============================================================
window.openAddModal = () => openLinkForm(null);
window.openEditModal = (code) => {
  const link = LINKS.find(l => l.code === code);
  if (link) openLinkForm(link);
};

function openLinkForm(link) {
  const isEdit = !!link;
  const v = link || { code: '', target_url: '', title: '', category: '', tags: '', note: '' };
  showModal(
    '<div class="modal">' +
      '<div class="modal-head"><h2>' + (isEdit ? 'แก้ไขลิงก์' : 'เพิ่มลิงก์ใหม่') + '</h2><button class="btn btn-ghost" onclick="closeModal()">✕</button></div>' +
      '<div class="modal-body">' +
        '<form id="link-form" onsubmit="return false">' +
          '<div class="field">' +
            '<label>Code (ส่วนต่อท้าย URL) <span class="req">*</span></label>' +
            '<input name="code" value="' + esc(v.code) + '" ' + (isEdit ? 'disabled' : 'autofocus') + ' placeholder="summer-promo" pattern="[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?" required>' +
            '<div class="hint">a-z, 0-9, ขีดกลาง · ลิงก์ที่ได้: <code>' + esc(ORIGIN) + '/<b>code</b></code>' + (isEdit ? ' · แก้ไม่ได้หลังสร้างแล้ว' : '') + '</div>' +
            '<div class="err" id="err-code"></div>' +
          '</div>' +
          '<div class="field">' +
            '<label>ปลายทาง (URL) <span class="req">*</span></label>' +
            '<input name="target_url" type="url" value="' + esc(v.target_url) + '" placeholder="https://..." required>' +
            '<div class="hint">เปลี่ยนได้ตลอด · ลิงก์ short URL เดิมจะใช้ปลายทางใหม่ทันที</div>' +
            '<div class="err" id="err-url"></div>' +
          '</div>' +
          '<div class="field">' +
            '<label>ชื่อลิงก์ (สำหรับให้คนอ่านเข้าใจ)</label>' +
            '<input name="title" value="' + esc(v.title) + '" placeholder="Summer Promo Landing Page">' +
          '</div>' +
          '<div class="row-2">' +
            '<div class="field">' +
              '<label>หมวด</label>' +
              '<input name="category" value="' + esc(v.category) + '" placeholder="marketing">' +
            '</div>' +
            '<div class="field">' +
              '<label>Tags</label>' +
              '<input name="tags" value="' + esc(v.tags) + '" placeholder="คั่นด้วย ,">' +
            '</div>' +
          '</div>' +
          '<div class="field">' +
            '<label>โน้ต</label>' +
            '<textarea name="note" rows="2" placeholder="คำอธิบายสั้น...">' + esc(v.note) + '</textarea>' +
          '</div>' +
        '</form>' +
      '</div>' +
      '<div class="modal-foot">' +
        '<button class="btn btn-ghost" onclick="closeModal()">ยกเลิก</button>' +
        '<button class="btn btn-primary" id="btn-save">' + (isEdit ? 'บันทึก' : 'สร้างลิงก์') + '</button>' +
      '</div>' +
    '</div>'
  );

  $('#btn-save').addEventListener('click', () => submitLinkForm(isEdit));
}

async function submitLinkForm(isEdit) {
  const form = $('#link-form');
  const fd = new FormData(form);
  const body = {
    code: (fd.get('code') || '').toString().trim().toLowerCase(),
    target_url: (fd.get('target_url') || '').toString().trim(),
    title: (fd.get('title') || '').toString().trim(),
    category: (fd.get('category') || '').toString().trim(),
    tags: (fd.get('tags') || '').toString().trim(),
    note: (fd.get('note') || '').toString().trim(),
  };

  $('#err-code').textContent = '';
  $('#err-url').textContent = '';

  if (!/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(body.code)) {
    $('#err-code').textContent = 'รูปแบบ code ไม่ถูกต้อง (a-z, 0-9, ขีดกลาง)';
    return;
  }
  try { new URL(body.target_url) } catch {
    $('#err-url').textContent = 'URL ไม่ถูกต้อง';
    return;
  }

  const btn = $('#btn-save');
  btn.disabled = true; btn.textContent = 'กำลังบันทึก...';
  try {
    if (isEdit) {
      const { code, ...rest } = body;
      await api('PUT', '/links/' + encodeURIComponent(code), rest);
      toast('บันทึกแล้ว');
    } else {
      await api('POST', '/links', body);
      toast('สร้างลิงก์แล้ว');
    }
    closeModal();
    loadLinks();
  } catch (e) {
    if (/exists|UNIQUE/i.test(e.message)) {
      $('#err-code').textContent = 'code นี้มีอยู่แล้ว';
    } else if (/url/i.test(e.message)) {
      $('#err-url').textContent = e.message;
    } else {
      toast(e.message, 'error');
    }
    btn.disabled = false; btn.textContent = isEdit ? 'บันทึก' : 'สร้างลิงก์';
  }
}

//============================================================
// Archive / unarchive
//============================================================
window.toggleArchive = async (code, currentlyArchived) => {
  const next = currentlyArchived ? 'active' : 'archived';
  try {
    await api('PATCH', '/links/' + encodeURIComponent(code) + '/status', { status: next });
    toast(next === 'active' ? 'เปิดใช้งานแล้ว' : 'เก็บเข้าคลังแล้ว');
    loadLinks();
  } catch (e) { toast(e.message, 'error') }
};

//============================================================
// Hard delete (with confirm)
//============================================================
window.confirmDelete = (code) => {
  const link = LINKS.find(l => l.code === code);
  const totalClicks = link ? link.total_clicks : 0;
  showModal(
    '<div class="modal">' +
      '<div class="modal-head"><h2>ลบลิงก์ถาวร?</h2><button class="btn btn-ghost" onclick="closeModal()">✕</button></div>' +
      '<div class="modal-body">' +
        '<p>กำลังจะลบ <code>/' + esc(code) + '</code> และข้อมูลคลิกทั้งหมด (' + totalClicks + ' คลิก) อย่างถาวร</p>' +
        '<p style="color:var(--danger);font-weight:600;margin-top:12px">การลบนี้ย้อนกลับไม่ได้</p>' +
        '<p style="color:var(--muted);font-size:13px">หากแค่อยากซ่อนลิงก์ ใช้ "เก็บเข้าคลัง" จะปลอดภัยกว่า</p>' +
      '</div>' +
      '<div class="modal-foot">' +
        '<button class="btn btn-ghost" onclick="closeModal()">ยกเลิก</button>' +
        '<button class="btn btn-danger" onclick="doDelete(\'' + esc(code) + '\')">ลบถาวร</button>' +
      '</div>' +
    '</div>'
  );
};
window.doDelete = async (code) => {
  try {
    await api('DELETE', '/links/' + encodeURIComponent(code));
    toast('ลบแล้ว');
    closeModal();
    loadLinks();
  } catch (e) { toast(e.message, 'error') }
};

//============================================================
// Analytics modal
//============================================================
window.openAnalytics = async (code) => {
  showModal(
    '<div class="modal wide">' +
      '<div class="modal-head"><h2>สถิติ <code style="font-family:ui-monospace,monospace;font-size:16px;color:var(--orange)">/' + esc(code) + '</code></h2><button class="btn btn-ghost" onclick="closeModal()">✕</button></div>' +
      '<div class="modal-body" id="ana-body"><div class="loading"><div class="spinner"></div></div></div>' +
    '</div>'
  );
  try {
    const data = await api('GET', '/links/' + encodeURIComponent(code) + '/analytics');
    renderAnalytics(data);
  } catch (e) {
    $('#ana-body').innerHTML = '<div class="empty">' + esc(e.message) + '</div>';
  }
};

function renderAnalytics(data) {
  const max = Math.max(1, ...data.daily.map(d => d.n));
  const W = 600, H = 180, P = 24;
  const innerW = W - P * 2;
  const innerH = H - P * 2;
  const barW = innerW / data.daily.length;

  const bars = data.daily.map((d, i) => {
    const h = (d.n / max) * innerH;
    const x = P + i * barW;
    const y = P + innerH - h;
    return '<rect class="bar" x="' + (x + 1) + '" y="' + y + '" width="' + (barW - 2) + '" height="' + h + '">' +
      '<title>' + d.day + ': ' + d.n + ' คลิก</title>' +
    '</rect>';
  }).join('');

  const firstLabel = data.daily[0]?.day || '';
  const lastLabel = data.daily[data.daily.length - 1]?.day || '';
  const last30Total = data.daily.reduce((s, d) => s + d.n, 0);

  const countries = data.countries.length === 0
    ? '<div style="color:var(--muted);font-size:13px">ยังไม่มีข้อมูล</div>'
    : '<div class="countries">' + data.countries.map(c =>
        '<span class="country-pill"><strong>' + esc(c.country) + '</strong>' + c.n + '</span>'
      ).join('') + '</div>';

  $('#ana-body').innerHTML =
    '<div class="stats-row">' +
      '<div class="stat"><div class="label">คลิกรวม</div><div class="value">' + data.total_clicks + '</div></div>' +
      '<div class="stat"><div class="label">30 วันล่าสุด</div><div class="value">' + last30Total + '</div></div>' +
      '<div class="stat"><div class="label">คลิกล่าสุด</div><div class="value" style="font-size:14px;font-family:Inter;padding-top:10px">' + esc(fmtDateTime(data.last_clicked_at)) + '</div></div>' +
    '</div>' +
    '<div class="chart-title">คลิกรายวัน (30 วันล่าสุด)</div>' +
    '<div class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' +
      '<line class="axis" x1="' + P + '" y1="' + (H-P) + '" x2="' + (W-P) + '" y2="' + (H-P) + '"></line>' +
      bars +
      '<text class="label" x="' + P + '" y="' + (H-6) + '">' + firstLabel + '</text>' +
      '<text class="label" x="' + (W-P) + '" y="' + (H-6) + '" text-anchor="end">' + lastLabel + '</text>' +
      '<text class="label" x="' + P + '" y="' + (P-4) + '">สูงสุด ' + max + '</text>' +
    '</svg></div>' +
    '<div class="chart-title" style="margin-top:20px">แยกตามประเทศ (top 20)</div>' +
    countries +
    '<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)">' +
      'ปลายทาง: <a href="' + esc(data.link.target_url) + '" target="_blank" rel="noopener">' + esc(data.link.target_url) + '</a>' +
    '</div>';
}

//============================================================
// Wire up toolbar
//============================================================
$('#search').addEventListener('input', (e) => { FILTER.q = e.target.value; renderList() });
$('#filter-cat').addEventListener('change', (e) => { FILTER.cat = e.target.value; renderList() });
$('#sort').addEventListener('change', (e) => { FILTER.sort = e.target.value; renderList() });
$('#btn-add').addEventListener('click', () => openAddModal());

loadLinks();
</script>

</body>
</html>`;
