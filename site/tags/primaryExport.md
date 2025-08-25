---
title: "@primaryExport"
---

# @primaryExport

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

Normally, when TypeDoc encounters a re-export, it will defer converting the symbol
so that if the symbol's module is documented TypeDoc will document re-exports as pointing
to the original module.

This tag overrides that behavior, causing TypeDoc to instead immediately convert the
symbol. Specifying it on a comment for a namespace will also cause TypeDoc to convert
the re-exports directly within that namespace immediately.

## Example

```ts
/**
 * We want the primary documentation for models to be this namespace,
 * but also preserve the flattened export structure for backwards compatibility.
 * @primaryExport
 */
export * as Models from "./models/index.js";
export * from "./models/index.js";
```
