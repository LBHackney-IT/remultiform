import { useContext } from "react";

import { DatabaseContext } from "../helpers/DatabaseContext";

import { Database } from "../store/Database";
import { Schema, NamedSchema } from "../store/types";

/**
 * A React hook to get the {@link Database} instance from the nearest
 * {@link DatabaseProvider} using the same {@link DatabaseContext}.
 */
export const useDatabase = <DBSchema extends NamedSchema<string, Schema>>(
  DBContext: DatabaseContext<DBSchema>
): Database<DBSchema> | undefined => {
  return useContext(DBContext.context);
};
