// TEMPORARY session viewer for auth testing — replace with real home page later
"use client";

import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Reservation Frontend</h1>
      <p>Status: {status}</p>
      {session?.user && (
        <pre className="max-w-xl overflow-auto rounded bg-zinc-100 p-4 text-sm dark:bg-zinc-800">
          {JSON.stringify(session.user, null, 2)}
        </pre>
      )}
      {session && (
        <button
          onClick={() => signOut({ redirect: false })}
          className="rounded-lg bg-black px-6 py-3 text-white"
        >
          Sign out
        </button>
      )}
    </div>
  );
}
