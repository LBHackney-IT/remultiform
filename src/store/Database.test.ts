import { IDBPDatabase, deleteDB } from "idb";

import { Database, Schema } from "./Database";

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

describe("#close()", () => {
  it("immediately closes the IndexedDB database connection when there are no open transactions", async () => {
    db = await Database.open<TestSchema>(testDBName);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const internalDB = (db as any).db as IDBPDatabase<TestSchema>;

    db.close();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((internalDB as any)._closed).toBeTruthy();
  });
});
