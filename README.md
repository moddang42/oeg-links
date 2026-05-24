# OEG Link Manager

ระบบจัดการ short link ภายในของ OEG รันบน Cloudflare Workers + D1 (free tier ทั้งหมด)

- Public redirect: `https://oeg-links.oegl.workers.dev/<code>`
- Admin UI: `https://oeg-links.oegl.workers.dev/admin` (ป้องกันด้วย Cloudflare Access)
- API: `https://oeg-links.oegl.workers.dev/api/*` (ป้องกันด้วย Cloudflare Access)

## โครงสร้าง

```
src/
  index.js     # Worker entry — router + redirect logic
  api.js       # REST API handlers (CRUD + analytics)
  admin.js     # Admin SPA (HTML/CSS/JS inlined)
migrations/
  0001_initial.sql
wrangler.toml
```

## คำสั่งที่ใช้บ่อย

```bash
npm run dev              # รัน Worker บนเครื่อง (localhost)
npm run deploy           # deploy ขึ้น Cloudflare
npm run db:migrate:local # apply migration ลง D1 local
npm run db:migrate:remote # apply migration ลง D1 บน Cloudflare
npm run tail             # ดู log สดของ Worker
```

## การตั้งค่าครั้งแรก

1. `npm install`
2. `npx wrangler login`
3. `npx wrangler d1 create oeg_links` → copy `database_id` ใส่ `wrangler.toml`
4. `npm run db:migrate:remote`
5. `npm run deploy`
6. ตั้ง Cloudflare Access ครอบ `/admin/*` และ `/api/*` (ดูคู่มือใน `docs/access.md`)
