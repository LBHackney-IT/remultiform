import React, { createContext } from "react";

import { Database } from "../store/Database";
import { NamedSchema, Schema } from "../store/types";

/**
 * A React context for passing a database connection to
 * {@link PageComponentWrapper|PageComponentWrappers}.
 *
 * Normally, you use this by creating an instance somewhere and sharing it
 * between components via {@link DatabaseProvider}.
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
 * const DBContext = new DatabaseContext<Database<DBSchema>>();
 * ```
 */
// This class exists to make it easier to enforce types in other parts of the
// library.
export class DatabaseContext<DB extends Database<NamedSchema<string, Schema>>> {
  /**
   * The React context itself.
   *
   * @ignore
   */
  readonly context: React.Context<DB | undefined>;

  constructor() {
    this.context = createContext<DB | undefined>(undefined);
  }
}
