import { IDBPDatabase } from "idb";

import { promiseToWaitForNextTick } from "../../__tests__/helpers/promise";

import { StoreMap } from "../Store";
import {
  NamedSchema,
  Schema,
  StoreKey,
  StoreNames,
  StoreValue,
} from "../types";

const { Database: ActualDatabase } = jest.requireActual("../Database");

export { ActualDatabase };

export class Database<
  DBSchema extends NamedSchema<string, number, Schema>
> extends ActualDatabase<DBSchema> {
  static async open<DBSchema extends NamedSchema<string, number, Schema>>(
    name: DBSchema["dbNames"],
    version: DBSchema["versions"]
  ): Promise<Database<DBSchema>> {
    await promiseToWaitForNextTick();

    return new Database({ ...jest.fn()(), name, version });
  }

  constructor(db: IDBPDatabase<DBSchema["schema"]>) {
    super(db);
  }

  async put(): Promise<void> {
    await promiseToWaitForNextTick();
  }

  async get<DBStoreName extends StoreNames<DBSchema["schema"]>>(
    storeName: DBStoreName,
    key: StoreKey<DBSchema["schema"], DBStoreName>
  ): Promise<StoreValue<DBSchema["schema"], DBStoreName>> {
    await promiseToWaitForNextTick();

    return `${storeName}/${key}` as StoreValue<DBSchema["schema"], DBStoreName>;
  }

  async transaction<DBStoreNames extends StoreNames<DBSchema["schema"]>[]>(
    _storeNames: DBStoreNames,
    tx: (
      stores: StoreMap<DBSchema["schema"], DBStoreNames>
    ) => void | Promise<void>
  ): Promise<void> {
    await tx(jest.fn()());
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  close(): void {}
}
