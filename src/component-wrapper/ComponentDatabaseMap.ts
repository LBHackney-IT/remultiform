import PropTypes from "prop-types";

import {
  NamedSchema,
  Schema,
  StoreKey,
  StoreNames,
  StoreValue,
  StoreValueProperties,
  StoreValuePropertyPath
} from "../database/types";

// Value["a"]
// This follows the same pattern as `StoreValuePropertyPathLevelOne`.
type ComponentValueLevelOne<Value> = {
  [K in keyof Value]: Value[K];
}[keyof Value];

// Value["a"]["b"]
// This follows the same pattern as `StoreValuePropertyPathLevelTwo`.
type ComponentValueLevelTwo<Value> = {
  [K in keyof Value]: keyof StoreValueProperties<
    NonNullable<Value[K]>
  > extends never // If `Value[K]` is a primitive...
    ? never // ...ignore it...
    : StoreValueProperties<NonNullable<Value[K]>>[keyof StoreValueProperties<
        NonNullable<Value[K]>
      >]; // ...otherwise, include its children.
}[keyof Value];

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
   * The key in {@link ComponentDatabaseMapOptions.storeName} to fetch and update.
   */
  key: StoreKey<DBSchema["schema"], StoreName>;

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
  property?: keyof StoreValueProperties<
    StoreValue<DBSchema["schema"], StoreName>
  > extends never
    ? never
    :
        | keyof StoreValueProperties<StoreValue<DBSchema["schema"], StoreName>>
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
      PropTypes.number.isRequired
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
    ) as PropTypes.Requireable<[string] | [string, string | symbol]>
  });

  readonly storeName: StoreName;
  readonly key: StoreKey<DBSchema["schema"], StoreName>;
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
}
