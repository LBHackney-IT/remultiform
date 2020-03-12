import { nullAsUndefined, nullValuesAsUndefined } from "null-as-undefined";
import PropTypes from "prop-types";
import React from "react";
import {
  ComponentDatabaseMap,
  ComponentValue
} from "../../component-wrapper/ComponentDatabaseMap";
import { ComponentWrapper } from "../../component-wrapper/ComponentWrapper";
import { DatabaseContext } from "../../database-context/DatabaseContext";
import { Database } from "../../database/Database";
import { Store, StoreMap } from "../../database/Store";
import {
  NamedSchema,
  PickStoreValueProperties,
  Schema,
  StoreNames,
  StoreValue,
  StoreValuePropertyPath,
  TransactionMode
} from "../../database/types";
import { SubmitType } from "../Submit";

export interface StepProps<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  context?: DatabaseContext<DBSchema> | null;
  componentWrappers: ComponentWrapper<
    DBSchema,
    StoreName,
    ComponentValue<DBSchema, StoreName>
  >[];
  submit?: ((nextSlug?: string) => SubmitType) | null;
  afterSubmit?: (() => void) | null;
  onIncompleteSubmit?: ((keysMissingValues?: string[]) => void) | null;
  nextSlug?:
    | ((stepValues: {
        [key: string]:
          | ComponentValue<DBSchema, StoreNames<DBSchema["schema"]>>
          | undefined;
      }) => string)
    | string
    | null;
  onNextSlugChange?: ((nextSlug?: string) => void) | null;
}

interface StepState<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  componentValues: {
    [key: string]: ComponentValue<DBSchema, StoreName> | undefined;
  };
}

export class Step<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> extends React.Component<
  StepProps<DBSchema, StoreName>,
  StepState<DBSchema, StoreName>,
  never
