---
title: "@mergeModuleWith"
---

# @mergeModuleWith

**Tag Kind:** [Block](../tags.md#block-tags)

The `@mergeModuleWith` tag can be used to tell TypeDoc to place the children of
a module or namespace within another module and remove the current module. This
is intended to support projects which combine the results of multiple TypeScript
projects into a single exported module but run TypeDoc on each project
individually with the [packages entryPointStrategy](../options/input.md#entrypointstrategy)

The `@mergeModuleWith` tag should be given the qualified name of the module the
current module should be merged into. This should be a `.` separated path of module
names in the case of merging into a nested module.

The string `<project>` can also be specified to instruct TypeDoc to place members
of the current module directly under the root project reflection.

> [!WARNING] Using this tag will affect link resolution. Links targeting the
> module containing `@mergeModuleWith` will be reported as broken links as their
> target has been removed and links within children of the source module may be
> resolved as if belonging to either module depending on your TypeDoc build
> configuration.

## Example

```ts
// module-a.ts
/**
 * @module
 * @mergeModuleWith <project>
 */
export function fn1() {}

// module-b.ts
/**
 * @module
 * @mergeModuleWith <project>
 */
export function fn2() {}
```

## See Also

- The [`@module`](module.md) tag
- The [`@packageDocumentation`](packageDocumentation.md) tag
