import * as React from "react"
import { AirVent, Plus } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Calendar as CalendarIcon,
  Contact2,
  Shield,
  Tag,
  X,
} from "lucide-react";


import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"


import { Button } from "@/components/ui/button"

import { BsThunderbolt } from "react-icons/bs";
import { StreamingText } from "@/components/common/StreamingText";

const ITEMS = [
  { id: 1, icon: Contact2, name: "Contacts" },
  { id: 2, icon: CalendarIcon, name: "Calendar" },
  { id: 3, icon: Tag, name: "Campaigns" },
  { id: 4, icon: AirVent, name: "AI" },
];

export function SidebarRightV2({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [openItem, setOpenItem] = React.useState<number | null>(null);

  return (
    <Sidebar collapsible="none" className={cn("sticky hidden lg:flex top-0 h-svh border-l z-20 transition-[width] duration-300", openItem ? "w-[400px]" : "w-[52px]")} {...props}>
      <SidebarHeader className="h-14 border-b border-sidebar-border">
        <BsThunderbolt />
      </SidebarHeader>
      <SidebarContent>
        <SidebarSeparator className="ml-1"/>
        <div className="flex gap-y-2 flex-row">
          <div className="flex flex-col items-center justify-center ">
            {ITEMS.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    size={"icon"}
                    variant={openItem === item.id ? "outline" : "ghost"}
                    className={
                      openItem === item.id
                        ? "text-white"
                        : "text-muted-foreground"
                    }
                    onClick={() =>
                      setOpenItem(openItem === item.id ? null : item.id)
                    }
                  >
                    <item.icon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{item.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}

          </div>
         <div className="border  border-l w-full h-full  mx-2" >
         {
            openItem === 4 && <StreamingText text="My brain is not procssing" />
          }
         </div>
        </div>
        
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Plus />
              <span>New Calendar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
export default function AvatarList() {
  // Sample data to demonstrate scrolling
  const avatars = [
    { name: "Jack", initial: "J", bgColor: "bg-[#E6E1FF]", badge: "3", badgeColor: "bg-[#5B50D6]" },
    { name: "Figma", type: "figma", badge: "12", badgeColor: "bg-[#5B50D6]" },
    { name: "Megan", initial: "M", bgColor: "bg-[#FFE1E1]" },
    { name: "Slack", type: "slack" },
    { name: "Stefan", initial: "S", bgColor: "bg-[#E1F0E5]" },
    { name: "Alex", initial: "A", bgColor: "bg-[#E1F0FF]", badge: "5", badgeColor: "bg-[#5B50D6]" },
    { name: "Taylor", initial: "T", bgColor: "bg-[#FFF0E1]" },
    { name: "Discord", type: "discord", badge: "8", badgeColor: "bg-[#5B50D6]" },
    { name: "Olivia", initial: "O", bgColor: "bg-[#F0E1FF]" },
    { name: "Noah", initial: "N", bgColor: "bg-[#E1FFE8]", badge: "2", badgeColor: "bg-[#5B50D6]" },
  ]

  return (
    <div className="flex flex-col space-y-4">
      {avatars.map((avatar, index) => (
        <div key={index} className="flex items-center space-x-4">
          <div className="relative">
            {avatar.type === "figma" ? (
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm">
                <div className="relative w-6 h-6">
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 rounded-full bg-[#F24E1E]"></div>
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#FF7262]"></div>
                  <div className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full bg-[#A259FF]"></div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1ABCFE]"></div>
                </div>
              </div>
            ) : avatar.type === "slack" ? (
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm">
                <div className="w-7 h-7">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.687 8.834a2.528 2.528 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.522 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.522 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.687a2.527 2.527 0 0 1-2.52-2.522 2.527 2.527 0 0 1 2.52-2.52h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.522h-6.313z"
                      fill="#E01E5A"
                      className="fill-[#E01E5A]"
                    />
                    <path
                      d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
                      fill="#E01E5A"
                      className="fill-[#E01E5A]"
                    />
                    <path
                      d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
                      fill="#36C5F0"
                      className="fill-[#36C5F0]"
                    />
                    <path
                      d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.687 8.834a2.528 2.528 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.522 2.522v6.312z"
                      fill="#2EB67D"
                      className="fill-[#2EB67D]"
                    />
                    <path
                      d="M15.165 18.956a2.528 2.528 0 0 1 2.522 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.687a2.527 2.527 0 0 1-2.52-2.522 2.527 2.527 0 0 1 2.52-2.52h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.522h-6.313z"
                      fill="#ECB22E"
                      className="fill-[#ECB22E]"
                    />
                  </svg>
                </div>
              </div>
            ) : avatar.type === "discord" ? (
              <div className="w-14 h-14 rounded-full bg-[#5865F2] flex items-center justify-center shadow-sm">
                <svg width="24" height="24" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"
                    fill="white"
                  />
                </svg>
              </div>
            ) : (
              <div
                className={`w-14 h-14 rounded-full ${avatar.bgColor} flex items-center justify-center text-xl font-medium`}
              >
                {avatar.initial}
              </div>
            )}
            {avatar.badge && (
              <div
                className={`absolute -right-1 -bottom-1 w-5 h-5 ${avatar.badgeColor} rounded-full flex items-center justify-center text-white text-xs font-medium`}
              >
                {avatar.badge}
              </div>
            )}
          </div>
          <span className="text-sm">{avatar.name}</span>
        </div>
      ))}
    </div>
  )
}