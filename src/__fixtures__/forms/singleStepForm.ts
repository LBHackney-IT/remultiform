import { Step } from "../../components/Orchestrator";

import { PageComponentWrapper } from "../../helpers/PageComponentWrapper";

import { TestClassComponent } from "../components/TestClassComponent";
import { TestFunctionComponent } from "../components/TestFunctionComponent";

export const singleStepForm: { steps: Step[] } = {
  steps: [
    {
      key: "test-step",
      componentWrappers: [
        PageComponentWrapper.wrap({
          key: "test-div",
          Component: "div",
          props: {}
        }),
        PageComponentWrapper.wrap({
          key: "test-img",
          Component: "img",
          props: {
            src: "test.png"
          }
        }),
        PageComponentWrapper.wrap({
          key: "test-class",
          Component: TestClassComponent,
          props: {
            content: "test class content"
          }
        }),
        PageComponentWrapper.wrap({
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
