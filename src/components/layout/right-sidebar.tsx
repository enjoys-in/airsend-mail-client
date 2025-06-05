"use client"
import {
  Calendar as CalendarIcon,
  Contact2,
  Shield,
  Tag,
  X,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { Icons } from "../icons";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useAppSelector } from "@/store/hooks";

const ITEMS = [
  { id: 1, icon: Contact2, name: "Contacts" },
  { id: 2, icon: CalendarIcon, name: "Calendar" },
  { id: 3, icon:Tag , name: "Campaigns" },
  { id: 4, icon:Shield , name: "Workspace" },
];
const RightSideBar = () => {
  const [openItem, setOpenItem] = useState<number | null>(null);
  const role = useAppSelector((state) => state.accounts.currAccount?.role);

  return (
    <div className="hidden lg:flex">
      <Separator orientation="vertical" className="full" />
      {role === "USER" && (
        <aside
          className={cn(
            openItem ? "w-[400px]" : "w-[50px]",
            "flex overflow-hidden",
            "transition-[width] duration-300"
          )}
        >
          <div className="flex flex-col items-center  w-[50px] gap-y-2">
            <div className="flex flex-col  justify-end">
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
            <div className="flex items-center justify-center  p-4 mt-auto">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <span className="flex hover:text-gray-300 hover:bg-zinc-800 p-2 rounded">
                    <Icons.userIcon />
                  </span>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between space-x-4">
                    <Avatar>
                      <AvatarImage src="/user.png" />
                      <AvatarFallback>MS</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">@mullayam06</h4>
                      <p className="text-sm">
                        AirSend - created and maintained by ENJOYS.
                      </p>
                      <div className="flex items-center pt-2">
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                        <span className="text-xs text-muted-foreground">
                          Created June 2024
                        </span>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>

          {
            openItem && (
              <div className="w-full flex flex-col items-end">
                <Button variant={"outline"} className="rounded-full text-red-500" onClick={() => setOpenItem(null)}>
                  <Tooltip>
                    <svg className="w-2.5 h-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                    </svg>
                  </Tooltip>
                </Button>
                {openItem === 1 && (
                  <div className="w-full h-full flex justify-center items-center">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Contacts
                    </h3>
                  </div>
                )}
                {openItem === 2 && (
                  <div className="w-full h-full flex flex-col justify-center items-center">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Calendar
                    </h3>
                    <Calendar
                      mode="single"
                      // selected={date}
                      // onSelect={setDate}
                      className="rounded-md border"
                    />
                  </div>
                )}
                {openItem === 3 && (
                  <div className="w-full h-full flex justify-center items-center">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Campaigns  Upcomming
                    </h3>
                  </div>
                )}
                {openItem === 4 && (
                  <div className="w-full h-full flex justify-center items-center">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Workspace Upcomming
                    </h3>
                  </div>
                )}
              </div>
            )
          }
        </aside >
      )}


    </div>
  );
};
export default RightSideBar;
