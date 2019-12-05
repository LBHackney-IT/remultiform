import { nullAsUndefined } from "null-as-undefined";
import PropTypes from "prop-types";
import React from "react";

import {
  DynamicComponent,
  DynamicComponentControlledProps
} from "../../component-wrapper/DynamicComponent";

export type TestDynamicComponentProps = DynamicComponentControlledProps<
  string
> & {
  content: string;
};

export const TestDynamicComponent: React.FunctionComponent<TestDynamicComponentProps> = (
  props: TestDynamicComponentProps
): JSX.Element => {
  const { content, value, onValueChange, disabled } = props;

  return (
    <div>
      <div>{content}</div>
      <input
        data-testid="input"
        value={nullAsUndefined(value)}
        onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
          onValueChange(event.target.value);
        }}
        disabled={disabled}
      />
    </div>
  );
};

TestDynamicComponent.displayName = "TestDynamicComponent";

TestDynamicComponent.propTypes = {
  content: PropTypes.string.isRequired,
  ...DynamicComponent.controlledPropTypes(PropTypes.string)
};
