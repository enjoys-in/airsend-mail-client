// ============================================================================
// Concurrency limiter: run at most `max` async tasks at once, the rest wait in
// FIFO order. Used for chat uploads so dropping 30 files does not open 30
// connections to the files service.
// ============================================================================

export type Limiter = <T>(task: () => Promise<T>) => Promise<T>;

export function createLimiter(max: number): Limiter {
  let running = 0;
  const waiting: Array<() => void> = [];

  const next = () => {
    running--;
    waiting.shift()?.();
  };

  return <T>(task: () => Promise<T>) =>
    new Promise<T>((resolve, reject) => {
      const start = () => {
        running++;
        task().then(resolve, reject).finally(next);
      };
      if (running < max) start();
      else waiting.push(start);
    });
}

/** Chat attachments: at most 5 files go up in parallel, across every conversation. */
export const MAX_PARALLEL_UPLOADS = 5;
export const uploadLimit: Limiter = createLimiter(MAX_PARALLEL_UPLOADS);
