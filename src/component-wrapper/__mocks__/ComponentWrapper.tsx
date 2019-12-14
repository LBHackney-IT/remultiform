import React from "react";

import { Database } from "../../database/Database";
import {
  NamedSchema,
  Schema,
  StoreNames,
  StoreValue
} from "../../database/types";

import { ComponentDatabaseMap } from "../ComponentDatabaseMap";
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
  onChange(value: StoreValue<DBSchema["schema"], StoreName>): void;
}

export class ComponentWrapper<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> extends ActualComponentWrapper<DBSchema, StoreName> {
  static wrapStatic<
    Props,
    DBSchema extends NamedSchema<string, number, Schema>
  >(
    component: StaticComponent<React.ElementType<Props>, Props, DBSchema>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): ComponentWrapper<any, string> {
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
    StoreName extends StoreNames<DBSchema["schema"]>
  >(
    component: DynamicComponent<
      DynamicComponentType<Props, StoreValue<DBSchema["schema"], StoreName>>,
      Props,
      DBSchema,
      StoreName
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
        | ""
        | StoreValue<DBSchema["schema"], StoreNames<DBSchema["schema"]>>;
    }) => boolean,
    databaseMap?: ComponentDatabaseMap<DBSchema, StoreName>,
    defaultValue?: StoreValue<DBSchema["schema"], StoreName> | null,
    emptyValue?: "" | StoreValue<DBSchema["schema"], StoreName>
  ) {
    super(key, render, renderWhen, databaseMap, defaultValue, emptyValue);
  }
}
