---
title: TSDoc Support
---

# TSDoc Support

The TSDoc standard is a proposal to standardize parsing of JSDoc-like comments.
TypeDoc aims to be compliant with the TSDoc standard, but does not enforce it.
This means that while TypeDoc should be able to parse all (or nearly all)
TSDoc-complaint comments, it does not require that your comments follow the
standard.

This approach has several benefits, including better support for projects
originally written using JSDoc and support for more markdown constructs
(including day-to-day features like
[headings](https://github.com/microsoft/tsdoc/issues/197), and
[lists](https://github.com/microsoft/tsdoc/issues/178)). However, for projects
requiring stricter validation of comment formats, this laxness may not be
acceptable. In this case, [api-extractor](https://api-extractor.com/) is
recommended instead of TypeDoc for it's much stricter conformance to TSDoc.

## Notable Differences

- The [jsDocCompatibility](../options/comments.md#jsdoccompatibility) option
  can be used to configure TypeDoc to parse comments more similarly to
  JSDoc/TypeScript than TSDoc.
- TypeDoc takes advantage that TSDoc syntax is (with the exception of tags) a
  subset of markdown, so delegates most comment parsing to its markdown
  parser.
- The [`@inheritDoc`](../tags/inheritDoc.md) tag is declared as an inline tag
  by TSDoc, but TypeDoc recognizes it in block tag form as well for
  compatibility with JSDoc.
- The [`@label`](../tags/label.md) tag has been extended to support user
  specified meanings in declaration references.
- The [`@link`](../tags/link.md) tag may be parsed with either TSDoc's
  [declaration references](../declaration-references.md) or with TypeScript's
  resolution.
- The [`@param`](../tags/param.md) tag supports ignoring type annotations in
  order to support TypeScript's types-in-comments capability.
- The [`@privateRemarks`](../tags/privateRemarks.md) tag may be configured to
  be included in the documentation.
- The [`@public`](../tags/public.md) tag is not inherited by contained members.
- The [`@typeParam`](../tags/typeParam.md) tag supports ignoring type
  annotations in order to support TypeScript's types-in-comments capability.
