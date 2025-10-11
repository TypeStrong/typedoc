---
title: Tags
children:
    - tags/abstract.md
    - tags/alpha.md
    - tags/author.md
    - tags/beta.md
    - tags/category.md
    - tags/class.md
    - tags/defaultValue.md
    - tags/deprecated.md
    - tags/document.md
    - tags/enum.md
    - tags/event.md
    - tags/eventProperty.md
    - tags/example.md
    - tags/expand.md
    - tags/experimental.md
    - tags/function.md
    - tags/group.md
    - tags/hidden.md
    - tags/hideconstructor.md
    - tags/ignore.md
    - tags/import.md
    - tags/include.md
    - tags/inheritDoc.md
    - tags/inline.md
    - tags/interface.md
    - tags/internal.md
    - tags/label.md
    - tags/license.md
    - tags/link.md
    - tags/mergeModuleWith.md
    - tags/module.md
    - tags/namespace.md
    - tags/overload.md
    - tags/override.md
    - tags/packageDocumentation.md
    - tags/param.md
    - tags/primaryExport.md
    - tags/private.md
    - tags/privateRemarks.md
    - tags/property.md
    - tags/protected.md
    - tags/public.md
    - tags/readonly.md
    - tags/remarks.md
    - tags/returns.md
    - tags/sealed.md
    - tags/see.md
    - tags/since.md
    - tags/sortStrategy.md
    - tags/summary.md
    - tags/template.md
    - tags/throws.md
    - tags/typeParam.md
    - tags/useDeclaredType.md
    - tags/virtual.md
    - tags/typescript.md
showGroups: true
---

# Tags

TypeDoc supports a specific set of tags. Many JSDoc tags are not supported because the TypeScript
compiler can infer the same information directly from code. Any tags which are not recognized will
result in a warning being emitted. TypeDoc will still parse the documentation comment, using context
clues to determine the likely intended tag type.

## Defining Tags

TypeDoc supports defining what tags are supported through either a `tsdoc.json` file or via the
`--blockTags`, `--inlineTags`, and `--modifierTags` options. If defined in a `tsdoc.json` file,
the file **must** be placed alongside `tsconfig.json`. See the
[TSDoc documentation](https://tsdoc.org/pages/packages/tsdoc-config/) for details on the file format.

```json
{
    "$schema": "https://developer.microsoft.com/en-us/json-schemas/tsdoc/v0/tsdoc.schema.json",
    "extends": ["typedoc/tsdoc.json"],
    "noStandardTags": false,
    "tagDefinitions": [
        {
            "tagName": "@customTag",
            "syntaxKind": "modifier"
        }
    ]
}
```

## Block Tags

Block tags are tags that are associated with the following text. They can be
used to divide documentation into sections ([`@remarks`](./tags/remarks.md)),
modify how the reflection is organized ([`@group`](./tags/group.md)) or provide
examples for how to use the export ([`@example`](./tags/example.md)).

````ts
/**
 * Summary
 *
 * @remarks
 * Additional details
 *
 * @example
 * ```ts
 * factorial(3) // => 6
 * ```
 */
````

- [`@author`](./tags/author.md)
- [`@category`, `@categoryDescription`, `@showCategories`, `@hideCategories`](./tags/category.md)
- [`@defaultValue`, `@default`](./tags/defaultValue.md)
- [`@deprecated`](./tags/deprecated.md)
- [`@document`](./tags/document.md)
- [`@example`](./tags/example.md)
- [`@expandType`](./tags/expand.md#expandtype)
- [`@group`, `@groupDescription`, `@showGroups`, `@hideGroups`, `@disableGroups`](./tags/group.md)
- [`@import`](./tags/import.md)
- [`@inlineType`](./tags/inline.md#inlinetype)
- [`@license`](./tags/license.md)
- [`@mergeModuleWith`](./tags/mergeModuleWith.md)
- [`@module`](./tags/module.md)
- [`@param`, `@this`](./tags/param.md)
- [`@preventExpand`](./tags/expand.md#preventexpand)
- [`@preventInline`](./tags/inline.md#preventinline)
- [`@privateRemarks`](./tags/privateRemarks.md)
- [`@property`, `@prop`](./tags/property.md)
- [`@remarks`](./tags/remarks.md)
- [`@returns`, `@return`](./tags/returns.md)
- [`@see`](./tags/see.md)
- [`@since`](./tags/since.md)
- [`@sortStrategy`](./tags/sortStrategy.md)
- [`@summary`](./tags/summary.md)
- [`@template`](./tags/template.md)
- [`@throws`](./tags/throws.md)
- [`@typeParam`](./tags/typeParam.md)
- [`@type`, `@yields`, `@jsx`, `@typedef`, `@extends`, `@augments`, `@satisfies`, `@callback`](./tags/typescript.md)

## Modifier Tags

Modifier tags have no associated content and serve only to specify some special
behavior for how the reflection is processed by setting some binary flag. For
example, [`@hidden`](./tags/hidden.md) will remove a reflection from the
documentation while [`@internal`](./tags/internal.md) will mark the reflection
as internal for use with
[`--visibilityFilters`](./options/output.md#visibilityfilters) or
[`--excludeInternal`](./options/input.md#excludeinternal).

- [`@abstract`](./tags/abstract.md)
- [`@alpha`](./tags/alpha.md)
- [`@beta`](./tags/beta.md)
- [`@class`](./tags/class.md)
- [`@enum`](./tags/enum.md)
- [`@event`](./tags/event.md)
- [`@eventProperty`](./tags/eventProperty.md)
- [`@expand`](./tags/expand.md)
- [`@experimental`](./tags/experimental.md)
- [`@function`](./tags/function.md)
- [`@hidden`](./tags/hidden.md)
- [`@hideconstructor`](./tags/hideconstructor.md)
- [`@ignore`](./tags/ignore.md)
- [`@inline`](./tags/inline.md)
- [`@interface`](./tags/interface.md)
- [`@internal`](./tags/internal.md)
- [`@namespace`](./tags/namespace.md)
- [`@overload`](./tags/overload.md)
- [`@override`](./tags/override.md)
- [`@packageDocumentation`](./tags/packageDocumentation.md)
- [`@primaryExport`](./tags/primaryExport.md)
- [`@private`](./tags/private.md)
- [`@protected`](./tags/protected.md)
- [`@public`](./tags/public.md)
- [`@readonly`](./tags/readonly.md)
- [`@sealed`](./tags/sealed.md)
- [`@useDeclaredType`](./tags/useDeclaredType.md)
- [`@virtual`](./tags/virtual.md)

## Inline Tags

Inline tags are used to mark text within a paragraph for processing by TypeDoc. The most important ones are the
[`@link`](./tags/link.md) and [`@inheritDoc`](./tags/inheritDoc.md) tags.

- [`@include`, `@includeCode`](./tags/include.md)
- [`@inheritDoc`](./tags/inheritDoc.md)
- [`@label`](./tags/label.md)
- [`@link`, `@linkcode`, `@linkplain`](./tags/link.md)

## TypeScript in JavaScript

If your project uses TypeScript to type check JavaScript, TypeDoc will pick up
type aliases and interfaces defined with `@typedef` and `@callback`. See the
[TypeScript handbook](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#typedef-callback-and-param)
for details.

## See Also

- The [Doc Comments overview](./doc-comments/index.md)
