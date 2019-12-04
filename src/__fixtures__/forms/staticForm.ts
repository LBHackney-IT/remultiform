import { PageComponentWrapper } from "../../helpers/PageComponentWrapper/PageComponentWrapper";
import { StaticPageComponent } from "../../helpers/PageComponentWrapper/StaticPageComponent";
import { Step } from "../../helpers/Step";

import { SimpleSubmit } from "../components/SimpleSubmit";
import { TestClassComponent } from "../components/TestClassComponent";
import { TestFunctionComponent } from "../components/TestFunctionComponent";

export const staticForm: { steps: Step[] } = {
  steps: [
    {
      slug: "test-step-1",
      nextSlug: "test-step-2",
      Submit: SimpleSubmit,
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
      slug: "test-step-2",
      nextSlug: "test-step-1",
      Submit: SimpleSubmit,
      componentWrappers: [
        PageComponentWrapper.wrapStatic(
          new StaticPageComponent({
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
