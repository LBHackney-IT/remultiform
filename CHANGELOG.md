# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - 05-12-2019

### Added

- TypeScript support
- `StepDefinition` for defining a single step in the multipage form
- `Orchestrator` to orchestrate rendering the appropriate `StepDefinition`
- `next-kittens` example
- IndexedDB store wrappers
- `DatabaseContext`, `DatabaseProvider`, and `useDatabase` for passing
  `Database` to components via context
- `StaticComponent`, `DynamicComponent`, `DynamicComponentDatabaseMap`,
  `ComponentWrapper`, and `WrappedComponent` for wrapping components and
  connecting them to a `Database`
- `makeDatabase`, a Higher Order Component to make wrapping dynamic components
  more straightforward

[unreleased]: https://github.com/LBHackney-IT/remultiform/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/LBHackney-IT/remultiform/releases/tag/v0.0.1
