import PropTypes from "prop-types";
import React from "react";

import { ComponentWrapper } from "../../component-wrapper/ComponentWrapper";
import { Database } from "../../database/Database";
import {
  NamedSchema,
  Schema,
  StoreMap,
  StoreNames,
  StoreValue
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
  wrapperValues: {
    [key: string]: "" | StoreValue<DBSchema["schema"], StoreName>;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    StepProps<NamedSchema<string, number, any>, string>
  > = {
    context: PropTypes.instanceOf(DatabaseContext),
    componentWrappers: PropTypes.arrayOf(ComponentWrapper.propType.isRequired)
      .isRequired,
    Submit: PropTypes.func.isRequired,
    afterSubmit: PropTypes.func
  };

  state: StepState<DBSchema, StoreName> = {
    wrapperValues: this.props.componentWrappers.reduce(
      (values, { key, emptyValue }) => ({ ...values, [key]: emptyValue }),
      {} as StepState<DBSchema, StoreName>["wrapperValues"]
    )
  };

  /**
   * @ignore
   */
  render(): JSX.Element {
    const { context, componentWrappers, Submit } = this.props;

    if (context) {
      return (
        <context.Consumer>
          {(database): JSX.Element[] => [
            ...componentWrappers.map(({ key, render }) =>
              render({
                database,
                onChange: value => this.handleChange(key, value)
              })
            ),
            <Submit
              key="submit"
              onSubmit={(): Promise<void> => this.handleSubmit(database)}
            />
          ]}
        </context.Consumer>
      );
    }

    return (
      <>
        {componentWrappers.map(({ key, render }) =>
          render({
            onChange: value => this.handleChange(key, value)
          })
        )}
        <Submit
          key="submit"
          onSubmit={(): Promise<void> => this.handleSubmit()}
        />
      </>
    );
  }

  private handleChange(
    key: string,
    value: StoreValue<DBSchema["schema"], StoreName>
  ): void {
    this.setState(state => ({
      ...state,
      wrapperValues: { ...state.wrapperValues, [key]: value }
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

      await database.transaction(storeNames, stores =>
        this.persistValuesToDatabase(stores)
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
    const { wrapperValues } = this.state;

    for (const { key, databaseMap, emptyValue } of componentWrappers) {
      if (databaseMap) {
        const { storeName, key: storeKey } = databaseMap;

        const store = stores[storeName];
        const value = wrapperValues[key];

        if (value === emptyValue) {
          await store.delete(storeKey);
        } else {
          // `value`'s type includes `""` because that's the default
          // `emptyValue`. If the user has provided a different `emptyValue`,
          // it's not relevant to the real type of `value`.
          await store.put(
            value as StoreValue<DBSchema["schema"], StoreName>,
            storeKey
          );
        }
      }
    }
  }
}
