import { NamedSchema } from "../../store/types";

import { DatabaseMap } from "./DatabaseMap";

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
      value: number;
    };
  }
>;

describe("#storeName", () => {
  it("matches the `storeName` provided to the constructor", () => {
    const storeName = "anotherTestStore";

    const databaseMap = new DatabaseMap<TestSchema, "anotherTestStore">({
      storeName,
      key: 0
    });

    expect(databaseMap.storeName).toEqual(storeName);
  });
});

describe("#key", () => {
  it("matches the `key` provided to the constructor", () => {
    const key = 5;

    const databaseMap = new DatabaseMap<TestSchema, "testStore">({
      storeName: "testStore",
      key
    });

    expect(databaseMap.key).toEqual(key);
  });
});
