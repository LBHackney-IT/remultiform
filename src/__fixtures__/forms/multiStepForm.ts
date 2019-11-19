import { Step } from "../../components/Orchestrator";
import { wrapPageComponent } from "../../helpers/PageComponentWrapper";

import { TestClassComponent } from "../components/TestClassComponent";
import { TestFunctionComponent } from "../components/TestFunctionComponent";

export const multiStepForm: { steps: Step[] } = {
  steps: [
    {
      key: "test-step-1",
      componentWrappers: [
        wrapPageComponent({
          key: "test-div",
          Component: "div",
          props: {}
        }),
        wrapPageComponent({
          key: "test-class",
          Component: TestClassComponent,
          props: {
            content: "test class content"
          }
        })
      ]
    },
    {
      key: "test-step-2",
      componentWrappers: [
        wrapPageComponent({
          key: "test-img",
          Component: "img",
          props: {
            src: "test.png"
          }
        }),
        wrapPageComponent({
          key: "test-function",
          Component: TestFunctionComponent,
          props: {
            content: "test function content"
          }
        })
      ]
    }
  ]
};
