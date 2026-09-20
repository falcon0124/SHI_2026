/** Artificial latency (300–600 ms) so loading states are real on mocks. */
export function delay<T>(value: T | (() => T)): Promise<T> {
  const ms = 300 + Math.random() * 300;
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      try {
        resolve(typeof value === "function" ? (value as () => T)() : value);
      } catch (e) {
        reject(e);
      }
    }, ms),
  );
}
