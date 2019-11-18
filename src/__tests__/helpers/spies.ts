export const spyOnConsoleError = (): jest.SpyInstance<
  void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [any?, ...any[]]
> => {
  const spy = jest.spyOn(console, "error");

  spy.mockImplementation(() => {});

  return spy;
};
