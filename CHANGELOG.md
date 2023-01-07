# Unreleased

## v0.23.24 (2023-01-07)

### Bug Fixes

-   Fixed an issue where signature comments were preferred over property comments for indirectly created function-properties, #2135.
-   Fixed symlink handling when expanding entry points, #2130.

### Thanks!

-   @boneskull

## v0.23.23 (2022-12-18)

### Features

-   Added `ts.Signature` to emitted `EVENT_CREATE_SIGNATURE` event, #2002.

### Bug Fixes

-   Links to members hidden by filter settings now temporarily override the filter, #2092.
-   If `src/` and `src/x` are specified as entry points, `src/` will no longer be ignored, #2121.

## v0.23.22 (2022-12-11)

### Features

-   Add support for defining the kind sort order, #2109.

### Bug Fixes

-   Normalize all file paths on Windows, #2113.
-   Fix `@link` tags within lists, #2103.

## v0.23.21 (2022-11-14)

### Features

-   Added support for a catch-all wildcard in `externalSymbolLinkMappings`, #2102.
-   Added support for TypeScript 4.9.

### Thanks!

-   @mistic100

## v0.23.20 (2022-11-03)

### Bug Fixes

-   Fixed comment discovery for `@inheritDoc` if inheriting from a function type alias, #2087.

## v0.23.19 (2022-10-28)

### Bug Fixes

-   Fixed title link if `titleLink` option was not specified, #2085.

### Thanks!

-   @krisztianb

## v0.23.18 (2022-10-23)

### Features

-   Improved error reporting when failing to find entry points, #2080, #2082.

### Bug Fixes

-   Constructor parameter-properties will now use the `@param` comment for the parameter if available, #1261.
-   Fixed display of object types containing methods, #1788.
-   Fixed conversion of intrinsic string mapping types when converting without a type node, #2079.

## v0.23.17 (2022-10-18)

### Features

-   Added `titleLink`, `navigationLinks` and `sidebarLinks` options to add additional links to the rendered output, #1830.
-   Added `sourceLinkTemplate` option to allow more flexible specification of remote urls.
    Deprecated now redundant `gitRevision` detection starting with `https?://` introduced in v0.23.16, #2068.

### Thanks!

-   @futurGH

## v0.23.16 (2022-10-10)

### Features

-   Object types will now be pretty printed, #1793.
-   Added support for specifying the tsconfig.json file in packages mode with `{ "typedoc": { "tsconfig": "tsconfig.lib.json" }}` in package.json, #2061.
-   In packages mode, readme files will now be automatically included if present, #2065.
-   Added support for specifying the base file url for links to source code, #2068.

### Bug Fixes

-   Private parameter properties will no longer be ignored, #2064.

### Thanks!

-   @captainTorch

## v0.23.15 (2022-09-18)

### Features

-   TypeDoc will now treat `@typedef {import("foo").Bar<Z>} Baz` type declarations which forward type parameters to the imported
    symbol as re-exports of that symbol, #2044.

### Bug Fixes

-   TypeDoc will now prefer comments on variable declarations over signature comments, #2042.
-   Fixed double rendering of "Type Parameters" header, #2054.
-   Fixed double rendering of "Hierarchy" header, #2053.
-   Removed unused `widgets.png` and `widgets@2x.png` files from generated assets folder.

## v0.23.14 (2022-09-03)

### Features

