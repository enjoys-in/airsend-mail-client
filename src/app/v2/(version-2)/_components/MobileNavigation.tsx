"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Inbox, Calendar, LayoutGrid, Bell } from "lucide-react";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import React from "react";

type TabItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  matchPath: string
  /** Optional feature-flag key — tab hidden when the flag is false */
  featureKey?: "canAccessCalendar" | "canAccessWorkspace"
}

const tabs: TabItem[] = [
  {
    label: "Mail",
    icon: Inbox,
    href: "/v2/u/mail/inbox",
    matchPath: "/v2/u/mail",
  },
  {
    label: "Calendar",
    icon: Calendar,
    href: "/v2/calender",
    matchPath: "/v2/calender",
    featureKey: "canAccessCalendar",
  },
  {
    label: "Workspace",
    icon: LayoutGrid,
    href: "/v2/workspace",
    matchPath: "/v2/workspace",
    featureKey: "canAccessWorkspace",
  },
  {
    label: "Notifications",
    icon: Bell,
    href: "#",
    matchPath: "/v2/notifications",
  },
];

const MobileNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { canAccessCalendar, canAccessWorkspace, isLoaded } = useFeatureAccess();

  const featureFlagMap = { canAccessCalendar, canAccessWorkspace } as const;
  const visibleTabs = React.useMemo(
    () => tabs.filter((tab) => {
      if (!tab.featureKey) return true;
      if (!isLoaded) return true;
      return featureFlagMap[tab.featureKey];
    }),
    [isLoaded, canAccessCalendar, canAccessWorkspace],
  );

  return (
    <nav className="bottom-0 left-0 right-0 flex h-14 items-center justify-around border-t border-border/40 bg-background px-1">
      {visibleTabs.map((tab) => {
        const isActive = pathname.includes(tab.matchPath);
        return (
          <button
            key={tab.label}
            onClick={() => tab.href !== "#" && router.push(tab.href)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <tab.icon className={cn("size-5", isActive && "stroke-[2.5]")} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNavigation;