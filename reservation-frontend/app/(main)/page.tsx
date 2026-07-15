"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Calendar,
  CalendarDays,
  ClipboardList,
  ClipboardCheck,
  LayoutDashboard,
  Package,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MENU_CONFIG } from "@/config/permissions";

const ICONS: Record<string, LucideIcon> = {
  Calendar,
  CalendarDays,
  ClipboardList,
  ClipboardCheck,
  LayoutDashboard,
};

const DESCRIPTIONS: Record<string, string> = {
  "/reservation-systems/select-type": "จองรถหรือห้องประชุมสำหรับใช้งาน",
  "/reservation-systems/my-calendar": "ดูตารางการจองของคุณแบบปฏิทิน",
  "/reservation-systems/my-reservations": "ดูรายละเอียดและสถานะการจองทั้งหมดของคุณ",
  "/reservation-systems/approvals": "อนุมัติคำขอจองของลูกทีมที่รอคุณอยู่",
  "/reservation-systems/admin": "จัดการคิวและข้อมูลรถ/ห้องประชุมของระบบ",
};

export default function HomePage() {
  const { data: session } = useSession();
  const roleId = session?.user?.role_id;

  const visibleMenu = MENU_CONFIG.filter(
    (item) => roleId !== undefined && item.roles.includes(roleId)
  );

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold">
          สวัสดี{session?.user?.fristName ? `, ${session.user.fristName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          ระบบจองรถและห้องประชุม — เลือกเมนูที่ต้องการด้านล่าง
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleMenu.map((item) => {
          const Icon = ICONS[item.icon] ?? Package;
          return (
            <Link key={item.path} href={item.path}>
              <Card className="h-full transition-colors hover:border-foreground/30 hover:bg-muted/50">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-black dark:bg-white">
                    <Icon className="h-5 w-5 text-white dark:text-black" />
                  </div>
                  <CardTitle>{item.label}</CardTitle>
                  <CardDescription>{DESCRIPTIONS[item.path]}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
