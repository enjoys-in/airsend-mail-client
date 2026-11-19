import { cn } from "@tasks/_lib/cn";
import { resolveLabelColor } from "@tasks/_lib/label-color";

type LabelDotProps = {
  color: string;
  className?: string;
};

export function LabelDot({ color, className }: LabelDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-1.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: resolveLabelColor(color) }}
    />
  );
}
