---
title: Configuration
---

These options control where TypeDoc reads its configuration from. TypeDoc will read options
from the [options](#options) file, the `"typedocOptions"` key in your `package.json` file,
and a `"typedocOptions"` key in your tsconfig.json.

All paths within configuration files are resolved relative to the options file they
are specified within.

## options

```bash
typedoc --options <filename>
```

Specify a configuration file to be loaded, which should contain entries that correspond
to command-line options/flags. If not specified, TypeDoc will look for a configuration
file matching one of the valid config names in the current directory:

- typedoc.json
- typedoc.jsonc
- typedoc.config.js
- typedoc.config.cjs
- typedoc.config.mjs
- typedoc.js (avoid this name, Windows CMD will try to run it instead of calling TypeDoc when running from that directory)
- typedoc.cjs
- typedoc.mjs
- The same filenames under the `.config` directory, `.config/typedoc.json`, ...

Option files may also contain an extends key, which specifies an additional file
to be loaded before importing options from the current file.

### JSON Files

If you are using a `typedoc.json` file, VSCode should automatically pick up the schema.
If it does not, you can instruct your editor to pick up the schema with a `$schema` key.

```json
{
    "$schema": "https://typedoc.org/schema.json",
    "entryPoints": ["./src/index.ts", "./src/secondary-entry.ts"],
    "out": "doc"
}
```

Like `tsconfig.json`, JSON configuration files are parsed as JSONC, which means that you
can safely use trailing commas and comments in your file.

### JavaScript Files

If you are using a JavaScript file for options, it should export an object whose keys
are the option names. For example:

```js
/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
    entryPoints: ["./src/index.ts", "./src/secondary-entry.ts"],
    out: "doc",
};

export default config;
```

## tsconfig

```bash
typedoc --tsconfig tsconfig.json
```

Specify a `tsconfig.json` file that options should be read from. If not specified TypeDoc
will look for `tsconfig.json` in the current directory and parent directories like `tsc` does.

When TypeDoc loads a `tsconfig.json` file, it will also read TypeDoc options declared under
the `"typedocOptions"` key and look for a `tsdoc.json` file in the same directory to read
supported tags.

See [TSDoc Support](../doc-comments/tsdoc-support.md) for details on how to use a `tsdoc.json` file.

## compilerOptions

This option may only be set within a config file.

```jsonc
// typedoc.json
{
    "compilerOptions": {
        "skipLibCheck": true,
        "strictNullChecks": false,
    },
}
```

Used to selectively override compiler options for generating documentation.
TypeDoc parses code using the TypeScript compiler and will therefore behave
similarly to tsc. Values set with this option will override options read from
tsconfig.json. See [#1891](https://github.com/TypeStrong/typedoc/pull/1891) for details.

## plugin

```bash
typedoc --plugin typedoc-plugin-markdown
typedoc --plugin ./custom-plugin.js
```

Specifies the plugins that should be loaded. By default, no plugins are loaded.
See [Plugins](../plugins.md) for a list of available plugins.

If using a JavaScript configuration file, the `plugin` option may be given
a function which will be called to load a plugin.
