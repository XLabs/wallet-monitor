export const timeout = <T>(p: Promise<T>, ms: number) => {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error("timeout"));
    }, ms);
    p.then(
      value => {
        clearTimeout(id);
        resolve(value);
      },
      err => {
        clearTimeout(id);
        reject(err);
      },
    );
  });
}

export const wait = (ms: number) =>
  new Promise((resolve, reject) => setTimeout(resolve, ms));
