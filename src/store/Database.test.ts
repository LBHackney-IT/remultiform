import { IDBPDatabase, deleteDB } from "idb";

import { expectPromise } from "../__tests__/helpers/expect";

import { Database, NamedSchema, TransactionMode } from "./Database";

const testDBName = "databaseTestDB";
const testStoreName = "testStore";

interface TestSchema extends NamedSchema<typeof testDBName> {
  schema: {
    [testStoreName]: {
      key: string;
      value: {
        a: string;
        b: number;
      };
    };
  };
}

let initialDB: Database<TestSchema>;
let db: Database<TestSchema>;

const createDBWithStore = async (
  version = 1
): Promise<Database<TestSchema>> => {
  return (db = await Database.open<TestSchema>(testDBName, version, {
    upgrade(database) {
      database.createObjectStore(testStoreName);
    }
  }));
};

afterEach(async () => {
  if (initialDB) {
    initialDB.close();
  }

  if (db) {
    db.close();
  }

  await deleteDB(testDBName);
});

describe(".open()", () => {
  it("opens a connection to an IndexedDB database with the provided name and schema version", async () => {
    const version = 5;
    const spy = jest.spyOn(indexedDB, "open");

    db = await Database.open<TestSchema>(testDBName, version);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(testDBName, version);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const internalDB = (db as any).db as IDBPDatabase<TestSchema>;

    expect(internalDB).toBeInstanceOf(IDBDatabase);
    expect(internalDB.name).toEqual(testDBName);
    expect(internalDB.version).toEqual(version);
  });

  it("throws when attempting to reopen a database with an older schema version", async () => {
    const initialVersion = 7;
    const currentVersion = 4;

    initialDB = await Database.open<TestSchema>(testDBName, initialVersion);

    initialDB.close();

    await expectPromise(async () => {
      db = await Database.open<TestSchema>(testDBName, currentVersion);
    }).rejects.toThrow();
  });

  it("returns a database instance when reopening a database with an newer schema version", async () => {
    const initialVersion = 4;
    const currentVersion = 6;

    initialDB = await Database.open<TestSchema>(testDBName, initialVersion);

    initialDB.close();

    db = await Database.open<TestSchema>(testDBName, currentVersion);

    expect(db).toBeInstanceOf(Database);
  });

  it("throws when attempting to open a new connection to an already open database with a newer schema version", async () => {
    const initialVersion = 4;
    const currentVersion = 6;

    initialDB = await Database.open<TestSchema>(testDBName, initialVersion);

    await expectPromise(async () => {
      db = await Database.open<TestSchema>(testDBName, currentVersion);
    }).rejects.toThrowError(
      `Opening ${testDBName} is blocked by an existing connection with a different version`
    );
  });

  it("calls the provided upgrade callback and returns a database instance when the database is new", async () => {
    const version = 5;
    const mock = jest.fn();

    db = await Database.open<TestSchema>(testDBName, version, {
      upgrade(_db, oldVersion, newVersion) {
        mock(oldVersion, newVersion);
      }
    });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(0, version);

    expect(db).toBeInstanceOf(Database);
  });

  it("doesn't call the provided upgrade callback and returns a database instance when the database exists with the same schema version", async () => {
    const version = 5;
    const mock = jest.fn();

    initialDB = await Database.open<TestSchema>(testDBName, version);

    initialDB.close();

    db = await Database.open<TestSchema>(testDBName, version, {
      upgrade(_db, oldVersion, newVersion) {
        mock(oldVersion, newVersion);
      }
    });

    expect(mock).not.toHaveBeenCalled();

    expect(db).toBeInstanceOf(Database);
  });

  it("calls the provided upgrade callback with the correct schema versions and returns a database instance when changing version", async () => {
    const initialVersion = 5;
    const currentVersion = 7;
    const mock = jest.fn();

    initialDB = await Database.open<TestSchema>(testDBName, initialVersion);

    initialDB.close();

    db = await Database.open<TestSchema>(testDBName, currentVersion, {
      upgrade(_db, oldVersion, newVersion) {
        mock(oldVersion, newVersion);
      }
    });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(initialVersion, currentVersion);

    expect(db).toBeInstanceOf(Database);
  });

  it("throws if the provided upgrade callback throws when called", async () => {
    const initialVersion = 5;
    const currentVersion = 7;
    const error = "test error";

    initialDB = await Database.open<TestSchema>(testDBName, initialVersion);

    initialDB.close();

    await expectPromise(async () => {
      db = await Database.open<TestSchema>(testDBName, currentVersion, {
        upgrade() {
          throw new Error(error);
        }
      });
    }).rejects.toThrowError(error);
  });

  it("calls the provided blocked callback and returns a database instance when attempting to reopen a database that's already open with a different schema version and a blocked callback which resolves the block", async () => {
    const initialVersion = 5;
    const currentVersion = 7;
    const mock = jest.fn();

    initialDB = await Database.open<TestSchema>(testDBName, initialVersion);

    db = await Database.open<TestSchema>(testDBName, currentVersion, {
      blocked() {
        mock();

        initialDB.close();
      }
    });

    expect(mock).toHaveBeenCalledTimes(1);

    expect(db).toBeInstanceOf(Database);
  });

  it("throws if the provided blocked callback throws when called", async () => {
    const initialVersion = 5;
    const currentVersion = 7;
    const error = "test error";

    initialDB = await Database.open<TestSchema>(testDBName, initialVersion);

    await expectPromise(async () => {
      db = await Database.open<TestSchema>(testDBName, currentVersion, {
        blocked() {
          throw new Error(error);
        }
      });
    }).rejects.toThrowError(error);
  });

  it("calls the earlier provided blocking callback and returns a database instance when attempting to open a new instance of a database with a later schema version while the old instance has a blocking callback which resolves the block", async () => {
    const initialVersion = 5;
    const currentVersion = 7;
    const mock = jest.fn();

    initialDB = await Database.open<TestSchema>(testDBName, initialVersion, {
      blocking() {
        mock();

        initialDB.close();
      }
    });

    db = await Database.open<TestSchema>(testDBName, currentVersion);

    expect(mock).toHaveBeenCalledTimes(1);

    expect(db).toBeInstanceOf(Database);
  });
});

