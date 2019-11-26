import React, { useContext } from "react";
import { create } from "react-test-renderer";

import { DatabaseContext } from "./DatabaseContext";

describe("#context", () => {
  it("defaults to `undefined`", () => {
    expect.hasAssertions();

    const DBContext = new DatabaseContext();

    const Tester = (): JSX.Element => {
      const database = useContext(DBContext.context);

      expect(database).toBeUndefined();

      return <div />;
    };

    create(<Tester />);
  });
});

describe("#Consumer", () => {
  it("matches the consumer of the context provided", () => {
    const DBContext = new DatabaseContext();

    expect(DBContext.Consumer).toStrictEqual(DBContext.context.Consumer);
  });
});
