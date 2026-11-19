import type { SourceLogoProps } from "@tasks/_components/import/source-logos/source-logo-size";
import { cn } from "@tasks/_lib/cn";

export function PlankaLogo({ size }: SourceLogoProps) {
  return (
    <img
      src="/tasks/images/import-sources/planka.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={cn(
        "shrink-0",
        size === "sm" ? "size-[22px] rounded-[5px]" : "size-7 rounded-md",
      )}
    />
  );
}
