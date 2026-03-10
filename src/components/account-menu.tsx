import { useAppDispatch } from "@/store/hooks";
import React from "react";
import { Button, buttonVariants } from "./ui/button";
import Image from "next/image";
import {
  ChevronDown,
  Laptop2,
  LogOut,
  Moon,
  Settings2,
  Share,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
 
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "@radix-ui/react-separator";
import { setCurrAccount, setLogout } from "@/store/slices/account";
import { useSockets } from "@/hooks/useSockets";
import { IUser } from "@/lib/types/user.interface";
import { useRouter } from "next/navigation";
import { handleServerlogout } from "./layout/actions/logout";
import { useToast } from "./ui/use-toast";

function AccountMenu({ currAccount }: { currAccount: IUser }) {
  const { socket } = useSockets()
  const router = useRouter()
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const handleLogout = async () => {
    try {
      const data = await handleServerlogout()
      if (data.success) {
        router.push("/")
        socket.disconnect()
        socket.close()      
        dispatch(setLogout())
        toast({
          description: "Logged out successfully",
        });
      }

    } catch (error) {

    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div>
          <div
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "hidden md:flex"
            )}
          >
            <div className="flex flex-row items-center gap-3">
              <Image
                src="/user.png"
                alt="avatar"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
              <div className="flex flex-col items-start cursor-pointer">
                <span>{currAccount?.email}</span>
                <p className="text-xs text-zinc-500">{currAccount?.tenant_name}</p>
              </div>
              <ChevronDown size={15} className="self-start mt-1 cursor-pointer" />
            </div>
          </div>
          <div
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "flex md:hidden ml-1"
            )}
          >
            <Image
              src="/user.png"
              alt="avatar"
              width={64}
              height={64}
              className="h-8 w-8 rounded-full"
            />
            <span className="sr-only">ff</span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0">
        <div className="p-2">

          {currAccount?.role === "USER" && (
            <>

              <Button
                variant={"ghost"}
                className="flex items-center gap-2 text-xs p-2 h-8 w-full justify-start"
                disabled
              >
                <Settings2 className="w-4 h-4" />
                Workspace Settings
              </Button>
              <Button
                variant={"ghost"}
                className="flex items-center gap-2 text-xs p-2 h-8 w-full justify-start"
                disabled
              >
                <Laptop2 className="w-4 h-4" />
                Device Management
              </Button>
              <Button
                variant={"ghost"}
                className="flex items-center gap-2 text-xs p-2 h-8 w-full justify-start"
                disabled
              >
                <Share className="w-4 h-4" />
                Share Space
              </Button>
              <Separator className="my-1 h-[1px] bg-muted" />
            </>
          )}
        </div>

        <div className="px-2 mb-2">
          <Button
            variant={"ghost"}
            className="flex items-center gap-2 text-xs p-2 h-8 w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Log out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default AccountMenu;
