import { nullValuesAsUndefined } from "null-as-undefined";
import PropTypes from "prop-types";
import React from "react";
import { create } from "react-test-renderer";

import { spyOnConsoleError } from "../__tests__/helpers/spies";

import { DynamicPageComponent } from "../helpers/PageComponentWrapper/DynamicPageComponent";

import { makeDynamic } from "./makeDynamic";

it("renders correctly for function components", () => {
  interface TestProps {
    className: string;
    type: "text";

    inputValue?: string | null;
    onInputValueChange(value: React.ChangeEvent<HTMLInputElement>): void;
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
      inputDisabled
    } = nullValuesAsUndefined(props);

    return (
      <input
        className={className}
        type={type}
        value={inputValue}
        onChange={onInputValueChange}
        disabled={inputDisabled}
      />
    );
  };

  const Component = makeDynamic<
    TestProps,
    "inputValue" | "onInputValueChange" | "inputDisabled",
    string
  >(
    TestFunctionComponent,
    {
      value: "inputValue",
      onValueChange: "onInputValueChange",
      disabled: "inputDisabled"
    },
    (event: React.ChangeEvent<HTMLInputElement>) => event.target.value
  );

  const component = create(
    <Component
      className="test-class"
      type="text"
      value="test value"
      onValueChange={jest.fn()}
      disabled={true}
    />
  );

  expect(component).toMatchSnapshot();
});

it("renders correctly for class components", () => {
  interface TestProps {
    className: string;
    type: "text";

    inputValue?: string | null;
    onInputValueChange(value: React.ChangeEvent<HTMLInputElement>): void;
    inputDisabled: boolean;
  }

  class TestClassComponent extends React.Component<TestProps, never, never> {
    render(): JSX.Element {
      const {
        className,
        type,
        inputValue,
        onInputValueChange,
        inputDisabled
      } = nullValuesAsUndefined(this.props);

      return (
        <input
          className={className}
          type={type}
          value={inputValue}
          onChange={onInputValueChange}
          disabled={inputDisabled}
        />
      );
    }
  }

  const Component = makeDynamic<
    TestProps,
    "inputValue" | "onInputValueChange" | "inputDisabled",
    string
  >(
    TestClassComponent,
    {
      value: "inputValue",
      onValueChange: "onInputValueChange",
      disabled: "inputDisabled"
    },
    (event: React.ChangeEvent<HTMLInputElement>) => event.target.value
  );

  const component = create(
    <Component
      className="test-class"
      type="text"
      value="test value"
      onValueChange={jest.fn()}
      disabled={true}
    />
  );

  expect(component).toMatchSnapshot();
});

it("creates a component with a sensible display name when the original component is an intrinsic element", () => {
  const Component = makeDynamic<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "disabled",
    string
  >(
    "input",
    {
      value: "value",
      onValueChange: "onChange",
      disabled: "disabled"
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
      inputDisabled
    } = nullValuesAsUndefined(props);

    return (
      <input
        className={className}
        type={type}
        value={inputValue}
        onChange={onInputValueChange}
        disabled={inputDisabled}
      />
    );
  };

  const Component = makeDynamic<
    TestProps,
    "inputValue" | "onInputValueChange" | "inputDisabled",
    string
  >(
    TestFunctionComponent,
    {
      value: "inputValue",
      onValueChange: "onInputValueChange",
      disabled: "inputDisabled"
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
    inputDisabled: boolean;
  }

  class TestClassComponent extends React.Component<TestProps, never, never> {
    render(): JSX.Element {
      const {
        className,
        type,
        inputValue,
        onInputValueChange,
        inputDisabled
      } = nullValuesAsUndefined(this.props);

      return (
        <input
          className={className}
          type={type}
          value={inputValue}
          onChange={onInputValueChange}
          disabled={inputDisabled}
        />
      );
    }
  }

  const Component = makeDynamic<
    TestProps,
    "inputValue" | "onInputValueChange" | "inputDisabled",
    string
  >(
    TestClassComponent,
    {
      value: "inputValue",
      onValueChange: "onInputValueChange",
      disabled: "inputDisabled"
    },
    (event: React.ChangeEvent<HTMLInputElement>) => event.target.value
  );

  expect(Component.displayName).toEqual("makeDynamic(TestClassComponent)");
});

it("creates a component with the correct proptypes when the original component is an intrinsic element", () => {
  const Component = makeDynamic<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "disabled",
    string
  >(
    "input",
    {
      value: "value",
      onValueChange: "onChange",
      disabled: "disabled"
    },
    (event: React.ChangeEvent<HTMLInputElement>) => event.target.value
  );

  expect(Component.propTypes).toEqual(
    DynamicPageComponent.controlledPropTypes(PropTypes.any)
  );
});

it("creates a component with the correct proptypes when the original component has no proptypes", () => {
  interface TestProps {
    className: string;
    type: "text";

    inputValue?: string | null;
    onInputValueChange(value: React.ChangeEvent<HTMLInputElement>): void;
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
      inputDisabled
    } = nullValuesAsUndefined(props);

    return (
      <input
        className={className}
        type={type}
        value={inputValue}
        onChange={onInputValueChange}
        disabled={inputDisabled}
      />
    );
  };

  const Component = makeDynamic<
    TestProps,
    "inputValue" | "onInputValueChange" | "inputDisabled",
    string
  >(
    TestFunctionComponent,
    {
      value: "inputValue",
      onValueChange: "onInputValueChange",
      disabled: "inputDisabled"
    },
    (event: React.ChangeEvent<HTMLInputElement>) => event.target.value
  );

  expect(Component.propTypes).toEqual(
    DynamicPageComponent.controlledPropTypes(PropTypes.any)
  );
});

it("creates a component with the correct proptypes when the original component has proptypes", () => {
  interface TestProps {
    className: string;
    type: "text";

    inputValue?: string | null;
    onInputValueChange(value: React.ChangeEvent<HTMLInputElement>): void;
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
      inputDisabled
    } = nullValuesAsUndefined(props);

    return (
      <input
        className={className}
        type={type}
        value={inputValue}
        onChange={onInputValueChange}
        disabled={inputDisabled}
      />
    );
  };

  TestFunctionComponent.propTypes = {
    className: PropTypes.string.isRequired,
    type: PropTypes.oneOf<"text">(["text"]).isRequired,
    inputValue: PropTypes.string,
    onInputValueChange: PropTypes.func.isRequired,
    inputDisabled: PropTypes.bool.isRequired
  };

  const Component = makeDynamic<
    TestProps,
    "inputValue" | "onInputValueChange" | "inputDisabled",
    string
  >(
    TestFunctionComponent,
    {
      value: "inputValue",
      onValueChange: "onInputValueChange",
      disabled: "inputDisabled"
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
      disabled: true
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
      disabled: "disabled"
    },
    "prop",
    Component.displayName || "unknown"
  );

  expect(consoleErrorSpy.mock.calls).toMatchSnapshot();
});
