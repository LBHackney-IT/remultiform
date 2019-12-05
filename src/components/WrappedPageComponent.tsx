import { nullAsUndefined } from "null-as-undefined";
import PropTypes from "prop-types";
import React from "react";

import {
  DynamicPageComponent,
  DynamicPageComponentControlledProps,
  DynamicPageComponentType
} from "../helpers/PageComponentWrapper/DynamicPageComponent";

import { Database } from "../store/Database";
import { NamedSchema, Schema, StoreValue, StoreNames } from "../store/types";

/**
 * The proptypes for {@link WrappedPageComponent}.
 */
export interface WrappedPageComponentProps<
  Props,
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  /**
   * An open {@link Database}.
   *
   * This is usually provided by a {@link DatabaseContext.Consumer} and is
   * optional to allow waiting for {@link Database.open} to settle.
   */
  database?: Database<DBSchema> | null;

  /**
   * The {@link DynamicPageComponent} to wrap.
   */
  component: DynamicPageComponent<
    DynamicPageComponentType<Props, StoreValue<DBSchema["schema"], StoreName>>,
    Props,
    DBSchema,
    StoreName
  >;

  onChange?:
    | ((value: StoreValue<DBSchema["schema"], StoreName>) => void)
    | null;
}

interface WrappedPageComponentState<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  value?: "" | StoreValue<DBSchema["schema"], StoreName>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  isFetching: boolean;
}

/**
 * A wrapped {@link DynamicPageComponent}.
 *
 * This handles interfacing between the
 * {@link DynamicPageComponentControlledProps} of a component and a
 * {@link Database} instance via a {@link DatabaseContext} and a
 * {@link DatabaseMap}.
 *
 * This component passes {@link DynamicPageComponentControlledProps.disabled}
 * as `true` when waiting for {@link Database} operations to settle. The
 * wrapped component should disable functionality appropriately to ensure data
 * doesn't get out of sync.
 */
export class WrappedPageComponent<
  Props,
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> extends React.Component<
  WrappedPageComponentProps<Props, DBSchema, StoreName>,
  WrappedPageComponentState<DBSchema, StoreName>,
  never
> {
  static propTypes: PropTypes.ValidationMap<
    WrappedPageComponentProps<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any,
      NamedSchema<string, number, Schema>,
      StoreNames<Schema>
    >
  > = {
    database: PropTypes.instanceOf(Database),
    component: DynamicPageComponent.propType.isRequired,
    onChange: PropTypes.func
  };

  /**
   * @ignore
   */
  state: WrappedPageComponentState<DBSchema, StoreName> = {
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
    prevProps: Readonly<WrappedPageComponentProps<Props, DBSchema, StoreName>>
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

    const controlledProps: DynamicPageComponentControlledProps<StoreValue<
      DBSchema["schema"],
      StoreName
    >> = {
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

    const { storeName, key } = databaseMap;

    this.setState(state => ({ ...state, isFetching: true }));

    const stateUpdate: Partial<WrappedPageComponentState<
      DBSchema,
      StoreName
    >> = {
      isFetching: false
    };

    try {
      // If `database.get` resolves to be undefined, this will remove the
      // current `value` from the state, if one is set.
      stateUpdate.value = await database.get(storeName, key);

      if (stateUpdate.value === undefined) {
        stateUpdate.value = nullAsUndefined(defaultValue);
      }

      if (stateUpdate.value === undefined) {
        // We need to do this to keep the component as a controlled component.
        // The controlled prop must always be defined.
        stateUpdate.value = emptyValue;
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

  private onValueChange(
    value: StoreValue<DBSchema["schema"], StoreName>
  ): void {
    if (this.isUnmounted) {
      return;
    }

    const { onChange } = this.props;

    if (onChange) {
      onChange(value);
    }

    this.setState(state => ({ ...state, value }));
  }
}
