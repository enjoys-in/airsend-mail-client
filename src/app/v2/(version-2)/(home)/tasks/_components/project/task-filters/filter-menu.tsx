import { ListFilter } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@tasks/_components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@tasks/_components/ui/popover";
import { ShortcutTooltipLabel } from "@tasks/_components/shortcuts/shortcut-tooltip-label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@tasks/_components/ui/tooltip";
import { cn } from "@tasks/_lib/cn";
import { useShortcut } from "@tasks/_lib/shortcuts/use-shortcut";
import { FilterRootPanel } from "./filter-root-panel";
import type { FilterSubject } from "./filter-subject";

type FilterMenuProps = {
  subjects: FilterSubject[];
  activeCount: number;
};

export function FilterMenu({ subjects, activeCount }: FilterMenuProps) {
  const { t } = useTranslation();
  const label = t("common:actions.filter");
  const [open, setOpen] = useState(false);
  useShortcut("addFilter", () => setOpen((value) => !value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={label}
                  className={cn(
                    "data-popup-open:bg-accent",
                    activeCount > 0 && "bg-accent",
                  )}
                />
              }
            />
          }
        >
          <ListFilter />
          {activeCount > 0 && (
            <span className="-top-1 -right-1 absolute inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background tabular-nums">
              {activeCount}
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <ShortcutTooltipLabel label={label} shortcutId="addFilter" />
        </TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-60">
        <FilterRootPanel subjects={subjects} onApplied={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
