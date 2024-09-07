---
title: "@satisfies"
---

# @satisfies

**Tag Kind:** [Block](../tags.md#Block-Tags) <br>

This tag is recognized for parity with TypeScript 5.0's [`@satisfies` Support in JSDoc](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#satisfies-support-in-jsdoc).

It is hidden by default by the [`--excludeTags`](../options/comments.md#excludeTags) option.

## Example

```js
/**
 * @satisfies {ConfigSettings}
 */
export const myConfigSettings = { ... };
```

## See Also

-   The [`--excludeTags`](../options/comments.md#excludeTags) option
