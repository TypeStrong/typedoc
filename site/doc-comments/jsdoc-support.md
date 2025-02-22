---
title: JSDoc Support
---

# JSDoc Support

JSDoc is the de-facto "standard" for comments, but does not specify a rigorous
grammar and is fully implemented only by the official JSDoc tool. TypeDoc aims
to recognize _most_ JSDoc comments in a manner similar to how they are handled
by TypeScript and Visual Studio Code. Where the JSDoc implementation conflicts
with the TSDoc specification, TypeDoc generally tries to detect which
implementation is intended. JSDoc compatibility can be controlled with the
[--jsDocCompatibility](../options/comments.md#jsdoccompatibility) option.

## Notable Differences

- TypeDoc's [`@link`](../tags/link.md) tags do not support JSDoc namepaths
- TypeDoc does not require type annotations in [`@param`](../tags/param.md) blocks
- TypeDoc does not parse [`@see`](../tags/see.md) tag contents as links
- TypeDoc does not support all JSDoc tags
