// This one is the source of truth, so looks a bit different from the other locales, look at another one
// for a template to follow.

export = {
    loaded_multiple_times_0:
        "TypeDoc has been loaded multiple times. This is commonly caused by plugins which have their own installation of TypeDoc. The loaded paths are:\n\t{0}",
    unsupported_ts_version_0:
        "You are running with an unsupported TypeScript version! If TypeDoc crashes, this is why. TypeDoc supports {0}",
    no_compiler_options_set:
        "No compiler options set. This likely means that TypeDoc did not find your tsconfig.json. Generated documentation will probably be empty",

    loaded_plugin_0: `Loaded plugin {0}`,

    solution_not_supported_in_watch_mode:
        "The provided tsconfig file looks like a solution style tsconfig, which is not supported in watch mode",
    strategy_not_supported_in_watch_mode:
        "entryPointStrategy must be set to either resolve or expand for watch mode",
    found_0_errors_and_1_warnings: "Found {0} errors and {1} warnings",

    output_0_could_not_be_generated:
        "{0} output could not be generated due to the errors above",
    output_0_generated_at_1: "{0} generated at {1}",

    no_entry_points_for_packages:
        "No entry points provided to packages mode, documentation cannot be generated",
    failed_to_find_packages:
        "Failed to find any packages, ensure you have provided at least one directory as an entry point containing package.json",
    nested_packages_unsupported_0:
        "Project at {0} has entryPointStrategy set to packages, but nested packages are not supported",
    previous_error_occurred_when_reading_options_for_0:
        "The previous error occurred when reading options for the package at {0}",
    converting_project_at_0: "Converting project at {0}",
    failed_to_convert_packages:
        "Failed to convert one or more packages, result will not be merged together",
    merging_converted_projects: "Merging converted projects",

    no_entry_points_to_merge: "No entry points provided to merge",
    entrypoint_did_not_match_files_0:
        "The entrypoint glob {0} did not match any files",
    failed_to_parse_json_0: `Failed to parse file at {0} as json`,

    failed_to_read_0_when_processing_document_tag_in_1: `Failed to read file {0} when processing @document tag for comment in {1}`,
    failed_to_read_0_when_processing_project_document: `Failed to read file {0} when adding project document`,
    failed_to_read_0_when_processing_document_child_in_1: `Failed to read file {0} when processing document children in {1}`,
    frontmatter_children_0_should_be_an_array_of_strings_or_object_with_string_values:
        "Frontmatter children in {0} should be an array of strings or an object with string values",
    converting_union_as_interface: `Using @interface on a union type will discard properties not present on all branches of the union. TypeDoc's output may not accurately describe your source code`,
    converting_0_as_class_requires_value_declaration: `Converting {0} as a class requires a declaration which represents a non-type value`,
    converting_0_as_class_without_construct_signatures: `{0} is being converted as a class, but does not have any construct signatures`,

    comment_for_0_should_not_contain_block_or_modifier_tags: `The comment for {0} should not contain any block or modifier tags`,

    symbol_0_has_multiple_declarations_with_comment: `{0} has multiple declarations with a comment. An arbitrary comment will be used`,
    comments_for_0_are_declared_at_1: `The comments for {0} are declared at:\n\t{1}`,

    // comments/parser.ts
    multiple_type_parameters_on_template_tag_unsupported: `TypeDoc does not support multiple type parameters defined in a single @template tag with a comment`,
    failed_to_find_jsdoc_tag_for_name_0: `Failed to find JSDoc tag for {0} after parsing comment, please file a bug report`,
    relative_path_0_is_not_a_file_and_will_not_be_copied_to_output: `The relative path {0} is not a file and will not be copied to the output directory`,

    inline_inheritdoc_should_not_appear_in_block_tag_in_comment_at_0:
        "An inline @inheritDoc tag should not appear within a block tag as it will not be processed in comment at {0}",
    at_most_one_remarks_tag_expected_in_comment_at_0:
        "At most one @remarks tag is expected in a comment, ignoring all but the first in comment at {0}",
    at_most_one_returns_tag_expected_in_comment_at_0:
        "At most one @returns tag is expected in a comment, ignoring all but the first in comment at {0}",
    at_most_one_inheritdoc_tag_expected_in_comment_at_0:
        "At most one @inheritDoc tag is expected in a comment, ignoring all but the first in comment at {0}",
    content_in_summary_overwritten_by_inheritdoc_in_comment_at_0:
        "Content in the summary section will be overwritten by the @inheritDoc tag in comment at {0}",
    content_in_remarks_block_overwritten_by_inheritdoc_in_comment_at_0:
        "Content in the @remarks block will be overwritten by the @inheritDoc tag in comment at {0}",
    example_tag_literal_name:
        "The first line of an example tag will be taken literally as the example name, and should only contain text",
    inheritdoc_tag_properly_capitalized:
        "The @inheritDoc tag should be properly capitalized",
    treating_unrecognized_tag_0_as_modifier: `Treating unrecognized tag {0} as a modifier tag`,
    unmatched_closing_brace: `Unmatched closing brace`,
    unescaped_open_brace_without_inline_tag: `Encountered an unescaped open brace without an inline tag`,
    unknown_block_tag_0: `Encountered an unknown block tag {0}`,
    unknown_inline_tag_0: `Encountered an unknown inline tag {0}`,
    open_brace_within_inline_tag: `Encountered an open brace within an inline tag, this is likely a mistake`,
    inline_tag_not_closed: `Inline tag is not closed`,

    // validation
    failed_to_resolve_link_to_0_in_comment_for_1: `Failed to resolve link to "{0}" in comment for {1}`,
    failed_to_resolve_link_to_0_in_comment_for_1_may_have_meant_2: `Failed to resolve link to "{0}" in comment for {1}. You may have wanted "{2}"`,
    failed_to_resolve_link_to_0_in_readme_for_1: `Failed to resolve link to "{0}" in readme for {1}`,
    failed_to_resolve_link_to_0_in_readme_for_1_may_have_meant_2: `Failed to resolve link to "{0}" in readme for {1}. You may have wanted "{2}"`,
    failed_to_resolve_link_to_0_in_document_1: `Failed to resolve link to "{0}" in document {1}`,
    failed_to_resolve_link_to_0_in_document_1_may_have_meant_2: `Failed to resolve link to "{0}" in document {1}. You may have wanted "{2}"`,
    type_0_defined_in_1_is_referenced_by_2_but_not_included_in_docs: `{0}, defined in {1}, is referenced by {2} but not included in the documentation`,
    reflection_0_kind_1_defined_in_2_does_not_have_any_documentation: `{0} ({1}), defined in {2}, does not have any documentation`,
    invalid_intentionally_not_exported_symbols_0:
        "The following symbols were marked as intentionally not exported, but were either not referenced in the documentation, or were exported:\n\t{0}",
    reflection_0_has_unused_mergeModuleWith_tag:
        "{0} has a @mergeModuleWith tag which could not be resolved",
    reflection_0_links_to_1_with_text_2_but_resolved_to_3: `"{0}" links to "{1}" with text "{2}" which exists but does not have a link in the documentation, will link to "{3}" instead.`,

    // conversion plugins
    not_all_search_category_boosts_used_0: `Not all categories specified in searchCategoryBoosts were used in the documentation. The unused categories were:\n\t{0}`,
    not_all_search_group_boosts_used_0: `Not all groups specified in searchGroupBoosts were used in the documentation. The unused groups were:\n\t{0}`,
    comment_for_0_includes_categoryDescription_for_1_but_no_child_in_group: `Comment for {0} includes @categoryDescription for "{1}", but no child is placed in that category`,
    comment_for_0_includes_groupDescription_for_1_but_no_child_in_group: `Comment for {0} includes @groupDescription for "{1}", but no child is placed in that group`,
    label_0_for_1_cannot_be_referenced: `The label "{0}" for {1} cannot be referenced with a declaration reference. Labels may only contain A-Z, 0-9, and _, and may not start with a number`,
    modifier_tag_0_is_mutually_exclusive_with_1_in_comment_for_2: `The modifier tag {0} is mutually exclusive with {1} in the comment for {2}`,
    signature_0_has_unused_param_with_name_1: `The signature {0} has an @param with name "{1}", which was not used`,
    declaration_reference_in_inheritdoc_for_0_not_fully_parsed: `Declaration reference in @inheritDoc for {0} was not fully parsed and may resolve incorrectly`,
    failed_to_find_0_to_inherit_comment_from_in_1: `Failed to find "{0}" to inherit the comment from in the comment for {1}`,
    reflection_0_tried_to_copy_comment_from_1_but_source_had_no_comment: `{0} tried to copy a comment from {1} with @inheritDoc, but the source has no associated comment`,
    inheritdoc_circular_inheritance_chain_0: `@inheritDoc specifies a circular inheritance chain: {0}`,
    provided_readme_at_0_could_not_be_read: `Provided README path, {0} could not be read`,
    defaulting_project_name:
        'The --name option was not specified, and no package.json was found. Defaulting project name to "Documentation"',
    disable_git_set_but_not_source_link_template: `disableGit is set, but sourceLinkTemplate is not, so source links cannot be produced. Set a sourceLinkTemplate or disableSources to prevent source tracking`,
    disable_git_set_and_git_revision_used: `disableGit is set and sourceLinkTemplate contains {gitRevision}, which will be replaced with an empty string as no revision was provided`,
    git_remote_0_not_valid: `The provided git remote "{0}" was not valid. Source links will be broken`,
    reflection_0_tried_to_merge_into_child_1: `The reflection {0} tried to use @mergeModuleWith to merge into one of its children: {1}`,

    include_0_in_1_specified_2_resolved_to_3_does_not_exist: `{0} tag in comment for {1} specified "{2}" to include, which was resolved to "{3}" and does not exist or is not a file.`,
    include_0_in_1_specified_2_circular_include_3: `{0} tag in comment for {1} specified "{2}" to include, which resulted in a circular include:\n\t{3}`,
    includeCode_tag_in_0_specified_1_file_2_region_3_region_not_found: `@includeCode tag in {0} specified "{1}" to include from file "{2}" the region labeled "{3}", but the region was not found in the file.`,
    includeCode_tag_in_0_specified_1_file_2_region_3_region_close_not_found: `@includeCode tag in {0} specified "{1}" to include from file "{2}" the region labeled "{3}", but the region closing comment was not found in the file.`,
    includeCode_tag_in_0_specified_1_file_2_region_3_region_open_not_found: `@includeCode tag in {0} specified "{1}" to include from file "{2}" the region labeled "{3}", but the region opening comment was not found in the file.`,
    includeCode_tag_in_0_specified_1_file_2_region_3_region_close_found_multiple_times: `@includeCode tag in {0} specified "{1}" to include from file "{2}" the region labeled {3}, but the region closing comment was found multiple times in the file.`,
    includeCode_tag_in_0_specified_1_file_2_region_3_region_open_found_multiple_times: `@includeCode tag in {0} specified "{1}" to include from file "{2}" the region labeled {3}, but the region opening comment was found multiple times in the file.`,
    includeCode_tag_in_0_specified_1_file_2_region_3_region_found_multiple_times: `@includeCode tag in {0} specified "{1}" to include from file "{2}" the region labeled {3}, but the region was found multiple times in the file.`,
    includeCode_tag_in_0_specified_1_file_2_lines_3_invalid_range: `@includeCode tag in {0} specified "{1}" to include from file "{2}" the lines {3}, but an invalid range was specified.`,
    includeCode_tag_in_0_specified_1_file_2_lines_3_but_only_4_lines: `@includeCode tag in {0} specified "{1}" to include from file "{2}" the lines {3}, but the file only has {4} lines.`,

    // output plugins
    custom_css_file_0_does_not_exist: `Custom CSS file at {0} does not exist`,
    custom_js_file_0_does_not_exist: `Custom JavaScript file at {0} does not exist`,
    unsupported_highlight_language_0_not_highlighted_in_comment_for_1: `Unsupported highlight language {0} will not be highlighted in comment for {1}`,
    unloaded_language_0_not_highlighted_in_comment_for_1: `Code block with language {0} will not be highlighted in comment for {1} as it was not included in the highlightLanguages option`,
    yaml_frontmatter_not_an_object: `Expected YAML frontmatter to be an object`,

    // renderer
    could_not_write_0: `Could not write {0}`,
    could_not_empty_output_directory_0: `Could not empty the output directory {0}`,
    could_not_create_output_directory_0: `Could not create the output directory {0}`,
    theme_0_is_not_defined_available_are_1: `The theme '{0}' is not defined. The available themes are: {1}`,
    reflection_0_links_to_1_but_anchor_does_not_exist_try_2: `{0} links to {1}, but the anchor does not exist. You may have meant:\n\t{2}`,

    // entry points
    no_entry_points_provided:
        "No entry points were provided or discovered from package.json exports, this is likely a misconfiguration",
    unable_to_find_any_entry_points:
        "Unable to find any entry points. See previous warnings",
    watch_does_not_support_packages_mode:
        "Watch mode does not support 'packages' style entry points",
    watch_does_not_support_merge_mode:
        "Watch mode does not support 'merge' style entry points",
    entry_point_0_not_in_program: `The entry point {0} is not referenced by the 'files' or 'include' option in your tsconfig`,
    failed_to_resolve_0_to_ts_path: `Failed to resolve entry point path {0} from package.json to a TypeScript source file`,
    use_expand_or_glob_for_files_in_dir: `If you wanted to include files inside this directory, set --entryPointStrategy to expand or specify a glob`,
    glob_0_did_not_match_any_files: `The glob {0} did not match any files`,
    entry_point_0_did_not_match_any_files_after_exclude: `The glob {0} did not match any files after applying exclude patterns`,
    entry_point_0_did_not_exist: `Provided entry point {0} does not exist`,
    entry_point_0_did_not_match_any_packages: `The entry point glob {0} did not match any directories containing package.json`,
    file_0_not_an_object: `The file {0} is not an object`,

    // deserialization
    serialized_project_referenced_0_not_part_of_project: `Serialized project referenced reflection {0}, which was not a part of the project`,
    saved_relative_path_0_resolved_from_1_is_not_a_file: `Serialized project referenced {0}, which does not exist relative to {1}`,

    // options
    circular_reference_extends_0: `Circular reference encountered for "extends" field of {0}`,
    failed_resolve_0_to_file_in_1: `Failed to resolve {0} to a file in {1}`,

    option_0_can_only_be_specified_by_config_file: `The '{0}' option can only be specified via a config file`,
    option_0_expected_a_value_but_none_provided: `--{0} expected a value, but none was given as an argument`,
    unknown_option_0_may_have_meant_1: `Unknown option: {0}, you may have meant:\n\t{1}`,

    typedoc_key_in_0_ignored: `The 'typedoc' key in {0} was used by the legacy-packages entryPointStrategy and will be ignored`,
    typedoc_options_must_be_object_in_0: `Failed to parse the "typedocOptions" field in {0}, ensure it exists and contains an object`,
    tsconfig_file_0_does_not_exist: `The tsconfig file {0} does not exist`,
    tsconfig_file_specifies_options_file: `"typedocOptions" in tsconfig file specifies an option file to read but the option file has already been read. This is likely a misconfiguration`,
    tsconfig_file_specifies_tsconfig_file: `"typedocOptions" in tsconfig file may not specify a tsconfig file to read`,
    tags_0_defined_in_typedoc_json_overwritten_by_tsdoc_json: `The {0} defined in typedoc.json will be overwritten by configuration in tsdoc.json`,
    failed_read_tsdoc_json_0: `Failed to read tsdoc.json file at {0}`,
    invalid_tsdoc_json_0: `The file {0} is not a valid tsdoc.json file`,

    options_file_0_does_not_exist: `The options file {0} does not exist`,
    failed_read_options_file_0: `Failed to parse {0}, ensure it exists and exports an object`,

    // plugins
    invalid_plugin_0_missing_load_function: `Invalid structure in plugin {0}, no load function found`,
    plugin_0_could_not_be_loaded: `The plugin {0} could not be loaded`,

    // option declarations help
    help_options:
        "Specify a json option file that should be loaded. If not specified TypeDoc will look for 'typedoc.json' in the current directory",
    help_tsconfig:
        "Specify a TypeScript config file that should be loaded. If not specified TypeDoc will look for 'tsconfig.json' in the current directory",
    help_compilerOptions:
        "Selectively override the TypeScript compiler options used by TypeDoc",
    help_lang:
        "Sets the language to be used in generation and in TypeDoc's messages",
    help_locales:
        "Add translations for a specified locale. This option is primarily intended to be used as a stopgap while waiting for official locale support to be added to TypeDoc",
    help_packageOptions:
        "Set options which will be set within each package when entryPointStrategy is set to packages",

    help_entryPoints: "The entry points of your documentation",
    help_entryPointStrategy:
        "The strategy to be used to convert entry points into documentation modules",
    help_alwaysCreateEntryPointModule:
        "When set, TypeDoc will always create a `Module` for entry points, even if only one is provided",
    help_projectDocuments:
        "Documents which should be added as children to the root of the generated documentation. Supports globs to match multiple files",
    help_exclude:
        "Define patterns to be excluded when expanding a directory that was specified as an entry point",
    help_externalPattern:
        "Define patterns for files that should be considered being external",
    help_excludeExternals:
        "Prevent externally resolved symbols from being documented",
    help_excludeNotDocumented:
        "Prevent symbols that are not explicitly documented from appearing in the results",
    help_excludeNotDocumentedKinds:
        "Specify the type of reflections that can be removed by excludeNotDocumented",
    help_excludeInternal:
        "Prevent symbols that are marked with @internal from being documented",
    help_excludeCategories:
        "Exclude symbols within this category from the documentation",
    help_excludePrivate:
        "Ignore private variables and methods, defaults to true.",
    help_excludeProtected: "Ignore protected variables and methods",
    help_excludeReferences:
        "If a symbol is exported multiple times, ignore all but the first export",
    help_externalSymbolLinkMappings:
        "Define custom links for symbols not included in the documentation",
    help_out:
        "Specify the location the documentation for the default output should be written to. The default output type may be changed by plugins.",
    help_html:
        "Specify the location where html documentation should be written to.",
    help_json:
        "Specify the location and filename a JSON file describing the project is written to",
    help_pretty:
        "Specify whether the output JSON should be formatted with tabs",
    help_emit: "Specify what TypeDoc should emit, 'docs', 'both', or 'none'",
    help_theme: "Specify the theme name to render the documentation with",
    help_lightHighlightTheme:
        "Specify the code highlighting theme in light mode",
    help_darkHighlightTheme: "Specify the code highlighting theme in dark mode",
    help_highlightLanguages:
        "Specify the languages which will be loaded to highlight code when rendering",
    help_ignoredHighlightLanguages:
        "Specify languages which will be accepted as valid highlight languages, but will not be highlighted at runtime",
    help_typePrintWidth:
        "Width at which to wrap code to a new line when rendering a type",
    help_customCss: "Path to a custom CSS file to for the theme to import",
    help_customJs: "Path to a custom JS file to import",
    help_markdownItOptions:
        "Specify the options passed to markdown-it, the Markdown parser used by TypeDoc",
    help_markdownItLoader:
        "Specify a callback to be called when loading the markdown-it instance. Will be passed the instance of the parser which TypeDoc will use",
    help_maxTypeConversionDepth:
        "Set the maximum depth of types to be converted",
    help_name:
        "Set the name of the project that will be used in the header of the template",
    help_includeVersion: "Add the package version to the project name",
    help_disableSources:
        "Disable setting the source of a reflection when documenting it",
    help_sourceLinkTemplate:
        "Specify a link template to be used when generating source urls. If not set, will be automatically created using the git remote. Supports {path}, {line}, {gitRevision} placeholders",
    help_gitRevision:
        "Use specified revision instead of the last revision for linking to GitHub/Bitbucket source files. Has no effect if disableSources is set",
    help_gitRemote:
        "Use the specified remote for linking to GitHub/Bitbucket source files. Has no effect if disableGit or disableSources is set",
    help_disableGit:
        "Assume that all can be linked to with the sourceLinkTemplate, sourceLinkTemplate must be set if this is enabled. {path} will be rooted at basePath",
    help_basePath:
        "Specifies the base path to be used when displaying file paths",
    help_excludeTags: "Remove the listed block/modifier tags from doc comments",
    help_notRenderedTags:
        "Tags which will be preserved in doc comments, but not rendered when creating output",
    help_readme:
        "Path to the readme file that should be displayed on the index page. Pass `none` to disable the index page and start the documentation on the globals page",
    help_cname:
        "Set the CNAME file text, it's useful for custom domains on GitHub Pages",
    help_favicon: "Path to favicon to include as the site icon",
    help_sourceLinkExternal:
        "Specifies that source links should be treated as external links to be opened in a new tab",
    help_markdownLinkExternal:
        "Specifies that http[s]:// links in comments and markdown files should be treated as external links to be opened in a new tab",
    help_githubPages:
        "Generate a .nojekyll file to prevent 404 errors in GitHub Pages. Defaults to `true`",
    help_hostedBaseUrl:
        "Specify a base URL to be used in generating a sitemap.xml in our output folder and canonical links. If not specified, no sitemap will be generated",
    help_useHostedBaseUrlForAbsoluteLinks:
        "If set, TypeDoc will produce absolute links to pages on your site using the hostedBaseUrl option",
    help_hideGenerator: "Do not print the TypeDoc link at the end of the page",
    help_customFooterHtml: "Custom footer after the TypeDoc link",
    help_customFooterHtmlDisableWrapper:
        "If set, disables the wrapper element for customFooterHtml",
    help_cacheBust: "Include the generation time in links to static assets",
    help_searchInComments:
        "If set, the search index will also include comments. This will greatly increase the size of the search index",
    help_searchInDocuments:
        "If set, the search index will also include documents. This will greatly increase the size of the search index",
    help_cleanOutputDir:
        "If set, TypeDoc will remove the output directory before writing output",
    help_titleLink:
        "Set the link the title in the header points to. Defaults to the documentation homepage",
    help_navigationLinks: "Defines links to be included in the header",
    help_sidebarLinks: "Defines links to be included in the sidebar",
    help_navigationLeaves:
        "Branches of the navigation tree which should not be expanded",
    help_headings: "Determines which optional headings are rendered",
    help_sluggerConfiguration:
        "Determines how anchors within rendered HTML are determined.",
    help_navigation: "Determines how the navigation sidebar is organized",
    help_includeHierarchySummary:
        "If set, a reflections hierarchy summary will be rendered to a summary page. Defaults to `true`",
    help_visibilityFilters:
        "Specify the default visibility for builtin filters and additional filters according to modifier tags",
    help_searchCategoryBoosts:
        "Configure search to give a relevance boost to selected categories",
    help_searchGroupBoosts:
        'Configure search to give a relevance boost to selected kinds (eg "class")',
    help_useFirstParagraphOfCommentAsSummary:
        "If set and no @summary tag is specified, TypeDoc will use the first paragraph of comments as the short summary in the module/namespace view",
    help_jsDocCompatibility:
        "Sets compatibility options for comment parsing that increase similarity with JSDoc comments",
    help_commentStyle: "Determines how TypeDoc searches for comments",
    help_useTsLinkResolution:
        "Use TypeScript's link resolution when determining where @link tags point. This only applies to JSDoc style comments",
    help_preserveLinkText:
        "If set, @link tags without link text will use the text content as the link. If not set, will use the target reflection name",
    help_blockTags:
        "Block tags which TypeDoc should recognize when parsing comments",
    help_inlineTags:
        "Inline tags which TypeDoc should recognize when parsing comments",
    help_modifierTags:
        "Modifier tags which TypeDoc should recognize when parsing comments",
    help_categorizeByGroup:
        "Specify whether categorization will be done at the group level",
    help_groupReferencesByType:
        "If set, references will be grouped with the type they refer to rather than in a 'References' group",
    help_defaultCategory:
        "Specify the default category for reflections without a category",
    help_categoryOrder:
        "Specify the order in which categories appear. * indicates the relative order for categories not in the list",
    help_groupOrder:
        "Specify the order in which groups appear. * indicates the relative order for groups not in the list",
    help_sort: "Specify the sort strategy for documented values",
    help_sortEntryPoints:
        "If set, entry points will be subject to the same sorting rules as other reflections",
    help_kindSortOrder:
        "Specify the sort order for reflections when 'kind' is specified",
    help_watch: "Watch files for changes and rebuild docs on change",
    help_preserveWatchOutput:
        "If set, TypeDoc will not clear the screen between compilation runs",
    help_skipErrorChecking:
        "Do not run TypeScript's type checking before generating docs",
    help_help: "Print this message",
    help_version: "Print TypeDoc's version",
    help_showConfig: "Print the resolved configuration and exit",
    help_plugin:
        "Specify the npm plugins that should be loaded. Omit to load all installed plugins",
    help_logLevel: "Specify what level of logging should be used",
    help_treatWarningsAsErrors:
        "If set, all warnings will be treated as errors",
    help_treatValidationWarningsAsErrors:
        "If set, warnings emitted during validation will be treated as errors. This option cannot be used to disable treatWarningsAsErrors for validation warnings",
    help_intentionallyNotExported:
        "A list of types which should not produce 'referenced but not documented' warnings",
    help_requiredToBeDocumented:
        "A list of reflection kinds that must be documented",
    help_validation:
        "Specify which validation steps TypeDoc should perform on your generated documentation",

    // ==================================================================
    // Option validation
    // ==================================================================
    unknown_option_0_you_may_have_meant_1: `Unknown option '{0}' You may have meant:\n\t{1}`,
    option_0_must_be_between_1_and_2: "{0} must be between {1} and {2}",
    option_0_must_be_equal_to_or_greater_than_1:
        "{0} must be equal to or greater than {1}",
    option_0_must_be_less_than_or_equal_to_1:
        "{0} must be less than or equal to {1}",
    option_0_must_be_one_of_1: "{0} must be one of {1}",
    flag_0_is_not_valid_for_1_expected_2:
        "The flag '{0}' is not valid for {1}, expected one of {2}",
    expected_object_with_flag_values_for_0:
        "Expected an object with flag values for {0} or true/false",
    flag_values_for_0_must_be_booleans: "Flag values for {0} must be a boolean",
    locales_must_be_an_object:
        "The 'locales' option must be set to an object which resembles: { en: { theme_implements: \"Implements\" }}",
    exclude_not_documented_specified_0_valid_values_are_1: `excludeNotDocumentedKinds may only specify known values, and invalid values were provided ({0}). The valid kinds are:\n{1}`,
    external_symbol_link_mappings_must_be_object:
        "externalSymbolLinkMappings must be a Record<package name, Record<symbol name, link>>",
    highlight_theme_0_must_be_one_of_1: "{0} must be one of the following: {1}",
    highlightLanguages_contains_invalid_languages_0:
        "highlightLanguages contains invalid languages: {0}, run typedoc --help for a list of supported languages",
    hostedBaseUrl_must_start_with_http:
        "hostedBaseUrl must start with http:// or https://",
    useHostedBaseUrlForAbsoluteLinks_requires_hostedBaseUrl:
        "The useHostedBaseUrlForAbsoluteLinks option requires that hostedBaseUrl be set",
    favicon_must_have_one_of_the_following_extensions_0:
        "Favicon must have on of the following extensions: {0}",
    option_0_must_be_an_object: "The '{0}' option must be a non-array object",
    option_0_must_be_a_function: "The '{0}' option must be a function",
    option_0_must_be_object_with_urls: `{0} must be an object with string labels as keys and URL values`,
    visibility_filters_only_include_0: `visibilityFilters can only include the following non-@ keys: {0}`,
    visibility_filters_must_be_booleans: `All values of visibilityFilters must be booleans`,
    option_0_values_must_be_numbers: "All values of {0} must be numbers",
    option_0_values_must_be_array_of_tags:
        "{0} must be an array of valid tag names",
    option_0_specified_1_but_only_2_is_valid: `{0} may only specify known values, and invalid values were provided ({1}). The valid sort strategies are:\n{2}`,
    option_outputs_must_be_array: `"outputs" option must be an array of { name: string, path: string, options?: TypeDocOptions } values.`,
    specified_output_0_has_not_been_defined: `Specified output "{0}" has not been defined.`,

    // https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts
    alert_note: "Note",
    alert_tip: "Tip",
    alert_important: "Important",
    alert_warning: "Warning",
    alert_caution: "Caution",

    // ReflectionKind singular translations
    kind_project: "Project",
    kind_module: "Module",
    kind_namespace: "Namespace",
    kind_enum: "Enumeration",
    kind_enum_member: "Enumeration Member",
    kind_variable: "Variable",
    kind_function: "Function",
    kind_class: "Class",
    kind_interface: "Interface",
    kind_constructor: "Constructor",
    kind_property: "Property",
    kind_method: "Method",
    kind_call_signature: "Call Signature",
    kind_index_signature: "Index Signature",
    kind_constructor_signature: "Constructor Signature",
    kind_parameter: "Parameter",
    kind_type_literal: "Type Literal",
    kind_type_parameter: "Type Parameter",
    kind_accessor: "Accessor",
    kind_get_signature: "Get Signature",
    kind_set_signature: "Set Signature",
    kind_type_alias: "Type Alias",
    kind_reference: "Reference",
    kind_document: "Document",

    // ReflectionKind plural translations
    kind_plural_project: "Projects",
    kind_plural_module: "Modules",
    kind_plural_namespace: "Namespaces",
    kind_plural_enum: "Enumerations",
    kind_plural_enum_member: "Enumeration Members",
    kind_plural_variable: "Variables",
    kind_plural_function: "Functions",
    kind_plural_class: "Classes",
    kind_plural_interface: "Interfaces",
    kind_plural_constructor: "Constructors",
    kind_plural_property: "Properties",
    kind_plural_method: "Methods",
    kind_plural_call_signature: "Call Signatures",
    kind_plural_index_signature: "Index Signatures",
    kind_plural_constructor_signature: "Constructor Signatures",
    kind_plural_parameter: "Parameters",
    kind_plural_type_literal: "Type Literals",
    kind_plural_type_parameter: "Type Parameters",
    kind_plural_accessor: "Accessors",
    kind_plural_get_signature: "Get Signatures",
    kind_plural_set_signature: "Set Signatures",
    kind_plural_type_alias: "Type Aliases",
    kind_plural_reference: "References",
    kind_plural_document: "Documents",

    // ReflectionFlag translations
    flag_private: "Private",
    flag_protected: "Protected",
    flag_public: "Public",
    flag_static: "Static",
    flag_external: "External",
    flag_optional: "Optional",
    flag_rest: "Rest",
    flag_abstract: "Abstract",
    flag_const: "Const",
    flag_readonly: "Readonly",
    flag_inherited: "Inherited",

    // ==================================================================
    // Strings that show up in the default theme
    // ==================================================================
    // Page headings/labels
    theme_implements: "Implements",
    theme_indexable: "Indexable",
    theme_type_declaration: "Type declaration",
    theme_index: "Index",
    theme_hierarchy: "Hierarchy",
    theme_hierarchy_summary: "Hierarchy Summary",
    theme_hierarchy_view_summary: "View Summary",
    theme_implemented_by: "Implemented by",
    theme_defined_in: "Defined in",
    theme_implementation_of: "Implementation of",
    theme_inherited_from: "Inherited from",
    theme_overrides: "Overrides",
    theme_returns: "Returns",
    theme_generated_using_typedoc: "Generated using TypeDoc", // If this includes "TypeDoc", theme will insert a link at that location.
    // Search
    theme_preparing_search_index: "Preparing search index...",
    theme_search_index_not_available: "The search index is not available",
    // Left nav bar
    theme_loading: "Loading...",
    // Right nav bar
    theme_settings: "Settings",
    theme_member_visibility: "Member Visibility",
    theme_theme: "Theme",
    theme_os: "OS",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_on_this_page: "On This Page",

    // aria-label
    theme_search: "Search",
    theme_menu: "Menu",
    theme_permalink: "Permalink",

    // Used by the frontend JS
    // For the English translations only, these should also be added to
    // src/lib/output/themes/default/assets/typedoc/Application.ts
    theme_copy: "Copy",
    theme_copied: "Copied!",
    theme_normally_hidden:
        "This member is normally hidden due to your filter settings.",
    theme_hierarchy_expand: "Expand",
    theme_hierarchy_collapse: "Collapse",
} as const;
