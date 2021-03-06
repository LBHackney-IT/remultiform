/* eslint-disable @typescript-eslint/no-empty-function */
import { nullValuesAsUndefined } from "null-as-undefined";
import PropTypes from "prop-types";
import React from "react";
import { create } from "react-test-renderer";

import { spyOnConsoleError } from "../__tests__/helpers/spies";

import { DynamicComponent } from "./DynamicComponent";
import { makeDynamic } from "./makeDynamic";

it("renders correctly for function components", () => {
  interface TestProps {
    className: string;
    type: "text";

    inputValue?: string | null;
    onInputValueChange(value: React.ChangeEvent<HTMLInputElement>): void;
    inputRequired: boolean;
    inputDisabled: boolean;
  }

  const TestFunctionComponent: React.FunctionComponent<TestProps> = (
    props: TestProps
  ): JSX.Element => {
    const {
      className,
      type,
      inputValue,
      onInputValueChange,
      inputRequired,
      inputDisabled,
    } = nullValuesAsUndefined(props);

    return (
      <input
        className={className}
        type={type}
        value={inputValue}
        onChange={onInputValueChange}
        required={inputRequired}
        disabled={inputDisabled}
      />
    );
  };

  const Component = makeDynamic<
    TestProps,
    "inputValue" | "onInputValueChange" | "inputRequired" | "inputDisabled",
    string
  >(
    TestFunctionComponent,
    {
      value: "inputValue",
      onValueChange: "onInputValueChange",
      required: "inputRequired",
      disabled: "inputDisabled",
    },
    (event: React.ChangeEvent<HTMLInputElement>) => event.target.value
  );

  const component = create(
    <Component
      className="test-class"
      type="text"
      value="test value"
      onValueChange={jest.fn()}
      required={true}
      disabled={true}
    />
  );

  expect(component).toMatchInlineSnapshot(`
    <input
      className="test-class"
      disabled={true}
      onChange={[Function]}
      required={true}
      type="text"
      value="test value"
    />
  `);
});

it("renders correctly for class components", () => {
  interface TestProps {
    className: string;
    type: "text";

    inputValue?: string | null;
    onInputValueChange(value: React.ChangeEvent<HTMLInputElement>): void;
    inputRequired: boolean;
    inputDisabled: boolean;
  }

  class TestClassComponent extends React.Component<TestProps, never, never> {
    render(): JSX.Element {
      const {
        className,
        type,
        inputValue,
        onInputValueChange,
        inputRequired,
        inputDisabled,
      } = nullValuesAsUndefined(this.props);

      return (
        <input
          className={className}
          type={type}
          value={inputValue}
          onChange={onInputValueChange}
          required={inputRequired}
          disabled={inputDisabled}
        />
      );
    }
  }

  const Component = makeDynamic<
    TestProps,
    "inputValue" | "onInputValueChange" | "inputRequired" | "inputDisabled",
    string
  >(
    TestClassComponent,
    {
      value: "inputValue",
      onValueChange: "onInputValueChange",
      required: "inputRequired",
      disabled: "inputDisabled",
    },
    (event: React.ChangeEvent<HTMLInputElement>) => event.target.value
  );

  const component = create(
    <Component
      className="test-class"
      type="text"
      value="test value"
      onValueChange={jest.fn()}
      required={true}
      disabled={true}
    />
  );

  expect(component).toMatchInlineSnapshot(`
    <input
      className="test-class"
      disabled={true}
      onChange={[Function]}
      required={true}
      type="text"
      value="test value"
    />
  `);
});

it("creates a component with a sensible display name when the original component is an intrinsic element", () => {
  const Component = makeDynamic<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "required" | "disabled",
    string
  >(
    "input",
    {
      value: "value",
      onValueChange: "onChange",
      required: "required",
      disabled: "disabled",
    },
    (event: React.ChangeEvent<HTMLInputElement>) => event.target.value
  );

  expect(Component.displayName).toEqual("makeDynamic(input)");
});

