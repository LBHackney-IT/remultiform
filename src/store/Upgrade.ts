import { IDBPDatabase } from "idb";

import { Schema, StoreMap, StoreNames, Store, Transaction } from "./types";
import { wrapTransaction } from "./wrappers.internal";

export class Upgrade<S extends Schema> {
  readonly oldVersion: number;
  readonly newVersion?: number;

  private readonly db: IDBPDatabase<S>;
  private readonly tx: Transaction<S>;

  constructor(
    db: IDBPDatabase<S>,
    oldVersion: number,
    newVersion: number | null,
    tx: Transaction<S>
  ) {
    this.db = db;
    this.oldVersion = oldVersion;

    if (newVersion !== null) {
      this.newVersion = newVersion;
    }

    this.tx = tx;
  }

  createStore<Name extends StoreNames<S>>(
    storeName: Name
  ): Store<S, StoreNames<S>[], Name> {
    // ESLint is wrong about this assertion being unnecessary, probably due to
    // `StoreNames` having the same name as the internal `StoreNames` type from
    // `idb`, despite being different.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return this.db.createObjectStore(storeName) as Store<
      S,
      StoreNames<S>[],
      Name
    >;
  }

  async transaction<Names extends StoreNames<S>[], Name extends StoreNames<S>>(
    storeNames: Names,
    tx: (stores: StoreMap<S, StoreNames<S>[], Name>) => void | Promise<void>
  ): Promise<void> {
    await wrapTransaction(storeNames, this.tx, tx);
  }
}
