---
title: "Internationalization"
group: Guides
---

# Internationalization

TypeDoc 0.26 added support for internationalization in TypeDoc's output.
This is controlled by the `--lang` option and will affect both console output
and the generated HTML or JSON output.

## Adding a Locale

Locales are stored in TypeDoc's `src/lib/internationalization/locales` directory
with the exception of the default locale, which is stored in
`src/lib/internationalization/translatable.ts`. To add a new locale, create a file
under the `locales` directory which looks like this:

```ts
// zh.cts
import { buildTranslation } from "../translatable";

export = buildTranslation({
    docs_generated_at_0: "文档生成于 {0}",
});
```

This will give a compiler error on `buildTranslation` since the translation object
does not provide a translation for every string supported by TypeDoc. Submitting an
incomplete translation is still greatly appreciated! If the translation is not complete
when submitting for review, import and call `buildIncompleteTranslation` instead.

Any strings which are not added to the translation object will automatically fall back
to the default English string.

The [TranslatableStrings](https://typedoc.org/api/interfaces/TranslatableStrings.html)
interface has documentation on the format of TypeDoc's builtin translations. In short,
translation keys include numbers to indicate placeholders in the English string, and
the translated strings should include `{n}` where the placeholder will be filled in at
runtime.

> [!IMPORTANT]
> Please do not submit machine generated translations for languages you are unfamiliar with.
> TypeDoc relies on contributors to ensure the accuracy of included translations.

### Validation

The `buildTranslation` and `buildIncompleteTranslation` functions will attempt to
validate that the provided translation strings include the same number of
placeholders as the default locale. This can check that a string does not miss a
placeholder, but will not catch usage of placeholders which will not be defined by
TypeDoc. That issue will automatically be caught by a unit test if it occurs.

The builder functions will also validate that translations do not provide keys
which are not present in the default locale if a fresh object is provided directly
to them as suggested in the example above.

## Translating Plugin Defined Strings

Plugins may use TypeDoc's internationalization module to provide multiple
translations for strings declared within them. To do this, they should call
[Application.internationalization.addTranslations] with their expected values.

The `addTranslations` method expects that all translatable strings have been
declared in the `TranslatableStrings` interface. To do this, use declaration
merging to define the expected number of placeholders for each translation string.

```ts
import * as td from "typedoc";

declare module "typedoc" {
    interface TranslatableStrings {
        // Define a translatable string with no arguments
        plugin_example_hello_world: [];
        // Define a translatable string requiring one argument
        // By convention, keys should include index numbers for each placeholder
        plugin_example_hello_0: [string];
    }
}

export function load(app: td.Application) {
    app.internationalization.addTranslations("en", {
        plugin_example_hello_world: "Hello World!",
        plugin_example_hello_0: "Hello {0}!",
    });

    app.logger.info(app.i18n.plugin_example_hello_world()); // Logs "Hello World!"
    app.logger.info(app.i18n.plugin_example_hello_0("TypeDoc")); // Logs "Hello TypeDoc!"
}
```

[Application.internationalization.addTranslations]: https://typedoc.org/api/classes/Internationalization.Internationalization.html#addtranslations
