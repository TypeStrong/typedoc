---
layout: 'guide'
title: 'Usage'
menuOrder: 2
---

# Usage

## Arguments

TypeDoc accepts most of the command line arguments that the TypeScript compiler accepts. All
arguments that are passed in without a flag will be parsed as input files. TypeDoc accepts
directories as input files, it will .

In order to create a documentation for an entire project you simply type:

```bash
$ typedoc --out path/to/documentation/ path/to/typescript/project/
```


### out

```bash
$ typedoc --out <path/to/documentation/>
```

Specifies the location the documentation should be written to.


### name

```bash
$ typedoc --name <Documentation title>
```

Set the name of the project that will be used in the header of the template.


### readme

```bash
$ typedoc --readme <path/to/readme|none>
```

Path to the readme file that should be displayed on the index page. Pass none to disable the index page and start the documentation on the globals page.


### module

```bash
$ typedoc --module <commonjs or amd>
```

Specify module code generation: "commonjs" or "amd"


### target

```bash
$ typedoc --target <ES3 or ES5>
```

Specify ECMAScript target version: "ES3" (default), or "ES5"


### exclude

```bash
$ typedoc --exclude <pattern>
```

Exclude files by the given pattern when a path is provided as source


### theme

```bash
$ typedoc --theme <path/to/theme>
```

Specify the path to the theme that should be used


### includeDeclarations

```bash
$ typedoc --includeDeclarations
```

Turn on parsing of .d.ts declaration files.


### externalPattern

```bash
$ typedoc --externalPattern <pattern>
```

Define a pattern for files that should be considered being external.


### excludeExternals
```bash
$ typedoc --excludeExternals
```

Prevent externally resolved TypeScript files from being documented.


### gaID

```bash
$ typedoc --gaID
```

Set the Google Analytics tracking ID and activate tracking code.


### gaSite

```bash
$ typedoc --gaSite <site>
```

Set the site name for Google Analytics. Defaults to `auto`.


### hideGenerator
```bash
$ typedoc --hideGenerator
```

Do not print the TypeDoc link at the end of the page.


### verbose

```bash
$ typedoc --verbose
```

Print more information while TypeDoc is running.
