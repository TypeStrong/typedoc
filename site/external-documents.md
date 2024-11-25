---
title: External Documents
---

It can be convenient to write long-form guides/tutorials outside of doc comments.
To support this, TypeDoc supports including documents which exist as standalone
`.md` files in your repository.

## Including Documents

These documents can be included in your generated documentation in a few ways.

1. With the [`@document`](tags/document.md) tag.
2. With the [projectDocuments] option.
3. As a child of another document using yaml frontmatter.

### The `@document` Tag

The `@document` tag can be placed in the comments for most types to add
a child to that reflection in the generated documentation. The content of
the `@document` tag should simply be a path to a markdown document to be
included in the site.

```ts
/**
 * @document documents/external-markdown.md
 */
```

The document path is relative to the file in which the comment appears in.

### Project Documents

If your project has multiple entry points, the `@document` tag cannot be used
to place documents at the top level of the project as there is no comment location
associated with the project. For this use case, specify the [projectDocuments]
option. This option can be specified multiple times, or a glob may be specified
to include multiple documents.

```json
// typedoc.json
{
    "projectDocuments": ["documents/*.md"]
}
```

TypeDoc's default [sorting](options/organization.md#sort) options
will cause project documents to be re-ordered alphabetically. If not desired, sorting
for entry points can be disabled with the [sortEntryPoints](options/organization.md#sortentrypoints)
option.

## Document Content

Documents may include a yaml frontmatter section which can be used to control
some details about the document. Note: The frontmatter **must** begin and end with
`---` on lines by itself. TypeDoc's frontmatter extraction uses this to determine
when the block ends.

```yaml
---
title: External Markdown
group: Documents
category: Guides
children:
    - ./child.md
    - ./child2.md
---
```

The `title` key specifies the document name, which will be used in the sidebar
navigation. The `group` and `category` keys are equivalent to the
[`@group`](tags/group.md)and [`@category`](tags/category.md)
tags and control how the document shows up in the Index section on the page
for the reflection which owns the document. The `children` key can be used to specify
additional documents which should be added underneath the current document.

Documents may include relative links to images or other files/documents. TypeDoc
will detect links within markdown `[text](link)` formatted links, `<a>` tags
and `<img>` tags and automatically resolve them to other documents in the project.

if a path cannot be resolved to a part of the documentation, TypeDoc will copy
the file found to a `media` folder in your generated documentation and update the
link to point to it, so relative links to images will still work.

Documents may also include `{@link}` inline tags, which will be resolved as
[declaration references](declaration-references.md) by
TypeDoc.

[projectDocuments]: options/input.md#projectdocuments
