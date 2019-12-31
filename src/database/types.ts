import { IDBPTransaction, StoreNames as DBStoreNames } from "idb";

import {
  BooleanProperties,
  NumberProperties,
  StringProperties
} from "../helpers/internal/primitives";

type StorePropertyType = string | number | boolean | Date;

type StorePropertyTypeProperties =
  | StringProperties
  | NumberProperties
  | BooleanProperties
  | keyof Date
  | keyof StorePropertyType[];

/**
 * The type `T` without its inherent primitive prototype properties.
 */
export type StoreValueProperties<T> = Omit<T, StorePropertyTypeProperties>;

/**
 * The type of a possible value in a {@link StoreSchema}.
 */
export type StoreSchemaValue =
  | StorePropertyType
  | StorePropertyType[]
  | {
      [s: string]:
        | StorePropertyType
        | { [s: string]: StorePropertyType | undefined }
        | { [n: number]: StorePropertyType | undefined }
        | undefined;
    }
  | {
      [n: number]:
        | StorePropertyType
        | { [s: string]: StorePropertyType | undefined }
        | { [n: number]: StorePropertyType | undefined }
        | undefined;
    };

/**
 * The schema for an individual {@link Store}.
 *
 * {@link Store|Stores} are semantically similar to tables in other databases.
 *
 * You can store objects in {@link Store|Stores}, but only one with a
 * maximum of two levels of depth.
 */
export interface StoreSchema<Value extends StoreSchemaValue> {
  /**
   * The type of keys used by the store.
   */
  key: string | number;

  /**
   * The type of values stored in the store.
   */
  value: Value;

  /**
   * A map of any indexes the store has.
   */
  indexes?: { [indexName: string]: string | number };
}

/**
 * A database schema.
 *
 * IndexedDB databases are made up of stores, mapping store name to
 * {@link StoreSchema}.
 */
export interface Schema<Value extends StoreSchemaValue = StoreSchemaValue> {
  [storeName: string]: StoreSchema<Value>;
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
 *   3,
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
export interface NamedSchema<
  DBNames extends string,
  Versions extends number,
  DBSchema extends Schema
> {
  /**
   * The database names permitted to use this schema.
   */
  dbNames: DBNames;

  /**
   * The versions of the database this schema represents.
   */
  versions: Versions;

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
> = DBSchema[StoreName]["key"];

/**
 * The type of values in the given store.
 */
export type StoreValue<
  DBSchema extends Schema,
  StoreName extends StoreNames<DBSchema>
> = DBSchema[StoreName]["value"];

// ["a"] | ["z"]
// This follows the same pattern as `ComponentValueLevelOne`.
type StoreValuePropertyPathLevelOne<Value extends {}> = {
  [K in keyof StoreValueProperties<Value>]: [K];
}[keyof StoreValueProperties<Value>];

// ["a", "b"] | ["z", "y"]
// This follows the same pattern as `ComponentValueLevelTwo`.
type StoreValuePropertyPathLevelTwo<Value extends {}> = {
  [K in keyof StoreValueProperties<Value>]: keyof StoreValueProperties<
    NonNullable<StoreValueProperties<Value>[K]>
  > extends never // If `Value[K]` is a primitive...
    ? never // ...ignore it...
    : [
        K,
        keyof StoreValueProperties<NonNullable<StoreValueProperties<Value>[K]>>
      ]; // ...otherwise, allow referencing its children.
}[keyof StoreValueProperties<Value>];

/**
 * The type describing the "path" to a deep property of a {@link StoreValue}.
 *
 * The resulting type is a union of arrays describing all valid "paths" to deep
 * properties.
 *
 * This only goes two levels deep, at the most, including the base level. If
 * your {@link Schema} has deeper nesting than that and it needs to connect a
 * {@link DynamicComponent} to a deep property, consider refactoring. More than
 * two levels implies a schema of some complexity that will be difficult to
 * maintain.
 *
 * For example
 *
 * ```ts
 * type PropertyPath = StoreValuePropertyPath<{
 *   a: { b: boolean };
 *   z: number;
 * }>;
 * ```
 *
 * is the same as
 *
 * ```ts
 * type PropertyPath =
 *   | ["a"] | ["z"]
 *   | ["a", "b"];
 * ```
 */
export type StoreValuePropertyPath<Value extends {}> = NonNullable<
  StoreValuePropertyPathLevelOne<Value> | StoreValuePropertyPathLevelTwo<Value>
>;

/**
 * A transaction on one or more stores.
 */
export type Transaction<
  DBSchema extends Schema,
  TxStoreNames extends StoreNames<DBSchema>[] = StoreNames<DBSchema>[]
> = IDBPTransaction<DBSchema, TxStoreNames>;
