## The `@includeCode` Tag

For convenience, an `@includeCode` inline tag is also recognized, which will include the referenced file within a code block, using the file extension for selecting the syntax highlighting language.
As an example, this file is inserting the code block below using:

```md
{@includeCode ../reexports.ts}
```

**Result:**
{@includeCode ../reexports.ts}

{@include ../../../site/tags/include.md#includePartsOfFiles}
