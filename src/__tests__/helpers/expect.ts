export const expectPromise = <T>(
  callbackToPromise: () => Promise<T>
): jest.JestMatchersShape<
  jest.Matchers<void, Promise<T>>,
  jest.Matchers<Promise<void>, Promise<T>>
> => {
  return expect((async (): Promise<T> => await callbackToPromise())());
};
