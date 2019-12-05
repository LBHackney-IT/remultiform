import { NextPageContext } from "next";
import React, { Component } from "react";
import { Orchestrator } from "remultiform/orchestrator";

import steps from "../steps";

interface SlugPageProps {
  slug: string;
}

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
