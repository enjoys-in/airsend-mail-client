"use client";

import React, { createContext, useContext, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

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

      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(nextSearch)) {
        if (v !== undefined && v !== null && v !== false) {
          sp.set(k, String(v));
        }
      }

      const q = sp.toString() ? `?${sp.toString()}` : "";
      const target = opts.to || pathname;
      if (opts.replace) {
        router.replace(`${target}${q}`);
      } else {
        router.push(`${target}${q}`);
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
  const ctx = useContext(RouterContext);
  return ctx?.params || { providerSlug: "g", accountId: "default" };
}

export function useLocation(): { pathname: string; search: Record<string, string> } {
  const pathname = usePathname();
  const search = useSearch();
  return {
    pathname: pathname || "/v2/files",
    search: search as any,
  };
}
