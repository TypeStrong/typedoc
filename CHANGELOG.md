# Unreleased

## v0.26.1 (2024-06-22)

### Features

-   Improved Korean translation coverage, #2602.

### Bug Fixes

-   Added `@author` to the default list of recognized tags, #2603.
-   Anchor links are no longer incorrectly checked for relative paths, #2604.
-   Fixed an issue where line numbers reported in error messages could be incorrect, #2605.
-   Fixed relative link detection for markdown links containing code in their label, #2606.
-   Fixed an issue with packages mode where TypeDoc would use (much) more memory than required, #2607.
-   TypeDoc will no longer crash when asked to render highlighted code for an unsupported language, #2609.
-   Fixed an issue where relatively-linked files would not be copied to the output directory in packages mode.
-   Fixed an issue where modifier tags were not applied to top level modules in packages mode.
-   Fixed an issue where excluded tags were not removed from top level modules in packages mode.
-   `.jsonc` configuration files are now properly read as JSONC, rather than being passed to `require`.

### Thanks!

-   @KNU-K

# v0.26.0 (2024-06-22)

### Breaking Changes

-   Drop support for Node 16.
-   Moved from `marked` to `markdown-it` for parsing as marked has moved to an async model which supporting would significantly complicate TypeDoc's rendering code.
    This means that any projects setting `markedOptions` needs to be updated to use `markdownItOptions`.
    Unlike `marked@4`, `markdown-it` pushes lots of functionality to plugins. To use plugins, a JavaScript config file must be used with the `markdownItLoader` option.
-   Updated Shiki from 0.14 to 1.x. This should mostly be a transparent update which adds another 23 supported languages and 13 supported themes.
    As Shiki adds additional languages, the time it takes to load the highlighter increases linearly. To avoid rendering taking longer than necessary,
    TypeDoc now only loads a few common languages. Additional languages can be loaded by setting the `--highlightLanguages` option.
-   Changed default of `--excludePrivate` to `true`.
-   Renamed `--sitemapBaseUrl` to `--hostedBaseUrl` to reflect that it can be used for more than just the sitemap.
-   Removed deprecated `navigation.fullTree` option.
-   Removed `--media` option, TypeDoc will now detect image links within your comments and markdown documents and automatically copy them to the site.
-   Removed `--includes` option, use the `@document` tag instead.
-   Removed `--stripYamlFrontmatter` option, TypeDoc will always do this now.
-   Renamed the `--htmlLang` option to `--lang`.
-   Removed the `--gaId` option for Google Analytics integration and corresponding `analytics` theme member, #2600.
-   All function-likes may now have comments directly attached to them. This is a change from previous versions of TypeDoc where functions comments
    were always moved down to the signature level. This mostly worked, but caused problems with type aliases, so was partially changed in 0.25.13.
    This change was extended to apply not only to type aliases, but also other function-likes declared with variables and callable properties.
    As a part of this change, comments on the implementation signature of overloaded functions will now be added to the function reflection, and will
    not be inherited by signatures of that function, #2521.
-   API: TypeDoc now uses a typed event emitter to provide improved type safety, this found a bug where `Converter.EVENT_CREATE_DECLARATION`
    was emitted for `ProjectReflection` in some circumstances.
-   API: `MapOptionDeclaration.mapError` has been removed.
-   API: Deprecated `BindOption` decorator has been removed.
-   API: `DeclarationReflection.indexSignature` has been renamed to `DeclarationReflection.indexSignatures`.
    Note: This also affects JSON serialization. TypeDoc will support JSON output from 0.25 through at least 0.26.
-   API: `JSONOutput.SignatureReflection.typeParameter` has been renamed to `typeParameters` to match the JS API.
-   API: `DefaultThemeRenderContext.iconsCache` has been removed as it is no longer needed.
-   API: `DefaultThemeRenderContext.hook` must now be passed `context` if required by the hook.

### Features

-   Added support for TypeScript 5.5.
-   Added new `--projectDocuments` option to specify additional Markdown documents to be included in the generated site #247, #1870, #2288, #2565.
-   TypeDoc now has the architecture in place to support localization. No languages besides English
    are currently shipped in the package, but it is now possible to add support for additional languages, #2475.
-   Added support for a `packageOptions` object which specifies options that should be applied to each entry point when running with `--entryPointStrategy packages`, #2523.
-   `--hostedBaseUrl` will now be used to generate a `<link rel="canonical">` element in the project root page, #2550.
-   Added support for documenting individual elements of a union type, #2585.
    Note: This feature is only available on type aliases directly containing unions.
