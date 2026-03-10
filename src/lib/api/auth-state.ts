// ============================================================================
// Module-level auth state — shared between axios interceptors & API helpers.
// React components call setMid() after fetching the user profile.
// Non-React code (interceptors, caldev-api) calls getMid() synchronously.
// ============================================================================

let _mid: string | null = null;

export function getMid(): string | null {
  return _mid;
}

export function setMid(mid: string | null): void {
  _mid = mid;
}
