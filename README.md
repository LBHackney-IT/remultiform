# Remultiform

![Project maturity](https://img.shields.io/badge/project_maturity-alpha-blue?style=for-the-badge)
![Licence](https://img.shields.io/github/license/LBHackney-IT/remultiform?label=licence&style=for-the-badge)

![CircleCI build status](https://img.shields.io/circleci/build/github/LBHackney-IT/remultiform?style=for-the-badge)

![GitHub repo size](https://img.shields.io/github/repo-size/LBHackney-IT/remultiform?style=for-the-badge)

The **Re**act **multi**page **form** builder

**Warning: Remultiform is still in alpha. No promises of API stability are
made.**

## For users

### Installation

Install the package from NPM in the usual way. Remultiform supports React 16 or
newer. You will need to install it as a peer dependency.

```sh
npm install remultiform react@">=16"
```

or

```sh
yarn add remultiform react@">=16"
```

## For contributors

### Running the tests

We use [Jest](https://jestjs.io/) for testing.

To run the unit tests:

```bash
npm run test:unit
```

To run the unit tests, updating changed snapshots:

```bash
npm run test:unit:update
```

To run the tests for all examples, including building:

```bash
npm run test:examples
```

To run the tests for all examples, including building, updating changed
snapshots:

```bash
npm run test:examples:update
```

To run the full test suite, including building:

```bash
npm run test:all
```

To run the full test suite, including building, updating changed snapshots:

```bash
npm run test:all:update
```

To run the full test suite, including format checking, linting, and building:

```bash
npm test
```

To run the full test suite, including format checking, linting, and building,
fixing any issues and updating snapshots:

```bash
npm run test:update
```

### Formatting the code

We use [Prettier](https://prettier.io/) to format our code. There are lots of
[editor integrations](https://prettier.io/docs/en/editors.html) available, and
the style is enforced by a Git pre-commit hook.

To run the formatter:

```bash
npm run format
```

### Linting the code

We use [ESLint](https://eslint.org/), in addition to TypeScript's compiler, for
verifying correctness and maintainability of code.

To run the linter:

```bash
npm run lint
```

To run the linter in fix mode:

```bash
npm run lint:fix
```

## Architecture decision records

We use ADRs to document architecture decisions that we make. They can be found
in `docs/adr` and contributed to with
[adr-tools](https://github.com/npryce/adr-tools).
