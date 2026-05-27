/**
 * Event Bridge - Deduplicator
 * Prevents processing the same event twice during replay + real-time overlap.
 */

export class EventDeduplicator {
  private seen = new Set<string>();
  private readonly maxSize: number;

  constructor(maxSize: number = 2000) {
    this.maxSize = maxSize;
  }

  isDuplicate(eventId: string): boolean {
    if (this.seen.has(eventId)) return true;
    this.seen.add(eventId);

    // Evict oldest entries when capacity exceeded
    if (this.seen.size > this.maxSize) {
      const arr = Array.from(this.seen);
      this.seen = new Set(arr.slice(arr.length - Math.floor(this.maxSize / 2)));
    }

    return false;
  }

  clear(): void {
    this.seen.clear();
  }

  get size(): number {
    return this.seen.size;
  }
}
