import React from 'react'
import { cn, formatBytes } from '@/lib/utils';
import { Folder } from 'lucide-react';
import { CustomDialog } from "@/components/common/CustomDialog"
import StorageCard, { LinearProgressBar } from "@/components/shared/cards/StorageCard"

const SidebarStroageView = ({
  total,
  used,
}: {
  used: number;
  total: number;

}) => {
  const percent = Math.round((used / total) * 100);

  return (
    <div className="flex flex-col cursor-default mt-2">
      <div className="flex flex-row gap-2 items-center">
        <Folder size={10} />
        <div>
          <span className={cn(`text-xs font-bold `, percent < 80 ? `text-blue-500 dark:text-zinc-50` : "text-red-600 dark:text-red-500")}>
            {formatBytes(used)}
          </span>
          <span className="text-xs text-zinc-400"> / {formatBytes(total)}</span>
        </div>
        <CustomDialog triggerComponent={<span className="text-xs text-orange-500 cursor-pointer items-center">View</span>}>
          <StorageCard used={used} total={total} />
        </CustomDialog>
      </div>
      <div className="h-[4px] mt-1 flex w-full items-center rounded-full bg-zinc-300 dark:bg-zinc-300">
        <LinearProgressBar progress={percent} width={250} />
      </div>
    </div>
  );
};

export default SidebarStroageView