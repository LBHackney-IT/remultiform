import {
  IDBPDatabase,
  IDBPObjectStore,
  OpenDBCallbacks,
  StoreKey,
  StoreNames,
  StoreValue,
  openDB,
  unwrap
} from "idb";

export { StoreKey, StoreNames, StoreValue };

export interface StoreSchema {
  key: IDBValidKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  indexes?: { [indexName: string]: IDBValidKey };
}

export interface Schema {
  [storeName: string]: StoreSchema;
}

export interface NamedSchema<N extends string, S extends Schema> {
  dbNames: N;
  schema: S;
}

export type Store<
  S extends Schema,
  N extends StoreNames<S> = StoreNames<S>,
  Ns extends StoreNames<S>[] = StoreNames<S>[]
> = IDBPObjectStore<S, Ns, N>;

export const enum TransactionMode {
  ReadOnly = "readonly",
  ReadWrite = "readwrite"
}

export type OpenCallbacks<S extends Schema> = OpenDBCallbacks<S>;

export class Database<
  NS extends NamedSchema<N, S>,
  // We don't expect to ever override these defaults. They're here to enable
  // `NS` to extend a generic.
  N extends string = NS["dbNames"],
  S extends Schema = NS["schema"]
> {
  static async open<
    NS extends NamedSchema<N, S>,
    // We don't expect to ever override these defaults. They're here to enable
    // `NS` to extend a generic.
    N extends string = NS["dbNames"],
    S extends Schema = NS["schema"]
  >(
    name: N,
    version = 1,
    { upgrade, blocked, blocking }: OpenCallbacks<S> = {}
  ): Promise<Database<NS, N>> {
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
          upgrade(...args) {
            if (upgrade) {
              // If this callback is allowed to throw, it prevents the
              // `openDB` promise from ever settling, essentially blocking all
              // future attempts to open the database. We wrap the `openDB`
              // promise in one of our own, so we can catch any exceptions, and
              // lift them up to the user, without swallowing them or blocking
              // the database.
              try {
                upgrade(...args);
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
                blocked();
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
          // We don't wrap `blocking` as it can only occur after the database
          // has been opened, so it doesn't make sense to let it reject this
          // promise.
          blocking
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

    return new Database(db);
  }

  private readonly db: IDBPDatabase<S>;

  private constructor(db: IDBPDatabase<S>) {
    this.db = db;
  }

  async put<N extends StoreNames<S>>(
    storeName: N,
    key: StoreKey<S, N>,
    value: StoreValue<S, N>
  ): Promise<void> {
    await this.db.put(storeName, value, key);
  }

  async get<N extends StoreNames<S>>(
    storeName: N,
    key: StoreKey<S, N>
  ): Promise<StoreValue<S, N> | void> {
    const value = await this.db.get(storeName, key);

    if (value !== undefined) {
      return value;
    }
  }

  async transaction<N extends StoreNames<S>>(
    storeName: N,
    tx: (store: Store<S, N>) => Promise<void>,
    mode: TransactionMode = TransactionMode.ReadOnly
  ): Promise<void> {
    const transaction = this.db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    await tx(store);

    await transaction.done;
  }

  // It would be better if this waited for the connection to close, but
  // `fake-indexeddb` doesn't support the `close` event we need, making it
  // difficult to implement and difficult to test.
  close(): void {
    this.db.close();
  }
}
