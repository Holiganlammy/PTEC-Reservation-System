'use client'
import React from 'react'

export default function PageLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[999] px-4 ">
      <div className="flex flex-row items-center gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full"></div>
        <p className="text-xl">Loading...</p>
      </div>
    </div>
  );
}
