#!/bin/sh

test -d ./tmp/output && rm -rf ./tmp/output
mkdir -p ./tmp/{output,screenshots,baseline}

docker run \
    --name typedoc-reg-suit \
    -v "$PWD/tmp/screenshots:/new" \
    -v "$PWD/tmp/baseline:/old" \
    -v "$PWD/tmp/output:/out" \
    ghcr.io/gerrit0/reg-suit-container:main
