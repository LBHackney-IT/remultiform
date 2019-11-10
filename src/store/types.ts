import {
  IDBPObjectStore,
  IDBPTransaction,
  StoreKey,
  StoreNames as DBStoreNames,
  StoreValue
} from "idb";

export { StoreKey, StoreValue };

export interface StoreSchema {
  key: IDBValidKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  indexes?: { [indexName: string]: IDBValidKey };
}

export interface Schema {
  [storeName: string]: StoreSchema;
}

export interface NamedSchema<N extends string, S extends Schema> {
  dbNames: N;
  schema: S;
}

export type StoreNames<S extends Schema> = DBStoreNames<S> & string;

export type Transaction<
  S extends Schema,
  Names extends StoreNames<S>[] = StoreNames<S>[]
> = IDBPTransaction<S, Names>;

export type Store<
  S extends Schema,
  Names extends StoreNames<S>[] = StoreNames<S>[],
  Name extends StoreNames<S> = StoreNames<S>
> = IDBPObjectStore<S, Names, Name>;

export type StoreMap<
  S extends Schema,
  Names extends StoreNames<S>[] = StoreNames<S>[],
  Name extends StoreNames<S> = StoreNames<S>
> = { [N in Name]: Store<S, Names, N> };
