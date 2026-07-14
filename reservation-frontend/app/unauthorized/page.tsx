"use client"

import { useRouter } from "next/navigation"
import { ShieldX, ArrowLeft, Home, Lock } from "lucide-react"
import { useState, useEffect } from "react"

export default function UnauthorizedPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMounted(true)
    })

    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="relative min-h-screen bg-white dark:bg-black overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: mounted ? 'grid-move 20s linear infinite' : 'none'
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-12">
        <div className="max-w-2xl w-full">
          {/* Icon */}
          {/* <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 p-6 rounded-2xl shadow-2xl">
                <ShieldX className="h-16 w-16 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div> */}

          {/* Status Code */}
          <div className="text-center mb-6">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 mb-2">
              403
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-mono uppercase tracking-wider">Access Denied</span>
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              คุณไม่มีสิทธิ์เข้าถึง
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              ขออภัย คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ 
              กรุณาติดต่อผู้ดูแลระบบหากคุณคิดว่านี่เป็นข้อผิดพลาด
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:border-gray-900 dark:hover:border-gray-100 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              ย้อนกลับ
            </button>
            
            <button
              onClick={() => router.push("/")}
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 rounded-full hover:shadow-2xl transition-all duration-300 font-medium shadow-lg"
            >
              <Home className="h-5 w-5" />
              กลับหน้าหลัก
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Error Code: FORBIDDEN_ACCESS
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 border border-gray-200 dark:border-gray-800 rounded-lg rotate-45 opacity-50" />
      <div className="absolute bottom-20 right-10 w-32 h-32 border border-gray-200 dark:border-gray-800 rounded-full opacity-30" />
      <div className="absolute top-1/2 left-20 w-16 h-16 border border-gray-200 dark:border-gray-800 rounded-lg opacity-40" />

      <style jsx>{`
        @keyframes grid-move {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(50px);
          }
        }
      `}</style>
    </div>
  )
}