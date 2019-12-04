import PropTypes from "prop-types";

import { NamedSchema, Schema, StoreNames, StoreValue } from "../../store/types";

import { DatabaseMap } from "./DatabaseMap";

/**
 * The proptypes of the extra props injected by {@link WrappedPageComponent}
 * for connecting a {@link DynamicPageComponent} with a {@link Database}.
 *
 * When implementing a {@link DynamicPageComponent} you should make sure to
 * hook these props up to the relevant props in the component you're wrapping in
 * order to integrate with the {@link Database} correctly.
 *
 * ```ts
 * type MyProps = DynamicPageComponentControlledProps<string> & {
 *   content: string;
 * };
 * ```
 */
export interface DynamicPageComponentControlledProps<Value> {
  /**
   * The current value of the component.
   *
   * This should follow the standard
   * {@link https://reactjs.org/docs/forms.html#controlled-components|React
   * controlled component} pattern with
   * {@link DynamicPageComponentControlledProps.onValueChange}.
   */
  value: "" | Value | null | undefined;

  /**
   * The callback to call when the component's value changes.
   *
   * This should follow the standard
   * {@link https://reactjs.org/docs/forms.html#controlled-components|React
   * controlled component} pattern with
   * {@link DynamicPageComponentControlledProps.value}.
   */
  onValueChange(value: "" | Value): void;

  /**
   * A flag for whether or not the component is disabled for input.
   *
   * {@link WrappedPageComponent} sets this to `true` when waiting for
   * {@link Database} operations to settle. The wrapped component should
   * disable functionality appropriately. If you choose not to handle this prop,
   * be aware that unsaved user entered data may be overwritten when the
   * {@link Database} operation does eventually settle.
   */
  disabled: boolean;
}

/**
 * A React component that handles {@link DynamicPageComponentControlledProps}
 * in addition to its own props.
 *
 * @typeparam Props - The proptypes for the component, excluding the
 * {@link DynamicPageComponentControlledProps}.
 *
 * @typeparam Value - The {@link StoreValue} of the value this component
 * represents in the {@link Database}.
 */
export type DynamicPageComponentType<Props, Value> = React.ComponentType<
  Props & DynamicPageComponentControlledProps<Value>
>;

/**
 * The options for {@link DynamicPageComponent}.
 */
export interface DynamicPageComponentOptions<
  ComponentType extends DynamicPageComponentType<
    Props,
    StoreValue<DBSchema["schema"], StoreName>
  >,
  Props,
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  /**
   * A unique identifier for this component on the page.
   */
  key: string;

  /**
   * The component class or function to render.
   *
   * The component must implement {@link DynamicPageComponentControlledProps}
   * in addition to any of its own props.
   *
   * Pass static prop values via {@link DynamicPageComponentOptions.props}.
   */
  Component: ComponentType;

  /**
   * The static props to pass to {@link DynamicPageComponentOptions.Component}.
   *
   * These should not include the {@link DynamicPageComponentControlledProps},
   * which are injected by {@link WrappedPageComponent}.
   */
  props: Props;

  /**
   * The configuration telling the {@link DynamicPageComponent} how to interface
   * with the {@link Database}.
   *
   * See {@link DatabaseMap} for more details.
   */
  databaseMap: DatabaseMap<DBSchema, StoreName>;

  /**
   * The value to default to when nothing exists in the provided database store.
   *
   * If you leave this unspecified, it will use whatever the default value for
   * the component is.
   */
  defaultValue?: StoreValue<DBSchema["schema"], StoreName> | null;

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
 * of a {@link Step}.
 *
 * Unlike {@link StaticPageComponent}, we inject some additional
 * {@link DynamicPageComponentControlledProps} into the component to support
 * interfacing with a {@link Database}. The
 * {@link DynamicPageComponentOptions.Component} needs to support those extra
 * props if it needs to interface with a {@link Database}. If not, use a
 * {@link StaticPageComponent} instead.
 *
 * ```ts
 * const storeName = "myStore";
 *
 * const myDatabaseMap = new DatabaseMap<MyDBSchema, typeof storeName>({
 *   storeName,
 *   key: "input-0"
 * });
 *
 * const myInput = new DynamicPageComponent({
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
export class DynamicPageComponent<
  ComponentType extends DynamicPageComponentType<
    Props,
    StoreValue<DBSchema["schema"], StoreName>
  >,
  Props,
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  /**
   * The proptype validator for a {@link DynamicPageComponent}.
   */
  static propType: PropTypes.Requireable<
    DynamicPageComponent<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      DynamicPageComponentType<any, StoreValue<Schema, StoreNames<Schema>>>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any,
      NamedSchema<string, number, Schema>,
      StoreNames<Schema>
    >
  > = PropTypes.exact({
    key: PropTypes.string.isRequired,
    Component: PropTypes.func.isRequired,
    props: PropTypes.object.isRequired,
    databaseMap: DatabaseMap.propType.isRequired,
    defaultValue: PropTypes.any,
    emptyValue: PropTypes.any.isRequired
  });

  /**
   * The proptypes for {@link DynamicPageComponentControlledProps}.
   *
   * This is generic to support being specific about the type of
   * {@link DynamicPageComponentControlledProps.value}. The type should be
   * infered from the arguments.
   *
   * @param valuePropType - An optional proptype validator for the type of
   * {@link DynamicPageComponentControlledProps.value}.
   */
  static controlledPropTypes<Value>(
    valuePropType: PropTypes.Requireable<Value>
  ): PropTypes.ValidationMap<DynamicPageComponentControlledProps<Value>> {
    return {
      value: valuePropType,
      onValueChange: PropTypes.func.isRequired,
      disabled: PropTypes.bool.isRequired
    };
  }

  readonly key: string;
  readonly Component: ComponentType;
  readonly props: Props;
  readonly databaseMap: DatabaseMap<DBSchema, StoreName>;
  readonly defaultValue?: StoreValue<DBSchema["schema"], StoreName> | null;
  readonly emptyValue: "" | StoreValue<DBSchema["schema"], StoreName>;

  constructor(
    options: DynamicPageComponentOptions<
      ComponentType,
      Props,
      DBSchema,
      StoreName
    >
  ) {
    const {
      key,
      Component,
      props,
      databaseMap,
      defaultValue,
      emptyValue
    } = options;

    this.key = key;
    this.Component = Component;
    this.props = props;
    this.databaseMap = databaseMap;
    this.defaultValue = defaultValue;

    // We need to do this to keep the component as a controlled component. The
    // controlled prop must always be defined.
    this.emptyValue = emptyValue === undefined ? "" : emptyValue;
  }
}
