---
title: Include and Include Code
category: Documents
---

# Including other files

It can be convenient to write long-form guides/tutorials outside of doc comments.
To support this, TypeDoc supports including documents (like this page!) which exist
as standalone `.md` files in your repository.
These files can then import other files using the `@include` tag.

For example, the rest of this page is imported from `include-code.md` using:

```md
{@include ./include-code.md}
```

{@include ./include-code.md}
