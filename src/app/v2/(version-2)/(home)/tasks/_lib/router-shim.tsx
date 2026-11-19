"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export interface TasksSearchParams {
  projectId?: string;
  taskId?: string;
  view?: string;
  tab?: string;
  section?: string;
  [key: string]: any;
}

interface RouterContextValue {
  search: TasksSearchParams;
  setSearch: (updater: Partial<TasksSearchParams> | ((prev: TasksSearchParams) => Partial<TasksSearchParams>)) => void;
  navigate: (opts: {
    to?: string;
    search?: Partial<TasksSearchParams> | ((prev: TasksSearchParams) => Partial<TasksSearchParams>);
    params?: Record<string, string>;
    replace?: boolean;
  }) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextValue | null>(null);

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

export function useSearch(_options?: any): TasksSearchParams {
  const ctx = useContext(RouterContext);
  const searchParams = useSearchParams();

  if (ctx) {
    return ctx.search;
  }

  const res: TasksSearchParams = {};
  if (searchParams) {
    searchParams.forEach((value, key) => {
      if (value === "true") (res as any)[key] = true;
      else if (value === "false") (res as any)[key] = false;
      else (res as any)[key] = value;
    });
  }
  return res;
}

export function useParams(_options?: any): Record<string, string> {
  const ctx = useContext(RouterContext);
  return ctx?.params || { workspaceId: "airsend", projectId: "default" };
}

export function useLocation(): { pathname: string; search: Record<string, string> } {
  const pathname = usePathname();
  const search = useSearch();
  return {
    pathname: pathname || "/v2/tasks",
    search: search as any,
  };
}
