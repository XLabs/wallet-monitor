// Warning: In case of timeout, we are not cancelling the promise, we are just ignoring it.
// Extend the timeout utility to accept cancellation callback
export const timeout = <T>(promise: Promise<T>, timeoutMs: number) => {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>(
    (_, reject) =>
      (timer = setTimeout(() => reject(new Error("timeout")), timeoutMs)),
  );
  return Promise.race<T>([promise, timeoutPromise]).finally(() =>
    clearTimeout(timer),
  );
};

export const wait = (ms: number) =>
  new Promise((resolve, reject) => setTimeout(resolve, ms));
