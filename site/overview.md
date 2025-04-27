---
title: Overview
---

## Requirements

TypeDoc requires [Node.js](https://nodejs.org/) to run. It supports the current LTS
version or newer. It can be installed either locally to your project or globally.

> [!warning]
> If you install globally, be aware that [npm/cli#7057](https://github.com/npm/cli/issues/7057)
> means that plugins and themes will get their own installation of TypeDoc unless you use the
> `--legacy-peer-deps` flag. This will break many plugins and cause warnings from TypeDoc.

TypeDoc aims to support the two latest TypeScript releases for the current release. Depending
on the scale of breaking changes introduced in a new TypeScript version, a given version may
support more versions of TypeScript. TypeDoc may work with older (or newer) TypeScript versions, but
the supported version range will generally not include versions not supported by DefinitelyTyped.

| TypeDoc Version | TypeScript Version | Status             |
| --------------- | ------------------ | ------------------ |
| 0.28            | 5.0 through 5.8    | ✅ Maintained      |
| 0.27            | 5.0 through 5.8    | ⚠️ Security Updates |
| 0.26            | 4.6 through 5.6    | ❌ Unmaintained    |
| 0.25            | 4.6 through 5.4    | ❌ Unmaintained    |
| 0.24            | 4.6 through 5.1    | ❌ Unmaintained    |
| 0.23            | 4.6 through 5.0    | ❌ Unmaintained    |
| 0.22            | 4.0 through 4.7    | ❌ Unmaintained    |
| 0.21            | 4.0 through 4.4    | ❌ Unmaintained    |
| 0.20            | 3.9 through 4.2    | ❌ Unmaintained    |
| 0.19            | 3.9 through 4.0    | ❌ Unmaintained    |

## Command Line Interface

TypeDoc's CLI can be used through your terminal or npm scripts. Any arguments
passed to TypeDoc which are not flags are parsed as entry points. TypeDoc will
also read configuration from several files. See [Configuration](./options/configuration.md#compileroptions)
for details on where options are read from.

<details>
<summary><code>typedoc --help</code></summary>
{@includeCode generated/help.txt}
</details>

## Node Module

TypeDoc exposes an API which can be used to run it without any configuration files.

```js
import * as td from "typedoc";

// Application.bootstrap also exists, which will not load plugins
// Also accepts an array of option readers if you want to disable
// TypeDoc's tsconfig.json/package.json/typedoc.json option readers
const app = await td.Application.bootstrapWithPlugins({
    // Note: This accepts globs, do not pass paths with backslash path separators!
    entryPoints: ["src/index.ts"],
});

// May be undefined if errors are encountered.
const project = await app.convert();

if (project) {
    // Generate configured outputs
    await app.generateOutputs(project);

    // Alternatively...
    const outputDir = "docs";
    // Generate HTML rendered docs
    await app.generateDocs(project, outputDir);
    // Alternatively generate JSON output
    await app.generateJson(project, outputDir + "/docs.json");
}
```

## Browser Bundle

TypeDoc exports a limited portion of its API surface for users who want to process
serialized JSON from TypeDoc within a browser via `typedoc/browser`. The browser
entry point includes the following components:

- TypeDoc's models
- `Serializer` and `Deserializer` classes
- A small set of utility functions

```ts
import {
    ConsoleLogger,
    Deserializer,
    FileRegistry,
    setTranslations,
} from "typedoc/browser";

// Similar paths are available for ja, ko, zh
import translations from "typedoc/browser/en";

// Before doing anything with TypeDoc, it should be configured with translations
setTranslations(translations);

const projectJson = await fetch("...").then(r => r.json());

const logger = new ConsoleLogger();
const deserializer = new Deserializer(logger);
const project = deserializer.reviveProject("API Docs", projectJson, {
    projectRoot: "/",
    registry: new FileRegistry(),
});

// Now we can use TypeDoc's models to more easily analyze the json
console.log(project.getChildByName("SomeClass.property"));
console.log(project.getChildByName("SomeClass.property").type.toString());
```
