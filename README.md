# TypeDoc

> Documentation generator for TypeScript projects.

[![Build Status](https://travis-ci.org/TypeStrong/typedoc.svg?branch=master)](https://travis-ci.org/TypeStrong/typedoc)
[![NPM Version](https://badge.fury.io/js/typedoc.svg)](http://badge.fury.io/js/typedoc)
[![Chat on Gitter](https://badges.gitter.im/TypeStrong/typedoc.svg)](https://gitter.im/TypeStrong/typedoc?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Greenkeeper Enabled](https://badges.greenkeeper.io/TypeStrong/typedoc.svg)](https://greenkeeper.io/)

## Installation

TypeDoc runs on Node.js and is available as an NPM package. You can install TypeDoc
in your project's directory as usual:

```bash
$ npm install typedoc --save-dev
```

Like the TypeScript compiler, TypeDoc comes with a binary that can be called from anywhere
if you install TypeDoc as a global module. The name of the executable is ``typedoc``.

```bash
$ npm install typedoc --global
$ typedoc
```

## Usage

### Shell

TypeDoc accepts most of the command line arguments that the TypeScript compiler accepts. One major
difference is the fact that one may pass an entire directory instead of individual files to the documentation
generator. So in order to create a documentation for an entire project you simply type:

```bash
$ typedoc --out path/to/documentation/ path/to/typescript/project/
```

### Important note

Starting with version 0.2, TypeDoc no longer can predict whether files should be treated as modules
or whether the project should be compiled into one big namespace. You must specify the `mode` argument
in order to change the behaviour of TypeDoc.


### Arguments

* `--out <path/to/documentation/>`<br>
  Specifies the location the documentation should be written to.
* `--mode <file|modules>`<br>
  Specifies the output mode the project is used to be compiled with.
* `--options`<br>
  Specify a js option file that should be loaded. If not specified TypeDoc will look for 'typedoc.js' in the current directory.
* `--json <path/to/output.json>`<br>
  Specifies the location and file name a json file describing the project is written to. When specified no documentation will be generated.
* `--ignoreCompilerErrors`<br>
  Should TypeDoc still generate documentation pages even after the compiler has returned errors?

#### Source file handling
* `--exclude <pattern>`<br>
  Exclude files by the given pattern when a path is provided as source. Supports standard minimatch patterns (see [#170](https://github.com/TypeStrong/typedoc/issues/170))
* `--includeDeclarations`<br>
  Turn on parsing of .d.ts declaration files.
* `--externalPattern <pattern>`<br>
  Define a pattern for files that should be considered being external.
* `--excludeExternals`<br>
  Prevent externally resolved TypeScript files from being documented.
* `--excludePrivate`<br>
  Prevent private members from being included in the generated documentation.

#### TypeScript compiler
* `--module <commonjs, amd, system or umd>`<br>
  Specify module code generation: "commonjs", "amd", "system" or "umd".
* `--target <ES3, ES5, or ES6>`<br>
  Specify ECMAScript target version: "ES3" (default), "ES5" or "ES6"

#### Theming
* `--theme <default|minimal|path/to/theme>`<br>
  Specify the path to the theme that should be used.
* `--name <Documentation title>`<br>
  Set the name of the project that will be used in the header of the template.
* `--readme <path/to/readme|none>`<br>
  Path to the readme file that should be displayed on the index page. Pass `none` to disable the index page
  and start the documentation on the globals page.
* `--plugin`<br>
  Specify the npm plugins that should be loaded. Omit to load all installed plugins, set to 'none' to load no plugins.
* `--hideGenerator`<br>
  Do not print the TypeDoc link at the end of the page.
* `--gaID`<br>
  Set the Google Analytics tracking ID and activate tracking code.
* `--gaSite <site>`<br>
  Set the site name for Google Analytics. Defaults to `auto`
* `--entryPoint <fully.qualified.name>`<br>
  Specifies the fully qualified name of the root symbol. Defaults to global namespace.
* `--gitRevision <revision|branch>`<br>
  Use specified revision or branch instead of the last revision for linking to GitHub source files.

#### Content
* `--includes <path/to/includes>`<br>
  Specifies the location to look for included documents. One may use <code>[[include:FILENAME]]</code>
  in comments to include documents from this location.

* `--media <path/to/media>`<br>
  Specifies the location with media files that should be copied to the output directory. In order to create
  a link to media files use the pattern <code>media://FILENAME</code> in comments.

#### Miscellaneous
* `--version`<br>
  Display the version number of TypeDoc.
* `--help`<br>
  Display all TypeDoc options.

### Webpack

There is a plugin available to run TypeDoc with Webpack created by Microsoft. You can find it on NPM:<br>
[https://www.npmjs.com/package/typedoc-webpack-plugin](https://www.npmjs.com/package/typedoc-webpack-plugin)


### Gulp

There is a plugin available to run TypeDoc with Gulp created by Rogier Schouten. You can find it on NPM:<br>
[https://www.npmjs.org/package/gulp-typedoc/](https://www.npmjs.org/package/gulp-typedoc/)


### Grunt

There is a plugin available to run TypeDoc with Grunt created by Bart van der Schoor. You can find it on NPM:<br>
[https://www.npmjs.org/package/grunt-typedoc](https://www.npmjs.org/package/grunt-typedoc)

## Plugins

* [External Module Name](https://github.com/christopherthielen/typedoc-plugin-external-module-name) - Set the name of TypeDoc external modules
* [Sourcefile URL](https://github.com/gdelmas/typedoc-plugin-sourcefile-url) - Set custom source file URL links

## Advanced guides and docs

Visit our homepage for advanced guides and an extensive API documentation:<br>
[http://typedoc.org](http://typedoc.org)


## Contributing

This project is maintained by a community of developers. Contributions are welcome and appreciated.
You can find TypeDoc on GitHub; feel free to start an issue or create a pull requests:<br>
[https://github.com/TypeStrong/typedoc](https://github.com/TypeStrong/typedoc)


## License

Copyright (c) 2015 [Sebastian Lenz](http://typedoc.org).<br>
Copyright (c) 2016-2017 [TypeDoc Contributors](https://github.com/TypeStrong/typedoc/graphs/contributors).<br>
Licensed under the Apache License 2.0.
