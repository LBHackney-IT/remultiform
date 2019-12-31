import React from "react";
import { create } from "react-test-renderer";

import { TestErrorBoundary } from "../__fixtures__/components/TestErrorBoundary";

import { spyOnConsoleError } from "../__tests__/helpers/spies";

import { Database } from "../database/Database";
import { NamedSchema, Schema } from "../database/types";

import { DatabaseContext } from "./DatabaseContext";
import { useDatabase } from "./useDatabase";

jest.mock("../database/Database");

let openDatabasePromise: Promise<Database<NamedSchema<string, number, Schema>>>;

beforeEach(() => {
  openDatabasePromise = Database.open("testDBName", 1);
});

afterEach(async () => {
  await openDatabasePromise;
});

it("returns `undefined` when not a child of a database context provider", () => {
  expect.hasAssertions();

  const DBContext = new DatabaseContext(openDatabasePromise);

  const Tester = (): JSX.Element => {
    const database = useDatabase(DBContext);

    expect(database).toBeUndefined();

    return <div />;
  };

  create(<Tester />);
});

it("returns the database from the nearest database context provider", async () => {
  expect.hasAssertions();

  const DBContext = new DatabaseContext(openDatabasePromise);
  const db = await Database.open("testDBName", 1);

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

describe("with an unsupported React version", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let originalReactUseContext: any;

  beforeAll(() => {
    originalReactUseContext = React.useContext;
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (React as any).useContext = originalReactUseContext;
  });

  it("throws if `React.useContext` is undefined", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (React as any).useContext;

    const DBContext = new DatabaseContext(openDatabasePromise);

    const Tester = (): JSX.Element => {
      useDatabase(DBContext);

      return <div>That was unexpected!</div>;
    };

    const consoleErrorSpy = spyOnConsoleError();

    const component = create(
      <TestErrorBoundary>
        <Tester />
      </TestErrorBoundary>
    );

    expect(consoleErrorSpy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "The above error occurred in the <Tester> component:
          in Tester
          in TestErrorBoundary

      React will try to recreate this component tree from scratch using the error boundary you provided, TestErrorBoundary.",
        ],
      ]
    `);

    consoleErrorSpy.mockRestore();

    expect(component).toMatchInlineSnapshot(`
      <span>
        Caught error: 
        TypeError: react_1.default.useContext is not a function
      </span>
    `);
  });
});
