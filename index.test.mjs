// @ts-check
//
// Tests for the createLinkPatternRule factory

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { lint } from 'markdownlint/promise';
import { applyFixes } from 'markdownlint';
import { createLinkPatternRule } from './index.mjs';

const exampleRule = createLinkPatternRule('no-example-com', 'No example.com');
const localhostRule = createLinkPatternRule('no-localhost', 'No localhost');

/**
 * Run lint with the given rules and config on markdown content.
 * @param {string} content
 * @param {import("markdownlint").Rule[]} rules
 * @param {object} config
 * @returns {Promise<Array>}
 */
async function lintContent(content, rules, config) {
  const results = await lint({
    strings: { test: content },
    customRules: rules,
    config,
  });
  return results.test || [];
}

describe('createLinkPatternRule', () => {
  const config = {
    default: false,
    'no-example-com': {
      regex: 'example\\.com',
      message: 'Do not link to example.com',
    },
    'no-localhost': {
      regex: 'localhost',
      message: 'Do not link to localhost',
    },
  };

  it('should pass for links not matching any pattern', async () => {
    const errors = await lintContent(
      '[link](https://example.org)',
      [exampleRule, localhostRule],
      config,
    );
    assert.strictEqual(errors.length, 0);
  });

  it('should flag links matching a pattern', async () => {
    const errors = await lintContent(
      '[link](https://example.com/page)',
      [exampleRule],
      config,
    );
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].ruleNames[0], 'no-example-com');
  });

  it('should flag localhost links', async () => {
    const errors = await lintContent(
      '[api](http://localhost:8080/api)',
      [localhostRule],
      config,
    );
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].ruleNames[0], 'no-localhost');
    assert.ok(errors[0].errorDetail.includes('localhost'));
  });

  it('should check multiple links in content', async () => {
    const content = `
[good](https://example.org)
[bad1](https://example.com)
[bad2](http://localhost:3000)
`;
    const errors = await lintContent(
      content,
      [exampleRule, localhostRule],
      config,
    );
    assert.strictEqual(errors.length, 2);
  });

  it('should flag link reference definitions', async () => {
    const content = `
See [example][] for details.

[example]: https://example.com/page
`;
    const errors = await lintContent(content, [exampleRule], config);
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].errorDetail.includes('example.com'));
  });

  it('should flag image URLs', async () => {
    const errors = await lintContent(
      '![logo](https://example.com/logo.png)',
      [exampleRule],
      config,
    );
    assert.strictEqual(errors.length, 1);
  });

  it('should flag autolinks', async () => {
    const errors = await lintContent(
      'Visit <https://example.com> for info.',
      [exampleRule],
      config,
    );
    assert.strictEqual(errors.length, 1);
  });

  it('should flag bare URLs', async () => {
    const errors = await lintContent(
      'Visit https://example.com for info.',
      [exampleRule],
      config,
    );
    assert.strictEqual(errors.length, 1);
  });

  it('should only flag the matching rule, not others', async () => {
    const errors = await lintContent(
      '[link](https://example.com)',
      [exampleRule, localhostRule],
      config,
    );
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].ruleNames[0], 'no-example-com');
  });

  it('should allow each rule to be disabled independently', async () => {
    const configWithDisable = {
      ...config,
      'no-example-com': false,
    };
    const errors = await lintContent(
      '[a](https://example.com) [b](http://localhost)',
      [exampleRule, localhostRule],
      configWithDisable,
    );
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].ruleNames[0], 'no-localhost');
  });
});

describe('missing config warning', () => {
  it('should warn when regex is missing', async () => {
    const config = {
      default: false,
      'no-example-com': {
        message: 'Do not link to example.com',
      },
    };
    const errors = await lintContent(
      '[link](https://example.com)',
      [exampleRule],
      config,
    );
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].lineNumber, 1);
    assert.ok(errors[0].errorDetail.includes('regex'));
  });

  it('should warn when message is missing', async () => {
    const config = {
      default: false,
      'no-example-com': {
        regex: 'example\\.com',
      },
    };
    const errors = await lintContent(
      '[link](https://example.com)',
      [exampleRule],
      config,
    );
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].lineNumber, 1);
    assert.ok(errors[0].errorDetail.includes('message'));
  });

  it('should warn when both regex and message are missing', async () => {
    const config = {
      default: false,
      'no-example-com': {},
    };
    const errors = await lintContent(
      '[link](https://example.com)',
      [exampleRule],
      config,
    );
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].lineNumber, 1);
    assert.ok(errors[0].errorDetail.includes('regex'));
    assert.ok(errors[0].errorDetail.includes('message'));
  });
});

describe('skipRegex option', () => {
  const configWithSkip = {
    default: false,
    'no-example-com': {
      regex: 'example\\.com',
      message: 'Do not link to example.com',
      skipRegex: 'staging\\.',
    },
  };

  it('should skip URLs matching skipRegex', async () => {
    const errors = await lintContent(
      '[link](https://staging.example.com/page)',
      [exampleRule],
      configWithSkip,
    );
    assert.strictEqual(errors.length, 0);
  });

  it('should still flag URLs not matching skipRegex', async () => {
    const errors = await lintContent(
      '[link](https://example.com/page)',
      [exampleRule],
      configWithSkip,
    );
    assert.strictEqual(errors.length, 1);
  });

  it('should flag all matching URLs when skipRegex is not set', async () => {
    const configNoSkip = {
      default: false,
      'no-example-com': {
        regex: 'example\\.com',
        message: 'Do not link to example.com',
      },
    };
    const errors = await lintContent(
      '[link](https://staging.example.com/page)',
      [exampleRule],
      configNoSkip,
    );
    assert.strictEqual(errors.length, 1);
  });
});

describe('replace option (fix support)', () => {
  const httpRule = createLinkPatternRule('no-http', 'Use https');

  it('should include fixInfo when replace is configured', async () => {
    const config = {
      default: false,
      'no-http': {
        regex: 'http://',
        message: 'Use https instead of http',
        replace: 'https://',
      },
    };
    const errors = await lintContent(
      '[link](http://example.com)',
      [httpRule],
      config,
    );
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].fixInfo);
    assert.strictEqual(errors[0].fixInfo.deleteCount, 7);
    assert.strictEqual(errors[0].fixInfo.insertText, 'https://');
  });

  it('should apply fix correctly', async () => {
    const config = {
      default: false,
      'no-http': {
        regex: 'http://',
        message: 'Use https',
        replace: 'https://',
      },
    };
    const content = '[link](http://example.com)';
    const results = await lint({
      strings: { test: content },
      customRules: [httpRule],
      config,
    });
    const errors = results.test || [];
    assert.strictEqual(errors.length, 1);
    const fixed = applyFixes(content, errors);
    assert.strictEqual(fixed, '[link](https://example.com)');
  });

  it('should replace external URL prefix with relative path', async () => {
    const rule = createLinkPatternRule(
      'no-otel-external',
      'Use relative path',
    );
    const config = {
      default: false,
      'no-otel-external': {
        regex: 'https?://(?:www\\.)?opentelemetry\\.io/',
        message: 'Use site-relative path',
        replace: '/',
      },
    };
    const content = '[docs](https://www.opentelemetry.io/docs/getting-started)';
    const results = await lint({
      strings: { test: content },
      customRules: [rule],
      config,
    });
    const errors = results.test || [];
    assert.strictEqual(errors.length, 1);
    const fixed = applyFixes(content, errors);
    assert.strictEqual(fixed, '[docs](/docs/getting-started)');
  });
});
