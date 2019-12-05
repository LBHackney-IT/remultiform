import { TestDynamicComponent } from "../__fixtures__/components/TestDynamicComponent";

import { NamedSchema } from "../database/types";

import { DatabaseMap } from "./DatabaseMap";
import { DynamicComponent } from "./DynamicComponent";

type TestSchema = NamedSchema<
  string,
  number,
  {
    testStore: {
      key: number;
      value: string;
    };
  }
>;

describe("#key", () => {
  it("matches the `key` provided to the constructor", () => {
    const key = "test-key";

    const component = new DynamicComponent({
      key,
      Component: TestDynamicComponent,
      props: { content: "test content" },
      defaultValue: "test value",
      databaseMap: new DatabaseMap<TestSchema, "testStore">({
        storeName: "testStore",
        key: 0
      })
    });

    expect(component.key).toEqual(key);
  });
});

describe("#Component", () => {
  it("matches the `Component` provided to the constructor", () => {
    const Component = TestDynamicComponent;

    const component = new DynamicComponent({
      key: "test-key",
      Component,
      props: { content: "test content" },
      defaultValue: "test value",
      databaseMap: new DatabaseMap<TestSchema, "testStore">({
        storeName: "testStore",
        key: 0
      })
    });

    expect(component.Component).toEqual(Component);
  });
});

describe("#props", () => {
  it("matches the `props` provided to the constructor", () => {
    const props = { content: "test content" };

    const component = new DynamicComponent({
      key: "test-key",
      Component: TestDynamicComponent,
      props,
      defaultValue: "test value",
      databaseMap: new DatabaseMap<TestSchema, "testStore">({
        storeName: "testStore",
        key: 0
      })
    });

    expect(component.props).toEqual(props);
  });
});

describe("#databaseMap", () => {
  it("matches the `databaseMap` provided to the constructor", () => {
    const databaseMap = new DatabaseMap<TestSchema, "testStore">({
      storeName: "testStore",
      key: 0
    });

    const component = new DynamicComponent({
      key: "test-key",
      Component: TestDynamicComponent,
      props: { content: "test content" },
      defaultValue: "test value",
      databaseMap
    });

    expect(component.databaseMap).toStrictEqual(databaseMap);
  });
});

describe("#defaultValue", () => {
  it("matches the `defaultValue` provided to the constructor", () => {
    const defaultValue = "test value";

    const component = new DynamicComponent({
      key: "test-key",
      Component: TestDynamicComponent,
      props: { content: "test content" },
      defaultValue,
      databaseMap: new DatabaseMap<TestSchema, "testStore">({
        storeName: "testStore",
        key: 0
      })
    });

    expect(component.defaultValue).toEqual(defaultValue);
  });

  it("is undefined when no `defaultValue` is provided to the constructor", () => {
    const component = new DynamicComponent({
      key: "test-key",
      Component: TestDynamicComponent,
      props: { content: "test content" },
      databaseMap: new DatabaseMap<TestSchema, "testStore">({
        storeName: "testStore",
        key: 0
      })
    });

    expect(component.defaultValue).toBeUndefined();
  });
});

describe("#emptyValue", () => {
  it("matches the `emptyValue` provided to the constructor", () => {
    const emptyValue = "test empty value";

    const component = new DynamicComponent({
      key: "test-key",
      Component: TestDynamicComponent,
      props: { content: "test content" },
      defaultValue: "test default value",
      emptyValue,
      databaseMap: new DatabaseMap<TestSchema, "testStore">({
        storeName: "testStore",
        key: 0
      })
    });

    expect(component.emptyValue).toEqual(emptyValue);
  });

  it("is an empty string when no `emptyValue` is provided to the constructor", () => {
    const component = new DynamicComponent({
      key: "test-key",
      Component: TestDynamicComponent,
      props: { content: "test content" },
      databaseMap: new DatabaseMap<TestSchema, "testStore">({
        storeName: "testStore",
        key: 0
      })
    });

    expect(component.emptyValue).toEqual("");
  });
});
