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
  children?: MenuItem[];
}

// เพิ่ม entry ใหม่ที่นี่เวลาทำหน้าเพิ่ม — path ที่ไม่ตรง entry ไหนเลย default เป็น ALL_ROLES (จองได้ทุกคน)
export const MENU_CONFIG: MenuItem[] = [
  {
    label: "จองรถ/ห้องประชุม",
    path: "/reservation-systems/select-type",
    icon: "Calendar",
    roles: ALL_ROLES,
  },
  {
    label: "ปฏิทินของฉัน",
    path: "/reservation-systems/my-calendar",
    icon: "CalendarDays",
    roles: ALL_ROLES,
  },
  {
    label: "รายละเอียดการจองของฉัน",
    path: "/reservation-systems/my-reservations",
    icon: "ClipboardList",
    roles: ALL_ROLES,
  },
  {
    // ไม่ผูก role — ใครก็อาจเป็นหัวหน้าของใครสักคนได้ (มาจาก EmpUpperID ไม่ใช่ role_id)
    label: "รายการรอฉันอนุมัติ",
    path: "/reservation-systems/approvals",
    icon: "ClipboardCheck",
    roles: ALL_ROLES,
  },
  {
    label: "Admin Dashboard",
    path: "/reservation-systems/admin",
    icon: "LayoutDashboard",
    roles: RESERVATION_ADMIN_ROLES,
  },
];

// เดินเข้าไปใน children ด้วย เผื่อ menu เป็นแบบ tree (จาก Portal)
function flattenMenu(menu: MenuItem[]): MenuItem[] {
  return menu.flatMap((item) => [item, ...(item.children ? flattenMenu(item.children) : [])]);
}

// เมนูจาก Portal บาง entry เก็บเป็น URL เต็ม (คนละ origin เช่นชี้มา reservation)
// ต้องตัด origin ออกก่อนเทียบกับ pathname ปัจจุบัน (ที่ไม่มี origin) ไม่งั้น active state จะไม่ตรงกันเลย
export function normalizePathname(path: string): string {
  try {
    return new URL(path).pathname;
  } catch {
    return path; // เป็น relative path อยู่แล้ว ใช้ตามเดิม
  }
}

// หา entry ที่ match pathname แบบ longest-prefix (ให้ path ย่อยที่เจาะจงกว่าชนะ)
// เปิดให้ผ่าน menu list เองได้ (เช่นตอน breadcrumb อยากเทียบกับ dynamic menu จาก Portal แทน MENU_CONFIG)
export function findMatchingMenuItem(
  pathname: string,
  menu: MenuItem[] = MENU_CONFIG
): MenuItem | undefined {
  return flattenMenu(menu)
    .filter((item) => {
      if (!item.path) return false;
      const itemPath = normalizePathname(item.path);
      return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
    })
    .sort((a, b) => normalizePathname(b.path).length - normalizePathname(a.path).length)[0];
}

export function getAllowedRoles(pathname: string): number[] {
  return findMatchingMenuItem(pathname)?.roles ?? ALL_ROLES;
}

export function isPathAllowed(pathname: string, roleId: number): boolean {
  return getAllowedRoles(pathname).includes(roleId);
}
