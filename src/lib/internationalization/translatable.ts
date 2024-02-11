export function buildTranslation<
    T extends BuiltinTranslatableStringConstraints,
>(translations: T) {
    return translations;
}

export function buildIncompleteTranslation<
    T extends Partial<BuiltinTranslatableStringConstraints>,
>(translations: T) {
    return translations;
}

export const translatable = {
    loaded_multiple_times_0:
        "TypeDoc has been loaded multiple times. This is commonly caused by plugins which have their own installation of TypeDoc. The loaded paths are:\n\t{0}",
    unsupported_ts_version_0:
        "You are running with an unsupported TypeScript version! If TypeDoc crashes, this is why. TypeDoc supports {0}",
    no_compiler_options_set:
        "No compiler options set. This likely means that TypeDoc did not find your tsconfig.json. Generated documentation will probably be empty.",

    loaded_plugin_0: `Loaded plugin {0}`,

    solution_not_supported_in_watch_mode:
        "The provided tsconfig file looks like a solution style tsconfig, which is not supported in watch mode.",
    strategy_not_supported_in_watch_mode:
        "entryPointStrategy must be set to either resolve or expand for watch mode.",

    docs_could_not_be_generated:
        "Documentation could not be generated due to the errors above.",
    docs_generated_at_0: "Documentation generated at {0}",
    json_written_to_0: "JSON written to {0}",

    no_entry_points_for_packages:
        "No entry points provided to packages mode, documentation cannot be generated.",
    failed_to_find_packages:
        "Failed to find any packages, ensure you have provided at least one directory as an entry point containing package.json",
    nested_packages_unsupported_0:
        "Project at {0} has entryPointStrategy set to packages, but nested packages are not supported.",
    converting_project_at_0: "Converting project at {0}",
    failed_to_convert_packages:
        "Failed to convert one or more packages, result will not be merged together.",
    merging_converted_projects: "Merging converted projects",

    no_entry_points_to_merge: "No entry points provided to merge.",
    entrypoint_did_not_match_files_0:
        "The entrypoint glob {0} did not match any files.",
    failed_to_parse_json_0: `Failed to parse file at {0} as json.`,

    block_and_modifier_tags_ignored_within_readme_0: `Block and modifier tags will be ignored within the readme:\n\t{0}`,

    converting_union_as_interface: `Using @interface on a union type will discard properties not present on all branches of the union. TypeDoc's output may not accurately describe your source code.`,
    converting_0_as_class_requires_value_declaration: `Converting {0} as a class requires a declaration which represents a non-type value.`,
    converting_0_as_class_without_construct_signatures: `{0} is being converted as a class, but does not have any construct signatures`,

    symbol_0_has_multiple_declarations_with_comment: `{0} has multiple declarations with a comment. An arbitrary comment will be used.`,
    comments_for_0_are_declared_at_1: `The comments for {0} are declared at:\n\t{1}`,

    // comments/parser.ts
    multiple_type_parameters_on_template_tag_unsupported: `TypeDoc does not support multiple type parameters defined in a single @template tag with a comment.`,
    failed_to_find_jsdoc_tag_for_name_0: `Failed to find JSDoc tag for {0} after parsing comment, please file a bug report.`,

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
        "The first line of an example tag will be taken literally as the example name, and should only contain text.",
    inheritdoc_tag_properly_capitalized:
        "The @inheritDoc tag should be properly capitalized.",
    treating_unrecognized_tag_0_as_modifier: `Treating unrecognized tag {0} as a modifier tag.`,
    unmatched_closing_brace: `Unmatched closing brace.`,
    unescaped_open_brace_without_inline_tag: `Encountered an unescaped open brace without an inline tag.`,
    unknown_inline_tag_0: `Encountered an unknown inline tag {0}.`,
    open_brace_within_inline_tag: `Encountered an open brace within an inline tag, this is likely a mistake.`,
    inline_tag_not_closed: `Inline tag is not closed.`,

    // validation
    failed_to_resolve_link_to_0_in_comment_for_1: `Failed to resolve link to "{0}" in comment for {1}`,
    type_0_defined_in_1_is_referenced_by_2_but_not_included_in_docs: `{0}, defined in {1}, is referenced by {2} but not included in the documentation.`,
    reflection_0_kind_1_defined_in_2_does_not_have_any_documentation: `{0} ({1}), defined in {2}, does not have any documentation.`,
    invalid_intentionally_not_exported_symbols_0:
        "The following symbols were marked as intentionally not exported, but were either not referenced in the documentation, or were exported:\n\t{0}",

    // conversion plugins
    not_all_search_category_boosts_used_0: `Not all categories specified in searchCategoryBoosts were used in the documentation. The unused categories were:\n\t{0}`,
    not_all_search_group_boosts_used_0: `Not all groups specified in searchGroupBoosts were used in the documentation. The unused groups were:\n\t{0}`,
    label_0_for_1_cannot_be_referenced: `The label "{0}" for {1} cannot be referenced with a declaration reference. Labels may only contain A-Z, 0-9, and _, and may not start with a number.`,
    signature_0_has_unused_param_with_name_1: `The signature {0} has an @param with name "{1}", which was not used.`,
    declaration_reference_in_inheritdoc_for_0_not_fully_parsed: `Declaration reference in @inheritDoc for {0} was not fully parsed and may resolve incorrectly.`,
    failed_to_find_0_to_inherit_comment_from_in_1: `Failed to find "{0}" to inherit the comment from in the comment for {1}`,
    reflection_0_tried_to_copy_comment_from_1_but_source_had_no_comment: `{0} tried to copy a comment from {1} with @inheritDoc, but the source has no associated comment.`,
    inheritdoc_circular_inheritance_chain_0: `@inheritDoc specifies a circular inheritance chain: {0}`,
    provided_readme_at_0_could_not_be_read: `Provided README path, {0} could not be read.`,
    defaulting_project_name:
        'The --name option was not specified, and no package.json was found. Defaulting project name to "Documentation".',
    disable_git_set_but_not_source_link_template: `disableGit is set, but sourceLinkTemplate is not, so source links cannot be produced. Set a sourceLinkTemplate or disableSources to prevent source tracking.`,
    disable_git_set_and_git_revision_used: `disableGit is set and sourceLinkTemplate contains {gitRevision}, which will be replaced with an empty string as no revision was provided.`,
    provided_git_remote_0_was_invalid: `The provided git remote "{0}" was not valid. Source links will be broken.`,
    git_remote_0_not_valid: `The provided git remote "{0}" was not valid. Source links will be broken.`,

    // output plugins
    custom_css_file_0_does_not_exist: `Custom CSS file at {0} does not exist.`,
    unsupported_highlight_language_0_not_highlighted_in_comment_for_1: `Unsupported highlight language {0} will not be highlighted in comment for {1}.`,
    could_not_find_file_to_include_0: `Could not find file to include: {0}`,
    could_not_find_media_file_0: `Could not find media file: {0}`,
    could_not_find_includes_directory:
        "Could not find provided includes directory: {0}",
    could_not_find_media_directory:
        "Could not find provided media directory: {0}",

    // renderer
    could_not_write_0: `Could not write {0}`,
    could_not_empty_output_directory_0: `Could not empty the output directory {0}`,
    could_not_create_output_directory_0: `Could not create the output directory {0}`,
    theme_0_is_not_defined_available_are_1: `The theme '{0}' is not defined. The available themes are: {1}`,

    // entry points
    no_entry_points_provided:
        "No entry points were provided, this is likely a misconfiguration.",
    unable_to_find_any_entry_points:
        "Unable to find any entry points. See previous warnings.",
    watch_does_not_support_packages_mode:
        "Watch mode does not support 'packages' style entry points.",
    watch_does_not_support_merge_mode:
        "Watch mode does not support 'merge' style entry points.",
    entry_point_0_not_in_program: `The entry point {0} is not referenced by the 'files' or 'include' option in your tsconfig.`,
    use_expand_or_glob_for_files_in_dir: `If you wanted to include files inside this directory, set --entryPointStrategy to expand or specify a glob.`,
    entry_point_0_did_not_match_any_files: `The entry point glob {0} did not match any files.`,
    entry_point_0_did_not_match_any_files_after_exclude: `The entry point glob {0} did not match any files after applying exclude patterns.`,
    entry_point_0_did_not_exist: `Provided entry point {0} does not exist.`,
    entry_point_0_did_not_match_any_packages: `The entry point glob {0} did not match any directories containing package.json.`,
    file_0_not_an_object: `The file {0} is not an object.`,

    // deserialization
    serialized_project_referenced_0_not_part_of_project: `Serialized project referenced reflection {0}, which was not a part of the project.`,

    // options
    circular_reference_extends_0: `Circular reference encountered for "extends" field of {0}`,
    failed_resolve_0_to_file_in_1: `Failed to resolve {0} to a file in {1}`,

    option_0_can_only_be_specified_by_config_file: `The '{0}' option can only be specified via a config file.`,
    option_0_expected_a_value_but_none_provided: `--{0} expected a value, but none was given as an argument`,
    unknown_option_0_may_have_meant_1: `Unknown option: {0}, you may have meant:\n\t{1}`,

    typedoc_key_in_0_ignored: `The 'typedoc' key in {0} was used by the legacy-packages entryPointStrategy and will be ignored.`,
    typedoc_options_must_be_object_in_0: `Failed to parse the "typedocOptions" field in {0}, ensure it exists and contains an object.`,
    tsconfig_file_0_does_not_exist: `The tsconfig file {0} does not exist`,
    tsconfig_file_specifies_options_file: `"typedocOptions" in tsconfig file specifies an option file to read but the option file has already been read. This is likely a misconfiguration.`,
    tsconfig_file_specifies_tsconfig_file: `"typedocOptions" in tsconfig file may not specify a tsconfig file to read.`,
    tags_0_defined_in_typedoc_json_overwritten_by_tsdoc_json: `The {0} defined in typedoc.json will be overwritten by configuration in tsdoc.json.`,
    failed_read_tsdoc_json_0: `Failed to read tsdoc.json file at {0}.`,
    invalid_tsdoc_json_0: `The file {0} is not a valid tsdoc.json file.`,

    options_file_0_does_not_exist: `The options file {0} does not exist.`,
    failed_read_options_file_0: `Failed to parse {0}, ensure it exists and exports an object.`,

    // plugins
    invalid_plugin_0_missing_load_function: `Invalid structure in plugin {0}, no load function found.`,
    plugin_0_could_not_be_loaded: `The plugin {0} could not be loaded.`,
} as const;

