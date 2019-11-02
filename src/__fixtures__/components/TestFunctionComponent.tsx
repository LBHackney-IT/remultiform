import PropTypes from "prop-types";
import React, { FunctionComponent } from "react";

export interface TestFunctionComponentProps {
  content: string;
}

const TestFunctionComponent: FunctionComponent<TestFunctionComponentProps> = ({
  content
}) => <div>{content}</div>;

TestFunctionComponent.propTypes = {
  content: PropTypes.string.isRequired
};

export default TestFunctionComponent;
