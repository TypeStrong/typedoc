# Third Party Symbols

TypeDoc 0.22 added support for linking to third party sites by associating a symbol name with npm packages.
Plugins can add support for linking to third party sites by calling `app.renderer.addUnknownSymbolResolver`.

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
            ref.moduleSource !== "@types/react" &&
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
