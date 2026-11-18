"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { usePathname } from "next/navigation";

interface NavProps {
  /** Unread count shown next to the inbox link (the Redux mails slice it came from was removed). */
  unreadCount?: number;
  links: {
    title: string;
    icon?: LucideIcon;
    href: string;
  }[];
}

function Nav({ links, unreadCount = 0 }: NavProps) {
  const pathname = usePathname();
  const unread = unreadCount;
  return (
    <div className="group flex flex-col gap-4 py-2">
      <nav className="grid gap-1">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "justify-between px-2 ",
              pathname === link.href ? "dark:bg-[#5a61ff22]" : ""
            )}
          >
            <span
              className={cn(
                "flex",
                pathname === link.href
                  ? "dark:text-[#5a61ff] font-bold "
                  : "dark:text-zinc-300"
              )}
            >
              {link.icon && <link.icon className="mr-2 h-4 w-4" />}
              {link.title}
            </span>
           
            {link.href === "/u/inbox" && (
              <span className="text-center text-xs w-4 h-4 bg-red-500 rounded-full">
                {unread}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default Nav;
