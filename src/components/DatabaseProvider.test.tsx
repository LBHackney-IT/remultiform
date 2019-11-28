import React from "react";
import { ReactTestRenderer, act, create } from "react-test-renderer";

import { TestDatabaseConsumer } from "../__fixtures__/components/TestDatabaseConsumer";

import {
  spyOnConsoleError,
  spyOnDatabaseOpen
} from "../__tests__/helpers/spies";

import { DatabaseContext } from "../helpers/DatabaseContext";

import { Database } from "../store/Database";
import { OpenOptions } from "../store/OpenOptions";
import { NamedSchema, Schema } from "../store/types";

import { DatabaseProvider } from "./DatabaseProvider";
import { TestErrorBoundary } from "../__fixtures__/components/TestErrorBoundary";

let databseOpenSpy: jest.SpyInstance<
  Promise<Database<NamedSchema<string, number, Schema>>>,
  [string, number?, OpenOptions<Schema>?]
>;

beforeEach(() => {
  databseOpenSpy = spyOnDatabaseOpen();
});

it("renders correctly with a resolved database", async () => {
  const database = await Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const component = create(
    <DatabaseProvider context={DBContext}>
      <TestDatabaseConsumer context={DBContext} />
    </DatabaseProvider>
  );

  expect(component).toMatchSnapshot();
});

it("renders correctly before the database resolves", () => {
  const databasePromise = Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(databasePromise);

  const component = create(
    <DatabaseProvider context={DBContext}>
      <TestDatabaseConsumer context={DBContext} />
    </DatabaseProvider>
  );

  expect(component).toMatchSnapshot();
});

it("renders correctly after the database resolves", async () => {
  const databasePromise = Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(databasePromise);

  let component: ReactTestRenderer | undefined = undefined;

  await act(async () => {
    component = create(
      <DatabaseProvider context={DBContext}>
        <TestDatabaseConsumer context={DBContext} />
      </DatabaseProvider>
    );

    await databasePromise;
  });

  expect(component).toMatchSnapshot();
});

it("throws if the database rejects", async () => {
  let resolveInternalDatabasePromise: () => void;

  const internalDatabasePromise = new Promise(resolve => {
    resolveInternalDatabasePromise = resolve;
  });

  databseOpenSpy.mockImplementation(async () => {
    await internalDatabasePromise;

    throw new Error("test error");
  });

  const databasePromise = Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(databasePromise);

  let component: ReactTestRenderer | undefined = undefined;

  const consoleErrorSpy = spyOnConsoleError();

  await act(async () => {
    component = create(
      <TestErrorBoundary>
        <DatabaseProvider context={DBContext}>
          <TestDatabaseConsumer context={DBContext} />
        </DatabaseProvider>
      </TestErrorBoundary>
    );

    resolveInternalDatabasePromise();

    await internalDatabasePromise;
  });

  expect(consoleErrorSpy.mock.calls).toMatchSnapshot();

  consoleErrorSpy.mockRestore();

  expect(component).toMatchSnapshot();
});

it("renders correctly when changing children", async () => {
  const key = "key";

  const database = await Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const Wrapper = ({
    children
  }: {
    children: React.ReactNode;
  }): JSX.Element => (
    <DatabaseProvider context={DBContext}>{children}</DatabaseProvider>
  );

  let component: ReactTestRenderer | undefined = undefined;

  act(() => {
    component = create(
      <Wrapper key={key}>
        <span>Test content</span>
      </Wrapper>
    );
  });

  act(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    component!.update(
      <Wrapper key={key}>
        <div>Updated test content</div>
      </Wrapper>
    );
  });

  expect(component).toMatchSnapshot();
});

it("throws when changing the `context` prop with a different database instance", async () => {
  type TestSchema = NamedSchema<"testDBName" | "newTestDBName", 1, {}>;

  const key = "key";

  const database = await Database.open<TestSchema>("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const newDatabase = await Database.open<TestSchema>("testDBName", 1);
  const NewDBContext = new DatabaseContext(newDatabase);

  const Wrapper = ({
    context
  }: {
    context: DatabaseContext<TestSchema>;
  }): JSX.Element => (
    <TestErrorBoundary>
      <DatabaseProvider context={context}>
        <span>Test content</span>
      </DatabaseProvider>
    </TestErrorBoundary>
  );

  let component: ReactTestRenderer | undefined = undefined;

  act(() => {
    component = create(<Wrapper key={key} context={DBContext} />);
  });

  const consoleErrorSpy = spyOnConsoleError();

  act(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    component!.update(<Wrapper key={key} context={NewDBContext} />);
  });

  expect(consoleErrorSpy.mock.calls).toMatchSnapshot();

  consoleErrorSpy.mockRestore();

  expect(component).toMatchSnapshot();
});

it("renders correctly when changing the `context` prop with the same database instance", async () => {
  type TestSchema = NamedSchema<"testDBName" | "newTestDBName", 1, {}>;

  const key = "key";

  const database = await Database.open<TestSchema>("testDBName", 1);
  const DBContext = new DatabaseContext(database);
  const NewDBContext = new DatabaseContext(database);

  const Wrapper = ({
    context
  }: {
    context: DatabaseContext<TestSchema>;
  }): JSX.Element => (
    <DatabaseProvider context={context}>
      <span>Test content</span>
    </DatabaseProvider>
  );

  let component: ReactTestRenderer | undefined = undefined;

  act(() => {
    component = create(<Wrapper key={key} context={DBContext} />);
  });

  act(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    component!.update(<Wrapper key={key} context={NewDBContext} />);
  });

  expect(component).toMatchSnapshot();
});

it("throws when unmounting without an error", async () => {
  const database = await Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  let component: ReactTestRenderer | undefined = undefined;

  act(() => {
    component = create(
      <TestErrorBoundary>
        <DatabaseProvider context={DBContext}>
          <span>Test content</span>
        </DatabaseProvider>
      </TestErrorBoundary>
    );
  });

  const consoleErrorSpy = spyOnConsoleError();

  act(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    component!.update(
      <TestErrorBoundary>
        <span>Test content</span>
      </TestErrorBoundary>
    );
  });

  expect(consoleErrorSpy.mock.calls).toMatchSnapshot();

  consoleErrorSpy.mockRestore();

  expect(component).toMatchSnapshot();
});

it("doesn't throw when unmounting without an error with `allowUnmounting` enabled", async () => {
  const database = await Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  let component: ReactTestRenderer | undefined = undefined;

  act(() => {
    component = create(
      <TestErrorBoundary>
        <DatabaseProvider context={DBContext} allowUnmounting>
          <span>Test content</span>
        </DatabaseProvider>
      </TestErrorBoundary>
    );
  });

  const consoleErrorSpy = spyOnConsoleError();

  act(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    component!.update(
      <TestErrorBoundary>
        <span>Test content</span>
      </TestErrorBoundary>
    );
  });

  expect(consoleErrorSpy.mock.calls).toMatchSnapshot();

  consoleErrorSpy.mockRestore();

  expect(component).toMatchSnapshot();
});
