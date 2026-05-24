# Cloudflare Access setup — `/admin/*` and `/api/*`

> ทำหลังจาก `wrangler deploy` ครั้งแรกสำเร็จแล้ว เพราะต้องมี Worker hostname ใน dashboard ก่อนถึงจะสร้าง Access application ครอบมันได้

## เป้าหมาย

- `oeg-links.oegl.workers.dev/admin*` — เข้าได้เฉพาะอีเมลที่อนุญาต (เจ้าของ + ทีม)
- `oeg-links.oegl.workers.dev/api/*` — เข้าได้เฉพาะอีเมลที่อนุญาต
- `oeg-links.oegl.workers.dev/<code>` (root level) — สาธารณะ ทุกคนคลิก redirect ได้

## วิธีตั้งค่าผ่าน Cloudflare dashboard

1. เข้า https://dash.cloudflare.com → เลือก account ของคุณ
2. ไปที่ **Zero Trust** (เมนูซ้าย ถ้าครั้งแรกจะให้สมัคร — เลือกแพ็ก **Free** เพราะรองรับ 50 users ฟรี)
3. ตั้งค่า team domain (ครั้งแรกเท่านั้น) — ตั้งเป็น `oeg` ก็ได้ จะกลายเป็น `oeg.cloudflareaccess.com`

### สร้าง Access Application

4. เมนูซ้าย → **Access** → **Applications** → **Add an application**
5. เลือก **Self-hosted**
6. กรอก:
   - **Application name:** `OEG Link Admin`
   - **Session duration:** `24 hours` (หรือสั้นกว่าถ้าต้องการเข้มงวด)
   - **Application domain:** เลือก/พิมพ์ `oeg-links.oegl.workers.dev`
   - **Path:** `admin` (โดยไม่มี slash นำ — จะคุม `/admin` และทุกอย่างใต้)
7. กด **Next**

### สร้าง Policy

8. ในหน้า Policies กด **Add a policy** หรือใช้ policy ที่มีอยู่:
   - **Policy name:** `OEG owner`
   - **Action:** `Allow`
   - **Configure rules:**
     - Include → **Emails** → ใส่ `Moddang428965@gmail.com`
     - (เพิ่มอีเมลทีมในอนาคตได้ใน policy เดียวกัน)
9. กด **Next** → **Add application**

### สร้าง Application ที่สอง (สำหรับ /api/*)

10. กลับมาที่ Applications → **Add an application** อีกครั้ง
11. ทำเหมือนข้อ 5–9 แต่:
    - **Application name:** `OEG Link API`
    - **Path:** `api`
    - ใช้ policy เดียวกัน (เลือกจาก dropdown หรือ copy)

## ทดสอบ

- เปิด `https://oeg-links.oegl.workers.dev/admin` ในโหมด incognito — ต้องเด้งหน้า Cloudflare Access ให้ login ด้วยอีเมล
- เปิด `https://oeg-links.oegl.workers.dev/<code>` (เปลี่ยน <code> เป็น code จริง) — ต้อง redirect ทันทีโดยไม่เจอ Access
- ทดสอบ API: `curl https://oeg-links.oegl.workers.dev/api/links` — ต้องโดน Access redirect (HTTP 302 ไปหน้า login)

## หมายเหตุ

- Cloudflare Access ครอบที่ระดับ network ก่อน Worker run — Worker ไม่ต้องเขียนโค้ดเช็คอะไรเลย ทุก request ที่ผ่านเข้ามาคือ authenticated แล้ว
- ถ้าอยากให้ Worker รู้ว่าใครเข้ามา (เพื่อ audit log) อ่าน header `Cf-Access-Authenticated-User-Email` จาก request
- การเพิ่ม/ถอดสมาชิก: ไป Access → Policies → แก้ rule ที่ include emails
