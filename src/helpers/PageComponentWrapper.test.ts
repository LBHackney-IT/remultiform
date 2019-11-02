import renderer from "react-test-renderer";

import TestClassComponent from "../__fixtures__/components/TestClassComponent";
import TestFunctionComponent from "../__fixtures__/components/TestFunctionComponent";

import { wrapPageComponent } from "./PageComponentWrapper";

describe("#render", () => {
  it("renders correctly for intrinsic elements without providing a key", () => {
    const componentWrapper = wrapPageComponent({
      key: "test-function",
      Component: "img",
      props: {
        src: "test.png"
      }
    });

    const component = renderer.create(componentWrapper.render());

    expect(component).toMatchSnapshot();
  });

  it("renders correctly for class components without providing a key", () => {
    const componentWrapper = wrapPageComponent({
      key: "test-class",
      Component: TestClassComponent,
      props: {
        content: "test class content"
      }
    });

    const component = renderer.create(componentWrapper.render());

    expect(component).toMatchSnapshot();
  });

  it("renders correctly for function components without providing a key", () => {
    const componentWrapper = wrapPageComponent({
      key: "test-function",
      Component: TestFunctionComponent,
      props: {
        content: "test function content"
      }
    });

    const component = renderer.create(componentWrapper.render());

    expect(component).toMatchSnapshot();
  });

  it("renders correctly for intrinsic elements when providing a key", () => {
    const componentWrapper = wrapPageComponent({
      key: "test-function",
      Component: "img",
      props: {
        src: "test.png"
      }
    });

    const component = renderer.create(componentWrapper.render("test-key"));

    expect(component).toMatchSnapshot();
  });

  it("renders correctly for class components when providing a key", () => {
    const componentWrapper = wrapPageComponent({
      key: "test-class",
      Component: TestClassComponent,
      props: {
        content: "test class content"
      }
    });

    const component = renderer.create(componentWrapper.render("test-key"));

    expect(component).toMatchSnapshot();
  });

  it("renders correctly for function components when providing a key", () => {
    const componentWrapper = wrapPageComponent({
      key: "test-function",
      Component: TestFunctionComponent,
      props: {
        content: "test function content"
      }
    });

    const component = renderer.create(componentWrapper.render("test-key"));

    expect(component).toMatchSnapshot();
  });
});
