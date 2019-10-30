import PropTypes, { ValidationMap } from "prop-types";
import React, { FunctionComponent, ImgHTMLAttributes } from "react";
import renderer from "react-test-renderer";

import Page, { PageComponent, PageComponents } from "./Page";

interface TestProps {
  content: string;
}

class TestClassComponent extends React.Component<TestProps> {
  static propTypes: ValidationMap<TestProps> = {
    content: PropTypes.string.isRequired
  };

  render(): JSX.Element {
    const { content } = this.props;

    return <div>{content}</div>;
  }
}

const TestFunctionComponent: FunctionComponent<TestProps> = ({ content }) => (
  <div>{content}</div>
);

TestFunctionComponent.propTypes = {
  content: PropTypes.string.isRequired
};

it("renders correctly with all props", () => {
  const component = renderer.create(
    <Page
      components={
        [
          {
            id: "test-div",
            Component: "div"
          } as PageComponent,
          {
            id: "test-img",
            Component: "img",
            props: {
              src: "test.png"
            }
          } as PageComponent<ImgHTMLAttributes<HTMLImageElement>>,
          {
            id: "test-class",
            Component: TestClassComponent,
            props: {
              content: "test class content"
            }
          } as PageComponent<TestProps>,
          {
            id: "test-function",
            Component: TestFunctionComponent,
            props: {
              content: "test function content"
            }
          } as PageComponent<TestProps>
        ] as PageComponents<
          {} | ImgHTMLAttributes<HTMLImageElement> | TestProps
        >
      }
    />
  );

  expect(component).toMatchSnapshot();
});
