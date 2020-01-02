import { nullAsUndefined } from "null-as-undefined";
import PropTypes from "prop-types";
import React from "react";

import { Database } from "../../database/Database";
import { NamedSchema, Schema, StoreNames } from "../../database/types";

import { ComponentDatabaseMap, ComponentValue } from "../ComponentDatabaseMap";
import {
  DynamicComponent,
  DynamicComponentControlledProps,
  DynamicComponentType
} from "../DynamicComponent";

/**
 * The proptypes for {@link WrappedComponent}.
 */
export interface WrappedComponentProps<
  Props,
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>,
  Value extends ComponentValue<DBSchema, StoreName>
> {
  /**
   * An open {@link Database}.
   *
   * This is usually provided by a {@link DatabaseContext.Consumer} and is
   * optional to allow waiting for {@link Database.open} to settle.
   */
  database?: Database<DBSchema> | null;

  /**
   * The {@link DynamicComponent} to wrap.
   */
  component: DynamicComponent<
    DynamicComponentType<Props, Value>,
    Props,
    DBSchema,
    StoreName,
    Value
  >;

  onChange?: ((value: Value) => void) | null;
}

interface WrappedComponentState<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>,
  Value extends ComponentValue<DBSchema, StoreName>
> {
  value: Value;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  isFetching: boolean;
}

/**
 * A wrapped {@link DynamicComponent}.
 *
 * This handles interfacing between the
 * {@link DynamicComponentControlledProps} of a component and a
 * {@link Database} instance via a {@link DatabaseContext} and a
 * {@link ComponentDatabaseMap}.
 *
 * This component passes {@link DynamicComponentControlledProps.disabled}
 * as `true` when waiting for {@link Database} operations to settle. The
 * wrapped component should disable functionality appropriately to ensure data
 * doesn't get out of sync.
 */
export class WrappedComponent<
  Props,
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>,
  Value extends ComponentValue<DBSchema, StoreName>
> extends React.Component<
  WrappedComponentProps<Props, DBSchema, StoreName, Value>,
  WrappedComponentState<DBSchema, StoreName, Value>,
  never
> {
  static propTypes: PropTypes.ValidationMap<
    WrappedComponentProps<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      NamedSchema<string, number, any>,
      string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ComponentValue<NamedSchema<string, number, any>, string>
    >
  > = {
    database: PropTypes.instanceOf(Database),
    component: DynamicComponent.propType.isRequired,
    onChange: PropTypes.func
  };

  /**
   * @ignore
   */
  state: WrappedComponentState<DBSchema, StoreName, Value> = {
    value: this.props.component.emptyValue,
    isFetching: false
  };

  private isUnmounted = false;

  /**
   * @ignore
   */
  async componentDidMount(): Promise<void> {
    this.isUnmounted = false;

    // We do this here rather than in `getDerivedStateFromProps` because
    // it's asynchronous, and `getDerivedStateFromProps` is expected to
    // immediately return the new state.
    await this.fetchValue();
  }

  /**
   * @ignore
   */
  async componentDidUpdate(
    prevProps: Readonly<
      WrappedComponentProps<Props, DBSchema, StoreName, Value>
    >
  ): Promise<void> {
    // We only want to load from the database if it has just opened. We
    // shouldn't be changing the underlying database while this is mounted, but
    // we don't enforce that.
    if (prevProps.database !== this.props.database) {
      // We do this here rather than in `getDerivedStateFromProps` because
      // it's asynchronous, and `getDerivedStateFromProps` is expected to
      // immediately return the new state.
      await this.fetchValue();
    }
  }

  /**
   * @ignore
   */
  render(): JSX.Element {
    const { component } = this.props;
    const { error } = this.state;

    if (error) {
      console.error(error);

      // We should make this customizable.
      return <div>Something went wrong!</div>;
    }

    const { database } = this.props;
    const { value, isFetching } = this.state;
    const { key, Component, props } = component;

    const controlledProps: DynamicComponentControlledProps<Value> = {
      value,
      onValueChange: this.onValueChange.bind(this),
      disabled: !database || isFetching
    };

    return <Component key={key} {...props} {...controlledProps} />;
  }

  /**
   * @ignore
   */
  componentWillUnmount(): void {
    this.isUnmounted = true;
  }

  private async fetchValue(): Promise<void> {
    if (this.isUnmounted) {
      return;
    }

    const {
      database,
      component: { databaseMap, defaultValue, emptyValue }
    } = this.props;

    if (!database || !databaseMap) {
      return;
    }

    this.setState(state => ({ ...state, isFetching: true }));

    const stateUpdate: Partial<WrappedComponentState<
      DBSchema,
      StoreName,
      Value
    >> = {
      isFetching: false
    };

    try {
      stateUpdate.value = await this.fetchDeepValue(database, databaseMap);

      if (stateUpdate.value === undefined) {
        stateUpdate.value = nullAsUndefined(defaultValue);
      }

      if (stateUpdate.value === undefined) {
        // We need to do this to keep the component as a controlled component.
        // The controlled prop must always be defined.
        stateUpdate.value = emptyValue;
      }

      if (stateUpdate.value !== this.state.value) {
        this.onValueChange(stateUpdate.value);
      }

      // Clear the error if it was set.
      stateUpdate.error = undefined;
    } catch (err) {
      stateUpdate.error = err;
    }

    if (this.isUnmounted) {
      return;
    }

    this.setState(state => ({ ...state, ...stateUpdate }));
  }

  private onValueChange(value: Value): void {
    if (this.isUnmounted) {
      return;
    }

    const { onChange } = this.props;

    if (onChange) {
      onChange(value);
    }

    this.setState(state => ({ ...state, value }));
  }

  private async fetchDeepValue(
    database: Database<DBSchema>,
    databaseMap: ComponentDatabaseMap<DBSchema, StoreName>
  ): Promise<Value | undefined> {
    const { storeName, key, property } = databaseMap;

    const storedValue = await database.get(storeName, key);

    if (storedValue === undefined) {
      return undefined;
    }

    let value = storedValue as Value;

    if (property) {
      const propertyKeys = [...property] as typeof property;

      while (propertyKeys.length > 0 && value !== undefined) {
        const k = propertyKeys.shift() as keyof Value;

        value = (value[k] as unknown) as Value;
      }
    }

    return value;
  }
}
