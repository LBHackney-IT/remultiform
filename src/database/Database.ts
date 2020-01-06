import {
  IDBPDatabase,
  StoreKey as IDBPStoreKey,
  StoreValue as IDBPStoreValue
} from "idb";

import { wrapOpenDB } from "./internal/wrapOpenDB";
import { wrapTransaction } from "./internal/wrapTransaction";

import { OpenOptions } from "./OpenOptions";
import { StoreMap } from "./Store";
import {
  NamedSchema,
  Schema,
  StoreKey,
  StoreNames,
  StoreValue,
  TransactionMode
} from "./types";

/**
 * A wrapper for an IndexedDB connection.
 *
 * Call {@link Database.open} to create a new database connection.
 *
 * @typeparam NamedDBSchema - The schema for the database, along with the
 * allowed names for databases using that schema.
 */
export class Database<DBSchema extends NamedSchema<string, number, Schema>> {
  /**
   * Open a new database connection.
   *
   * @typeparam NamedDBSchema - The schema for the database, along with the
   * allowed names for databases using that schema.
   *
   * @param name - The name of the database.
   *
   * @param version - The schema version you want to open. This can only ever
   * increase. See {@link OpenOptions.upgrade} for how to upgrade the schema
   * when changing version.
   *
   * @param openOptions - The options and callbacks for opening the database.
   * See {@link OpenOptions} for details.
   *
   * @returns A promise to an open {@link Database} ready to be accessed.
   */
  static async open<DBSchema extends NamedSchema<string, number, Schema>>(
    name: DBSchema["dbNames"],
    version: DBSchema["versions"],
    openOptions: OpenOptions<DBSchema["schema"]> = {}
  ): Promise<Database<DBSchema>> {
    const db = await wrapOpenDB(name, version, openOptions);

    return new Database(db);
  }

  /**
   * The name of the IndexedDB database.
   */
  readonly name: string;

  /**
   * The `idb` wrapper of the IndexedDB database this {@link Database} wraps.
   */
  private readonly db: IDBPDatabase<DBSchema["schema"]>;

  /**
   * Do not use this directly. Use {@link Database.open} to create a new
   * {@link Database}.
   *
   * @ignore
   */
  constructor(db: IDBPDatabase<DBSchema["schema"]>) {
    this.db = db;

    this.name = this.db.name;
  }

  /**
   * Create or update a value in a store.
   */
  async put<DBStoreName extends StoreNames<DBSchema["schema"]>>(
    storeName: DBStoreName,
    key: StoreKey<DBSchema["schema"], DBStoreName>,
    value: StoreValue<DBSchema["schema"], DBStoreName>
  ): Promise<void> {
    await this.db.put(
      storeName,
      (value as unknown) as IDBPStoreValue<DBSchema["schema"], DBStoreName>,
      key as IDBPStoreKey<DBSchema["schema"], DBStoreName>
    );
  }

  /**
   * Get a value from a store.
   *
   * Resolves to `undefined` if no value exists for the given key in the given
   * store.
   */
  get<DBStoreName extends StoreNames<DBSchema["schema"]>>(
    storeName: DBStoreName,
    key: StoreKey<DBSchema["schema"], DBStoreName>
  ): Promise<StoreValue<DBSchema["schema"], DBStoreName> | undefined> {
    return this.db.get(
      storeName,
      key as IDBPStoreKey<DBSchema["schema"], DBStoreName>
    );
  }

  /**
   * Create a transaction on one or more stores.
   *
   * @param storeNames - The stores to open the transaction over.
   *
   * @param tx - A callback for the transaction to call. Be aware that this
   * callback, although possibly asynchronous, needs to be updating the
   * transaction every tick. If no changes to the transaction happen in a tick,
   * it will automatically commit itself and the transaction will close.
   *
   * @param mode - The mode to open the transaction in.
   */
  async transaction<DBStoreNames extends StoreNames<DBSchema["schema"]>[]>(
    storeNames: DBStoreNames,
    tx: (
      stores: StoreMap<DBSchema["schema"], DBStoreNames>
    ) => void | Promise<void>,
    mode: TransactionMode = TransactionMode.ReadOnly
  ): Promise<void> {
    const transaction = this.db.transaction(storeNames, mode);

    await wrapTransaction(storeNames, transaction, tx);
  }

  /**
   * Request to close the database connection.
   *
   * If there are no open transactions, this will close immediately. If any
   * transactions are open, it will wait for them to complete before closing.
   * This happens asynchronously, out of band.
   */
  // It would be better if this waited for the connection to close, but
  // `fake-indexeddb` doesn't support the `close` event we need, making it
  // difficult to implement and difficult to test.
  close(): void {
    this.db.close();
  }
}
