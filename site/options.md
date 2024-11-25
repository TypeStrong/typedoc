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
-   [compilerOptions](options/configuration.md#compileroptions)
-   [plugin](options/configuration.md#plugin)

## Input Options

Options which control how input is converted into a project that can be rendered
to HTML or JSON.

-   [entryPoints](options/input.md#entrypoints)
-   [entryPointStrategy](options/input.md#entrypointstrategy)
-   [packageOptions](options/input.md#packageoptions)
-   [alwaysCreateEntryPointModule](options/input.md#alwayscreateentrypointmodule)
-   [projectDocuments](options/input.md#projectdocuments)
-   [exclude](options/input.md#exclude)
-   [externalPattern](options/input.md#externalpattern)
-   [excludeExternals](options/input.md#excludeexternals)
-   [excludeNotDocumented](options/input.md#excludenotdocumented)
-   [excludeNotDocumentedKinds](options/input.md#excludenotdocumentedkinds)
-   [excludeInternal](options/input.md#excludeinternal)
-   [excludePrivate](options/input.md#excludeprivate)
-   [excludeProtected](options/input.md#excludeprotected)
-   [excludeReferences](options/input.md#excludereferences)
-   [excludeCategories](options/input.md#excludecategories)
-   [maxTypeConversionDepth](options/input.md#maxtypeconversiondepth)
-   [name](options/input.md#name)
-   [includeVersion](options/input.md#includeversion)
-   [disableSources](options/input.md#disablesources)
-   [sourceLinkTemplate](options/input.md#sourcelinktemplate)
-   [gitRevision](options/input.md#gitrevision)
-   [gitRemote](options/input.md#gitremote)
-   [disableGit](options/input.md#disablegit)
-   [readme](options/input.md#readme)
-   [includeHierarchySummary](options/input.md#includehierarchysummary)

## Output Options

Options which control TypeDoc's HTML output.

-   [outputs](options/output.md#outputs)
-   [out](options/output.md#out)
-   [html](options/output.md#html)
-   [json](options/output.md#json)
-   [pretty](options/output.md#pretty)
-   [emit](options/output.md#emit)
-   [theme](options/output.md#theme)
-   [lightHighlightTheme](options/output.md#lighthighlighttheme)
-   [darkHighlightTheme](options/output.md#darkhighlighttheme)
-   [highlightLanguages](options/output.md#highlightlanguages)
-   [typePrintWidth](options/output.md#typeprintwidth)
-   [customCss](options/output.md#customcss)
-   [customJs](options/output.md#customjs)
-   [customFooterHtml](options/output.md#customfooterhtml)
-   [customFooterHtmlDisableWrapper](options/output.md#customfooterhtmldisablewrapper)
-   [markdownItOptions](options/output.md#markdownitoptions)
-   [markdownItLoader](options/output.md#markdownitloader)
-   [basePath](options/output.md#basepath)
-   [cname](options/output.md#cname)
-   [favicon](options/output.md#favicon)
-   [sourceLinkExternal](options/output.md#sourcelinkexternal)
-   [markdownLinkExternal](options/output.md#markdownlinkexternal)
-   [lang](options/output.md#lang)
-   [locales](options/output.md#locales)
-   [githubPages](options/output.md#githubpages)
-   [cacheBust](options/output.md#cachebust)
-   [hideParameterTypesInTitle](options/output.md#hideparametertypesintitle)
-   [hideGenerator](options/output.md#hidegenerator)
-   [searchInComments](options/output.md#searchincomments)
-   [searchInDocuments](options/output.md#searchindocuments)
-   [cleanOutputDir](options/output.md#cleanoutputdir)
-   [titleLink](options/output.md#titlelink)
-   [navigationLinks](options/output.md#navigationlinks)
-   [sidebarLinks](options/output.md#sidebarlinks)
-   [navigation](options/output.md#navigation)
-   [headings](options/output.md#headings)
-   [sluggerConfiguration](options/output.md#sluggerconfiguration)
-   [navigationLeaves](options/output.md#navigationleaves)
-   [visibilityFilters](options/output.md#visibilityfilters)
-   [searchCategoryBoosts](options/output.md#searchcategoryboosts)
-   [searchGroupBoosts](options/output.md#searchgroupboosts)
-   [hostedBaseUrl](options/output.md#hostedbaseurl)
-   [useHostedBaseUrlForAbsoluteLinks](options/output.md#usehostedbaseurlforabsolutelinks)
-   [useFirstParagraphOfCommentAsSummary](options/output.md#usefirstparagraphofcommentassummary)

## Comment Options

Options which control how TypeDoc parses comments.

-   [commentStyle](options/comments.md#commentstyle)
-   [useTsLinkResolution](options/comments.md#usetslinkresolution)
-   [preserveLinkText](options/comments.md#preservelinktext)
-   [jsDocCompatibility](options/comments.md#jsdoccompatibility)
-   [suppressCommentWarningsInDeclarationFiles](options/comments.md#suppresscommentwarningsindeclarationfiles)
-   [blockTags](options/comments.md#blocktags)
-   [inlineTags](options/comments.md#inlinetags)
-   [modifierTags](options/comments.md#modifiertags)
-   [cascadedModifierTags](options/comments.md#cascadedmodifiertags)
-   [excludeTags](options/comments.md#excludetags)
-   [notRenderedTags](options/comments.md#notrenderedtags)
-   [externalSymbolLinkMappings](options/comments.md#externalsymbollinkmappings)

## Organization Options

Controls how TypeDoc organizes content within a converted project.

-   [groupReferencesByType](options/organization.md#groupreferencesbytype)
-   [categorizeByGroup](options/organization.md#categorizebygroup)
-   [defaultCategory](options/organization.md#defaultcategory)
-   [categoryOrder](options/organization.md#categoryorder)
-   [groupOrder](options/organization.md#grouporder)
-   [sort](options/organization.md#sort)
-   [sortEntryPoints](options/organization.md#sortentrypoints)
-   [kindSortOrder](options/organization.md#kindsortorder)

## Validation Options

Configures the validation performed by TypeDoc on a converted project.

-   [validation](options/validation.md#validation)
-   [treatWarningsAsErrors](options/validation.md#treatwarningsaserrors)
-   [treatValidationWarningsAsErrors](options/validation.md#treatvalidationwarningsaserrors)
-   [intentionallyNotExported](options/validation.md#intentionallynotexported)
-   [requiredToBeDocumented](options/validation.md#requiredtobedocumented)

## Other Options

-   [watch](options/other.md#watch)
-   [preserveWatchOutput](options/other.md#preservewatchoutput)
-   [help](options/other.md#help)
-   [version](options/other.md#version)
-   [showConfig](options/other.md#showconfig)
-   [logLevel](options/other.md#loglevel)
-   [skipErrorChecking](options/other.md#skiperrorchecking)
