// providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export const CustomProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider 
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
        {children}
    </SessionProvider>
  );
};