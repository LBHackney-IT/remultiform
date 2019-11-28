import PropTypes from "prop-types";
import React from "react";

import { WrappedPageComponent } from "../../components/WrappedPageComponent";

import { Database } from "../../store/Database";
import { NamedSchema, Schema, StoreNames, StoreValue } from "../../store/types";

import {
  DynamicPageComponentType,
  DynamicPageComponent
} from "./DynamicPageComponent";
import { StaticPageComponent } from "./StaticPageComponent";

export interface PageComponentWrapperRenderProps<
  DBSchema extends NamedSchema<string, number, Schema>
> {
  database?: Database<DBSchema>;
}

/**
 * A wrapper for a {@link StaticPageComponent} or {@link DynamicPageComponent}
 * for use in a {@link Step}.
 *
 * Create these using {@link PageComponentWrapper.wrapStatic} and
 * {@link PageComponentWrapper.wrapDynamic}.
 */
// This mostly exists so we can have strict type inference on our components.
// By wrapping the component in a generic function, the type of the component
// has to be infered in order to call the function. Returning this less generic
// type from that function means we can have simple generic components depend on
// it. This gives us strong typing with little effort for the user.
export class PageComponentWrapper<
  DBSchema extends NamedSchema<string, number, Schema>
> {
  /**
   * The proptype validator for a {@link PageComponentWrapper}.
   */
  static readonly propType: PropTypes.Requireable<
    PageComponentWrapper<NamedSchema<string, number, Schema>>
  > = PropTypes.exact({
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    render: PropTypes.func.isRequired
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): PageComponentWrapper<any> {
    const { key, Component } = component;

    let render: () => JSX.Element;

    if (typeof Component === "string") {
      const {
        Component: IntrinsicElement,
        props
      } = component as StaticPageComponent<keyof JSX.IntrinsicElements, {}>;

      // eslint-disable-next-line react/display-name
      render = (): JSX.Element => <IntrinsicElement key={key} {...props} />;
    } else {
      const {
        Component: ReactComponent,
        props
      } = component as StaticPageComponent<React.ComponentType<Props>, Props>;

      // eslint-disable-next-line react/display-name
      render = (): JSX.Element => <ReactComponent key={key} {...props} />;
    }

    return new PageComponentWrapper(key, render);
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
  ): PageComponentWrapper<DBSchema> {
    const { key } = component;

    return new PageComponentWrapper(key, ({ database }) => (
      <WrappedPageComponent<Props, DBSchema, StoreName>
        database={database}
        key={key}
        component={component}
      />
    ));
  }

  readonly key: React.Key;

  /**
   * A function to render an instance of the component for including in a page.
   */
  readonly render: (
    props: PageComponentWrapperRenderProps<DBSchema>
  ) => JSX.Element;

  /**
   * Do not use this directly. Use {@link PageComponentWrapper.wrapStatic} or
   * {@link PageComponentWrapper.wrapDynamic} to create a new
   * {@link PageComponentWrapper}.
   *
   * @ignore
   */
  constructor(
    key: React.Key,
    render: (props: PageComponentWrapperRenderProps<DBSchema>) => JSX.Element
  ) {
    this.key = key;
    this.render = render;
  }
}
