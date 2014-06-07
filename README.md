# TypeDoc

> Create api documentations for typescript projects.


## Installation

TypeDoc runs on Node.js and is available as an NPM package. You can install TypeDoc
in your project's directory as usual:

```shell
$ npm install typedoc --save-dev
```

Like the TypeScript compiler, TypeDoc comes with a binary that can be called from anywhere
if you install TypeDoc as a global module. The name of the executable is ``typedoc``.

```shell
$ npm install typedoc --global
$ typedoc
```


## Preview

If you want to know what a documentation created with TypeDoc looks like, head over
to the GitHub page of the project. It contains an api documentation of TypeDoc generated with
TypeDoc:

http://sebastian-lenz.github.io/typedoc


## Usage

### Shell

TypeDoc accepts most of the command line arguments that the TypeScript compiler accepts. One major
difference is the fact that one may pass an entire directory instead of individual files to the documentation
generator. So in order to create a documentation for an entire project you simply type:

```shell
$ typedoc --out path/to/documentation/ path/to/typescript/project/
```

### Arguments

```--out <path/to/documentation/>```

Specifies the location the documentation should be written to.

```--name <Documentation title>```

Set the name of the project that will be used in the header of the template.

```--module <commonjs or amd>```

Specify module code generation: "commonjs" or "amd"

```--target <ES3 or ES5>```

Specify ECMAScript target version: "ES3" (default), or "ES5"

```--exclude <pattern>```

Exclude files by the given pattern, when a path is provided as source


### Gulp

There is a plugin available to run TypeDoc with Gulp created by Rogier Schouten. You can find it on NPM:
https://www.npmjs.org/package/gulp-typedoc/


### Grunt

There is a plugin available to run TypeDoc with Grunt created by Bart van der Schoor. You can find it on NPM:
https://www.npmjs.org/package/grunt-typedoc


## Document your code

TypeDoc runs the TypeScript compiler and extracts type information from the generated compiler symbols.
Therefore you don't have to include additional metadata within your comments, TypeScript specific elements
like classes, enumerations or property types and access modifiers will be automatically detected.

The documentation generator currently understands these javadoc tags:

 * ```@param <param name>```
 * ```@retrun(s)```

All other tags will be rendered as definition lists, so they are not lost.
