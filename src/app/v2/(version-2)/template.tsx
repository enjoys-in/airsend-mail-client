"use client"
import React, { ReactNode, Suspense, } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Spinner } from "@/components/common/spinner";
import SocketContextProvider from "@/context/SocketContext";
import NewMailRecived from "@/components/common/new-mail-recived";
import DesktopLayoutV2 from "./_components/desktop-layout";
import { CalendarProvider } from "./(home)/calender/_components/event-calendar/calendar-context";
import { MobileLayoutV2 } from "./_components/mobile-layout";
import { fetchCurrentUser } from "@/store/slices/account";
import { syncUserSettings } from "@/lib/api/sync-user-settings";
import { setMid, setEmail } from "@/lib/api/auth-state";
import SentMailToast from "@/components/common/sent-mail";
import CustomWidget from "@/components/common/custom-widget";

function MainLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
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
  return (
    <SocketContextProvider>
      <CustomWidget />
      <CalendarProvider>
        <Suspense fallback={<Spinner />}>
          <div suppressHydrationWarning className="flex md:hidden flex-1 min-w-0 bg-[#111315]">
            <MobileLayoutV2>{children}</MobileLayoutV2>
          </div>
          <div suppressHydrationWarning className="hidden md:flex flex-1 min-w-0 bg-[#111315]">
            <DesktopLayoutV2>{children}</DesktopLayoutV2>
          </div>
          <NewMailRecived />
          <SentMailToast />
        </Suspense>
      </CalendarProvider>
    </SocketContextProvider>
  );
}

export default MainLayout;
