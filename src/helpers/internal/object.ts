export type ChildOf<T> = T extends {}
  ? {
      [K in keyof NonNullable<T>]: NonNullable<T>[K];
    }[keyof NonNullable<T>]
  : never;
