import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";

const IndexPage: NextPage = (): JSX.Element => {
  const router = useRouter();

  return (
    <>
      <button
        onClick={async (): Promise<void> => {
          await router.replace("/small-kitten");
        }}
      >
        Small kitten
      </button>
      <button
        onClick={async (): Promise<void> => {
          await router.replace("/big-kitten");
        }}
      >
        Big kitten
      </button>
    </>
  );
};

export default IndexPage;
