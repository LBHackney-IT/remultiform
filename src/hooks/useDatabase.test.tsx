import React from "react";
import { create } from "react-test-renderer";

import { DatabaseContext } from "../helpers/DatabaseContext";

import { useDatabase } from "./useDatabase";
import { Database } from "../store/Database";

jest.mock("../store/Database");

it("returns `undefined` when not a child of a database context provider", () => {
  expect.hasAssertions();

  const DBContext = new DatabaseContext();

  const Tester = (): JSX.Element => {
    const database = useDatabase(DBContext);

    expect(database).toBeUndefined();

    return <div />;
  };

  create(<Tester />);
});

it("returns the database from the nearest database context provider", async () => {
  expect.hasAssertions();

  const DBContext = new DatabaseContext();
  const db = await Database.open("testDBName");

  const Tester = (): JSX.Element => {
    const database = useDatabase(DBContext);

    expect(database).toStrictEqual(db);

    return <div />;
  };

  create(
    <DBContext.context.Provider value={db}>
      <Tester />
    </DBContext.context.Provider>
  );
});
