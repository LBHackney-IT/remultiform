import { NextPageContext } from "next";
import React, { Component } from "react";
import {
  Orchestrator,
  PageComponentWrapper,
  StaticPageComponent,
  Step
} from "remultiform";

import { makeSubmit } from "../components/makeSubmit";

interface SlugPageProps {
  slug: string;
}

const steps: Step[] = [
  {
    slug: "small-kitten",
    nextSlug: "big-kitten",
    Submit: makeSubmit({ href: "/big-kitten", value: "Big kitten" }),
    componentWrappers: [
      PageComponentWrapper.wrapStatic(
        new StaticPageComponent({
          key: "image",
          Component: "img",
          props: { src: `https://placekitten.com/200/300` }
        })
      )
    ]
  },
  {
    slug: "big-kitten",
    nextSlug: "small-kitten",
    Submit: makeSubmit({ href: "/small-kitten", value: "Small kitten" }),
    componentWrappers: [
      PageComponentWrapper.wrapStatic(
        new StaticPageComponent({
          key: "image",
          Component: "img",
          props: { src: `https://placekitten.com/900/600` }
        })
      )
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

    return (
      <>
        <Orchestrator
          initialSlug={slug}
          steps={steps}
          manageStepTransitions={false}
        />
      </>
    );
  }
}

export default SlugPage;
