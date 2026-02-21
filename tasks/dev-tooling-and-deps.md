# Dev tooling and dependency management

## Context

This package is consumed via GitHub-direct installs (`github:chalin/...`) by
projects like [opentelemetry.io][] where CI/CD time matters. npm's handling of
git dependencies can cause devDependencies to be installed on the consumer side,
bloating installs and potentially causing build failures (this was observed
firsthand with the [Docsy][] project, where `hugo-extended` as a devDep failed
in containerized environments).

## Current approach

Keep devDependencies minimal: only what's needed to run tests (`markdownlint`,
`markdownlint-rule-helpers`). No dev tooling (Prettier, cSpell, ESLint, etc.) as
devDeps for now.

## Future: adding dev tooling (Prettier, cSpell, etc.)

Options to explore when adding dev tooling:

1. **npx-based CI**: Run tools via `npx` in CI scripts or a Makefile, avoiding
   devDeps entirely. Downside: no version pinning, slower CI (npx fetches on
   each run).

2. **Workspace pattern** (used in [Docsy][]): Root `package.json` holds dev
   tooling as devDeps with a `workspaces` config. The publishable package lives
   in a subfolder with a lean `package.json`. Consumers install from the
   workspace path. This cleanly isolates dev tooling from the published package.

3. **Publish to npm**: Once published to npm, consumers get a tarball with no
   devDeps involved. This eliminates the problem entirely but requires
   maintaining a publish workflow.

## Future: TypeScript migration

When moving to TypeScript:

- A build step (`tsc`) will be needed, which means a `prepare` script, which
  will definitely trigger devDep installation for git consumers.
- **Recommended approach**: Commit compiled output (`dist/`) to git. Point
  `exports` to `dist/index.mjs`. Git-based installs get pre-built files (no
  build step needed). npm publishes use the same files via `files`.
- Alternatively, adopt the workspace pattern or publish to npm at that point.

## References

- [npm docs on `prepare` and git deps][npm-prepare]
- [Docsy workspace setup][docsy-pkg] for isolating dev tooling

[opentelemetry.io]: https://github.com/open-telemetry/opentelemetry.io
[Docsy]: https://github.com/google/docsy
[docsy-pkg]: https://github.com/google/docsy/blob/main/package.json
[npm-prepare]:
  https://docs.npmjs.com/cli/v10/using-npm/scripts#prepare-and-prepublish
