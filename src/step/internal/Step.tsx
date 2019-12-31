import PropTypes from "prop-types";
import React from "react";

import {
  ComponentDatabaseMap,
  ComponentValue
} from "../../component-wrapper/ComponentDatabaseMap";
import { ComponentWrapper } from "../../component-wrapper/ComponentWrapper";
import { Database, TransactionMode } from "../../database/Database";
import { Store, StoreMap } from "../../database/Store";
import {
  NamedSchema,
  Schema,
  StoreNames,
  StoreValue,
  StoreValueProperties
} from "../../database/types";
import { DatabaseContext } from "../../database-context/DatabaseContext";

import { SubmitType } from "../Submit";

/**
 * The proptypes for {@link Step}.
 */
export interface StepProps<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  /**
   * A context wrapper for a {@link Database} instance.
   *
   * You must provide this if any of your components are instances of
   * {@link DynamicComponent} for them to work as expected.
   */
  context?: DatabaseContext<DBSchema> | null;

  /**
   * An ordered array of wrapped components to display.
   *
   * Create {@link ComponentWrapper|ComponentWrappers} with
   * {@link ComponentWrapper.wrapStatic} or
   * {@link ComponentWrapper.wrapDynamic}.
   */
  componentWrappers: ComponentWrapper<DBSchema, StoreName>[];

  /**
   * A submit button or a similar component to be the main call to action, to
   * persist the data and navigate to the next step.
   *
   * This must implement {@link SubmitProps} to function correctly.
   */
  Submit: SubmitType;

  /**
   * The callback called after the {@link Step} has been submitted, and the
   * {@link Database} transaction has completed.
   *
   * Use this to navigate to the next step, or any other after effects to
   * submission.
   */
  afterSubmit?: (() => void) | null;
}

interface StepState<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  componentValues: {
    [key: string]: "" | ComponentValue<DBSchema, StoreName>;
  };
}

/**
 * A component for rendering a {@link StepDefinition} of a multipage form.
 */
export class Step<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> extends React.Component<
  StepProps<DBSchema, StoreName>,
  StepState<DBSchema, StoreName>,
  never
