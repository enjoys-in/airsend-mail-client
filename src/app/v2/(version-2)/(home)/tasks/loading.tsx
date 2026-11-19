import { Loader2 } from "lucide-react";

export default function TasksLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-[calc(100svh-3.5rem)] md:h-[calc(100svh-3rem)] w-full flex-1 items-center justify-center"
    >
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
