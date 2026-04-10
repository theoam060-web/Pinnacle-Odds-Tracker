/**
 * Single shared 1-second ticker.
 * Subscribers update DOM nodes directly — zero React state changes per tick.
 */
const callbacks = new Set<() => void>();
let handle: ReturnType<typeof setInterval> | null = null;

export function subscribeToGlobalTick(fn: () => void): () => void {
  callbacks.add(fn);
  if (!handle) {
    handle = setInterval(() => {
      callbacks.forEach((cb) => cb());
    }, 1000);
  }
  return () => {
    callbacks.delete(fn);
    if (callbacks.size === 0 && handle !== null) {
      clearInterval(handle);
      handle = null;
    }
  };
}