-   TypeDoc will now log the number of errors/warnings errors encountered, if any, after a run, #2581.
-   New option, `--customFooterHtml` to add custom HTML to the generated page footer, #2559.
-   TypeDoc will now copy modifier tags to children if specified in the `--cascadedModifierTags` option, #2056.
-   TypeDoc will now warn if mutually exclusive modifier tags are specified for a comment (e.g. both `@alpha` and `@beta`), #2056.
-   Groups and categories can now be collapsed in the page body, #2330.
-   Added support for JSDoc `@hideconstructor` tag.
    This tag should only be used to work around TypeScript#58653, prefer the more general `@hidden`/`@ignore` tag to hide members normally, #2577.
-   Added `--useHostedBaseUrlForAbsoluteLinks` option to use the `--hostedBaseUrl` option to produce absolute links to pages on a site, #940.
-   Tag headers now generate permalinks in the default theme, #2308.
-   TypeDoc now attempts to use the "most likely name" for a symbol if the symbol is not present in the documentation, #2574.
-   Fixed an issue where the "On This Page" section would include markdown if the page contained headings which contained markdown.
-   TypeDoc will now warn if a block tag is used which is not defined by the `--blockTags` option.
-   Added three new sort strategies `documents-first`, `documents-last`, and `alphabetical-ignoring-documents` to order markdown documents.
-   Added new `--alwaysCreateEntryPointModule` option. When set, TypeDoc will always create a `Module` for entry points, even if only one is provided.
    If `--projectDocuments` is used to add documents, this option defaults to `true`, otherwise, defaults to `false`.
-   Added new `--highlightLanguages` option to control what Shiki language packages are loaded.
-   TypeDoc will now render union elements on new lines if there are more than 3 items in the union.
-   TypeDoc will now only render the "Type Declaration" section if it will provide additional information not already presented in the page.
    This results in significantly smaller documentation pages in many cases where that section would just repeat what has already been presented in the rendered type.
-   Added `comment.beforeTags` and `comment.afterTags` hooks for plugin use.
    Combined with `CommentTag.skipRendering` this can be used to provide custom tag handling at render time.

### Bug Fixes

-   TypeDoc now supports objects with multiple index signatures, #2470.
-   Header anchor links in rendered markdown are now more consistent with headers generated by TypeDoc, #2546.
-   Types rendered in the `Returns` header are now properly colored, #2546.
-   Links added with the `navigationLinks` option are now moved into the pull out navigation on mobile displays, #2548.
-   `@license` and `@import` comments will be ignored at the top of files, #2552.
-   Fixed issue in documentation validation where constructor signatures where improperly considered not documented, #2553.
-   Keyboard focus is now visible on dropdowns and checkboxes in the default theme, #2556.
-   The color theme label in the default theme now has an accessible name, #2557.
-   Fixed issue where search results could not be navigated while Windows Narrator was on, #2563.
-   `charset` is now correctly cased in `<meta>` tag generated by the default theme, #2568.
-   Fixed very slow conversion on Windows where Msys git was used by typedoc to discover repository links, #2586.
-   Validation will now be run in watch mode, #2584.
-   Fixed an issue where custom themes which added dependencies in the `<head>` element could result in broken icons, #2589.
-   `@default` and `@defaultValue` blocks are now recognized as regular blocks if they include inline tags, #2601.
-   Navigation folders sharing a name will no longer be saved with a shared key to `localStorage`.
-   The `--hideParameterTypesInTitle` option no longer applies when rendering function types.
-   Broken `@link` tags in readme files will now cause a warning when link validation is enabled.
-   Fixed `externalSymbolLinkMappings` option's support for [meanings](https://typedoc.org/guides/declaration-references/#meaning) in declaration references.
-   Buttons to copy code now have the `type=button` attribute set to avoid being treated as submit buttons.
-   `--hostedBaseUrl` will now implicitly add a trailing slash to the generated URL.

### Thanks!

-   @Aryakoste
-   @bladerunner2020
-   @Dinnerbone
-   @HarelM
-   @kraenhansen
-   @Nil2000
-   @steve02081504
-   @tristanzander

# Unreleased

## v0.25.13 (2024-04-07)

### Features

-   Added `gitRevision:short` placeholder option to `--sourceLinkTemplate` option, #2529.
    Links generated by TypeDoc will now default to using the non-short git revision.
-   Moved "Generated by TypeDoc" footer into a `<footer>` tag, added `footer.begin` and `footer.end`
    render hooks for use by custom plugins, #2532.

### Bug Fixes

-   Fixed conversion of `NoInfer` missing type parameter reference, #2539.
-   Linking to a member on a page no longer incorrectly claims that
    "This member is normally hidden due to your filter settings" for every member.

### Thanks!

-   @xuhdev

## v0.25.12 (2024-03-10)

### Features

