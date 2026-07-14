// lib/auth/logout.ts
// reservation-backend ยังไม่มี endpoint revoke token (ต่าง Portal ที่มี /logout)
// ตอนนี้เลย sign out ฝั่ง NextAuth อย่างเดียวก่อน
import { signOut } from "next-auth/react";

export async function logout() {
  await signOut({ redirect: false });
}
