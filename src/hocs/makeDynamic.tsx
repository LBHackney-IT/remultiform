import PropTypes from "prop-types";
import React from "react";
import { Subtract } from "utility-types";

import {
  DynamicPageComponent,
  DynamicPageComponentControlledProps
} from "../helpers/PageComponentWrapper/DynamicPageComponent";

/**
 * The proptypes for the component returned by {@link makeDynamic}.
 */
export type DynamicProps<
  Props extends PropsToMap,
  PropsToMap extends {},
  Value
> = Subtract<Props, PropsToMap> & DynamicPageComponentControlledProps<Value>;

/**
 * A map of dynamic controlled prop names to component prop names for passing to
 * {@link makeDynamic}.
 *
 * See {@link DynamicPageComponentControlledProps} for the type of each prop
 * and how it's used.
 */
export interface MakeDynamicPropMap<PropsToMap> {
  /**
   * The name of the prop on the wrapped component to map `value` to.
   */
  value: keyof PropsToMap;

  /**
   * The name of the prop on the wrapped component to map `onValueChange` to.
   */
  onValueChange: keyof PropsToMap;

  /**
   * The name of the prop on the wrapped component to map `disabled` to.
   */
  disabled: keyof PropsToMap;
}

/**
 * An adapter to pass to {@link makeDynamic} to map
 * {@link DynamicPageComponentControlledProps.onValueChange} to its
 * corresponding prop in the wrapped component.
 */
export interface MakeDynamicValueChangeAdapter<Value> {
  /**
   * This function should take any arguments from the event you're listening for
   * and convert it to `Value` ready to be consumed by
   * {@link DynamicPageComponentControlledProps.onValueChange}.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any[]): Value;
}

const mapDynamicPropsToComponentProps = <
  Props extends PropsToMap,
  PropsToMap extends {},
  Value
>(
  dynamicProps: Readonly<
    Subtract<Props, PropsToMap> & DynamicPageComponentControlledProps<Value>
  >,
  { value, onValueChange, disabled }: MakeDynamicPropMap<PropsToMap>,
  valueChangeAdapter: MakeDynamicValueChangeAdapter<Value>
): Props => {
  const copyOfDynamicProps = {
    ...dynamicProps
  } as Subtract<Props, PropsToMap> &
    Partial<DynamicPageComponentControlledProps<Value>>;

  delete copyOfDynamicProps.value;
  delete copyOfDynamicProps.onValueChange;
  delete copyOfDynamicProps.disabled;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleValueChange = (...args: any[]): void => {
    const value = valueChangeAdapter(...args);

    dynamicProps.onValueChange(value);
  };

  return {
    ...copyOfDynamicProps,
    [value]: dynamicProps.value,
    [onValueChange]: handleValueChange,
    [disabled]: dynamicProps.disabled
  } as Props;
};

const mapComponentPropTypesToDynamicPropTypes = <
  Props extends PropsToMap,
  PropsToMap extends {},
  Value
>(
  componentPropTypes: Readonly<React.WeakValidationMap<Props>> | undefined,
  { value, onValueChange, disabled }: MakeDynamicPropMap<PropsToMap>
): React.WeakValidationMap<Subtract<Props, PropsToMap> &
  DynamicPageComponentControlledProps<Value>> => {
  const copyOfComponentPropTypes = {
    ...componentPropTypes
  } as PropTypes.ValidationMap<
    Subtract<Props, PropsToMap> & Partial<PropsToMap>
  >;

  delete copyOfComponentPropTypes[value];
  delete copyOfComponentPropTypes[onValueChange];
  delete copyOfComponentPropTypes[disabled];

  const valuePropType = componentPropTypes
    ? ((componentPropTypes[value] as unknown) as PropTypes.Requireable<Value>)
    : PropTypes.any;

  return {
    ...copyOfComponentPropTypes,
    ...DynamicPageComponent.controlledPropTypes(valuePropType)
  } as React.WeakValidationMap<
    Subtract<Props, PropsToMap> & DynamicPageComponentControlledProps<Value>
  >;
};

/**
 * A {@link https://reactjs.org/docs/higher-order-components.html|Higher Order
 * Component (HOC)} for mapping {@link DynamicPageComponentControlledProps} to
 * a component's props without the hassle of creating a wrapper component.
 *
 * You will need to provide the type parameters to have this function correctly.
 *
 * @typeparam ComponentType - The type of the React component wrapped by this
 * HOC.
 *
 * @typeparam Props - The proptypes for `Component`.
 *
 * @typeparam PropNamesToMap - A union of the names of the props in `Props`
 * that need to be mapped to {@link DynamicPageComponentControlledProps} via
 * `propMap`.
 *
 * ```ts
 * type PropNamesToMap = "inputValue" | "onInputValueChange" | "inputDisabled";
 * ```
 *
 * **Do not use `string` or all props will be removed from the PropTypes!**
 *
 * @typeparam Value - The type of the
 * {@link DynamicPageComponentControlledProps.value} to be used by `Component`.
 *
 * @param Component - The React component to wrap.
 *
 * @param propMap - The map of {@link DynamicPageComponentControlledProps} keys
 * to `PropNamesToMap`.
 *
 * @returns A React component, ready to be used in a
 * {@link DynamicPageComponent}, with its
 * {@link DynamicPageComponentControlledProps} mapped to the `Component` as
 * specified by the `propMap`.
 */
export const makeDynamic = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Props extends { [K in PropNamesToMap]?: any },
  PropNamesToMap extends string,
  Value
>(
  Component: React.ElementType<Props>,
  propMap: MakeDynamicPropMap<Pick<Props, PropNamesToMap>>,
  valueChangeAdapter: MakeDynamicValueChangeAdapter<Value>
): React.FunctionComponent<Subtract<Props, Pick<Props, PropNamesToMap>> &
  DynamicPageComponentControlledProps<Value>> => {
  type PropsToMap = Pick<Props, PropNamesToMap>;
  type DynamicProps = Subtract<Props, Pick<Props, PropNamesToMap>> &
    DynamicPageComponentControlledProps<Value>;

  const Dynamic: React.FunctionComponent<DynamicProps> = (
    props: DynamicProps
  ): JSX.Element => {
    const mappedProps = mapDynamicPropsToComponentProps<
      Props,
      PropsToMap,
      Value
    >(props, propMap, valueChangeAdapter);

    if (typeof Component === "string") {
      const IntrinsicElement = Component as keyof JSX.IntrinsicElements;
      // Infering the type of the React props acceptable for any possible
      // `JSX.IntrinsicElements` is Hard. The type of this never leaves this
      // scope, so we cheat, given that the author is confident about the types
      // actually matching, whatever TypeScript says.
      const intrinsicElementProps = mappedProps as {};

      return <IntrinsicElement {...intrinsicElementProps} />;
    } else {
      return <Component {...mappedProps} />;
    }
  };

  if (typeof Component === "string") {
    const IntrinsicElement = Component as keyof JSX.IntrinsicElements;

    Dynamic.displayName = `makeDynamic(${IntrinsicElement})`;

    // We don't know the type of `Value` at runtime to use for the proptypes,
    // so we allow `any`.
    Dynamic.propTypes = DynamicPageComponent.controlledPropTypes<Value>(
      PropTypes.any
    ) as React.WeakValidationMap<DynamicProps>;
  } else {
    Dynamic.displayName = `makeDynamic(${Component.displayName ||
      Component.name ||
      "unknown"})`;
    Dynamic.propTypes = mapComponentPropTypesToDynamicPropTypes<
      Props,
      PropsToMap,
      Value
    >(Component.propTypes, propMap);
  }

  return Dynamic;
};
