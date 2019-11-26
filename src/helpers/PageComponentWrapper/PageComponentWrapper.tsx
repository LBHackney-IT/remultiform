import PropTypes from "prop-types";
import React from "react";

import { WrappedPageComponent } from "../../components/WrappedPageComponent";

import { NamedSchema, Schema, StoreNames, StoreValue } from "../../store/types";

import {
  DynamicPageComponentType,
  DynamicPageComponent
} from "./DynamicPageComponent";
import { StaticPageComponent } from "./StaticPageComponent";

/**
 * A wrapper for a {@link StaticPageComponent} or {@link DynamicPageComponent}
 * for use in a {@link Step}.
 *
 * Create these using {@link PageComponentWrapper.wrapStatic} and
 * {@link PageComponentWrapper.wrapDynamic}.
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
   * Wrap a {@link StaticPageComponent} in a {@link PageComponentWrapper} ready
   * to be included in a {@link Step}.
   *
   * You shouldn't need to provide any of the type parameters. They should be
   * infered from the {@link StaticPageComponent} passed in.
   */
  static wrapStatic<Props>(
    component: StaticPageComponent<React.ElementType<Props>, Props>
  ): PageComponentWrapper {
    const { key, Component } = component;

    let element: JSX.Element;

    if (typeof Component === "string") {
      const {
        Component: IntrinsicElement,
        props
      } = component as StaticPageComponent<keyof JSX.IntrinsicElements, {}>;

      element = <IntrinsicElement key={key} {...props} />;
    } else {
      const {
        Component: ReactComponent,
        props
      } = component as StaticPageComponent<React.ComponentType<Props>, Props>;

      element = <ReactComponent key={key} {...props} />;
    }

    return new PageComponentWrapper(key, element);
  }

  /**
   * Wrap a {@link DynamicPageComponent} in a {@link PageComponentWrapper}
   * ready to be included in a {@link Step}.
   *
   * You shouldn't need to provide any of the type parameters. They should be
   * infered from the {@link DynamicPageComponent} passed in.
   */
  static wrapDynamic<
    Props,
    DBSchema extends NamedSchema<string, number, Schema>,
    StoreName extends StoreNames<DBSchema["schema"]>
  >(
    component: DynamicPageComponent<
      DynamicPageComponentType<
        Props,
        StoreValue<DBSchema["schema"], StoreName>
      >,
      Props,
      DBSchema,
      StoreName
    >
  ): PageComponentWrapper {
    const { key } = component;

    return new PageComponentWrapper(
      key,
      (
        <WrappedPageComponent<Props, DBSchema, StoreName>
          key={key}
          component={component}
        />
      ),
      true
    );
  }

  readonly key: React.Key;

  /**
   * The element for including in a page.
   */
  readonly element: JSX.Element;

  /**
   * Do not use this directly. Use {@link PageComponentWrapper.wrapStatic} or
   * {@link PageComponentWrapper.wrapDynamic} to create a new
   * {@link PageComponentWrapper}.
   *
   * @ignore
   */
  constructor(key: React.Key, element: JSX.Element, isDynamic = false) {
    this.key = key;

    if (isDynamic && element.type.name !== WrappedPageComponent.name) {
      throw new Error(
        `Expected element to be ${WrappedPageComponent.name} but ` +
          `received ${element.type}`
      );
    }

    this.element = element;
  }
}