describe("#put()", () => {
  beforeEach(async () => {
    await createDBWithStore();
  });

  it("stores the value provided against the key provided in the targeted store", async () => {
    const key = "testKey";
    const value = { a: "test", b: 1 };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const internalDB = (db as any).db as IDBPDatabase<TestSchema>;

    await db.put(testStoreName, key, value);

    await expect(internalDB.get(testStoreName, key)).resolves.toEqual(value);
  });

  it("throws when targeting a missing store", async () => {
    const missingStoreName = "missingStore";

    await expect(
      // Cast to get around TypeScript enforcing the type of the store name
      // (not all users will be using TypeScript).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (db as Database<any>).put(missingStoreName, "testKey", {
        a: "test",
        b: 1
      })
    ).rejects.toThrowError(
      `No objectStore named ${missingStoreName} in this database`
    );
  });
});

describe("#get()", () => {
  beforeEach(async () => {
    await createDBWithStore();
  });

  it("returns the value from the targeted store matching the key provided", async () => {
    const key = "testKey";
    const value = { a: "test", b: 1 };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const internalDB = (db as any).db as IDBPDatabase<TestSchema>;

    await internalDB.put(testStoreName, value, key);

    await expect(db.get(testStoreName, key)).resolves.toEqual(value);
  });

  it("returns `undefined` when no data matching the key provided exists in the targeted store", async () => {
    await expect(db.get(testStoreName, "missingKey")).resolves.toBeUndefined();
  });

  it("throws when targeting a missing store", async () => {
    const missingStoreName = "missingStore";

    await expect(
      // Cast to get around TypeScript enforcing the type of the store name
      // (not all users will be using TypeScript).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (db as Database<any>).get(missingStoreName, "testKey")
    ).rejects.toThrowError(
      `No objectStore named ${missingStoreName} in this database`
    );
  });
});