-   Added support for TypeScript 5.4, #2517.

### Bug Fixes

-   Updated page font to work around issues with Mac rendering, #2518.

### Thanks!

-   @docmattman

## v0.25.11 (2024-03-06)

### Bug Fixes

-   Fixed an issue introduced with 0.25.10 which causes the page index to initially render empty, #2514.
-   "On This Page" section is now smarter when handling page headings which do not follow the normal `h1>h2>h3` process, #2515.

## v0.25.10 (2024-03-03)

### Bug Fixes

-   Constructed references to enum types will be properly linked with `@interface`, #2508.
-   Comments on property-methods will no longer be duplicated in generated documentation, #2509.
-   Reduced rendered docs size by writing icons to a referenced SVG asset, #2505.
    For TypeDoc's docs, this reduced the rendered documentation size by ~30%.
-   The HTML docs now attempt to reduce repaints caused by dynamically loading the navigation, #2491.
-   When navigating to a link that contains an anchor, the page will now be properly highlighted in the page navigation.

## v0.25.9 (2024-02-26)

### Features

-   Literal numeric unions will now be sorted during conversion, #2502.

### Bug Fixes

-   Module readmes will now be included in JSON output, #2500.
-   Fixed crash when `--excludeNotDocumented` was used and the project contained a reference to a removed signature, #2496.
-   Fixed crash when converting an infinitely recursive type via a new `--maxTypeConversionDepth` option, #2507.
-   Type links in "Parameters" and "Type Parameters" sections of the page will now be correctly colored.

### Thanks!

-   @JMBeresford

## v0.25.8 (2024-02-09)

### Features

-   Added a new `--sitemapBaseUrl` option. When specified, TypeDoc will generate a `sitemap.xml` in your output folder that describes the site, #2480.
-   Added support for the `@class` tag. When added to a comment on a variable or function, TypeDoc will convert the member as a class, #2479.
    Note: This should only be used on symbols which actually represent a class, but are not declared as a class for some reason.
-   Added support for `@groupDescription` and `@categoryDescription` to provide a description of groups and categories, #2494.
-   API: Exposed `Context.getNodeComment` for plugin use, #2498.

### Bug Fixes

-   Fixed an issue where a namespace would not be created for merged function-namespaces which are declared as variables, #2478.
-   A class which implements itself will no longer cause a crash when rendering HTML, #2495.
-   Variable functions which have construct signatures will no longer be converted as functions, ignoring the construct signatures.
-   The class hierarchy page will now include classes whose base class is not included in the documentation, #2486.
-   Fixed an issue where, if the index section was collapsed when loading the page, all content within it would be hidden until expanded, and a member visibility checkbox was changed.
-   API: `Context.programs` will no longer contain duplicates, #2498.

## v0.25.7 (2024-01-08)

### Bug Fixes

-   Fixed an issue where a namespace would not be created for merged function-namespaces only containing types, #2476.
-   Fixed an infinite loop when converting a union type which directly contained another union type which refers to itself, #2469.

## v0.25.6 (2024-01-01)

### Bug Fixes

-   Fixed infinite loop caused by a fix for some complicated union/intersection types, #2468.
-   Improved infinite loop detection in type converter to reduce false positives.

## v0.25.5 (2024-01-01)

## Features

-   Added a new hierarchy.html page to HTML output which displays the full inheritance hierarchy for classes included in the documentation, #182.
-   Added a `--navigation.includeFolders` (default: `true`) option to create nested navigation for projects which include many entry points, #2388.
-   Type parameters on functions/classes can will now link to the "Type Parameters" section, #2322.
    Type parameters have also been changed to have a distinct color from type aliases when rendering, which can be changed with custom CSS.
-   TypeDoc now provides warnings if a signature comment is directly specified on a signature and contains `@param` tags which do not apply, #2368.
-   Extended reflection preview view for interfaces to include type parameters, #2455.
-   Added special cases for converting methods which are documented as returning `this` or accepting `this` as a parameter, #2458.
    Note: This will only happen if a method is declared as `method(): this`, it will not happen if the method implicitly returns `this`
    as the compiler strips that information when creating types for a class instance.
-   Improved handling of functions with properties. Previous TypeDoc versions would always create a separate
    namespace for properties, now, TypeDoc will create a separate namespace if the function is declaration merged
    with a namespace. If the properties are added via `Object.assign` or via property assignment on the function
    TypeDoc will now instead add the properties to the function's page, #2461.

### Bug Fixes

