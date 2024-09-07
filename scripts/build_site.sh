#!/bin/sh
# Expects to be executed in the typedoc repo root folder

node bin/typedoc --help > generated/help.txt

# Build the API docs, only build JSON output here to remove ~2s from
# the time it takes to run this script.
node bin/typedoc --json docs/docs.json

# Build the actual site, references the API docs
node bin/typedoc --options site/typedoc.config.jsonc
