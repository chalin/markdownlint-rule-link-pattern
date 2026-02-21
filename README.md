# markdownlint-rule-link-pattern

> A [markdownlint][] rule factory for validating link URLs against regex
> patterns.

Each call to `createLinkPatternRule()` produces an markdownlint rule that can be
independently configured and disabled, and that flags link URLs matching a given
regex.

## Install

From npm (once published):

```sh
npm install markdownlint-rule-link-pattern --save-dev
```

From GitHub directly:

```sh
npm install github:chalin/markdownlint-rule-link-pattern#semver:0.2.0 --save-dev
```

## Usage

### 1. Create rule instances

Create a file (e.g., `link-rules.mjs`) that defines your rules:

```js
import { createLinkPatternRule } from 'markdownlint-rule-link-pattern';

export default [
  createLinkPatternRule('no-http-urls', 'Flag non-HTTPS URLs'),
  createLinkPatternRule('no-example-com', 'Flag example.com links'),
];
```

### 2. Register with markdownlint-cli2

In `.markdownlint-cli2.yaml`:

```yaml
customRules:
  - ./link-rules.mjs
```

### 3. Configure each rule

In `.markdownlint.yaml`:

```yaml
no-http-urls:
  pattern: 'http://(?!localhost)'
  message: Use https instead of http.

no-example-com:
  pattern: 'example\.com'
  message: Do not link to example.com.
```

## Config shape

Each rule instance reads its configuration from the markdownlint config under
its rule name:

| Property     | Type   | Required | Description                                                                     |
| ------------ | ------ | -------- | ------------------------------------------------------------------------------- |
| `pattern`    | string | yes      | Regex pattern to match against link URLs.                                       |
| `message`    | string | yes      | Error message shown when a link matches.                                        |
| `skip_regex` | string | no       | URLs matching this regex are skipped.                                           |
| `replace`    | string | no       | Replacement text; when set, enables `--fix` (supports `$1`, `$2` for captures). |

### Example with `skip_regex`

To skip URLs containing template directives (e.g., Hugo `{{ }}`):

```yaml
no-example-com:
  pattern: 'example\.com'
  message: Do not link to example.com.
  skip_regex: '\{\{.*\}\}'
```

### Example with `replace` (auto-fix)

To enable `markdownlint --fix` for a rule, add `replace`:

```yaml
no-http-urls:
  pattern: 'http://'
  message: Use https instead of http.
  replace: 'https://'

no-otel-external-urls:
  pattern: 'https?://(?:www\.)?opentelemetry\.io/'
  message: Use site-relative path.
  replace: '/'
```

## Link types checked

The rule checks all link-like tokens produced by the micromark parser:

- Inline links: `[text](url)`
- Images: `![alt](url)`
- Reference definitions: `[label]: url`
- Autolinks: `<https://...>`
- Bare URLs: `https://...` (GFM extension)

## License

[Apache-2.0](LICENSE)

[markdownlint]: https://github.com/DavidAnson/markdownlint