-   If both an interface and a variable share a name/symbol, TypeDoc will no longer link to the variable when referenced in a type position, #2106.
-   `notDocumented` validation will no longer require documentation for data within parameters that cannot be documented via `@param`, #2291.
-   "defined in" locations for signatures will now always be contained within the function declaration's location. This prevents defined in sometimes pointing to node_modules, #2307.
-   Type parameters will now be resolved for arrow-methods on classes like regular class methods, #2320.
-   TypeDoc now inherits `typedocOptions` fields from extended tsconfig files, #2334.
-   Methods which return function types no longer have duplicated comments, #2336.
-   Comments on function-like type aliases will now show up under the type alias, rather than nested within the type declaration, #2372.
-   Improved detection of default values for parameters with destructured values, #2430.
-   Fix crash when converting some complicated union/intersection types, #2451.
-   Navigation triangle markers should no longer display on a separate line with some font settings, #2457.
-   `@group` and `@category` organization is now applied later to allow inherited comments to create groups/categories, #2459.
-   Conversion order should no longer affect link resolution for classes with properties whose type does not rely on `this`, #2466.
-   Keyword syntax highlighting introduced in 0.25.4 was not always applied to keywords.
-   Module reflections now have a custom `M` icon rather than sharing with the namespace icon.
    Note: The default CSS still colors both modules and namespaces the same, as it is generally uncommon to have both in a generated site.
-   If all members in a group are hidden from the page, the group will be hidden in the page index on page load.

## v0.25.4 (2023-11-26)

### Features

-   Added support for TypeScript 5.3, #2446.
-   TypeDoc will now render interfaces as code at the top of the page describing interfaces, #2449.
    This can be controlled through the new `DefaultThemeRenderContext.reflectionPreview` helper.
-   Improved type rendering to highlight keywords differently than symbols.

### Bug Fixes

-   Fixed automatic declaration file resolution on Windows, #2416.
-   Fixed default option values on options declared by plugins in packages mode, #2433.
-   `gitRevision` will now be replaced in `sourceLinkTemplate`, #2434.
-   Improved handling of function-modules created with `Object.assign`, #2436.
-   TypeDoc will no longer warn about duplicate comments with warnings which point to a single comment, #2437
-   Fixed an infinite loop when `skipLibCheck` is used to ignore some compiler errors, #2438.
-   `@example` tag titles will now be rendered in the example heading, #2440.
-   Correctly handle transient symbols in `@namespace`-created namespaces, #2444.
-   TypeDoc no longer displays the "Hierarchy" section if there is no inheritance hierarchy to display.
-   Direct links to individual signatures no longer results in the signature being partially scrolled off the screen.

### Thanks!

-   @li-jia-nan
-   @Nokel81
-   @ocavue
-   @swarnpallav

## v0.25.3 (2023-10-29)

### Features

-   Added `--sourceLinkExternal` option to render source code links as external, #2415.
-   TypeDoc no longer requires the `declarationMap` option to be set to true to handle cross-package links in packages mode, #2416.
-   Added `external-last` option for the `--sort` option, #2418.

### Bug Fixes

-   TypeDoc now attempts to correct local anchor links in readme files which are broken by its deconfliction logic, #2413.
-   TypeDoc now finds comments on index signatures again, #2414.
-   TypeDoc now does a better job of detecting properties when destructured function arguments are used.
-   Quotes will now be properly escaped in HTML attribute values.

### Thanks!

-   @mogelbrod
-   @rsanchez

## v0.25.2 (2023-10-08)

### Features

-   Added `navigationLeaves` option to remove branches from the navigation tree, #2382.
-   Added `sortEntryPoints` option (defaults to true) to allow disabling entry point sorting, #2393.
-   Improved support for multi-word searches, #2400.

### Bug Fixes

-   Fixed conversion of `@template` constraints on JSDoc defined type parameters, #2389.
-   Invalid link validation is now correctly suppressed before all projects have been converted in packages mode, #2403.
-   Fixed tsconfig handling for projects using a solution-style tsconfig, #2406.
-   Fixed broken settings icons caused by icon caching introduced in 0.25.1, #2408.
-   Corrected module comment handling on declaration files containing a single `declare module "foo"`, #2401.

### Thanks!

-   @schiem

## v0.25.1 (2023-09-04)

### Features

-   Added `stripYamlFrontmatter` config option to remove YAML frontmatter from README.md, #2381.
-   Added `--excludeCategories` config option to remove reflections present in any excluded category, #1407.
-   If no tsconfig.json file is present, TypeDoc will now attempt to compile without setting any compiler options, #2304.
-   Navigation is now written to a JS file and built dynamically, which significantly decreases document generation time
    with large projects and also provides large space benefits. Themes may now override `DefaultTheme.buildNavigation`
    to customize the displayed navigation tree, #2287.
    Note: This change renders `navigation.fullTree` obsolete. If you set it, TypeDoc will warn that it is being ignored.
    It will be removed in v0.26.
