---
title: "@sortStrategy"
---

# @sortStrategy

**Tag Kind:** [Block](../tags.md#block-tags) <br>

This tag can be used to override the [sort](../options/organization.md#sort) locally
for a module, namespace, class, or interface. The override will be applied to direct
children of the declaration it appears on. If the declaration has a child which contains
children (e.g. a nested namespace) the grandchildren will _not_ be sorted according
to the `@sortStrategy` tag.

## Example

This class makes the most sense if the documentation is reviewed in the source order
rather than being sorted alphabetically.

```ts
/**
 * @sortStrategy source-order
 */
export class Class {
    commonMethod(): void;
    commonMethod2(): void;
    lessCommonMethod(): void;
    uncommonMethod(): void;
}
```

## See Also

- The [`--sort`](../options/organization.md#sort) option
