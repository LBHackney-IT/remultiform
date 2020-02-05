# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.6] - 06-02-2020

### Fixed

- Fixed errors accessing structured data that is missing from a `Store`

## [0.0.5] - 06-02-2020

### Added

- Support for steps to navigate to different slugs depending on the state of the
  step
- Support for specifying dynamic keys for `ComponentDatabaseMap`s
- Support for marking `DynamicComponent`s as required

### Changed

- Simplifed some generic types

### Fixed

- Stopped trying to persist data in `Step`, when the step has no
  `DynamicComponent`s

## [0.0.4] - 02-01-2020

### Added

- `Store` to wrap IndexedDB's store
- Support for storing non-primitive objects in `Store`s

### Changed

- Renamed `DatabaseMap` to `ComponentDatabaseMap`
- Made `defaultValue` required for `DynamicComponent`s
- Improved prop type inference for `StaticComponent`s
- Removed the empty string from types that will never handle the artificial
  empty value
- Made `emptyValue` required for `DynamicComponent`s

## [0.0.3] - 18-12-2019

### Added

- `renderWhen` to components to support conditional renders

### Fixed

- Connected the data fetched by `WrappedComponent` to the `Step`'s
  representation of that data to prevent deleting values that are unchanged

## [0.0.2] - 17-12-2019

### Changed

- Added `provideDatabase` to `Orchestrator`'s props to support manually wrapping
  steps with a `DatabaseProvider`

### Fixed

- Stopped throwing an error when attempting to transition to slugs that aren't
  in the managed steps while `onNextSlug` is provided
- Changed to correctly using a read-write transition when persisting data to a
  `Database`

## [0.0.1] - 05-12-2019

### Added

- TypeScript support
- `StepDefinition` for defining a single step in the multipage form
- `Orchestrator` to orchestrate rendering the appropriate `StepDefinition`
- `next-kittens` example
- `Database` and `Upgrade` to wrap IndexedDB's database
- `DatabaseContext`, `DatabaseProvider`, and `useDatabase` for passing
  `Database` to components via context
- `StaticComponent`, `DynamicComponent`, `DatabaseMap`, `ComponentWrapper`, and
  `WrappedComponent` for wrapping components and connecting them to a `Database`
- `makeDatabase`, a Higher Order Component to make wrapping dynamic components
  more straightforward

[unreleased]: https://github.com/LBHackney-IT/remultiform/compare/v0.0.6...HEAD
[0.0.6]: https://github.com/LBHackney-IT/remultiform/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/LBHackney-IT/remultiform/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/LBHackney-IT/remultiform/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/LBHackney-IT/remultiform/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/LBHackney-IT/remultiform/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/LBHackney-IT/remultiform/releases/tag/v0.0.1
