# Third Party Symbols

TypeDoc 0.22 added support for linking to third party sites by associating a symbol name with npm packages.
Plugins can add support for linking to third party sites by calling `app.renderer.addUnknownSymbolResolver`.

If the given symbol is unknown, or does not appear in the documentation site, the resolver may return `undefined`
and no link will be rendered unless provided by another resolver.

The following plugin will resolve a few types from React to links on the official React documentation site.

```ts
import { Application } from "typedoc";

const knownSymbols = {
    Component: "https://reactjs.org/docs/react-component.html",
    PureComponent: "https://reactjs.org/docs/react-api.html#reactpurecomponent",
};

export function load(app: Application) {
    app.renderer.addUnknownSymbolResolver("@types/react", (name: string) => {
        if (knownSymbols.hasOwnProperty(name)) {
            return knownSymbols[name as never];
        }
    });
}
```
