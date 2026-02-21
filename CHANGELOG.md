# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0][] - 2025-02-21

### Added

- `replace` option: when set, enables `markdownlint --fix` to auto-fix matched
  URLs. Supports `$1`, `$2`, etc. for capture group substitution.

### Changed

- **Breaking:** Renamed config key `regex` to `pattern`.
- **Breaking:** Renamed config key `skipRegex` to `skip_regex`.

## [0.1.0][] - 2025-02-21

### Added

- Initial release.
- `createLinkPatternRule()` factory for creating markdownlint rules that
  validate link URLs against regex patterns.
- Config: `pattern`, `message`, `skip_regex` (optional).

[0.2.0]:
  https://github.com/chalin/markdownlint-rule-link-pattern/compare/v0.1.0...v0.2.0
[0.1.0]:
  https://github.com/chalin/markdownlint-rule-link-pattern/releases/tag/v0.1.0
