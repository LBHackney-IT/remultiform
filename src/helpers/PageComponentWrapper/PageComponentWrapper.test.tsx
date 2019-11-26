import React from "react";
import { create } from "react-test-renderer";

import { TestClassComponent } from "../../__fixtures__/components/TestClassComponent";
import { TestDynamicComponent } from "../../__fixtures__/components/TestDynamicComponent";
import { TestFunctionComponent } from "../../__fixtures__/components/TestFunctionComponent";

import { WrappedPageComponent } from "../../components/WrappedPageComponent";

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

describe("new ()", () => {
  it("returns a `PageComponentWrapper` when called with any element while expecting the element to be static", () => {
    const wrapper = new PageComponentWrapper(
      "test-key",
      (<div>Not a WrappedPageComponent</div>)
    );

    expect(wrapper).toBeInstanceOf(PageComponentWrapper);
  });

  it("returns a `PageComponentWrapper` when called with a `WrappedPageComponent` element while expecting the element to be dynamic", () => {
    const key = "test-key";

    const wrapper = new PageComponentWrapper(
      key,
      (
        <WrappedPageComponent
          component={
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
          }
        />
      ),
      true
    );

    expect(wrapper).toBeInstanceOf(PageComponentWrapper);
  });

  it("throws when called with a non-`WrappedPageComponent` element while expecting the element to be dynamic", () => {
    expect(
      () =>
        new PageComponentWrapper(
          "test-key",
          (<div>Not a WrappedPageComponent</div>),
          true
        )
    ).toThrowError(
      "Expected element to be WrappedPageComponent but received div"
    );
  });
});

describe("#key", () => {
  it("matches the key provided when wrapping a `PageComponent`", () => {
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

describe("#element", () => {
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

    const component = create(componentWrapper.element);

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

    const component = create(componentWrapper.element);

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

    const component = create(componentWrapper.element);

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

    const component = create(componentWrapper.element);

    expect(component).toMatchSnapshot();
  });
});
