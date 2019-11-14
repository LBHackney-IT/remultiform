import PropTypes from "prop-types";
import React from "react";

export interface PageComponent<
  C extends React.ElementType<P>,
  P = C extends React.ElementType<infer T> ? T : {}
> {
  key: React.Key;
  Component: C;
  props: JSX.LibraryManagedAttributes<C, P>;
}

export interface PageComponentWrapper {
  key: React.Key;
  render(key?: React.Key): JSX.Element;
}

export const pageComponentWrapperPropType = PropTypes.exact({
  key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  render: PropTypes.func.isRequired
}).isRequired;

export const wrapPageComponent = <
  C extends React.ElementType<P>,
  P = C extends React.ElementType<infer T> ? T : {}
>({
  key,
  Component,
  props
}: PageComponent<C, P>): PageComponentWrapper => ({
  key,
  render(k?: React.Key): JSX.Element {
    return <Component key={k !== undefined ? k : key} {...props} />;
  }
});
