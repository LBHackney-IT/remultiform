import { ReactTestRenderer, act, create } from "react-test-renderer";

import { TestClassComponent } from "../../__fixtures__/components/TestClassComponent";
import { TestDynamicComponent } from "../../__fixtures__/components/TestDynamicComponent";
import { TestFunctionComponent } from "../../__fixtures__/components/TestFunctionComponent";

import { promiseToWaitForNextTick } from "../../__tests__/helpers/promise";

import { Database } from "../../store/Database";
import { NamedSchema } from "../../store/types";

import { DatabaseMap } from "./DatabaseMap";
import { DynamicPageComponent } from "./DynamicPageComponent";
import { PageComponentWrapper } from "./PageComponentWrapper";
import { StaticPageComponent } from "./StaticPageComponent";

jest.mock("../../store/Database");

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
    expect(PageComponentWrapper.propType).toBeDefined();
  });
});

describe(".wrapStatic()", () => {
  it("returns an `PageComponentWrapper`", () => {
    const componentWrapper = PageComponentWrapper.wrapStatic(
      new StaticPageComponent({
        key: "test-class",
        Component: TestClassComponent,
        props: {
          content: "test class content"
        }
      })
    );

    expect(componentWrapper).toBeInstanceOf(PageComponentWrapper);
  });
});

describe(".wrapDynamic()", () => {
  it("returns an `PageComponentWrapper`", () => {
    const componentWrapper = PageComponentWrapper.wrapDynamic(
      new DynamicPageComponent({
        key: "test-component",
        Component: TestDynamicComponent,
        props: {
          content: "test content"
        },
        defaultValue: "test default",
        databaseMap: new DatabaseMap<TestSchema, typeof storeName>({
          storeName,
          key: 0
        })
      })
    );

    expect(componentWrapper).toBeInstanceOf(PageComponentWrapper);
  });
});

describe("#key", () => {
  it("matches the key provided when wrapping a `StaticPageComponent`", () => {
    const key = "test-key";

    const componentWrapper = PageComponentWrapper.wrapStatic(
      new StaticPageComponent({
        key,
        Component: TestClassComponent,
        props: {
          content: "test class content"
        }
      })
    );

    expect(componentWrapper.key).toEqual(key);
  });

  it("matches the key provided when wrapping a `DynamicPageComponent`", () => {
    const key = "test-key";

    const componentWrapper = PageComponentWrapper.wrapDynamic(
      new DynamicPageComponent({
        key,
        Component: TestDynamicComponent,
        props: {
          content: "test content"
        },
        defaultValue: "test default",
        databaseMap: new DatabaseMap<TestSchema, typeof storeName>({
          storeName,
          key: 0
        })
      })
    );

    expect(componentWrapper.key).toEqual(key);
  });
});

describe("#render()", () => {
  it("renders correctly for intrinsic elements", () => {
    const componentWrapper = PageComponentWrapper.wrapStatic(
      new StaticPageComponent({
        key: "test-function",
        Component: "img",
        props: {
          src: "test.png"
        }
      })
    );

    const component = create(componentWrapper.render({}));

    expect(component).toMatchSnapshot();
  });

  it("renders correctly for class components", () => {
    const componentWrapper = PageComponentWrapper.wrapStatic(
      new StaticPageComponent({
        key: "test-class",
        Component: TestClassComponent,
        props: {
          content: "test class content"
        }
      })
    );

    const component = create(componentWrapper.render({}));

    expect(component).toMatchSnapshot();
  });

  it("renders correctly for function components", () => {
    const componentWrapper = PageComponentWrapper.wrapStatic(
      new StaticPageComponent({
        key: "test-function",
        Component: TestFunctionComponent,
        props: {
          content: "test function content"
        }
      })
    );

    const component = create(componentWrapper.render({}));

    expect(component).toMatchSnapshot();
  });

  it("renders correctly for components with controlled props", () => {
    const componentWrapper = PageComponentWrapper.wrapDynamic(
      new DynamicPageComponent({
        key: "test-component",
        Component: TestDynamicComponent,
        props: {
          content: "test content"
        },
        defaultValue: "test default",
        databaseMap: new DatabaseMap<TestSchema, typeof storeName>({
          storeName,
          key: 0
        })
      })
    );

    const component = create(componentWrapper.render({}));

    expect(component).toMatchSnapshot();
  });

  it("renders correctly for components with controlled props with a database", async () => {
    const databaseGetSpy = jest.spyOn(Database.prototype, "get");

    let resolveGetPromise: () => void;
    const getPromise = new Promise<void>(resolve => {
      resolveGetPromise = resolve;
    });

    databaseGetSpy.mockImplementation(async (storeName, key) => {
      await promiseToWaitForNextTick();

      resolveGetPromise();

      return `${storeName}/${key}`;
    });

    const componentWrapper = PageComponentWrapper.wrapDynamic(
      new DynamicPageComponent({
        key: "test-component",
        Component: TestDynamicComponent,
        props: {
          content: "test content"
        },
        defaultValue: "test default",
        databaseMap: new DatabaseMap<TestSchema, typeof storeName>({
          storeName,
          key: 0
        })
      })
    );

    const database = await Database.open<TestSchema>("testDBName", 1);

    let component: ReactTestRenderer | undefined = undefined;

    await act(async () => {
      component = create(componentWrapper.render({ database }));

      await getPromise;
    });

    expect(component).toMatchSnapshot();
  });
});
