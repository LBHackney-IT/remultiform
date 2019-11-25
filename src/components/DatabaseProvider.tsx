import PropTypes from "prop-types";
import React from "react";

import { DatabaseContext } from "../helpers/DatabaseContext";

import { Database } from "../store/Database";
import { NamedSchema, Schema } from "../store/types";

/**
 * The proptypes for {@link DatabaseProvider}.
 */
export interface DatabaseProviderProps<
  DBSchema extends NamedSchema<string, number, Schema>
> {
  /**
   * An open {@link Database} or a promise that will resolve to an one.
   *
   * Normally, you would want to pass the return value of {@link Database.open}
   * in here directly.
   */
  openDatabaseOrPromise: Database<DBSchema> | Promise<Database<DBSchema>>;

  context: DatabaseContext<DBSchema>;

  /**
   * Child components of this provider.
   *
   * Anything that needs a {@link Database} to function should be contained
   * withing this subtree. Use {@link useDatabase} with
   * {@link DatabaseProviderProps.context} to access the {@link Database} from
   * within those components.
   */
  children: React.ReactNode;
}

interface DatabaseProviderState<
  DBSchema extends NamedSchema<string, number, Schema>
> {
  database?: Database<DBSchema>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
}

/**
 * A React context provider for a {@link Database}.
 *
 * This will wait for the database to finish opening on mount. Until
 * {@link DatabaseProviderProps.openDatabaseOrPromise} settles, the
 * {@link DatabaseContext} will store `undefined`, the default value.
 *
 * **Important!** You will need to ensure the database closes itself if you ever
 * need to change {@link DatabaseProviderProps.openDatabaseOrPromise}, or if you
 * unmount this component. If either of those things happen, this component
 * will **throw an exception**, (unless unmounting after an error). It is
 * therefore recommended that this component is contained within an error
 * boundary that handles exceptions gracefully, probably calling
 * {@link Database.close}.
 *
 * ```js
 * const DBContext = new DatabaseContext();
 * const databasePromise = Database.open("myDatabaseWithAnError", 1);
 *
 * class Component extends React.Component {
 *   static getDerivedStateFromError(error) {
 *     return { error };
 *   }
 *
 *   state = {};
 *
 *   render() {
 *     const { error } = this.state;
 *
 *     if (error) {
 *       return <span>Something went wrong!</span>
 *     }
 *
 *     return (
 *       <DatabaseProvider
 *         context={DBContext}
 *         openDatabaseOrPromise={databasePromise}
 *       >
 *         <span>Some content that relies on the database.</span>
 *       </DatabaseProvider>
 *   }
 * }
 * ```
 */
export class DatabaseProvider<
  DBSchema extends NamedSchema<string, number, Schema>
> extends React.Component<
  DatabaseProviderProps<DBSchema>,
  DatabaseProviderState<DBSchema>,
  never
> {
  static propTypes: PropTypes.ValidationMap<
    DatabaseProviderProps<NamedSchema<string, number, Schema>>
  > = {
    openDatabaseOrPromise: PropTypes.oneOfType([
      PropTypes.instanceOf(Database).isRequired,
      PropTypes.instanceOf<
        Promise<Database<NamedSchema<string, number, Schema>>>
      >(Promise).isRequired
    ]).isRequired,

    context: PropTypes.instanceOf(DatabaseContext).isRequired,
    children: PropTypes.node.isRequired
  };

  /**
   * @ignore
   */
  state: DatabaseProviderState<DBSchema> = {};

  private isUnmounted = true;

  /**
   * @ignore
   */
  async componentDidMount(): Promise<void> {
    this.isUnmounted = false;

    const { openDatabaseOrPromise } = this.props;

    const stateUpdate: Partial<DatabaseProviderState<DBSchema>> = {};

    try {
      const database = await openDatabaseOrPromise;

      stateUpdate.database = database;
    } catch (err) {
      stateUpdate.error = err;
    }

    if (this.isUnmounted) {
      return;
    }

    this.setState(state => ({ ...state, ...stateUpdate }));
  }

  /**
   * @ignore
   */
  componentDidUpdate(
    prevProps: Readonly<DatabaseProviderProps<DBSchema>>
  ): void {
    const { error } = this.state;

    if (error) {
      throw error;
    }

    const updatedDatabase = (Object.keys(
      prevProps
    ) as (keyof typeof prevProps)[]).some(
      propName =>
        propName === "openDatabaseOrPromise" &&
        prevProps[propName] !== this.props[propName]
    );

    if (updatedDatabase) {
      this.setState({
        error: new Error(
          "Updating the openDatabaseOrPromise prop of a DatabaseProvider is unsupported"
        )
      });
    }
  }

  /**
   * @ignore
   */
  render(): JSX.Element {
    const { openDatabaseOrPromise, context, children } = this.props;
    let { database } = this.state;

    if (!database && openDatabaseOrPromise instanceof Database) {
      database = openDatabaseOrPromise;
    }

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
