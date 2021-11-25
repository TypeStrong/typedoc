# Custom Themes

TypeDoc 0.22 changes how themes are defined, necessarily breaking compatibility with all Handlebars based themes
created for TypeDoc 0.21 and earlier. In 0.22, themes are defined by plugins calling the `defineTheme` method on
`Application.renderer` when plugins are loaded. The most trivial theme, which exactly duplicates the default theme
can be created by doing the following:

```ts
import { Application, DefaultTheme } from "typedoc";

export function load(app: Application) {
    app.renderer.defineTheme("mydefault", DefaultTheme);
}
```

This isn't very interesting since it exactly duplicates the default theme. Most themes need to adjust the templates
in some way. This can be done by providing them class which returns a different context class. Say we wanted to replace
TypeDoc's default analytics helper with one that uses [Open Web Analytics](https://www.openwebanalytics.com/) instead of
Google Analytics. This could be done with the following theme:

```tsx
import { Application, DefaultTheme, PageEvent, JSX } from "typedoc";

class MyThemeContext extends DefaultThemeRenderContext {
    // Important: If you use `this`, this function MUST be bound! Template functions are free
    // to destructure the context object to only grab what they care about.
    override analytics = () => {
        // Reusing existing option rather than declaring our own for brevity
        if (!this.options.isSet("gaSite")) return;

        const site = this.options.getValue("gaSite");

        const script = `
(function() {
    var _owa = document.createElement('script'); _owa.type = 'text/javascript';
    _owa.async = true; _owa.src = '${site}' + '/modules/base/js/owa.tracker-combined-min.js';
    var _owa_s = document.getElementsByTagName('script')[0]; _owa_s.parentNode.insertBefore(_owa,
    _owa_s);
}());
`.trim();

        return (
            <script>
                <JSX.Raw html={script} />
            </script>
        );
    };
}

class MyTheme extends DefaultTheme {
    private _contextCache?: MyThemeContext;
    override getRenderContext() {
        this._contextCache ||= new MyThemeContext(
            this._markedPlugin,
            this.application.options
        );
        return this._contextCache;
    }
}

export function load(app: Application) {
    app.renderer.defineTheme("open-web-analytics", MyTheme);
}
```

## Hooks (v0.22.8+)

When rendering themes, TypeDoc's default theme will call several functions to allow plugins to inject HTML
into a page without completely overwriting a theme. Hooks live on the parent `Renderer` and may be called
by child themes which overwrite a helper with a custom implementation. As an example, the following plugin
will cause a popup on every page when loaded.

```tsx
import { Application, JSX } from "typedoc";
export function load(app: Application) {
    app.renderer.hooks.on("head.end", () => (
        <script>
            <JSX.Raw html="alert('hi!');" />
        </script>
    ));
}
```

For documentation on the available hooks, see the [RendererHooks](https://typedoc.org/api/interfaces/RendererHooks.html)
documentation on the website.

## Future Work

The following is not currently supported by TypeDoc, but is planned on being included in a future version.

-   Support for pre-render and post-render async actions for copying files, preparing the output directory, etc.
    In the meantime, listen to `RendererEvent.BEGIN` or `RendererEvent.END` and perform processing there.
