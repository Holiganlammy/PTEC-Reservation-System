// config/permissions.ts
// role_id มาจาก Portal (ตาราง User/Role เดิม) — reservation ไม่สร้าง role ใหม่
// ที่นี่กำหนดแค่ "path ไหนของ reservation ให้ role ไหนเข้าได้"

export const ROLE = {
  ADMIN: 1,
  USER: 2,
  MODERATOR_FA: 3,
  MODERATOR_SM: 4,
  GUEST: 5,
  MODERATOR_RESERVATION: 6,
  MOCKUP_USER: 7,
  USER_SMARTBILL_CAR: 8,
} as const;

export const ALL_ROLES = Object.values(ROLE);

// role ที่ทำหน้าที่แอดมิน/มอดของ reservation (เลือกคิว, จัดการรถ/ห้อง)
export const RESERVATION_ADMIN_ROLES: number[] = [ROLE.ADMIN, ROLE.MODERATOR_RESERVATION];

export interface MenuItem {
  label: string;
  path: string;
  icon: string;
  roles: number[];
}

// เพิ่ม entry ใหม่ที่นี่เวลาทำหน้าเพิ่ม — path ที่ไม่ตรง entry ไหนเลย default เป็น ALL_ROLES (จองได้ทุกคน)
export const MENU_CONFIG: MenuItem[] = [
  {
    label: "จองรถ/ห้องประชุม",
    path: "/reservation-systems/select-type",
    icon: "Calendar",
    roles: ALL_ROLES,
  },
];

// หา MENU_CONFIG entry ที่ match pathname แบบ longest-prefix (ให้ path ย่อยที่เจาะจงกว่าชนะ)
function findMatchingMenuItem(pathname: string): MenuItem | undefined {
  return MENU_CONFIG
    .filter((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];
}

export function getAllowedRoles(pathname: string): number[] {
  return findMatchingMenuItem(pathname)?.roles ?? ALL_ROLES;
}

export function isPathAllowed(pathname: string, roleId: number): boolean {
  return getAllowedRoles(pathname).includes(roleId);
}
