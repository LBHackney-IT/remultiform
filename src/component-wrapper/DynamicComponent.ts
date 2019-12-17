import PropTypes from "prop-types";

import { NamedSchema, Schema, StoreNames, StoreValue } from "../database/types";

import { ComponentDatabaseMap } from "./ComponentDatabaseMap";

/**
 * The proptypes of the extra props injected when rendering the
 * {@link DynamicComponent} to connect it to a {@link Database}.
 *
 * When implementing a {@link DynamicComponent} you should make sure to
 * hook these props up to the relevant props in the component you're wrapping in
 * order to integrate with the {@link Database} correctly.
 *
 * ```ts
 * type MyProps = DynamicComponentControlledProps<string> & {
 *   content: string;
 * };
 * ```
 */
export interface DynamicComponentControlledProps<Value> {
  /**
   * The current value of the component.
   *
   * This should follow the standard
   * {@link https://reactjs.org/docs/forms.html#controlled-components|React
   * controlled component} pattern with
   * {@link DynamicComponentControlledProps.onValueChange}.
   */
  value: "" | Value;

  /**
   * The callback to call when the component's value changes.
   *
   * This should follow the standard
   * {@link https://reactjs.org/docs/forms.html#controlled-components|React
   * controlled component} pattern with
   * {@link DynamicComponentControlledProps.value}.
   */
  onValueChange(value: Value): void;

  /**
   * A flag for whether or not the component is disabled for input.
   *
   * This is set to `true` when waiting for {@link Database} operations to
   * settle. The wrapped component should disable functionality appropriately.
   * If you choose not to handle this prop, be aware that unsaved user entered
   * data may be overwritten when the {@link Database} operation does
   * eventually settle.
   */
  disabled: boolean;
}

/**
 * A React component that handles {@link DynamicComponentControlledProps}
 * in addition to its own props.
 *
 * @typeparam Props - The proptypes for the component, excluding the
 * {@link DynamicComponentControlledProps}.
 *
 * @typeparam Value - The {@link StoreValue} of the value this component
 * represents in the {@link Database}.
 */
export type DynamicComponentType<Props, Value> = React.ComponentType<
  Props & DynamicComponentControlledProps<Value>
>;

/**
 * The options for {@link DynamicComponent}.
 */
export interface DynamicComponentOptions<
  ComponentType extends DynamicComponentType<
    Props,
    StoreValue<DBSchema["schema"], StoreName>
  >,
  Props,
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  /**
   * A unique identifier for this component.
   */
  key: string;

  /**
   * The component class or function to render.
   *
   * The component must implement {@link DynamicComponentControlledProps}
   * in addition to any of its own props.
   *
   * Pass static prop values via {@link DynamicComponentOptions.props}.
   */
  Component: ComponentType;

  /**
   * The static props to pass to {@link DynamicComponentOptions.Component}.
   *
   * These should not include the {@link DynamicComponentControlledProps}, which
   * are injected automatically.
   */
  props: Props;

  /**
   * A callback to determine when the component should be rendered.
   *
   * If this is not specified, the component will always be rendered.
   *
   * ```ts
   * const renderWhen = values => values["my-radio-buttons"] === "Yes"
   * ```
   *
   * @param stepValues - A map of the keys to the current values for all of the
   * components in the currently rendered {@link StepDefinition}.
   */
  renderWhen?(stepValues: {
    [key: string]:
      | StoreValue<DBSchema["schema"], StoreNames<DBSchema["schema"]>>
      | undefined;
  }): boolean;

  /**
   * The configuration telling the {@link DynamicComponent} how to interface
   * with the {@link Database}.
   *
   * See {@link ComponentDatabaseMap} for more details.
   */
  databaseMap: ComponentDatabaseMap<DBSchema, StoreName>;

  /**
   * The value to default to when nothing exists in the provided database store.
   *
   * If this is undefined, it will use whatever the default value for the
   * component is.
   */
  defaultValue: StoreValue<DBSchema["schema"], StoreName> | undefined;

  /**
   * The value representing an empty value for this component.
   *
   * If you leave this unspecified, it will assume the empty value is an empty
   * string.
   */
  emptyValue?: StoreValue<DBSchema["schema"], StoreName>;
}

