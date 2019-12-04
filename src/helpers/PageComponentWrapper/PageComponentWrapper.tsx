import PropTypes from "prop-types";
import React from "react";

import { WrappedPageComponent } from "../../components/WrappedPageComponent";

import { Database } from "../../store/Database";
import { NamedSchema, Schema, StoreNames, StoreValue } from "../../store/types";

import { DatabaseMap } from "./DatabaseMap";
import {
  DynamicPageComponentType,
  DynamicPageComponent
} from "./DynamicPageComponent";
import { StaticPageComponent } from "./StaticPageComponent";

/**
 * The proptypes for {@link PageComponentWrapper.render}.
 */
export interface PageComponentWrapperRenderProps<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  database?: Database<DBSchema>;
  onChange(value: StoreValue<DBSchema["schema"], StoreName>): void;
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
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  /**
   * The proptype validator for a {@link PageComponentWrapper}.
   */
  static readonly propType: PropTypes.Requireable<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PageComponentWrapper<NamedSchema<string, number, any>, string>
  > = PropTypes.exact({
    key: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
    databaseMap: PropTypes.instanceOf(DatabaseMap),
    defaultValue: PropTypes.any,
    emptyValue: PropTypes.any.isRequired
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
  ): PageComponentWrapper<any, string> {
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
  ): PageComponentWrapper<DBSchema, StoreName> {
    const { key, databaseMap, defaultValue, emptyValue } = component;

    const render = (
      props: PageComponentWrapperRenderProps<DBSchema, StoreName>
    ): JSX.Element => (
      <WrappedPageComponent key={key} component={component} {...props} />
    );

    return new PageComponentWrapper(
      key,
      render,
      databaseMap,
      defaultValue,
      emptyValue
    );
  }

  readonly key: string;

  /**
   * A function to render an instance of the component for including in a page.
   */
  readonly render: (
    props: PageComponentWrapperRenderProps<DBSchema, StoreName>
  ) => JSX.Element;

  /**
   * The properies needed to map the user-entered value for the wrapped
   * component to the {@link Database}.
   */
  readonly databaseMap?: DatabaseMap<DBSchema, StoreName> | null;

  /**
   * The optional default value to store in the {@link Database} if the
   * component hasn't been changed by the user.
   */
  readonly defaultValue?: StoreValue<DBSchema["schema"], StoreName> | null;

  /**
   * The value to consider as an empty input when updating the {@link Database}.
   */
  readonly emptyValue: "" | StoreValue<DBSchema["schema"], StoreName>;

  /**
   * Do not use this directly. Use {@link PageComponentWrapper.wrapStatic} or
   * {@link PageComponentWrapper.wrapDynamic} to create a new
   * {@link PageComponentWrapper}.
   *
   * @ignore
   */
  constructor(
    key: string,
    render: (
      props: PageComponentWrapperRenderProps<DBSchema, StoreName>
    ) => JSX.Element,
    databaseMap?: DatabaseMap<DBSchema, StoreName>,
    defaultValue?: StoreValue<DBSchema["schema"], StoreName> | null,
    emptyValue: "" | StoreValue<DBSchema["schema"], StoreName> = ""
  ) {
    this.key = key;
    this.render = render;
    this.databaseMap = databaseMap;
    this.defaultValue = defaultValue;
    this.emptyValue = emptyValue;
  }
}
