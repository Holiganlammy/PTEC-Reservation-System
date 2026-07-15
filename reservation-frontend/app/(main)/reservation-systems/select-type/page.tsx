"use client";

import Link from "next/link";
import { Car, DoorOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const TYPES = [
  {
    label: "จองรถ",
    description: "เลือกรถที่ต้องการใช้งานและระบุช่วงเวลา",
    href: "/reservation-systems/select-type/car",
    icon: Car,
  },
  {
    label: "จองห้องประชุม",
    description: "เลือกห้องประชุมที่ต้องการและระบุช่วงเวลา",
    href: "/reservation-systems/select-type/room",
    icon: DoorOpen,
  },
];

export default function SelectTypePage() {
  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold">เลือกประเภทการจอง</h1>
        <p className="text-sm text-muted-foreground">คุณต้องการจองรถหรือห้องประชุม</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <Link key={type.href} href={type.href}>
              <Card className="h-full transition-colors hover:border-foreground/30 hover:bg-muted/50">
                <CardHeader className="items-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black dark:bg-white">
                    <Icon className="h-8 w-8 text-white dark:text-black" />
                  </div>
                  <CardTitle className="text-lg">{type.label}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
