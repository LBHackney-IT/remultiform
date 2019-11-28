import React, { useContext } from "react";
import { create } from "react-test-renderer";

import { Database } from "../store/Database";
import { NamedSchema, Schema } from "../store/types";

import { DatabaseContext } from "./DatabaseContext";

jest.mock("../store/Database");

let openDatabasePromise: Promise<Database<NamedSchema<string, number, Schema>>>;

beforeEach(() => {
  openDatabasePromise = Database.open("testDBName", 1);
});

afterEach(async () => {
  await openDatabasePromise;
});

describe("#database", () => {
  it("matches the promise provided", () => {
    const DBContext = new DatabaseContext(openDatabasePromise);

    expect(DBContext.database).toStrictEqual(openDatabasePromise);
  });
});

describe("#context", () => {
  it("defaults to `undefined`", () => {
    expect.hasAssertions();

    const DBContext = new DatabaseContext(openDatabasePromise);

    const Tester = (): JSX.Element => {
      const database = useContext(DBContext.context);

      expect(database).toBeUndefined();

      return <div />;
    };

    create(<Tester />);
  });
});

describe("#Consumer", () => {
  it("matches the consumer of the context provided", () => {
    const DBContext = new DatabaseContext(openDatabasePromise);

    expect(DBContext.Consumer).toStrictEqual(DBContext.context.Consumer);
  });
});
