import { ComponentWrapper } from "../../component-wrapper/ComponentWrapper";
import { StaticComponent } from "../../component-wrapper/StaticComponent";
import { StepDefinition } from "../../step/StepDefinition";
import { SimpleSubmit } from "../components/SimpleSubmit";

import { TestClassComponent } from "../components/TestClassComponent";
import { TestFunctionComponent } from "../components/TestFunctionComponent";

export const staticForm: { steps: StepDefinition[] } = {
  steps: [
    {
      slug: "test-step-1",
      nextSlug: "test-step-2",
      Submit: SimpleSubmit,
      componentWrappers: [
        ComponentWrapper.wrapStatic(
          new StaticComponent({
            key: "test-div",
            Component: "div",
            props: {}
          })
        ),
        ComponentWrapper.wrapStatic(
          new StaticComponent({
            key: "test-img",
            Component: "img",
            props: {
              src: "test.png"
            }
          })
        ),
        ComponentWrapper.wrapStatic(
          new StaticComponent({
            key: "test-function",
            Component: TestFunctionComponent,
            props: {
              content: "test function content"
            }
          })
        ),
        ComponentWrapper.wrapStatic(
          new StaticComponent({
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
      slug: "test-step-2",
      nextSlug: "test-step-1",
      Submit: SimpleSubmit,
      componentWrappers: [
        ComponentWrapper.wrapStatic(
          new StaticComponent({
            key: "test-img-2",
            Component: "img",
            props: {
              src: "another.png"
            }
          })
        )
      ]
    }
  ]
};