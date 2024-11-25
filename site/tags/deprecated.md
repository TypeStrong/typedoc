---
title: "@deprecated"
---

# @deprecated

**Tag Kind:** [Block](../tags.md#block-tags) <br>
**TSDoc Reference:** [@deprecated](https://tsdoc.org/pages/tags/deprecated/)

The `@deprecated` tag indicates that a declaration should not be used and may be removed in a future release.
TypeDoc will render members marked with `@deprecated` with a line through their name like VSCode.

## Example

```ts
/**
 * @deprecated Use {@link NewWidget} instead.
 */
export class Widget {}

export class NewWidget {
    /**
     * @deprecated a single signature may be deprecated
     */
    work(): void;
    /**
     * This signature is not deprecated
     */
    work(token: CancellationToken): void;
    work(token?: CancellationToken) {
        // ...
    }
}
```
