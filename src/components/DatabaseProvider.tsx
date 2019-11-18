import PropTypes from "prop-types";
import React from "react";

import { DatabaseContext } from "../helpers/DatabaseContext";

import { Database } from "../store/Database";
import { NamedSchema, Schema } from "../store/types";

/**
 * The proptypes for {@link DatabaseProvider}.
 */
export interface DatabaseProviderProps<
  DB extends Database<NamedSchema<string, Schema>>
> {
  /**
   * An open {@link Database} or a promise that will resolve to an one.
   *
   * Normally, you would want to pass the return value of {@link Database.open}
   * in here directly.
   */
  openDatabaseOrPromise: DB | Promise<DB>;

  context: DatabaseContext<DB>;

  /**
   * Child components of this provider.
   *
   * Anything that needs a {@link Database} to function should be contained
   * withing this subtree.
   */
  children: React.ReactNode;
}

interface DatabaseProviderState<
  DB extends Database<NamedSchema<string, Schema>>
> {
  database?: DB;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
}

/**
 * A React context provider for a {@link Database}.
 *
 * This will wait for the database to finish opening on mount. Until
 * {@link DatabaseProviderProps.openDatabaseOrPromise} settles, the
 * {@link DatabaseContext} will store `undefined`, the default value.
 */
export class DatabaseProvider<
  DB extends Database<NamedSchema<string, Schema>>
> extends React.Component<
  DatabaseProviderProps<DB>,
  DatabaseProviderState<DB>,
  never
> {
  static propTypes: PropTypes.ValidationMap<
    DatabaseProviderProps<Database<NamedSchema<string, Schema>>>
  > = {
    openDatabaseOrPromise: PropTypes.oneOfType([
      PropTypes.instanceOf(Database).isRequired,
      PropTypes.instanceOf<Promise<Database<NamedSchema<string, Schema>>>>(
        Promise
      ).isRequired
    ]).isRequired,

    context: PropTypes.instanceOf(DatabaseContext).isRequired,
    children: PropTypes.node.isRequired
  };

  /**
   * @ignore
   */
  state: DatabaseProviderState<DB> = {};

  private isUnmounted = true;

  /**
   * @ignore
   */
  async componentDidMount(): Promise<void> {
    this.isUnmounted = false;

    const { openDatabaseOrPromise } = this.props;

    const stateUpdate: Partial<DatabaseProviderState<DB>> = {};

    try {
      const database = await openDatabaseOrPromise;

      stateUpdate.database = database;
    } catch (error) {
      stateUpdate.error = error;
    }

    if (this.isUnmounted) {
      return;
    }

    this.setState(state => ({ ...state, ...stateUpdate }));
  }

  /**
   * @ignore
   */
  componentDidUpdate(): void {
    const { error } = this.state;

    if (error) {
      throw error;
    }
  }

  /**
   * @ignore
   */
  render(): JSX.Element {
    const { context, children } = this.props;
    const { database } = this.state;

    return (
      <context.context.Provider value={database}>
        {children}
      </context.context.Provider>
    );
  }

  /**
   * @ignore
   */
  componentWillUnmount(): void {
    this.isUnmounted = true;

    const { error } = this.state;

    if (error) {
      return;
    }

    throw new Error(
      "Unmounting a DatabaseProvider outside of an error is unsupported"
    );
  }
}
