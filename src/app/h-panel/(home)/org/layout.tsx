import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { OrgSidebar } from "./_components/app-sidebar"


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>  
      <OrgSidebar/>   
      {children}
    </SidebarProvider>
  )
}

