---
title: Development
children:
    - plugins.md
    - themes.md
    - internationalization.md
    - third-party-symbols.md
    - local-storage.md
---

# Development

This page is a work in progress overview of TypeDoc's architecture.
For more details about each individual component, refer to the doc comments within each module.
It is intended primarily for those interested in contributing to the TypeDoc codebase or developing a plugin.

## High Level

TypeDoc follows several high level steps when called.

1. Read options - Necessary to determine which plugins should be loaded.
2. Load plugins
3. Read options again to pick up plugin options
4. Convert the input files into the models (also called reflections) that live under `src/lib/models`
5. Resolve the models<br>
   Necessary to handle links to models that might not have been created when the source model is generated.
6. Output the models by serializing to HTML and/or JSON

TypeDoc's code is loosely organized according to each of these steps.
The code to read options lives under `src/lib/utils/options`.
The plugin loading code lives in `src/lib/utils/plugins`.
Conversion is performed according to the Symbol's `ts.SymbolFlags`. Each distinct flag type gets its own converter function in `src/lib/converter/symbols.ts`.
Resolution is implemented entirely by internal plugins that live in `src/lib/output/plugins` and listen to the `Converter.EVENT_RESOLVE` event.
Output is split into two folders, for JSON output see the `src/lib/serialization` directory, and for HTML output see `src/lib/output`.

Plugins may effect any part of the process after step 2 by listening to events
fired by each component or adding / replacing handlers for a given task. As an
example, the [Converter](https://typedoc.org/api/classes/Converter.html) fires events before
starting conversion, when declarations are converted and when the project should
be resolved.

## Tests

TypeDoc has tests for individual utilities and some components, but the majority of the project is tested by converting source files into their JSON model and comparing it to a known good version. The basic example under `src/test/renderer/testProject` is rendered to HTML to test theme changes.

If changing the behavior of a converter or resolver, it should be possible to modify one of the existing tests under `src/test/converter`.
Bug fixes or feature additions which need to change one of the `specs*.json` files should run `pnpm rebuild_specs [converter|renderer] [converter filter]` to run the current build of TypeDoc on the source files and generate new specs.
For other components, we use [Mocha](https://mochajs.org/) to write tests.

### Running the Visual Regression Tests

When making changes to the themes, it is useful to be able to compare screenshots
from the new/old runs.

1. Run `node scripts/visual_regression.js`
2. Make the UI change
3. Run `node scripts/visual_regression.js`

The visual regression script accepts several arguments to control what it does,
run it with `--help` to see a summary of the available options.

## Components

For more detailed information about the implementation and API surface of each
component, consult its API documentation. All components are available on the
[Application](https://typedoc.org/api/classes/Application.html) class, which is passed to plugins.

### Options

TypeDoc provides some 30 options which determine how the project model is generated and output to disk.
The [Options](https://typedoc.org/api/classes/Configuration.Options.html) class consolidates application options into a single location and handles type conversion.

There are 11 builtin option types as specified by the [ParameterType](https://typedoc.org/api/enums/Configuration.ParameterType.html) enum.

- `String` - A string
- `Path` - A string which will be resolved to a path. Paths in config files will be resolved relative to the config directory.
- `Number` - A number which is not `NaN`
- `Boolean` - `true` or `false`
- `Map` - Defines a map between string keys and an arbitrary type. See the [tests](https://github.com/TypeStrong/typedoc/blob/master/src/test/utils/options/declaration.test.ts#L39) for an example.
- `Mixed` - An object type that is passed through by TypeDoc to create specific implicit behavior.
- `Object` - An object type of which value keys can be overridden or extended by passing a new object.
- `Array` - An array of strings.
- `PathArray` - An array of paths, if specified in a config file, will be resolved relative to the config file directory.
- `ModuleArray` - An array of modules/paths. Items will be resolved if they start with `.`.
- `GlobArray` - An array of globs. Globs will be resolved if they do not start with `**`, after skipping leading `!` and `#` characters.

Options are discovered and set by option readers, which are documented in the
[Configuration.OptionsReader](https://typedoc.org/api/interfaces/Configuration.OptionsReader.html) interface.

Plugins can declare their own options by calling [Options.addDeclaration](https://typedoc.org/api/classes/Configuration.Options.html#adddeclaration)

### Plugins

Plugins should export a `load` function which will be called by TypeDoc when loading the plugin with an instance of `PluginHost`.
This function should add any options the plugin accepts and add any listeners necessary to effect TypeDoc's behavior.

```typescript
import { Application, Context, Converter, ParameterType } from "typedoc";

export function load(app: Application) {
    app.options.addDeclaration({
        name: "plugin-option",
        help: "Displayed when --help is passed",
        type: ParameterType.String, // The default
        defaultValue: "", // The default
    });

    app.converter.on(Converter.EVENT_RESOLVE, (context: Context) => {
        if (app.options.getValue("plugin-option") === "something") {
            // ...
        }
    });
}
```

### Converters

TypeDoc converts the syntax tree created by TypeScript into its own structure of
[Reflections](https://typedoc.org/api/classes/Models.Reflection.html) to allow
themes and serialization to work with a standard object format. Conversion is
done primarily in three files.

- [symbols.ts](https://github.com/TypeStrong/typedoc/blob/master/src/lib/converter/symbols.ts) - contains converters for each `ts.Symbol` that is exported from entry points.
- [types.ts](https://github.com/TypeStrong/typedoc/blob/master/src/lib/converter/types.ts) - contains converters for `ts.Type`s and `ts.TypeNode`s.
- [jsdoc.ts](https://github.com/TypeStrong/typedoc/blob/master/src/lib/converter/jsdoc.ts) - contains converters for types and symbols declared within JSDoc comments.

### JSON Output

TypeDoc can produce JSON output which can be consumed by other tools. The format
of this JSON is defined by the
[JSONOutput.ProjectReflection](https://typedoc.org/api/interfaces/JSONOutput.ProjectReflection.html)
interface. If plugins want to cause custom properties to be included in the
output JSON, they can achieve this by adding a serializer to
[Serializer](https://typedoc.org/api/classes/Serializer.html). If custom
properties are added, they should generally also be revived with a
[Deserializer](https://typedoc.org/api/classes/Deserializer.html) so that they
can be used with TypeDoc's packages mode.

### HTML Output

See [Custom Themes](./themes.md) for creating a theme.
