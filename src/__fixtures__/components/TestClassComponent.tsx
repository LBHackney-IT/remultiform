import PropTypes, { ValidationMap } from "prop-types";
import React from "react";

export interface TestClassComponentProps {
  content: string;
}

class TestClassComponent extends React.Component<TestClassComponentProps> {
  static propTypes: ValidationMap<TestClassComponentProps> = {
    content: PropTypes.string.isRequired
  };

  render(): JSX.Element {
    const { content } = this.props;

    return <div>{content}</div>;
  }
}

export default TestClassComponent;
