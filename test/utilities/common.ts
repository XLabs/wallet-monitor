export const timeout = <T>(p: Promise<T>, ms: number) =>
  Promise.race([
    p,
    wait(ms).then(() => {
      throw new Error("Timeout after " + ms + " ms");
    }),
  ]);

export const wait = (ms: number) =>
  new Promise((resolve, reject) => setTimeout(resolve, ms));
