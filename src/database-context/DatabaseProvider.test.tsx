import React from "react";
import { ReactTestRenderer, act, create } from "react-test-renderer";

import { TestDatabaseConsumer } from "../__fixtures__/components/TestDatabaseConsumer";
import { TestErrorBoundary } from "../__fixtures__/components/TestErrorBoundary";

import {
  spyOnConsoleError,
  spyOnDatabaseOpen
} from "../__tests__/helpers/spies";

import { Database } from "../database/Database";
import { OpenOptions } from "../database/OpenOptions";
import { NamedSchema, Schema } from "../database/types";

import { DatabaseContext } from "./DatabaseContext";
import { DatabaseProvider } from "./DatabaseProvider";

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

  expect(component).toMatchInlineSnapshot(`
    <span>
      Database name: 
      testDBName
    </span>
  `);
});

it("renders correctly before the database resolves", () => {
  const databasePromise = Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(databasePromise);

  const component = create(
    <DatabaseProvider context={DBContext}>
      <TestDatabaseConsumer context={DBContext} />
    </DatabaseProvider>
  );

  expect(component).toMatchInlineSnapshot(`
    <span>
      No database
    </span>
  `);
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

  expect(component).toMatchInlineSnapshot(`
    <span>
      Database name: 
      testDBName
    </span>
  `);
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

  expect(consoleErrorSpy.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "Error: Uncaught [Error: test error]
        at reportException (<rootDir>/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
        at invokeEventListeners (<rootDir>/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:209:9)
        at HTMLUnknownElementImpl._dispatch (<rootDir>/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:119:9)
        at HTMLUnknownElementImpl.dispatchEvent (<rootDir>/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:82:17)
        at HTMLUnknownElementImpl.dispatchEvent (<rootDir>/node_modules/jsdom/lib/jsdom/living/nodes/HTMLElement-impl.js:30:27)
        at HTMLUnknownElement.dispatchEvent (<rootDir>/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:157:21)
        at Object.invokeGuardedCallbackDev (<rootDir>/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11807:16)
        at invokeGuardedCallback (<rootDir>/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11860:31)
        at commitRootImpl (<rootDir>/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:15092:9)
        at unstable_runWithPriority (<rootDir>/node_modules/scheduler/cjs/scheduler.development.js:697:12)",
        [Error: test error],
      ],
      Array [
        "The above error occurred in the <DatabaseProvider> component:
        in DatabaseProvider
        in TestErrorBoundary

    React will try to recreate this component tree from scratch using the error boundary you provided, TestErrorBoundary.",
      ],
    ]
  `);

  consoleErrorSpy.mockRestore();

  expect(component).toMatchInlineSnapshot(`
    <span>
      Caught error: 
      Error: test error
    </span>
  `);
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

  expect(component).toMatchInlineSnapshot(`
    <div>
      Updated test content
    </div>
  `);
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

  expect(consoleErrorSpy.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "Error: Uncaught [Error: Updating the context prop of a DatabaseProvider to one with a different database is unsupported]
        at reportException (<rootDir>/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
        at invokeEventListeners (<rootDir>/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:209:9)
        at HTMLUnknownElementImpl._dispatch (<rootDir>/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:119:9)
        at HTMLUnknownElementImpl.dispatchEvent (<rootDir>/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:82:17)
        at HTMLUnknownElementImpl.dispatchEvent (<rootDir>/node_modules/jsdom/lib/jsdom/living/nodes/HTMLElement-impl.js:30:27)
        at HTMLUnknownElement.dispatchEvent (<rootDir>/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:157:21)
        at Object.invokeGuardedCallbackDev (<rootDir>/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11807:16)
        at invokeGuardedCallback (<rootDir>/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11860:31)
        at commitRootImpl (<rootDir>/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:15092:9)
        at unstable_runWithPriority (<rootDir>/node_modules/scheduler/cjs/scheduler.development.js:697:12)",
        [Error: Updating the context prop of a DatabaseProvider to one with a different database is unsupported],
      ],
      Array [
        "The above error occurred in the <DatabaseProvider> component:
        in DatabaseProvider (created by Wrapper)
        in TestErrorBoundary (created by Wrapper)
        in Wrapper

    React will try to recreate this component tree from scratch using the error boundary you provided, TestErrorBoundary.",
      ],
    ]
  `);

  consoleErrorSpy.mockRestore();

  expect(component).toMatchInlineSnapshot(`
    <span>
      Caught error: 
      Error: Updating the context prop of a DatabaseProvider to one with a different database is unsupported
    </span>
  `);
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

  expect(component).toMatchInlineSnapshot(`
    <span>
      Test content
    </span>
  `);
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

  expect(consoleErrorSpy.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "Error: Uncaught [Error: Unmounting a DatabaseProvider outside of an error is unsupported]
        at reportException (<rootDir>/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
        at invokeEventListeners (<rootDir>/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:209:9)
        at HTMLUnknownElementImpl._dispatch (<rootDir>/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:119:9)
        at HTMLUnknownElementImpl.dispatchEvent (<rootDir>/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:82:17)
        at HTMLUnknownElementImpl.dispatchEvent (<rootDir>/node_modules/jsdom/lib/jsdom/living/nodes/HTMLElement-impl.js:30:27)
        at HTMLUnknownElement.dispatchEvent (<rootDir>/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:157:21)
        at Object.invokeGuardedCallbackDev (<rootDir>/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11807:16)
        at invokeGuardedCallback (<rootDir>/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11860:31)
        at safelyCallComponentWillUnmount (<rootDir>/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:12018:5)
        at commitUnmount (<rootDir>/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:12507:11)",
        [Error: Unmounting a DatabaseProvider outside of an error is unsupported],
      ],
      Array [
        "The above error occurred in the <DatabaseProvider> component:
        in DatabaseProvider
        in TestErrorBoundary

    React will try to recreate this component tree from scratch using the error boundary you provided, TestErrorBoundary.",
      ],
    ]
  `);

  consoleErrorSpy.mockRestore();

  expect(component).toMatchInlineSnapshot(`
    <span>
      Caught error: 
      Error: Unmounting a DatabaseProvider outside of an error is unsupported
    </span>
  `);
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

  expect(consoleErrorSpy.mock.calls).toMatchInlineSnapshot(`Array []`);

  consoleErrorSpy.mockRestore();

  expect(component).toMatchInlineSnapshot(`
    <span>
      Test content
    </span>
  `);
});
