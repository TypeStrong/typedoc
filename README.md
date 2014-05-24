# TypeDoc

> Create api documentations for typescript projects.


## Installation

TypeDoc runs on Node.js and is available as an NPM package. You can install TypeDoc
in your project's directory as usual:

``
$ npm install typedoc --save-dev
``

Like the TypeScript compiler, TypeDoc comes with a binary that can be called from anywhere
if you install TypeDoc as a global module. The name of the executable is ``tsd``.

``
$ npm install typedoc --global
$ tsd
``


## Usage

TypeDoc accepts most of the command line arguments that the TypeScript compiler accepts. One major
difference is the fact that one may pass an entire directory instead of individual files to the documentation
generator. So in order to create a documentation for an entire project you simply type:

``
$ tsd --out path\to\documentation\ path\to\typescript\project\
``