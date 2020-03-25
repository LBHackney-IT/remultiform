import PropTypes from "prop-types";

import { NamedSchema, Schema, StoreNames } from "../database/types";

import { ComponentValue } from "./ComponentDatabaseMap";

/**
 * The options for {@link StaticComponent}.
 */
export interface StaticComponentOptions<
  ComponentType extends React.ElementType,
  DBSchema extends NamedSchema<string, number, Schema>
> {
  /**
   * A unique identifier for this component.
   */
  key: string;

  /**
   * The component class, function, or tag name to render.
   */
  Component: ComponentType;

  /**
   * The props to pass to {@link StaticComponentOptions.Component}.
   */
  props: ComponentType extends React.ElementType<infer Props> ? Props : {};

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
}

/**
 * A component along with the associated properties needed to render it as part
 * of a {@link StepDefinition}.
 *
 * If you need your component to interact with a {@link Database}, use
 * a {@link DynamicComponent} instead.
 *
 * ```ts
 * const myInput = new Component({
 *   key: "my-input",
 *   Component: MyInput,
 *   props: {
 *     className: "my-input-class"
 *   }
 * });
 * ```
 */
export class StaticComponent<
  ComponentType extends React.ElementType,
  DBSchema extends NamedSchema<string, number, Schema>
> {
  /**
   * The proptype validator for a {@link StaticComponent}.
   */
  static propType: PropTypes.Requireable<
    StaticComponent<React.ElementType, NamedSchema<string, number, Schema>>
  > = PropTypes.exact({
    key: PropTypes.string.isRequired,
    Component: (PropTypes.elementType as PropTypes.Requireable<
      React.ElementType
    >).isRequired,
    props: PropTypes.object.isRequired,
    renderWhen: PropTypes.func.isRequired,
  });

  readonly key: string;
  readonly Component: ComponentType;
  readonly props: ComponentType extends React.ElementType<infer Props>
    ? Props
    : {};
  readonly renderWhen: (stepValues: {
    [key: string]:
      | ComponentValue<DBSchema, StoreNames<DBSchema["schema"]>>
      | undefined;
  }) => boolean;

  constructor(options: StaticComponentOptions<ComponentType, DBSchema>) {
    const { key, Component, props, renderWhen } = options;

    this.key = key;
    this.Component = Component;
    this.props = props;

    this.renderWhen =
      renderWhen === undefined ? (): boolean => true : renderWhen;
  }
}
