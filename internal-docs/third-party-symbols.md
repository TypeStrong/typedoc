# Third Party Symbols

TypeDoc 0.22 added support for linking to third party sites by associating a symbol name with npm packages.

Since TypeDoc 0.23.13, some mappings can be defined without a plugin by setting [`externalSymbolLinkMappings`][externalSymbolLinkMappings].
This should be set to an object whose keys are package names, and values are the `.` joined qualified name
of the third party symbol. If the link was defined with a user created declaration reference, it may also
have a `:meaning` at the end. TypeDoc will _not_ attempt to perform fuzzy matching to remove the meaning from
keys if not specified, so if meanings may be used, a url must be listed multiple times.

Global external symbols are supported, but may have surprising behavior. TypeDoc assumes that if a symbol was
referenced from a package, it was exported from that package. This will be true for most native TypeScript packages,
but packages which rely on `@types` will be linked according to that `@types` package for that package name.

Furthermore, types which are defined in the TypeScript lib files (including `Array`, `Promise`, ...) will be
detected as belonging to the `typescript` package rather than the `global` package. In order to support both
`{@link !Promise}` and references to the type within source code, both `global` and `typescript` need to be set.

```jsonc
// typedoc.json
{
    "externalSymbolLinkMappings": {
        // For these you should probably install typedoc-plugin-mdn-links instead
        "global": {
            // Handle {@link !Promise}
            "Promise": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
        },
        "typescript": {
            // Handle type X = Promise<number>
            "Promise": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
        },
    },
}
```

A wildcard can be used to provide a fallback link to any unmapped type.

```jsonc
// typedoc.json
{
    "externalSymbolLinkMappings": {
        "external-lib": {
            "SomeObject": "https://external-lib.site/docs/SomeObject",
            "*": "https://external-lib.site/docs",
        },
    },
}
```

Plugins can add support for linking to third party sites by calling [`app.converter.addUnknownSymbolResolver`][addUnknownSymbolResolver].

If the given symbol is unknown, or does not appear in the documentation site, the resolver may return `undefined`
and no link will be rendered unless provided by another resolver.

The following plugin will resolve a few types from React to links on the official React documentation site.

```ts
import { Application, type DeclarationReference } from "typedoc";

const knownSymbols = {
    Component: "https://reactjs.org/docs/react-component.html",
    PureComponent: "https://reactjs.org/docs/react-api.html#reactpurecomponent",
};

export function load(app: Application) {
    app.converter.addUnknownSymbolResolver((ref: DeclarationReference) => {
        if (
            // TS defined symbols
            ref.moduleSource !== "@types/react" &&
            // User {@link} tags
            ref.moduleSource !== "react"
        ) {
            return;
        }

        // If someone did {@link react!}, link them directly to the home page.
        if (!ref.symbolReference) {
            return "https://reactjs.org/";
        }

        // Otherwise, we need to navigate through the symbol reference to
        // determine where they meant to link to. Since the symbols we know
        // about are all a single "level" deep, this is pretty simple.

        if (!ref.symbolReference.path) {
            // Someone included a meaning, but not a path.
            // https://typedoc.org/guides/declaration-references/#meaning
            return;
        }

        if (ref.symbolReference.path.length === 1) {
            const name = ref.symbolReference.path[0].path;
            if (knownSymbols.hasOwnProperty(name)) {
                return knownSymbols[name as never];
            }
        }
    });
}
```

Since TypeDoc 0.23.26, plugins may also return return an object for more control
over the displayed link. The returned `caption` will be used if the user does not
specify the link text.

```ts
import { Application, type DeclarationReference } from "typedoc";

const documentedExports = [
    "chunk",
    "compact",
    "concat",
    "difference",
    "differenceBy",
    "differenceWith",
];

export function load(app: Application) {
    app.converter.addUnknownSymbolResolver((ref: DeclarationReference) => {
        if (
            // TS defined symbols
            ref.moduleSource !== "@types/lodash" &&
            // User {@link} tags
            ref.moduleSource !== "lodash"
        ) {
            return;
        }

        // If someone did {@link lodash!}, link them directly to the home page.
        if (!ref.symbolReference) {
            return "https://lodash.com/";
        }

        if (!ref.symbolReference.path) {
            // Someone included a meaning, but not a path.
            // https://typedoc.org/guides/declaration-references/#meaning
            return;
        }

        if (ref.symbolReference.path.length === 1) {
            const name = ref.symbolReference.path[0].path;
            if (documentedExports.includes(name)) {
                return {
                    target: `https://lodash.com/docs/4.17.15#${name}`,
                    caption: name,
                };
            }
        }
    });
}
```

The unknown symbol resolver will also be passed the reflection containing the link
and, if the link was defined by the user, the [CommentDisplayPart] which was parsed into the [DeclarationReference] provided as the first argument.

If `--useTsLinkResolution` is on (the default), it may also be passed a [ReflectionSymbolId] referencing the symbol that TypeScript resolves the link to.

[externalSymbolLinkMappings]: https://typedoc.org/options/comments/#externalsymbollinkmappings
[CommentDisplayPart]: https://typedoc.org/api/types/CommentDisplayPart.html
[DeclarationReference]: https://typedoc.org/api/interfaces/DeclarationReference.html
[ReflectionSymbolId]: https://typedoc.org/api/classes/Application.html
[addUnknownSymbolResolver]: https://typedoc.org/api/classes/Converter.html#addUnknownSymbolResolver
