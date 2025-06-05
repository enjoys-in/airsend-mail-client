import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import { IconType } from "react-icons";
import { BsStars } from "react-icons/bs";
import { FaFolder, FaInbox, FaShare, FaTelegram } from "react-icons/fa";
import { FaPenToSquare } from "react-icons/fa6";
import { Button, buttonVariants } from "./ui/button";
import { ComposeEmailDrawerSheet } from "./compose-email-sheet-dialog";

export type TTab = "Inbox" | "Starred" | "Compose" | "Sent" | "Folders";

function BottomMenu() {
  const pathname = usePathname();
  return (
    <div
      className={cn(
        "flex flex-row justify-center items-center gap-6 px-6 py-2 dark:bg-[#111315]"
      )}
    >
      <Link
        href={"/"}
        className={`flex-1 h-full rounded-md  md:hover:bg-zinc-900 py-2  ${
          pathname === "/"
            ? "text-zinc-800 dark:text-white  bg-zinc-300 dark:bg-[#222529]"
            : " text-zinc-400"
        }`}
      >
        <IconButton Icon={FaInbox} label="Inbox" />
      </Link>
      <Link
        href={"sent"}
        className={`flex-1 h-full rounded-md  md:hover:bg-zinc-900 py-2 ${
          pathname === "/sent"
            ? "text-zinc-800 dark:text-white bg-zinc-300 dark:bg-[#222529]"
            : " text-zinc-400"
        }`}
      >
        <IconButton Icon={FaShare} label="Sent" />
      </Link>
      <div className={`flex-1 h-full rounded-md text-zinc-300 relative`}>
        <ComposeEmailDrawerSheet>
          <div
            className={cn(
              buttonVariants({ variant: "outline" }),
              "absolute left-[50%] translate-x-[-50%] top-[-4rem] p-6 rounded-full w-[70px] h-[70px]",
              "bg-[#5a61ff] hover:bg-[#5a61ff] shadow-[0_15px_35px_0px#5a61ff77] md:hover:shadow-[0_15px_35px_0px#5a61ff]",
              "text-white"
            )}
          >
            <IconButton Icon={FaPenToSquare} label="" />
          </div>
        </ComposeEmailDrawerSheet>
      </div>
      <Link
        href={"starred"}
        className={`flex-1 h-full rounded-md  md:hover:bg-zinc-900 py-2  ${
          pathname === "/starred"
            ? "text-zinc-800 dark:text-white bg-zinc-300 dark:bg-[#222529]"
            : " text-zinc-400"
        }`}
      >
        <IconButton Icon={BsStars} label="Starred" />
      </Link>
      <Link
        href={"folders"}
        className={`flex-1 h-full rounded-md  md:hover:bg-zinc-900 py-2  ${
          pathname === "/folders"
            ? "text-zinc-800 dark:text-white bg-zinc-300 dark:bg-[#222529]"
            : " text-zinc-400"
        }`}
      >
        <IconButton Icon={FaFolder} label="Folders" />
      </Link>
    </div>
  );
}

export default BottomMenu;

const IconButton = ({ Icon, label }: { Icon: IconType; label: string }) => {
  return (
    <div className="flex-1 flex flex-col justify-between items-center gap-2 ">
      <Icon size={22} />
      <span className="text-[.715rem]">{label}</span>
    </div>
  );
};
