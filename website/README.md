# TypeDoc homepage
The contents of this directory are sourced from https://github.com/TypeStrong/typedoc and pushed to the http://typedoc.org website. Website rendering is done by GitHub pages using [Jekyll](https://jekyllrb.com/).

> **Do not submit PRs to the https://github.com/TypeStrong/typedoc-site repo.**
> That repository holds the generated files.

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
Please do not update the API docs when working on the project since it should only be updated when a release
is made available on npm.

## Running Jekyll locally
You can run Jekyll on a computer with Ruby 2.1 or higher installed and the `bundle` gem.

```bash
bundle install
bundle exec jekyll serve
```

See the [Github Guide](https://help.github.com/articles/setting-up-your-github-pages-site-locally-with-jekyll/)
for a complete guide.

## Pushing to GitHub pages (maintainers)
Run the `deploy` script in the above directory.
