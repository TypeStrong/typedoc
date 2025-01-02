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

| TypeDoc Version | TypeScript Version | Status              |
| --------------- | ------------------ | ------------------- |
| 0.27            | 5.0 through 5.7    | ✅ Maintained       |
| 0.26            | 4.6 through 5.6    | ⚠️ Security Updates |
| 0.25            | 4.6 through 5.4    | ❌ Unmaintained     |
| 0.24            | 4.6 through 5.1    | ❌ Unmaintained     |
| 0.23            | 4.6 through 5.0    | ❌ Unmaintained     |
| 0.22            | 4.0 through 4.7    | ❌ Unmaintained     |
| 0.21            | 4.0 through 4.4    | ❌ Unmaintained     |
| 0.20            | 3.9 through 4.2    | ❌ Unmaintained     |
| 0.19            | 3.9 through 4.0    | ❌ Unmaintained     |

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
    entryPoints: ["src/index.ts"],
});

// May be undefined if errors are encountered.
const project = await app.convert();

if (project) {
    const outputDir = "docs";
    // Generate HTML rendered docs
    await app.generateDocs(project, outputDir);
    // Alternatively generate JSON output
    await app.generateJson(project, outputDir + "/docs.json");
}
```
