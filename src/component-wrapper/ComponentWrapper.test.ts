/* eslint-disable @typescript-eslint/no-empty-function */
import { ReactTestRenderer, act, create } from "react-test-renderer";

import { TestClassComponent } from "../__fixtures__/components/TestClassComponent";
import { TestDynamicComponent } from "../__fixtures__/components/TestDynamicComponent";
import { TestFunctionComponent } from "../__fixtures__/components/TestFunctionComponent";

import { spyOnDatabaseGet } from "../__tests__/helpers/spies";

import { Database } from "../database/Database";
import { NamedSchema } from "../database/types";

import { ComponentDatabaseMap } from "./ComponentDatabaseMap";
import { ComponentWrapper } from "./ComponentWrapper";
import { DynamicComponent } from "./DynamicComponent";
import { StaticComponent } from "./StaticComponent";

jest.mock("../database/Database");

const storeName = "testStore";

type TestSchema = NamedSchema<
  string,
  number,
  {
    [storeName]: {
      key: number;
      value: string;
    };
  }
>;

describe(".propType", () => {
  it("exists", () => {
    expect(ComponentWrapper.propType).toBeDefined();
  });
});

describe(".wrapStatic()", () => {
  it("returns an `ComponentWrapper`", () => {
    const componentWrapper = ComponentWrapper.wrapStatic(
      new StaticComponent({
        key: "test-class",
        Component: TestClassComponent,
        props: {
          content: "test class content"
        }
      })
    );

    expect(componentWrapper).toBeInstanceOf(ComponentWrapper);
  });
});

describe(".wrapDynamic()", () => {
  it("returns an `ComponentWrapper`", () => {
    const componentWrapper = ComponentWrapper.wrapDynamic(
      new DynamicComponent({
        key: "test-component",
        Component: TestDynamicComponent,
        props: {
          content: "test content"
        },
        defaultValue: "test default",
        emptyValue: "test empty",
        databaseMap: new ComponentDatabaseMap<TestSchema, typeof storeName>({
          storeName,
          key: 0
        })
      })
    );

    expect(componentWrapper).toBeInstanceOf(ComponentWrapper);
  });
});

describe("#key", () => {
  it("matches the key provided when wrapping a `StaticComponent`", () => {
    const key = "test-key";

    const componentWrapper = ComponentWrapper.wrapStatic(
      new StaticComponent({
        key,
        Component: TestClassComponent,
        props: {
          content: "test class content"
        }
      })
    );

    expect(componentWrapper.key).toEqual(key);
  });

  it("matches the key provided when wrapping a `DynamicComponent`", () => {
    const key = "test-key";

    const componentWrapper = ComponentWrapper.wrapDynamic(
      new DynamicComponent({
        key,
        Component: TestDynamicComponent,
        props: {
          content: "test content"
        },
        defaultValue: "test default",
        emptyValue: "test empty",
        databaseMap: new ComponentDatabaseMap<TestSchema, typeof storeName>({
          storeName,
          key: 0
        })
      })
    );

    expect(componentWrapper.key).toEqual(key);
  });
});

describe("#databaseMap", () => {
  it("is undefined when wrapping a `StaticComponent`", () => {
    const componentWrapper = ComponentWrapper.wrapStatic(
      new StaticComponent({
        key: "test-key",
        Component: TestClassComponent,
        props: {
          content: "test class content"
        }
      })
    );

    expect(componentWrapper.databaseMap).toBeUndefined();
  });

  it("matches the database map provided when wrapping a `DynamicComponent`", () => {
    const databaseMap = new ComponentDatabaseMap<TestSchema, typeof storeName>({
      storeName,
      key: 0
    });

    const componentWrapper = ComponentWrapper.wrapDynamic(
      new DynamicComponent({
        key: "test-key",
        Component: TestDynamicComponent,
        props: {
          content: "test content"
        },
        defaultValue: "test default",
        emptyValue: "test empty",
        databaseMap
      })
    );

    expect(componentWrapper.databaseMap).toStrictEqual(databaseMap);
  });
});

describe("#defaultValue", () => {
  it("is undefined when wrapping a `StaticComponent`", () => {
    const componentWrapper = ComponentWrapper.wrapStatic(
      new StaticComponent({
        key: "test-key",
        Component: TestClassComponent,
        props: {
          content: "test class content"
        }
      })
    );

    expect(componentWrapper.defaultValue).toBeUndefined();
  });

  it("matches the default value provided when wrapping a `DynamicComponent`", () => {
    const defaultValue = "test default";

    const componentWrapper = ComponentWrapper.wrapDynamic(
      new DynamicComponent({
        key: "test-key",
        Component: TestDynamicComponent,
        props: {
          content: "test content"
        },
        defaultValue,
        emptyValue: "test empty",
        databaseMap: new ComponentDatabaseMap<TestSchema, typeof storeName>({
          storeName,
          key: 0
        })
      })
    );

    expect(componentWrapper.defaultValue).toEqual(defaultValue);
  });
});

