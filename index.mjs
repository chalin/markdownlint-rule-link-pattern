// @ts-check
//
// Factory for creating markdownlint rules that validate links against a regex
// pattern. Each rule created by this factory gets its own name and config,
// allowing per-rule disable directives.

import { filterByTypes } from 'markdownlint-rule-helpers/micromark';

/**
 * Get 1-based column where the match starts in the line.
 * @param {object} token - Micromark token with startLine, startColumn, text
 * @param {number} matchIndex - Offset of match within token.text
 * @param {object} params - Rule params with lines
 * @returns {number | null} 1-based column, or null if cannot determine
 */
function getEditColumn(token, matchIndex, params) {
  if (token.startColumn != null) {
    return token.startColumn + matchIndex;
  }
  const line = params.lines?.[token.startLine - 1];
  if (!line) return null;
  const contentStart = line.indexOf(token.text);
  if (contentStart < 0) return null;
  return contentStart + matchIndex + 1;
}

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
 *     pattern: 'regex'
 *     message: 'Error message'
 *     skip_regex: 'pattern'  # optional; URLs matching this are skipped
 *     replace: 'replacement'  # optional; when set, enables --fix (supports $1, $2 for capture groups)
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
      const { pattern, message, skip_regex, replace } = params.config;
      const missing = [!pattern && 'pattern', !message && 'message'].filter(
        Boolean,
      );
      if (missing.length) {
        onError({
          lineNumber: 1,
          detail: `Rule '${name}' is missing config: ${missing.join(', ')}`,
        });
        return;
      }

      const compiled = new RegExp(pattern, 'g');
      const skip = skip_regex ? new RegExp(skip_regex) : null;

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
          const errorInfo = {
            lineNumber: token.startLine,
            detail: message,
            context: content.substring(contextStart, contextEnd),
          };
          if (replace != null) {
            const editColumn = getEditColumn(token, match.index, params);
            if (editColumn != null) {
              const insertText = match[0].replace(new RegExp(pattern), replace);
              errorInfo.fixInfo = {
                lineNumber: token.startLine,
                editColumn,
                deleteCount: match[0].length,
                insertText,
              };
            }
          }
          onError(errorInfo);
        }
      }
    },
  };
}