-   The search index is now compressed before writing, which reduces most search index sizes by ~5-10x.
-   TypeDoc will now attempt to cache icons when `DefaultThemeRenderContext.icons` is overwritten by a custom theme.
    Note: To perform this optimization, TypeDoc relies on `DefaultThemeRenderContext.iconCache` being rendered within
    each page. TypeDoc does it in the `defaultLayout` template.
-   Cache URL derivation during generation, #2386.

### Bug Fixes

-   `@property` now works as expected if used to override a method's documentation.
-   Deprecated functions/methods are now correctly rendered with a struck-out name.
-   `--watch` mode works again, #2378.
-   Improved support for optional names within JSDoc types, #2384.
-   Fixed duplicate rendering of reflection flags on signature parameters, #2385.
-   TypeDoc now handles the `intrinsic` keyword if TS intrinsic types are included in documentation.
-   `--exclude` is now respected when expanding globs in entry points, #2376.

### Thanks!

-   @ajesshope
-   @HemalPatil
-   @hrueger
-   @typhonrt

# v0.25.0 (2023-08-25)

### Breaking Changes

-   Bump minimum Node version to 16.
-   Removed `legacy-packages` option for `--entryPointStrategy`.
-   Changed default value of `--categorizeByGroup` to `false`.
-   Specifying a link as the `gitRemote` is no longer supported.
-   An `Application` instance must now be retrieved via `Application.bootstrap` or `Application.bootstrapWithPlugins`, #2268.
-   Removed `ReflectionKind.ObjectLiteral` that was never used by TypeDoc.
-   Removed deprecated members `DefaultThemeRenderContext.comment` and `DefaultThemeRenderContext.attemptExternalResolution`.

### Features

-   Added support for TypeScript 5.2, #2373.
-   TypeDoc config files now support options default-exported from an ESM config file, #2268.
-   TypeDoc config files may now export a promise containing configuration, #2268.
-   Added `--preserveLinkText` option (defaults to true) which determines whether the reflection name or full link text is included
    in the output when no override is specified, #2355.
-   Added a no-results placeholder when no search results are available, #2347.
-   Implemented several miscellaneous performance improvements to generate docs faster, this took the time to generate TypeDoc's
    site from ~5.6 seconds to ~5.4 seconds.
-   Added `--disableGit` option to prevent TypeDoc from using Git to try to determine if sources can be linked, #2326.
-   Added support for tags `@showGroups`, `@hideGroups`, `@showCategories`, `@hideCategories` to configure the navigation pane on a
    per-reflection basis, #2329.
-   With `--jsDocCompatibility.defaultTags` set, `@defaultValue` is now implicitly a code block if the text contains no code, #2370.

### Bug Fixes

-   Fixed link discovery if nested (`Foo#bar`) links were used and `--useTsLinkResolution` is enabled in some cases, #2360.
-   Links with invalid declaration references will no longer silently link to the wrong page in some cases, #2360.
-   Fixed duplicate definitions in type hierarchy when using packages mode, #2327.
-   `@inheritDoc` was not properly resolved across packages in packages mode, #2331.
-   Added warning for attempted `@interface` use on union types, #2352.
-   Fixed misleading type annotation on `Theme.getUrls`, #2318.
-   Fixed duplicate namespace in documentation if `@namespace` is used on a variable with an associated namespace, #2364.
-   Fixed `@namespace` property discovery if merged with a type and the type was declared first #2364.
-   Tables in markdown are now styled, #2366.
-   Sidebar links no longer open in a new tab, #2353.
-   Headers now include some padding before rendering text, #2316.
-   Symbol locations for signatures on `reflection.sources` now considers the node's name like non-signature location discovery does.

### Thanks!

-   @camc314
-   @cprussin
-   @roggervalf
-   @Th3S4mur41

## v0.24.8 (2023-06-04)

### Features

-   Added support for TypeScript 5.1, #2296.
-   Added `navigation.fullTree` to control rendering the full navigation tree on each page, #2287.
    This option will likely be replaced in 0.25 with dynamic loading of the full tree.
-   TypeDoc's `--pretty` option now also controls whether generated HTML contains line breaks, #2287.
-   Optimized icon caching to reduce file size in generated HTML documentation, #2287.
-   Render property description of "roughly top level" object types, #2276.
-   Added `MarkdownEvent.INCLUDE` for plugins, #2284.

### Bug Fixes

-   When rendering functions/methods, TypeDoc will now render the comment summary above the parameters/return type,
    and any other block tags in the order they are defined in the comment, #2285.
-   Comments are no longer removed from classes/interfaces containing call signatures, #2290.

### Thanks!

-   @krisztianb
-   @WikiRik

