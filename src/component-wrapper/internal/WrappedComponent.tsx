import { nullAsUndefined } from "null-as-undefined";
import PropTypes from "prop-types";
import React from "react";

import { Database } from "../../database/Database";
import {
  NamedSchema,
  Schema,
  StoreNames,
  StoreValuePropertyPathLevelTwo,
  StoreValuePropertyPathLevelOne
} from "../../database/types";

import { ComponentDatabaseMap, ComponentValue } from "../ComponentDatabaseMap";
import {
  DynamicComponent,
  DynamicComponentControlledProps
} from "../DynamicComponent";

export interface WrappedComponentProps<
  Props extends {},
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>,
  Value extends ComponentValue<DBSchema, StoreName>
> {
  component: DynamicComponent<Props, DBSchema, StoreName, Value>;
  required: boolean;
  onChange?: ((value: Value) => void) | null;
  database?: Database<DBSchema> | null;
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
  Props extends {},
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
      {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      NamedSchema<string, number, any>,
      string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    >
  > = {
    component: DynamicComponent.propType.isRequired,
    required: PropTypes.bool.isRequired,
    onChange: PropTypes.func,
    database: PropTypes.instanceOf(Database)
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

    const { database, required } = this.props;
    const { value, isFetching } = this.state;
    const { key, Component, props } = component;

    const controlledProps: DynamicComponentControlledProps<Value> = {
      value,
      onValueChange: this.onValueChange.bind(this),
      required,
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

    const storeKey = typeof key === "function" ? key() : key;
    const storedValue = await database.get(storeName, storeKey);

    if (storedValue === undefined) {
      return undefined;
    }

    let value = storedValue as ComponentValue<DBSchema, StoreName> | undefined;

    if (property) {
      if (value === undefined) {
        value = {};
      }

      const k = property[0] as StoreValuePropertyPathLevelOne<
        ComponentValue<DBSchema, StoreName>
      >[0];

      value = value[k] as ComponentValue<DBSchema, StoreName>;

      if (property.length > 1) {
        if (value === undefined) {
          value = {};
        }

        const j = property[1] as StoreValuePropertyPathLevelTwo<
          ComponentValue<DBSchema, StoreName>
        >[1];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value = (value as any)[j] as ComponentValue<DBSchema, StoreName>;
      }
    }

    return value as Value | undefined;
  }
}
