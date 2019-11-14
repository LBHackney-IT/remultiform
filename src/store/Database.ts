import { IDBPDatabase } from "idb";

import {
  NamedSchema,
  Schema,
  StoreKey,
  StoreMap,
  StoreNames,
  StoreValue
} from "./types";
import { OpenOptions, wrapOpenDB } from "./wrappers/wrapOpenDB.internal";
import { wrapTransaction } from "./wrappers/wrapTransaction.internal";

export { OpenOptions };

export const enum TransactionMode {
  ReadOnly = "readonly",
  ReadWrite = "readwrite"
}

export class Database<
  NS extends NamedSchema<N, S>,
  // We don't expect to ever override these defaults. They're here to enable
  // `NS` to extend a generic.
  N extends string = NS["dbNames"],
  S extends Schema = NS["schema"]
> {
  static async open<
    NS extends NamedSchema<N, S>,
    // We don't expect to ever override these defaults. They're here to enable
    // `NS` to extend a generic.
    N extends string = NS["dbNames"],
    S extends Schema = NS["schema"]
  >(
    name: N,
    version = 1,
    openOptions: OpenOptions<S> = {}
  ): Promise<Database<NS, N>> {
    const db = await wrapOpenDB(name, version, openOptions);

    return new Database(db);
  }

  private readonly db: IDBPDatabase<S>;

  private constructor(db: IDBPDatabase<S>) {
    this.db = db;
  }

  async put<N extends StoreNames<S>>(
    storeName: N,
    key: StoreKey<S, N>,
    value: StoreValue<S, N>
  ): Promise<void> {
    await this.db.put(storeName, value, key);
  }

  async get<N extends StoreNames<S>>(
    storeName: N,
    key: StoreKey<S, N>
  ): Promise<StoreValue<S, N> | void> {
    const value = await this.db.get(storeName, key);

    if (value !== undefined) {
      return value;
    }
  }

  async transaction<Names extends StoreNames<S>[], Name extends StoreNames<S>>(
    storeNames: Names,
    tx: (stores: StoreMap<S, Names, Name>) => void | Promise<void>,
    mode: TransactionMode = TransactionMode.ReadOnly
  ): Promise<void> {
    const transaction = this.db.transaction(storeNames, mode);

    await wrapTransaction(storeNames, transaction, tx);
  }

  // It would be better if this waited for the connection to close, but
  // `fake-indexeddb` doesn't support the `close` event we need, making it
  // difficult to implement and difficult to test.
  close(): void {
    this.db.close();
  }
}
