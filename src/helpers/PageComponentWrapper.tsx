import PropTypes from "prop-types";
import React, { ElementType, Key } from "react";

export interface PageComponent<
  C extends ElementType<P>,
  P = C extends ElementType<infer T> ? T : {}
> {
  key: Key;
  Component: C;
  props: JSX.LibraryManagedAttributes<C, P>;
}

interface PageComponentWrapper {
  key: Key;
  render(key?: Key): JSX.Element;
}

export const pageComponentWrapperPropType = PropTypes.exact({
  key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  render: PropTypes.func.isRequired
}).isRequired;

export const wrapPageComponent = <
  C extends ElementType<P>,
  P = C extends ElementType<infer T> ? T : {}
>({
  key,
  Component,
  props
}: PageComponent<C, P>): PageComponentWrapper => ({
  key,
  render(k?: Key): JSX.Element {
    return <Component key={k !== undefined ? k : key} {...props} />;
  }
});

export default PageComponentWrapper;