it("creates a component with a sensible display name when the original component is a function component", () => {
  interface TestProps {
    className: string;
    type: "text";

    inputValue?: string | null;
    onInputValueChange(value: React.ChangeEvent<HTMLInputElement>): void;
    inputRequired: boolean;
    inputDisabled: boolean;
  }

  const TestFunctionComponent: React.FunctionComponent<TestProps> = (
    props: TestProps
  ): JSX.Element => {
    const {
      className,
      type,
      inputValue,
      onInputValueChange,
      inputRequired,
      inputDisabled,
    } = nullValuesAsUndefined(props);

    return (
      <input
        className={className}
        type={type}
        value={inputValue}
        onChange={onInputValueChange}
        required={inputRequired}
        disabled={inputDisabled}
      />
    );
  };

  const Component = makeDynamic<
    TestProps,
    "inputValue" | "onInputValueChange" | "inputRequired" | "inputDisabled",
    string
  >(
    TestFunctionComponent,
    {
      value: "inputValue",
      onValueChange: "onInputValueChange",
      required: "inputRequired",
      disabled: "inputDisabled",
    },
    (event: React.ChangeEvent<HTMLInputElement>) => event.target.value
  );

  expect(Component.displayName).toEqual("makeDynamic(TestFunctionComponent)");
});

it("creates a component with a sensible display name when the original component is a class component", () => {
  interface TestProps {
    className: string;
    type: "text";

    inputValue?: string | null;
    onInputValueChange(value: React.ChangeEvent<HTMLInputElement>): void;
    inputRequired: boolean;
    inputDisabled: boolean;
  }

  class TestClassComponent extends React.Component<TestProps, never, never> {
    render(): JSX.Element {
      const {
        className,
        type,
        inputValue,
        onInputValueChange,
        inputRequired,
        inputDisabled,
      } = nullValuesAsUndefined(this.props);

      return (
        <input
          className={className}
          type={type}
          value={inputValue}
          onChange={onInputValueChange}
          required={inputRequired}
          disabled={inputDisabled}
        />
      );
    }
  }

  const Component = makeDynamic<
    TestProps,
    "inputValue" | "onInputValueChange" | "inputRequired" | "inputDisabled",
    string
  >(
    TestClassComponent,
    {
      value: "inputValue",
      onValueChange: "onInputValueChange",
      required: "inputRequired",
      disabled: "inputDisabled",
    },
    (event: React.ChangeEvent<HTMLInputElement>) => event.target.value
  );

  expect(Component.displayName).toEqual("makeDynamic(TestClassComponent)");
});

it("creates a component with the correct proptypes when the original component is an intrinsic element", () => {
  const Component = makeDynamic<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "required" | "disabled",
    string
  >(
    "input",
    {
      value: "value",
      onValueChange: "onChange",
      required: "required",
      disabled: "disabled",
    },
    (event: React.ChangeEvent<HTMLInputElement>) => event.target.value
  );

  expect(Component.propTypes).toEqual(
    DynamicComponent.controlledPropTypes(PropTypes.any.isRequired)
  );
});

it("creates a component with the correct proptypes when the original component has no proptypes", () => {
  interface TestProps {
    className: string;
    type: "text";

    inputValue?: string | null;
    onInputValueChange(value: React.ChangeEvent<HTMLInputElement>): void;
    inputRequired: boolean;
    inputDisabled: boolean;
  }

  const TestFunctionComponent: React.FunctionComponent<TestProps> = (
    props: TestProps
  ): JSX.Element => {
    const {
      className,
      type,
      inputValue,
      onInputValueChange,
      inputRequired,
      inputDisabled,
    } = nullValuesAsUndefined(props);

    return (
      <input
        className={className}
        type={type}
        value={inputValue}
        onChange={onInputValueChange}
        required={inputRequired}
        disabled={inputDisabled}
      />
    );
  };

  const Component = makeDynamic<
    TestProps,
    "inputValue" | "onInputValueChange" | "inputRequired" | "inputDisabled",
    string
  >(
    TestFunctionComponent,
    {
      value: "inputValue",
      onValueChange: "onInputValueChange",
      required: "inputRequired",
      disabled: "inputDisabled",
    },
    (event: React.ChangeEvent<HTMLInputElement>) => event.target.value
  );

  expect(Component.propTypes).toEqual(
    DynamicComponent.controlledPropTypes(PropTypes.any.isRequired)
  );
});