/**
 * A component along with the associated properties needed to render it as part
 * of a {@link StepDefinition}.
 *
 * Unlike {@link StaticComponent}, we inject some additional
 * {@link DynamicComponentControlledProps} into the component to support
 * interfacing with a {@link Database}. The
 * {@link DynamicComponentOptions.Component} needs to support those extra
 * props if it needs to interface with a {@link Database}. If not, use a
 * {@link StaticComponent} instead.
 *
 * ```ts
 * const storeName = "myStore";
 *
 * const myDatabaseMap = new ComponentDatabaseMap<
 *   MyDBSchema,
 *   typeof storeName
 * >({
 *   storeName,
 *   key: "input-0"
 * });
 *
 * const myInput = new DynamicComponent({
 *   key: "my-input",
 *   Component: MyInput,
 *   props: {
 *     className: "my-input-class"
 *   },
 *   defaultValue: "Nothing here...",
 *   emptyValue: "",
 *   databaseMap: myDatabaseMap
 * });
 * ```
 */
export class DynamicComponent<
  ComponentType extends DynamicComponentType<
    Props,
    StoreValue<DBSchema["schema"], StoreName>
  >,
  Props,
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  /**
   * The proptype validator for a {@link DynamicComponent}.
   */
  static propType: PropTypes.Requireable<
    DynamicComponent<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      DynamicComponentType<any, StoreValue<any, string>>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      NamedSchema<string, number, any>,
      string
    >
  > = PropTypes.exact({
    key: PropTypes.string.isRequired,
    Component: PropTypes.func.isRequired,
    props: PropTypes.object.isRequired,
    renderWhen: PropTypes.func.isRequired,
    databaseMap: ComponentDatabaseMap.propType.isRequired,
    defaultValue: PropTypes.any,
    emptyValue: PropTypes.any.isRequired
  });

  /**
   * The proptypes for {@link DynamicComponentControlledProps}.
   *
   * This is generic to support being specific about the type of
   * {@link DynamicComponentControlledProps.value}. The type should be
   * infered from the arguments.
   *
   * @param valuePropType - An optional proptype validator for the type of
   * {@link DynamicComponentControlledProps.value}.
   */
  static controlledPropTypes<Value>(
    valuePropType: PropTypes.Validator<Value>
  ): PropTypes.ValidationMap<DynamicComponentControlledProps<Value>> {
    return {
      value: valuePropType,
      onValueChange: PropTypes.func.isRequired,
      disabled: PropTypes.bool.isRequired
    };
  }

  readonly key: string;
  readonly Component: ComponentType;
  readonly props: Props;
  readonly renderWhen: (stepValues: {
    [key: string]:
      | StoreValue<DBSchema["schema"], StoreNames<DBSchema["schema"]>>
      | undefined;
  }) => boolean;
  readonly databaseMap: ComponentDatabaseMap<DBSchema, StoreName>;
  readonly defaultValue:
    | StoreValue<DBSchema["schema"], StoreName>
    | null
    | undefined;
  readonly emptyValue: "" | StoreValue<DBSchema["schema"], StoreName>;

  constructor(
    options: DynamicComponentOptions<ComponentType, Props, DBSchema, StoreName>
  ) {
    const {
      key,
      Component,
      props,
      renderWhen,
      databaseMap,
      defaultValue,
      emptyValue
    } = options;

    this.key = key;
    this.Component = Component;
    this.props = props;
    this.databaseMap = databaseMap;
    this.defaultValue = defaultValue;

    this.renderWhen =
      renderWhen === undefined ? (): boolean => true : renderWhen;

    // We need to do this to keep the component as a controlled component. The
    // controlled prop must always be defined.
    this.emptyValue = emptyValue === undefined ? "" : emptyValue;
  }
}
