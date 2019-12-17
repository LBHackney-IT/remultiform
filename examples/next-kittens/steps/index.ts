import {
  ComponentWrapper,
  StaticComponent
} from "remultiform/component-wrapper";

import { makeSubmit } from "../components/makeSubmit";

const steps = [
  {
    slug: "small-kitten",
    nextSlug: "big-kitten",
    Submit: makeSubmit({ href: "/big-kitten", value: "Big kitten" }),
    componentWrappers: [
      ComponentWrapper.wrapStatic(
        new StaticComponent({
          key: "image",
          Component: "img",
          props: { src: `https://placekitten.com/200/300` }
        })
      )
    ]
  },
  {
    slug: "big-kitten",
    nextSlug: "small-kitten",
    Submit: makeSubmit({ href: "/small-kitten", value: "Small kitten" }),
    componentWrappers: [
      ComponentWrapper.wrapStatic(
        new StaticComponent({
          key: "image",
          Component: "img",
          props: { src: `https://placekitten.com/900/600` }
        })
      )
    ]
  }
];

export default steps;
