import PropTypes from "prop-types";

import { NamedSchema, Schema, StoreKey, StoreNames } from "../database/types";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ComponentDatabaseMap<NamedSchema<string, number, any>, string>
  > = PropTypes.exact({
    storeName: PropTypes.string.isRequired,
    key: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.number.isRequired
    ]).isRequired
  });

  readonly storeName: StoreName;
  readonly key: StoreKey<DBSchema["schema"], StoreName>;

  constructor(options: ComponentDatabaseMapOptions<DBSchema, StoreName>) {
    const { storeName, key } = options;

    this.storeName = storeName;
    this.key = key;
  }
}