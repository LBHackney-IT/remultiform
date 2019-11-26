import { Step } from "../../components/Orchestrator";

import { PageComponentWrapper } from "../../helpers/PageComponentWrapper/PageComponentWrapper";
import { StaticPageComponent } from "../../helpers/PageComponentWrapper/StaticPageComponent";

import { TestClassComponent } from "../components/TestClassComponent";
import { TestFunctionComponent } from "../components/TestFunctionComponent";

export const multiStepForm: { steps: Step[] } = {
  steps: [
    {
      key: "test-step-1",
      componentWrappers: [
        PageComponentWrapper.wrapStatic(
          new StaticPageComponent({
            key: "test-div",
            Component: "div",
            props: {}
          })
        ),
        PageComponentWrapper.wrapStatic(
          new StaticPageComponent({
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
        PageComponentWrapper.wrapStatic(
          new StaticPageComponent({
            key: "test-img",
            Component: "img",
            props: {
              src: "test.png"
            }
          })
        ),
        PageComponentWrapper.wrapStatic(
          new StaticPageComponent({
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