-   Added support for defining one-off external link mappings with `externalSymbolLinkMappings` see
    [the documentation](https://typedoc.org/guides/options/#externalsymbollinkmappings) for usage examples and caveats, #2030.
-   External link resolvers defined with `addUnknownSymbolResolver` will now be checked when resolving `@link` tags, #2030.
    Note: To support this, resolution will now happen during conversion, and as such, `Renderer.addUnknownSymbolResolver` has been
    soft deprecated in favor of `Converter.addUnknownSymbolResolver`. Plugins should update to use the method on `Converter`.
    `DefaultThemeRenderContext.attemptExternalResolution` has also been deprecated since it will repeat work done during conversion,
    use `ReferenceType.externalUrl` instead.
-   Added `Converter.addUnknownSymbolResolver` for use by plugins supporting external links.

### Bug Fixes

-   Fixed conversion of object literal types containing construct signatures, #2036.
-   Fixed centering of title bar on wide displays, actually this time, #2046.

## v0.23.13 (2022-09-01)

### Bug Fixes

-   Fixed packages mode bug introduced in 0.23.12, #2043.

## v0.23.12 (2022-08-31)

### Features

-   Added a new `ParameterType.Object` for declaring object options which will be shallowly merged when read from user configuration.
-   Added a new `Application.EVENT_BOOTSTRAP_END` event emitted when `Application.bootstrap` is called.

### Bug Fixes

-   TypeDoc will now work properly in packages mode when converting packages outside the current working directory, #2043.
-   Fixed deprecation warning for `isIdentifierOrPrivateIdentifier`.
-   Fixed centering of title bar on wide displays, #2046.

### Thanks!

-   @citkane

## v0.23.11 (2022-08-26)

### Features

-   Added support for TypeScript 4.8.
-   Introduced a `skipErrorChecking` option which instructs TypeDoc to not ask TypeScript for compiler errors
    before attempting to generate documentation. Turning this on may improve generation speed, but could also
    cause a crash if your code contains compiler errors.
-   Added support for JS entry points when using packages mode, #2037.

### Bug Fixes

-   Fixed crash when converting abstract mixin class, #2011.
-   Readme files within monorepos now have `@link` tags resolved, #2029.
-   Correctly resolve unqualified links to class members within parameters, #2031.
-   TypeDoc will now consider other reflections with the same name as parents when resolving links, #2033.
-   The "Hierarchy" and "Type Parameters" helpers on `DefaultThemeRenderContext` now contain all the HTML for their sections of the page, #2038.

### Thanks!

-   @citkane
-   @kaphula

## v0.23.10 (2022-07-31)

### Features

-   Added support for detecting comments directly before parameters as the parameter comment, #2019.
-   Added support for using the comment directly before a constructor parameter that declares a property as the property comment, #2019.
-   Improved schema generation to give better autocomplete for the `sort` option.
-   Optional properties are now visually distinguished in the index/sidebar by rendering `prop` as `prop?`, #2023.
-   `DefaultThemeRenderContext.markdown` now also accepts a `CommentDisplayPart[]` for rendering, #2004.
-   Expose `Converter.resolveLinks` method for use with `Converter.parseRawComment`, #2004.

### Bug Fixes

-   Fixed schema URL for TSDoc preventing the use of `typedoc/tsdoc.json` in TSDoc extends, #2015.
-   Improved detection of package names in repositories using pnpm, #2017.
-   Fixed missing JSDoc style `@typedef` comments for properties, #2020.

### Thanks!

-   @bodil
-   @nazarhussain

## v0.23.9 (2022-07-24)

### Bug Fixes

-   TypeDoc will no longer skip entry points which have no exports, #2007.
    If using `"entryPointStrategy": "expand"`, this change may result in new pages being added to your documentation.
    If this is not desired, you can use the `exclude` option to filter them out.
-   Fixed missing comments on callable variable-functions constructed indirectly, #2008.
-   Packages mode will now respect the `--includeVersion` flag, #2010.
-   Fixed multiple reflections mapping to the same file name on case insensitive file systems, #2012.

## v0.23.8 (2022-07-17)

### Features

-   Added defined in links for classes, enums, #180.
-   Added support for `*.ghe.com` and `*.github.us` GitHub enterprise domains for source links, #2001.
-   Expose `Converter.parseRawComment` for plugins to parse additional markdown files, #2004.

### Bug Fixes

-   TypeDoc will no longer emit a warning for `{@link}` containing a URL, #1980.
-   `excludeNotDocumented` will no longer remove functions/methods/accessors which are documented, #1994.
-   Fixed missing `sources` property on signature reflections #1996.

### Thanks!

-   @cary-hu
-   @chadhietala

## v0.23.7 (2022-07-09)

### Bug Fixes

-   Tags must now contain whitespace after the tag name to be parsed as a tag, `@jest/globals` in a comment will no longer be parsed as a tag #1990.
-   The private member visibility option will now be respected in generated sites, #1992.
-   Overload rendering will no longer be broken if JavaScript is disabled, #453.
-   All overloads are now shown at once rather than requiring clicks to see the documentation for each signature, #1100.

## v0.23.6 (2022-07-08)

### Features

-   Improved support for `--entryPointStrategy Packages`. TypeDoc will now load package-specific configurations from `package.json` `typedoc` field. This configuration allows configuring a custom display name (`typedoc.displayName`) field, entry point (`typedoc.entryPoint` - this is equivalent and will override `typedocMain`), and path to a readme file to be rendered at the top of the package page (`typedoc.readmeFile`), #1658.
-   The `--includeVersion` option will now be respected by `--entryPointStrategy Packages`. Also, for this combination, missing `version` field in the root `package.json` will not issue a warning.
-   The `navigation` partial will now call the new `settings`, `primaryNavigation`, and `secondaryNavigation` partials, #1987.

### Bug Fixes

-   All warnings will be reported instead of only the first warning of a given type, #1981.
-   Include references will no longer be incorrectly parsed as links, #1986.
-   The generated schema.json on the website will now use enum values rather than enum names if possible.

### Thanks!

-   @akphi
-   @zamiell

## v0.23.5 (2022-07-02)

### Features

-   The `DEBUG_SEARCH_WEIGHTS` global variable can now be set on `window` to add search scoring information in the search results.
-   TypeDoc's icons are now available on `DefaultThemeRenderContext.icons` for use/modification by themes.

## v0.23.4 (2022-07-02)

### Bug Fixes

-   TypeDoc no longer ignores project references if `--entryPointStrategy Packages` is set, #1976.
-   Boost computations are now done when creating the search index, resulting in a smaller `search.js` generated file.

### Features

-   The `--exclude` option will now be respected by `--entryPointStrategy Packages` and can be used to exclude package directories, #1959.
-   TypeDoc now emits an `IndexEvent` on the `Renderer` when preparing the search index, #1953.
-   Added new `--searchInComments` option to include comment text in the search index, #1553.
    Turning this option on will increase the size of your search index, potentially by an order of magnitude.

## v0.23.3 (2022-07-01)

### Bug Fixes

-   Function properties in type space will no longer be interpreted as methods, #1637.
-   TypeDoc will no longer crash if a comment contains an empty `@example` tag, #1967.
-   TypeDoc will now detect attempted inheritance from accessors and inherit from the getter or setter, #1968.
-   `intentionallyNotExported` will now properly respect qualified names, #1972.
-   Fixed missing namespace comments on `export * as NS` declarations, #1973.
-   Fixed missing comments on `export const x = () => 123` function variables, #1973.
-   Exported variable functions with properties will now be converted as a function+namespace instead of a variable+namespace, #1651.
-   Validation warnings caused by missing documentation will now be formatted like other warnings which reference a declaration.
-   TypeDoc will no longer warn if both the `get` and `set` signatures of an accessor have a comment.

### Features

-   Added `--htmlLang` option to set the [`lang`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang) attribute in the generated HTML. Defaults to `en`, #1951.
-   Added `--basePath` option to override TypeDoc's detected root directory, #1924.
-   Added support for TypeDoc specific `:getter` and `:setter` meaning keywords in declaration references.
-   Warnings caused by comment contents will now do a better job of including the location of the text that caused the warning.

## v0.23.2 (2022-06-28)

### Bug Fixes

-   Module comments will no longer be inappropriately attached to signatures, #1962.
-   Projects with a single entry point will now parse `@module` comments in the entry point, #1963.
-   Removed duplicate "in comment" warning when parsing comments, #1964.
-   Reflections with a boost of `<= 0` due to `searchCategoryBoosts` or `searchGroupBoosts` will be excluded from search.

## v0.23.1 (2022-06-26)

### Bug Fixes

-   If a declaration has multiple comments associated with it, the last one should be used, #1961.

# v0.23.0 (2022-06-26)

### Breaking Changes

-   Node 12 is no longer officially supported as it has gone end of life as of 2022-04-30. It might still work, but may stop working at any time.
-   Dropped support for TypeScript before 4.6.
-   `{@link}` tags in comments will now be resolved as declaration references similar to TSDoc's declaration references.
    For most cases, this will just work. See [the documentation](https://typedoc.org/guides/link-resolution/) for details on how link resolution works.
-   TypeDoc will now produce warnings for bracketed links (`[[ target ]]`). Use `{@link target}` instead. The `{@link}` syntax will be recognized by [TypeScript 4.3](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-3.html#editor-support-for-link-tags) and later and used to provide better intellisense. TypeDoc version 0.24.0 will remove support for `[[ target ]]` style links.
    Support for `` [[`links`]] `` with brackets + code ticks have been dropped.
-   `extends` in typedoc.json is now resolved using NodeJS module resolution, so a local path must begin with `./`.
-   In the JSON output for `DeclarationReflection`s, `getSignature` is no longer a one-tuple.
-   In the JSON output for `DeclarationReflection`s, `setSignature` is no longer a one-tuple.
-   In the JSON output for `DeclarationReflection`s, `typeParameter` has been renamed to `typeParameters`
-   The `searchGroupBoosts` option must now be given the rendered group name rather than reflection kind names, and can be given custom group names.
-   `@inheritDoc` now follows the behavior specified by TSDoc when copying comments with a reference.
-   The `gaSite` option has been removed since Google Analytics now infers the site automatically, updated Google Analytics script to latest version, #1846.
-   The `hideLegend` option has been removed as the default theme no longer contains a legend.
-   Comments on export declarations will only overrides comments for references and namespaces, #1901.
-   The deprecated `listInvalidSymbolLinks` option has been removed. Use `validation.invalidLink` instead.
-   The deprecated `true` and `false` values have been removed from `--emit`, to migrate replace `true` with `"both"` and `false` with `"docs"` (the default).
-   Links are no longer be resolved against a global list of all symbols. See [the documentation](https://typedoc.org/guides/link-resolution/) for details on link resolution.
-   The `validation.invalidLink` option is now on by default.
-   `reflection.decorates`, `reflection.decorators`, and their corresponding interfaces have been removed as no code in TypeDoc used them.
-   The shape of the `Comment` class has changed significantly to support multiple tag kinds.
-   Listeners to `Converter.EVENT_CREATE_TYPE_PARAMETER` and `Converter.EVENT_CREATE_DECLARATION` will now never be passed a `ts.Node` as their third argument.
-   Constant variables which are interpreted as functions will no longer have the `ReflectionFlag.Const` flag set.
-   `reflection.defaultValue` is no longer set for enum members. The same information is available on `reflection.type` with more precision.
-   Removed deprecated `removeReaderByName`, `addDeclarations` and `removeDeclarationByName` methods on `Options`.
-   Removed `ProjectReflection.directory`, it was unused by TypeDoc and not properly tested.
-   Removed `ProjectReflection.files`, this was an internal cache that should not have been exposed, and shouldn't have existed in the first place, since removing it made TypeDoc faster.
-   Removed `ReflectionGroup.kind` since groups can now be created with the `@group` tag.
-   Removed `ReflectionKind.Event`, the `@event` tag is now an alias for `@group Events`. Note: This changes the value of `ReflectionKind.Reference` from `16777216` to `8388608`.
-   Themes are now set on the document element rather than on body, #1706.

### Features

-   TypeDoc now supports the `@group` tag to group reflections in a page. If no `@group` tag is specified, reflections will be grouped according to their kind, #1652.
-   TypeDoc will now search for `typedoc.js(on)` in the `.config` folder in the current working directory.
-   Entry point strategies `Resolve` and `Expand` may now specify globs, #1926.
-   `typedoc.json` now supports comments like `tsconfig.json`.
-   TypeDoc will now read the `blockTags`, `inlineTags`, and `modifierTags` out of `tsdoc.json` in the same directory as `tsconfig.json` if it exists.
    It is recommended to add `"extends": ["typedoc/tsdoc.json"]`, which defines TypeDoc specific tags to your `tsdoc.json` if you create one.
-   If an exported symbol has multiple declarations, TypeDoc will now check all appropriate declarations for comments, and warn if more than one declaration contains a comment, #1855.
-   Improved support for JSDoc style `@example` tags. If the tag content does not include a code block, TypeDoc now follows VSCode's behavior of treating the entire block as a code block, #135.
-   TypeDoc will now render members marked with `@deprecated` with a line through their name, #1381.
-   Added new `commentStyle` option which can be used to control what comments TypeDoc will parse.

    | Value | Behavior                               |
    | ----- | -------------------------------------- |
    | JSDoc | Use block comments starting with `/**` |
    | Block | Use all block comments                 |
    | Line  | Use `//` comments                      |
    | All   | Use both block and line comments       |

-   TypeDoc will now warn if part of a comment will be overwritten due to use of `@inheritDoc` instead of silently dropping part of the comment.
-   Added support for inline `@inheritDoc` tags, #1480.
-   It is now possible to link directly to a specific overload, #1326.
-   The JSON output will now include URLs to the file on the remote repository if possible.
-   Added a new `visibilityFilters` option which controls the available filters on a page.
-   TypeDoc will now try to place block elements on a new line in HTML output, resulting in less overwhelming diffs when rebuilding docs, #1923.
-   Added `blockTags`, `inlineTags`, `modifierTags` to control which tags TypeDoc will allow when parsing comments.
    If a tag not in in one of these options is encountered, TypeDoc will produce a warning and use context clues to determine how to parse the tag.

### Bug Fixes

-   Fixed off by one error in warnings for types referenced but not included in the documentation.
-   TypeDoc will no longer render a `Type Parameters` heading if there are no type parameters in some cases.
-   Improved source location detection for constructors.
-   Improved comment discovery on destructured exported functions, #1770.
-   Links which refer to members within a reference reflection will now correctly resolve to the referenced reflection's member, #1770.
-   Correctly detect optional parameters in JavaScript projects using JSDoc, #1804.
-   Fixed identical anchor links for reflections with the same name, #1845.
-   TypeDoc will now automatically inherit documentation from classes `implements` by other interfaces/classes.
-   Fixed `@inheritDoc` on accessors, #1927.
-   JS exports defined as `exports.foo = ...` will now be converted as variables rather than properties.
-   `searchCategoryBoosts` are now correctly computed for all categories, #1960.
-   The `excludeNotDocumented` option will no longer hide a module if it has a documentation comment, #1948.
-   Prevent `--excludeNotDocumented` from hiding properties of type literals (`a` in `function fn(p: { a: string })`), #1752.
-   Allow `cts` and `mts` extensions in packages resolution mode, #1952.
-   Corrected schema generation for https://typedoc.org/schema.json

### Thanks!

-   @aqumus
-   @fb55
-   @futurGH
-   @Shane4368
-   @shmax

## v0.22.18 (2022-06-25)

### Features

-   Relaxed restrictions on `@enum` style enums to also permit non-literal strings and numbers, #1956.

### Bug Fixes

-   `searchGroupBoosts` was only computing the boost for the first reflection in a group, #1958.

### Thanks!

-   @shmax
-   @Zamiell

## v0.22.17 (2022-06-01)

### Features

-   Added support for documenting a module's global declarations as its exports if it contains no real exports.

### Bug Fixes

-   Restore support for TS 4.0 through 4.5, #1945.

## v0.22.16 (2022-05-30)

### Features

-   Added support for TypeScript 4.7, #1935.
-   Support enum-like objects with numeric literal values tagged with `@enum`, #1918.
-   Enum member reflections will now have their `type` set to either a `LiteralType` with a string or numeric value or an `IntrinsicType` with type `number`, #1942.
    Using `defaultValue` on `EnumMember` reflections is now deprecated, and will be broken in 0.23.

### Bug Fixes

-   Fixed invalid type output in some uncommon edge cases, TypeDoc also now renders fewer superfluous parenthesis when creating types.
-   TypeDoc is now more consistent about ordering with `enum-value-ascending` or `enum-value-descending` sort strategies in mixed string/number enums.

### Thanks!

-   @ejuda
-   @Zamiell

## v0.22.15 (2022-04-10)

### Features

-   Classes which are `abstract` and enums which are `const` will now be indicated in their rendered documentation, #1874.
-   Added a new option `compilerOptions`, which can be used to override compiler options read from `tsconfig.json`, #1891.
-   Added new render hooks: `content.begin`, `content.end`, `navigation.begin`, `navigation.end`

### Bug Fixes

-   TypeDoc will now warn if a project name/version cannot be inferred from a package.json file rather than using `undefined`, #1907.

### Thanks!

-   @ejuda
-   @matteobruni
-   @schlusslicht

## v0.22.14 (2022-04-07)

### Bug Fixes

-   Fixed missing comments on `@enum` style enum members defined in declaration files, #1880.
-   Fixed `--validation.notDocumented` warnings for functions/methods/type aliases, #1895, #1898.
-   Search results will no longer include random items when the search bar is empty, #1881.
-   Comments on overloaded constructors will now be detected in the same way that overloaded functions/methods are.
-   Fixed `removeReflection` not completely removing reflections from the project, #1898.
-   Fixed `@hidden` / `@ignore` / `@exclude` comments on default exports with no associated variable, #1903.
-   `makeRecursiveVisitor` will now correctly call the `intersection` callback, #1910.

### Thanks!

-   @nlepage
-   @ychan167

## v0.22.13 (2022-03-06)

### Features

-   Add support for TypeScript 4.6, #1877.
-   Support copying `@param` comments for nested members that target union and intersection types, #1876.

### Bug Fixes

-   Fixed validation for `--requiredToBeDocumented` option, #1872.
-   Fixed missing `this` parameters in documentation for some functions, #1875.

## v0.22.12 (2022-02-20)

### Features

-   Added `--validation.notDocumented` option to warn on items that are not documented, #1817.

### Bug Fixes

-   Fixed `const` variables not properly marked as `const`, #1866.

### Thanks!

-   @albyrock87
-   @Nokel81

## v0.22.11 (2022-01-18)

### Features

-   Added new `cname` option for GitHub Pages custom domain support, #1803.
-   `ReferenceType`s which reference an external symbol will now include `qualifiedName` and `package` in their serialized JSON.
-   Added clickable anchor link for member titles, #1842.

### Bug Fixes

-   Fixed line height of `h1` and `h2` elements being too low, #1796.
-   Code blocks in the light theme will no longer have the same background as the rest of the page, #1836.
-   Symbol names passed to `addUnknownSymbolResolver` will now be correctly given the qualified name to the symbol being referenced, #1832.
-   The search index will now be written as JSON, reducing load times for large projects, #1825.

### Thanks!

-   @adeniszczyc
-   @dragomirtitian
-   @matteobruni
-   @srmagura
-   @stefanobaghino-da

## v0.22.10 (2021-11-25)

### Features

-   Added support for TypeScript 4.5, #1798.

### Bug Fixes

-   If file exports a symbol both under it's real name and as `default`, the `default` export will now always be the renamed symbol, #1795.
-   TypeDoc will no longer crash if a symbol is defined both as a normal class (and optional interface) and as a property, as is used for global Node types in older `@types/node` versions, Gerrit0/typedoc-plugin-missing-exports#5.

## v0.22.9 (2021-11-14)

### Features

-   TypeDoc will now detect and warn if multiple instances of the package are loaded. This usually means that a plugin has its own version of TypeDoc installed, which will lead to things breaking in unexpected ways.
    It will only work if both loaded TypeDocs are v0.22.9 or later.
-   TypeDoc will now automatically load packages with `typedoc-theme` in their keywords.
    Plugins which define a custom theme should include this keyword so that they can be automatically collected and displayed at https://typedoc.org/guides/themes/.

### Bug Fixes

-   Corrected HTML generation for projects using Google Analytics, #1786.
-   Ensured that the `<meta charset="utf-8" />` appears within the first 1024 bytes of generated pages, #1783.

### Thanks!

-   @RunDevelopment

## v0.22.8 (2021-11-07)

### Features

-   Added hooks which can be used to inject HTML without completely replacing a template, #1773.
    See the documentation in [custom-themes.md](https://github.com/TypeStrong/typedoc/blob/master/internal-docs/custom-themes.md) for details.

### Bug Fixes

-   Actually fixed `@category` tag incorrectly appearing on function types if used on a type alias, #1745.
-   Fix error in console when a page contains no documentation items.

### Thanks!

-   @RunDevelopment
-   @srmagura

## v0.22.7 (2021-10-25)

### Features

-   Added support for GitHub enterprise projects with a `githubprivate.com` domain, #1743.
-   Added support for GitLab repositories, #1728.

### Bug Fixes

-   Replaced O(n^2) with O(1) implementation for determining unique IDs in a rendered page, #1755.
-   Fixed crash with when running in very large repositories, #1744.
-   Fixed visible gap after footer in dark mode if `hideGenerator` is set, #1749.
-   Fixed `@category` tag incorrectly appearing on function types if used on a type alias, #1745.
-   Fixed incorrect JS to apply themes on page load, #1709 (again).
-   Accessors and index signatures are now properly marked as inherited on declaration creation, #1742.

### Thanks!

-   @nlfurniss
-   @RunDevelopment
-   @srmagura

## v0.22.6 (2021-10-17)

### Features

-   Added support for displaying identifiers & property access expressions in initializers, #1730.
-   Expanded support for variables tagged with `@enum` to all variables whose property types are string literals, #1740.

### Bug Fixes

-   Fixed flash when navigating to a second page when OS theme does not match selected theme, #1709.
-   Fixed improper quoting of `as const` style enums, #1727.
-   Fixed handling of `@typeParam` on type aliases, #1733.
-   Fixed handling of comment tags on function type aliases, #1734.
-   Paths in warnings about non-exported symbols are now consistently displayed across platforms, #1738.

### Thanks!

-   @capraynor
-   @srmagura

## v0.22.5 (2021-10-02)

### Features

-   TypeDoc will now recognize `@param` comments for destructured parameters and rename `__namedParameters` to the name specified
    in the `@param` comment if the number of `@param` comments match the number of parameters, resolves #1703.
-   The `intentionallyNotExported` option may now include file names/paths to limit its scope, for example, the following
    will suppress warnings from `Foo` in `src/foo.ts` not being exported, but will not suppress warnings if another `Foo`
    declared in `src/utils/foo.ts` is not exported.
    ```json
    {
        "intentionallyNotExported": ["src/foo.ts:Foo"]
    }
    ```
-   The `--emit` option can now be used to more finely control what TypeDoc will emit.
    | Value | Behavior |
    | --- | --- |
    | `both` | Emit both documentation and JS. |
    | `docs` | Emit documentation, but not JS (default). |
    | `none` | Emit nothing, just convert and run validation. |
    | `true` | Alias for `both`, for backwards compatibility. Will be removed in 0.23. |
    | `false` | Alias for `docs`, for backwards compatibility. Will be removed in 0.23. |

### Bug Fixes

-   TypeDoc will now only create one highlighter for rendering code, saving ~200-500ms for rendering time.
-   For compatibility with JSDoc, TypeDoc will now strip `<caption>` elements from `@example` tags, resolves #1679.
-   TypeScript's `emitDeclarationOnly` compiler option is now supported, resolves #1716.
-   Fixed discovery of tsconfig.json when the provided path ends in `.json`, resolves #1712.
-   Fixed a crash when converting the `globalThis` namespace, could only be caused by a plugin.

### Thanks!

-   @Gudahtt
-   @mgred
-   @schlusslicht
-   @srmagura

## v0.22.4 (2021-09-18)

### Features

-   Flag option types like `validation` can now be set to true/false to enable/disable all flags within them.
-   Source code links now work with Bitbucket repositories, resolves #1615.
-   Added `githubPages` option (default: true), which will create a `.nojekyll` page in the generated output, resolves #1680.
-   `MarkdownEvent` is now exported, resolves #1696.

### Bug Fixes

-   Fixed the hamburger menu not being visible on mobile devices, fixes #1699.
-   Comments on function implementations with overloaded signatures will now be correctly handled, fixes #1697.

### Thanks!

-   @srmagura

## v0.22.3 (2021-09-12)

### Bug Fixes

-   Switched the default highlighting themes back to `light-plus` and `dark-plus`, they were accidentally set to `min-light` and `min-dark` in v0.22.0.

### Features

-   Added new `validation` option which can be used to disable checks for non-exported symbols.
    On the command line, this can be specified with `--validation.notExported true`, or in an options file with:
    ```json
    {
        "validation": {
            "notExported": true
        }
    }
    ```
-   Added invalidLink to `validation` option, deprecated `listInvalidSymbolLinks`, which will be removed in 0.23.

## v0.22.2 (2021-09-11)

### Bug Fixes

-   Fix background color of tables in dark mode, closes #1684.

## v0.22.1 (2021-09-10)

### Bug Fixes

-   Validation for non-exported symbols will now only produce one warning per symbol, instead of one warning per reference.
-   Syntax highlighting when the preferred color scheme is dark but dark theme is not explicitly selected will now properly use the dark highlighting theme.

# v0.22.0 (2021-09-10)

### Breaking Changes

-   The `packages` and `entryPoints` options have been combined.
    To migrate configurations which used `packages`, replace `packages` with `entryPoints` and set `entryPointStrategy` to `packages`.
-   Renamed `disableOutputCheck` to `cleanOutputDir` to more clearly reflect its behavior.
-   The `highlightTheme` option has been split into `lightHighlightTheme` and `darkHighlightTheme`.
-   Removed poorly documented / poorly behaved `toc` option.
-   HTML output is now rendered with JSX instead of Handlebars, closes #1631.
    This change provides major performance benefits, reducing rendering time by up to 10x for several benchmarked projects.
    It also allows themes to be easily type checked, preventing mistakes when creating custom themes.
    Removing Handlebars also fixed memory leaks when `--watch` was specified due to Handlebar's caching mechanism.
    This change breaks all existing custom themes, so a theme created for v0.21 or earlier will not work in v0.22.
    See [internal-docs/custom-themes.md](https://github.com/TypeStrong/typedoc/blob/v0.22.0/internal-docs/custom-themes.md) for documentation on how to create a custom theme in v0.22.
-   Removed the minimal theme that has been mostly broken for a long time.
-   Changed the default `entryPointStrategy` from `expand` to `resolve`.
-   Paths in config files will now be resolved relative to the config file instead of relative to the current working directory.
-   Exclude patterns are now checked against files instead of against each part of the path as traversed, #1399.
    This means that an exclude of `**/someDir` will **not** exclude files in that directory. To exclude files in a directory, specify `**/someDir/**`.

### Features

-   Added support for light/dark mode to the default theme, closes #1641.
-   Added support for custom CSS with the new `customCss` option, closes #1060.
-   Added support for linking to third party documentation sites, closes #131. See [internal-docs/third-party-symbols.md](https://github.com/TypeStrong/typedoc/blob/v0.22.0/internal-docs/third-party-symbols.md)
    for documentation on how to create a plugin which enables this.
    Support for linking to MDN for global types is provided by [typedoc-plugin-mdn-links](https://github.com/Gerrit0/typedoc-plugin-mdn-links).
-   Added `entryPointStrategy` to reduce confusion from new TypeDoc users on handling of entry points.
    There are three possible options:
    | Option | Behavior |
    | --- | --- |
    | resolve (default) | Expects all entry points to be contained within the root level tsconfig project. If a directory is given, includes `<directory>/index` as the entry point. |
    | expand | Expects all entry points to be contained within the root level tsconfig project. If a directory is given, files within it are recursively expanded. This was the default behavior in v0.21. |
    | packages | Corresponds to `--packages` in v0.21, behaves as documented in the Monorepo section in the readme. |
-   Added support for `typedocMain` in package.json when using the `packages` strategy for resolving entry points.
-   Produce warnings when documentation is missing exports, closes #1653. If using TypeDoc's API, this behavior is available through calling `application.validate(project)`.
-   Added support for detecting "`as const` enums", closes #1675.
-   Added `hideLegend` option, closes #1108.
-   Added performance measurements to debug logging (`--logLevel Verbose`)
-   String literal indexed access types will create links to their referencing member if possible, closes #1226.

### Bug Fixes

-   Support inclusion patterns when expanding input files, closes #1399.
-   Arrow keys can no longer select hidden search results.
-   The Legend header will no longer be included if there is nothing in the legend.
-   If a non-function uses `@param`, the name will not be dropped when rendering, closes #1410.

### API Breaking Changes

-   TypeDoc now specifies the `"export"` key in `package.json`, preventing plugins from importing internal paths.
    TypeDoc should now export all necessary structures (potentially marked with `@internal` if likely to change) from the root export.
-   The `ReflectionKind` values for `Project`, `Module`, `Namespace`, and `Enum` have changed.
-   Removed deprecated logger functions.
-   Dropped support for legacy plugins which use `export=`. Plugins are now required to export a `load` function.
-   Remove `TypeParameterType`, references to type parameters have produced a `ReferenceType` since v0.20.0.
-   Types no longer have a `clone` method. It inconsistently performed deep or shallow clones, and was not used by TypeDoc.
-   Types no longer contain an `equals` method. It was occasionally correct for medium-complexity types, and always incorrect for more complicated types.

### Thanks!

-   @cspotcode
-   @itsjamie

## v0.21.9 (2021-08-29)

### Bug Fixes

-   Support highlighting language aliases (#1673), closes #1672

### Thanks!

-   @StoneCypher

## v0.21.8 (2021-08-28)

### Features

-   Upgrade Shiki to 0.9.8, adds support for several new highlighting languages

### Thanks!

-   @StoneCypher

## v0.21.7 (2021-08-27)

### Features

-   Support for TypeScript 4.4, closes #1664

## v0.21.6 (2021-08-19)

### Features

-   Add support for NO_COLOR environment variable (#1650)

### Bug Fixes

-   Handle undefined symbols in query types, closes #1660

### Thanks!

-   @krisztianb

## v0.21.5 (2021-07-31)

### Features

-   Support Node v12.10 (#1632), closes #1628

### Bug Fixes

-   Implicitly set noEmit unless --emit is provided, closes #1639

### Thanks!

-   @betaorbust

## v0.21.4 (2021-07-12)

### Bug Fixes

-   Constructors did not have source information set, closes #1626

## v0.21.3 (2021-07-10)

### Breaking Changes

-   Options may not be set once conversion starts. Enables a small perf improvement.

### Bug Fixes

-   Improve detection for "property methods" to convert as methods, closes #1624
-   Two members differing only by case produced broken links, closes #1585
-   Resolve some memory leaks

### Thanks!

-   @cspotcode

## v0.21.2 (2021-06-27)

### Bug Fixes

-   Postpone resolution of inherited classes until their parents have been resolved, closes #1580

## v0.21.1 (2021-06-25)

### Bug Fixes

-   Exclude empty modules from documentation, closes #1607
-   `readme` could not be set to `none` in a config file, closes #1608
-   Correctly handle minimatch excludes on Windows, closes #1610

# v0.21.0 (2021-06-18)

### Breaking Changes

-   Drop support for Node v10
-   Plugins are now passed Application directly
-   Drop support for TypeScript 3.9

### Features

-   Improve monorepos by adding support for TS entry points (#1596)
-   Support for monorepos
-   Support for TypeScript 4.3
-   Add support for sorting reflections based on user criteria, closes #112
-   Add the --treatWarningsAsErrors option, closes #1568
-   The exclude option will now remove symbols re-exported from excluded files, closes #1578

### Bug Fixes

-   Correctly handle comments on function type aliases, closes #799
-   Setters should always have a `void` return type, closes #1215
-   Resolve paths in option files according to the config directory, closes #1598, #1442
-   Pick up doc comments for properties declared within a class's constructor, closes #1255
-   Inherit comments from parent methods, closes #1580
-   Correct handling for intentionally broken references
-   Inheritance from multiple Partial<T> types was incorrectly converted, closes #1579

### Thanks!

-   efokschaner
-   Martin

## v0.20.37 (2021-06-16)

### Features

-   Add disableAliases option (#1576), closes #1571

### Bug Fixes

-   Pin `marked` dependency to 2.0.x (#1602), closes #1601

### Thanks!

-   Martin
-   Nick

## v0.20.36 (2021-04-23)

### Features

-   use 'pretty' option when generating json
-   create 'pretty' option

### Bug Fixes

-   Always write to stdout, even if redirected, closes #1566
-   Create directories when writing JSON output

### Thanks!

-   cAttte

## v0.20.35 (2021-04-03)

### Features

-   Include debugging information in highlighting error messages (#1561)

### Bug Fixes

-   Relax simple expression requirements for default values, closes #1552
-   Handle #private getters + methods, closes #1564

### Thanks!

-   Masato Makino

## v0.20.34 (2021-03-25)

### Bug Fixes

-   Crash when converting recursive type alias, closes #1547
-   Discover module comments for global files, closes #1549
-   Detect references when export \* is used, closes #1551

## v0.20.33 (2021-03-22)

### Bug Fixes

-   Static properties of Error class incorrectly converted, closes #1541, #572

## v0.20.32 (2021-03-14)

### Bug Fixes

-   Correct crash with reflection types, closes #1538

## v0.20.31 (2021-03-14)

### Features

-   Improved warning message if TypeDoc is loaded multiple times.

### Bug Fixes

-   readonly tuples were recognized as arrays, closes #1534
-   Constructors were improperly reported as inherited, closes #1528, #1527

### Thanks!

-   Vladimir Ivakin

## v0.20.30 (2021-03-06)

### Bug Fixes

-   Categories should only appear once if specified multiple times, closes #1522
-   Support JSDocNullableType, JSDocNonNullableType, closes #1524
-   Remove undefined from optional property types, closes #1525

## v0.20.29 (2021-03-04)

### Features

-   Support for TypeScript 4.2, closes #1517

## v0.20.28 (2021-02-23)

### Bug Fixes

-   Detect visibility modifiers on accessors, closes #1516

## v0.20.27 (2021-02-20)

### Features

-   preserve spaces in code blocks

### Bug Fixes

-   Detect and normalize unique symbol names, closes #1514

### Thanks!

-   michaelf

## v0.20.26 (2021-02-20)

### Bug Fixes

-   Pick up optional/readonly from mapped types, closes #1509

## v0.20.25 (2021-02-15)

### Features

-   Support for specifying comments on export declarations, closes #1504

## v0.20.24 (2021-02-11)

### Features

-   add support for non .com gh enterprise domains (#1507)

### Thanks!

-   TUNER88

## v0.20.23 (2021-02-06)

### Bug Fixes

-   Missing namespace members when ns is created by re-exporting an entire module, closes #1499
-   Set inheritedFrom on accessor signatures, closes #1497, #1498

### Thanks!

-   Siddharth VP

## v0.20.22 (2021-02-06)

### Bug Fixes

-   Import from shiki rather than shiki-themes, closes #1496

## v0.20.21 (2021-02-05)

### Bug Fixes

-   Missing exported members in file-as-namespace reflection, closes #1493

## v0.20.20 (2021-01-31)

### Features

-   add highlight theme option

### Bug Fixes

-   Missing comments on optional methods, closes #1490
-   Avoid crash with removed project reflection, closes #1489
-   function-namespaces were converted incorrectly, closes #1483
-   add validation to highlightTheme option

### Thanks!

-   Matthias Law

## v0.20.19 (2021-01-25)

### Features

-   Support for --watch, --preserveWatchOutput, --emit

## v0.20.18 (2021-01-24)

### Bug Fixes

-   Static methods added to the class manually in JS, closes #1481

## v0.20.17 (2021-01-23)

### Features

-   Add support for copying item’s documentation by copying it from another API item

### Bug Fixes

-   CommonJS export= with type exports, closes #1476

### Thanks!

-   dergash

## v0.20.16 (2021-01-17)

### Bug Fixes

-   Comments on projects were broken
-   Constructors were a bit broken

## v0.20.15 (2021-01-16)

### Features

-   Support for excludeInternal, closes #1469
-   add option to read more categories from doc

### Bug Fixes

-   Crash when converting `@types/ws`, closes #1463
-   replace return with continue
-   excludeNotDocumented incorrectly ignored some symbols, closes #1465
-   Support for JSDoc `@enum` tags, closes #1464

### Thanks!

-   Bruno Zorić

## v0.20.14 (2021-01-09)

### Bug Fixes

-   Crash with destructured export const, closes #1462
-   Add support for optional types, closes #1312
-   Add support for rest types, closes #1457
-   Avoid using process.exit (#1461)

### Thanks!

-   Krisztián Balla

## v0.20.13 (2021-01-06)

### Bug Fixes

-   Use type nodes if converting a regular function, closes #1454

## v0.20.12 (2021-01-05)

### Bug Fixes

-   Arrow methods did not have modifiers set properly, closes #1452
-   Add support for import types, closes #1453
-   Don't document type arguments if there are none (#1451)

### Thanks!

-   Krisztián Balla

## v0.20.11 (2021-01-04)

### Bug Fixes

-   Crash when converting a generic with a tuple constraint, closes #1449

## v0.20.10 (2021-01-03)

### Bug Fixes

-   Errors due to bad options in tsconfig file were dropped, closes #1444

## v0.20.9 (2021-01-02)

### Bug Fixes

-   Regression caused by 1886304f327da5642097834feac0387fd1b78b6e
-   Parameter declarations might not exist, closes #1443

## v0.20.8 (2021-01-01)

### Bug Fixes

-   CLI should not exit cleanly on unexpected error

## v0.20.7 (2020-01-01)

### Bug Fixes

-   Tuples could cause a crash

## v0.20.6 (2020-01-01)

### Features

-   Support for JSDoc types, closes #1214, #1437

### Bug Fixes

-   Properly resolve type parameters, closes #1438

## v0.20.5 (2020-12-30)

### Bug Fixes

-   Functions might not have a parent in global files, closes #1436

## v0.20.4 (2020-12-30)

### Bug Fixes

-   --excludeNotDocumented didn't remove reflections, closes #1435

## v0.20.3 (2020-12-29)

### Features

-   Improved support for global files, closes #1424

## v0.20.2 (2020-12-29)

### Features

-   Better detection for declaration files defining a module

### Bug Fixes

-   Negative literal types were converted incorrectly, closes #1427
-   ArgumentsReader should warn if missing a value, closes #1429
-   TS 3 converters for null, this types
-   Literal boolean converter in TS 3
-   Map bash, sh, shell to shellscript when highlighting, closes #1432

## v0.20.1 (2020-12-29)

### Bug Fixes

-   Initializers should only be included if "simple", closes #1288, #1224, #764

# v0.20.0 (2020-12-28)

### Breaking Changes

-   Remove EVENT_FUNCTION_IMPLEMENTATION
-   Switch to Shiki for syntax highlighting
-   Unify several inconsistent methods, closes #1403
-   Remove EVENT_FILE_BEGIN
-   TypeDoc no longer accepts TS options
-   Remove "mode" option
-   Remove ignoreCompilerErrors option

### Features

-   new option "markedOptions" (#1412)
-   Initial attempt at support for project references
-   Colors in console output
-   Options may specify a validation function (#1398)
-   Support for `@module` tag
-   Support for TS 4.1 mapped types + string literal types, closes #1397
-   Add logLevel option
-   Partial support for global files
-   Automatically generate schema for typedoc.json
-   Switch back to search.js, closes #1339
-   Support for the remaining literal types
-   Support for mapped types
-   Mostly working library mode

### Bug Fixes

-   ConstructorType node support
-   Reintroduce support for index signatures
-   Categorization was broken with a single entry point
-   Normalize unions, closes #571
-   Somehow didn't save a file
-   Missing comments on variable functions, closes #1421
-   Resolve type parameters in concrete subclasses
-   Use entryPoints to search for readme
-   Only create extra programs when dealing with solution style tsconfig.json files
-   A typo in description of DefaultTheme.getMapping (#1416)
-   Correct handling of arrays in generic constraints, closes #1408
-   Type converters threw on older TS versions
-   Accessor with a set signature was converted incorrectly
-   Declaration merged namespaces sometimes produced multiple reflections
-   TypeDoc should warn users about missing entry points
-   isExternal flag wasn't set properly
-   JSON schema had incorrect value types, closes #1389
-   Hidden module-namespaces, closes #1396
-   Some issues with inheritance
-   We pick up all properties now
-   Support for specify a directory as an entry point
-   Lint
-   Array types were converted incorrectly
-   Change target back to ES2018
-   Missing default exports
-   Fix bug in ReferenceType equality check, closes #1383
-   fixes #1383, closes #1383
-   Reference types should always be given resolved symbols
-   Rendering works again
-   A few of the issues with the type converter

### Thanks!

-   Denis Sikuler
-   Krisztián Balla
-   Soc Sieng

## v0.19.2 (2020-09-21)

### Bug Fixes

-   Export declarations within namespaces weren't detected, closes #1366

## v0.19.1 (2020-09-05)

### Features

-   Re-introduce support for TS 3.9, closes #1362

### Thanks!

-   Constantine Dergachev

# v0.19.0 (2020-08-28)

### Features

-   Support for named tuples, closes #1357
-   Upgrade to TS 4.0
-   Support for defaulted type parameters

### Bug Fixes

-   Check for missing declarations, closes #1329
-   Add converter for parenthesized type nodes, closes #1346
-   Support for type operators `readonly` & `unique`
-   Address typo in log statement

### Thanks!

-   Eric ZHANG
-   Krisztián Balla
-   MathBunny

# v0.18.0 (2020-08-09)

### Breaking Changes

-   Bump minimum node version to 10

### Bug Fixes

-   Improve support for type aliases, closes #1330
-   Examples don't run (#1327)
-   Use `baseUrl` to determine file paths (#1313), closes #1294
-   Support resolveJsonModule, closes #1323
-   Do not ignore the properties of object type literals (#1308)
-   GithubPlugin: read correct remote when multiple github repos exist
-   Only set inputFiles from tsconfig if not already set, closes #1263
-   Options.isDefault was always false when passed non-literals., closes #1263

### Thanks!

-   Brandon Istenes
-   Chris Thielen
-   Nickolay Platonov
-   TheBrokenRail

## v0.17.7 (2020-05-17)

### Breaking Changes

-   Any plugins which referenced ReflectionKind.ExternalModule or ReflectionKind.Module need to be updated to reference ReflectionKind.Module and ReflectionKind.Namespace respectively., closes #109
-   `createMinimatch` is no longer a public function.

### Features

-   Allow every possible number as a defaultValue for a number option (#1296), closes #1291
-   Number options may require min and max values (#1278)
-   Add detecting read-only properties (#1268)
-   Remove Result object, closes #1238
-   Generate search index before rendering theme (#1252)
-   Support for `@template`, closes #860
-   Support for private fields
-   Move TypeScript to a peer dependency, closes #880
-   Support disabling sources, closes #808
-   Allow user to set git remote, closes #1130
-   Only generate legend for items that are displayed on the page (#1187), closes #1136

### Bug Fixes

-   copy inherited parameter descriptions (#1303), closes #787
-   TypeDoc fails to resolve @types packages outside of cwd, closes #1300
-   Trim whitespace when parsing links, closes #1302
-   Module declaration parsed as namespace (#1301), closes #1284
-   Correct prepublish script
-   Do not silently swallow missing include/media file errors (#1277)
-   Fix extends option in tsconfig.json doesn't work (#1273), closes #1272
-   Improve output for object's computed property names (#1275)
-   Enable lax overloads only in release
-   Map type options should not have their default value validated (#1250)
-   Empty legend on most pages
-   Pin marked to 0.8.0, closes #1240
-   Report errors from setting bad options on CLI, closes #1237
-   Missed a test configuration update
-   Rename external modules to modules, closes #109
-   Check for compiler errors before converting
-   Moved @types/minimatch dependency to devDependencies (#1206)
-   Plugin resolution for relative paths (#1194), closes #1188

### Thanks!

-   Alexander Cerutti
-   Krisztián Balla
-   Martin
-   Nickolay Platonov
-   Radics Laszlo
-   Sergei Grishchenko
-   Soc Sieng
-   Stephan Bijzitter
-   William Johnes

## v0.16.11 (2020-02-28)

### Features

-   Add support for `` inside of Marked Link Brackets (#1091)
-   Support for extended config in typedoc.json, closes #493, #1115
-   Config option to exclude not explicitly documented symbols (#996), closes #995

### Bug Fixes

-   Support code blocks with four spaces, closes #1218
-   Ensure child comment tags get set (#1221)
-   Re-export TypeScript namespace (#1217), closes #1213
-   Logger extensions now also count the warnings (#1210)

### Thanks!

-   Adam Epling
-   Emily Marigold Klassen
-   Khải
-   Nickolay Platonov
-   Richie Bendall
-   Robin Stevens

## v0.16.10 (2020-02-16)

### Features

-   Allow excluding tags from comments, closes #815
-   Count warnings (#1205)

### Bug Fixes

-   Remove tags containing redundant type info, closes #1198
-   Don't remove braces containing a tag, closes #1001
-   Mixin symbols might not have declarations (#1208)

### Thanks!

-   Raynor Chen
-   Robin Stevens
-   Zack Slayton

## v0.16.9 (2020-01-25)

### Bug Fixes

-   use util.readFile everywhere to handle BOM issues

### Thanks!

-   Anton Golub

## v0.16.8 (2020-01-21)

### Bug Fixes

-   Correctly handle export \* from..., closes #1186

## v0.16.7 (2020-01-17)

### Features

-   Support for query types

### Bug Fixes

-   Add test for {} and fix generation

### Thanks!

-   Robin Stevens

## v0.16.6 (2020-01-16)

### Bug Fixes

-   removeReflection does not fully remove reflections, closes #1176
