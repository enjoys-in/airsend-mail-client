"use client"
import * as React from "react"
import { HPanelAppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppDispatch } from "@/store/hooks"
import { fetchAdminFromServer } from "@/store/slices/account/admin"
import { HPanelBreadcrumbs } from "@/components/common/hpanel-breadcrumbs"


export default function Layout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  React.useEffect(() => {
    dispatch(fetchAdminFromServer());
  }, [dispatch]);
  return (
    <SidebarProvider>
      <HPanelAppSidebar />
      <SidebarInset className="min-w-0 overflow-x-hidden overflow-y-auto h-svh">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex w-full items-center justify-between gap-3 px-4">
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger className="-ml-1 h-8 w-8 text-muted-foreground hover:text-foreground" />
              <Separator orientation="vertical" className="mr-1 h-4" />
              <HPanelBreadcrumbs />
            </div>
            <div className="flex items-center gap-2">
              <Notifications />
            </div>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}


const Notifications = () => {
  return (
    <React.Fragment>
      <DropdownMenu>
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border-border/70 bg-transparent p-0 text-muted-foreground shadow-none hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"

                >
                  <svg
                    className="flex-shrink-0 size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500 ring-2 ring-background" />

                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Notifications</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenuContent className="w-full max-w-md rounded-lg border-border/70 shadow-md" align="end" forceMount>
          <div className="px-4 py-8  h-[600px]">
            <div className="mb-4 flex justify-between border-b pb-3">
              <p className="text-base font-medium">All Notifications</p>
              <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground shadow-none">
                <Settings className="inline h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-full">
              <div className='w-96'>
                <div
                  className="mb-3 space-y-4 py-2 focus:outline-none focus:ring-1 "
                  tabIndex={0}
                >
                  <h1 className="text-sm text-center text-gray-800 dark:text-slate-200">No Notifications</h1>
                  {/* <div className="relative flex items-center">
                    <div className="ml-4 flex flex-col sm:w-96">
                      <p className="mb-1 font-medium text-gray-700 dark:text-slate-200">Johanson Levinsiki</p>
                      <div className="text-sm text-gray-400">
                        <span className="shrink-0 mr-1 text-rose-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="inline h-3 w-3"
                          >
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                          </svg>
                        </span>
                        <span className="mr-1 font-medium text-rose-500">
                          liked your comment:
                        </span>
                        <span className="">
                          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                        </span>
                      </div>
                    </div>
                    <span className="absolute top-0 right-2 text-sm text-gray-400">
                      1min ago
                    </span>
                  </div> */}
                </div>


              </div>
            </ScrollArea>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </React.Fragment>
  )
}

