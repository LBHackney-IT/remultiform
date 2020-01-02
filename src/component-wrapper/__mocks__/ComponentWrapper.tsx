import React from "react";

import { Database } from "../../database/Database";
import { NamedSchema, Schema, StoreNames } from "../../database/types";

import { ComponentDatabaseMap, ComponentValue } from "../ComponentDatabaseMap";
import { DynamicComponentType, DynamicComponent } from "../DynamicComponent";
import { StaticComponent } from "../StaticComponent";

const { ComponentWrapper: ActualComponentWrapper } = jest.requireActual(
  "../ComponentWrapper"
);

export { ActualComponentWrapper };

export interface ComponentWrapperRenderProps<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  database?: Database<DBSchema>;
  onChange(value: ComponentValue<DBSchema, StoreName>): void;
}

export class ComponentWrapper<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> extends ActualComponentWrapper<DBSchema, StoreName> {
  static wrapStatic<DBSchema extends NamedSchema<string, number, Schema>>(
    component: StaticComponent<React.ElementType, DBSchema>
  ): ComponentWrapper<DBSchema, StoreNames<DBSchema["schema"]>> {
    const { key, Component, renderWhen } = component;

    return new ComponentWrapper(
      key,
      () => (
        <div key={key} data-testid={key}>
          Wrapped{" "}
          {typeof Component === "string"
            ? Component
            : Component.displayName || Component.name}
        </div>
      ),
      renderWhen
    );
  }

  static wrapDynamic<
    Props,
    DBSchema extends NamedSchema<string, number, Schema>,
    StoreName extends StoreNames<DBSchema["schema"]>,
    Value extends ComponentValue<DBSchema, StoreName>
  >(
    component: DynamicComponent<
      DynamicComponentType<Props, Value>,
      Props,
      DBSchema,
      StoreName,
      Value
    >
  ): ComponentWrapper<DBSchema, StoreName> {
    const {
      key,
      Component,
      renderWhen,
      databaseMap,
      defaultValue,
      emptyValue
    } = component;

    return new ComponentWrapper(
      key,
      () => (
        <div key={key} data-testid={key}>
          Wrapped {Component.displayName || Component.name}
        </div>
      ),
      renderWhen,
      databaseMap,
      defaultValue,
      emptyValue
    );
  }

  constructor(
    key: string,
    render: (
      props: ComponentWrapperRenderProps<DBSchema, StoreName>
    ) => JSX.Element,
    renderWhen: (stepValues: {
      [key: string]:
        | ComponentValue<DBSchema, StoreNames<DBSchema["schema"]>>
        | undefined;
    }) => boolean,
    databaseMap?: ComponentDatabaseMap<DBSchema, StoreName>,
    defaultValue?: ComponentValue<DBSchema, StoreName> | null,
    emptyValue?: ComponentValue<DBSchema, StoreName> | null
  ) {
    super(key, render, renderWhen, databaseMap, defaultValue, emptyValue);
  }
}
