import * as React from "react"

import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebarV2 } from "./sidebar"
import { SidebarRightV2 } from "./sidebar-right"
import { HeaderV2 } from "./header";




export default function DesktopLayoutV2({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "360px",
                } as React.CSSProperties
            }
        >
            <AppSidebarV2 />
            <SidebarInset className="!min-h-0 h-svh overflow-y-auto overflow-x-hidden">
                <HeaderV2 />
                {children}
            </SidebarInset>
            {/* <SidebarRightV2 /> */}
        </SidebarProvider>
    )
}




