import PropTypes from "prop-types";
import React from "react";

export interface TestFunctionComponentProps {
  content: string;
}

export const TestFunctionComponent: React.FunctionComponent<TestFunctionComponentProps> = (
  props: TestFunctionComponentProps
): JSX.Element => {
  const { content } = props;

  return <div>{content}</div>;
};

TestFunctionComponent.displayName = "TestFunctionComponent";

TestFunctionComponent.propTypes = {
  content: PropTypes.string.isRequired
};
