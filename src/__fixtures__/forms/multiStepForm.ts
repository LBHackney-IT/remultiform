import { Step } from "../../components/Orchestrator";

import { PageComponent } from "../../helpers/PageComponent";
import { PageComponentWrapper } from "../../helpers/PageComponentWrapper";

import { TestClassComponent } from "../components/TestClassComponent";
import { TestFunctionComponent } from "../components/TestFunctionComponent";

export const multiStepForm: { steps: Step[] } = {
  steps: [
    {
      key: "test-step-1",
      componentWrappers: [
        PageComponentWrapper.wrap(
          new PageComponent({
            key: "test-div",
            Component: "div",
            props: {}
          })
        ),
        PageComponentWrapper.wrap(
          new PageComponent({
            key: "test-class",
            Component: TestClassComponent,
            props: {
              content: "test class content"
            }
          })
        )
      ]
    },
    {
      key: "test-step-2",
      componentWrappers: [
        PageComponentWrapper.wrap(
          new PageComponent({
            key: "test-img",
            Component: "img",
            props: {
              src: "test.png"
            }
          })
        ),
        PageComponentWrapper.wrap(
          new PageComponent({
            key: "test-function",
            Component: TestFunctionComponent,
            props: {
              content: "test function content"
            }
          })
        )
      ]
    }
  ]
};
