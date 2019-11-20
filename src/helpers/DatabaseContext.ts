import React, { createContext } from "react";

import { Database } from "../store/Database";
import { NamedSchema, Schema } from "../store/types";

/**
 * A React context for passing a database connection to
 * {@link PageComponentWrapper|PageComponentWrappers}.
 *
 * Normally, you use this by creating an instance somewhere and sharing it
 * between components via {@link DatabaseProvider} and {@link useDatabase}.
 *
 * ```ts
 * type DBSchema = NamedSchema<
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
 * >;
 *
 * const DBContext = new DatabaseContext<DBSchema>();
 * ```
 */
// This class exists to make it easier to enforce types in other parts of the
// library.
export class DatabaseContext<DBSchema extends NamedSchema<string, Schema>> {
  /**
   * The React context itself.
   *
   * @ignore
   */
  readonly context: React.Context<Database<DBSchema> | undefined>;

  constructor() {
    this.context = createContext<Database<DBSchema> | undefined>(undefined);
  }
}
