import PropTypes from "prop-types";
import React from "react";
import { Subtract } from "utility-types";

import {
  DynamicComponent,
  DynamicComponentControlledProps
} from "./DynamicComponent";

/**
 * The proptypes for the component returned by {@link makeDynamic}.
 */
export type DynamicProps<
  Props extends PropsToMap,
  PropsToMap extends {},
  Value
> = Subtract<Props, PropsToMap> & DynamicComponentControlledProps<Value>;

/**
 * A map of dynamic controlled prop names to component prop names for passing to
 * {@link makeDynamic}.
 *
 * See {@link DynamicComponentControlledProps} for the type of each prop
 * and how it's used.
 */
export interface MakeDynamicPropMap<PropsToMap> {
  /**
   * The name of the prop on the wrapped component to map `value` to.
   */
  value: keyof PropsToMap & string;

  /**
   * The name of the prop on the wrapped component to map `onValueChange` to.
   */
  onValueChange: keyof PropsToMap & string;

  /**
   * The name of the prop on the wrapped component to map `disabled` to.
   */
  disabled: keyof PropsToMap & string;
}

/**
 * An adapter to pass to {@link makeDynamic} to map
 * {@link DynamicComponentControlledProps.onValueChange} to its
 * corresponding prop in the wrapped component.
 */
export interface MakeDynamicValueChangeAdapter<Value> {
  /**
   * This function should take any arguments from the event you're listening for
   * and convert it to `Value` ready to be consumed by
   * {@link DynamicComponentControlledProps.onValueChange}.
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
    Subtract<Props, PropsToMap> & DynamicComponentControlledProps<Value>
  >,
  { value, onValueChange, disabled }: MakeDynamicPropMap<PropsToMap>,
  valueChangeAdapter: MakeDynamicValueChangeAdapter<Value>
): Props => {
  const copyOfDynamicProps = {
    ...dynamicProps
  } as Subtract<Props, PropsToMap> &
    Partial<DynamicComponentControlledProps<Value>>;

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
  DynamicComponentControlledProps<Value>> => {
  const copyOfComponentPropTypes = {
    ...componentPropTypes
  } as PropTypes.ValidationMap<
    Subtract<Props, PropsToMap> & Partial<PropsToMap>
  >;

  delete copyOfComponentPropTypes[value];
  delete copyOfComponentPropTypes[onValueChange];
  delete copyOfComponentPropTypes[disabled];

  const valuePropType = componentPropTypes
    ? ((componentPropTypes[value] as unknown) as PropTypes.Validator<Value>)
    : PropTypes.any.isRequired;

  return {
    ...copyOfComponentPropTypes,
    ...DynamicComponent.controlledPropTypes<Value>(valuePropType)
  } as React.WeakValidationMap<
    Subtract<Props, PropsToMap> & DynamicComponentControlledProps<Value>
  >;
};

/**
 * A {@link https://reactjs.org/docs/higher-order-components.html|Higher Order
 * Component (HOC)} for mapping {@link DynamicComponentControlledProps} to
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
 * that need to be mapped to {@link DynamicComponentControlledProps} via
 * `propMap`.
 *
 * ```ts
 * type PropNamesToMap = "inputValue" | "onInputValueChange" | "inputDisabled";
 * ```
 *
 * **Do not use `string` or all props will be removed from the PropTypes!**
 *
 * @typeparam Value - The type of the
 * {@link DynamicComponentControlledProps.value} to be used by `Component`.
 *
 * @param Component - The React component to wrap.
 *
 * @param propMap - The map of {@link DynamicComponentControlledProps} keys
 * to `PropNamesToMap`.
 *
 * @returns A React component, ready to be used in a
 * {@link DynamicComponent}, with its
 * {@link DynamicComponentControlledProps} mapped to the `Component` as
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
  DynamicComponentControlledProps<Value>> => {
  type PropsToMap = Pick<Props, PropNamesToMap>;
  type DynamicProps = Subtract<Props, Pick<Props, PropNamesToMap>> &
    DynamicComponentControlledProps<Value>;

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

      return <IntrinsicElement {...mappedProps} />;
    } else {
      return <Component {...mappedProps} />;
    }
  };

  if (typeof Component === "string") {
    const IntrinsicElement = Component as keyof JSX.IntrinsicElements;

    Dynamic.displayName = `makeDynamic(${IntrinsicElement})`;
    Dynamic.propTypes = DynamicComponent.controlledPropTypes(
      // As this is an intrinsic element, we don't know what type `value` will
      // be at runtime.
      PropTypes.any.isRequired
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
