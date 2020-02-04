import PropTypes from "prop-types";

import { NamedSchema, Schema, StoreNames } from "../database/types";

import { ComponentDatabaseMap, ComponentValue } from "./ComponentDatabaseMap";

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
  value: Value;

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
   * A flag for whether or not the component is required.
   */
  required: boolean;

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
 * @typeparam Value - The {@link ComponentValue} of the value or value property
 * this component represents in the {@link Database}.
 */
export type DynamicComponentType<Props extends {}, Value> = React.ComponentType<
  Props & DynamicComponentControlledProps<Value>
>;

/**
 * The options for {@link DynamicComponent}.
 */
export interface DynamicComponentOptions<
  Props extends {},
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>,
  Value extends ComponentValue<DBSchema, StoreName>
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
  Component: DynamicComponentType<Props, Value>;

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
      | ComponentValue<DBSchema, StoreNames<DBSchema["schema"]>>
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
  defaultValue: Value | undefined;

  /**
   * The value representing an empty value for this component.
   *
   * In order for React to manage a controlled component, the controlled prop
   * must always be defined.
   */
  emptyValue: Value;

  /**
   * Whether or not to require an answer to this component if it is visible.
   */
  required?:
    | ((stepValues: {
        [key: string]:
          | ComponentValue<DBSchema, StoreNames<DBSchema["schema"]>>
          | undefined;
      }) => boolean)
    | boolean;
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
 *   key: "input-0",
 *   property: ["my", "property"]
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
  Props extends {},
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>,
  Value extends ComponentValue<DBSchema, StoreName>
> {
  /**
   * The proptype validator for a {@link DynamicComponent}.
   */
  static propType: PropTypes.Requireable<
    DynamicComponent<
      {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      NamedSchema<string, number, any>,
      string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    >
  > = PropTypes.exact({
    key: PropTypes.string.isRequired,
    Component: PropTypes.func.isRequired,
    props: PropTypes.object.isRequired,
    renderWhen: PropTypes.func.isRequired,
    databaseMap: ComponentDatabaseMap.propType.isRequired,
    defaultValue: PropTypes.any,
    emptyValue: PropTypes.any.isRequired,
    required: PropTypes.bool.isRequired
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
      required: PropTypes.bool.isRequired,
      disabled: PropTypes.bool.isRequired
    };
  }

  readonly key: string;
  readonly Component: DynamicComponentType<Props, Value>;
  readonly props: Props;
  readonly renderWhen: (stepValues: {
    [key: string]:
      | ComponentValue<DBSchema, StoreNames<DBSchema["schema"]>>
      | undefined;
  }) => boolean;
  readonly databaseMap: ComponentDatabaseMap<DBSchema, StoreName>;
  readonly defaultValue: Value | null | undefined;
  readonly emptyValue: Value;
  readonly required:
    | ((stepValues: {
        [key: string]:
          | ComponentValue<DBSchema, StoreNames<DBSchema["schema"]>>
          | undefined;
      }) => boolean)
    | boolean;

  constructor(
    options: DynamicComponentOptions<Props, DBSchema, StoreName, Value>
  ) {
    const {
      key,
      Component,
      props,
      renderWhen,
      databaseMap,
      defaultValue,
      emptyValue,
      required
    } = options;

    this.key = key;
    this.Component = Component;
    this.props = props;
    this.databaseMap = databaseMap;
    this.defaultValue = defaultValue;
    this.emptyValue = emptyValue;

    this.renderWhen =
      renderWhen === undefined ? (): boolean => true : renderWhen;
    this.required = required === undefined ? false : required;
  }
}
