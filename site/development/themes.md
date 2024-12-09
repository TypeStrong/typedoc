---
title: Custom Themes
---

# Custom Themes

Themes are defined by plugins calling the `defineTheme` method on
`Application.renderer` when plugins are loaded. The most trivial theme, which
exactly duplicates the default theme can be created by doing the following:

```ts
import { Application, DefaultTheme } from "typedoc";

export function load(app: Application) {
    app.renderer.defineTheme("mydefault", DefaultTheme);
}
```

This isn't very interesting since it exactly duplicates the default theme. Most
themes need to adjust the templates in some way. This can be done by providing
them class which returns a different context class. Say we wanted to replace
TypeDoc's default footer with one that mentioned your copyright. This could be
done with the following theme.

In this case, it would probably be better to add this content using a render
hook for `footer.begin` or `footer.end`, but it can be done in this way as well.

```tsx
import { Application, DefaultTheme, PageEvent, JSX, Reflection } from "typedoc";

class MyThemeContext extends DefaultThemeRenderContext {
    // Important: If you use `this`, this function MUST be bound! Template functions
    // are free to destructure the context object to only grab what they care about.
    override footer = (context) => {
        return (
            <footer>
                {context.hook("footer.begin", context)}
                Copyright 2024
                {context.hook("footer.end", context)}
            </footer>
        );
    };
}

class MyTheme extends DefaultTheme {
    getRenderContext(pageEvent: PageEvent<Reflection>) {
        return new MyThemeContext(this, pageEvent, this.application.options);
    }
}

export function load(app: Application) {
    app.renderer.defineTheme("open-web-analytics", MyTheme);
}
```

## Hooks

When rendering themes, TypeDoc's default theme will call several functions to
allow plugins to inject HTML into a page without completely overwriting a theme.
Hooks live on the parent `Renderer` and may be called by child themes which
overwrite a helper with a custom implementation. As an example, the following
plugin will cause a popup on every page when loaded.

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

For documentation on the available hooks, see the [RendererHooks] documentation
on the website.

## Async Jobs

Themes which completely override TypeDoc's builtin renderer may need to perform
some async initialization or teardown after rendering. To support this, there
are two arrays of functions available on `Renderer` which plugins may add a
callback to. The renderer will call each function within these arrays when
rendering and await the results.

```ts
import { Application, RendererEvent } from "typedoc";
export function load(app: Application) {
    app.renderer.preRenderAsyncJobs.push(async (output: RendererEvent) => {
        app.logger.info(
            "Pre render, no docs written to " + output.outputDirectory + " yet",
        );
        // Slow down rendering by 1 second
        await new Promise((r) => setTimeout(r, 1000));
    });

    app.renderer.postRenderAsyncJobs.push(async (output: RendererEvent) => {
        app.logger.info(
            "Post render, all docs written to " + output.outputDirectory,
        );
    });
}
```

[RendererHooks]: https://typedoc.org/api/interfaces/RendererHooks.html

## Registering your own custom elements/attributes

Start by writing a `jsx.d.ts` file somewhere.

```ts
// src/jsx.d.ts
import { JSX as TypeDocJSX } from 'typedoc'

declare module 'typedoc' {
  namespace JSX {
    namespace JSX {
      interface IntrinsicAttributes {
        popover?: boolean
        popovertarget?: string
        popovertargetaction?: 'hide' | 'show' | 'toggle'
      }
      interface IntrinsicElements {
        // add your custom elements here, ie:
        /**
         * @example
         * ```tsx
         * <drop-down trigger="#my-trigger" class="header-menu">
         *   <button>Option #1</button>
         *   <button>Option #2</button>
         * </drop-down>
         * ```
         */
        'drop-down': IntrinsicAttributes & {
          /**
           * A query selector, ie: '#my-trigger'
           */
          trigger: string
        }
      }
    }
  }
}
```

Then in your plugin entry point, reference the `jsx.d.ts` file with a triple-slash directive.

```ts
// src/index.ts
/// <reference types="./jsx.d.ts" />

export function load(app: Application) { … }
```
