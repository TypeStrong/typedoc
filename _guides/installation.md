---
layout: 'guide'
title: 'Installation'
menuOrder: 1
---

# Installation

<ul class="toc">
<li><a href="#command-line-interface">Command line interface</a></li>
<li><a href="#task-runners">Task runners</a></li>
</ul>


## Command line interface

### Requirements

TypeDoc requires Node.js to be installed on your system. If you haven't done that already, head
over to their site and follow their install instructions:

http://nodejs.org/

Installing TypeDoc is pretty easy as it is available as a node package. Using ``npm`` ensures that
all relevant dependencies are setup correctly. Just decide whether you want a global or local setup.


### Global installation

If you want to directly use TypeDoc, this is the preferred way of installing it:

```bash
$ npm install --global typedoc
```

Like the TypeScript compiler, TypeDoc comes with a binary that can be called from anywhere if you
install TypeDoc as a global module. The name of the executable is ``typedoc``. To verify everything
is setup correctly, you can run TypeDoc with no arguments. It should output some help messages:

```bash
$ typedoc

Version 0.1.0
Syntax:   typedoc [options] [file ..]

Examples: typedoc --out ../doc/ hello.ts
```


### Local installation

If you want to use TypeDoc as a module within your project, e.g. to integrate it with your build
process, you can also install it as a local module.

```bash
$ npm install --save-dev typedoc
```

Within your modules you can access it by requiring ``typedoc``:

```js
var typedoc = require('typedoc');
var app = new typedoc.Application();
```

Head over to our [api documentation](/api/) to learn more about the exposed api.


## Task runners

Some great folks out there have created plugins so you can run TypeDoc with your favorite task runner.
There are plugins available for Grunt and Gulp, both of them can be easily installed using ``npm``. Both
plugins accept the same options as the cli application, see [usage](/guides/usage.html).


### Grunt

<dl class="specs">
    <dt>Name</dt><dd>grunt-typedoc</dd>
    <dt>Website</dt><dd>https://www.npmjs.org/package/grunt-typedoc/</dd>
    <dt>Author</dt><dd>[Bart van der Schoor](https://github.com/Bartvds)</dd>
</dl>

You can install the plugin with the following command:

```bash
$ npm install --save-dev grunt-typedoc
```

Update the following snippet with your configuration and add it to your ``gruntfile.js`` file:

```js
grunt.loadNpmTasks('grunt-typedoc');
grunt.initConfig({
    typedoc: {
        build: {
            options: {
                module: 'commonjs',
                target: 'es5',
                out: 'docs/',
                name: 'My project title'
            },
            src: 'src/**/*'
        }
    }
});
```


### Gulp

<dl class="specs">
    <dt>Name</dt><dd>gulp-typedoc</dd>
    <dt>Website</dt><dd>https://www.npmjs.org/package/gulp-typedoc/</dd>
    <dt>Author</dt><dd>[Rogier Schouten](https://github.com/rogierschouten)</dd>
</dl>

You can install the plugin with the following command:

```bash
$ npm install --save-dev gulp-typedoc
```

Update the following snippet with your configuration and add it to your ``gulpfile.js`` file:

```js
var typedoc = require("gulp-typedoc");
gulp.task("typedoc", function() {
    return gulp
        .src(["src/**/*.ts"])
        .pipe(typedoc({
            module: "commonjs",
            target: "es5",
            out: "docs/",
            name: "My project title"
        }))
    ;
});
```
