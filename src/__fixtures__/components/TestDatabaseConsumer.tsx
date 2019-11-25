import React, { useContext } from "react";

import { DatabaseContext } from "../../helpers/DatabaseContext";
import { NamedSchema, Schema } from "../../store/types";

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
