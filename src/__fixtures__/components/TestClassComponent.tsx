import PropTypes from "prop-types";
import React from "react";

export interface TestClassComponentProps {
  content: string;
}

export class TestClassComponent extends React.Component<
  TestClassComponentProps
> {
  static propTypes: PropTypes.ValidationMap<TestClassComponentProps> = {
    content: PropTypes.string.isRequired,
  };

  render(): JSX.Element {
    const { content } = this.props;

    return <div>{content}</div>;
  }
}
