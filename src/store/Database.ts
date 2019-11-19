import { IDBPDatabase } from "idb";

import { wrapOpenDB } from "./wrappers/wrapOpenDB.internal";
import { wrapTransaction } from "./wrappers/wrapTransaction.internal";

import { OpenOptions } from "./OpenOptions";
import {
  NamedSchema,
  Schema,
  StoreKey,
  StoreMap,
  StoreNames,
  StoreValue
} from "./types";

/**
 * Possible modes for transactions created by {@link Database.transaction}.
 */
export const enum TransactionMode {
  ReadOnly = "readonly",
  ReadWrite = "readwrite"
}

/**
 * A wrapper for an IndexedDB connection.
 *
 * Call {@link Database.open} to create a new database connection.
 *
 * @typeparam NamedDBSchema - The schema for the database, along with the
 * allowed names for databases using that schema.
 *
 * @typeparam DBNames - The allowed names for the database. You are unlikely
 * to want to override the default value, derived from `NamedDBSchema`.
 *
 * @typeparam DBSchema - The schema for the database. You are unlikely to want
 * to override the default value, derived from `NamedDBSchema`.
 */
export class Database<
  NamedDBSchema extends NamedSchema<DBNames, DBSchema>,
  // We don't expect to ever override these defaults. They're here to provide
  // convenient type aliases.
  DBNames extends string = NamedDBSchema["dbNames"],
  DBSchema extends Schema = NamedDBSchema["schema"]
> {
  /**
   * Open a new database connection.
   *
   * @typeparam NamedDBSchema - The schema for the database, along with the
   * allowed names for databases using that schema.
   *
   * @typeparam DBNames - The allowed names for the database. You are unlikely
   * to want to override the default value, derived from `NamedDBSchema`.
   *
   * @typeparam DBSchema - The schema for the database. You are unlikely to want
   * to override the default value, derived from `NamedDBSchema`.
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
  static async open<
    NamedDBSchema extends NamedSchema<DBNames, DBSchema>,
    // We don't expect to ever override these defaults. They're here to provide
    // convenient type aliases.
    DBNames extends string = NamedDBSchema["dbNames"],
    DBSchema extends Schema = NamedDBSchema["schema"]
  >(
    name: DBNames,
    version = 1,
    openOptions: OpenOptions<DBSchema> = {}
  ): Promise<Database<NamedDBSchema, DBNames>> {
    const db = await wrapOpenDB(name, version, openOptions);

    return new Database(db);
  }

  /**
   * The name of the IndexedDB database.
   */
  readonly name: string;

  private readonly db: IDBPDatabase<DBSchema>;

  /**
   * Do not use this directly. Use {@link Database.open} to create a new
   * {@link Database}.
   *
   * @ignore
   */
  constructor(db: IDBPDatabase<DBSchema>) {
    this.db = db;

    this.name = this.db.name;
  }

  /**
   * Create or update a value in a store.
   */
  async put<DBStoreName extends StoreNames<DBSchema>>(
    storeName: DBStoreName,
    key: StoreKey<DBSchema, DBStoreName>,
    value: StoreValue<DBSchema, DBStoreName>
  ): Promise<void> {
    await this.db.put(storeName, value, key);
  }

  /**
   * Get a value from a store.
   */
  async get<DBStoreName extends StoreNames<DBSchema>>(
    storeName: DBStoreName,
    key: StoreKey<DBSchema, DBStoreName>
  ): Promise<StoreValue<DBSchema, DBStoreName> | void> {
    const value = await this.db.get(storeName, key);

    if (value !== undefined) {
      return value;
    }
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
  async transaction<DBStoreNames extends StoreNames<DBSchema>[]>(
    storeNames: DBStoreNames,
    tx: (stores: StoreMap<DBSchema, DBStoreNames>) => void | Promise<void>,
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
