---
title: Plugins
summary: Overview of how to write a TypeDoc plugin
---

# Writing a TypeDoc Plugin

TypeDoc supports plugins which can modify how projects are converted, how
converted symbols are organized, and how they are displayed, among other things.
Plugins are Node modules which export a single `load` function that will be
called by TypeDoc with the [Application] instance which they are to be attached
to. Plugins should assume that they may be loaded multiple times for different
applications, and that a single load of an application class may be used to
convert multiple projects.

Plugins may be either ESM or CommonJS, but TypeDoc ships with ESM, so they should
generally published as ESM to avoid `require(esm)` experimental warnings.

```js
// @ts-check
import * as td from "typedoc";
/** @param {td.Application} app */
export function load(app) {
    // Add event listeners to app, app.converter, etc.
    // this function may be async
}
```

Plugins affect TypeDoc's execution by attaching event listeners to one or many
events that will be fired during conversion and rendering. Events are available
on the [Application], [Converter], [Renderer], and [Serializer]/[Deserializer]
classes. There are static `EVENT_*` properties on those classes which describe
the available events.

The best way to learn what's available to plugins is to browse the docs, or look
at the source code for existing plugins. There is a list of currently supported
plugins at https://typedoc.org/guides/plugins/

TypeDoc also provides several control hooks for plugins to change it's behavior,
they are described by the [third party symbols](./third-party-symbols.md) and
[custom themes](./themes.md) documents.

Plugins which are configurable can add custom options with
`app.options.addDeclaration`. [typedoc-plugin-mdn-links] has an example of the
recommended way of doing this.

If you have specific questions regarding plugin development, please open an
issue or ask in the [TypeScript Discord] #typedoc channel.

[typedoc-plugin-mdn-links]: https://github.com/Gerrit0/typedoc-plugin-mdn-links/blob/main/src/index.ts
[TypeScript Discord]: https://discord.gg/typescript
[Application]: https://typedoc.org/api/classes/Application.html
[Converter]: https://typedoc.org/api/classes/Converter.html
[Renderer]: https://typedoc.org/api/classes/Renderer.html
[Serializer]: https://typedoc.org/api/classes/Serializer.html
[Deserializer]: https://typedoc.org/api/classes/Deserializer.html
