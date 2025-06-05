import { Menu } from "lucide-react";
import AccountMenu from "../account-menu";
import SearchInput from "../SearchInput";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import LeftSidebar from "./left-sidebar";
import Image from "next/image";
import { useAppSelector } from "@/store/hooks";
import { LogoImage } from "../logo-image";

const Topbar = () => {
  const currAcc = useAppSelector((state) => (state.accounts.currAccount));

  return (
    <>
      <div className="flex flex-row justify-end md:justify-between w-full h-[3rem] md:h-[4rem]">
        <div className="flex md:hidden items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size={"icon"}>
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent
              className="flex w-[300px] md:w-[540px] h-[100dvh] overflow-auto"
              side={"left"}
            >
              <LeftSidebar />
            </SheetContent>
          </Sheet>
          <LogoImage />
        </div>
        <SearchInput />

        <div className="flex items-center md:p-2 flex-1 ">
          <div className="w-full flex-1 flex justify-end items-center md:gap-2 py-1">
            <div className="hidden flex-1 ml-3">
              <SearchInput />
            </div>
            {/* <NotificationPopover /> */}
            {/* <AppsPoppover /> */}

            <AccountMenu currAccount={currAcc!} />
          </div>
        </div>
      </div>
      <Separator className="hidden md:block" />
    </>
  );
};
export default Topbar;
