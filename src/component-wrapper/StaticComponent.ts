import PropTypes from "prop-types";

/**
 * The options for {@link StaticComponent}.
 */
export interface StaticComponentOptions<
  ComponentType extends React.ElementType<Props>,
  Props
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
  props: Props;
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
  ComponentType extends React.ElementType<Props>,
  Props
> {
  /**
   * The proptype validator for a {@link StaticComponent}.
   */
  static propType: PropTypes.Requireable<
    StaticComponent<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      React.ElementType<any>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    >
  > = PropTypes.exact({
    key: PropTypes.string.isRequired,
    Component: (PropTypes.elementType as PropTypes.Requireable<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      React.ElementType<any>
    >).isRequired,
    props: PropTypes.object.isRequired,
    defaultValue: PropTypes.any.isRequired
  });

  readonly key: string;
  readonly Component: ComponentType;
  readonly props: Props;

  constructor(options: StaticComponentOptions<ComponentType, Props>) {
    const { key, Component, props } = options;

    this.key = key;
    this.Component = Component;
    this.props = props;
  }
}
