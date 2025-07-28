#!/bin/bash
# Expects to be executed in the typedoc repo root folder
set -e

node bin/typedoc --help --logLevel Error > site/generated/help.txt
node scripts/generate_site_plugins.js

# Build the API docs
if [[ -n "$CI" || ! -d docs ]]; then
    node bin/typedoc --html docs --json docs/docs.json --readme none
fi

# Build the example
if [[ -n "$CI" || ! -d example/docs ]]; then
    cd example
    pnpm i
    # Ignoring warnings here because we inherit from Array, which results in
    # a few warnings because the docs in the .d.ts have bad @param comments
    # We might want to change TypeDoc's validation logic to make this not a
    # warning at some point if the relevant comments show up on both signatures.
    pnpm run typedoc --logLevel Error
    cd ..
fi

# Use changelog as of last release
git show $(git describe --tags --abbrev=0):CHANGELOG.md | sed 's/#* Unreleased//' > site/generated/CHANGELOG.md

# Build the actual site, references the API docs
node bin/typedoc --options site/typedoc.config.jsonc --treatWarningsAsErrors

# Create/copy static files
node scripts/generate_options_schema.js docs-site/schema.json
# cspell: words googlede
cp site/googlede482cdb17c37ad4.html docs-site/googlede482cdb17c37ad4.html

cp -r example/docs docs-site/example
cp -r docs docs-site/api