describe("#transaction()", () => {
  beforeEach(async () => {
    await createDBWithStore();
  });

  it("defaults to `TransactionMode.ReadOnly`", async () => {
    const spy = jest.spyOn(IDBDatabase.prototype, "transaction");

    await db.transaction(testStoreName, () => Promise.resolve());

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(testStoreName, TransactionMode.ReadOnly);
  });

  it("throws when targeting a missing store", async () => {
    const missingStoreName = "missingStore";

    await expect(
      // Cast to get around TypeScript enforcing the type of the store name
      // (not all users will be using TypeScript).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (db as Database<any>).transaction(missingStoreName, () =>
        Promise.resolve()
      )
    ).rejects.toThrowError(
      `No objectStore named ${missingStoreName} in this database`
    );
  });

  it("completes the transaction automatically if not performing a database operation on the given store every tick", async () => {
    const key = "testKey";
    const value = { a: "test", b: 1 };

    await db.transaction(
      testStoreName,
      async store => {
        await store.add(value, key);

        await new Promise(resolve => {
          setImmediate(resolve);
        });

        // We haven't awaited `transaction.done` yet, so we haven't explicitly
        // waited for the transaction to complete, so if it's complete, it's
        // because it completed automatically.
        await expect(db.get(testStoreName, key)).resolves.toEqual(value);
      },
      TransactionMode.ReadWrite
    );
  });

  it("throws when attempting to add to the transaction after it has automatically completed", async () => {
    const key = "testKey";
    const value = { a: "test", b: 1 };

    await db.transaction(
      testStoreName,
      async store => {
        await store.add(value, key);

        await new Promise(resolve => {
          setImmediate(resolve);
        });

        await expectPromise(() =>
          store.add({ a: "another", b: 2 }, "anotherKey")
        ).rejects.toThrowError(
          "A request was placed against a transaction which is currently not active, or which is finished"
        );
      },
      TransactionMode.ReadWrite
    );
  });

  describe("with `TransactionMode.ReadOnly`", () => {
    it("allows reading from the store", async () => {
      const key = "testKey";
      const value = { a: "test", b: 1 };

      await db.put(testStoreName, key, value);

      await db.transaction(
        testStoreName,
        async store => {
          await expect(store.get(key)).resolves.toEqual(value);
        },
        TransactionMode.ReadOnly
      );
    });

    it("throws when attempting to write to the store", async () => {
      await db.transaction(
        testStoreName,
        async store => {
          await expectPromise(() =>
            store.add({ a: "test", b: 1 }, "testKey")
          ).rejects.toThrowError(
            'The mutating operation was attempted in a "readonly" transaction'
          );
        },
        TransactionMode.ReadOnly
      );
    });
  });

  describe("with `TransactionMode.ReadWrite`", () => {
    it("allows reading from the store", async () => {
      const key = "testKey";
      const value = { a: "test", b: 1 };

      await db.put(testStoreName, key, value);

      await db.transaction(
        testStoreName,
        async store => {
          await expect(store.get(key)).resolves.toEqual(value);
        },
        TransactionMode.ReadWrite
      );
    });

    it("allows writing to the store", async () => {
      const key = "testKey";

      await db.transaction(
        testStoreName,
        async store => {
          await expect(store.add({ a: "test", b: 1 }, key)).resolves.toEqual(
            key
          );
        },
        TransactionMode.ReadWrite
      );
    });
  });
});

describe("#close()", () => {
  it("closes the IndexedDB database connection once all its transactions complete", async () => {
    await createDBWithStore();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const internalDB = (db as any).db as IDBPDatabase<TestSchema>;

    // References to `internalDB._closed` are an internal implementation
    // detail of `fake-indexeddb`. A real IndexedDB implementation is unlikely
    // to work in the same way. This is a hack to get around the fact that
    // `fake-indexeddb` doesn't support the `close` event, which we might
    // otherwise listen for.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((internalDB as any)._closed).toBeFalsy();

    await db.transaction(
      testStoreName,
      async store => {
        await store.add({ a: "test", b: 1 }, "testKey");

        db.close();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((internalDB as any)._closed).toBeFalsy();
      },
      TransactionMode.ReadWrite
    );

    const hasClosed = new Promise(resolve => {
      const checkClosed = (): void => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((internalDB as any)._closed) {
          resolve(true);
        }

        setImmediate(checkClosed);
      };

      checkClosed();
    });

    await expect(hasClosed).resolves.toBeTruthy();
  });

  it("immediately closes the IndexedDB database connection when there are no open transactions", async () => {
    db = await Database.open<TestSchema>(testDBName);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const internalDB = (db as any).db as IDBPDatabase<TestSchema>;

    db.close();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((internalDB as any)._closed).toBeTruthy();
  });

  it("causes transactions created after calling to throw", async () => {
    await createDBWithStore();

    db.close();

    await expectPromise(() =>
      db.transaction(testStoreName, () => Promise.resolve())
    ).rejects.toThrowError(
      "An operation was called on an object on which it is not allowed or at a time when it is not allowed. Also occurs if a request is made on a source object that has been deleted or removed."
    );
  });
});
