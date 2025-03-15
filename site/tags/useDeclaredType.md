---
title: "@useDeclaredType"
---

# @useDeclaredType

**Tag Kind:** [Modifier](../tags.md#modifier-tags) <br>

This tag can be specified on type aliases to tell TypeDoc to convert them
using the declared type rather than the type node. This can result in better
documentation for derived types. If specified on anything but a type alias,
this tag will do nothing.

The output of the documentation when using this tag is not stable and may change
between TypeScript versions or by very small changes within the type. Depending
on the type alias, this may result in worse documentation. The most common error
case is that the type will be documented as a reference to itself.

## Example

```ts
function getData() {
    return [{ abc: 123 }];
}

/** @useDeclaredType */
export type Data = ReturnType<typeof getData>;

// Data will be documented as if it was written like this:
export type DataManual = { abc: number }[];

// This unfortunately DOES NOT work as expected
export type Bar = { a: string };
/** @useDeclaredType */
export type BarNum = { [K in keyof Bar]: number };
```

## See Also

- The [`@interface`](interface.md) tag
