---
title: Include Code
category: Documents
---

# Including Code
It can be convenient to write long-form guides/tutorials outside of doc comments.
To support this, TypeDoc supports including documents (like this page!) which exist
as standalone `.md` files in your repository.
These files can then import code from other files using the `@includeCode` tag.

## The `@includeCode` Tag
The `@includeCode` tag can be placed in an md file to insert a code snippet at that location. As an example, this file is inserting the code block below using:

```md
{@includeCode ../reexports.ts}
```

**Result:**
{@includeCode ../reexports.ts}

### Include parts of files

#### Using regions
The `@includeCode` tag can also include only parts of a file using language-dependent region syntax as defined in the VS Code documentation for [Folding](https://code.visualstudio.com/docs/editor/codebasics#_folding), reproduced here for convenience:

Language | Start region | End region
---------|--------------|------------
Bat | `::#region regionName` or `REM #region regionName` | `::#endregion regionName` or `REM #endregion regionName`
C# | `#region regionName` | `#endregion regionName`
C/C++ | `#pragma region regionName` | `#pragma endregion regionName`
CSS/Less/SCSS | `/*#region regionName*/` | `/*#endregion regionName*/`
Coffeescript | `#region regionName` | `#endregion regionName`
F# | `//#region regionName` or `(#_region) regionName` | `//#endregion regionName` or `(#_endregion) regionName`
Java | `//#region regionName` or `//<editor-fold> regionName` | `//#endregion regionName` or `//</editor-fold> regionName`
Markdown | `<!-- #region regionName -->` | `<!-- #endregion regionName -->`
Perl5 | `#region regionName` or `=pod regionName` | `#endregion regionName` or `=cut regionName`
PHP | `#region regionName` | `#endregion regionName`
PowerShell | `#region regionName` | `#endregion regionName`
Python | `#region regionName` or `# region regionName` | `#endregion regionName` or `# endregion regionName`
TypeScript/JavaScript | `//#region regionName` | `//#endregion regionName`
Visual Basic | `#Region regionName` | `#End Region regionName`

For example:

```md
{@includeCode ../enums.ts#simpleEnum}
```

**Result:**

{@includeCode ../enums.ts#simpleEnum}

#### Using line numbers
For cases where you can't modify the source file or where comments are not allowed (in JSON files, for example), you can use line numbers to include a specific region of a file.

For example:

```md
{@includeCode ../../package.json:2,6-7}
```

**Result:**

{@includeCode ../../package.json:2,6-7}

> **Warning:** This makes it difficult to maintain the file, as you may need to update the line numbers if you change the code.
