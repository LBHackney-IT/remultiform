import { NextPageContext } from "next";
import React, { Component } from "react";
import { Page, PageComponents } from "remultiform";

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

    const components: PageComponents = [
      {
        id: "image",
        Component: "img",
        props: { src: `https://placekitten.com/${kittenDimensions.join("/")}` }
      }
    ];

    return <Page components={components} />;
  }
}

export default SlugPage;
