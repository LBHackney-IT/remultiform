import React, { createContext } from "react";

import { Database } from "../database/Database";
import { NamedSchema, Schema } from "../database/types";

/**
 * A wrapper for a React context for passing a database connection to
 * {@link ComponentWrapper|ComponentWrappers}.
 *
 * Normally, you use this by creating an instance somewhere and sharing it
 * between components via {@link DatabaseProvider} and {@link useDatabase}.
 *
 * ```ts
 * type DBSchema = NamedSchema<
 *   "myDatabase" | "myOtherDatabase",
 *   5,
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
 * >;
 *
 * const databasePromise = Database.open("myDatabase", 5);
 * export const DBContext = new DatabaseContext(databasePromise);
 * ```
 */
// This class exists to make it easier to enforce types in other parts of the
// library.
export class DatabaseContext<
  DBSchema extends NamedSchema<string, number, Schema>
> {
  /**
   * An open {@link Database} or a promise that will resolve to an one.
   */
  readonly database: Database<DBSchema> | Promise<Database<DBSchema>>;

  /**
   * The React context itself.
   *
   * @ignore
   */
  readonly context: React.Context<Database<DBSchema> | undefined>;

  /**
   * The consumer component for this context.
   *
   * Use it to wrap components that need the database in the usual React
   * consumer way.
   */
  readonly Consumer: React.ExoticComponent<
    React.ConsumerProps<Database<DBSchema> | undefined>
  >;

  /**
   * Create a new {@link DatabaseContext}.
   *
   * @param openDatabaseOrPromise -  An open {@link Database} or a promise that
   * will resolve to an one. Normally, you would want to pass the return value
   * of {@link Database.open} in here directly.
   */
  constructor(
    openDatabaseOrPromise: Database<DBSchema> | Promise<Database<DBSchema>>
  ) {
    this.database = openDatabaseOrPromise;
    this.context = createContext<Database<DBSchema> | undefined>(undefined);
    this.Consumer = this.context.Consumer;
  }
}
