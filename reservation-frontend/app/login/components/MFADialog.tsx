"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import client from "@/lib/axios/interceptors";
import dataConfig from "@/config/config";

interface MFADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userCode: string;
  onSuccess: (data: { access_token: string; user: object }) => void;
  onCancel: () => void;
  redirectPath: string;
}

export function MFADialog({ open, onOpenChange, userCode, onSuccess, onCancel }: MFADialogProps) {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(300);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setOtp("");
    setError("");
    setCountdown(300);
  }, [open]);

  useEffect(() => {
    if (!open || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, open]);

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

  const handleVerify = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await client.post(
        "/verify-otp",
        { usercode: userCode, otpCode: otp },
        { headers: dataConfig().header, withCredentials: true }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "รหัส OTP ไม่ถูกต้อง");
      }

      onOpenChange(false);
      onSuccess(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      setError(message);
      toast.error("ยืนยัน OTP ไม่สำเร็จ", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setIsResending(true);

    try {
      await client.post(
        "/resend-otp",
        { usercode: userCode },
        { headers: dataConfig().header }
      );
      setOtp("");
      setCountdown(300);
      toast.success("ส่งรหัส OTP ใหม่แล้ว");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่ง OTP ไม่สำเร็จ");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-black dark:bg-white">
            <ShieldCheck className="h-6 w-6 text-white dark:text-black" />
          </div>
          <DialogTitle className="text-center">ยืนยันตัวตน 2 ขั้นตอน</DialogTitle>
          <DialogDescription className="text-center">
            กรอกรหัส OTP ที่ส่งไปยังอีเมลของ <strong>{userCode}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value.replace(/\D/g, ""))}
              disabled={isLoading || countdown === 0}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {countdown > 0 ? (
            <p className="text-center text-xs text-zinc-500">หมดอายุใน {formatTime(countdown)}</p>
          ) : (
            <p className="text-center text-xs text-red-600">รหัส OTP หมดอายุแล้ว</p>
          )}

          <Button
            className="h-11 w-full"
            disabled={isLoading || otp.length !== 6 || countdown === 0}
            onClick={handleVerify}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังตรวจสอบ...
              </>
            ) : (
              "ยืนยัน OTP"
            )}
          </Button>

          <Button
            variant="outline"
            className="h-11 w-full"
            disabled={isResending || countdown > 280}
            onClick={handleResend}
          >
            {countdown > 280
              ? `ส่ง OTP ใหม่ (${300 - countdown}s)`
              : isResending
                ? "กำลังส่ง..."
                : "ส่งรหัส OTP ใหม่"}
          </Button>

          <Button variant="ghost" className="w-full text-zinc-500" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
