---
title: Other
---

Options which don't fit elsewhere.

## watch

```bash
$ typedoc --watch
```

Use TypeScript's incremental compiler to watch source files for changes and
build the docs on change. May be combined with `--emit`.

Note: This mode will only detect changes to files watched by the TypeScript
compiler. Changes to other files (`README.md`, imported files with `@include` or
`@includeCode`) will not cause a rebuild.

## preserveWatchOutput

```bash
$ typedoc --watch --preserveWatchOutput
```

By default, `--watch` clears the screen between compilation steps. If
`--preserveWatchOutput` is specified, this behavior is disabled.

## help

```bash
$ typedoc --help
```

Print all available options, along with a short description. Also prints a list
of supported highlighting languages.

## version

```bash
$ typedoc --version
```

Prints TypeDoc's version.

## showConfig

```bash
$ typedoc --showConfig
```

Print TypeDoc's config and exit. Useful for debugging what options have been set.

## logLevel

```bash
$ typedoc --logLevel Verbose
```

Specifies the log level to be printed to the console. Defaults to `Info`. The available levels are:

-   Verbose - Print all log messages, may include debugging information intended for TypeDoc developers
-   Info - Print informational log messages along with warning and error messages
-   Warn - Print warning and error messages
-   Error - Print only error messages
-   None - Print no messages.

## skipErrorChecking

```bash
$ typedoc --skipErrorChecking
```

Instructs TypeDoc to not run the type checker before converting a project. Enabling this option may improve generation time, but could also result in crashes if your code contains type errors.
