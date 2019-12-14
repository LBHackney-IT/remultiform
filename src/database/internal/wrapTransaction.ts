import { Schema, StoreMap, StoreNames, Transaction } from "../types";

export const wrapTransaction = async <
  S extends Schema,
  Names extends StoreNames<S>[]
>(
  storeNames: Names,
  transaction: Transaction<S, Names>,
  tx: (stores: StoreMap<S, Names>) => void | Promise<void>
): Promise<void> => {
  const stores = storeNames.reduce(
    (stores, storeName) => ({
      ...stores,
      [storeName]: transaction.objectStore(storeName)
    }),
    {} as StoreMap<S, Names>
  );

  await tx(stores);

  await transaction.done;
};