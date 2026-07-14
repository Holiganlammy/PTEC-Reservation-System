'use client' // Error components must be Client Components

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-gray-800 px-4">
      <h2 className="text-2xl font-semibold mb-2">Something went wrong!</h2>
      <button
        className="inline-block px-6 py-3 bg-gray-600 text-white font-medium text-lg rounded-lg shadow-md hover:bg-gray-700 transition"
        onClick={
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  )
}