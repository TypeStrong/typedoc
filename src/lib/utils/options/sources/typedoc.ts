import type { Options } from "..";
import { LogLevel } from "../../loggers";
import {
    ParameterType,
    ParameterHint,
    EmitStrategy,
    CommentStyle,
} from "../declaration";
import { SORT_STRATEGIES } from "../../sort";
import { EntryPointStrategy } from "../../entry-point";
import { ReflectionKind } from "../../../models/reflections/kind";
import * as Validation from "../../validation";
import { blockTags, inlineTags, modifierTags } from "../tsdoc-defaults";
import { getEnumKeys } from "../../enum";
import type {
    BundledLanguage,
    BundledTheme,
} from "shiki" with { "resolution-mode": "import" };
import {
    getSupportedLanguagesWithoutAliases,
    getSupportedThemes,
} from "../../highlighter";
import { setDifference } from "../../set";

// For convenience, added in the same order as they are documented on the website.
export function addTypeDocOptions(options: Pick<Options, "addDeclaration">) {
    ///////////////////////////
    // Configuration Options //
    ///////////////////////////

    options.addDeclaration({
        type: ParameterType.Path,
        name: "options",
        help: (i18n) => i18n.help_options(),
        hint: ParameterHint.File,
        defaultValue: "",
    });
    options.addDeclaration({
        type: ParameterType.Path,
        name: "tsconfig",
        help: (i18n) => i18n.help_tsconfig(),
        hint: ParameterHint.File,
        defaultValue: "",
    });
    options.addDeclaration({
        name: "compilerOptions",
        help: (i18n) => i18n.help_compilerOptions(),
        type: ParameterType.Mixed,
        configFileOnly: true,
        validate(value, i18n) {
            if (!Validation.validate({}, value)) {
                throw new Error(
                    i18n.option_0_must_be_an_object("compilerOptions"),
                );
            }
        },
    });
    options.addDeclaration({
        name: "lang",
        help: (i18n) => i18n.help_lang(),
        type: ParameterType.String,
        defaultValue: "en",
    });
    options.addDeclaration({
        name: "locales",
        help: (i18n) => i18n.help_locales(),
        type: ParameterType.Mixed,
        configFileOnly: true,
        defaultValue: {},
        validate(value, i18n) {
            if (typeof value !== "object" || !value) {
                throw new Error(i18n.locales_must_be_an_object());
            }

            for (const val of Object.values(value)) {
                if (typeof val !== "object" || !val) {
                    throw new Error(i18n.locales_must_be_an_object());
                }

                for (const val2 of Object.values(val)) {
                    if (typeof val2 !== "string") {
                        throw new Error(i18n.locales_must_be_an_object());
                    }
                }
            }
        },
    });
    options.addDeclaration({
        name: "packageOptions",
        help: (i18n) => i18n.help_packageOptions(),
        type: ParameterType.Mixed,
        configFileOnly: true,
        defaultValue: {},
        validate(value, i18n) {
            if (!Validation.validate({}, value)) {
                throw new Error(
                    i18n.option_0_must_be_an_object("packageOptions"),
                );
            }
        },
    });

    ///////////////////////////
    ////// Input Options //////
    ///////////////////////////

    options.addDeclaration({
        name: "entryPoints",
        help: (i18n) => i18n.help_entryPoints(),
        type: ParameterType.GlobArray,
    });
    options.addDeclaration({
        name: "entryPointStrategy",
        help: (i18n) => i18n.help_entryPointStrategy(),
        type: ParameterType.Map,
        map: EntryPointStrategy,
        defaultValue: EntryPointStrategy.Resolve,
    });
    options.addDeclaration({
        name: "alwaysCreateEntryPointModule",
        help: (i18n) => i18n.help_alwaysCreateEntryPointModule(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "projectDocuments",
        help: (i18n) => i18n.help_projectDocuments(),
        type: ParameterType.GlobArray,
    });

    options.addDeclaration({
        name: "exclude",
        help: (i18n) => i18n.help_exclude(),
        type: ParameterType.GlobArray,
    });
    options.addDeclaration({
        name: "externalPattern",
        help: (i18n) => i18n.help_externalPattern(),
        type: ParameterType.GlobArray,
        defaultValue: ["**/node_modules/**"],
    });
    options.addDeclaration({
        name: "excludeExternals",
        help: (i18n) => i18n.help_excludeExternals(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "excludeNotDocumented",
        help: (i18n) => i18n.help_excludeNotDocumented(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "excludeNotDocumentedKinds",
        help: (i18n) => i18n.help_excludeNotDocumentedKinds(),
        type: ParameterType.Array,
        validate(value, i18n) {
            const invalid = new Set(value);
            const valid = new Set(getEnumKeys(ReflectionKind));
            for (const notPermitted of [
                ReflectionKind.Project,
                ReflectionKind.TypeLiteral,
                ReflectionKind.TypeParameter,
                ReflectionKind.Parameter,
            ]) {
                valid.delete(ReflectionKind[notPermitted]);
            }
            for (const v of valid) {
                invalid.delete(v);
            }

            if (invalid.size !== 0) {
                throw new Error(
                    i18n.exclude_not_documented_specified_0_valid_values_are_1(
                        Array.from(invalid).join(", "),
                        Array.from(valid).join(", "),
                    ),
                );
            }
        },
        defaultValue: [
            ReflectionKind[ReflectionKind.Module],
            ReflectionKind[ReflectionKind.Namespace],
            ReflectionKind[ReflectionKind.Enum],
            // Not including enum member here by default
            ReflectionKind[ReflectionKind.Variable],
            ReflectionKind[ReflectionKind.Function],
            ReflectionKind[ReflectionKind.Class],
            ReflectionKind[ReflectionKind.Interface],
            ReflectionKind[ReflectionKind.Constructor],
            ReflectionKind[ReflectionKind.Property],
            ReflectionKind[ReflectionKind.Method],
            ReflectionKind[ReflectionKind.CallSignature],
            ReflectionKind[ReflectionKind.IndexSignature],
            ReflectionKind[ReflectionKind.ConstructorSignature],
            ReflectionKind[ReflectionKind.Accessor],
            ReflectionKind[ReflectionKind.GetSignature],
            ReflectionKind[ReflectionKind.SetSignature],
            ReflectionKind[ReflectionKind.TypeAlias],
            ReflectionKind[ReflectionKind.Reference],
        ],
    });
    options.addDeclaration({
        name: "excludeInternal",
        help: (i18n) => i18n.help_excludeInternal(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "excludeCategories",
        help: (i18n) => i18n.help_excludeCategories(),
        type: ParameterType.Array,
        defaultValue: [],
    });
    options.addDeclaration({
        name: "excludePrivate",
        help: (i18n) => i18n.help_excludePrivate(),
        type: ParameterType.Boolean,
        defaultValue: true,
    });
    options.addDeclaration({
        name: "excludeProtected",
        help: (i18n) => i18n.help_excludeProtected(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "excludeReferences",
        help: (i18n) => i18n.help_excludeReferences(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "externalSymbolLinkMappings",
        help: (i18n) => i18n.help_externalSymbolLinkMappings(),
        type: ParameterType.Mixed,
        defaultValue: {},
        validate(value, i18n) {
            if (!Validation.validate({}, value)) {
                throw new Error(
                    i18n.external_symbol_link_mappings_must_be_object(),
                );
            }

            for (const mappings of Object.values(value)) {
                if (!Validation.validate({}, mappings)) {
                    throw new Error(
                        i18n.external_symbol_link_mappings_must_be_object(),
                    );
                }

                for (const link of Object.values(mappings)) {
                    if (typeof link !== "string") {
                        throw new Error(
                            i18n.external_symbol_link_mappings_must_be_object(),
                        );
                    }
                }
            }
        },
    });

    ///////////////////////////
    ///// Output Options //////
    ///////////////////////////

    options.addDeclaration({
        name: "out",
        help: (i18n) => i18n.help_out(),
        type: ParameterType.Path,
        hint: ParameterHint.Directory,
        defaultValue: "./docs",
    });
    options.addDeclaration({
        name: "json",
        help: (i18n) => i18n.help_json(),
        type: ParameterType.Path,
        hint: ParameterHint.File,
    });
    options.addDeclaration({
        name: "pretty",
        help: (i18n) => i18n.help_pretty(),
        type: ParameterType.Boolean,
        defaultValue: true,
    });
    options.addDeclaration({
        name: "emit",
        help: (i18n) => i18n.help_emit(),
        type: ParameterType.Map,
        map: EmitStrategy,
        defaultValue: "docs",
    });
    options.addDeclaration({
        name: "theme",
        help: (i18n) => i18n.help_theme(),
        type: ParameterType.String,
        defaultValue: "default",
    });

    const defaultLightTheme: BundledTheme = "light-plus";
    const defaultDarkTheme: BundledTheme = "dark-plus";

    options.addDeclaration({
        name: "lightHighlightTheme",
        help: (i18n) => i18n.help_lightHighlightTheme(),
        type: ParameterType.String,
        defaultValue: defaultLightTheme,
        validate(value, i18n) {
            if (!getSupportedThemes().includes(value)) {
                throw new Error(
                    i18n.highlight_theme_0_must_be_one_of_1(
                        "lightHighlightTheme",
                        getSupportedThemes().join(", "),
                    ),
                );
            }
        },
    });
    options.addDeclaration({
        name: "darkHighlightTheme",
        help: (i18n) => i18n.help_darkHighlightTheme(),
        type: ParameterType.String,
        defaultValue: defaultDarkTheme,
        validate(value, i18n) {
            if (!getSupportedThemes().includes(value)) {
                throw new Error(
                    i18n.highlight_theme_0_must_be_one_of_1(
                        "darkHighlightTheme",
                        getSupportedThemes().join(", "),
                    ),
                );
            }
        },
    });
    options.addDeclaration({
        name: "highlightLanguages",
        help: (i18n) => i18n.help_highlightLanguages(),
        type: ParameterType.Array,
        defaultValue: [
            "bash",
            "console",
            "css",
            "html",
            "javascript",
            "json",
            "jsonc",
            "json5",
            "tsx",
            "typescript",
        ] satisfies BundledLanguage[],
        validate(value, i18n) {
            const invalid = setDifference(
                value,
                getSupportedLanguagesWithoutAliases(),
            );
            if (invalid.size) {
                throw new Error(
                    i18n.highlightLanguages_contains_invalid_languages_0(
                        Array.from(invalid).join(", "),
                    ),
                );
            }
        },
    });

    options.addDeclaration({
        name: "customCss",
        help: (i18n) => i18n.help_customCss(),
        type: ParameterType.Path,
    });
    options.addDeclaration({
        name: "markdownItOptions",
        help: (i18n) => i18n.help_markdownItOptions(),
        type: ParameterType.Mixed,
        configFileOnly: true,
        defaultValue: {
            html: true,
            linkify: true,
        },
        validate(value, i18n) {
            if (!Validation.validate({}, value)) {
                throw new Error(
                    i18n.option_0_must_be_an_object("markdownItOptions"),
                );
            }
        },
    });
    options.addDeclaration({
        name: "markdownItLoader",
        help: (i18n) => i18n.help_markdownItLoader(),
        type: ParameterType.Mixed,
        configFileOnly: true,
        defaultValue: () => {},
        validate(value, i18n) {
            if (typeof value !== "function") {
                throw new Error(
                    i18n.option_0_must_be_a_function("markdownItLoader"),
                );
            }
        },
    });
    options.addDeclaration({
        name: "maxTypeConversionDepth",
        help: (i18n) => i18n.help_maxTypeConversionDepth(),
        defaultValue: 10,
        type: ParameterType.Number,
    });
    options.addDeclaration({
        name: "name",
        help: (i18n) => i18n.help_name(),
    });
    options.addDeclaration({
        name: "includeVersion",
        help: (i18n) => i18n.help_includeVersion(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "disableSources",
        help: (i18n) => i18n.help_disableSources(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "sourceLinkTemplate",
        help: (i18n) => i18n.help_sourceLinkTemplate(),
    });
    options.addDeclaration({
        name: "gitRevision",
        help: (i18n) => i18n.help_gitRevision(),
    });
    options.addDeclaration({
        name: "gitRemote",
        help: (i18n) => i18n.help_gitRemote(),
        defaultValue: "origin",
    });
    options.addDeclaration({
        name: "disableGit",
        help: (i18n) => i18n.help_disableGit(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "basePath",
        help: (i18n) => i18n.help_basePath(),
        type: ParameterType.Path,
    });
    options.addDeclaration({
        name: "excludeTags",
        help: (i18n) => i18n.help_excludeTags(),
        type: ParameterType.Array,
        defaultValue: [
            "@override",
            "@virtual",
            "@privateRemarks",
            "@satisfies",
            "@overload",
        ],
        validate(value, i18n) {
            if (!Validation.validate([Array, Validation.isTagString], value)) {
                throw new Error(
                    i18n.option_0_values_must_be_array_of_tags("excludeTags"),
                );
            }
        },
    });
    options.addDeclaration({
        name: "readme",
        help: (i18n) => i18n.help_readme(),
        type: ParameterType.Path,
    });
    options.addDeclaration({
        name: "cname",
        help: (i18n) => i18n.help_cname(),
    });
    options.addDeclaration({
        name: "sourceLinkExternal",
        help: (i18n) => i18n.help_sourceLinkExternal(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "githubPages",
        help: (i18n) => i18n.help_githubPages(),
        type: ParameterType.Boolean,
        defaultValue: true,
    });
    options.addDeclaration({
        name: "hostedBaseUrl",
        help: (i18n) => i18n.help_hostedBaseUrl(),
        validate(value, i18n) {
            if (!/https?:\/\//.test(value)) {
                throw new Error(i18n.hostedBaseUrl_must_start_with_http());
            }
        },
    });
    options.addDeclaration({
        name: "useHostedBaseUrlForAbsoluteLinks",
        help: (i18n) => i18n.help_useHostedBaseUrlForAbsoluteLinks(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "hideGenerator",
        help: (i18n) => i18n.help_hideGenerator(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "customFooterHtml",
        help: (i18n) => i18n.help_customFooterHtml(),
        type: ParameterType.String,
    });
    options.addDeclaration({
        name: "customFooterHtmlDisableWrapper",
        help: (i18n) => i18n.help_customFooterHtmlDisableWrapper(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "hideParameterTypesInTitle",
        help: (i18n) => i18n.help_hideParameterTypesInTitle(),
        type: ParameterType.Boolean,
        defaultValue: true,
    });
    options.addDeclaration({
        name: "cacheBust",
        help: (i18n) => i18n.help_cacheBust(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "searchInComments",
        help: (i18n) => i18n.help_searchInComments(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "searchInDocuments",
        help: (i18n) => i18n.help_searchInDocuments(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "cleanOutputDir",
        help: (i18n) => i18n.help_cleanOutputDir(),
        type: ParameterType.Boolean,
        defaultValue: true,
    });
    options.addDeclaration({
        name: "titleLink",
        help: (i18n) => i18n.help_titleLink(),
        type: ParameterType.String,
    });
    options.addDeclaration({
        name: "navigationLinks",
        help: (i18n) => i18n.help_navigationLinks(),
        type: ParameterType.Mixed,
        defaultValue: {},
        validate(value, i18n) {
            if (!isObject(value)) {
                throw new Error(
                    i18n.option_0_must_be_object_with_urls("navigationLinks"),
                );
            }

            if (Object.values(value).some((x) => typeof x !== "string")) {
                throw new Error(
                    i18n.option_0_must_be_object_with_urls("navigationLinks"),
                );
            }
        },
    });
    options.addDeclaration({
        name: "sidebarLinks",
        help: (i18n) => i18n.help_sidebarLinks(),
        type: ParameterType.Mixed,
        defaultValue: {},
        validate(value, i18n) {
            if (!isObject(value)) {
                throw new Error(
                    i18n.option_0_must_be_object_with_urls("sidebarLinks"),
                );
            }

            if (Object.values(value).some((x) => typeof x !== "string")) {
                throw new Error(
                    i18n.option_0_must_be_object_with_urls("sidebarLinks"),
                );
            }
        },
    });
    options.addDeclaration({
        name: "navigationLeaves",
        help: (i18n) => i18n.help_navigationLeaves(),
        type: ParameterType.Array,
    });
    options.addDeclaration({
        name: "navigation",
        help: (i18n) => i18n.help_navigation(),
        type: ParameterType.Flags,
        defaults: {
            includeCategories: false,
            includeGroups: false,
            includeFolders: true,
        },
    });

    options.addDeclaration({
        name: "visibilityFilters",
        help: (i18n) => i18n.help_visibilityFilters(),
        type: ParameterType.Mixed,
        configFileOnly: true,
        defaultValue: {
            protected: false,
            private: false,
            inherited: true,
            external: false,
        },
        validate(value, i18n) {
            const knownKeys = ["protected", "private", "inherited", "external"];
            if (!value || typeof value !== "object") {
                throw new Error(
                    i18n.option_0_must_be_an_object("visibilityFilters"),
                );
            }

            for (const [key, val] of Object.entries(value)) {
                if (!key.startsWith("@") && !knownKeys.includes(key)) {
                    throw new Error(
                        i18n.visibility_filters_only_include_0(
                            knownKeys.join(", "),
                        ),
                    );
                }

                if (typeof val !== "boolean") {
                    throw new Error(i18n.visibility_filters_must_be_booleans());
                }
            }
        },
    });

    options.addDeclaration({
        name: "searchCategoryBoosts",
        help: (i18n) => i18n.help_searchCategoryBoosts(),
        type: ParameterType.Mixed,
        configFileOnly: true,
        defaultValue: {},
        validate(value, i18n) {
            if (!isObject(value)) {
                throw new Error(
                    i18n.option_0_must_be_an_object("searchCategoryBoosts"),
                );
            }

            if (Object.values(value).some((x) => typeof x !== "number")) {
                throw new Error(
                    i18n.option_0_values_must_be_numbers(
                        "searchCategoryBoosts",
                    ),
                );
            }
        },
    });
    options.addDeclaration({
        name: "searchGroupBoosts",
        help: (i18n) => i18n.help_searchGroupBoosts(),
        type: ParameterType.Mixed,
        configFileOnly: true,
        defaultValue: {},
        validate(value, i18n) {
            if (!isObject(value)) {
                throw new Error(
                    i18n.option_0_must_be_an_object("searchGroupBoosts"),
                );
            }

            if (Object.values(value).some((x) => typeof x !== "number")) {
                throw new Error(
                    i18n.option_0_values_must_be_numbers("searchGroupBoosts"),
                );
            }
        },
    });

    ///////////////////////////
    ///// Comment Options /////
    ///////////////////////////

    options.addDeclaration({
        name: "jsDocCompatibility",
        help: (i18n) => i18n.help_jsDocCompatibility(),
        type: ParameterType.Flags,
        defaults: {
            defaultTag: true,
            exampleTag: true,
            inheritDocTag: true,
            ignoreUnescapedBraces: true,
        },
    });

    options.addDeclaration({
        name: "commentStyle",
        help: (i18n) => i18n.help_commentStyle(),
        type: ParameterType.Map,
        map: CommentStyle,
        defaultValue: CommentStyle.JSDoc,
    });

    options.addDeclaration({
        name: "useTsLinkResolution",
        help: (i18n) => i18n.help_useTsLinkResolution(),
        type: ParameterType.Boolean,
        defaultValue: true,
    });
    options.addDeclaration({
        name: "preserveLinkText",
        help: (i18n) => i18n.help_preserveLinkText(),
        type: ParameterType.Boolean,
        defaultValue: true,
    });

    options.addDeclaration({
        name: "blockTags",
        help: (i18n) => i18n.help_blockTags(),
        type: ParameterType.Array,
        defaultValue: blockTags,
        validate(value, i18n) {
            if (!Validation.validate([Array, Validation.isTagString], value)) {
                throw new Error(
                    i18n.option_0_values_must_be_array_of_tags("blockTags"),
                );
            }
        },
    });
    options.addDeclaration({
        name: "inlineTags",
        help: (i18n) => i18n.help_inlineTags(),
        type: ParameterType.Array,
        defaultValue: inlineTags,
        validate(value, i18n) {
            if (!Validation.validate([Array, Validation.isTagString], value)) {
                throw new Error(
                    i18n.option_0_values_must_be_array_of_tags("inlineTags"),
                );
            }
        },
    });
    options.addDeclaration({
        name: "modifierTags",
        help: (i18n) => i18n.help_modifierTags(),
        type: ParameterType.Array,
        defaultValue: modifierTags,
        validate(value, i18n) {
            if (!Validation.validate([Array, Validation.isTagString], value)) {
                throw new Error(
                    i18n.option_0_values_must_be_array_of_tags("modifierTags"),
                );
            }
        },
    });
    options.addDeclaration({
        name: "cascadedModifierTags",
        help: (i18n) => i18n.help_modifierTags(),
        type: ParameterType.Array,
        defaultValue: ["@alpha", "@beta", "@experimental"],
        validate(value, i18n) {
            if (!Validation.validate([Array, Validation.isTagString], value)) {
                throw new Error(
                    i18n.option_0_values_must_be_array_of_tags(
                        "cascadedModifierTags",
                    ),
                );
            }
        },
    });

    ///////////////////////////
    // Organization Options ///
    ///////////////////////////

    options.addDeclaration({
        name: "categorizeByGroup",
        help: (i18n) => i18n.help_categorizeByGroup(),
        type: ParameterType.Boolean,
        defaultValue: false,
    });
    options.addDeclaration({
        name: "defaultCategory",
        help: (i18n) => i18n.help_defaultCategory(),
        defaultValue: "Other",
    });
    options.addDeclaration({
        name: "categoryOrder",
        help: (i18n) => i18n.help_categoryOrder(),
        type: ParameterType.Array,
    });
    options.addDeclaration({
        name: "groupOrder",
        help: (i18n) => i18n.help_groupOrder(),
        type: ParameterType.Array,
        // default order specified in GroupPlugin to correctly handle localization.
    });
    options.addDeclaration({
        name: "sort",
        help: (i18n) => i18n.help_sort(),
        type: ParameterType.Array,
        defaultValue: ["kind", "instance-first", "alphabetical"],
        validate(value, i18n) {
            const invalid = new Set(value);
            for (const v of SORT_STRATEGIES) {
                invalid.delete(v);
            }

            if (invalid.size !== 0) {
                throw new Error(
                    i18n.option_0_specified_1_but_only_2_is_valid(
                        "sort",
                        Array.from(invalid).join(", "),
                        SORT_STRATEGIES.join(", "),
                    ),
                );
            }
        },
    });
    options.addDeclaration({
        name: "sortEntryPoints",
        help: (i18n) => i18n.help_sortEntryPoints(),
        type: ParameterType.Boolean,
        defaultValue: true,
    });
    options.addDeclaration({
        name: "kindSortOrder",
        help: (i18n) => i18n.help_kindSortOrder(),
        type: ParameterType.Array,
        defaultValue: [],
        validate(value, i18n) {
            const invalid = new Set(value);
            const valid = getEnumKeys(ReflectionKind);
            for (const v of valid) {
                invalid.delete(v);
            }

            if (invalid.size !== 0) {
                throw new Error(
                    i18n.option_0_specified_1_but_only_2_is_valid(
                        `kindSortOrder`,
                        Array.from(invalid).join(", "),
                        valid.join(", "),
                    ),
                );
            }
        },
    });

    ///////////////////////////
    ///// General Options /////
    ///////////////////////////

    options.addDeclaration({
        name: "watch",
        help: (i18n) => i18n.help_watch(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "preserveWatchOutput",
        help: (i18n) => i18n.help_preserveWatchOutput(),
        type: ParameterType.Boolean,
    });

    options.addDeclaration({
        name: "skipErrorChecking",
        help: (i18n) => i18n.help_skipErrorChecking(),
        type: ParameterType.Boolean,
        defaultValue: false,
    });
    options.addDeclaration({
        name: "help",
        help: (i18n) => i18n.help_help(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "version",
        help: (i18n) => i18n.help_version(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "showConfig",
        help: (i18n) => i18n.help_showConfig(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "plugin",
        help: (i18n) => i18n.help_plugin(),
        type: ParameterType.ModuleArray,
    });
    options.addDeclaration({
        name: "logLevel",
        help: (i18n) => i18n.help_logLevel(),
        type: ParameterType.Map,
        map: LogLevel,
        defaultValue: LogLevel.Info,
    });

    options.addDeclaration({
        name: "treatWarningsAsErrors",
        help: (i18n) => i18n.help_treatWarningsAsErrors(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "treatValidationWarningsAsErrors",
        help: (i18n) => i18n.help_treatValidationWarningsAsErrors(),
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "intentionallyNotExported",
        help: (i18n) => i18n.help_intentionallyNotExported(),
        type: ParameterType.Array,
    });
    options.addDeclaration({
        name: "requiredToBeDocumented",
        help: (i18n) => i18n.help_requiredToBeDocumented(),
        type: ParameterType.Array,
        validate(values, i18n) {
            // this is good enough because the values of the ReflectionKind enum are all numbers
            const validValues = getEnumKeys(ReflectionKind);

            for (const kind of values) {
                if (!validValues.includes(kind)) {
                    throw new Error(
                        i18n.option_0_specified_1_but_only_2_is_valid(
                            "requiredToBeDocumented",
                            kind,
                            validValues.join(", "),
                        ),
                    );
                }
            }
        },
        defaultValue: [
            ReflectionKind[ReflectionKind.Enum],
            ReflectionKind[ReflectionKind.EnumMember],
            ReflectionKind[ReflectionKind.Variable],
            ReflectionKind[ReflectionKind.Function],
            ReflectionKind[ReflectionKind.Class],
            ReflectionKind[ReflectionKind.Interface],
            ReflectionKind[ReflectionKind.Property],
            ReflectionKind[ReflectionKind.Method],
            ReflectionKind[ReflectionKind.Accessor],
            ReflectionKind[ReflectionKind.TypeAlias],
        ],
    });

    options.addDeclaration({
        name: "validation",
        help: (i18n) => i18n.help_validation(),
        type: ParameterType.Flags,
        defaults: {
            notExported: true,
            invalidLink: true,
            notDocumented: false,
        },
    });
}

function isObject(x: unknown): x is Record<string, unknown> {
    return !!x && typeof x === "object" && !Array.isArray(x);
}
