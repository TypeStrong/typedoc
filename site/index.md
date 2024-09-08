TypeDoc converts comments in TypeScript's source code into HTML documentation
or a JSON model.

## Quick Start

TypeDoc generates documentation based on your exports. It will follow re-exports
to document members declared in other files for each entry point.

```bash
# Install
npm install --save-dev typedoc

# Build docs using package.json "exports" or "main" fields as entry points
npx typedoc
```

If TypeDoc is unable to discover your entry points, they can be provided manually:

```bash
# Build docs using exports from src/index.ts
npx typedoc src/index.ts
```

If you are documenting an application rather than a library, which doesn't have
a single entry point, you may want to document each file individually.

```bash
# Generate docs for all TypeScript files under src
npx typedoc --entryPointStrategy Expand src
```

TypeDoc supports a variety of [options](./options.md) and [themes](./themes.md).
It is extensible via the [plugin API](./plugins.md).
