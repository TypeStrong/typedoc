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

## See Also

-   The [jsdocCompatibility](../options/comments.md#jsdoccompatibility) option.
