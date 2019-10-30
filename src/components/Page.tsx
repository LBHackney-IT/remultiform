import PropTypes, { ValidationMap } from "prop-types";
import React, { Attributes, ComponentType } from "react";

export interface PageComponent<P = {}> {
  id: string;
  Component: string | ComponentType<Attributes | P>;
  props?: P;
}

export type PageComponents<P = {}> = PageComponent<P>[];

export interface PageProps<P = {}> {
  components: PageComponents<P>;
}

class Page<P> extends React.Component<PageProps<P>> {
  static propTypes: ValidationMap<PageProps> = {
    components: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        Component: PropTypes.elementType.isRequired,
        props: PropTypes.object
      }).isRequired
    ).isRequired
  };

  render(): JSX.Element {
    const { components } = this.props;

    return (
      <>
        {components.map(({ id, Component, props }) => (
          <Component key={id} {...props} />
        ))}
      </>
    );
  }
}

export default Page;
