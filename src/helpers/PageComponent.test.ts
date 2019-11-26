import { PageComponent } from "./PageComponent";

describe("#key", () => {
  it("matches the `key` provided to the constructor", () => {
    const key = "test-key";

    const pageComponent = new PageComponent({
      key,
      Component: "div",
      props: {}
    });

    expect(pageComponent.key).toEqual(key);
  });
});

describe("#Component", () => {
  it("matches the `Component` provided to the constructor", () => {
    const Component = "div";

    const pageComponent = new PageComponent({
      key: "test-key",
      Component,
      props: {}
    });

    expect(pageComponent.Component).toEqual(Component);
  });
});

describe("#props", () => {
  it("matches the `props` provided to the constructor", () => {
    const props = { src: "test.png" };

    const pageComponent = new PageComponent({
      key: "test-key",
      Component: "img",
      props
    });

    expect(pageComponent.props).toEqual(props);
  });
});
