import { Database, TransactionMode } from "../../store/Database";
import { OpenOptions } from "../../store/OpenOptions";
import { NamedSchema, Schema, StoreMap } from "../../store/types";

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

export const spyOnDatabaseGet = (
  getSomething = true
): {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  spy: jest.SpyInstance<Promise<any>, [string, any]>;
  settle: Promise<void[]>;
  calls: Promise<void>[];
} => {
  let settleInitial: (() => void) | undefined;
  const get = {
    spy: jest.spyOn(Database.prototype, "get"),
    settle: Promise.all([
      new Promise<void>(resolve => {
        settleInitial = resolve;
      })
    ]),
    calls: [] as Promise<void>[]
  };

  get.spy.mockImplementation(async (storeName, key) => {
    let settleThis: () => void = () => {};
    const promise = new Promise<void>(resolve => {
      settleThis = resolve;
    });

    get.calls.push(promise);
    get.settle = Promise.all(get.calls);

    if (settleInitial) {
      settleInitial();

      settleInitial = undefined;
    }

    await promiseToWaitForNextTick();

    settleThis();

    return getSomething ? `${storeName}/${key}` : undefined;
  });

  return get;
};

export const spyOnDatabaseTransaction = (): {
  spy: jest.SpyInstance<
    Promise<void>,
    [
      string[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (stores: StoreMap<any, string[]>) => void | Promise<void>,
      (TransactionMode | undefined)?
    ]
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stores: StoreMap<any, string[]>;
  settle: Promise<void[]>;
  calls: Promise<void>[];
} => {
  let settleInitial: (() => void) | undefined;
  const transaction = {
    spy: jest.spyOn(Database.prototype, "transaction"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stores: {} as StoreMap<any, string[]>,
    settle: Promise.all([
      new Promise<void>(resolve => {
        settleInitial = resolve;
      })
    ]),
    calls: [] as Promise<void>[]
  };

  transaction.spy.mockImplementation(async (storeNames, tx) => {
    let settleThis: () => void = () => {};
    const promise = new Promise<void>(resolve => {
      settleThis = resolve;
    });

    transaction.calls.push(promise);
    transaction.settle = Promise.all(transaction.calls);

    const theseStores = storeNames.reduce(
      (s, storeName) => ({
        ...s,
        [storeName]: {
          ...jest.fn()(),
          get: jest.fn(),
          put: jest.fn(),
          delete: jest.fn()
        }
      }),
      {}
    );

    // Update `stores` with the mocks passed to `tx`.
    Object.assign(transaction.stores, theseStores);

    if (settleInitial) {
      settleInitial();

      settleInitial = undefined;
    }

    await promiseToWaitForNextTick();

    await tx(theseStores);

    settleThis();
  });

  return transaction;
};
