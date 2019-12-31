import {
  IDBPIndex,
  IDBPObjectStore,
  IndexNames,
  StoreKey as IDBPStoreKey,
  StoreValue as IDBPStoreValue
} from "idb";

import { Schema, StoreKey, StoreNames, StoreValue } from "./types";

/**
 * A wrapper for an IndexedDB store.
 *
 * Stores are semantically similar to tables in other databases.
 */
export class Store<
  DBSchema extends Schema,
  TxStoreNames extends StoreNames<DBSchema>[] = StoreNames<DBSchema>[],
  StoreName extends StoreNames<DBSchema> = StoreNames<DBSchema>
> {
  /**
   * The name of the store.
   */
  readonly name: StoreName;

  private readonly store: IDBPObjectStore<DBSchema, TxStoreNames, StoreName>;

  constructor(store: IDBPObjectStore<DBSchema, TxStoreNames, StoreName>) {
    this.store = store;

    this.name = this.store.name;
  }

  /**
   * Creates a new index for the store.
   *
   * This should only be called during an {@link Upgrade}.
   */
  createIndex<IndexName extends IndexNames<DBSchema, StoreName>>(
    name: IndexName,
    keyPath: string | string[],
    options?: IDBIndexParameters
  ): IDBPIndex<DBSchema, TxStoreNames, StoreName, IndexName> {
    return this.store.createIndex(name, keyPath, options);
  }

  /**
   * Adds a value to the store.
   *
   * Throws if the store already has a value for the given key.
   */
  async add(
    key: StoreKey<DBSchema, StoreName>,
    value: StoreValue<DBSchema, StoreName>
  ): Promise<StoreKey<DBSchema, StoreName>> {
    await this.store.add(
      (value as unknown) as IDBPStoreValue<DBSchema, StoreName>,
      key as IDBPStoreKey<DBSchema, StoreName>
    );

    return key;
  }

  /**
   * Create or update the value for the given key in the store.
   */
  async put(
    key: StoreKey<DBSchema, StoreName>,
    value: StoreValue<DBSchema, StoreName>
  ): Promise<StoreKey<DBSchema, StoreName>> {
    await this.store.put(
      (value as unknown) as IDBPStoreValue<DBSchema, StoreName>,
      key as IDBPStoreKey<DBSchema, StoreName>
    );

    return key;
  }

  /**
   * Retrieves the value matching the given key in the store, or undefined if
   * there is no value for that key.
   */
  async get(
    key: StoreKey<DBSchema, StoreName>
  ): Promise<StoreValue<DBSchema, StoreName> | undefined> {
    const value = ((await this.store.get(
      key as IDBPStoreKey<DBSchema, StoreName>
    )) as unknown) as StoreValue<DBSchema, StoreName> | undefined;

    return value;
  }

  /**
   * Deletes the record matching the given key in the store.
   */
  async delete(key: StoreKey<DBSchema, StoreName>): Promise<void> {
    await this.store.delete(key as IDBPStoreKey<DBSchema, StoreName>);
  }
}

/**
 * A map of the name of a {@link Store} to its accessor.
 *
 * @typeparam TxStoreNames - The array of the names of stores possibly in this
 * map.
 */
export type StoreMap<
  DBSchema extends Schema,
  TxStoreNames extends StoreNames<DBSchema>[] = StoreNames<DBSchema>[]
> = {
  [Name in TxStoreNames extends (infer N)[] ? N : never]: Store<
    DBSchema,
    TxStoreNames,
    Name
  >;
};
