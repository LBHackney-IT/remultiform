import PropTypes from "prop-types";

/**
 * The options for {@link PageComponent}.
 */
export interface PageComponentOptions<
  ComponentType extends React.ElementType<Props>,
  Props
> {
  /**
   * A unique identifier for this component on the page.
   */
  key: React.Key;

  /**
   * The component class, function, or tag name to render.
   */
  Component: ComponentType;

  /**
   * The props to pass to {@link PageComponentOptions.Component}.
   */
  props: Props;
}

/**
 * A component along with the associated properties needed to render it as part
 * of a {@link Step}.
 *
 * ```ts
 * const myInput = new PageComponent({
 *   key: "my-input",
 *   Component: MyInput,
 *   props: {
 *     className: "my-input-class"
 *   }
 * });
 * ```
 */
export class PageComponent<
  ComponentType extends React.ElementType<Props>,
  Props
> {
  /**
   * The proptype validator for a {@link PageComponent}.
   */
  static propType: PropTypes.Requireable<
    PageComponent<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      React.ElementType<any>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    >
  > = PropTypes.exact({
    key: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.number.isRequired
    ]).isRequired,
    Component: (PropTypes.elementType as PropTypes.Requireable<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      React.ElementType<any>
    >).isRequired,
    props: PropTypes.object.isRequired,
    defaultValue: PropTypes.any.isRequired
  });

  readonly key: React.Key;
  readonly Component: ComponentType;
  readonly props: Props;

  constructor(options: PageComponentOptions<ComponentType, Props>) {
    const { key, Component, props } = options;

    this.key = key;
    this.Component = Component;
    this.props = props;
  }
}
