import PropTypes from "prop-types";
import React from "react";

import { PageComponent } from "./PageComponent";

/**
 * A wrapper for {@link PageComponent} for a use in a {@link Step}.
 *
 * Create these using {@link PageComponentWrapper.wrap}.
 */
// This mostly exists so we can have strict type inference on our components.
// By wrapping the component in a generic function, the type of the component
// has to be infered in order to call the function. Returning this non-generic
// type from that function means we can have non-generic components depend on
// it. This gives us strong typing with little effort for the user.
export class PageComponentWrapper {
  /**
   * The proptype validator for a {@link PageComponentWrapper}.
   */
  static readonly propType: PropTypes.Requireable<
    PageComponentWrapper
  > = PropTypes.exact({
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    render: PropTypes.func.isRequired
  });

  /**
   * Wrap a {@link PageComponent} in a {@link PageComponentWrapper} or ready to
   * be included in a {@link Step}.
   *
   * You shouldn't need to provide any of the type parameters. They should be
   * infered from the {@link PageComponent} passed in.
   */
  static wrap<
    ComponentType extends React.ElementType<Props>,
    Props = ComponentType extends React.ElementType<infer T> ? T : never
  >(component: PageComponent<ComponentType, Props>): PageComponentWrapper {
    const { key, Component, props } = component;

    return new PageComponentWrapper(
      key,
      (k: React.Key = key): JSX.Element => {
        return <Component key={k} {...props} />;
      }
    );
  }

  readonly key: React.Key;

  /**
   * The function to render the component.
   *
   * @param key - The key to give the generated component. Defaults to
   * {@link PageComponentWrapper.key}.
   */
  readonly render: (key?: React.Key) => JSX.Element;

  /**
   * Do not use this directly. Use {@link PageComponentWrapper.wrap} to create
   * a new {@link PageComponentWrapper}.
   *
   * @ignore
   */
  constructor(key: React.Key, render: (key?: React.Key) => JSX.Element) {
    this.key = key;
    this.render = render;
  }
}
