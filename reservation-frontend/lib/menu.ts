// lib/menu.ts
// ดึงเมนูแบบ dynamic จาก Portal (ผ่าน proxy /menu ของ reservation-backend เอง ไม่ยิงตรงไป Portal)
// ถ้าดึงไม่ได้ (Portal ล่ม/timeout) ให้ผู้เรียกใช้ fallback เป็น MENU_CONFIG แบบ static แทน
import client from "@/lib/axios/interceptors";
import dataConfig from "@/config/config";
import type { MenuItem } from "@/config/permissions";
import { ALL_ROLES } from "@/config/permissions";

interface PortalMenuItem {
  id: number;
  name: string;
  path: string | null;
  parent_id: number | null;
  order_no: number | null;
}

// เดา icon จากชื่อเมนู — เดาไม่ได้ก็ fallback เป็น Package ใน NavSideBar อยู่แล้ว
const ICON_BY_NAME: Record<string, string> = {
  "reservation systems": "Calendar",
  "จองรถและห้องประชุม": "Calendar",
  "ปฏิทินของฉัน": "CalendarDays",
  "รายละเอียดการจองของฉัน": "ClipboardList",
};

function guessIcon(name: string): string {
  return ICON_BY_NAME[name.toLowerCase().trim()] ?? "Package";
}

// สร้าง tree จาก parent_id เหมือน buildMenuTree ของ Portal (type/buildMenuTree.ts)
// เพื่อให้ได้เมนูแบบซ้อน (กดลูกศรเพื่อขยาย) เหมือนกันเป๊ะ ไม่ใช่แค่ list แบน
function buildMenuTree(items: PortalMenuItem[]): MenuItem[] {
  const lookup = new Map<number, MenuItem & { _order: number }>();

  items.forEach((item) => {
    lookup.set(item.id, {
      label: item.name,
      path: item.path && item.path !== "#" ? item.path : "",
      icon: guessIcon(item.name),
      roles: ALL_ROLES, // Portal กรองสิทธิ์มาให้แล้ว ไม่ต้องเช็คซ้ำฝั่งนี้
      children: [],
      _order: item.order_no ?? 0,
    });
  });

  const tree: (MenuItem & { _order: number })[] = [];

  items.forEach((item) => {
    const node = lookup.get(item.id);
    if (!node) return;

    if (item.parent_id === null) {
      tree.push(node);
    } else {
      const parent = lookup.get(item.parent_id);
      if (parent?.children) {
        parent.children.push(node);
      } else {
        // parent ไม่อยู่ใน list ที่ได้มา (เช่นถูกกรองสิทธิ์ออกไปแล้ว) — ดันขึ้น root แทนที่จะหายไปเงียบๆ
        tree.push(node);
      }
    }
  });

  const sortTree = (nodes: (MenuItem & { _order: number })[]): MenuItem[] =>
    nodes
      .sort((a, b) => a._order - b._order)
      .map(({ _order, children, ...rest }) => ({
        ...rest,
        children: children && children.length > 0 ? sortTree(children as (MenuItem & { _order: number })[]) : undefined,
      }));

  return sortTree(tree);
}

export async function fetchDynamicMenu(userId: number, accessToken?: string): Promise<MenuItem[]> {
  const response = await client.post<PortalMenuItem[]>(
    "/menu",
    { UserID: userId },
    { headers: dataConfig(accessToken).header, timeout: 5000 }
  );

  // กรอง hidden routes ออก (parent_id null และ order_no null พร้อมกัน = ไม่ตั้งใจให้โชว์ใน nav) เหมือน Portal
  const visible = (response.data ?? []).filter(
    (item) => !(item.parent_id === null && item.order_no === null)
  );

  return buildMenuTree(visible);
}
