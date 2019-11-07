import { DBSchema, IDBPDatabase, OpenDBCallbacks, openDB } from "idb";

export type Schema = DBSchema;

export class Database<S extends Schema> {
  static async open<S extends Schema>(
    name: string,
    version = 1,
    callbacks: OpenDBCallbacks<S> = {}
  ): Promise<Database<S>> {
    const db = await openDB<S>(name, version, callbacks);

    return new Database(db);
  }

  private readonly db: IDBPDatabase<S>;

  private constructor(db: IDBPDatabase<S>) {
    this.db = db;
  }

  // It would be better if this waited for the connection to close, but
  // `fake-indexeddb` doesn't support the `close` event we need, making it
  // difficult to implement and difficult to test.
  close(): void {
    this.db.close();
  }
}
