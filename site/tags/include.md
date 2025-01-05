---
title: "\{\@include\}"
---

# \{\@include\}

**Tag Kind:** [Inline](../tags.md#inline-tags)

The `@include` tag can be used to include external markdown content within
the comment for a member. It is an inline tag which will be replaced with the
contents of the specified file.

For convenience, an `@includeCode` inline tag is also recognized, which will
include the referenced file within a code block, using the file extension for
selecting the syntax highlighting language.

## Example

```ts
/**
 * {@include ./doSomething_docs.md}
 *
 * Quick start:
 * {@includeCode ../examples/doSomethingQuickStart.ts}
 *
 * @example
 * This will only work if the jsdocCompatibility.exampleTag option is false
 * {@includeCode ../test/doSomething.test.ts}
 */
function doSomething() {}
```

<!-- #region includePartsOfFiles -->

### Include parts of files

#### Using regions (preferred)

The `@include` and `@includeCode` tags can also include only parts of a file by referring to a specific named region.

For example:

```md
{@includeCode ../../example/src/enums.ts#simpleEnum}
```

Regions are specified in the files themselves via comments.

In Typescript for example, the following would be a valid region:

{@includeCode ../../example/src/enums.ts#simpleEnumRegion}

**Result:**

{@includeCode ../../example/src/enums.ts#simpleEnum}

Language-dependent region syntax is meant to be compatible with VS Code [Folding](https://code.visualstudio.com/docs/editor/codebasics#_folding). Here is a reproduction of their table, but with `regionName` everywhere because we want to insist on named regions.

| Language              | Start region                                           | End region                                                 |
| --------------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| Bat                   | `::#region regionName` or `REM #region regionName`     | `::#endregion regionName` or `REM #endregion regionName`   |
| C#                    | `#region regionName`                                   | `#endregion regionName`                                    |
| C/C++                 | `#pragma region regionName`                            | `#pragma endregion regionName`                             |
| CSS/Less/SCSS         | `/*#region regionName*/`                               | `/*#endregion regionName*/`                                |
| Coffeescript          | `#region regionName`                                   | `#endregion regionName`                                    |
| F#                    | `//#region regionName` or `(#_region) regionName`      | `//#endregion regionName` or `(#_endregion) regionName`    |
| Java                  | `//#region regionName` or `//<editor-fold> regionName` | `//#endregion regionName` or `//</editor-fold> regionName` |
| Markdown              | `<!-- #region regionName -->`                          | `<!-- #endregion regionName -->`                           |
| Perl5                 | `#region regionName` or `=pod regionName`              | `#endregion regionName` or `=cut regionName`               |
| PHP                   | `#region regionName`                                   | `#endregion regionName`                                    |
| PowerShell            | `#region regionName`                                   | `#endregion regionName`                                    |
| Python                | `#region regionName` or `# region regionName`          | `#endregion regionName` or `# endregion regionName`        |
| TypeScript/JavaScript | `//#region regionName`                                 | `//#endregion regionName`                                  |
| Visual Basic          | `#Region regionName`                                   | `#End Region regionName`                                   |

#### Using line numbers (risky)

When you can't add comments to define regions (in JSON files, for example) you can use line numbers instead to include a specific region of a file.

> **Warning:** Referencing line numbers should be avoided since the reference will likely break when every time the file changes.

```md
{@includeCode ../../package.json:2,6-7}
```

**Result:**

{@includeCode ../../package.json:2,6-7}

A colon (`:`) separates the file path from the line numbers: a comma-separated list of numbers or ranges of the form `<start>-<end>` (`6-7` in the example above).

> **Note:** The first line in the file Line 1, not Line 0, just like you would see in most code editors.

<!-- #endregion includePartsOfFiles -->

## See Also

-   The [jsdocCompatibility](../options/comments.md#jsdoccompatibility) option.
