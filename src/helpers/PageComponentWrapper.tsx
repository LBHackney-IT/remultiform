import PropTypes from "prop-types";
import React from "react";

import { PageComponent } from "./PageComponent";

/**
 * A wrapper for {@link PageComponent} for use in a {@link Step}.
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
    element: PropTypes.element.isRequired
  });

  /**
   * Wrap a {@link PageComponent} in a {@link PageComponentWrapper} ready to
   * be included in a {@link Step}.
   *
   * You shouldn't need to provide any of the type parameters. They should be
   * infered from the {@link PageComponent} passed in.
   */
  static wrap<Props>(
    component: PageComponent<React.ElementType<Props>, Props>
  ): PageComponentWrapper {
    const { key, Component } = component;

    let element: JSX.Element;

    if (typeof Component === "string") {
      const { Component: IntrinsicElement, props } = component as PageComponent<
        keyof JSX.IntrinsicElements,
        {}
      >;

      element = <IntrinsicElement key={key} {...props} />;
    } else {
      const { Component: ReactComponent, props } = component as PageComponent<
        React.ComponentType<Props>,
        Props
      >;

      element = <ReactComponent key={key} {...props} />;
    }

    return new PageComponentWrapper(key, element);
  }

  readonly key: React.Key;

  /**
   * The element for including in a page.
   */
  readonly element: JSX.Element;

  /**
   * Do not use this directly. Use {@link PageComponentWrapper.wrap} to create
   * a new {@link PageComponentWrapper}.
   *
   * @ignore
   */
  constructor(key: React.Key, element: JSX.Element) {
    this.key = key;
    this.element = element;
  }
}
