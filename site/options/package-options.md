---
title: Package Options
---

# Package Options

> [!note]
> This page only applies when running with `entryPointStrategy` set to `"packages"`.

When running with [entryPointStrategy](input.md#packages) set to `"packages"`.
TypeDoc will _effectively_ be run within each entry point directory, and the
results merged together.

When running in each directory, TypeDoc does **not** copy options from the root
configuration object. This means that any options used during conversion need to
be set within each project, while options used during rendering need to be set
at the root level. The following tables indicate where an option should be set.

## Configuration Options

| Option                                                | Location | Notes                                                                                                      |
| ----------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| [`options`](configuration.md#options)                 | Both     | TypeDoc will read option files when converting each directory and when looking for configuration initially |
| [`tsconfig`](configuration.md#tsconfig)               | Both     | TypeDoc will read option files when converting each directory and when looking for configuration initially |
| [`compilerOptions`](configuration.md#compileroptions) | Package  | In packages mode the TS compiler isn't invoked at the root level                                           |
| [`plugin`](configuration.md#plugin)                   | Root     | Plugins will only be loaded from the root configuration                                                    |

## Input Options

| Option                                                                  | Location | Notes                                                                                                     |
| ----------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| [`entryPoints`](input.md#entrypoints)                                   | Both     | Root: project directories to convert, Package: source code to convert                                     |
| [`entryPointStrategy`](input.md#entrypointstrategy)                     | Both     | Root: `"packages"`, Package: anything but `"packages"`                                                    |
| [`packageOptions`](input.md#packageoptions)                             | Root     | Options to be applied to each package                                                                     |
| [`alwaysCreateEntryPointModule`](input.md#alwayscreateentrypointmodule) | Both     | Likely only useful in packages as there will generally be more than one package                           |
| [`projectDocuments`](input.md#projectdocuments)                         | Both     | Root: Docs at the root level, Package: Docs at the package level                                          |
| [`exclude`](input.md#exclude)                                           | Both     | Root: Packages to exclude, Package: Entry points and exports to exclude.                                  |
| [`externalPattern`](input.md#externalpattern)                           | Package  |                                                                                                           |
| [`excludeExternals`](input.md#excludeexternals)                         | Both     | Root: If the "Externals" filter should be shown in HTML rendering, Package: Exclude items when converting |
| [`excludeNotDocumented`](input.md#excludenotdocumented)                 | Package  |                                                                                                           |
| [`excludeNotDocumentedKinds`](input.md#excludenotdocumentedkinds)       | Package  |                                                                                                           |
| [`excludeInternal`](input.md#excludeinternal)                           | Package  |                                                                                                           |
| [`excludePrivate`](input.md#excludeprivate)                             | Package  |                                                                                                           |
| [`excludePrivateClassFields`](input.md#excludeprivateclassfields)       | Package  |                                                                                                           |
| [`excludeProtected`](input.md#excludeprotected)                         | Package  |                                                                                                           |
| [`excludeReferences`](input.md#excludereferences)                       | Package  |                                                                                                           |
| [`excludeCategories`](input.md#excludecategories)                       | Package  |                                                                                                           |
| [`maxTypeConversionDepth`](input.md#maxtypeconversiondepth)             | Package  |                                                                                                           |
| [`name`](input.md#name)                                                 | Both     | Root: Site name, Package: Package name                                                                    |
| [`includeVersion`](input.md#includeversion)                             | Both     | Root: Repo version, Package: Package version                                                              |
| [`disableSources`](input.md#disablesources)                             | Package  | Rendering will always write sources if present, they must be disabled when converting                     |
| [`sourceLinkTemplate`](input.md#sourcelinktemplate)                     | Package  | Source links are set when converting packages                                                             |
| [`gitRevision`](input.md#gitrevision)                                   | Package  |                                                                                                           |
| [`gitRemote`](input.md#gitremote)                                       | Package  |                                                                                                           |
| [`disableGit`](input.md#disablegit)                                     | Package  |                                                                                                           |
| [`readme`](input.md#readme)                                             | Both     | Root: Site readme, Package: Package readme                                                                |
| [`basePath`](input.md#basepath)                                         | Both     | Root: Site readme, documents, Package: Package readme, documentation comments, documents                  |

## Output Options

| Option                                                                                 | Location | Notes                                                      |
| -------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| [`outputs`](output.md#outputs)                                                         | Root     | Outputs are not written when processing each package       |
| [`out`](output.md#out)                                                                 | Root     |                                                            |
| [`html`](output.md#html)                                                               | Root     |                                                            |
| [`json`](output.md#json)                                                               | Root     |                                                            |
| [`pretty`](output.md#pretty)                                                           | Root     |                                                            |
| [`emit`](output.md#emit)                                                               | Both     |                                                            |
| [`theme`](output.md#theme)                                                             | Root     |                                                            |
| [`router`](output.md#router)                                                           | Root     |                                                            |
| [`lightHighlightTheme`](output.md#lighthighlighttheme)                                 | Root     |                                                            |
| [`darkHighlightTheme`](output.md#darkhighlighttheme)                                   | Root     |                                                            |
| [`highlightLanguages`](output.md#highlightlanguages)                                   | Root     |                                                            |
| [`ignoredHighlightLanguages`](output.md#ignoredhighlightlanguages)                     | Root     |                                                            |
| [`typePrintWidth`](output.md#typeprintwidth)                                           | Root     |                                                            |
| [`customCss`](output.md#customcss)                                                     | Root     |                                                            |
| [`customJs`](output.md#customjs)                                                       | Root     |                                                            |
| [`customFooterHtml`](output.md#customfooterhtml)                                       | Root     |                                                            |
| [`customFooterHtmlDisableWrapper`](output.md#customfooterhtmldisablewrapper)           | Root     |                                                            |
| [`markdownItOptions`](output.md#markdownitoptions)                                     | Root     |                                                            |
| [`markdownItLoader`](output.md#markdownitloader)                                       | Root     |                                                            |
| [`displayBasePath`](output.md#displaybasepath)                                         | Both     | Used to determine file names of entry points and documents |
| [`cname`](output.md#cname)                                                             | Root     |                                                            |
| [`favicon`](output.md#favicon)                                                         | Root     |                                                            |
| [`sourceLinkExternal`](output.md#sourcelinkexternal)                                   | Root     |                                                            |
| [`markdownLinkExternal`](output.md#markdownlinkexternal)                               | Root     |                                                            |
| [`lang`](output.md#lang)                                                               | Root     |                                                            |
| [`locales`](output.md#locales)                                                         | Root     |                                                            |
| [`githubPages`](output.md#githubpages)                                                 | Root     |                                                            |
| [`cacheBust`](output.md#cachebust)                                                     | Root     |                                                            |
| [`hideGenerator`](output.md#hidegenerator)                                             | Root     |                                                            |
| [`searchInComments`](output.md#searchincomments)                                       | Root     |                                                            |
| [`searchInDocuments`](output.md#searchindocuments)                                     | Root     |                                                            |
| [`cleanOutputDir`](output.md#cleanoutputdir)                                           | Root     |                                                            |
| [`titleLink`](output.md#titlelink)                                                     | Root     |                                                            |
| [`navigationLinks`](output.md#navigationlinks)                                         | Root     |                                                            |
| [`sidebarLinks`](output.md#sidebarlinks)                                               | Root     |                                                            |
| [`navigation`](output.md#navigation)                                                   | Root     |                                                            |
| [`headings`](output.md#headings)                                                       | Root     |                                                            |
| [`sluggerConfiguration`](output.md#sluggerconfiguration)                               | Root     |                                                            |
| [`navigationLeaves`](output.md#navigationleaves)                                       | Root     |                                                            |
| [`visibilityFilters`](output.md#visibilityfilters)                                     | Root     |                                                            |
| [`searchCategoryBoosts`](output.md#searchcategoryboosts)                               | Root     |                                                            |
| [`searchGroupBoosts`](output.md#searchgroupboosts)                                     | Root     |                                                            |
| [`hostedBaseUrl`](output.md#hostedbaseurl)                                             | Root     |                                                            |
| [`useHostedBaseUrlForAbsoluteLinks`](output.md#usehostedbaseurlforabsolutelinks)       | Root     |                                                            |
| [`useFirstParagraphOfCommentAsSummary`](output.md#usefirstparagraphofcommentassummary) | Root     |                                                            |
| [`includeHierarchySummary`](output.md#includehierarchysummary)                         | Root     |                                                            |

## Comment Options

| Option                                                                                               | Location | Notes                                                                       |
| ---------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------- |
| [`commentStyle`](comments.md#commentstyle)                                                           | Package  |                                                                             |
| [`useTsLinkResolution`](comments.md#usetslinkresolution)                                             | Package  |                                                                             |
| [`preserveLinkText`](comments.md#preservelinktext)                                                   | Package  |                                                                             |
| [`jsDocCompatibility`](comments.md#jsdoccompatibility)                                               | Package  |                                                                             |
| [`suppressCommentWarningsInDeclarationFiles`](comments.md#suppresscommentwarningsindeclarationfiles) | Package  |                                                                             |
| [`blockTags`](comments.md#blocktags)                                                                 | Package  |                                                                             |
| [`inlineTags`](comments.md#inlinetags)                                                               | Package  |                                                                             |
| [`modifierTags`](comments.md#modifiertags)                                                           | Package  |                                                                             |
| [`cascadedModifierTags`](comments.md#cascadedmodifiertags)                                           | Package  |                                                                             |
| [`excludeTags`](comments.md#excludetags)                                                             | Package  |                                                                             |
| [`notRenderedTags`](comments.md#notrenderedtags)                                                     | Root     |                                                                             |
| [`preservedTypeAnnotationTags`](comments.md#preservedtypeannotationtags)                             | Package  |                                                                             |
| [`externalSymbolLinkMappings`](comments.md#externalsymbollinkmappings)                               | Both     | Unresolved links are checked both when converting and when merging projects |

## Organization Options

| Option                                                           | Location | Notes                                                                                      |
| ---------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| [`groupReferencesByType`](organization.md#groupreferencesbytype) | Both     | Root: Used when determining the group for search group boosts, Package: Used when grouping |
| [`categorizeByGroup`](organization.md#categorizebygroup)         | Package  |                                                                                            |
| [`defaultCategory`](organization.md#defaultcategory)             | Both     | Root: Used when determining the category for search, Package: Used when categorizing       |
| [`categoryOrder`](organization.md#categoryorder)                 | Package  |                                                                                            |
| [`groupOrder`](organization.md#grouporder)                       | Package  |                                                                                            |
| [`sort`](organization.md#sort)                                   | Both     | Root: Sorting for packages, Package: Sorting within packages                               |
| [`sortEntryPoints`](organization.md#sortentrypoints)             | Both     | Root: Whether to sort packages, Package: Whether to sort entry points                      |
| [`kindSortOrder`](organization.md#kindsortorder)                 | Package  |                                                                                            |

## Validation Options

| Option                                                                             | Location | Notes                                                                                                                                        |
| ---------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [`validation`](validation.md#validation)                                           | Both     | TypeDoc modifies the default for packages to defer most validation until projects have been merged. Should generally only be set in the root |
| [`treatWarningsAsErrors`](validation.md#treatwarningsaserrors)                     | Root     |                                                                                                                                              |
| [`treatValidationWarningsAsErrors`](validation.md#treatvalidationwarningsaserrors) | Root     |                                                                                                                                              |
| [`intentionallyNotExported`](validation.md#intentionallynotexported)               | Both     |                                                                                                                                              |
| [`requiredToBeDocumented`](validation.md#requiredtobedocumented)                   | Both     |                                                                                                                                              |
| [`packagesRequiringDocumentation`](validation.md#packagesrequiringdocumentation)   | Both     |                                                                                                                                              |
| [`intentionallyNotDocumented`](validation.md#intentionallynotdocumented)           | Both     |                                                                                                                                              |

## Other Options

| Option                                                | Location | Notes                                |
| ----------------------------------------------------- | -------- | ------------------------------------ |
| [`watch`](other.md#watch)                             | Root     | Not supported in packages mode       |
| [`preserveWatchOutput`](other.md#preservewatchoutput) | Root     |                                      |
| [`help`](other.md#help)                               | Root     |                                      |
| [`version`](other.md#version)                         | Root     |                                      |
| [`showConfig`](other.md#showconfig)                   | Root     | Only shows root configuration values |
| [`logLevel`](other.md#loglevel)                       | Root     |                                      |
| [`skipErrorChecking`](other.md#skiperrorchecking)     | Package  |                                      |