export type BuiltinTranslatableStringArgs = {
    [K in keyof typeof translatable]: BuildTranslationArguments<
        (typeof translatable)[K]
    >;
};

type BuildTranslationArguments<
    T extends string,
    Acc extends any[] = [],
> = T extends `${string}{${bigint}}${infer R}`
    ? BuildTranslationArguments<R, [...Acc, string]>
    : Acc;

export type BuiltinTranslatableStringConstraints = {
    [K in keyof BuiltinTranslatableStringArgs]: TranslationConstraint[BuiltinTranslatableStringArgs[K]["length"]];
};

type BuildConstraint<
    T extends number,
    Acc extends string = "",
    U extends number = T,
> = [T] extends [never]
    ? `${Acc}${string}`
    : T extends T
    ? BuildConstraint<Exclude<U, T>, `${Acc}${string}{${T}}`>
    : never;

// Combinatorially explosive, but shouldn't matter for us, since we only need a few iterations.
type TranslationConstraint = [
    string,
    BuildConstraint<0>,
    BuildConstraint<0 | 1>,
    BuildConstraint<0 | 1 | 2>,
];

// Compiler errors here which says a property is missing indicates that the value on translatable
// is not a literal string. It should be so that TypeDoc's placeholder replacement detection
// can validate that all placeholders have been specified.
const _validateLiteralStrings: {
    [K in keyof typeof translatable as string extends (typeof translatable)[K]
        ? K
        : never]: never;
} = {};
_validateLiteralStrings;

// Compiler errors here which says a property is missing indicates that the key on translatable
// contains a placeholder _0/_1, etc. but the value does not match the expected constraint.
const _validatePlaceholdersPresent: {
    [K in keyof typeof translatable]: K extends `${string}_1${string}`
        ? TranslationConstraint[2]
        : K extends `${string}_0${string}`
        ? TranslationConstraint[1]
        : TranslationConstraint[0];
} = translatable;
_validatePlaceholdersPresent;
