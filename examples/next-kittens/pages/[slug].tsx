import { NextPageContext } from "next";
import React, { Component } from "react";
import { Page, wrapPageComponent } from "remultiform";

interface SlugPageProps {
  kittenDimensions: string[];
}

class SlugPage extends Component<SlugPageProps> {
  static getInitialProps({ query }: NextPageContext): SlugPageProps {
    const { slug } = query;

    return { kittenDimensions: (slug as string).split("x") };
  }

  render(): JSX.Element {
    const { kittenDimensions } = this.props;

    const componentWrappers = [
      wrapPageComponent({
        key: "image",
        Component: "img",
        props: { src: `https://placekitten.com/${kittenDimensions.join("/")}` }
      })
    ];

    return <Page componentWrappers={componentWrappers} />;
  }
}

export default SlugPage;
