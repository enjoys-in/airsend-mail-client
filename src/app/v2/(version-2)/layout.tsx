"use client"
import React, { ReactNode, Suspense, } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Spinner } from "@/components/common/spinner";
import SocketContextProvider from "@/context/SocketContext";
import NewMailRecived from "@/components/common/new-mail-recived";
import DesktopLayoutV2 from "./_components/desktop-layout";
import { CalendarProvider } from "./(home)/calender/_components/event-calendar/calendar-context";
import { useCalDevSync } from "./(home)/calender/_lib/use-caldev-sync";
import { MobileLayoutV2 } from "./_components/mobile-layout";
import { fetchCurrentUser } from "@/store/slices/account";
import { syncUserSettings } from "@/lib/api/sync-user-settings";
import { setMid, setEmail } from "@/lib/api/auth-state";
import SentMailToast from "@/components/common/sent-mail";
import CustomWidget from "@/components/common/custom-widget";
import { useIsMobile } from "@/hooks/use-mobile";

// NOTE: this must be a layout (not a template). A template remounts on every
// navigation, which disconnected the socket, re-fetched the user/settings and
// remounted the whole sidebar on each click.
function MainLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  // Mount page content in only ONE of the two layouts. Rendering `children`
  // in both (and hiding one with CSS) mounted every page twice: double API
  // calls, double Dexie queries and duplicate window event listeners.
  // Defaults to desktop before mount (same as the md breakpoint).
  const isMobile = useIsMobile()
  const mid = useAppSelector((s) => s.accounts?.currAccount?.mid);
  const email = useAppSelector((s) => s.accounts?.currAccount?.email);

  React.useEffect(() => {
    dispatch(fetchCurrentUser());
    syncUserSettings();
  }, [dispatch]);

  // Keep module-level auth state in sync with Redux
  React.useEffect(() => {
    setMid(mid ?? null);
    setEmail(email ?? null);
  }, [mid, email]);

  // Calendar data + live stream for the whole app (mailbox "Upcoming meetings",
  // calendar page). Declared after the auth-state effect so X-Tenant-ID is set first.
  useCalDevSync();
  return (
    <SocketContextProvider>
      <CustomWidget />
      <CalendarProvider>
        <Suspense fallback={<Spinner />}>
          <div suppressHydrationWarning className="flex md:hidden flex-1 min-w-0 bg-[#111315]">
            <MobileLayoutV2>{isMobile ? children : null}</MobileLayoutV2>
          </div>
          <div suppressHydrationWarning className="hidden md:flex flex-1 min-w-0 bg-[#111315]">
            <DesktopLayoutV2>{isMobile ? null : children}</DesktopLayoutV2>
          </div>
          <NewMailRecived />
          <SentMailToast />
        </Suspense>
      </CalendarProvider>
    </SocketContextProvider>
  );
}

export default MainLayout;
