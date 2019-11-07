import { IDBPDatabase, deleteDB } from "idb";

import { Database, Schema, TransactionMode } from "./Database";

const testDBName = "databaseTestDB";
const testStoreName = "testStore";

interface TestSchema extends Schema {
  [testStoreName]: {
    key: string;
    value: {
      a: string;
      b: number;
    };
  };
}

let db: Database<TestSchema>;

afterEach(async () => {
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

    // It's ok to not be deleting this database at the end of this test because
    // it uses the same name as the one we do clean up (i.e. it's the same
    // database).
    const initialDB = await Database.open<TestSchema>(
      testDBName,
      initialVersion
    );

    initialDB.close();

    await expect(
      (async (): Promise<void> => {
        db = await Database.open<TestSchema>(testDBName, currentVersion);
      })()
    ).rejects.toThrow();
  });

  it("returns a database instance when reopening a database with an newer schema version", async () => {
    const initialVersion = 4;
    const currentVersion = 6;

    // It's ok to not be deleting this database at the end of this test because
    // it uses the same name as the one we do clean up (i.e. it's the same
    // database).
    const initialDB = await Database.open<TestSchema>(
      testDBName,
      initialVersion
    );

    initialDB.close();

    db = await Database.open<TestSchema>(testDBName, currentVersion);

    expect(db).toBeInstanceOf(Database);
  });

  it("calls the provided upgrade callback when the database doesn't exist", async () => {
    const version = 5;
    const mock = jest.fn();

    db = await Database.open<TestSchema>(testDBName, version, {
      upgrade(_db, oldVersion, newVersion) {
        mock(oldVersion, newVersion);
      }
    });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(0, version);
  });

  it("doesn't call the provided upgrade callback when the database exists with the same schema version", async () => {
    const version = 5;
    const mock = jest.fn();

    // It's ok to not be deleting this database at the end of this test because
    // it uses the same name as the one we do clean up (i.e. it's the same
    // database).
    const initialDB = await Database.open<TestSchema>(testDBName, version);

    initialDB.close();

    db = await Database.open<TestSchema>(testDBName, version, {
      upgrade(_db, oldVersion, newVersion) {
        mock(oldVersion, newVersion);
      }
    });

    expect(mock).not.toHaveBeenCalled();
  });

  it("calls the provided upgrade callback with the correct schema versions when changing version", async () => {
    const initialVersion = 5;
    const currentVersion = 7;
    const mock = jest.fn();

    // It's ok to not be deleting this database at the end of this test because
    // it uses the same name as the one we do clean up (i.e. it's the same
    // database).
    const initialDB = await Database.open<TestSchema>(
      testDBName,
      initialVersion
    );

    initialDB.close();

    db = await Database.open<TestSchema>(testDBName, currentVersion, {
      upgrade(_db, oldVersion, newVersion) {
        mock(oldVersion, newVersion);
      }
    });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(initialVersion, currentVersion);
  });

  it("calls the provided blocked callback when attempting to reopen a database already open with a different schema version", async () => {
    const initialVersion = 5;
    const currentVersion = 7;
    const mock = jest.fn();

    // It's ok to not be deleting this database at the end of this test because
    // it uses the same name as the one we do clean up (i.e. it's the same
    // database).
    const initialDB = await Database.open<TestSchema>(
      testDBName,
      initialVersion
    );

    db = await Database.open<TestSchema>(testDBName, currentVersion, {
      blocked() {
        mock();

        initialDB.close();
      }
    });

    initialDB.close();

    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("calls the provided blocking callback when a new instance of the database with a later schema version attempts to open", async () => {
    const initialVersion = 5;
    const currentVersion = 7;
    const mock = jest.fn();

    // It's ok to not be deleting this database at the end of this test because
    // it uses the same name as the one we do clean up (i.e. it's the same
    // database).
    const initialDB = await Database.open<TestSchema>(
      testDBName,
      initialVersion,
      {
        blocking() {
          mock();

          initialDB.close();
        }
      }
    );

    db = await Database.open<TestSchema>(testDBName, currentVersion);

    initialDB.close();

    expect(mock).toHaveBeenCalledTimes(1);
  });
});

describe("#put()", () => {
  beforeEach(async () => {
    db = await Database.open<TestSchema>(testDBName, 1, {
      upgrade(database) {
        database.createObjectStore(testStoreName);
      }
    });
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
    db = await Database.open<TestSchema>(testDBName, 1, {
      upgrade(database) {
        database.createObjectStore(testStoreName);
      }
    });
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
    db = await Database.open<TestSchema>(testDBName, 1, {
      upgrade(database) {
        database.createObjectStore(testStoreName);
      }
    });
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

        await expect(
          (async (): Promise<void> => {
            await store.add({ a: "another", b: 2 }, "anotherKey");
          })()
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
          await expect(
            (async (): Promise<void> => {
              await store.add({ a: "test", b: 1 }, "testKey");
            })()
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
  it("eventually closes the IndexedDB database connection once all its transactions complete", async () => {
    db = await Database.open<TestSchema>(testDBName, 1, {
      upgrade(database) {
        database.createObjectStore(testStoreName);
      }
    });

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
});
