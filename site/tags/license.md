---
title: "@license"
---

# @license

**Tag Kind:** [Block](../tags.md#block-tags)

The `@license` tag is recognized to declare a license comment which should not
be included in the documentation. Any comments containing `@license` will be
excluded from the generated documentation.

## Example

```js
/** @license Apache-2.0 */
export const api = {...} // not documented
```
