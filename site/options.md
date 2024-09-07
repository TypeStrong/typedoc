---
title: Options
children:
    - options/configuration.md
    - options/input.md
    - options/output.md
    - options/comments.md
    - options/organization.md
    - options/validation.md
    - options/other.md
---

Any command line arguments that are passed without a flag will be parsed as entry points.
Any options passed on the command line will override options set in a configuration file.

<!--
Updating these lists can be easily done by going to each page and running the
following JS to copy what they should be to your clipboard. Ideally, someday this
becomes automated...

copy("-   " + $$(".toc-container > ol > li > ol > li > a").map(a => {
  const url = new URL(a.href)
  return `[${a.textContent}](${url.pathname}${url.hash})`
}).join("\n-   "))
-->

## Configuration Options

Options which control what files TypeDoc reads.

GERRIT TODO

## Input Options

Options which control how input is converted into a project that can be rendered
to HTML or JSON.

## Output Options

Options which control TypeDoc's HTML output.

## Comment Options

Options which control how TypeDoc parses comments.

## Organization Options

Controls how TypeDoc organizes content within a converted project.

## Validation Options

Configures the validation performed by TypeDoc on a converted project.

## General Options
