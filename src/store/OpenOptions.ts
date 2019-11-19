import { Schema } from "./types";
import { Upgrade } from "./Upgrade";

/**
 * The options to pass to {@link Database.open}.
 */
export interface OpenOptions<S extends Schema> {
  /**
   * A callback called when this database is opening with a newer schema version
   * than the last database to open in this environment.
   *
   * The purpose of this callback is to upgrade the database to match the new
   * version of the schema. Once the transaction created by this callback
   * completes, the opportunity to edit the stores and indexes closes, to make
   * sure not to run _any_ asynchronous code that doesn't modify the
   * transaction, to keep it open. See {@link Upgrade.transaction} for more
   * details.
   *
   * Any exceptions in this callback will raise out of the {@link Database.open}
   * call and cause the database to close itself. In some cases, this can mean
   * the internal database will have performed a partial upgrade and consider
   * itself on the new version, so some care is advised.
   */
  upgrade?(upgrade: Upgrade<S>): void | Promise<void>;

  /**
   * A callback called when this database is blocked from opening by an existing
   * one.
   *
   * This happens when a new database is being opened with a schema version
   * that is newer than the schema version any existing ones are open on.
   *
   * Any exceptions in this callback will raise out of the {@link Database.open}
   * call and cause the database to close itself.
   */
  blocked?(): void | Promise<void>;

  /**
   * A callback called when this database is blocking another from opening.
   *
   * This happens when a new database is being opened with a schema version
   * that is newer than the schema version this one is running on. The usual
   * resolution is to clean this database up and close it. See
   * {@link OpenOptions.autoCloseOnBlocking} for an automatic way of doing that.
   *
   * Note that all operations in this callback should be synchronous, and close
   * the database, or otherwise resolve the block, before handing control back.
   * This is because the blocked database may give up in the next tick, and
   * cause unexpected behaviour.
   */
  // We can't accept a promise for `blocking` because if it takes multiple
  // ticks to resolve the block, the opening attempt may have already thrown.
  // Forcing users to perform synchronous actions makes that case less likely.
  blocking?(): void;

  /**
   * A flag for whether or not to automically close a database connection when
   * it blocks another from opening.
   *
   * If true, automatically call {@link Database.close} when this database is
   * blocking another database from opening.
   *
   * In this case, the database will close itself after the `blocking` callback
   * (if one exists) has been run. It will close even if `blocking` throws an
   * exception, ensuring the database stops blocking other versions from
   * opening, regardless of whether it can tidy itself up cleanly.
   *
   * Otherwise, the `blocking` callback should close the database for itself, if
   * appropriate.
   *
   * Defaults to `false`.
   */
  autoCloseOnBlocking?: boolean;
}
