import { NextPage } from "next";
import Link from "next/link";
import React from "react";

const IndexPage: NextPage = (): JSX.Element => {
  return (
    <>
      <Link href="/small-kitten">
        <button>Small kitten</button>
      </Link>
      <Link href="/big-kitten">
        <button>Big kitten</button>
      </Link>
    </>
  );
};

export default IndexPage;
