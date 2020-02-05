import { nullValuesAsUndefined } from "null-as-undefined";
import PropTypes from "prop-types";

import { Database } from "../database/Database";
import { StoreMap } from "../database/Store";
import {
  NamedSchema,
  PickStoreValueProperties,
  Schema,
  StoreKey,
  StoreNames,
  StoreValue,
  StoreValuePropertyPath,
  StoreValuePropertyPathLevelOne,
  StoreValuePropertyPathLevelTwo
} from "../database/types";

// Value["a"]
type ComponentValueLevelOne<Value> = {
  [K in StoreValuePropertyPathLevelOne<Value>[0]]: Value[K];
}[StoreValuePropertyPathLevelOne<Value>[0]];

// Value["a"]["b"]
type ComponentValueLevelTwo<Value> = {
  [K in StoreValuePropertyPathLevelTwo<Value>[0]]: {
    [J in StoreValuePropertyPathLevelTwo<Value>[1] &
      keyof Value[K]]: Value[K][J];
  }[StoreValuePropertyPathLevelTwo<Value>[1] & keyof Value[K]];
}[StoreValuePropertyPathLevelTwo<Value>[0]];

/**
 * The possible values a {@link ComponentDatabaseMap} could map to.
 *
 * This includes child properties up to two levels deep.
 *
 * See {@link StoreValuePropertyPath} for details on the logic for the
 * discovery of the property values.
 */
export type ComponentValue<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> =
  // Value
  | StoreValue<DBSchema["schema"], StoreName>
  // Value["a"]
  | ComponentValueLevelOne<StoreValue<DBSchema["schema"], StoreName>>
  // Value["a"]["b"]
  | ComponentValueLevelTwo<StoreValue<DBSchema["schema"], StoreName>>;

/**
 * The options for {@link ComponentDatabaseMap}.
 */
export interface ComponentDatabaseMapOptions<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  /**
   * The name of the {@link Database} store to fetch and update.
   */
  storeName: StoreName;

  /**
   * The key in {@link ComponentDatabaseMapOptions.storeName} to fetch
   * and update, or an object describing how to fetch that key from the
   * {@link Database}.
   *
   * `key.tx` is called inside a {@link Database.transaction}, so all the
   * warnings there apply.
   */
  key:
    | StoreKey<DBSchema["schema"], StoreName>
    | {
        storeNames?: StoreNames<DBSchema["schema"]>[] | null;
        tx(
          stores: StoreMap<DBSchema["schema"], StoreNames<DBSchema["schema"]>[]>
        ):
          | StoreKey<DBSchema["schema"], StoreName>
          | Promise<StoreKey<DBSchema["schema"], StoreName>>;
      };

  /**
   * The name of the property of the value in the {@link Store} to fetch and
   * update.
   *
   * If the target property is below the base level, pass in an array
   * describing the "path" to that property. For example, if you would
   * reference the property directly by `value["a"]["b"]`, then set this to
   * `["a", "b"]` to have the same effect.
   *
   * Leave this blank to fetch and update the entire value directly, for
   * example, if you're storing primitives in this {@link Store}.
   */
  property?: keyof PickStoreValueProperties<
    StoreValue<DBSchema["schema"], StoreName>
  > extends never
    ? never
    :
        | keyof PickStoreValueProperties<
            StoreValue<DBSchema["schema"], StoreName>
          >
        | StoreValuePropertyPath<StoreValue<DBSchema["schema"], StoreName>>;
}

/**
 * A class to tell a {@link DynamicComponent} how its
 * {@link DynamicComponentControlledProps} maps to the {@link Database}.
 *
 * Unlike most generic types in this library, you will need to explicitly set
 * the type parameters on construction, as there's no way to infer a
 * {@link NamedSchema} from any of the arguments to its constructor, but they
 * constrain the possible values of its properties.
 *
 * @typeparam DBSchema - The schema of the {@link Database} this maps to.
 *
 * @typeparam StoreName - The name of the {@link Database} store this maps to.
 */
export class ComponentDatabaseMap<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  /**
   * The proptype validator for a {@link ComponentDatabaseMap}.
   */
  static propType: PropTypes.Requireable<
    ComponentDatabaseMap<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      NamedSchema<string, number, any>,
      string
    >
  > = PropTypes.exact({
    storeName: PropTypes.string.isRequired,
    key: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.number.isRequired,
      PropTypes.shape({
        storeNames: PropTypes.arrayOf(PropTypes.string.isRequired),
        tx: PropTypes.func.isRequired
      }).isRequired
    ]).isRequired,
    // We need to cast this because `PropTypes.arrayOf` doesn't know how to
    // limit the number of elements in the array, and so creates the
    // incompatible type of `(string | symbol)[]`. This does mean the
    // prop validatiion will let through some invalid `property`s.
    property: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string.isRequired,
        PropTypes.symbol.isRequired
      ]).isRequired
    ) as PropTypes.Requireable<[string] | [string, string | symbol]>,
    getKey: PropTypes.func.isRequired
  });

  readonly storeName: StoreName;
  readonly key:
    | StoreKey<DBSchema["schema"], StoreName>
    | {
        storeNames?: StoreNames<DBSchema["schema"]>[] | null;
        tx(
          stores: StoreMap<DBSchema["schema"], StoreNames<DBSchema["schema"]>[]>
        ):
          | StoreKey<DBSchema["schema"], StoreName>
          | Promise<StoreKey<DBSchema["schema"], StoreName>>;
      };
  readonly property:
    | (StoreValue<DBSchema["schema"], StoreName> extends {}
        ? StoreValuePropertyPath<StoreValue<DBSchema["schema"], StoreName>>
        : never)
    | null
    | undefined;

  constructor(options: ComponentDatabaseMapOptions<DBSchema, StoreName>) {
    const { storeName, key, property } = options;

    this.storeName = storeName;
    this.key = key;
    this.property = (typeof property === "string" ? [property] : property) as
      | (StoreValue<DBSchema["schema"], StoreName> extends {}
          ? StoreValuePropertyPath<StoreValue<DBSchema["schema"], StoreName>>
          : never)
      | undefined;
  }

  /**
   * @ignore
   */
  async getKey(
    databaseOrStores:
      | Database<DBSchema>
      | StoreMap<DBSchema["schema"], StoreNames<DBSchema["schema"]>[]>
  ): Promise<StoreKey<DBSchema["schema"], StoreName> | undefined> {
    if (typeof this.key === "string" || typeof this.key === "number") {
      return this.key;
    }

    const { storeNames, tx } = nullValuesAsUndefined(this.key) as {
      storeNames?: StoreNames<DBSchema["schema"]>[];
      tx(
        stores: StoreMap<DBSchema["schema"], StoreNames<DBSchema["schema"]>[]>
      ):
        | StoreKey<DBSchema["schema"], StoreName>
        | Promise<StoreKey<DBSchema["schema"], StoreName>>;
    };

    let key: StoreKey<DBSchema["schema"], StoreName> | undefined = undefined;

    if (!storeNames || storeNames.length === 0) {
      key = await tx(
        {} as StoreMap<DBSchema["schema"], StoreNames<DBSchema["schema"]>[]>
      );
    } else if (databaseOrStores instanceof Database) {
      await databaseOrStores.transaction(storeNames, async stores => {
        key = await tx(stores);
      });
    } else {
      key = await tx(databaseOrStores);
    }

    return key;
  }
}
