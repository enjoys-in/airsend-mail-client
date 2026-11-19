"use client";

import React, { useEffect, useState } from "react";
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { Progress } from "../ui/progress";
import { useDriveOps } from "../../_hooks/useDriveOps";
import { Moon, Settings, Sun } from "lucide-react";
import { formatFileSize } from "../../_lib/file-utils";

export default function StorageFooter() {
  const { driveInfo, isLoadingDriveInfo } = useDriveOps();
  const [usedSpace, setUsedSpace] = useState<number>(0);
  const [totalSpace, setTotalSpace] = useState<number>(0);
  const [usagePercent, setUsagePercent] = useState<number>(0);

  useEffect(() => {
    if (driveInfo) {
      const newUsed = driveInfo.usedSpace || 0;
      const newTotal = driveInfo.totalSpace || 1;
      const percent = newTotal > 0 ? Math.floor((newUsed / newTotal) * 100) : 0;
      setUsedSpace(newUsed);
      setTotalSpace(newTotal);
      setUsagePercent(percent);
    }
  }, [driveInfo]);

  return (
    <SidebarFooter className="p-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex flex-col gap-2 rounded-lg border p-3 bg-card text-card-foreground">
            <div className="flex items-center justify-between text-xs font-medium">
              <span>Storage</span>
              <span>{usagePercent}% Used</span>
            </div>
            <Progress value={usagePercent} className="h-1.5" />
            <div className="text-xs text-muted-foreground">
              {formatFileSize(usedSpace)} of {formatFileSize(totalSpace)}
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
