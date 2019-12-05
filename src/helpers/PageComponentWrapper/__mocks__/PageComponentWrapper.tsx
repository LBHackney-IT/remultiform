import React from "react";

import { Database } from "../../../store/Database";
import {
  NamedSchema,
  Schema,
  StoreNames,
  StoreValue
} from "../../../store/types";

import { DatabaseMap } from "../DatabaseMap";
import {
  DynamicPageComponentType,
  DynamicPageComponent
} from "../DynamicPageComponent";
import { StaticPageComponent } from "../StaticPageComponent";

const { PageComponentWrapper: ActualPageComponentWrapper } = jest.requireActual(
  "../PageComponentWrapper"
);

export { ActualPageComponentWrapper };

export interface PageComponentWrapperRenderProps<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  database?: Database<DBSchema>;
  onChange(value: StoreValue<DBSchema["schema"], StoreName>): void;
}

export class PageComponentWrapper<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> extends ActualPageComponentWrapper<DBSchema, StoreName> {
  static wrapStatic<Props>(
    component: StaticPageComponent<React.ElementType<Props>, Props>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): PageComponentWrapper<any, string> {
    const { key, Component } = component;

    return new PageComponentWrapper(key, () => (
      <div key={key} data-testid={key}>
        Wrapped{" "}
        {typeof Component === "string"
          ? Component
          : Component.displayName || Component.name}
      </div>
    ));
  }

  static wrapDynamic<
    Props,
    DBSchema extends NamedSchema<string, number, Schema>,
    StoreName extends StoreNames<DBSchema["schema"]>
  >(
    component: DynamicPageComponent<
      DynamicPageComponentType<
        Props,
        StoreValue<DBSchema["schema"], StoreName>
      >,
      Props,
      DBSchema,
      StoreName
    >
  ): PageComponentWrapper<DBSchema, StoreName> {
    const { key, Component, databaseMap, defaultValue, emptyValue } = component;

    return new PageComponentWrapper(
      key,
      () => (
        <div key={key} data-testid={key}>
          Wrapped {Component.displayName || Component.name}
        </div>
      ),
      databaseMap,
      defaultValue,
      emptyValue
    );
  }

  constructor(
    key: string,
    render: (
      props: PageComponentWrapperRenderProps<DBSchema, StoreName>
    ) => JSX.Element,
    databaseMap?: DatabaseMap<DBSchema, StoreName>,
    defaultValue?: StoreValue<DBSchema["schema"], StoreName> | null,
    emptyValue?: "" | StoreValue<DBSchema["schema"], StoreName>
  ) {
    super(key, render, databaseMap, defaultValue, emptyValue);
  }
}
