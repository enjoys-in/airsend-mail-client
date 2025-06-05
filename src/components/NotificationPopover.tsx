import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { buttonVariants } from "./ui/button";
import { Bell } from "lucide-react";
import Notifications from "./shared/notifications";
import { ScrollArea } from "@/components/ui/scroll-area"

function NotificationPopover() {
  return (
    <Popover>
      <PopoverTrigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "relative",
                buttonVariants({ size: "icon", variant: "ghost" })
              )}
            >
              <Bell className="h-4 w-4"  />
              <div className="absolute right-3 top-3 w-2 h-2 bg-red-500 rounded-full animate-ping"/>
              <div className="absolute right-3 top-3 w-2 h-2 bg-red-500 rounded-full "/>
              <span className="sr-only">Notifications</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] h-[500px] flex ">
        <ScrollArea >
          <Notifications />
        </ScrollArea>
        {/* <p className="text-center text-muted-foreground">No notifications!</p> */}
      </PopoverContent>
    </Popover>
  );
}

export default NotificationPopover;
