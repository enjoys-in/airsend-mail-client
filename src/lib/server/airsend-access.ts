import { type GatedFeature, FEATURE_LABEL, scopesAllow } from "@/lib/feature-gate";

// Server-side scope check for the API proxies. The scopes come fresh from airsend-api (the same membership data
// `/me` returns), not from the token, which can be days old. Cached briefly so a page of requests costs one call.

const TTL_MS = 30_000;
const cache = new Map<string, { at: number; scopes: string[]; allowed: boolean; reason?: string }>();

const airsendApiUrl = () => (process.env.APP_URL || "http://localhost:9501").replace(/\/+$/, "");

export type FeatureCheck = { ok: true } | { ok: false; status: number; message: string };

export async function checkFeatureAccess(token: string, feature: GatedFeature): Promise<FeatureCheck> {
  let entry = cache.get(token);
  if (!entry || Date.now() - entry.at > TTL_MS) {
    try {
      const res = await fetch(`${airsendApiUrl()}/api/v1/workspace-access`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (res.status === 401) return { ok: false, status: 401, message: "Sign in to continue." };
      if (!res.ok || !json?.result) {
        return { ok: false, status: 502, message: json?.message || "Could not verify your access." };
      }
      entry = {
        at: Date.now(),
        scopes: Array.isArray(json.result.scopes) ? json.result.scopes : [],
        allowed: !!json.result.allowed,
        reason: json.result.reason,
      };
      if (cache.size > 500) cache.clear();
      cache.set(token, entry);
    } catch (error: any) {
      return { ok: false, status: 503, message: error?.message || "AirSend API is unreachable." };
    }
  }
  if (!entry.allowed) return { ok: false, status: 403, message: entry.reason || "Access denied." };
  if (!scopesAllow(entry.scopes, feature)) {
    return {
      ok: false,
      status: 403,
      message: `Your account does not have access to ${FEATURE_LABEL[feature]}. Ask an organization admin to grant the ${feature} scope.`,
    };
  }
  return { ok: true };
}
