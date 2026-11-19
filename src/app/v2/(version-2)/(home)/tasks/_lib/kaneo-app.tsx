"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import queryClient from "@tasks/_query-client";
import { useAuth } from "@tasks/_components/providers/auth-provider/hooks/use-auth";
import { SequenceHint } from "../_components/shortcuts/sequence-hint";
import { ShortcutsPanel } from "../_components/shortcuts/shortcuts-panel";
import {
  RouteError,
  RouteNotFound,
  RoutePending,
} from "../_components/common/route-states";
import AuthProvider from "../_components/providers/auth-provider";
import { ThemeProvider } from "../_components/providers/theme-provider";
import { ErrorBoundary } from "../_components/ui/error-boundary";
import { ShortcutListener } from "./shortcuts/shortcut-listener";
import { captureCheckoutIntent } from "./checkout-intent";
import { preloadRouteComponents } from "./preload-route-components";
import { AppI18nProvider } from "./i18n/provider";
import { stripTasksBasePath, TASKS_BASE_PATH } from "./base-path";
import { routeTree } from "../_routeTree.gen";

// Capture a pricing-page `?checkout=<plan>-<interval>` deep link before the
// router runs and strips it across the sign-up → onboarding redirect chain.
captureCheckoutIntent();

const router = createRouter({
  routeTree,
  basepath: TASKS_BASE_PATH,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultPendingComponent: RoutePending,
  defaultErrorComponent: RouteError,
  defaultNotFoundComponent: RouteNotFound,
  // Don't flash a spinner for fast loads; once shown, keep it long enough to read as a state.
  defaultPendingMs: 250,
  defaultPendingMinMs: 400,
  context: {
    user: null,
    queryClient,
  },
});

preloadRouteComponents(router, stripTasksBasePath(window.location.pathname));

function App() {
  const { user } = useAuth();

  return <RouterProvider router={router} context={{ user }} />;
}

// Root boundary fallback: shows a generic message and a refresh button,
// without rendering the raw error.message.
function RootCrashFallback({
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          {t("common:error.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("common:error.description")}
        </p>
        <button
          type="button"
          onClick={resetError}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("common:error.refreshPage")}
        </button>
      </div>
    </div>
  );
}

export default function KaneoApp() {
  return (
    <ErrorBoundary fallback={RootCrashFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <AppI18nProvider>
              <ShortcutListener />
              <App />
              <ShortcutsPanel />
              <SequenceHint />
            </AppI18nProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
