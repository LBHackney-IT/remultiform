import PropTypes from "prop-types";
import React from "react";

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
  Props = ComponentType extends React.ElementType<infer T> ? T : {}
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

/**
 * A wrapper for {@link PageComponent} for a {@link Step}.
 *
 * Create these using {@link wrapPageComponent}.
 */
export interface PageComponentWrapper {
  key: React.Key;

  /**
   * The function to render the component.
   *
   * @param key - The key to give the generated component. Defaults to
   * {@link PageComponentWrapper.key}.
   */
  render(key?: React.Key): JSX.Element;
}

/**
 * The proptypes of a {@link PageComponentWrapper}.
 */
export const pageComponentWrapperPropType = PropTypes.exact({
  key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  render: PropTypes.func.isRequired
}).isRequired;

/**
 * Wrap a {@link PageComponent} in a {@link PageComponentWrapper} ready to be
 * included in a {@link Step}.
 */
// This method mostly exists so we can have strict type inference on our
// components. By wrapping the component in a generic function, the type of the
// component has to be infered in order to call the function, meaning we get
// strong types with little effort.
export const wrapPageComponent = <
  ComponentType extends React.ElementType<Props>,
  Props = ComponentType extends React.ElementType<infer T> ? T : {}
>(
  component: PageComponent<ComponentType, Props>
): PageComponentWrapper => {
  const { key, Component, props } = component;

  return {
    key,
    render(k: React.Key = key): JSX.Element {
      return <Component key={k} {...props} />;
    }
  };
};
