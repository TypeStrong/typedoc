---
title: Options
children:
    - options/configuration.md
    - options/input.md
    - options/output.md
    - options/comments.md
    - options/organization.md
    - options/validation.md
    - options/other.md
---

Any command line arguments that are passed without a flag will be parsed as entry points.
Any options passed on the command line will override options set in a configuration file.

<!--
Updating these lists can be easily done by going to each page and running the
following JS to copy what they should be to your clipboard. Ideally, someday this
becomes automated...

copy($$(".tsd-page-navigation > .tsd-accordion-details > a").map(a => [a.textContent, a.href.substring(a.href.lastIndexOf("/") + "/Options.".length).replace(/^./, x => x[0].toLowerCase()).replace(".html", ".md").replace("md:", "")]).map(l => `-   [${l[0]}](options/${l[1]})`).join("\n"))
-->

## Configuration Options

Options which control what files TypeDoc reads.

-   [options](options/configuration.md#options)
-   [tsconfig](options/configuration.md#tsconfig)
-   [compilerOptions](options/configuration.md#compilerOptions)
-   [plugin](options/configuration.md#plugin)

## Input Options

Options which control how input is converted into a project that can be rendered
to HTML or JSON.

-   [entryPoints](options/input.md#entryPoints)
-   [entryPointStrategy](options/input.md#entryPointStrategy)
-   [alwaysCreateEntryPointModule](options/input.md#alwaysCreateEntryPointModule)
-   [projectDocuments](options/input.md#projectDocuments)
-   [exclude](options/input.md#exclude)
-   [externalPattern](options/input.md#externalPattern)
-   [excludeExternals](options/input.md#excludeExternals)
-   [excludeNotDocumented](options/input.md#excludeNotDocumented)
-   [excludeNotDocumentedKinds](options/input.md#excludeNotDocumentedKinds)
-   [excludeInternal](options/input.md#excludeInternal)
-   [excludePrivate](options/input.md#excludePrivate)
-   [excludeProtected](options/input.md#excludeProtected)
-   [excludeReferences](options/input.md#excludeReferences)
-   [excludeCategories](options/input.md#excludeCategories)
-   [name](options/input.md#name)
-   [includeVersion](options/input.md#includeVersion)
-   [disableSources](options/input.md#disableSources)
-   [sourceLinkTemplate](options/input.md#sourceLinkTemplate)
-   [gitRevision](options/input.md#gitRevision)
-   [gitRemote](options/input.md#gitRemote)
-   [disableGit](options/input.md#disableGit)
-   [readme](options/input.md#readme)

## Output Options

Options which control TypeDoc's HTML output.

-   [out](options/output.md#out)
-   [json](options/output.md#json)
-   [pretty](options/output.md#pretty)
-   [emit](options/output.md#emit)
-   [theme](options/output.md#theme)
-   [lightHighlightTheme](options/output.md#lightHighlightTheme)
-   [darkHighlightTheme](options/output.md#darkHighlightTheme)
-   [highlightLanguages](options/output.md#highlightLanguages)
-   [typePrintWidth](options/output.md#typePrintWidth)
-   [customCss](options/output.md#customCss)
-   [customFooterHtml](options/output.md#customFooterHtml)
-   [customFooterHtmlDisableWrapper](options/output.md#customFooterHtmlDisableWrapper)
-   [markdownItOptions](options/output.md#markdownItOptions)
-   [markdownItLoader](options/output.md#markdownItLoader)
-   [basePath](options/output.md#basePath)
-   [cname](options/output.md#cname)
-   [sourceLinkExternal](options/output.md#sourceLinkExternal)
-   [lang](options/output.md#lang)
-   [locales](options/output.md#locales)
-   [githubPages](options/output.md#githubPages)
-   [cacheBust](options/output.md#cacheBust)
-   [hideParameterTypesInTitle](options/output.md#hideParameterTypesInTitle)
-   [hideGenerator](options/output.md#hideGenerator)
-   [searchInComments](options/output.md#searchInComments)
-   [searchInDocuments](options/output.md#searchInDocuments)
-   [cleanOutputDir](options/output.md#cleanOutputDir)
-   [titleLink](options/output.md#titleLink)
-   [navigationLinks](options/output.md#navigationLinks)
-   [sidebarLinks](options/output.md#sidebarLinks)
-   [navigation](options/output.md#navigation)
-   [navigationLeaves](options/output.md#navigationLeaves)
-   [visibilityFilters](options/output.md#visibilityFilters)
-   [searchCategoryBoosts](options/output.md#searchCategoryBoosts)
-   [searchGroupBoosts](options/output.md#searchGroupBoosts)
-   [hostedBaseUrl](options/output.md#hostedBaseUrl)
-   [useHostedBaseUrlForAbsoluteLinks](options/output.md#useHostedBaseUrlForAbsoluteLinks)
-   [useFirstParagraphOfCommentAsSummary](options/output.md#useFirstParagraphOfCommentAsSummary)

## Comment Options

Options which control how TypeDoc parses comments.

-   [commentStyle](options/comments.md#commentStyle)
-   [useTsLinkResolution](options/comments.md#useTsLinkResolution)
-   [preserveLinkText](options/comments.md#preserveLinkText)
-   [jsDocCompatibility](options/comments.md#jsDocCompatibility)
-   [suppressCommentWarningsInDeclarationFiles](options/comments.md#suppressCommentWarningsInDeclarationFiles)
-   [blockTags](options/comments.md#blockTags)
-   [inlineTags](options/comments.md#inlineTags)
-   [modifierTags](options/comments.md#modifierTags)
-   [cascadedModifierTags](options/comments.md#cascadedModifierTags)
-   [excludeTags](options/comments.md#excludeTags)
-   [externalSymbolLinkMappings](options/comments.md#externalSymbolLinkMappings)

## Organization Options

Controls how TypeDoc organizes content within a converted project.

-   [categorizeByGroup](options/organization.md#categorizeByGroup)
-   [defaultCategory](options/organization.md#defaultCategory)
-   [categoryOrder](options/organization.md#categoryOrder)
-   [groupOrder](options/organization.md#groupOrder)
-   [sort](options/organization.md#sort)
-   [sortEntryPoints](options/organization.md#sortEntryPoints)
-   [kindSortOrder](options/organization.md#kindSortOrder)

## Validation Options

Configures the validation performed by TypeDoc on a converted project.

-   [validation](options/validation.md#validation)
-   [treatWarningsAsErrors](options/validation.md#treatWarningsAsErrors)
-   [treatValidationWarningsAsErrors](options/validation.md#treatValidationWarningsAsErrors)
-   [intentionallyNotExported](options/validation.md#intentionallyNotExported)
-   [requiredToBeDocumented](options/validation.md#requiredToBeDocumented)

## Other Options

-   [watch](options/other.md#watch)
-   [preserveWatchOutput](options/other.md#preserveWatchOutput)
-   [help](options/other.md#help)
-   [version](options/other.md#version)
-   [showConfig](options/other.md#showConfig)
-   [logLevel](options/other.md#logLevel)
-   [skipErrorChecking](options/other.md#skipErrorChecking)
