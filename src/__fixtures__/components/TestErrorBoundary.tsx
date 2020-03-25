import PropTypes from "prop-types";
import React from "react";

export interface TestErrorBoundaryProps {
  children: React.ReactNode;
}

export interface TestErrorBoundaryState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
}

export class TestErrorBoundary extends React.Component<
  TestErrorBoundaryProps,
  TestErrorBoundaryState
> {
  static propTypes: PropTypes.ValidationMap<TestErrorBoundaryProps> = {
    children: PropTypes.node.isRequired,
  };

  static getDerivedStateFromError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any
  ): Partial<TestErrorBoundaryState> {
    return { error };
  }

  state: TestErrorBoundaryState = {};

  render(): JSX.Element {
    const { children } = this.props;
    const { error } = this.state;

    if (error) {
      return <span>Caught error: {error.toString()}</span>;
    }

    return <>{children}</>;
  }
}
