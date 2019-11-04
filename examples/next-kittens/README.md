# Next Kittens

This example shows how to integrate Remultiform with Next.js.

## Running the example

1. Install the dependencies for the root project and build the distributables:

   ```sh
   pushd ../..
   npm install
   popd
   ```

   This example imports Remultiform from its build artefacts.

1. Install the dependencies for this example:

   ```sh
   npm install
   ```

1. Run the development server:

   ```sh
   npm run dev
   ```

1. Navigate to `http://localhost:3000/200x300`. The slug of the page is in the
   format `{width}x{length}` of the kitten picture you want.
