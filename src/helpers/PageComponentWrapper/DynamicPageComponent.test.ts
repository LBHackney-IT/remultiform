import { TestDynamicComponent } from "../../__fixtures__/components/TestDynamicComponent";

import { NamedSchema } from "../../store/types";

import { DatabaseMap } from "./DatabaseMap";
import { DynamicPageComponent } from "./DynamicPageComponent";

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

    const pageComponent = new DynamicPageComponent({
      key,
      Component: TestDynamicComponent,
      props: { content: "test content" },
      defaultValue: "test value",
      databaseMap: new DatabaseMap<TestSchema, "testStore">({
        storeName: "testStore",
        key: 0
      })
    });

    expect(pageComponent.key).toEqual(key);
  });
});

describe("#Component", () => {
  it("matches the `Component` provided to the constructor", () => {
    const Component = TestDynamicComponent;

    const pageComponent = new DynamicPageComponent({
      key: "test-key",
      Component,
      props: { content: "test content" },
      defaultValue: "test value",
      databaseMap: new DatabaseMap<TestSchema, "testStore">({
        storeName: "testStore",
        key: 0
      })
    });

    expect(pageComponent.Component).toEqual(Component);
  });
});

describe("#props", () => {
  it("matches the `props` provided to the constructor", () => {
    const props = { content: "test content" };

    const pageComponent = new DynamicPageComponent({
      key: "test-key",
      Component: TestDynamicComponent,
      props,
      defaultValue: "test value",
      databaseMap: new DatabaseMap<TestSchema, "testStore">({
        storeName: "testStore",
        key: 0
      })
    });

    expect(pageComponent.props).toEqual(props);
  });
});

describe("#databaseMap", () => {
  it("matches the `databaseMap` provided to the constructor", () => {
    const databaseMap = new DatabaseMap<TestSchema, "testStore">({
      storeName: "testStore",
      key: 0
    });

    const pageComponent = new DynamicPageComponent({
      key: "test-key",
      Component: TestDynamicComponent,
      props: { content: "test content" },
      defaultValue: "test value",
      databaseMap
    });

    expect(pageComponent.databaseMap).toStrictEqual(databaseMap);
  });
});

describe("#defaultValue", () => {
  it("matches the `defaultValue` provided to the constructor", () => {
    const defaultValue = "test value";

    const pageComponent = new DynamicPageComponent({
      key: "test-key",
      Component: TestDynamicComponent,
      props: { content: "test content" },
      defaultValue,
      databaseMap: new DatabaseMap<TestSchema, "testStore">({
        storeName: "testStore",
        key: 0
      })
    });

    expect(pageComponent.defaultValue).toEqual(defaultValue);
  });

  it("is undefined when no `defaultValue` is provided to the constructor", () => {
    const pageComponent = new DynamicPageComponent({
      key: "test-key",
      Component: TestDynamicComponent,
      props: { content: "test content" },
      databaseMap: new DatabaseMap<TestSchema, "testStore">({
        storeName: "testStore",
        key: 0
      })
    });

    expect(pageComponent.defaultValue).toBeUndefined();
  });
});
