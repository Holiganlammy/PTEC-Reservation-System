// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/lib/store";
import { useAutoRefreshSession } from "@/hooks/useAutoRefreshSession";
import { useRefreshOnNavigation } from "@/hooks/useRefreshOnNavigation";
import { CheckSession } from "./CheckSession";
import { Suspense } from "react";
import PageLoading from "@/components/PageLoading";

function AutoRefreshWrapper({ children }: { children: React.ReactNode }) {
  useAutoRefreshSession();
  useRefreshOnNavigation();
  return <>{children}</>;
}


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <AutoRefreshWrapper>
            <Suspense fallback={<PageLoading />}>
              <CheckSession>
                <div id="hero" className="w-full">
                  {children}
                </div>
              </CheckSession>
            </Suspense>
        </AutoRefreshWrapper>
      </ReduxProvider>
    </SessionProvider>
  );
}