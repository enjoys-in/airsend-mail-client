import {
  type ErrorComponentProps,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TasksSkeleton } from "@/components/common/tasks-skeleton";
import { Button } from "@tasks/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tasks/_components/ui/card";
import { ErrorDisplay } from "@tasks/_components/ui/error-display";
import { stripTasksBasePath } from "@tasks/_lib/base-path";
import { isSessionBootstrapError } from "@tasks/_lib/ensure-session";
import { BootFrame, isShellPath } from "./boot-frame";

// Shared router fallbacks (`defaultPendingComponent`, `defaultErrorComponent` and
// `defaultNotFoundComponent` in kaneo-app.tsx). Every route that suspends or throws ends up here
// instead of rendering a blank pane.

/** Shown while a route loads: the app-shell skeleton on the dashboard, a content skeleton elsewhere. */
export function RoutePending() {
  if (isShellPath(stripTasksBasePath(window.location.pathname))) {
    return <BootFrame />;
  }
  return <TasksSkeleton variant="content" className="delayed-reveal" />;
}

function SessionError({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const unreachable =
    isSessionBootstrapError(error) && error.reason === "unreachable";

  return (
    <div className="flex h-full min-h-0 w-full flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/12">
            <AlertTriangle className="size-6 text-destructive-foreground" />
          </div>
          <CardTitle className="text-lg">
            {unreachable
              ? t("common:error.serviceUnavailable.title", {
                  defaultValue: "Something went wrong",
                })
              : t("common:error.session.title", {
                  defaultValue: "Couldn't open Tasks",
                })}
          </CardTitle>
          <CardDescription className="text-sm">
            {unreachable
              ? t("common:error.serviceUnavailable.message", {
                  defaultValue: "Service is not available right now. Please try again in a moment.",
                })
              : t("common:error.session.rejected", {
                  defaultValue:
                    "The tasks service didn't accept your AirSend session. Sign in to AirSend again, then retry.",
                })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={onRetry}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="mr-2 size-4" />
            {t("common:error.tryAgain")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/** Route-level error boundary: a retry re-runs the route's loaders instead of reloading the page. */
export function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const retry = () => {
    reset();
    void router.invalidate();
  };

  if (isSessionBootstrapError(error)) {
    return <SessionError error={error} onRetry={retry} />;
  }
  return (
    <ErrorDisplay
      className="h-full flex-1"
      error={error}
      onRetry={retry}
    />
  );
}

export function RouteNotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="flex h-full min-h-0 w-full flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">
            {t("common:notFound.title", { defaultValue: "Page not found" })}
          </CardTitle>
          <CardDescription className="text-sm">
            {t("common:notFound.description", {
              defaultValue: "This page doesn't exist or you can't access it.",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => void navigate({ to: "/dashboard" })}
            size="sm"
            variant="outline"
          >
            {t("common:notFound.back", { defaultValue: "Back to dashboard" })}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
