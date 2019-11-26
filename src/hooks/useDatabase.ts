import React from "react";

import { DatabaseContext } from "../helpers/DatabaseContext";

import { Database } from "../store/Database";
import { Schema, NamedSchema } from "../store/types";

/**
 * A React hook to get the {@link Database} instance from the nearest
 * {@link DatabaseProvider} using the same {@link DatabaseContext}.
 *
 * This is only available when using React 16.8 or newer. Use
 * {@link DatabaseContext.Consumer} if you need to use an unsupported version.
 */
export const useDatabase = <
  DBSchema extends NamedSchema<string, number, Schema>
>(
  DBContext: DatabaseContext<DBSchema>
): Database<DBSchema> | undefined => {
  return React.useContext(DBContext.context);
};
