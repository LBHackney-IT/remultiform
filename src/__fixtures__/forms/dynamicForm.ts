import { DatabaseMap } from "../../helpers/PageComponentWrapper/DatabaseMap";
import { DynamicPageComponent } from "../../helpers/PageComponentWrapper/DynamicPageComponent";
import { PageComponentWrapper } from "../../helpers/PageComponentWrapper/PageComponentWrapper";
import { StaticPageComponent } from "../../helpers/PageComponentWrapper/StaticPageComponent";
import { Step } from "../../helpers/Step";

import { NamedSchema } from "../../store/types";

import { SimpleSubmit } from "../components/SimpleSubmit";
import { TestDynamicComponent } from "../components/TestDynamicComponent";

export type DynamicFormSchema = NamedSchema<
  string,
  number,
  {
    testStore: {
      key: number;
      value: string;
    };
  }
>;

export const dynamicForm: { steps: Step[] } = {
  steps: [
    {
      slug: "test-step-1",
      nextSlug: "test-step-2",
      Submit: SimpleSubmit,
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
        PageComponentWrapper.wrapDynamic(
          new DynamicPageComponent({
            key: "test-dynamic-component",
            Component: TestDynamicComponent,
            props: {
              content: "test content"
            },
            databaseMap: new DatabaseMap<DynamicFormSchema, "testStore">({
              storeName: "testStore",
              key: 0
            })
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
        ),
        PageComponentWrapper.wrapDynamic(
          new DynamicPageComponent({
            key: "test-dynamic-component",
            Component: TestDynamicComponent,
            props: {
              content: "more test content"
            },
            databaseMap: new DatabaseMap<DynamicFormSchema, "testStore">({
              storeName: "testStore",
              key: 1
            })
          })
        )
      ]
    }
  ]
};
