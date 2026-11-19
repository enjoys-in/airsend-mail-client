"use client";

import React, { createContext, useContext, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, usePathname, useParams as useNextParams } from "next/navigation";

export interface DashboardSearch {
  folderId?: string;
  type?: string;
  id?: string;
  connectAccount?: boolean;
  tagId?: string;
  providerSlug?: string;
  accountId?: string;
  [key: string]: any;
}

interface RouterContextValue {
  search: DashboardSearch;
  setSearch: (updater: Partial<DashboardSearch> | ((prev: DashboardSearch) => Partial<DashboardSearch>)) => void;
  navigate: (opts: {
    to?: string;
    search?: Partial<DashboardSearch> | ((prev: DashboardSearch) => Partial<DashboardSearch>);
    params?: Record<string, string>;
    replace?: boolean;
  }) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function mapTargetPath(rawTarget: string, params?: Record<string, string>, search?: Record<string, any>): string {
  let target = rawTarget || "";
  if (params) {
    for (const [pk, pv] of Object.entries(params)) {
      target = target.replace(`$${pk}`, pv).replace(`:${pk}`, pv);
    }
  }
  if (target === "/dashboard" || target === "") {
    target = "/v2/files";
  } else if (target === "/dashboard/settings" || target === "/settings") {
    target = "/v2/files/settings";
  } else if (target === "/contributors") {
    target = "/v2/files/contributors";
  } else if (target === "/developers") {
    target = "/v2/files/developers";
  } else if (target === "/privacy") {
    target = "/v2/files/privacy";
  } else if (target === "/terms") {
    target = "/v2/files/terms";
  } else if (target.startsWith("/dashboard/")) {
    target = target.replace("/dashboard/", "/v2/files/");
  }

  if (search) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(search)) {
      if (v !== undefined && v !== null && v !== false) {
        sp.set(k, String(v));
      }
    }
    const q = sp.toString();
    if (q) {
      target = target.includes("?") ? `${target}&${q}` : `${target}?${q}`;
    }
  }
  return target;
}

function InnerFilesRouterProvider({
  children,
  initialParams = {},
}: {
  children: React.ReactNode;
  initialParams?: Record<string, string>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const search = useMemo<DashboardSearch>(() => {
    const res: DashboardSearch = {};
    if (!searchParams) return res;
    searchParams.forEach((value, key) => {
      if (value === "true") (res as any)[key] = true;
      else if (value === "false") (res as any)[key] = false;
      else (res as any)[key] = value;
    });
    return res;
  }, [searchParams]);

  const navigate = useCallback(
    (opts: {
      to?: string;
      search?: Partial<DashboardSearch> | ((prev: DashboardSearch) => Partial<DashboardSearch>);
      params?: Record<string, string>;
      replace?: boolean;
    }) => {
      const nextSearch =
        typeof opts.search === "function" ? opts.search(search) : { ...search, ...(opts.search || {}) };

      const rawTarget = opts.to || pathname;
      const finalUrl = mapTargetPath(rawTarget, opts.params, nextSearch);

      if (opts.replace) {
        router.replace(finalUrl);
      } else {
        router.push(finalUrl);
      }
    },
    [router, search, pathname]
  );

  const setSearch = useCallback(
    (updater: Partial<DashboardSearch> | ((prev: DashboardSearch) => Partial<DashboardSearch>)) => {
      navigate({ search: updater });
    },
    [navigate]
  );

  const value = useMemo(
    () => ({
      search,
      setSearch,
      navigate,
      params: initialParams,
    }),
    [search, setSearch, navigate, initialParams]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function FilesRouterProvider({
  children,
  initialParams = {},
}: {
  children: React.ReactNode;
  initialParams?: Record<string, string>;
}) {
  return (
    <Suspense fallback={null}>
      <InnerFilesRouterProvider initialParams={initialParams}>
        {children}
      </InnerFilesRouterProvider>
    </Suspense>
  );
}

export function useNavigate(_options?: any) {
  const ctx = useContext(RouterContext);
  const router = useRouter();
  const pathname = usePathname();

  if (ctx) {
    return ctx.navigate;
  }

  return (opts: any) => {
    if (opts?.to) {
      if (opts.replace) router.replace(opts.to);
      else router.push(opts.to);
    } else if (opts?.search) {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(opts.search)) {
        if (v !== undefined && v !== null) sp.set(k, String(v));
      }
      const q = sp.toString() ? `?${sp.toString()}` : "";
      if (opts.replace) router.replace(`${pathname}${q}`);
      else router.push(`${pathname}${q}`);
    }
  };
}

export function useSearch(_options?: any): DashboardSearch {
  const ctx = useContext(RouterContext);
  if (ctx) {
    return ctx.search;
  }
  return {};
}

export function useParams(_options?: any): Record<string, string> {
  const nextParams = useNextParams();
  const ctx = useContext(RouterContext);
  if (nextParams && Object.keys(nextParams).length > 0) {
    return nextParams as Record<string, string>;
  }
  return ctx?.params || { providerSlug: "g", accountId: "default" };
}

import NextLink from "next/link";

export function useLocation(): { pathname: string; search: DashboardSearch } {
  const pathname = usePathname();
  const search = useSearch();
  return {
    pathname: pathname || "/v2/files",
    search,
  };
}

export function createFileRoute(_path: string) {
  return (config: any) => {
    const Component = config?.component;
    return {
      component: Component,
      useSearch: () => useSearch(),
      useParams: () => useParams(),
    };
  };
}

export function createRootRoute(_config?: any) {
  return {};
}

export function redirect(_opts?: any) {
  return {};
}

export function Outlet() {
  return null;
}

export const Link = React.forwardRef<HTMLAnchorElement, any>(({ to, href, search, params, ...props }, ref) => {
  const raw = href || to || "#";
  const target = mapTargetPath(raw, params, search);
  return <NextLink ref={ref} href={target} {...props} />;
});
Link.displayName = "Link";

