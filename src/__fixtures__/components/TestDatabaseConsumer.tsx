import React, { useContext } from "react";

import { NamedSchema, Schema } from "../../database/types";
import { DatabaseContext } from "../../database-context/DatabaseContext";

export interface TestDatabaseConsumerProps<
  DBSchema extends NamedSchema<string, number, Schema> = NamedSchema<
    string,
    number,
    Schema
  >
> {
  context: DatabaseContext<DBSchema>;
}

export const TestDatabaseConsumer: React.FunctionComponent<TestDatabaseConsumerProps> = <
  DBSchema extends NamedSchema<string, number, Schema>
>(
  props: TestDatabaseConsumerProps<DBSchema>
): JSX.Element => {
  const { context } = props;

  const database = useContext(context.context);

  if (database) {
    return <span>Database name: {database.name}</span>;
  }

  return <span>No database</span>;
};

TestDatabaseConsumer.displayName = "TestDatabaseConsumer";
