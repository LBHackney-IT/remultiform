/** */

/**
 * A component along with the associated properties needed to render it as part
 * of a {@link Step}.
 *
 * ```ts
 * const component: PageComponent<typeof MyInput> = {
 *   key: "my-input",
 *   Component: MyInput,
 *   props: {
 *     defaultValue: "Enter something?"
 *   }
 * }
 * ```
 */
export interface PageComponent<
  ComponentType extends React.ElementType<Props>,
  Props = ComponentType extends React.ElementType<infer T> ? T : never
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
   * The props to pass to {@link PageComponent.Component}.
   */
  props: JSX.LibraryManagedAttributes<ComponentType, Props>;
}
