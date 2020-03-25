export const promiseToWaitForNextTick = (): Promise<void> =>
  new Promise((resolve) => {
    setImmediate(() => resolve());
  });
