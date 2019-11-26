import { create } from "react-test-renderer";

import { TestClassComponent } from "../__fixtures__/components/TestClassComponent";
import { TestFunctionComponent } from "../__fixtures__/components/TestFunctionComponent";

import { PageComponentWrapper } from "./PageComponentWrapper";
import { PageComponent } from "./PageComponent";

jest.mock("../store/Database");

describe(".propType", () => {
  it("exists", () => {
    expect(PageComponentWrapper.propType).toBeDefined();
  });
});

describe(".wrap()", () => {
  it("returns an `PageComponentWrapper`", () => {
    const componentWrapper = PageComponentWrapper.wrap(
      new PageComponent({
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

describe("#key", () => {
  it("matches the key provided when wrapping a `PageComponent`", () => {
    const key = "test-key";

    const componentWrapper = PageComponentWrapper.wrap(
      new PageComponent({
        key,
        Component: TestClassComponent,
        props: {
          content: "test class content"
        }
      })
    );

    expect(componentWrapper.key).toEqual(key);
  });
});

describe("#element", () => {
  it("renders correctly for intrinsic elements", () => {
    const componentWrapper = PageComponentWrapper.wrap(
      new PageComponent({
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
    const componentWrapper = PageComponentWrapper.wrap(
      new PageComponent({
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
    const componentWrapper = PageComponentWrapper.wrap(
      new PageComponent({
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
});
