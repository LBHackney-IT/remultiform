import { create } from "react-test-renderer";

import { TestClassComponent } from "../__fixtures__/components/TestClassComponent";
import { TestFunctionComponent } from "../__fixtures__/components/TestFunctionComponent";

import { PageComponentWrapper } from "./PageComponentWrapper";

describe(".propType", () => {
  it("exists", () => {
    expect(PageComponentWrapper.propType).toBeDefined();
  });
});

describe(".wrap()", () => {
  it("returns an `PageComponentWrapper`", () => {
    const componentWrapper = PageComponentWrapper.wrap({
      key: "test-class",
      Component: TestClassComponent,
      props: {
        content: "test class content"
      }
    });

    expect(componentWrapper).toBeInstanceOf(PageComponentWrapper);
  });
});

describe("#key", () => {
  it("matches the key provided during construction", () => {
    const key = "test-key";

    const componentWrapper = PageComponentWrapper.wrap({
      key,
      Component: TestClassComponent,
      props: {
        content: "test class content"
      }
    });

    expect(componentWrapper.key).toEqual(key);
  });
});

describe("#render()", () => {
  it("renders correctly for intrinsic elements without providing a key", () => {
    const componentWrapper = PageComponentWrapper.wrap({
      key: "test-function",
      Component: "img",
      props: {
        src: "test.png"
      }
    });

    const component = create(componentWrapper.render());

    expect(component).toMatchSnapshot();
  });

  it("renders correctly for class components without providing a key", () => {
    const componentWrapper = PageComponentWrapper.wrap({
      key: "test-class",
      Component: TestClassComponent,
      props: {
        content: "test class content"
      }
    });

    const component = create(componentWrapper.render());

    expect(component).toMatchSnapshot();
  });

  it("renders correctly for function components without providing a key", () => {
    const componentWrapper = PageComponentWrapper.wrap({
      key: "test-function",
      Component: TestFunctionComponent,
      props: {
        content: "test function content"
      }
    });

    const component = create(componentWrapper.render());

    expect(component).toMatchSnapshot();
  });

  it("renders correctly for intrinsic elements when providing a key", () => {
    const componentWrapper = PageComponentWrapper.wrap({
      key: "test-function",
      Component: "img",
      props: {
        src: "test.png"
      }
    });

    const component = create(componentWrapper.render("test-key"));

    expect(component).toMatchSnapshot();
  });

  it("renders correctly for class components when providing a key", () => {
    const componentWrapper = PageComponentWrapper.wrap({
      key: "test-class",
      Component: TestClassComponent,
      props: {
        content: "test class content"
      }
    });

    const component = create(componentWrapper.render("test-key"));

    expect(component).toMatchSnapshot();
  });

  it("renders correctly for function components when providing a key", () => {
    const componentWrapper = PageComponentWrapper.wrap({
      key: "test-function",
      Component: TestFunctionComponent,
      props: {
        content: "test function content"
      }
    });

    const component = create(componentWrapper.render("test-key"));

    expect(component).toMatchSnapshot();
  });
});
