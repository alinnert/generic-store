# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2020-07-04

### Added

- Add support for computed values
- Add `reset()` method on store instances to easily reset all values of a store
- Add `resetAll()` function to easily reset all values of all stores
- Add `subscribe()` method on store instance to subscribe to changes of a specific value

### Changed

- Instead of passing the initial state to `createStore` you now have to pass a function that returns the initial state
- Changed name of store instance method `subscribe()` to `subscribeAll()`

## [1.0.3] - 2020-03-17

### Fixed

- Update dependencies to fix security warnings

## [1.0.2] - 2020-03-17

### Fixed

- Update dependencies to fix security warnings

## [1.0.1] - 2020-02-19

### Removed

- Remove `.update()` function because there's no benefit in having it

## [1.0.0] - 2020-02-13

- Initial Release
