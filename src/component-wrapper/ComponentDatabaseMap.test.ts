import { NamedSchema } from "../database/types";

import { ComponentDatabaseMap } from "./ComponentDatabaseMap";

type TestSchema = NamedSchema<
  string,
  number,
  {
    testStore: {
      key: number;
      value: string;
    };

    anotherTestStore: {
      key: number;
      value: { a: { test: number } };
    };
  }
>;

describe("#storeName", () => {
  it("matches the `storeName` provided to the constructor", () => {
    const storeName = "anotherTestStore";

    const databaseMap = new ComponentDatabaseMap<
      TestSchema,
      "anotherTestStore"
    >({
      storeName,
      key: 0
    });

    expect(databaseMap.storeName).toEqual(storeName);
  });
});

describe("#key", () => {
  it("matches the `key` provided to the constructor", () => {
    const key = 5;

    const databaseMap = new ComponentDatabaseMap<TestSchema, "testStore">({
      storeName: "testStore",
      key
    });

    expect(databaseMap.key).toEqual(key);
  });
});

describe("#property", () => {
  it("is undefined by default", () => {
    const databaseMap = new ComponentDatabaseMap<
      TestSchema,
      "anotherTestStore"
    >({
      storeName: "anotherTestStore",
      key: 3
    });

    expect(databaseMap.property).toBeUndefined();
  });

  it("matches the `property` provided to the constructor", () => {
    const property: ["a", "test"] = ["a", "test"];

    const databaseMap = new ComponentDatabaseMap<
      TestSchema,
      "anotherTestStore"
    >({
      storeName: "anotherTestStore",
      key: 3,
      property
    });

    expect(databaseMap.property).toEqual(property);
  });
});
