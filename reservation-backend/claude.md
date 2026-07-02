<!-- Version: 1.0.0 | Date: 2026-07-01 00:00:00 | Updated: Initial project context for Claude Code handoff -->
# Reservation System (รถ + ห้องประชุม) — Project Context

## Stack
- Backend: NestJS
- Frontend: Next.js
- Database: SQL Server, database ชื่อ `PTEC_RESERVATION`
- User/Role: ไม่มีตาราง user ในระบบนี้ ใช้ `user_id` (UserID) อ้างอิงจาก User table เดิมใน Portal/UserManage เท่านั้น ไม่สร้าง user table ใหม่

## Cross-database constraint (สำคัญ)
ตาราง `Car_Type`, `Car_Categary`, `Car_Info`, `Car_Image` และตาราง `User` อยู่คนละ database คือ `PTEC_OPS` / Portal
SQL Server ผูก FOREIGN KEY ข้าม database ไม่ได้ จึงเก็บ `car_infoid` และ `user_id` เป็น INT ธรรมดา ไม่มี FK constraint บังคับ
ต้อง validate ความถูกต้องที่ฝั่ง application (NestJS service layer) เอง
Query ข้ามฐานใช้ three-part naming เช่น `PTEC_OPS.dbo.Car_Info` — ถ้าอยู่คนละ server ต้องทำ Linked Server หรือแยก connection คนละ datasource แล้ว merge ที่ backend

## Database schema
ดูรายละเอียดเต็มในไฟล์ `reservation_schema.sql` (แนบมาพร้อมกัน) สรุปตารางที่ต้องสร้างใหม่ในระบบนี้:

- `Room_Categary`, `Room_Info`, `Room_Image` — ตารางห้องประชุม (สร้างใหม่ เลียนแบบ pattern ของ Car_*)
- `reservations` — ตารางหลัก ผูกได้ทั้งรถและห้องประชุมในตารางเดียว ผ่าน `resource_type` ('CAR'/'ROOM') + `car_infoid`/`room_infoid` (มี CHECK constraint บังคับให้กรอกแค่อย่างใดอย่างหนึ่ง)
- `reservation_admin_actions` — log การเลือกคิวของแอดมินเมื่อมีการจองเวลาทับกัน
- `reservation_approvals` — log การอนุมัติของหัวหน้า
- `reservation_participants` — รายชื่อผู้ร่วมจอง (ผู้โดยสาร/ผู้เข้าร่วมประชุม) รองรับทั้งพนักงานในระบบ (`user_id`) และบุคคลภายนอก (`full_name`, `email`, `organization`)
- `reservation_notifications` — แจ้งเตือน รองรับหลาย channel (IN_APP/EMAIL/LINE)

## Business flow (approval flow)
```
PENDING (ยื่นคำขอจอง)
  ├─→ CANCELLED (ผู้จองยกเลิกเอง)
  ├─→ ADMIN_CONFIRMED (แอดมินยืนยันคิว — เลือกคิวที่ต้องใช้งานก่อนเมื่อมีการจองทับเวลากัน)
  │     └─→ APPROVED (หัวหน้าอนุมัติ) → COMPLETED (ใช้งานเสร็จสิ้น)
  │     └─→ REJECTED_SUPERVISOR (หัวหน้าไม่อนุมัติ)
  └─→ REJECTED_ADMIN (ถูกคิวอื่นที่มาก่อนแซง)
```

กติกาเลือกคิวของแอดมิน: ถ้ามีคนจองทรัพยากรเดียวกันในช่วงเวลาที่ทับกัน คนที่มีเวลา "ต้องการใช้งาน" (start_datetime) เร็วกว่าจะได้สิทธิ์ก่อน แอดมินเป็นคนกดยืนยัน ไม่ใช่ auto-approve

## Naming conventions ที่ใช้ในโปรเจคเดิม (PTEC)
- ตารางที่มีอยู่แล้วใช้ PascalCase + คำนาม (เช่น `Car_Info`, `Car_Categary` — สะกดว่า Categary ไม่ใช่ Category ตามของเดิม)
- ตารางใหม่ในระบบนี้ใช้ snake_case (เช่น `reservations`, `reservation_admin_actions`)
- ทุกไฟล์โค้ดต้องมี version header บรรทัดแรก รูปแบบ:
  `// Version: X.X.X | Date: YYYY-MM-DD HH:MM:SS | Updated: [สรุปการเปลี่ยนแปลง]`
  (ไฟล์ HTML ใช้ `<!-- Version: ... -->`)

## Next step
กำลังจะสร้าง NestJS entities + API endpoints ตาม schema นี้ ยังไม่ได้เริ่มเขียนโค้ดฝั่ง backend/frontend เลย มีแค่ database schema