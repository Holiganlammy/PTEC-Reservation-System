"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState, type FormEvent } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import {
  Calendar,
  Eye,
  EyeOff,
  Loader2,
  User,
  Lock,
  Mail,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { MFADialog } from "./components/MFADialog";
import { ChangePasswordDialog } from "./components/ChangePasswordDialog";
import client from "@/lib/axios/interceptors";
import dataConfig from "@/config/config";
import PageLoading from "@/components/PageLoading";
import { cn } from "@/lib/utils";

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
      passwordExpired?: boolean;
      userCode?: string;
    };
  };
}

const formSchema = z.object({
  username: z.string().min(3, "กรอกอย่างน้อย 3 ตัวอักษร"),
  password: z.string().min(6, "กรอกอย่างน้อย 6 ตัวอักษร"),
});

type LoginMode = "password" | "otp";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", password: "" },
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectPath = redirectParam?.startsWith("/") ? redirectParam : "/";

  const [mode, setMode] = useState<LoginMode>("password");
  const [isLoading, setIsLoading] = useState(false);
  const [isSsoLoading, setIsSsoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [showMFADialog, setShowMFADialog] = useState(false);
  const [mfaUserCode, setMfaUserCode] = useState("");

  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [expiredUserCode, setExpiredUserCode] = useState("");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace(redirectPath);
    }
  }, [status, session, redirectPath, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleLoginSuccess = async (data: { access_token: string; user: object }) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        responseCondition: "pass",
        responseLogin: JSON.stringify(data),
      });

      if (result?.error) throw new Error("เข้าสู่ระบบไม่สำเร็จ");

      toast.success("เข้าสู่ระบบสำเร็จ");
      router.replace(redirectPath);
    } catch (err) {
      toast.error("เข้าสู่ระบบไม่สำเร็จ", {
        description: err instanceof Error ? err.message : "เกิดข้อผิดพลาด",
      });
    }
  };

  const onSubmitPassword = async (data: z.infer<typeof formSchema>) => {
    setError("");
    setIsLoading(true);

    try {
      const response = await client.post(
        "/login",
        { loginname: data.username, password: data.password },
        { headers: dataConfig().header, withCredentials: true }
      );

      const result = response.data;

      if (result.passwordExpired === true) {
        setExpiredUserCode(result.userCode || data.username);
        setShowChangePasswordDialog(true);
        toast.warning("รหัสผ่านหมดอายุ", { description: "กรุณาเปลี่ยนรหัสผ่านใหม่" });
        return;
      }

      if (result.request_Mfa === true) {
        setMfaUserCode(result.userCode);
        setShowMFADialog(true);
        toast.success("รหัส OTP ถูกส่งไปที่อีเมลของคุณแล้ว");
        return;
      }

      if (result.success && result.access_token) {
        await handleLoginSuccess(result);
        return;
      }

      throw new Error(result.message || "เข้าสู่ระบบไม่สำเร็จ");
    } catch (err) {
      const errData = (err as AxiosErrorResponse).response?.data;

      if (errData?.passwordExpired === true) {
        setExpiredUserCode(errData.userCode || data.username);
        setShowChangePasswordDialog(true);
        toast.warning("รหัสผ่านหมดอายุ", { description: "กรุณาเปลี่ยนรหัสผ่านใหม่" });
        return;
      }

      const message = errData?.message ?? (err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setError(message);
      toast.error("เข้าสู่ระบบไม่สำเร็จ", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setOtpLoading(true);

    try {
      const response = await client.post(
        "/send-otp",
        { email },
        { headers: dataConfig().header }
      );

      if (!response.data.ok) {
        throw new Error(response.data.message || "ไม่พบอีเมลในระบบ");
      }

      setOtpSent(true);
      setCountdown(120);
      toast.success(`รหัส OTP ถูกส่งไปที่ ${email}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await client.post(
        "/verify-otp",
        { email, otp },
        { headers: dataConfig().header, withCredentials: true }
      );

      if (!response.data.ok) {
        throw new Error(response.data.message || "รหัส OTP ไม่ถูกต้อง");
      }

      const result = await signIn("credentials", {
        response: JSON.stringify(response.data),
        redirect: false,
      });

      if (result?.error) throw new Error("เข้าสู่ระบบไม่สำเร็จ");

      toast.success("เข้าสู่ระบบสำเร็จ");
      router.replace(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return <PageLoading />;
  }

  return (
    <>
      <MFADialog
        open={showMFADialog}
        onOpenChange={setShowMFADialog}
        userCode={mfaUserCode}
        onSuccess={handleLoginSuccess}
        onCancel={() => {
          setShowMFADialog(false);
          setMfaUserCode("");
          form.reset();
        }}
        redirectPath={redirectPath}
      />

      <ChangePasswordDialog
        open={showChangePasswordDialog}
        onOpenChange={setShowChangePasswordDialog}
        userCode={expiredUserCode}
        onSuccess={() => {
          setShowChangePasswordDialog(false);
          setExpiredUserCode("");
          form.reset();
          toast.info("กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่");
        }}
      />

      <div className="flex min-h-screen">
        {/* Left branding panel */}
        <div className="relative hidden w-1/2 flex-col justify-between bg-[#0a0a0a] p-12 text-white lg:flex">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold tracking-wide">RESERVATION SYSTEM</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight">
              จองรถและห้องประชุม
              <br />
              ง่ายในที่เดียว
            </h1>
            <p className="max-w-md text-sm text-gray-400">
              ระบบจองทรัพยากรกลางของ Pure Thai Energy — เช็คคิว จองเวลา รออนุมัติ ครบในระบบเดียว
            </p>
          </div>

          <p className="text-xs text-gray-500">© 2026 Pure Thai Energy Co., Ltd.</p>
        </div>

        {/* Right form panel */}
        <div className="flex w-full flex-col items-center justify-center bg-white p-6 dark:bg-black lg:w-1/2">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-1 text-center lg:text-left">
              <h2 className="text-2xl font-semibold text-black dark:text-white">เข้าสู่ระบบ</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                ใช้บัญชี PTEC เดียวกับ Portal
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setMode("password")}
                className={cn(
                  "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                  mode === "password"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                )}
              >
                รหัสผ่าน
              </button>
              <button
                type="button"
                onClick={() => setMode("otp")}
                className={cn(
                  "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                  mode === "otp"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                )}
              >
                OTP อีเมล
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {mode === "password" ? (
              <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-4">
                <Controller
                  name="username"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <Label htmlFor="username">ชื่อผู้ใช้</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                          id="username"
                          placeholder="กรอกชื่อผู้ใช้"
                          className="pl-9 h-11"
                          disabled={isLoading}
                          autoComplete="username"
                          {...field}
                        />
                      </div>
                      {fieldState.error && (
                        <p className="text-xs text-red-600">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <Label htmlFor="password">รหัสผ่าน</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="กรอกรหัสผ่าน"
                          className="pl-9 pr-9 h-11"
                          disabled={isLoading}
                          autoComplete="current-password"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          tabIndex={-1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {fieldState.error && (
                        <p className="text-xs text-red-600">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />

                <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    "เข้าสู่ระบบ"
                  )}
                </Button>

                <div className="relative py-2 text-center text-xs uppercase text-zinc-400">
                  <span className="bg-white px-2 dark:bg-black">หรือ</span>
                  <div className="absolute inset-x-0 top-1/2 -z-10 border-t border-zinc-200 dark:border-zinc-800" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full"
                  disabled={isLoading || isSsoLoading}
                  onClick={() => {
                    setIsSsoLoading(true);
                    signIn("azure-ad", { callbackUrl: redirectPath });
                  }}
                >
                  {isSsoLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังเชื่อมต่อ Microsoft...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 21 21">
                        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                      </svg>
                      เข้าสู่ระบบด้วย Microsoft
                    </>
                  )}
                </Button>
              </form>
            ) : !otpSent ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendOtp();
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email">อีเมล</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@ptec.co.th"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={otpLoading}
                      className="pl-9 h-11"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <Button type="submit" className="h-11 w-full" disabled={otpLoading || !email}>
                  {otpLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังส่ง OTP...
                    </>
                  ) : (
                    "ส่งรหัส OTP"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                  ส่งรหัส OTP ไปที่ <strong className="text-black dark:text-white">{email}</strong> แล้ว
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="otp">รหัส OTP</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      id="otp"
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value.replace(/\D/g, ""))}
                      disabled={isLoading}
                      autoComplete="one-time-code"
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
                    <p className="text-center text-xs text-zinc-500">
                      หมดอายุใน {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                    </p>
                  ) : (
                    <p className="text-center text-xs text-red-600">รหัส OTP หมดอายุแล้ว</p>
                  )}
                </div>

                <Button type="submit" className="h-11 w-full" disabled={isLoading || otp.length !== 6 || countdown === 0}>
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
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={countdown > 110}
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setError("");
                    setCountdown(0);
                  }}
                >
                  {countdown > 110 ? `ส่ง OTP ใหม่ (${120 - countdown}s)` : "ส่งรหัส OTP ใหม่"}
                </Button>
              </form>
            )}

            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              ติดปัญหา?{" "}
              <a href="mailto:it@ptec.co.th" className="text-black hover:underline dark:text-white">
                ติดต่อฝ่าย IT
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
