---
title: Input
---

These options control what files TypeDoc processes to generate documentation
and how the files are processed.

## entryPoints

```bash
typedoc src/index.ts src/alt.ts
# or
typedoc --entryPoints src/index.ts --entryPoints src/alt.ts
```

```jsonc
// typedoc.json
{
    "entryPoints": ["src/index.ts", "src/alt.ts", "src/multiple/*.ts"],
}
```

Specifies the entry points globs to be documented by TypeDoc. TypeDoc will examine
the exports of these files and create documentation according to the exports.
Entry points can be handled in one of four ways, see [--entryPointStrategy](#entrypointstrategy)
for details.

If this option is not set, TypeDoc will automatically discover your entry points
according to the ["exports"](https://nodejs.org/api/packages.html#exports) or
["main"](https://nodejs.org/api/packages.html#main) fields in your package.json,
using your tsconfig options to map the JavaScript files back to the original TypeScript
source.

If a `"typedoc"` [conditional export](https://nodejs.org/api/packages.html#conditional-exports) is used,
TypeDoc will use it instead of the `"import"` export condition.

The set of entry points provided to TypeDoc determines the names displayed in the documentation.
By default, TypeDoc will derive a [displayBasePath](output.md#displaybasepath) based on your entry point
paths to determine the displayed module name, but it can be also be set with the [`@module`](../tags/module.md) tag.

## entryPointStrategy

```bash
typedoc --entryPointStrategy expand ./src
```

Specifies how specified entry points should be handled.

### resolve (default)

Expects all entry points to be contained within the root level tsconfig project.
If a directory is given, includes `<directory>/index` as the entry point.

### expand (default prior to v0.22.0)

Expects all entry points to be contained within the root level tsconfig project.
If a directory is given, its contents are recursively expanded and treated as
entry points.

### packages

Expects all entry points to be directories to _effectively_ run TypeDoc within.
After each entry point has been converted by TypeDoc to a JSON model, the
projects will be merged together and rendered to a single site or JSON output.
Each package may have its own set of TypeDoc configuration, but `plugins` within
sub-projects will _not_ be loaded. See
[Gerrit0/typedoc-packages-example](https://github.com/Gerrit0/typedoc-packages-example)
for an example monorepo which uses this option.

> [!warning] When running in packages mode, options must be specified in the
> correct location. As TypeDoc effectively runs with a clean options object for
> each directory, options which take effect during conversion must be set within
> [packageOptions](#packageoptions) or directly within configuration for each
> project. Configuration specified in the root level project will _not_ be
> copied to child projects. See the [package options](package-options.md) page
> for documentation about where each option should be set.

### merge

Expects all entry points to be `.json` files generated with a previous run of TypeDoc with the [`--json`](./output.md#json) option set. These entry points will be merged into a single project.

## packageOptions

```json
// typedoc.json
{
    "entryPointStrategy": "packages",
    "entryPoints": ["packages/*"],
    "packageOptions": {
        "entryPoints": ["src/index.ts"]
    }
}
```

Options to set be set within each package when entryPointStrategy is set to
packages. Unlike most options in TypeDoc, paths within this object are
interpreted relative to the package directory. This option has no effect if
[entryPointStrategy](#entrypointstrategy) is not set to `packages`.

## alwaysCreateEntryPointModule

By default, if TypeDoc is given only one entry point, it will place exports of that entry point directly within
the generated project. If this option is specified, TypeDoc will instead always create a module for the entry point.
Has no effect if more than one entry point is passed to TypeDoc.

If [`--projectDocuments`](#projectdocuments) is used to add documents, this option defaults to `true`, otherwise, defaults to `false`.

```bash
typedoc --alwaysCreateEntryPointModule
```

## projectDocuments

Specify additional markdown documents to be added to the generated documentation site.
See the [External Documents](../external-documents.md) guide for more details.

```json
// typedoc.json
{
    "projectDocuments": ["docs/tutorial.md"]
}
```

## exclude

```bash
typedoc --exclude "**/*+(index|.spec|.e2e).ts"
```

Exclude files by the given pattern when a path is provided as source. This option is only used to remove files from consideration as
entry points. Unlike TypeScript's `exclude` option, it _cannot_ be used to exclude files from compilation. You may want to turn on TypeScript's
[--skipLibCheck](https://www.typescriptlang.org/tsconfig#skipLibCheck) if you have compilation errors originating in `@types` packages.

**Important:** To exclude files or paths entirely, use TypeScript's `exclude` option in your `tsconfig.json`. TypeDoc will not include any files excluded by `tsconfig.json`. See [issue #1928](https://github.com/TypeStrong/typedoc/issues/1928#issuecomment-1121047065) for further discussion.

Supports [minimatch](https://github.com/isaacs/minimatch) patterns.
In configuration files, this option accepts an array of patterns. On the command line, it may be specified multiple times to add multiple patterns.
If an exported member from one of your entry points is located in an excluded file, it will be excluded from the documentation.

If `entryPointStrategy` is set to `packages`, then you can specify package directories with this option to exclude from documentation.

## externalPattern

```bash
typedoc --externalPattern 'lib/**/*.ts' --externalPattern 'external/**/*.ts'
```

Define patterns for extra files that should be considered external. Can be used along with `--excludeExternals` to remove external modules from the documentation.

## excludeExternals

```bash
typedoc --excludeExternals
```

Prevent externally resolved TypeScript files from being documented. Defaults to false.

## excludeNotDocumented

```bash
typedoc --excludeNotDocumented
```

Removes symbols from the generated documentation which do not have an associated doc comment if they are matched by `excludeNotDocumentedKinds`.

## excludeNotDocumentedKinds

```json
// typedoc.json
{
    "excludeNotDocumented": true,
    "excludeNotDocumentedKinds": ["Property", "Interface", "TypeAlias"]
}
```

Specifies the kinds of member which can be removed by `excludeNotDocumented`. Defaults to:

```json
{
    "excludeNotDocumentedKinds": [
        "Module",
        "Namespace",
        "Enum",
        // "EnumMember", // Not enabled by default
        "Variable",
        "Function",
        "Class",
        "Interface",
        "Constructor",
        "Property",
        "Method",
        "CallSignature",
        "IndexSignature",
        "ConstructorSignature",
        "Accessor",
        "GetSignature",
        "SetSignature",
        "TypeAlias",
        "Reference"
    ]
}
```

## excludeInternal

```bash
typedoc --excludeInternal
```

Removes symbols annotated with the `@internal` doc tag. Defaults to true if the stripInternal compiler option is set to true, otherwise defaults to false.

## excludePrivate

```bash
typedoc --excludePrivate
```

Removes members marked with `private` and `#private` class fields from the generated documentation. Defaults to true.
To include `#private` class fields both this option and [excludePrivateClassFields](#excludeprivateclassfields) must be set to `false`.

## excludePrivateClassFields

```bash
typedoc --excludePrivateClassFields
```

Removes `#private` class fields from the generated documentation. Defaults to true.

## excludeProtected

```bash
typedoc --excludeProtected
```

Removes protected class members from the generated documentation. Defaults to false.

## excludeReferences

```bash
typedoc --excludeReferences
```

Removes re-exports of a symbol already included in the documentation from the documentation. Defaults to false.

## excludeCategories

```bash
typedoc --excludeCategories A --excludeCategories B
```

Removes reflections associated with any of the given categories.

## maxTypeConversionDepth

```bash
typedoc --maxTypeConversionDepth 2
```

Specifies the maximum depth to recurse when converting types, defaults to `10`.

## name

```bash
typedoc --name <Documentation title>
```

Set the name of the project that will be used in the header of the template.
The name defaults to the package name according to your `package.json`.

## includeVersion

```bash
typedoc --includeVersion
```

Includes the version according to `package.json` in generated documentation. Defaults to false.

## disableSources

```bash
typedoc --disableSources
```

Disables capturing where reflections are declared when converting input.

## sourceLinkTemplate

```bash
typedoc --sourceLinkTemplate 'https://vcs.example.com/{path}?at={gitRevision}#line={line}'
```

Has no effect if `--disableSources` is set.
Specify a link template to be used when generating source urls. If not set, will be automatically created
using the git remote for GitHub, GitLab, and BitBucket urls. Supports `{path}`, `{line}`, and `{gitRevision}`
placeholders.

## gitRevision

```bash
typedoc --gitRevision <revision|branch|"{branch}">
```

Has no effect if `--disableSources` is set. Use specified revision or branch instead of the last revision for linking to
source files. Defaults to the last commit. Accepts the special value `{branch}` to indicate that `{gitRevision}` in
`sourceLinkTemplate` should be set to the current commit branch. If `gitRevision` is set to `{branch}` and the current
HEAD is not set to the tip of a branch, TypeDoc will use the last commit instead.

## gitRemote

```bash
typedoc --gitRemote <remote>
```

Has no effect if `--disableSources` is set.
Use the specified git remote instead of `origin` for linking to source files in GitHub, Bitbucket, or GitLab.
You can use `git remote` to view a list of valid remotes.
If you are updating documentation for a forked package, you probably want to pass `--gitRemote upstream`.

## disableGit

```bash
typedoc --disableGit
```

Prevents TypeDoc from using Git to try to determine if sources can be linked, with this enabled, sources will always be
linked, even if not part of a git repo.

## readme

```bash
typedoc --readme <path/to/readme|none>
```

Path to the readme file that should be displayed on the index page. If set to `none`, or no readme file is automatically
discovered, the index page will be disabled.

## basePath

```bash
typedoc --basePath ./
```

Path to a directory containing asset files which will be checked when resolving relative paths of links and images
within documentation comments and external documents. If specified, this will also be used for the default value of
the [displayBasePath](output.md#displaybasepath) option.
