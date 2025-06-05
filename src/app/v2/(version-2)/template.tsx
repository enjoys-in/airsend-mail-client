"use client"
import React, { ReactNode, Suspense, } from "react";

import { useAppDispatch } from "@/store/hooks";
import { Spinner } from "@/components/common/spinner";
import SocketContextProvider from "@/context/SocketContext";
import NewMailRecived from "@/components/common/new-mail-recived";

import PermissionNotification from "@/components/common/permissionNotification";

import DesktopLayoutV2 from "./_components/desktop-layout";
import { CalendarProvider } from "./(home)/calender/_components/event-calendar/calendar-context";
import { MobileLayoutV2 } from "./_components/mobile-layout";
import { fetchCurrentUser } from "@/store/slices/account";
import SentMailToast from "@/components/common/sent-mail";
 
function MainLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  React.useEffect(() => {
    dispatch(fetchCurrentUser());
  }, []);
  return (
    
      <SocketContextProvider>
        <CalendarProvider>
          <PermissionNotification />
          <Suspense fallback={<Spinner />}>
            <div className="flex md:hidden flex-1 bg-[#111315]">
              <MobileLayoutV2>{children} </MobileLayoutV2>
            </div>
            <div className="hidden md:flex flex-1  bg-[#111315]">
              <DesktopLayoutV2 >{children} </DesktopLayoutV2>
            </div>

            <NewMailRecived />
            <SentMailToast />
          </Suspense>
        </CalendarProvider>
      </SocketContextProvider>
    
  );
}

export default MainLayout;



