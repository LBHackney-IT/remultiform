import { StaticComponent } from "./StaticComponent";

describe("#key", () => {
  it("matches the `key` provided to the constructor", () => {
    const key = "test-key";

    const component = new StaticComponent({
      key,
      Component: "div",
      props: {}
    });

    expect(component.key).toEqual(key);
  });
});

describe("#Component", () => {
  it("matches the `Component` provided to the constructor", () => {
    const Component = "div";

    const component = new StaticComponent({
      key: "test-key",
      Component,
      props: {}
    });

    expect(component.Component).toEqual(Component);
  });
});

describe("#props", () => {
  it("matches the `props` provided to the constructor", () => {
    const props = { src: "test.png" };

    const component = new StaticComponent({
      key: "test-key",
      Component: "img",
      props
    });

    expect(component.props).toEqual(props);
  });
});
