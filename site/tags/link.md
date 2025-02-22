---
title: "\{\@link\}"
---

# \{\@link\}

**Tag Kind:** [Inline](../tags.md#inline-tags) <br>
**TSDoc Reference:** [@link](https://tsdoc.org/pages/tags/link/)

The `@link` tag is used to refer to another documented declaration. It takes one of the following forms:

- `{@link Foo.Bar}` - Links to `Foo.Bar`, with link text `Bar`
- `{@link Foo.Bar | click here}` - Links to `Foo.Bar`, with link text `click here`
- (non-TSDoc) `{@link Foo.Bar click here}` - Links to `Foo.Bar`, with link text `click here`

Link resolution is controlled by the `--useTsLinkResolution` option. When set
(the default), links will be resolved using TypeScript's resolution, which uses the
symbols in scope to determine what symbol should be linked to. This is the same
resolution style used by Visual Studio Code.

If `--useTsLinkResolution` is off, or TypeScript fails to resolve a link, the link will
be resolved with [declaration references](../declaration-references.md).

## Example

```ts
/**
 * Similar to {@link random}, but with a range of [0, 100)
 */
export function rand(): number;

/**
 * Returns a random number in the range [0, 1)
 */
export function random(): number;

/**
 * {@link Data.prop | instance member}
 * {@link Data.member | static member}
 * {@link Data#member | instance member} (declaration references only)
 */
export class Data {
    prop = 0;

    static member = 1;
    member = 2;
}

/**
 * TypeScript links do not support meaning qualifiers (`:namespace`),
 * so both of these links will link to the enum unless --useTsLinkResolution is disabled.
 * {@link Merged:namespace} links to the namespace.
 * {@link Merged:enum} links to the enum.
 */
export namespace Merged {
    export const a = 3;
}

export enum Merged {
    A,
}
```

## TSDoc Compatibility

TypeDoc implements the "new" version of declaration references, specified at
[tsdoc/src/beta/DeclarationReference.grammarkdown](https://github.com/microsoft/tsdoc/blob/main/tsdoc/src/beta/DeclarationReference.grammarkdown).
TypeDoc does not support parsing the initial declaration reference syntax proposed by TSDoc.
For more details see the [declaration reference](../declaration-references.md) documentation.

## JSDoc Compatibility

TypeDoc will also recognize the `@linkplain` and `@linkcode` JSDoc tags and
resolve them with the same method as other links.
