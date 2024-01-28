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

type TranslationConstraint = [
    string,
    `${string}{0}${string}`,
    `${string}{0}${string}{1}${string}` | `${string}{1}${string}{0}${string}`,
];

// Compiler errors here which says a property is missing indicates that the key on translatable
// is not a literal string. It should be so that TypeDoc's placeholder replacement detection
// can validate that all placeholders have been specified.
const _validateLiteralStrings: {
    [K in keyof typeof translatable as string extends (typeof translatable)[K]
        ? K
        : never]: never;
} = {};
_validateLiteralStrings;
