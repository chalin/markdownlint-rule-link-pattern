// @ts-check
//
// Factory for creating markdownlint rules that validate links against a regex
// pattern. Each rule created by this factory gets its own name and config,
// allowing per-rule disable directives.

import { filterByTypes } from 'markdownlint-rule-helpers/micromark';

const linkTokenTypes = /** @type {any} */ ([
  'resourceDestinationString', // inline link [text](url) or image ![alt](url)
  'definitionDestinationString', // reference definition [label]: url
  'autolinkProtocol', // autolink: <https://...>
  'literalAutolinkHttp', // bare URL: https://... (GFM extension)
]);

/**
 * Create a markdownlint rule that checks link URLs against a regex pattern
 * specified via rule config.
 *
 * Config shape (in .markdownlint.yaml):
 *
 *   rule-name:
 *     regex: 'pattern'
 *     message: 'Error message'
 *     skipRegex: 'pattern'  # optional; URLs matching this are skipped
 *
 * @param {string} name - rule identifier (used in markdownlint-disable directives)
 * @param {string} description - human-readable rule description
 * @returns {import("markdownlint").Rule}
 */
export function createLinkPatternRule(name, description) {
  return {
    names: [name],
    description,
    tags: ['custom', 'links', 'validation'],
    parser: 'micromark',
    function: function (params, onError) {
      const { regex, message, skipRegex } = params.config;
      const missing = [!regex && 'regex', !message && 'message'].filter(
        Boolean,
      );
      if (missing.length) {
        onError({
          lineNumber: 1,
          detail: `Rule '${name}' is missing config: ${missing.join(', ')}`,
        });
        return;
      }

      const compiled = new RegExp(regex, 'g');
      const skip = skipRegex ? new RegExp(skipRegex) : null;

      const linkDestinations = filterByTypes(
        params.parsers.micromark.tokens,
        linkTokenTypes,
      );

      for (const token of linkDestinations) {
        const content = token.text;
        if (!content) continue;

        if (skip && skip.test(content)) continue;

        compiled.lastIndex = 0;
        let match;
        while ((match = compiled.exec(content)) !== null) {
          const contextStart = Math.max(0, match.index - 20);
          const contextEnd = match.index + match[0].length + 20;
          onError({
            lineNumber: token.startLine,
            detail: message,
            context: content.substring(contextStart, contextEnd),
          });
        }
      }
    },
  };
}
