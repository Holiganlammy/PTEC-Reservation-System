// hooks/useAutoRefreshSession.ts
"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { sessionRefreshService } from "@/lib/sessionRefreshService";
import { signOutManager } from "@/lib/signOutManager";

export function useAutoRefreshSession() {
  const { update, status, data } = useSession();
  const hasStarted = useRef(false);
  const lastStatus = useRef(status);
  const handleSignOut = async () => {
    await signOutManager.requestSignOut(async () => {
      sessionRefreshService.stop();
      await signOut({ 
        redirect: false 
      });
    });
  };

  useEffect(() => {
    if (lastStatus.current === "authenticated" && status === "unauthenticated") {
      console.log("⚠️ Session became unauthenticated");
      sessionRefreshService.stop();
      signOutManager.reset();
      hasStarted.current = false;
    }

    lastStatus.current = status;

    if (status === "authenticated") {
      if (!data?.user) {
        console.log("❌ No user in session");
        handleSignOut();
        return;
      }

      if (!hasStarted.current && !sessionRefreshService.isRunning()) {
        hasStarted.current = true;
        
        sessionRefreshService.start(
          async () => {
            if (signOutManager.isInProgress()) {
              console.log("⏭️ SignOut in progress, skip update");
              throw new Error("SIGNOUT_IN_PROGRESS");
            }

            const result = await update();
            
            if (!result || !result.user) {
              console.log("❌ Update returned no user");
              throw new Error("SESSION_INVALID");
            }
          },
          () => status
        );

        setTimeout(() => {
          document.body.style.pointerEvents = '';
          document.body.removeAttribute('data-scroll-locked');
        }, 100);
      }
    }

    if (status === "unauthenticated") {
      hasStarted.current = false;
      sessionRefreshService.stop();
      signOutManager.reset();
    }

  }, [status, data, update]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (status === "unauthenticated") {
        sessionRefreshService.stop();
      }
    };
  }, [status]);
}