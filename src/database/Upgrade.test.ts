import "fake-indexeddb/auto";

import { IDBPDatabase, deleteDB, openDB } from "idb";

import { expectPromise } from "../__tests__/helpers/expect";
import { promiseToWaitForNextTick } from "../__tests__/helpers/promise";

import { NamedSchema, Transaction } from "./types";
import { Upgrade } from "./Upgrade";

const testDBName = "upgradeTestDB";
const testStoreName = "testStore";
const anotherTestStoreName = "anotherTestStore";

type TestSchema = NamedSchema<
  typeof testDBName,
  number,
  {
    [testStoreName]: {
      key: string;
      value: number;
    };

    [anotherTestStoreName]: {
      key: string;
      value: number;
    };
  }
>;

const mockDB = jest.fn<IDBPDatabase<TestSchema["schema"]>, void[]>()();
const mockTX = jest.fn<Transaction<TestSchema["schema"]>, void[]>()();

describe("#oldVersion", () => {
  it("matches the version provided in the constructor", () => {
    const oldVersion = 3;

    const upgrade = new Upgrade(mockDB, oldVersion, 5, mockTX);

    expect(upgrade.oldVersion).toEqual(oldVersion);
  });
});

describe("#newVersion", () => {
  it("matches the version provided in the constructor", () => {
    const newVersion = 6;

    const upgrade = new Upgrade(mockDB, 1, newVersion, mockTX);

    expect(upgrade.newVersion).toEqual(newVersion);
  });

  it("is undefined if the constructor recieved null", () => {
    const upgrade = new Upgrade(mockDB, 1, null, mockTX);

    expect(upgrade.newVersion).toBeUndefined();
  });
});

describe("#createStore()", () => {
  let dbPromise: Promise<IDBPDatabase<TestSchema["schema"]>>;
  let db: IDBPDatabase<TestSchema["schema"]>;
  let tx: Transaction<TestSchema["schema"]>;
  let upgrade: Upgrade<TestSchema["schema"]>;

  beforeEach(async () => {
    await new Promise((resolve, reject) => {
      dbPromise = openDB<TestSchema["schema"]>(testDBName, 1, {
        upgrade(database, oldVersion, newVersion, transaction) {
          try {
            db = database;
            tx = transaction;

            upgrade = new Upgrade(db, oldVersion, newVersion, tx);

            resolve();
          } catch (err) {
            reject(err);
          }
        },
      });
    });
  });

  afterEach(async () => {
    await tx.done;

    const db = await dbPromise;

    db.close();

    await deleteDB(testDBName);
  });

  it("returns a created object store with the provided name", () => {
    const store = upgrade.createStore(testStoreName);

    expect(store.name).toEqual(testStoreName);
  });

  it("throws when attempting to create a store that already exists", () => {
    upgrade.createStore(testStoreName);

    expect(() => {
      upgrade.createStore(testStoreName);
    }).toThrowError(
      "A mutation operation in the transaction failed because a constraint was not satisfied. For example, an object such as an object store or index already exists and a request attempted to create a new one."
    );
  });
});

describe("#transaction()", () => {
  const initialData = { key: "initialKey", value: 10 };

  let dbPromise: Promise<IDBPDatabase<TestSchema["schema"]>>;
  let db: IDBPDatabase<TestSchema["schema"]>;
  let tx: Transaction<TestSchema["schema"]>;
  let upgrade: Upgrade<TestSchema["schema"]>;

  beforeEach(async () => {
    await new Promise((resolve, reject) => {
      dbPromise = openDB<TestSchema["schema"]>(testDBName, 1, {
        upgrade(database, oldVersion, newVersion, transaction) {
          try {
            db = database;
            tx = transaction;

            const store = db.createObjectStore(testStoreName);

            store
              .add(initialData.value, initialData.key)
              .then(() => {
                db.createObjectStore(anotherTestStoreName);

                upgrade = new Upgrade(db, oldVersion, newVersion, tx);

                resolve();
              })
              .catch(reject);
          } catch (err) {
            reject(err);
          }
        },
      });
    });
  });

  afterEach(async () => {
    await tx.done;

    const db = await dbPromise;

    db.close();

    await deleteDB(testDBName);
  });

  it("allows reading from the store", async () => {
    await upgrade.transaction([testStoreName], async (stores) => {
      await expect(stores[testStoreName].get(initialData.key)).resolves.toEqual(
        initialData.value
      );
    });
  });

  it("allows writing to the store", async () => {
    const key = "testKey";

    await upgrade.transaction([testStoreName], async (stores) => {
      await expect(stores[testStoreName].add(key, 1)).resolves.toEqual(key);
    });
  });

  it("provides access to all the stores passed to it", async () => {
    await upgrade.transaction(
      [testStoreName, anotherTestStoreName],
      (stores) => {
        expect(Object.keys(stores)).toEqual(
          expect.arrayContaining([testStoreName, anotherTestStoreName])
        );
      }
    );
  });

  it("throws when targeting a missing store", async () => {
    const missingStoreName = "missingStore";

    await expect(
      // Cast to get around TypeScript enforcing the type of the store name
      // (not all users will be using TypeScript).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (upgrade as Upgrade<any>).transaction([missingStoreName], () =>
        Promise.resolve()
      )
    ).rejects.toThrow(
      "The operation failed because the requested database object could not be found. For example, an object store did not exist but was being opened."
    );
  });

  it("throws when targeting a missing store along with a present store", async () => {
    const missingStoreName = "missingStore";

    await expect(
      // Cast to get around TypeScript enforcing the type of the store name
      // (not all users will be using TypeScript).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (upgrade as Upgrade<any>).transaction(
        [testStoreName, missingStoreName],
        () => Promise.resolve()
      )
    ).rejects.toThrow(
      "The operation failed because the requested database object could not be found. For example, an object store did not exist but was being opened."
    );
  });

  it("throws when targeting multiple missing stores", async () => {
    const missingStoreName = "missingStore";
    const anotherMissingStoreName = "anotherMissingStore";

    await expect(
      // Cast to get around TypeScript enforcing the type of the store name
      // (not all users will be using TypeScript).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (upgrade as Upgrade<any>).transaction(
        [missingStoreName, anotherMissingStoreName],
        () => Promise.resolve()
      )
    ).rejects.toThrow(
      "The operation failed because the requested database object could not be found. For example, an object store did not exist but was being opened."
    );
  });

  it("completes the transaction automatically if not performing a database operation on the given store every tick", async () => {
    const key = "testKey";
    const value = 1;

    await upgrade.transaction([testStoreName], async (stores) => {
      await stores[testStoreName].add(key, 1);

      await promiseToWaitForNextTick();

      // We haven't awaited `transaction.done` yet, so we haven't explicitly
      // waited for the transaction to complete, so if it's complete, it's
      // because it completed automatically.
      await expect(db.get(testStoreName, key)).resolves.toEqual(value);
    });
  });

  it("throws when attempting to add to the transaction after it has automatically completed", async () => {
    const key = "testKey";
    const value = 1;

    await upgrade.transaction([testStoreName], async (stores) => {
      await stores[testStoreName].add(key, value);

      await promiseToWaitForNextTick();

      await expectPromise(() =>
        stores[testStoreName].add("anotherKey", 2)
      ).rejects.toThrowError(
        "A request was placed against a transaction which is currently not active, or which is finished"
      );
    });
  });
});