it("creates a component with the correct proptypes when the original component has proptypes", () => {
  interface TestProps {
    className: string;
    type: "text";

    inputValue?: string | null;
    onInputValueChange(value: React.ChangeEvent<HTMLInputElement>): void;
    inputRequired: boolean;
    inputDisabled: boolean;
  }

  const TestFunctionComponent: React.FunctionComponent<TestProps> = (
    props: TestProps
  ): JSX.Element => {
    const {
      className,
      type,
      inputValue,
      onInputValueChange,
      inputRequired,
      inputDisabled,
    } = nullValuesAsUndefined(props);

    return (
      <input
        className={className}
        type={type}
        value={inputValue}
        onChange={onInputValueChange}
        required={inputRequired}
        disabled={inputDisabled}
      />
    );
  };

  TestFunctionComponent.propTypes = {
    className: PropTypes.string.isRequired,
    type: PropTypes.oneOf<"text">(["text"]).isRequired,
    inputValue: PropTypes.string,
    onInputValueChange: PropTypes.func.isRequired,
    inputRequired: PropTypes.bool.isRequired,
    inputDisabled: PropTypes.bool.isRequired,
  };

  const Component = makeDynamic<
    TestProps,
    "inputValue" | "onInputValueChange" | "inputRequired" | "inputDisabled",
    string
  >(
    TestFunctionComponent,
    {
      value: "inputValue",
      onValueChange: "onInputValueChange",
      required: "inputRequired",
      disabled: "inputDisabled",
    },
    (event: React.ChangeEvent<HTMLInputElement>) => event.target.value
  );

  const consoleErrorSpy = spyOnConsoleError();

  PropTypes.checkPropTypes(
    Component.propTypes,
    {
      className: "class-name",
      type: "text",
      value: "value",
      onValueChange: () => {},
      required: true,
      disabled: true,
    },
    "prop",
    Component.displayName || "unknown"
  );

  expect(consoleErrorSpy).not.toHaveBeenCalled();

  PropTypes.checkPropTypes(
    Component.propTypes,
    {
      className: 0,
      type: "not-text",
      value: 1,
      onValueChange: "on-change",
      required: "required",
      disabled: "disabled",
    },
    "prop",
    Component.displayName || "unknown"
  );

  expect(consoleErrorSpy.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "Warning: Failed prop type: Invalid prop \`className\` of type \`number\` supplied to \`makeDynamic(TestFunctionComponent)\`, expected \`string\`.",
      ],
      Array [
        "Warning: Failed prop type: Invalid prop \`type\` of value \`not-text\` supplied to \`makeDynamic(TestFunctionComponent)\`, expected one of [\\"text\\"].",
      ],
      Array [
        "Warning: Failed prop type: Invalid prop \`value\` of type \`number\` supplied to \`makeDynamic(TestFunctionComponent)\`, expected \`string\`.",
      ],
      Array [
        "Warning: Failed prop type: Invalid prop \`onValueChange\` of type \`string\` supplied to \`makeDynamic(TestFunctionComponent)\`, expected \`function\`.",
      ],
      Array [
        "Warning: Failed prop type: Invalid prop \`required\` of type \`string\` supplied to \`makeDynamic(TestFunctionComponent)\`, expected \`boolean\`.",
      ],
      Array [
        "Warning: Failed prop type: Invalid prop \`disabled\` of type \`string\` supplied to \`makeDynamic(TestFunctionComponent)\`, expected \`boolean\`.",
      ],
    ]
  `);
});
