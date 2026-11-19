import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Loading skeleton for the tasks (Kaneo) route. It lives here, not under the tasks folder,
// because that folder is excluded from the host's Tailwind scan: the skeleton shows before Kaneo's
// own stylesheet has loaded, so it may only rely on classes the host build contains. It mirrors
// the real layout (sidebar, page header, filter row, board columns) so nothing jumps when the app
// replaces it.

const NAV_ROWS = ["w-20", "w-24", "w-16", "w-28"];
const PROJECT_ROWS = ["w-28", "w-20", "w-32", "w-24", "w-16"];
const COLUMNS = [3, 2, 4, 2];

/** The Kaneo sidebar sections, for the AirSend sidebar panel while the app loads. */
export function TasksSidebarSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex min-h-0 flex-1 flex-col gap-5 p-3", className)}
    >
      <Skeleton className="h-9 w-full rounded-lg" />
      <div className="flex flex-col gap-3">
        {NAV_ROWS.map((width, i) => (
          <div key={i} className="flex items-center gap-2.5 px-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className={cn("h-3", width)} />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-14 px-1" />
        {PROJECT_ROWS.map((width, i) => (
          <div key={i} className="flex items-center gap-2.5 px-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className={cn("h-3", width)} />
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-2.5 px-1">
        <Skeleton className="h-7 w-7 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-40" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 px-4 py-3">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden px-4 pb-4">
        {COLUMNS.map((cards, column) => (
          <div
            key={column}
            className="flex w-72 shrink-0 flex-col gap-2 rounded-xl bg-muted/30 p-2"
          >
            <div className="flex items-center gap-2 px-1 py-1">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="ml-auto h-3 w-5" />
            </div>
            {Array.from({ length: cards }, (_, card) => (
              <div
                key={card}
                className="flex flex-col gap-2.5 rounded-lg border border-border bg-background p-3"
              >
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3.5 w-full" />
                {card % 2 === 0 ? <Skeleton className="h-3.5 w-2/3" /> : null}
                <div className="flex items-center gap-1.5 pt-1">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

type TasksSkeletonProps = {
  /**
   * `page` is the whole route (sized to the space below the AirSend header); `content` is only
   * the pane, for use inside the running app. Neither includes the sidebar: that lives in the
   * AirSend sidebar panel, which shows `TasksSidebarSkeleton` itself.
   */
  variant?: "page" | "content";
  className?: string;
};

export function TasksSkeleton({
  variant = "page",
  className,
}: TasksSkeletonProps) {
  const page = variant === "page";
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "flex w-full overflow-hidden bg-background",
        page ? "h-[calc(100svh-3.5rem)] md:h-[calc(100svh-3rem)]" : "h-full flex-1",
        className,
      )}
      role="status"
    >
      <span className="sr-only">Loading tasks…</span>
      <ContentSkeleton />
    </div>
  );
}
