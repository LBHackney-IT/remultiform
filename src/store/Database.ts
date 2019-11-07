import {
  DBSchema,
  IDBPDatabase,
  IDBPObjectStore,
  OpenDBCallbacks,
  StoreKey,
  StoreNames,
  StoreValue,
  openDB
} from "idb";

export { StoreKey, StoreNames, StoreValue };

export type Schema = DBSchema;

export const enum TransactionMode {
  ReadOnly = "readonly",
  ReadWrite = "readwrite"
}

export class Database<S extends Schema> {
  static async open<S extends Schema>(
    name: string,
    version = 1,
    callbacks: OpenDBCallbacks<S> = {}
  ): Promise<Database<S>> {
    const db = await openDB<S>(name, version, callbacks);

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

  async transaction<N extends StoreNames<S>>(
    storeName: N,
    tx: (store: IDBPObjectStore<S, StoreNames<S>[], N>) => Promise<void>,
    mode: TransactionMode = TransactionMode.ReadOnly
  ): Promise<void> {
    const transaction = this.db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    await tx(store);

    await transaction.done;
  }

  // It would be better if this waited for the connection to close, but
  // `fake-indexeddb` doesn't support the `close` event we need, making it
  // difficult to implement and difficult to test.
  close(): void {
    this.db.close();
  }
}
