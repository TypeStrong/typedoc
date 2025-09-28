---
title: Comments
---

These options control how TypeDoc parses comments.

## commentStyle

```bash
$ typedoc --commentStyle block
```

Determines what comment types TypeDoc will use. Note: Writing non-JSDoc comments will cause poorer
intellisense in VSCode and is therefore generally not recommended.

| Value           | Behavior                               |
| --------------- | -------------------------------------- |
| jsdoc (default) | Use block comments starting with `/**` |
| block           | Use all block comments                 |
| line            | Use `//` comments                      |
| all             | Use both block and line comments       |

## useTsLinkResolution

```bash
$ typedoc --useTsLinkResolution false
```

Indicates that `{@link}` tags should be resolved with TypeScript's parsing rules. This is on by default.

## preserveLinkText

```bash
$ typedoc --preserveLinkText false
```

Indicates whether or not `{@link}` tags should include just the name of the target reflection, or the original link text. This is on by default.

## jsDocCompatibility

CLI:

```bash
$ typedoc --jsDocCompatibility false
$ typedoc --jsDocCompatibility.defaultTag false
```

typedoc.json (defaults):

```json
{
    "jsDocCompatibility": {
        "exampleTag": true,
        "defaultTag": true,
        "inheritDocTag": true,
        "ignoreUnescapedBraces": true
    }
}
```

JSDoc specifies that the `@example` and `@default` tags indicate that the
following content should be parsed as code. This conflicts with the TSDoc
standard. With this option on, TypeDoc will attempt to infer from the tag
content whether it should be parsed as code by checking if the tag content
contains a code block.

TSDoc specifies that `@inheritdoc` should be spelled with a capitalized `D`,
`@inheritDoc`. If `inheritDocTag` is set to `false`, TypeDoc will produce a
warning when rewriting `@inheritdoc` to `@inheritDoc`.

TSDoc specifies that braces (`{}`) must be escaped within comments to avoid
ambiguity between the start of an inline tag and a brace to be included in the
rendered text. TypeDoc's `ignoreUnescapedBraces` option determines if warnings
are emitted if a brace is found within regular comment text without being
escaped.

## suppressCommentWarningsInDeclarationFiles

```bash
$ typedoc --suppressCommentWarningsInDeclarationFiles
```

Prevents warnings due to unspecified tags from being reported in comments within `.d.ts` files.

## blockTags

```json
// typedoc.json
{
    "blockTags": ["@param", "@returns"]
}
```

This specifies all of the [block tags](../tags.md#block-tags) that TypeDoc considers to be valid.

TypeDoc will warn when it finds an unknown tag. If you need to add a custom one, you can extend the defaults by using a JavaScript configuration file:

```js
import { OptionDefaults } from "typedoc";

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
    // Other config here.
    // ...

    blockTags: [...OptionDefaults.blockTags, "@foo"],
};

export default config;
```

Note that this option will be set by `tsdoc.json`, if present. (Using a `tsdoc.json` file is an alternate way to add a custom tag.)

Also see [`inlineTags`](#inlinetags) and [`modifierTags`](#modifiertags).

## inlineTags

```json
// typedoc.json
{
    "inlineTags": ["@link"]
}
```

This specifics all of the [inline tags](../tags.md#inline-tags) that TypeDoc considers to be valid.

TypeDoc will warn when it finds a non-valid tag. If you need to add a custom one, you can extend the defaults by using a JavaScript configuration file:

```js
import { OptionDefaults } from "typedoc";

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
    // Other config here.
    // ...

    inlineTags: [...OptionDefaults.inlineTags, "@foo"],
};

export default config;
```

Note that this option will be set by `tsdoc.json`, if present. (Using a `tsdoc.json` file is an alternate way to add a custom tag.)

Also see [`blockTags`](#blocktags) and [`modifierTags`](#modifiertags).

## modifierTags

```json
// typedoc.json
{
    "modifierTags": ["@hidden", "@packageDocumentation"]
}
```

This specifics all of the [modifier tags](../tags.md#modifier-tags) that TypeDoc considers to be valid.

TypeDoc will warn when it finds a non-valid tag. If you need to add a custom one, you can extend the defaults by using a JavaScript configuration file:

```js
import { OptionDefaults } from "typedoc";

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
    // Other config here.
    // ...

    modifierTags: [...OptionDefaults.modifierTags, "@foo"],
};

export default config;
```

Note that this option will be set by `tsdoc.json`, if present. (Using a `tsdoc.json` file is an alternate way to add a custom tag.)

Also see [`blockTags`](#blocktags) and [`inlineTags`](#inlinetags).

## cascadedModifierTags

```json
// typedoc.json
{
    "modifierTags": ["@alpha", "@beta", "@experimental"]
}
```

Specifies modifier tags which should be copied to all children of the parent reflection.
Note that `@deprecated` is a block tag, not a modifier tag, so should not be specified here.

## excludeTags

```bash
$ typedoc --excludeTags @apidefine
```

Specify tags that should be removed from doc comments when parsing.
Useful if your project uses [apiDoc](https://apidocjs.com/) for documenting RESTful web APIs.

## notRenderedTags

```bash
$ typedoc --notRenderedTags @beta
```

Specify tags which should be preserved in the doc comments, but not rendered
when creating output. This is intended to support tags which carry some meaning
about how to render a member or instructions for TypeDoc to do something after a
package has been deserialized from JSON in packages mode.

## preservedTypeAnnotationTags

```json
// typedoc.json
{
    "preservedTypeAnnotationTags": ["@fires"]
}
```

Specify block tags whose type annotations should be preserved by TypeDoc's parser,
leading to their content being included in the rendered documentation.

## externalSymbolLinkMappings

```json
// typedoc.json
{
    // format: { [packageName: string]: { [exportName: string]: string } }
    "externalSymbolLinkMappings": {
        // {@link typescript!Partial} will use this link as well as
        // type Foo = Partial<Bar>
        "typescript": {
            "Partial": "https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype"
        }
    }
}
```

Can be used to specify locations of externally defined types. If the external library uses namespaces,
qualify the name with `.` as a separator. These definitions will be used for both types linked to by
the user via a `{@link}` tag and in code.

TypeDoc assumes that if a symbol was referenced from a package, it was exported from that package.
This will be true for most native TypeScript packages, but packages which rely on `@types` will be linked
according to the `@types` package, not the original module name. If both are intended to be supported,
both packages must be listed.

```json
// typedoc.json
{
    "externalSymbolLinkMappings": {
        // used by `class Foo extends Component {}`
        "@types/react": {
            "Component": "https://reactjs.org/docs/react-component.html"
        },
        // used by {@link react!Component}
        "react": {
            "Component": "https://reactjs.org/docs/react-component.html"
        }
    }
}
```

Global external types are supported, but may have surprising behavior. Types which are defined in the TypeScript
lib files (including `Array`, `Promise`, ...) will be detected as belonging to the `typescript` package rather than
the special `global` package reserved for global types.

```json
// typedoc.json
{
    "externalSymbolLinkMappings": {
        // used by {@link !Promise}
        "global": {
            "Promise": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise"
        },
        // used by type Foo = Promise<string>
        "typescript": {
            "Promise": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise"
        }
    }
}
```

The string `"#"` may also be specified to indicate to TypeDoc that the type should be marked as resolved
but no link should be created.

```json
// typedoc.json
{
    "externalSymbolLinkMappings": {
        // used by {@link !Promise}
        "global": {
            "Promise": "#"
        },
        // used by type Foo = Promise<string>
        "typescript": {
            "Promise": "#"
        }
    }
}
```
