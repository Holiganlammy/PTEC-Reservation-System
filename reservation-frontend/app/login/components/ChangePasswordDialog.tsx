"use client";

import { useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import client from "@/lib/axios/interceptors";
import dataConfig from "@/config/config";

const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน"),
    newPassword: z
      .string()
      .min(8, "อย่างน้อย 8 ตัวอักษร")
      .regex(/[a-z]/, "ต้องมีตัวพิมพ์เล็ก")
      .regex(/[A-Z]/, "ต้องมีตัวพิมพ์ใหญ่")
      .regex(/\d/, "ต้องมีตัวเลข")
      .regex(SPECIAL_CHAR_REGEX, "ต้องมีอักขระพิเศษ (!@#$%^&*)"),
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "รหัสผ่านใหม่ต้องไม่เหมือนเดิม",
    path: ["newPassword"],
  });

type FormValues = z.infer<typeof changePasswordSchema>;

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userCode: string;
  onSuccess: () => void;
}

const STRENGTH_RULES = [
  (pw: string) => pw.length >= 8,
  (pw: string) => /[a-z]/.test(pw),
  (pw: string) => /[A-Z]/.test(pw),
  (pw: string) => /\d/.test(pw),
  (pw: string) => SPECIAL_CHAR_REGEX.test(pw),
];

export function ChangePasswordDialog({ open, onOpenChange, userCode, onSuccess }: ChangePasswordDialogProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onChange",
  });

  const { isSubmitting } = form.formState;
  const watchedNew = useWatch({ control: form.control, name: "newPassword" }) ?? "";
  const passedCount = STRENGTH_RULES.filter((test) => test(watchedNew)).length;

  const resetForm = () => {
    form.reset();
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setSubmitError("");
  };

  const handleClose = (value: boolean) => {
    if (!value) resetForm();
    onOpenChange(value);
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitError("");
    try {
      const response = await client.post(
        "/user/change-password",
        {
          userCode,
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        },
        { headers: dataConfig().header }
      );

      if (response.data.success) {
        toast.success("เปลี่ยนรหัสผ่านสำเร็จ", { description: "กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่" });
        resetForm();
        onSuccess();
      } else {
        setSubmitError(response.data.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
      }
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setSubmitError(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-black dark:bg-white">
            <KeyRound className="h-6 w-6 text-white dark:text-black" />
          </div>
          <DialogTitle className="text-center">รหัสผ่านหมดอายุ</DialogTitle>
          <DialogDescription className="text-center">
            กรุณาตั้งรหัสผ่านใหม่สำหรับบัญชี <strong>{userCode}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {submitError}
            </div>
          )}

          <Controller
            name="currentPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">รหัสผ่านปัจจุบัน</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    className="pr-9 h-11"
                    disabled={isSubmitting}
                    {...field}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldState.error && <p className="text-xs text-red-600">{fieldState.error.message}</p>}
              </div>
            )}
          />

          <Controller
            name="newPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    className="pr-9 h-11"
                    disabled={isSubmitting}
                    {...field}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Strength meter */}
                <div className="flex gap-1">
                  {STRENGTH_RULES.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800",
                        i < passedCount &&
                          (passedCount <= 2
                            ? "bg-red-500"
                            : passedCount <= 4
                              ? "bg-yellow-500"
                              : "bg-green-500")
                      )}
                    />
                  ))}
                </div>
                {fieldState.error && <p className="text-xs text-red-600">{fieldState.error.message}</p>}
              </div>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    className="pr-9 h-11"
                    disabled={isSubmitting}
                    {...field}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldState.error && <p className="text-xs text-red-600">{fieldState.error.message}</p>}
              </div>
            )}
          />

          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              "เปลี่ยนรหัสผ่าน"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