> {
  static propTypes: PropTypes.ValidationMap<
    StepProps<NamedSchema<string, number, Schema>, StoreNames<Schema>>
  > = {
    context: PropTypes.instanceOf(DatabaseContext),
    componentWrappers: PropTypes.arrayOf(ComponentWrapper.propType.isRequired)
      .isRequired,
    Submit: PropTypes.func.isRequired,
    afterSubmit: PropTypes.func
  };

  state: StepState<DBSchema, StoreName> = {
    componentValues: this.props.componentWrappers.reduce(
      (values, { key, emptyValue }) => ({ ...values, [key]: emptyValue }),
      {} as StepState<DBSchema, StoreName>["componentValues"]
    )
  };

  /**
   * @ignore
   */
  render(): JSX.Element {
    const { context } = this.props;

    if (context) {
      return (
        <context.Consumer>
          {(database): JSX.Element => this.renderComponents(database)}
        </context.Consumer>
      );
    }

    return this.renderComponents();
  }

  private renderComponents(database?: Database<DBSchema>): JSX.Element {
    const { componentWrappers, Submit } = this.props;

    return (
      <>
        {componentWrappers.map(component =>
          this.renderComponent(component, database)
        )}
        <Submit
          key="submit"
          onSubmit={(): Promise<void> => this.handleSubmit(database)}
        />
      </>
    );
  }

  private renderComponent(
    component: ComponentWrapper<DBSchema, StoreName>,
    database?: Database<DBSchema>
  ): void | JSX.Element {
    const { componentValues } = this.state;
    const { key, render, renderWhen } = component;

    if (renderWhen(componentValues)) {
      return render({
        database,
        onChange: value => this.handleChange(key, value)
      });
    }
  }

  private handleChange(
    key: string,
    value: ComponentValue<DBSchema, StoreName>
  ): void {
    this.setState(state => ({
      ...state,
      componentValues: { ...state.componentValues, [key]: value }
    }));
  }

  private async handleSubmit(database?: Database<DBSchema>): Promise<void> {
    const { componentWrappers, afterSubmit } = this.props;

    if (database) {
      const storeNames = componentWrappers
        .map(({ databaseMap }) => databaseMap && databaseMap.storeName)
        .filter(
          (storeName, index, array) =>
            storeName && array.indexOf(storeName) === index
        ) as StoreName[];

      await database.transaction(
        storeNames,
        stores => this.persistValuesToDatabase(stores),
        "readwrite" as TransactionMode
      );
    }

    if (afterSubmit) {
      afterSubmit();
    }
  }

  private async persistValuesToDatabase(
    stores: StoreMap<DBSchema["schema"], StoreName[]>
  ): Promise<void> {
    const { componentWrappers } = this.props;
    const { componentValues } = this.state;

    for (const { key, databaseMap, emptyValue } of componentWrappers) {
      if (databaseMap) {
        const { storeName, property } = databaseMap;

        const store = stores[storeName];
        const value = componentValues[key];

        if (property) {
          await this.persistProperty(store, databaseMap, value, emptyValue);
        } else {
          await this.persistValue(store, databaseMap, value, emptyValue);
        }
      }
    }
  }

  private async persistProperty(
    store: Store<DBSchema["schema"], StoreName[], StoreName>,
    databaseMap: ComponentDatabaseMap<DBSchema, StoreName>,
    propertyValue: "" | ComponentValue<DBSchema, StoreName>,
    emptyValue: "" | ComponentValue<DBSchema, StoreName>
  ): Promise<void> {
    const { key, property } = databaseMap;

    if (!property) {
      await this.persistValue(store, databaseMap, propertyValue, emptyValue);

      return;
    }

    type SValue = StoreValue<DBSchema["schema"], StoreName> & {};
    type ChildValue = StoreValueProperties<
      {
        [K in keyof StoreValueProperties<SValue>]: StoreValueProperties<
          SValue
        >[K];
      }[keyof StoreValueProperties<SValue>]
    >;

    const originalValue = (await store.get(key)) as SValue | undefined;

    if (originalValue === undefined && propertyValue === emptyValue) {
      // We would clear the property value from the store if there was
      // anything to clear, but there isn't, so we do nothing and early exit.
      return;
    }

    const value =
      originalValue === undefined
        ? // Using an empty object means the schema might not be correct, as the
          // store may end up with partial data. There's not much we do to
          // detect or enforce this at runtime, as the schema only exists in
          // type land, but we should consider requiring the user to specify a
          // base value to use in this case as part of setting up the database.
          ({} as SValue)
        : originalValue;

    const propertyKeys = [...property] as typeof property;
    const k0 = propertyKeys[0];

    if (propertyKeys.length > 1) {
      const child = (value[k0] === undefined ? {} : value[k0]) as ChildValue;
      const k1 = propertyKeys[1] as keyof ChildValue;

      if (propertyValue === emptyValue) {
        delete child[k1];
      } else {
        // `propertyValue`'s type includes `""` because that's the default
        // `emptyValue`. If the user has provided a different `emptyValue`,
        // it's not relevant to the real type of `propertyValue`.
        child[
          k1
        ] = (propertyValue as unknown) as ChildValue[keyof StoreValueProperties<
          ChildValue
        >];
      }

      value[k0] = child as SValue[keyof StoreValueProperties<SValue>];
    } else {
      if (propertyValue === emptyValue) {
        delete value[k0];
      } else {
        // `propertyValue`'s type includes `""` because that's the default
        // `emptyValue`. If the user has provided a different `emptyValue`,
        // it's not relevant to the real type of `propertyValue`.
        value[k0] = propertyValue as SValue[keyof StoreValueProperties<SValue>];
      }
    }

    await store.put(key, value);
  }

  private async persistValue(
    store: Store<DBSchema["schema"], StoreName[], StoreName>,
    databaseMap: ComponentDatabaseMap<DBSchema, StoreName>,
    value: "" | ComponentValue<DBSchema, StoreName>,
    emptyValue: "" | ComponentValue<DBSchema, StoreName>
  ): Promise<void> {
    const { key } = databaseMap;

    if (value === emptyValue) {
      await store.delete(key);
    } else {
      // `value`'s type includes `""` because that's the default
      // `emptyValue`. If the user has provided a different `emptyValue`,
      // it's not relevant to the real type of `value`.
      await store.put(key, value as StoreValue<DBSchema["schema"], StoreName>);
    }
  }
}