## v0.24.7 (2023-05-08)

### Features

-   TypeDoc will now allow conversion without any entry points to support "readme only" packages, #2264.

### Bug Fixes

-   Category children are now sorted according to the `sort` option, #2272.
-   Inline tags no longer require a space after the tag name to be parsed as a tag, #2273.
-   Fixed module/namespace links in navigation when viewed in Safari, #2275.

## v0.24.6 (2023-04-24)

### Features

-   Improved error messaging if a provided entry point could not be converted into a documented module reflection, #2242.
-   API: Added support for `g`, `circle`, `ellipse`, `polygon`, and `polyline` svg elements, #2259.
-   Extended `jsDocCompatibility` option with `inheritDocTag` to ignore fully lowercase `inheritDoc` tags and
    `ignoreUnescapedBraces` to disable warnings about unescaped `{` and `}` characters in comments.

### Bug Fixes

-   `--useTsLinkResolution` is no longer ignored within block tags, #2260.
-   The current namespace will also be expanded in the navigation on page load, #2260.
-   Fixed flicker of navigation pane when reloading a page caused by updating expansion state after the page was loaded.
-   Fixed an infinite loop if more than one entry point was provided, and all entry points were the same.

### Thanks!

-   @FlippieCoetser

## v0.24.5 (2023-04-22)

### Features

-   Categories and groups can now be shown in the navigation, added `--navigation.includeCategories`
    and `--navigation.includeGroups` to control this behavior. The `--categorizeByGroup` option also
    effects this behavior. If `categorizeByGroup` is set (the default) and `navigation.includeGroups` is
    _not_ set, the value of `navigation.includeCategories` will be effectively ignored since categories
    will be created only within groups, #1532.
-   Added support for discovering a "module" comment on global files, #2165.
-   Added copy code to clipboard button, #2153.
-   Function `@returns` blocks will now be rendered with the return type, #2180.
-   Added `--groupOrder` option to specify the sort order of groups, #2251.

### Bug Fixes

-   Type parameter constraints now respect the `--hideParameterTypesInTitle` option, #2226.
-   Even more contrast fixes, #2248.
-   Fix semantic highlighting for predicate type's parameter references, #2249.
-   Fixed broken links to heading titles.
-   Fixed inconsistent styling between type parameter lists and parameter lists.
-   TypeDoc will now warn if more than one `@returns` block is is present in a function, and ignore the duplicate blocks as specified by TSDoc.

### Thanks!

-   @FlippieCoetser

## v0.24.4 (2023-04-16)

### Bug Fixes

-   Fixed broken semantic coloring, #2247.
-   Increased contrast for parameter titles in dark mode to meet WCAG AA contrast requirements, #2244.
-   Underline color of index links now matches the text color, #2245.
-   Increased contract for active menu item text in dark mode.

## v0.24.3 (2023-04-16)

### Bug Fixes

-   Fixed path expansion on Windows preventing generation, #2243 and #2241.

## v0.24.2 (2023-04-15)

### Features

-   Added semantic link coloring for reflection names & links, #2227.
    Note: This resulted in function signatures becoming too busy for easy scanning with even slightly
    complicated signatures as such, TypeDoc now only renders parameter names in the signature title
    and includes the type in the parameter details as usual. This can be controlled with the new
    `--hideParameterTypesInTitle` option.
-   Conditional types will now render their branches on the next line for easier comprehension.

### Bug Fixes

-   Fixed `&` showing as `&amp;` and HTML text showing up in page contents navigation, #2224.
-   Increased padding between sections when one navigation column is displayed, #2225.
-   Correct padding for navigation elements with a displayed icon, #2229.
-   Fixed `source-order` sort strategy failing to compare reflections within a file.
-   Added `enum-member-source-order` specialization of the `source-order` sort strategy which only compares enum members, #2237.
-   Updated highlight colors for semantic links to meet WCAG AA contrast requirements, #2228.
-   Type parameters are now highlighted consistently, #2230.
-   Fixed semantic coloring in type and function signatures, #2227.
-   Fixed issue where removing a reflection indirectly containing an object/function type would only partially remove the reflection, #2231.
-   Fixed "Implementation of X.y" links if a mixture of methods and property-methods are used, #2233.
-   "Implementation of" text to symbol-properties not contained in the documentation will now use the resolved name instead of a `__@` symbol name, #2234.
-   Fix expansion of globs if a single entry point is provided, #2235.
-   Validation will no longer be skipped for sub packages when running with `--entryPointStrategy packages`.
-   Fixed broken theme toggle if the page contained a member named "theme".

### Thanks!

-   @RunDevelopment

## v0.24.1 (2023-04-09)

### Bug Fixes

