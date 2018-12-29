# TypeDoc homepage
The contents of this directory push to the http://typedoc.org website. Rendered using Jekyll.

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

## Running Jekyll locally
You can run Jekyll on a computer with Ruby 2.1 or higher installed and the `bundle` gem.

```bash
bundle install
bundle exec jekyll serve
```

See the [Github Guide](https://help.github.com/articles/setting-up-your-github-pages-site-locally-with-jekyll/)
for a complete guide.

## Pushing to GitHub pages (maintainers)
Deploy instructions TBD
