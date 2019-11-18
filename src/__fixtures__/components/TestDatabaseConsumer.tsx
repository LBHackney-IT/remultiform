import React, { useContext } from "react";

import { DatabaseContext } from "../../helpers/DatabaseContext";
import { Database } from "../../store/Database";
import { NamedSchema, Schema } from "../../store/types";

export interface TestDatabaseConsumerProps<
  DB extends Database<NamedSchema<string, Schema>> = Database<
    NamedSchema<string, Schema>
  >
> {
  context: DatabaseContext<DB>;
}

export const TestDatabaseConsumer: React.FunctionComponent<TestDatabaseConsumerProps> = <
  DB extends Database<NamedSchema<string, Schema>>
>(
  props: TestDatabaseConsumerProps<DB>
): JSX.Element => {
  const { context } = props;

  const database = useContext(context.context);

  if (database) {
    return <span>Database name: {database.name}</span>;
  }

  return <span>No database</span>;
};
