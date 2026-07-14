// hooks/useRefreshOnNavigation.ts
"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function useRefreshOnNavigation() {
  const { update, status } = useSession();
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") {
      lastPathRef.current = pathname;
      return;
    }

    // First render
    if (lastPathRef.current === null) {
      lastPathRef.current = pathname;
      console.log("👁️ Navigation refresh enabled");
      return;
    }

    // Same path - skip
    if (pathname === lastPathRef.current) {
      return;
    }

    // Path changed!
    console.log(`🚀 Navigation: ${lastPathRef.current} → ${pathname}`);
    lastPathRef.current = pathname;

    // Refresh with debounce protection
    if (!isRefreshingRef.current) {
      isRefreshingRef.current = true;
      
      update().finally(() => {
        setTimeout(() => {
          isRefreshingRef.current = false;
        }, 1000); // Prevent rapid refresh
      });
    }
  }, [pathname, status, update]);
}