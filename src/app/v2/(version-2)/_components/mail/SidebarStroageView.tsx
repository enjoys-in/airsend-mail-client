import React from 'react'
import { cn, formatBytes } from '@/lib/utils';
import { HardDrive } from 'lucide-react';
import { CustomDialog } from "@/components/common/CustomDialog"
import StorageCard from "@/components/shared/cards/StorageCard"

const SidebarStroageView = ({
  total,
  used,
}: {
  used: number;
  total: number;
}) => {
  const percent = total > 0 ? (used / total) * 100 : 0;
  const displayPercent = percent < 1 && percent > 0 ? percent.toFixed(2) : Math.round(percent);
  // Ensure minimum visible width when there's any usage
  const barWidth = percent > 0 ? Math.max(percent, 0.5) : 0;

  return (
    <div className="flex flex-col gap-1.5 cursor-default px-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <HardDrive size={11} className="text-muted-foreground/50" />
          <span className="text-[11px] text-muted-foreground">
            <span className={cn("font-medium", percent < 80 ? "text-foreground" : "text-red-500")}>
              {formatBytes(used)} ({displayPercent}%)
            </span>
            <span className="text-muted-foreground/50"> / {formatBytes(total)}</span>
          </span>
        </div>
        <CustomDialog triggerComponent={
          <span className="text-[10px] text-primary/70 hover:text-primary cursor-pointer transition-colors duration-150">Details</span>
        }>
          <StorageCard used={used} total={total} />
        </CustomDialog>
      </div>
      <div className="h-1 w-full rounded-full bg-muted/50 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            percent < 50 ? "bg-emerald-500" :
            percent < 80 ? "bg-amber-500" :
            "bg-red-500"
          )}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
};

export default SidebarStroageView