import { IDBPDatabase, IDBPObjectStore } from "idb";

import { wrapTransaction } from "./internal/wrapTransaction";

import { Store, StoreMap } from "./Store";
import { Schema, StoreNames, Transaction } from "./types";

/**
 * A wrapper for the opening database and transaction during an upgrade.
 *
 * An instance of this is created when {@link Database.open} is called with a
 * schema version number that has never been opened in that environment before.
 * Use it to upgrade the schema from the old version to the new version. Stores
 * and indexes can only be created during an upgrade, so some care is advised.
 */
export class Upgrade<DBSchema extends Schema> {
  /**
   * The schema version before this upgrade.
   */
  readonly oldVersion: number;

  /**
   * The schema version after this upgrade.
   */
  readonly newVersion?: number;

  private readonly db: IDBPDatabase<DBSchema>;
  private readonly tx: Transaction<DBSchema>;

  /**
   * This should only be called internally to create an {@link Upgrade} during
   * an upgrade.
   *
   * @ignore
   */
  constructor(
    db: IDBPDatabase<DBSchema>,
    oldVersion: number,
    newVersion: number | null,
    tx: Transaction<DBSchema>
  ) {
    this.db = db;
    this.oldVersion = oldVersion;

    if (newVersion !== null) {
      this.newVersion = newVersion;
    }

    this.tx = tx;
  }

  /**
   * Create a store in the database.
   *
   * Stores can only be created during an upgrade, so this is the opportunity
   * to do so.
   */
  createStore<Name extends StoreNames<DBSchema>>(
    storeName: Name
  ): Store<DBSchema, StoreNames<DBSchema>[], Name> {
    return new Store(
      this.db.createObjectStore(storeName) as IDBPObjectStore<
        DBSchema,
        StoreNames<DBSchema>[],
        Name
      >
    );
  }

  /**
   * Add operations to the transaction created by this upgrade event.
   *
   * @param storeNames - The stores to open the transaction over.
   *
   * @param tx - A callback for the transaction to call. Be aware that this
   * callback, although possibly asynchronous, needs to be updating the
   * transaction every tick. If no changes to the transaction happen in a tick,
   * it will automatically commit itself and the transaction will close.
   */
  async transaction(
    storeNames: StoreNames<DBSchema>[],
    tx: (
      stores: StoreMap<DBSchema, StoreNames<DBSchema>[]>
    ) => void | Promise<void>
  ): Promise<void> {
    await wrapTransaction(storeNames, this.tx, tx);
  }
}
