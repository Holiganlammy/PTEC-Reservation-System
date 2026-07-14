// lib/alert/globalAlertService.ts
"use client";

import { toast } from "sonner";

const TOKEN_EXPIRED_TOAST_ID = "token-expired-alert";

export const showTokenExpiredAlert = (onConfirm: () => void | Promise<void>) => {
  toast.error("เซสชันหมดอายุ", {
    id: TOKEN_EXPIRED_TOAST_ID,
    description: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง เพื่อความปลอดภัยของข้อมูลของคุณ",
    duration: Infinity,
    dismissible: false,
    action: {
      label: "เข้าสู่ระบบใหม่",
      onClick: () => {
        void onConfirm();
      },
    },
  });
};

export const cleanupGlobalAlert = () => {
  toast.dismiss(TOKEN_EXPIRED_TOAST_ID);
};
