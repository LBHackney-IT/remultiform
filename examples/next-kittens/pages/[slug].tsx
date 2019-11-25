import { NextPageContext } from "next";
import React, { Component } from "react";
import { Orchestrator, PageComponentWrapper, Step } from "remultiform";

interface SlugPageProps {
  slug: string;
}

const steps: Step[] = [
  {
    key: "small-kitten",
    componentWrappers: [
      PageComponentWrapper.wrap({
        key: "image",
        Component: "img",
        props: { src: `https://placekitten.com/200/300` }
      })
    ]
  },
  {
    key: "big-kitten",
    componentWrappers: [
      PageComponentWrapper.wrap({
        key: "image",
        Component: "img",
        props: { src: `https://placekitten.com/900/600` }
      })
    ]
  }
];

class SlugPage extends Component<SlugPageProps> {
  static getInitialProps({ query }: NextPageContext): SlugPageProps {
    const { slug } = query;

    return { slug: slug as string };
  }

  render(): JSX.Element {
    const { slug } = this.props;

    return <Orchestrator currentStepKey={slug} steps={steps} />;
  }
}

export default SlugPage;
