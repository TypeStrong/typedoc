# TypeDoc

Documentation generator for TypeScript projects.

![CI](https://github.com/TypeStrong/typedoc/workflows/CI/badge.svg)
![NPM Version](https://badge.fury.io/js/typedoc.svg)

## Documentation

For more detailed documentation, the changelog, and TypeDoc documentation rendered with TypeDoc, see https://typedoc.org.

## Installation

TypeDoc runs on Node.js and is available as a NPM package.

```text
npm install typedoc --save-dev
```

## Usage

To generate documentation TypeDoc needs to know your project entry point, and TypeScript
compiler options. It will automatically try to find your `tsconfig.json` file, so you can
just specify the entry point of your library:

```text
typedoc src/index.ts
```

If you have multiple entry points, specify each of them. If you specify a directory, TypeDoc
will treat each file contained within it as an entry point.

```text
typedoc package1/index.ts package2/index.ts
```

### Monorepos / Workspaces

If your codebase is comprised of one or more npm packages, you can pass the paths to these
packages and TypeDoc will attempt to determine entry points from your `package.json`'s `main`
property (or its default value `index.js`).
If any of the packages given are the root of an [npm Workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
or a [Yarn Workspace](https://classic.yarnpkg.com/en/docs/workspaces/) TypeDoc will find all
the `workpsaces` defined in the `package.json`.
This mode requires sourcemaps in your JS entry points, in order to find the TS entry points.
Supports wildcard paths in the same fashion as those found in npm or Yarn workspaces.

#### Single npm module

```text
typedoc --packages .
```

#### Monorepo with npm/Yarn workspace at the root

```text
typedoc --packages .
```

#### Monorepo with manually specified sub-packages to document

This can be useful if you do not want all your workspaces to be processed.
Accepts the same paths as would go in the `package.json`'s workspaces

```text
# Note the single quotes prevent shell widcard expansion, allowing typedoc to do the expansion
typedoc --packages a-package --packages 'some-more-packages/*' --packages 'some-other-packages/*'
```

### Arguments

For a complete list of the command line arguments run `typedoc --help` or visit
[our website](https://typedoc.org/guides/options/).

-   `--out <path/to/documentation/>`<br>
    Specifies the location the documentation should be written to. Defaults to `./docs`
-   `--json <path/to/output.json>`<br>
    Specifies the location and file name a json file describing the project is
    written to. When specified no documentation will be generated.
-   `--options`<br>
    Specify a json option file that should be loaded. If not specified TypeDoc
    will look for 'typedoc.json' in the current directory.
-   `--packages <path/to/package/>`<br>
    Specify one or more sub packages, or the root of a monorepo with workspaces.
    Supports wildcard paths in the same fashion as those found in npm or Yarn workspaces.
-   `--tsconfig <path/to/tsconfig.json>`<br>
    Specify a typescript config file that should be loaded. If not
    specified TypeDoc will look for 'tsconfig.json' in the current directory.

#### Source file handling

-   `--exclude <pattern>`<br>
    Exclude files by the given pattern when a path is provided as source.
    Supports standard minimatch patterns.
-   `--excludeNotDocumented`<br>
    Only document items which have a doc comment. This option is useful, if you
    want to document only small part of your symbols and do not show the
    remaining ones in the documentation.

#### Theming

-   `--theme <default|minimal|path/to/theme>`<br>
    Specify the path to the theme that should be used.
-   `--name <Documentation title>`<br>
    Set the name of the project that will be used in the header of the template.
-   `--readme <path/to/readme|none>`<br>
    Path to the readme file that should be displayed on the index page. Pass `none` to disable the index page
    and start the documentation on the globals page.

#### Miscellaneous

-   `--listInvalidSymbolLinks`<br>
    Display the list of links that don't point to actual code symbols.
-   `--version`<br>
    Display the version number of TypeDoc.
-   `--help`<br>
    Display all TypeDoc options.

## Contributing

This project is maintained by a community of developers. Contributions are welcome and appreciated.
You can find TypeDoc on GitHub; feel free to open an issue or create a pull request:
https://github.com/TypeStrong/typedoc

For more information, read the [contribution guide](https://github.com/TypeStrong/typedoc/blob/master/.github/CONTRIBUTING.md).

## License

Copyright (c) 2015 [Sebastian Lenz](https://typedoc.org).<br>
Copyright (c) 2016-2020 [TypeDoc Contributors](https://github.com/TypeStrong/typedoc/graphs/contributors).<br>
Licensed under the Apache License 2.0.
