// components/SessionMonitor/SessionManagement.tsx
"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertCircle, AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes > 0) {
    return `${minutes} นาที ${seconds} วินาที`
  }
  return `${seconds} วินาที`
}

interface SessionToken {
  expires: string
  user: {
    Email: string
    UserCode: string
    UserID: number
    access_token: string
    fristName: string
    lastName: string
    img_profile: string
    role_id: number
    branchid: number
    depid: number
  }
}

export function SessionMonitor() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  //  หมดอายุแล้วจริง — sign out แล้วพากลับไปหน้า login เลย ไม่ต้องรอ user รีเฟรชเอง
  const handleExpiredConfirm = async () => {
    setIsDialogOpen(false)
    await signOut({ redirect: false })
    router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
  }

  useEffect(() => {
    // "/" คือหน้า home ที่ต้อง login ก่อนถึงเข้าได้ ไม่ใช่ public page — ห้ามใส่ในนี้
    // (ถ้าใส่ไว้ พอ user นั่งอยู่หน้า home เฉยๆ effect จะ return ก่อนถึง setInterval เลย ไม่มีวันเช็ค expiry)
    const publicPaths = ["/login", "/forget_password", "/reset-password", "/unauthorized"]
    if (publicPaths.includes(pathname)) {
      return
    }

    if (status !== "authenticated" || !session) {
      return
    }

    console.log("[AUTH] 🔍 Session expires:", session.expires)

    const checkInterval = setInterval(() => {
      const token = session as SessionToken

      if (token.expires) {
        const expiresDate = new Date(token.expires)
        const expiresTime = expiresDate.getTime()
        const now = Date.now()

        const remaining = expiresTime - now
        const remainingSeconds = Math.max(0, Math.floor(remaining / 1000))

        //  ถ้าหมดอายุแล้ว → แสดง dialog บังคับกดตกลงแล้วพาไป login
        if (remaining <= 0) {
          console.log("[AUTH] ❌ Session expired, showing dialog...")
          setShowWarning(false)
          setIsDialogOpen(true)
          clearInterval(checkInterval)
        }
        //  ถ้าเหลือเวลาน้อยกว่า 5 นาที → แสดงแจ้งเตือนล่วงหน้า (กำลังจะหมดอายุ) นับถอยหลังเป็นวินาที
        else if (remainingSeconds < 5 * 60) {
          setTimeRemaining(remainingSeconds)
          setShowWarning(true)
        } else {
          setShowWarning(false)
        }
      }
    }, 1000)

    return () => {
      clearInterval(checkInterval)
    }
  }, [session, status, pathname])

  return (
    <>
      {/*  แจ้งเตือนก่อนหมดอายุ — เตือนล่วงหน้า ไม่บล็อกการใช้งาน */}
      {showWarning && (
        <div className='fixed right-7 bottom-5 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <Alert variant="default">
            <AlertCircleIcon className='items-center' />
            <AlertTitle className='text-lg font-semibold'>Session กำลังจะหมดอายุ</AlertTitle>
            <AlertDescription>
              <p>Session ของท่านกำลังจะหมดอายุ ในอีก {formatCountdown(timeRemaining)}</p>
              <ul className="list-inside list-disc text-sm">
                <li>กรุณาดำเนินการก่อนที่เซสชันจะหมดอายุ</li>
                <li>หากเซสชันหมดอายุ ท่านจะต้องล็อกอินใหม่อีกครั้ง</li>
                <li>เพื่อความปลอดภัยของข้อมูล กรุณาออกจากระบบเมื่อเลิกใช้งาน</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/*  หมดอายุแล้วจริง — บังคับกดตกลง ปิดด้วยวิธีอื่นไม่ได้ */}
      <AlertDialog open={isDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-gray-400 dark:bg-black flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-black dark:text-black" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl">Session หมดอายุ</AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground mt-1">
                  กรุณาเข้าสู่ระบบอีกครั้ง
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              Session ของคุณหมดอายุแล้ว เพื่อความปลอดภัยของข้อมูล กรุณาเข้าสู่ระบบใหม่อีกครั้ง
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleExpiredConfirm}
              className="w-full bg-black hover:bg-gray-700 text-white"
            >
              ตกลง - ไปหน้าเข้าสู่ระบบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
