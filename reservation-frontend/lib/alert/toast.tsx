// lib/alert/toast.tsx
"use client";

import { toast } from "sonner";

type FireOptions = {
  icon?: "success" | "error" | "warning" | "info";
  title?: string;
  text?: string;
};

export const Toast = {
  fire: ({ icon = "error", title, text }: FireOptions) => {
    const options = text ? { description: text } : undefined;

    switch (icon) {
      case "success":
        return toast.success(title, options);
      case "warning":
        return toast.warning(title, options);
      case "info":
        return toast.info(title, options);
      case "error":
      default:
        return toast.error(title, options);
    }
  },
};

export const toastError = (msgTitle: string) => Toast.fire({ icon: "error", title: msgTitle });
export const toastSuccess = (msgTitle: string) => Toast.fire({ icon: "success", title: msgTitle });
export const toastWarning = (msgTitle: string) => Toast.fire({ icon: "warning", title: msgTitle });
export const toastInfo = (msgTitle: string) => Toast.fire({ icon: "info", title: msgTitle });