describe("#emptyValue", () => {
  it("is undefined when wrapping a `StaticComponent`", () => {
    const componentWrapper = ComponentWrapper.wrapStatic(
      new StaticComponent({
        key: "test-key",
        Component: TestClassComponent,
        props: {
          content: "test class content"
        }
      })
    );

    expect(componentWrapper.emptyValue).toBeUndefined();
  });

  it("matches the empty value provided when wrapping a `DynamicComponent`", () => {
    const emptyValue = "test empty";

    const componentWrapper = ComponentWrapper.wrapDynamic(
      new DynamicComponent({
        key: "test-key",
        Component: TestDynamicComponent,
        props: {
          content: "test content"
        },
        defaultValue: "test default",
        emptyValue,
        databaseMap: new ComponentDatabaseMap<TestSchema, typeof storeName>({
          storeName,
          key: 0
        })
      })
    );

    expect(componentWrapper.emptyValue).toEqual(emptyValue);
  });
});

describe("#required", () => {
  it("is false when wrapping a `StaticComponent`", () => {
    const componentWrapper = ComponentWrapper.wrapStatic(
      new StaticComponent({
        key: "test-key",
        Component: TestClassComponent,
        props: {
          content: "test class content"
        }
      })
    );

    expect(componentWrapper.required).toEqual(false);
  });

  it("matches the required callback provided when wrapping a `DynamicComponent`", () => {
    const required = jest.fn();

    const componentWrapper = ComponentWrapper.wrapDynamic(
      new DynamicComponent({
        key: "test-key",
        Component: TestDynamicComponent,
        props: {
          content: "test content"
        },
        defaultValue: "test default",
        emptyValue: "test empty",
        required,
        databaseMap: new ComponentDatabaseMap<TestSchema, typeof storeName>({
          storeName,
          key: 0
        })
      })
    );

    expect(componentWrapper.required).toEqual(required);
  });
});

describe("#render()", () => {
  it("renders correctly for intrinsic elements", () => {
    const componentWrapper = ComponentWrapper.wrapStatic(
      new StaticComponent({
        key: "test-function",
        Component: "img",
        props: {
          src: "test.png"
        }
      })
    );

    const component = create(componentWrapper.render({ onChange: () => {} }));

    expect(component).toMatchInlineSnapshot(`
      <img
        src="test.png"
      />
    `);
  });

  it("renders correctly for class components", () => {
    const componentWrapper = ComponentWrapper.wrapStatic(
      new StaticComponent({
        key: "test-class",
        Component: TestClassComponent,
        props: {
          content: "test class content"
        }
      })
    );

    const component = create(componentWrapper.render({ onChange: () => {} }));

    expect(component).toMatchInlineSnapshot(`
      <div>
        test class content
      </div>
    `);
  });

  it("renders correctly for function components", () => {
    const componentWrapper = ComponentWrapper.wrapStatic(
      new StaticComponent({
        key: "test-function",
        Component: TestFunctionComponent,
        props: {
          content: "test function content"
        }
      })
    );

    const component = create(componentWrapper.render({ onChange: () => {} }));

    expect(component).toMatchInlineSnapshot(`
      <div>
        test function content
      </div>
    `);
  });

  it("renders correctly for components with controlled props", () => {
    const componentWrapper = ComponentWrapper.wrapDynamic(
      new DynamicComponent({
        key: "test-component",
        Component: TestDynamicComponent,
        props: {
          content: "test content"
        },
        defaultValue: "test default",
        emptyValue: "test empty",
        databaseMap: new ComponentDatabaseMap<TestSchema, typeof storeName>({
          storeName,
          key: 0
        })
      })
    );

    const component = create(componentWrapper.render({ onChange: () => {} }));

    expect(component).toMatchInlineSnapshot(`
      <div>
        <div>
          test content
        </div>
        <input
          data-testid="input"
          disabled={true}
          onChange={[Function]}
          required={false}
          value="test empty"
        />
      </div>
    `);
  });

  it("renders correctly for components with controlled props with a database", async () => {
    const get = spyOnDatabaseGet();

    const componentWrapper = ComponentWrapper.wrapDynamic(
      new DynamicComponent({
        key: "test-component",
        Component: TestDynamicComponent,
        props: {
          content: "test content"
        },
        defaultValue: "test default",
        emptyValue: "test empty",
        databaseMap: new ComponentDatabaseMap<TestSchema, typeof storeName>({
          storeName,
          key: 0
        })
      })
    );

    const database = await Database.open<TestSchema>("testDBName", 1);

    let component: ReactTestRenderer | undefined = undefined;

    await act(async () => {
      component = create(
        componentWrapper.render({ database, onChange: () => {} })
      );

      await get.settle;
    });

    expect(component).toMatchInlineSnapshot(`
      <div>
        <div>
          test content
        </div>
        <input
          data-testid="input"
          disabled={false}
          onChange={[Function]}
          required={false}
          value="testStore/0"
        />
      </div>
    `);
  });
});
