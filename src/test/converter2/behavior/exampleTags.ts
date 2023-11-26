/**
 * The example tag is problematic.
 * JSDoc expects it to have no code ticks: https://jsdoc.app/tags-example.html
 * TSDoc does not: https://tsdoc.org/pages/tags/example/
 * VSCode says it's code if it does not include a code block: https://github.com/Microsoft/vscode/blob/1.64.2/extensions/typescript-language-features/src/utils/previewer.ts#L52-L60
 *
 * @example
 * // JSDoc style
 * codeHere();
 *
 * @example <caption>JSDoc specialness</caption>
 * // JSDoc style
 * codeHere();
 *
 * @example <caption>JSDoc with braces</caption>
 * x.map(() => { return 1; })
 *
 * @example
 * ```ts
 * // TSDoc style
 * codeHere();
 * ```
 *
 * @example TSDoc name
 * ```ts
 * // TSDoc style
 * codeHere();
 * ```
 *
 * @example Bad {@link} name
 * ```ts
 * oops();
 * ```
 */
export const foo = 123;
