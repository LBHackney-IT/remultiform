import { IDBPDatabase, openDB, unwrap } from "idb";

import { Schema, Transaction } from "../types";
import { Upgrade } from "../Upgrade";

export interface OpenOptions<S extends Schema> {
  upgrade?(upgrade: Upgrade<S>): void | Promise<void>;
  blocked?(): void | Promise<void>;
  // We can't accept a promise for `blocking` because if it takes multiple
  // ticks to resolve the block, the opening attempt may have already thrown.
  // Forcing users to perform synchronous actions makes that case less likely.
  blocking?(): void;
  autoCloseOnBlocking?: boolean;
}

export const wrapOpenDB = async <N extends string, S extends Schema>(
  name: N,
  version: number,
  { upgrade, blocked, blocking, autoCloseOnBlocking = false }: OpenOptions<S>
): Promise<IDBPDatabase<S>> => {
  const db = await new Promise<IDBPDatabase<S>>(
    (resolvePromise, rejectPromise) => {
      let isRejected = false;

      const resolve = ([db]: [IDBPDatabase<S>, void]): void => {
        // Due to the internal implementation details of `idb` and IndexedDB
        // itself, which combine promises and event emitters, in order to
        // reject the wrapper promise if one of the callbacks throws or
        // rejects, we need to catch the exception and not re-throw it. This
        // means the database continues to attempt to open, meaning we may get
        // a resolution even though it should have rejected before the
        // promise has a chance to settle. So if we've received a rejection,
        // we don't also resolve the wrapper promise, so the promise is able
        // settle with a rejection.
        if (isRejected) {
          // If this has been called after we've had a rejection it means this
          // database was opened in error. The user shouldn't receive a
          // resolved promise with that opened database, as something has
          // gone wrong, so they won't be able to close it themselves,
          // potentially blocking any future attempts to open this database.
          // So we close the database by default.
          db.close();
        } else {
          resolvePromise(db);
        }
      };

      const reject = (reason: Error): void => {
        isRejected = true;

        rejectPromise(reason);
      };

      const promiseToOpen = openDB<S>(name, version, {
        upgrade(database, oldVersion, newVersion, transaction) {
          if (upgrade) {
            // If this callback is allowed to throw, it prevents the
            // `openDB` promise from ever settling, essentially blocking all
            // future attempts to open the database. We wrap the `openDB`
            // promise in one of our own, so we can catch any exceptions, and
            // lift them up to the user, without swallowing them or blocking
            // the database.
            try {
              const up = new Upgrade(
                database,
                oldVersion,
                newVersion,
                transaction as Transaction<S>
              );
              const promise = upgrade(up);

              if (promise) {
                promise.catch(reject);
              }
            } catch (err) {
              reject(err);
            }
          }
        },
        blocked() {
          if (blocked) {
            // If this callback is allowed to throw, it prevents the
            // `openDB` promise from ever settling, essentially blocking all
            // future attempts to open the database. We wrap the `openDB`
            // promise in one of our own, so we can catch any exceptions, and
            // lift them up to the user, without swallowing them or blocking
            // the database.
            try {
              const promise = blocked();

              if (promise) {
                promise.catch(reject);
              }
            } catch (err) {
              reject(err);
            }
          } else {
            reject(
              new Error(
                `Opening ${name} is blocked by an existing connection ` +
                  "with a different version"
              )
            );
          }
        },
        // We don't wrap `blocking` in the open promise as it can only occur
        // after the database has been opened, so it doesn't make sense to
        // let it reject that (probably settled) promise.
        blocking() {
          if (blocking) {
            // If we don't catch and surface any errors, they would be
            // silently swallowed in some environments. We also want to be
            // able to automatically close the database regardless of errors.
            try {
              blocking();
            } catch (err) {
              console.error(err);
            }
          }

          if (autoCloseOnBlocking) {
            db.close();
          }
        }
      });

      const requestToOpen = unwrap(promiseToOpen);

      const promiseToSucceed = new Promise<void>((resolve, reject) => {
        requestToOpen.addEventListener("error", () => {
          reject(requestToOpen.error);
        });

        requestToOpen.addEventListener("success", () => {
          resolve();
        });
      });

      Promise.all([promiseToOpen, promiseToSucceed])
        .then(resolve)
        .catch(reject);
    }
  );

  // We don't return the promise directly because we want to include the result
  // in the `blocking` callback by closure.
  return db;
};
