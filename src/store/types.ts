import {
  IDBPObjectStore,
  IDBPTransaction,
  StoreKey as DBStoreKey,
  StoreNames as DBStoreNames,
  StoreValue as DBStoreValue
} from "idb";

/**
 * The schema for an individual store.
 *
 * Stores are semantically similar to tables in other databases.
 */
export interface StoreSchema {
  /**
   * The type of keys used by the store.
   */
  key: IDBValidKey;

  /**
   * The type of values stored in the store.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;

  /**
   * A map of any indexes the store has.
   */
  indexes?: { [indexName: string]: IDBValidKey };
}

/**
 * A database schema.
 *
 * IndexedDB databases are made up of stores, mapping store name to
 * {@link StoreSchema}.
 */
export interface Schema {
  [storeName: string]: StoreSchema;
}

/**
 * The schema for the database, along with the allowed names for databases
 * using that schema.
 *
 * Bear in mind that defining the schema alone won't set the
 * database up with that schema. It's used for providing type safety for
 * interacting with the database.
 *
 * Use this interface by providing the generic type parameters, rather than
 * relying on type inference, for best results.
 *
 * See {@link Database.open} for how to set a database up.
 *
 * ```ts
 * type MySchema = NamedSchema<
 *   "myDatabase" | "myOtherDatabase",
 *   {
 *     favouriteColour: {
 *       key: string;
 *       value: {
 *         r: number;
 *         g: number;
 *         b: number;
 *       };
 *     };
 *   }
 * >
 * ```
 */
export interface NamedSchema<DBNames extends string, DBSchema extends Schema> {
  /**
   * The database names permitted to use this schema.
   */
  dbNames: DBNames;

  /**
   * The database schema.
   */
  schema: DBSchema;
}

/**
 * Known store names extracted from the schema.
 */
export type StoreNames<DBSchema extends Schema> = DBStoreNames<DBSchema> &
  string;

/**
 * The type of keys for the given store.
 */
export type StoreKey<
  DBSchema extends Schema,
  StoreName extends StoreNames<DBSchema>
> = DBStoreKey<DBSchema, StoreName>;

/**
 * The type of values in the given store.
 */
export type StoreValue<
  DBSchema extends Schema,
  StoreName extends StoreNames<DBSchema>
> = DBStoreValue<DBSchema, StoreName>;

/**
 * A transaction on one or more stores.
 */
export type Transaction<
  DBSchema extends Schema,
  TxStoreNames extends StoreNames<DBSchema>[] = StoreNames<DBSchema>[]
> = IDBPTransaction<DBSchema, TxStoreNames>;

/**
 * A store accessor.
 *
 * Stores are semantically similar to tables in other databases.
 */
export type Store<
  DBSchema extends Schema,
  TxStoreNames extends StoreNames<DBSchema>[] = StoreNames<DBSchema>[],
  StoreName extends StoreNames<DBSchema> = StoreNames<DBSchema>
> = IDBPObjectStore<DBSchema, TxStoreNames, StoreName>;

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
