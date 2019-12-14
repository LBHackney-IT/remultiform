import { ComponentDatabaseMap } from "../../component-wrapper/ComponentDatabaseMap";
import { ComponentWrapper } from "../../component-wrapper/ComponentWrapper";
import { DynamicComponent } from "../../component-wrapper/DynamicComponent";
import { StaticComponent } from "../../component-wrapper/StaticComponent";
import { NamedSchema } from "../../database/types";
import { StepDefinition } from "../../step/StepDefinition";

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

export const dynamicForm: { steps: StepDefinition[] } = {
  steps: [
    {
      slug: "test-step-1",
      nextSlug: "test-step-2",
      Submit: SimpleSubmit,
      componentWrappers: [
        ComponentWrapper.wrapStatic(
          new StaticComponent({
            key: "test-img",
            Component: "img",
            props: {
              src: "test.png"
            }
          })
        ),
        ComponentWrapper.wrapDynamic(
          new DynamicComponent({
            key: "test-dynamic-component",
            Component: TestDynamicComponent,
            props: {
              content: "test content"
            },
            databaseMap: new ComponentDatabaseMap<
              DynamicFormSchema,
              "testStore"
            >({
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
        ComponentWrapper.wrapStatic(
          new StaticComponent({
            key: "test-img-2",
            Component: "img",
            props: {
              src: "another.png"
            }
          })
        ),
        ComponentWrapper.wrapDynamic(
          new DynamicComponent({
            key: "test-dynamic-component",
            Component: TestDynamicComponent,
            props: {
              content: "more test content"
            },
            databaseMap: new ComponentDatabaseMap<
              DynamicFormSchema,
              "testStore"
            >({
              storeName: "testStore",
              key: 1
            })
          })
        )
      ]
    }
  ]
};
