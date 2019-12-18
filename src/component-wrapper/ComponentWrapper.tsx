import PropTypes from "prop-types";
import React from "react";

import { Database } from "../database/Database";
import { NamedSchema, Schema, StoreNames, StoreValue } from "../database/types";

import { WrappedComponent } from "./internal/WrappedComponent";

import { DatabaseMap } from "./DatabaseMap";
import { DynamicComponentType, DynamicComponent } from "./DynamicComponent";
import { StaticComponent } from "./StaticComponent";

/**
 * The proptypes for {@link ComponentWrapper.render}.
 */
export interface ComponentWrapperRenderProps<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  database?: Database<DBSchema>;
  onChange(value: StoreValue<DBSchema["schema"], StoreName>): void;
}

/**
 * A wrapper for a {@link StaticComponent} or {@link DynamicComponent}
 * for use in a {@link StepDefinition}.
 *
 * Create these using {@link ComponentWrapper.wrapStatic} and
 * {@link ComponentWrapper.wrapDynamic}.
 */
// This mostly exists so we can have strict type inference on our components.
// By wrapping the component in a generic function, the type of the component
// has to be infered in order to call the function. Returning this less generic
// type from that function means we can have simple generic components depend on
// it. This gives us strong typing with little effort for the user.
export class ComponentWrapper<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  /**
   * The proptype validator for a {@link ComponentWrapper}.
   */
  static readonly propType: PropTypes.Requireable<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ComponentWrapper<NamedSchema<string, number, any>, string>
  > = PropTypes.exact({
    key: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
    renderWhen: PropTypes.func.isRequired,
    databaseMap: PropTypes.instanceOf(DatabaseMap),
    defaultValue: PropTypes.any,
    emptyValue: PropTypes.any.isRequired
  });

  /**
   * Wrap a {@link StaticComponent} in a {@link ComponentWrapper} ready
   * to be included in a {@link StepDefinition}.
   *
   * You shouldn't need to provide any of the type parameters. They should be
   * infered from the {@link StaticComponent} passed in.
   */
  static wrapStatic<
    Props,
    DBSchema extends NamedSchema<string, number, Schema>
  >(
    component: StaticComponent<React.ElementType<Props>, Props, DBSchema>
  ): ComponentWrapper<DBSchema, StoreNames<DBSchema["schema"]>> {
    const { key, Component, renderWhen } = component;

    let render: () => JSX.Element;

    if (typeof Component === "string") {
      const {
        Component: IntrinsicElement,
        props
      } = component as StaticComponent<
        keyof JSX.IntrinsicElements,
        {},
        DBSchema
      >;

      // eslint-disable-next-line react/display-name
      render = (): JSX.Element => <IntrinsicElement key={key} {...props} />;
    } else {
      const { Component: ReactComponent, props } = component as StaticComponent<
        React.ComponentType<Props>,
        Props,
        DBSchema
      >;

      // eslint-disable-next-line react/display-name
      render = (): JSX.Element => <ReactComponent key={key} {...props} />;
    }

    return new ComponentWrapper(key, render, renderWhen);
  }

  /**
   * Wrap a {@link DynamicComponent} in a {@link ComponentWrapper}
   * ready to be included in a {@link StepDefinition}.
   *
   * You shouldn't need to provide any of the type parameters. They should be
   * infered from the {@link DynamicComponent} passed in.
   */
  static wrapDynamic<
    Props,
    DBSchema extends NamedSchema<string, number, Schema>,
    StoreName extends StoreNames<DBSchema["schema"]>
  >(
    component: DynamicComponent<
      DynamicComponentType<Props, StoreValue<DBSchema["schema"], StoreName>>,
      Props,
      DBSchema,
      StoreName
    >
  ): ComponentWrapper<DBSchema, StoreName> {
    const {
      key,
      renderWhen,
      databaseMap,
      defaultValue,
      emptyValue
    } = component;

    const render = (
      props: ComponentWrapperRenderProps<DBSchema, StoreName>
    ): JSX.Element => (
      <WrappedComponent key={key} component={component} {...props} />
    );

    return new ComponentWrapper(
      key,
      render,
      renderWhen,
      databaseMap,
      defaultValue,
      emptyValue
    );
  }

  readonly key: string;

  /**
   * A function to render an instance of the component.
   */
  readonly render: (
    props: ComponentWrapperRenderProps<DBSchema, StoreName>
  ) => JSX.Element;

  /**
   * A callback to determine when the component should be rendered.
   *
   * @param stepValues - A map of the keys to the current values for all of the
   * components in the currently rendered {@link StepDefinition}.
   */
  readonly renderWhen: (stepValues: {
    [key: string]:
      | ""
      | StoreValue<DBSchema["schema"], StoreNames<DBSchema["schema"]>>;
  }) => boolean;

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
   * Do not use this directly. Use {@link ComponentWrapper.wrapStatic} or
   * {@link ComponentWrapper.wrapDynamic} to create a new
   * {@link ComponentWrapper}.
   *
   * @ignore
   */
  constructor(
    key: string,
    render: (
      props: ComponentWrapperRenderProps<DBSchema, StoreName>
    ) => JSX.Element,
    renderWhen: (stepValues: {
      [key: string]:
        | ""
        | StoreValue<DBSchema["schema"], StoreNames<DBSchema["schema"]>>;
    }) => boolean,
    databaseMap?: DatabaseMap<DBSchema, StoreName>,
    defaultValue?: StoreValue<DBSchema["schema"], StoreName> | null,
    emptyValue: "" | StoreValue<DBSchema["schema"], StoreName> = ""
  ) {
    this.key = key;
    this.render = render;
    this.renderWhen = renderWhen;
    this.databaseMap = databaseMap;
    this.defaultValue = defaultValue;
    this.emptyValue = emptyValue;
  }
}
