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

```js
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

### Include parts of files

#### Using regions

The `@include` and `@includeCode` tags can also include only parts of a file using language-dependent region syntax as defined in the VS Code documentation for [Folding](https://code.visualstudio.com/docs/editor/codebasics#_folding), reproduced here for convenience:

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

##### Example

```md
Here is a simple enum:
{@includeCode ../enums.js#simpleEnum}
```

#### Using line numbers

For cases where you can't modify the source file or where comments are not allowed (in JSON files, for example), you can use line numbers to include a specific region of a file.

##### Example

```md
In package.json, notice the following information:
{@includeCode ../../package.json:2,6-7}
```

> **Warning:** This makes it difficult to maintain the file, as you may need to update the line numbers if you change the code.

## See Also

-   The [jsdocCompatibility](../options/comments.md#jsdoccompatibility) option.