-   Improve detection for legacy JSDoc `@example` tags, #2222.
-   The page footer will now appear at the bottom of the page even if the page is short, #2223.

# v0.24.0 (2023-04-08)

### Breaking Changes

-   `@link`, `@linkcode` and `@linkplain` tags will now be resolved with TypeScript's link resolution by default. The `useTsLinkResolution` option
    can be used to turn this behavior off, but be aware that doing so will mean your links will be resolved differently by editor tooling and TypeDoc.
-   TypeDoc will no longer automatically load plugins from `node_modules`. Specify the `--plugin` option to indicate which modules should be loaded.
-   The `packages` entry point strategy will now run TypeDoc in each provided package directory and then merge the results together.
    The previous `packages` strategy has been preserved under `legacy-packages` and will be removed in 0.25. If the new strategy does not work
    for your use case, please open an issue.
-   Removed `--logger` option, to disable all logging, set the `logLevel` option to `none`.
-   Dropped support for legacy `[[link]]`s, removed deprecated `Reflection.findReflectionByName`.
-   Added `@overload` to default ignored tags.

### API Breaking Changes

-   The `label` property on `Reflection` has moved to `Comment`.
-   The default value of the `out` option has been changed from `""` to `"./docs"`, #2195.
-   Renamed `DeclarationReflection#version` to `DeclarationReflection#projectVersion` to match property on `ProjectReflection`.
-   Removed unused `Reflection#originalName`.
-   Removed `Reflection#kindString`, use `ReflectionKind.singularString(reflection.kind)` or `ReflectionKind.pluralString(reflection.kind)` instead.
-   The `named-tuple-member` and `template-literal` type kind have been replaced with `namedTupleMember` and `templateLiteral`, #2100.
-   Properties related to rendering are no longer stored on `Reflection`, including `url`, `anchor`, `hasOwnDocument`, and `cssClasses`.
-   `Application.bootstrap` will no longer load plugins. If you want to load plugins, use `Application.bootstrapWithPlugins` instead, #1635.
-   The options passed to `Application.bootstrap` will now be applied both before _and_ after reading options files, which may cause a change in configuration
    if using a custom script to run TypeDoc that includes some options, but other options are set in config files.
-   Moved `sources` property previously declared on base `Reflection` class to `DeclarationReflection` and `SignatureReflection`.
-   Moved `relevanceBoost` from `ContainerReflection` to `DeclarationReflection` since setting it on the parent class has no effect.
-   Removed internal `ReferenceType.getSymbol`, reference types no longer reference the `ts.Symbol` to enable generation from serialized JSON.
-   `OptionsReader.priority` has been renamed to `OptionsReader.order` to more accurately reflect how it works.
-   `ReferenceType`s which point to type parameters will now always be intentionally broken since they were never linked and should not be warned about when validating exports.
-   `ReferenceType`s now longer include an `id` property for their target. They now instead include a `target` property.
-   Removed `Renderer.addExternalSymbolResolver`, use `Converter.addExternalSymbolResolver` instead.
-   Removed `CallbackLogger`.
-   Removed `SerializeEventData` from serialization events.
-   A `PageEvent` is now required for `getRenderContext`. If caching the context object, `page` must be updated when `getRenderContext` is called.
-   `PageEvent` no longer includes the `template` property. The `Theme.render` method is now expected to take the template to render the page with as its second argument.
-   Removed `secondaryNavigation` member on `DefaultThemeRenderContext`.
-   Renamed `navigation` to `sidebar` on `DefaultThemeRenderContext` and `navigation.begin`/`navigation.end` hooks to `sidebar.begin`/`sidebar.end`.

### Features

-   Added `--useTsLinkResolution` option (on by default) which tells TypeDoc to use TypeScript's `@link` resolution.
-   Added `--jsDocCompatibility` option (on by default) which controls TypeDoc's automatic detection of code blocks in `@example` and `@default` tags.
-   Reworked default theme navigation to add support for a page table of contents, #1478, #2189.
-   Added support for `@interface` on type aliases to tell TypeDoc to convert the fully resolved type as an interface, #1519
-   Added support for `@namespace` on variable declarations to tell TypeDoc to convert the variable as a namespace, #2055.
-   Added support for `@prop`/`@property` to specify documentation for a child property of a symbol, intended for use with `@interface`.
-   TypeDoc will now produce more informative error messages for options which cannot be set from the cli, #2022.
-   TypeDoc will now attempt to guess what option you may have meant if given an invalid option name.
-   Plugins may now return a `Promise<void>` from their `load` function, #185.
-   TypeDoc now supports plugins written with ESM, #1635.
-   Added `Renderer.preRenderAsyncJobs` and `Renderer.postRenderAsyncJobs`, which may be used by plugins to perform async processing for rendering, #185.
    Note: Conversion is still intentionally a synchronous process to ensure stability of converted projects between runs.
