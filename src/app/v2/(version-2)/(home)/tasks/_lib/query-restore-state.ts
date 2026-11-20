const restoredPending = new Set<string>();

export function markRestored(queryHash: string) {
  restoredPending.add(queryHash);
}

export function forgetRestored(queryHash: string) {
  restoredPending.delete(queryHash);
}

export function isRestoredPending(queryHash: string) {
  return restoredPending.has(queryHash);
}