> {
  static propTypes: PropTypes.ValidationMap<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    StepProps<NamedSchema<string, number, any>, string>
  > = {
    context: PropTypes.instanceOf(DatabaseContext),
    componentWrappers: PropTypes.arrayOf(ComponentWrapper.propType.isRequired)
      .isRequired,
    submit: PropTypes.func,
    afterSubmit: PropTypes.func,
    nextSlug: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.func.isRequired
    ]),
    onNextSlugChange: PropTypes.func
  };

  state: StepState<DBSchema, StoreName> = {
    componentValues: this.props.componentWrappers.reduce(
      (values, { key, emptyValue }) => ({
        ...values,
        [key]: nullAsUndefined(emptyValue)
      }),
      {} as StepState<DBSchema, StoreName>["componentValues"]
    )
  };

  componentDidMount(): void {
    const { componentValues } = this.state;

    this.handleNextSlugChange(componentValues);
  }

  componentDidUpdate(
    _prevProps: StepProps<DBSchema, StoreName>,
    prevState: StepState<DBSchema, StoreName>
  ): void {
    if (
      this.nextSlug(this.state.componentValues) !==
      this.nextSlug(prevState.componentValues)
    ) {
      this.handleNextSlugChange(this.state.componentValues);
    }
  }

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
    const { componentWrappers, submit } = this.props;
    const { componentValues } = this.state;

    const nextSlug = this.nextSlug(componentValues);

    const Submit = submit && submit(nextSlug);

    return (
      <>
        {componentWrappers.map(component =>
          this.renderComponent(component, database)
        )}
        {Submit && (
          <Submit
            key="submit"
            onSubmit={(): Promise<void> => this.handleSubmit(database)}
          />
        )}
      </>
    );
  }

  private renderComponent(
    component: ComponentWrapper<
      DBSchema,
      StoreName,
      ComponentValue<DBSchema, StoreName>
    >,
    database?: Database<DBSchema>
  ): void | JSX.Element {
    const { componentValues } = this.state;
    const { key, render, renderWhen, required } = component;

    if (renderWhen(componentValues)) {
      return render({
        database,
        required:
          typeof required === "boolean" ? required : required(componentValues),
        onChange: value => this.handleChange(key, value)
      });
    }
  }

  private nextSlug(
    componentValues: StepState<DBSchema, StoreName>["componentValues"]
  ): string | undefined {
    const { nextSlug } = nullValuesAsUndefined(this.props);

    return (
      nextSlug &&
      (typeof nextSlug === "string" ? nextSlug : nextSlug(componentValues))
    );
  }

  private handleChange(
    key: string,
    value: ComponentValue<DBSchema, StoreName>
  ): void {
    const { componentValues } = this.state;

    this.setState(state => ({
      ...state,
      componentValues: { ...componentValues, [key]: value }
    }));
  }

  private handleNextSlugChange(
    componentValues: StepState<DBSchema, StoreName>["componentValues"]
  ): void {
    const { onNextSlugChange } = this.props;

    if (onNextSlugChange) {
      onNextSlugChange(this.nextSlug(componentValues));
    }
  }

  private async handleSubmit(database?: Database<DBSchema>): Promise<void> {
    const { componentWrappers, afterSubmit, onIncompleteSubmit } = this.props;
    const { componentValues } = this.state;

    const keysMissingValues = componentWrappers
      .map(({ key, renderWhen, emptyValue, required }) => {
        if (
          renderWhen(componentValues) &&
          required &&
          (required === true || required(componentValues))
        ) {
          return componentValues[key] === undefined ||
            componentValues[key] === emptyValue
            ? key
            : undefined;
        }
      })
      .filter(Boolean) as string[];

    if (keysMissingValues.length > 0) {
      if (onIncompleteSubmit) {
        onIncompleteSubmit(keysMissingValues);
      }

      return;
    }

    if (database) {
      const storeNames = [
        ...componentWrappers.map(({ databaseMap }) => databaseMap?.storeName),
        ...componentWrappers
          .map(({ databaseMap }) => {
            if (!databaseMap) {
              return;
            }

            const k = databaseMap.key;

            if (typeof k === "string" || typeof k === "number") {
              return;
            }

            return (k as {
              storeNames?: StoreNames<DBSchema["schema"]>[] | null;
            }).storeNames;
          })
          .reduce(
            (n, names) => [...n, ...(names || [])],
            [] as StoreNames<DBSchema["schema"]>[]
          )
      ].filter(
        (storeName, index, array) =>
          storeName &&
          // Find unique `storeName`s:
          array.indexOf(storeName) === index
      ) as StoreNames<DBSchema["schema"]>[];

      if (storeNames.length > 0) {
        await database.transaction(
          storeNames,
          stores => this.persistValuesToDatabase(stores),
          TransactionMode.ReadWrite
        );
      }
    }

    if (afterSubmit) {
      afterSubmit();
    }
  }

  private async persistValuesToDatabase(
    stores: StoreMap<DBSchema["schema"], StoreNames<DBSchema["schema"]>[]>
  ): Promise<void> {
    const { componentWrappers } = this.props;
    const { componentValues } = this.state;

    for (const {
      key,
      renderWhen,
      databaseMap,
      emptyValue
    } of componentWrappers) {
      if (!databaseMap) {
        continue;
      }

      const { storeName, property } = databaseMap;

      const store = stores[storeName];

      if (!renderWhen(componentValues)) {
        const { key } = databaseMap;

        const storeKey = typeof key === "function" ? key() : key;

        // Delete data that is currently hidden from the user.
        await store.delete(storeKey);
      }

      if (property) {
        // If `databaseMap` is defined, then `emptyValue` will also be
        // defined.
        const empty = emptyValue as ComponentValue<DBSchema, StoreName>;
        // If `databaseMap` is defined, then the component's value will also
        // be defined.
        const value = componentValues[key] as ComponentValue<
          DBSchema,
          StoreName
        >;

        await this.persistProperty(store, databaseMap, value, empty);
      } else {
        // If `databaseMap` is defined, then `emptyValue` will also be
        // defined.
        const empty = emptyValue as StoreValue<DBSchema["schema"], StoreName>;
        // If `databaseMap` is defined, then the component's value will also
        // be defined.
        const value = componentValues[key] as StoreValue<
          DBSchema["schema"],
          StoreName
        >;

        await this.persistValue(store, databaseMap, value, empty);
      }
    }
  }

  private async persistProperty(
    store: Store<
      DBSchema["schema"],
      StoreNames<DBSchema["schema"]>[],
      StoreName
    >,
    databaseMap: ComponentDatabaseMap<DBSchema, StoreName>,
    propertyValue: ComponentValue<DBSchema, StoreName>,
    emptyValue: ComponentValue<DBSchema, StoreName>
  ): Promise<void> {
    const { key, property } = databaseMap;

    const storeKey = typeof key === "function" ? key() : key;

    if (!property) {
      await this.persistValue(
        store,
        databaseMap,
        propertyValue as StoreValue<DBSchema["schema"], StoreName>,
        emptyValue as StoreValue<DBSchema["schema"], StoreName>
      );

      return;
    }

    const storedValue = await store.get(storeKey);

    if (storedValue === undefined && propertyValue === emptyValue) {
      // We would clear the property value from the store if there was
      // anything to clear, but there isn't, so we do nothing and early exit.
      return;
    }

    const value =
      storedValue === undefined
        ? // Using an empty object means the schema might not be correct, as the
          // store may end up with partial data. There's not much we do to
          // detect or enforce this at runtime, as the schema only exists in
          // type land, but we should consider requiring the user to specify a
          // base value to use in this case as part of setting up the database.
          ({} as StoreValue<DBSchema["schema"], StoreName>)
        : storedValue;

    const propertyKeys = [...property] as StoreValuePropertyPath<
      StoreValue<DBSchema["schema"], StoreName>
    >;

    const k0 = propertyKeys[0];

    if (propertyKeys.length > 1) {
      const child =
        value[k0] === undefined ? ({} as typeof value[typeof k0]) : value[k0];
      const k1 = propertyKeys[1] as keyof PickStoreValueProperties<
        typeof child
      >;

      if (propertyValue === emptyValue) {
        delete child[k1];
      } else {
        child[k1] = propertyValue as typeof child[typeof k1];
      }

      value[k0] = child;
    } else {
      if (propertyValue === emptyValue) {
        delete value[k0];
      } else {
        value[k0] = propertyValue as typeof value[typeof k0];
      }
    }

    await store.put(storeKey, value);
  }

  private async persistValue(
    store: Store<
      DBSchema["schema"],
      StoreNames<DBSchema["schema"]>[],
      StoreName
    >,
    databaseMap: ComponentDatabaseMap<DBSchema, StoreName>,
    value: StoreValue<DBSchema["schema"], StoreName>,
    emptyValue: StoreValue<DBSchema["schema"], StoreName>
  ): Promise<void> {
    const { key } = databaseMap;

    const storeKey = typeof key === "function" ? key() : key;

    if (value === emptyValue) {
      await store.delete(storeKey);
    } else {
      await store.put(storeKey, value);
    }
  }
}
