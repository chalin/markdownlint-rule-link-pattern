# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog][], and this project adheres to
[Semantic Versioning][].

## [0.3.0][] - 2026-08-21

### Changed

- **Breaking:** Renamed the package to `@pchalin/markdownlint-rule-link-pattern`
  for publication to the npm registry under the `@pchalin` scope. The unscoped
  registry name is npm-security-held following a malicious squat
  ([GHSA-q3xp-j858-q9xf][]) and is not used by this project.

## [0.2.0][] - 2026-02-21

### Added

- `replace` option: when set, enables `markdownlint --fix` to auto-fix matched
  URLs. Supports `$1`, `$2`, etc. for capture group substitution.

### Changed

- **Breaking:** Renamed config key `regex` to `pattern`.
- **Breaking:** Renamed config key `skipRegex` to `skip_regex`.

## [0.1.0][] - 2026-02-21

### Added

- Initial release.
- `createLinkPatternRule()` factory for creating markdownlint rules that
  validate link URLs against regex patterns.
- Config: `pattern`, `message`, `skip_regex` (optional).

<!-- prettier-ignore-start -->
[0.1.0]: https://github.com/chalin/markdownlint-rule-link-pattern/releases/tag/v0.1.0
[0.2.0]: https://github.com/chalin/markdownlint-rule-link-pattern/compare/v0.1.0...v0.2.0
[0.3.0]: https://github.com/chalin/markdownlint-rule-link-pattern/compare/v0.2.0...v0.3.0
[GHSA-q3xp-j858-q9xf]: https://github.com/advisories/GHSA-q3xp-j858-q9xf
[Keep a Changelog]: https://keepachangelog.com/en/1.1.0/
[Semantic Versioning]: https://semver.org/spec/v2.0.0.html
<!-- prettier-ignore-end -->
