/**
 * # Markdown Showcase
 *
 * All comments are parsed as **Markdown**. TypeDoc uses the
 * [Marked](https://github.com/markedjs/marked) markdown parser to _convert
 * comments to HTML_.
 *
 * ## Symbol References
 *
 * You can link to other classes, members or functions using double square
 * brackets or an inline link tag. See the [TypeDoc
 * documentation](https://typedoc.org/guides/doccomments/#symbol-references) for
 * details.
 *
 * ## Code in Doc Comments
 *
 * Some inline code: `npm install --save-dev typedoc`
 *
 * A TypeScript code block:
 *
 * ```
 * // A fabulous variable
 * const x: number | string = 12
 * ```
 *
 * See [[`syntaxHighlightingShowcase`]] for more code blocks.
 *
 * ## A List
 *
 * - 🥚 ~~Eggs~~
 * - 🍞 Bread
 * - 🧀 Swiss cheese
 *
 * ## A Table
 *
 * | Package | Version |
 * | ------- | ------- |
 * | lodash  | 4.17.21 |
 * | react   | 17.0.2  |
 * | typedoc | 0.22.4  |
 *
 * A Random Shakespeare Quote
 * --------------------------
 *
 * > Rebellious subjects, enemies to peace, Profaners of this neighbour-stained
 * > steel,-- Will they not hear? What, ho! you men, you beasts, That quench the
 * > fire of your pernicious rage With purple fountains issuing from your veins
 *
 * ## An Image
 *
 * <img src="media://typescript-logo.svg" width="120" />
 *
 * This requires the [media option](https://typedoc.org/guides/options/#media)
 * to be set.
 */
export function markdownShowcase(): void {
    // does nothing
}

/**
 * TypeDoc supports code blocks in Markdown and uses
 * [Shiki](https://shiki.matsu.io/) to provide syntax highlighting.
 *
 * If no language is specified, the code block is assumed to be TypeScript:
 *
 * ```
 * // A fabulous variable
 * const x: number | string = 12
 * ```
 *
 * You can specify the language at the start of your code block like this:
 *
 *  ````text
 *  ```rust
 *  ````
 *
 * Use the `tsx` language to get JSX support:
 *
 * ```tsx
 * function BasicComponent(): ReactElement {
 *     return <div>Test</div>
 * }
 * ```
 *
 * You might want to write code in the language your backend uses. Here's some
 * Python:
 *
 * ```python
 * for i in range(30):
 *     print(i + 1)
 * ```
 *
 * And some CSS:
 *
 * ```css
 * .card {
 *     background-color: white;
 *     padding: 1rem;
 *     border: 1px solid lightgray;
 * }
 * ```
 *
 * If you don't want syntax highlighting, use the `text` language:
 *
 * ```text
 * package.json
 * src/
 *     index.ts
 *     __tests__/
 *         index.test.ts
 * ```
 *
 * [**View the full list of supported
 * languages.**](https://github.com/shikijs/shiki/blob/main/docs/languages.md#all-languages)
 * You can also get this list by running `typedoc --help`.
 */
export function syntaxHighlightingShowcase(): void {
    // does nothing
}
