# TypeDoc

> Documentation generator for TypeScript projects.

[![Build Status](https://travis-ci.org/TypeStrong/typedoc.svg?branch=master)](https://travis-ci.org/TypeStrong/typedoc)
[![Chat on Gitter](https://badges.gitter.im/TypeStrong/typedoc.svg)](https://gitter.im/TypeStrong/typedoc?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Greenkeeper Enabled](https://badges.greenkeeper.io/TypeStrong/typedoc.svg)](https://greenkeeper.io/)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

## Project Structure

This project is organized as a monorepo containing the following
packages:

* [typedoc](packages/typedoc) provides the parsing and rendering
  engine, and the CLI command to run them.

* [typedoc-default-themes](packages/typedoc-default-themes) provides
  the default themes that typedoc uses for rendering.

## Contributing

This project is maintained by a community of developers. Contributions
are welcome and appreciated.  You can find TypeDoc on GitHub; feel
free to start an issue or create a pull requests:<br>
[https://github.com/TypeStrong/typedoc](https://github.com/TypeStrong/typedoc)

The monorepo is maintained with
[Lerna](https://github.com/lerna/lerna). Generally, if you want to add
or remove dependencies, or publish packages, you should get acquainted
with Lerna.

In order to build the packages, you must first bootstrap:

```bash
$ npm bootstrap
```

Then you can build the whole project and test with:

```bash
$ npm build
```

## License

Copyright (c) 2015 [Sebastian Lenz](http://typedoc.org).<br>
Copyright (c) 2016-2018 [TypeDoc Contributors](https://github.com/TypeStrong/typedoc/graphs/contributors).<br>
Licensed under the Apache License 2.0.
