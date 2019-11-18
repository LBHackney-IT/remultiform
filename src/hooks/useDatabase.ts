import { useContext } from "react";

import { DatabaseContext } from "../helpers/DatabaseContext";

import { Database } from "../store/Database";
import { Schema, NamedSchema } from "../store/types";

/**
 * A React hook to get the {@link Database} instance from the nearest
 * {@link DatabaseProvider} using the same {@link DatabaseContext}.
 */
export const useDatabase = <DB extends Database<NamedSchema<string, Schema>>>(
  DBContext: DatabaseContext<DB>
): DB | undefined => {
  return useContext(DBContext.context);
};
