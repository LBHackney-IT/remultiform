import { Database } from "../../store/Database";
import { OpenOptions } from "../../store/OpenOptions";
import { NamedSchema, Schema } from "../../store/types";

import { promiseToWaitForNextTick } from "./promise";

export const spyOnConsoleError = (): jest.SpyInstance<
  void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [any?, ...any[]]
> => {
  const spy = jest.spyOn(console, "error");

  spy.mockImplementation(() => {});

  return spy;
};

export const spyOnDatabaseOpen = (): jest.SpyInstance<
  Promise<Database<NamedSchema<string, number, Schema>>>,
  [string, number?, OpenOptions<Schema>?]
> => {
  const spy = jest.spyOn(Database, "open");

  spy.mockImplementation(async (name, version) => {
    await promiseToWaitForNextTick();

    return new Database({ ...jest.fn()(), name, version });
  });

  return spy;
};
