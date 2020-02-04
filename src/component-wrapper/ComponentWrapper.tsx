import PropTypes from "prop-types";
import React from "react";

import { Database } from "../database/Database";
import { NamedSchema, Schema, StoreNames } from "../database/types";

import { WrappedComponent } from "./internal/WrappedComponent";

import { ComponentDatabaseMap, ComponentValue } from "./ComponentDatabaseMap";
import { DynamicComponent } from "./DynamicComponent";
import { StaticComponent } from "./StaticComponent";

/**
 * The proptypes for {@link ComponentWrapper.render}.
 */
export interface ComponentWrapperRenderProps<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>,
  Value extends ComponentValue<DBSchema, StoreName>
> {
  database?: Database<DBSchema>;
  onChange(value: Value): void;
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
  StoreName extends StoreNames<DBSchema["schema"]>,
  Value extends ComponentValue<DBSchema, StoreName>
> {
  /**
   * The proptype validator for a {@link ComponentWrapper}.
   */
  static readonly propType: PropTypes.Requireable<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ComponentWrapper<NamedSchema<string, number, any>, string, any>
  > = PropTypes.exact({
    key: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
    renderWhen: PropTypes.func.isRequired,
    databaseMap: PropTypes.instanceOf<
      ComponentDatabaseMap<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        NamedSchema<string, number, any>,
        string
      >
    >(ComponentDatabaseMap),
    defaultValue: PropTypes.any,
    emptyValue: PropTypes.any
  });

  /**
   * Wrap a {@link StaticComponent} in a {@link ComponentWrapper} ready
   * to be included in a {@link StepDefinition}.
   *
   * @typeparam DBSchema - The schema used by the
   * {@link DynamicComponent|DynamicComponents} of this {@link StepDefinition}.
   * It's possible to infer this if {@link StaticComponent.renderWhen} is
   * implemented on `component`.
   */
  static wrapStatic<
    DBSchema extends NamedSchema<string, number, Schema>,
    StoreName extends StoreNames<DBSchema["schema"]> = StoreNames<
      DBSchema["schema"]
    >,
    Value extends ComponentValue<DBSchema, StoreName> = ComponentValue<
      DBSchema,
      StoreName
    >
  >(
    component: StaticComponent<React.ElementType, DBSchema>
  ): ComponentWrapper<DBSchema, StoreName, Value> {
    const { key, Component, props, renderWhen } = component;

    return new ComponentWrapper(
      key,
      (): JSX.Element => <Component key={key} {...props} />,
      renderWhen
    );
  }

  /**
   * Wrap a {@link DynamicComponent} in a {@link ComponentWrapper}
   * ready to be included in a {@link StepDefinition}.
   *
   * You shouldn't need to provide any of the type parameters. They should be
   * infered from the {@link DynamicComponent} passed in.
   */
  static wrapDynamic<
    Props extends {},
    DBSchema extends NamedSchema<string, number, Schema>,
    StoreName extends StoreNames<DBSchema["schema"]>,
    Value extends ComponentValue<DBSchema, StoreName>
  >(
    component: DynamicComponent<Props, DBSchema, StoreName, Value>
  ): ComponentWrapper<DBSchema, StoreName, Value> {
    const {
      key,
      renderWhen,
      databaseMap,
      defaultValue,
      emptyValue
    } = component;

    const render = (
      props: ComponentWrapperRenderProps<DBSchema, StoreName, Value>
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
    props: ComponentWrapperRenderProps<DBSchema, StoreName, Value>
  ) => JSX.Element;

  /**
   * A callback to determine when the component should be rendered.
   *
   * @param stepValues - A map of the keys to the current values for all of the
   * components in the currently rendered {@link StepDefinition}.
   */
  readonly renderWhen: (stepValues: {
    [key: string]:
      | ComponentValue<DBSchema, StoreNames<DBSchema["schema"]>>
      | undefined;
  }) => boolean;

  /**
   * The properies needed to map the user-entered value for the wrapped
   * component to the {@link Database}.
   */
  readonly databaseMap?: ComponentDatabaseMap<DBSchema, StoreName> | null;

  /**
   * The optional default value to store in the {@link Database} if the
   * component hasn't been changed by the user.
   */
  readonly defaultValue?: Value | null;

  /**
   * The value to consider as an empty input when updating the {@link Database}.
   *
   * If {@link ComponentWrapper.databaseMap} is defined, then willd also be
   * defined.
   */
  readonly emptyValue?: Value | null;

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
      props: ComponentWrapperRenderProps<DBSchema, StoreName, Value>
    ) => JSX.Element,
    renderWhen: (stepValues: {
      [key: string]:
        | ComponentValue<DBSchema, StoreNames<DBSchema["schema"]>>
        | undefined;
    }) => boolean,
    databaseMap?: ComponentDatabaseMap<DBSchema, StoreName>,
    defaultValue?: Value | null,
    emptyValue?: Value | null
  ) {
    this.key = key;
    this.render = render;
    this.renderWhen = renderWhen;
    this.databaseMap = databaseMap;
    this.defaultValue = defaultValue;
    this.emptyValue = emptyValue;
  }
}
