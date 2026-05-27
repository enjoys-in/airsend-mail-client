/**
 * Event Bridge - Sync Gate
 * Blocks destructive API calls (POST/PUT/DELETE/PATCH) while sync is in progress.
 * Read (GET) and send-mail are always allowed.
 *
 * Usage: Import and call `installSyncGate(axiosInstance)` once at app init.
 */

import type { InternalAxiosRequestConfig } from 'axios';
import { syncStore } from './sync-state';

/** Paths that are always allowed even during sync gate */
const GATE_WHITELIST: string[] = [
  '/mail/send',        // sending mail is always allowed
  '/mail/compose',     // compose/send
  '/auth/',            // auth operations
];

/** HTTP methods blocked by the gate */
const BLOCKED_METHODS = new Set(['post', 'put', 'delete', 'patch']);

/**
 * Check if a request should be blocked by the sync gate.
 */
function shouldBlock(config: InternalAxiosRequestConfig): boolean {
  const { isSyncGateActive } = syncStore.getState();
  if (!isSyncGateActive) return false;

  const method = (config.method ?? 'get').toLowerCase();
  if (!BLOCKED_METHODS.has(method)) return false;

  // Check whitelist
  const url = config.url ?? '';
  if (GATE_WHITELIST.some((path) => url.includes(path))) return false;

  return true;
}

/**
 * Install sync gate as an axios request interceptor.
 * When active, destructive requests are rejected with a recognizable error.
 */
export function installSyncGate(instance: {
  interceptors: {
    request: {
      use: (
        onFulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
        onRejected?: (error: any) => any
      ) => number;
    };
  };
}): number {
  return instance.interceptors.request.use((config) => {
    if (shouldBlock(config)) {
      const error = new SyncGateError(
        `[EventBridge] Action blocked: sync in progress. Method: ${config.method?.toUpperCase()}, URL: ${config.url}`
      );
      return Promise.reject(error) as any;
    }
    return config;
  });
}

/**
 * Custom error class so consumers can distinguish gate rejections from real errors.
 */
export class SyncGateError extends Error {
  public readonly isSyncGate = true;

  constructor(message: string) {
    super(message);
    this.name = 'SyncGateError';
  }
}

/**
 * Type guard to check if an error is a SyncGateError.
 */
export function isSyncGateError(error: unknown): error is SyncGateError {
  return error instanceof SyncGateError || (error as any)?.isSyncGate === true;
}
