# TypeDoc homepage
The contents of this directory push to the http://typedoc.org website. Rendered using Jekyl.

## Writing guides
Guides are stored in the `_guides/` directory and written in Markdown. Each file should contain the following header section for Jekyl with an appropriate title and menu order.

```
---
layout: 'guide'
title: 'Installation'
menuOrder: 1
---
```

## Updating the API docs
With each stable release, run TypeDoc on the `src/index.ts` file and output to the `website/api/` directory.

## Pushing to GitHub pages (maintainers)
Use the `deploy` script to push to the `gh-pages` branch.
