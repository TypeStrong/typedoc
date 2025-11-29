---
title: Validation
---

Options that control how TypeDoc validates your documentation.

## validation

CLI:

```bash
$ typedoc --validation.invalidLink
$ typedoc --validation
```

typedoc.json (defaults):

```json
{
    "validation": {
        "notExported": true,
        "invalidLink": true,
        "invalidPath": true,
        "rewrittenLink": true,
        "notDocumented": false,
        "unusedMergeModuleWith": true
    }
}
```

Specifies validation steps TypeDoc should perform on your generated
documentation. Most validation occurs before rendering, but `rewrittenLink` is
done during HTML rendering as links have not been generated before rendering
begins.

- **notExported** - Produce warnings if a type is referenced by the
  documentation but the type isn't exported and therefore included in the
  documentation.
- **invalidLink** - Produce warnings for `@link` tags which cannot be resolved.
- **invalidPath** - Produce warnings for links to relative paths which do not resolve
  to a file and therefore cannot be copied to the documentation output folder.
- **rewrittenLink** - Produce warnings for `@link` tags which are resolved,
  but whose target does not have a unique URL in the documentation. TypeDoc
  will rewrite these links to point to the first parent with a URL.
- **notDocumented** - Produce warnings for reflections which do not have a
  documentation comment. This is also controlled by the
  [requiredToBeDocumented](#requiredtobedocumented) option.
- **unusedMergeModuleWith** - Produce warnings for
  [`@mergeModuleWith`](../tags/mergeModuleWith.md) tags which are not
  resolved. This option should generally be disabled if generating JSON which
  will be combined with another document later.

## treatWarningsAsErrors

```bash
$ typedoc --treatWarningsAsErrors
```

Causes TypeDoc to treat any reported warnings as fatal errors that can prevent documentation from being generated.

## treatValidationWarningsAsErrors

```bash
$ typedoc --treatValidationWarningsAsErrors
```

Limited version of `treatWarningsAsErrors` that only applies to warnings emitted during validation of a project.
This option cannot be used to turn `treatWarningsAsErrors` off for validation warnings.

## intentionallyNotExported

Lists symbols which are intentionally excluded from the documentation output and should not produce warnings.
Entries may optionally specify a package name / package relative file name before a colon to only suppress warnings for symbols declared in a specific file.

typedoc.json:

```json
{
    "intentionallyNotExported": [
        "InternalClass",
        "typedoc/src/other.ts:OtherInternal"
    ]
}
```

## requiredToBeDocumented

Set the list of reflection types that must be documented, used by `validation.notDocumented`

The full list of available values are below, with entries not required by default commented out.

typedoc.json:

```json
{
    "requiredToBeDocumented": [
        // "Project",
        // "Module",
        // "Namespace",
        "Enum",
        "EnumMember",
        "Variable",
        "Function",
        "Class",
        "Interface",
        // "Constructor",
        "Property",
        "Method",
        // Implicitly set if function/method is set (this means you can't require docs on methods, but not functions)
        // This exists because methods/functions can have multiple signatures due to overloads, and TypeDoc puts comment
        // data on the signature. This might be improved someday, so you probably shouldn't set this directly.
        //    "CallSignature",
        // Index signature { [k: string]: string } "properties"
        //    "IndexSignature",
        // Equivalent to Constructor due to the same implementation detail as CallSignature
        //    "ConstructorSignature",
        // "Parameter",
        // Used for object literal types. You probably should set TypeAlias instead, which refers to types created with `type X =`.
        // This only really exists because of an implementation detail.
        //    "TypeLiteral",
        // "TypeParameter",
        "Accessor", // shorthand for GetSignature + SetSignature
        //   "GetSignature",
        //    "SetSignature",
        "TypeAlias"
        // TypeDoc creates reference reflections if a symbol is exported from a package with multiple names. Most projects
        // won't have any of these, and they just render as a link to the canonical name.
        //    "Reference",
    ]
}
```

## packagesRequiringDocumentation

Specifies which packages TypeDoc should expect to have documentation.
Defaults to the name of your package from `package.json`.

```json
{
    "packagesRequiringDocumentation": ["typedoc", "typedoc-plugin-mdn-links"]
}
```

## intentionallyNotDocumented

Used to selectively ignore undocumented fields, used by `validation.notDocumented`.
This should include the qualified name printed when a member is not documented if it cannot be
or should not be documented normally.

```json
{
    "intentionallyNotDocumented": ["Namespace.Class.prop"]
}
```