-   TypeDoc options may now be set under the `typedocOptions` key in `package.json`, #2112.
-   Added `--cacheBust` option to tell TypeDoc to include include the generation time in files, #2124.
-   Added `--excludeReferences` option to tell TypeDoc to omit re-exports of a symbol already included from the documentation.
-   Introduced new render hooks `pageSidebar.begin` and `pageSidebar.end`.

### Bug Fixes

-   TypeDoc will now ignore package.json files not containing a `name` field, #2190.
-   Fixed `@inheritDoc` on signatures (functions, methods, constructors, getters, setters) being unable to inherit from a non-signature.
-   Interfaces/classes created via extending a module will no longer contain variables/functions where the member should have been converted as properties/methods, #2150.
-   TypeDoc will now ignore a leading `v` in versions, #2212.
-   Category titles now render with the same format in the page index and heading title, #2196.
-   Fixed crash when using `typeof` on a reference with type arguments, #2220.
-   Fixed broken anchor links generated to signatures nested within objects.

### Thanks!

-   @bodil
-   @futurGH
-   @jm4rtinez
-   @muratgozel

## v0.23.28 (2023-03-19)

### Features

-   Added support for TypeScript 5.0, #2201.
    -   `const` type parameters.
    -   JSDoc `@overload` tag.
    -   JSDoc `@satisfies` tag.

## v0.23.27 (2023-03-16)

### Features

-   Added `--treatValidationWarningsAsErrors` to treat only validation warnings as errors without treating all warnings as errors, #2199.

### Bug Fixes

-   Fixed a bug where optional properties were not appropriately marked as optional, #2200.
-   Fixed shifted navigation pane on devices 1024px wide, #2191.
-   Add missing `@private` and `@protected` tags to `typedoc/tsdoc.json`, #2187.

### Thanks!

-   @futurGH

## v0.23.26 (2023-02-26)

### Features

-   Added `Application.EVENT_VALIDATE_PROJECT` event for plugins which implement custom validation, #2183.
-   Plugins may now return an object from external symbol resolvers, #2066.
-   Expose `Comment.displayPartsToMarkdown` on for themes overwriting the `comment` helper, #2115.

### Bug Fixes

-   Fix crash when converting `export default undefined`, #2175.
-   Fix error in console when clicking on headings in the readme, #2170.
-   TypeDoc will now ignore parameters of callback parameters when validating that all parameters have documentation, #2154.

### Thanks!

-   @captain-torch
-   @loopingz
-   @RebeccaStevens

## v0.23.25 (2023-02-11)

### Breaking Changes

-   Upgraded Shiki, if your highlight theme was set to `material-<theme>`, the value will need to be changed to
    `material-theme-<theme>`, see the [Shiki release notes](https://github.com/shikijs/shiki/blob/main/CHANGELOG.md#0130--2023-01-27).

### Features

-   Added new `excludeNotDocumentedKinds` variable to control which reflection types can be removed
    by the `excludeNotDocumented` option, #2162.
-   Added `typedoc.jsonc`, `typedoc.config.js`, `typedoc.config.cjs`, `typedoc.cjs` to the list of files
    which TypeDoc will automatically use as configuration files.

### Bug Fixes

-   Entry points under `node_modules` will no longer be ignored, #2151.
-   Corrected behavior of `excludeNotDocumented` on arrow function-variables, #2156.
-   Added `package.json` to exports declaration.

### Thanks!

-   @boneskull
-   @Mikkal24
-   @zamiell

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
    [the documentation](https://typedoc.org/options/comments/#externalsymbollinkmappings) for usage examples and caveats, #2030.
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
    For most cases, this will just work. See [the documentation](https://github.com/TypeStrong/typedoc-site/blob/da9760bccf30ce96210f6e35b9dcc2a4ddeed234/guides/link-resolution.md) for details on how link resolution works.
-   TypeDoc will now produce warnings for bracketed links (`[[ target ]]`). Use `{@link target}` instead. The `{@link}` syntax will be recognized by [TypeScript 4.3](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-3.html#editor-support-for-link-tags) and later and used to provide better intellisense. TypeDoc version 0.24.0 will remove support for `[[ target ]]` style links.
    Support for ``[[`links`]]`` with brackets + code ticks have been dropped.
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
-   Links are no longer be resolved against a global list of all symbols. See [the documentation](https://github.com/TypeStrong/typedoc-site/blob/da9760bccf30ce96210f6e35b9dcc2a4ddeed234/guides/link-resolution.md) for details on link resolution.
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
