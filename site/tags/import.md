---
title: "@import"
---

# @import

**Tag Kind:** [Block](../tags.md#block-tags)

The `@import` tag is recognized for use in JavaScript projects which can use it
to declare type imports since TypeScript 5.5. Any comment containing `@import`
will be ignored by TypeDoc.

## Example

Taken from the [TypeScript 5.5 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#the-jsdoc-import-tag)

```js
/** @import { SomeType } from "some-module" */
/**
 * @param {SomeType} myValue
 */
function doSomething(myValue) {
    // ...
}
```

## See Also

- The [TypeScript 5.5 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#the-jsdoc-import-tag)
