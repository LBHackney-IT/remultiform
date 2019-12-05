import PropTypes from "prop-types";
import React from "react";

import { PageComponentWrapper } from "../helpers/PageComponentWrapper/PageComponentWrapper";
import { DatabaseContext } from "../helpers/DatabaseContext";

import { Database } from "../store/Database";
import {
  NamedSchema,
  Schema,
  StoreMap,
  StoreNames,
  StoreValue
} from "../store/types";

import { SubmitType } from "./Submit";

/**
 * The proptypes for {@link Page}.
 */
export interface PageProps<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  /**
   * A context wrapper for a {@link Database} instance.
   *
   * You must provide this if any of your components are instances of
   * {@link DynamicPageComponent} for them to work as expected.
   */
  context?: DatabaseContext<DBSchema> | null;

  /**
   * An ordered array of wrapped components to display on the page.
   *
   * Create {@link PageComponentWrapper|PageComponentWrappers} with
   * {@link PageComponentWrapper.wrapStatic} or
   * {@link PageComponentWrapper.wrapDynamic}.
   */
  componentWrappers: PageComponentWrapper<DBSchema, StoreName>[];

  /**
   * A submit button or a similar component to be the main call to action on
   * the page, to persist the data on the page and navigate to the next step.
   *
   * This must implement {@link SubmitProps} to function correctly.
   */
  Submit: SubmitType;

  /**
   * The callback called after the {@link Page} has been submitted, and the
   * {@link Database} transaction has completed.
   *
   * Use this to navigate to the next step, or any other after effects to
   * submission.
   */
  afterSubmit?: (() => void) | null;
}

interface PageState<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  wrapperValues: {
    [key: string]: "" | StoreValue<DBSchema["schema"], StoreName>;
  };
}

/**
 * A component for rendering a page of a multipage form.
 */
export class Page<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> extends React.Component<
  PageProps<DBSchema, StoreName>,
  PageState<DBSchema, StoreName>,
  never
> {
  static propTypes: PropTypes.ValidationMap<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PageProps<NamedSchema<string, number, any>, string>
  > = {
    context: PropTypes.instanceOf(DatabaseContext),
    componentWrappers: PropTypes.arrayOf(
      PageComponentWrapper.propType.isRequired
    ).isRequired,
    Submit: PropTypes.func.isRequired,
    afterSubmit: PropTypes.func
  };

  state: PageState<DBSchema, StoreName> = {
    wrapperValues: this.props.componentWrappers.reduce(
      (values, { key, emptyValue }) => ({ ...values, [key]: emptyValue }),
      {} as PageState<DBSchema, StoreName>["wrapperValues"]
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
