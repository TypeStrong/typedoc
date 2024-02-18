import type { Options } from "..";
import { LogLevel } from "../../loggers";
import {
    ParameterType,
    ParameterHint,
    EmitStrategy,
    CommentStyle,
} from "../declaration";
import { BUNDLED_THEMES, Theme } from "shiki";
import { SORT_STRATEGIES } from "../../sort";
import { EntryPointStrategy } from "../../entry-point";
import { ReflectionKind } from "../../../models/reflections/kind";
import * as Validation from "../../validation";
import { blockTags, inlineTags, modifierTags } from "../tsdoc-defaults";
import { getEnumKeys } from "../../enum";

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
        validate(value) {
            if (!Validation.validate({}, value)) {
                throw new Error(
                    "The 'compilerOptions' option must be a non-array object.",
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
        validate(value) {
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
                    `excludeNotDocumentedKinds may only specify known values, and invalid values were provided (${Array.from(
                        invalid,
                    ).join(", ")}). The valid kinds are:\n${Array.from(
                        valid,
                    ).join(", ")}`,
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
        validate(value) {
            const error =
                "externalSymbolLinkMappings must be a Record<package name, Record<symbol name, link>>";

            if (!Validation.validate({}, value)) {
                throw new Error(error);
            }

            for (const mappings of Object.values(value)) {
                if (!Validation.validate({}, mappings)) {
                    throw new Error(error);
                }

                for (const link of Object.values(mappings)) {
                    if (typeof link !== "string") {
                        throw new Error(error);
                    }
                }
            }
        },
    });
    options.addDeclaration({
        name: "media",
        help: (i18n) => i18n.help_media(),
        type: ParameterType.Path,
        hint: ParameterHint.Directory,
    });
    options.addDeclaration({
        name: "includes",
        help: (i18n) => i18n.help_includes(),
        type: ParameterType.Path,
        hint: ParameterHint.Directory,
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

    const defaultLightTheme: Theme = "light-plus";
    const defaultDarkTheme: Theme = "dark-plus";

    options.addDeclaration({
        name: "lightHighlightTheme",
        help: (i18n) => i18n.help_lightHighlightTheme(),
        type: ParameterType.String,
        defaultValue: defaultLightTheme,
        validate(value) {
            if (!(BUNDLED_THEMES as readonly string[]).includes(value)) {
                throw new Error(
                    `lightHighlightTheme must be one of the following: ${BUNDLED_THEMES.join(
                        ", ",
                    )}`,
                );
            }
        },
    });
    options.addDeclaration({
        name: "darkHighlightTheme",
        help: (i18n) => i18n.help_darkHighlightTheme(),
        type: ParameterType.String,
        defaultValue: defaultDarkTheme,
        validate(value) {
            if (!(BUNDLED_THEMES as readonly string[]).includes(value)) {
                throw new Error(
                    `darkHighlightTheme must be one of the following: ${BUNDLED_THEMES.join(
                        ", ",
                    )}`,
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
        name: "markedOptions",
        help: (i18n) => i18n.help_markedOptions(),
        type: ParameterType.Mixed,
        configFileOnly: true,
        validate(value) {
            if (!Validation.validate({}, value)) {
                throw new Error(
                    "The 'markedOptions' option must be a non-array object.",
                );
            }
        },
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
        validate(value) {
            if (!Validation.validate([Array, Validation.isTagString], value)) {
                throw new Error(
                    `excludeTags must be an array of valid tag names.`,
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
        name: "stripYamlFrontmatter",
        help: (i18n) => i18n.help_stripYamlFrontmatter(),
        type: ParameterType.Boolean,
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
        name: "sitemapBaseUrl",
        help: (i18n) => i18n.help_sitemapBaseUrl(),
        validate(value) {
            if (!/https?:\/\//.test(value)) {
                throw new Error(
                    "sitemapBaseUrl must start with http:// or https://",
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
        name: "gaID",
        help: (i18n) => i18n.help_gaID(),
    });
    options.addDeclaration({
        name: "hideGenerator",
        help: (i18n) => i18n.help_hideGenerator(),
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
        validate(value) {
            if (!isObject(value)) {
                throw new Error(
                    `navigationLinks must be an object with string labels as keys and URL values.`,
                );
            }

            if (Object.values(value).some((x) => typeof x !== "string")) {
                throw new Error(
                    `All values of navigationLinks must be string URLs.`,
                );
            }
        },
    });
    options.addDeclaration({
        name: "sidebarLinks",
        help: (i18n) => i18n.help_sidebarLinks(),
        type: ParameterType.Mixed,
        defaultValue: {},
        validate(value) {
            if (!isObject(value)) {
                throw new Error(
                    `sidebarLinks must be an object with string labels as keys and URL values.`,
                );
            }

            if (Object.values(value).some((x) => typeof x !== "string")) {
                throw new Error(
                    `All values of sidebarLinks must be string URLs.`,
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
        validate(value) {
            const knownKeys = ["protected", "private", "inherited", "external"];
            if (!value || typeof value !== "object") {
                throw new Error("visibilityFilters must be an object.");
            }

            for (const [key, val] of Object.entries(value)) {
                if (!key.startsWith("@") && !knownKeys.includes(key)) {
                    throw new Error(
                        `visibilityFilters can only include the following non-@ keys: ${knownKeys.join(
                            ", ",
                        )}`,
                    );
                }

                if (typeof val !== "boolean") {
                    throw new Error(
                        `All values of visibilityFilters must be booleans.`,
                    );
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
        validate(value) {
            if (!isObject(value)) {
                throw new Error(
                    "The 'searchCategoryBoosts' option must be a non-array object.",
                );
            }

            if (Object.values(value).some((x) => typeof x !== "number")) {
                throw new Error(
                    "All values of 'searchCategoryBoosts' must be numbers.",
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
        validate(value: unknown) {
            if (!isObject(value)) {
                throw new Error(
                    "The 'searchGroupBoosts' option must be a non-array object.",
                );
            }

            if (Object.values(value).some((x) => typeof x !== "number")) {
                throw new Error(
                    "All values of 'searchGroupBoosts' must be numbers.",
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
        validate(value) {
            if (!Validation.validate([Array, Validation.isTagString], value)) {
                throw new Error(
                    `blockTags must be an array of valid tag names.`,
                );
            }
        },
    });
    options.addDeclaration({
        name: "inlineTags",
        help: (i18n) => i18n.help_inlineTags(),
        type: ParameterType.Array,
        defaultValue: inlineTags,
        validate(value) {
            if (!Validation.validate([Array, Validation.isTagString], value)) {
                throw new Error(
                    `inlineTags must be an array of valid tag names.`,
                );
            }
        },
    });
    options.addDeclaration({
        name: "modifierTags",
        help: (i18n) => i18n.help_modifierTags(),
        type: ParameterType.Array,
        defaultValue: modifierTags,
        validate(value) {
            if (!Validation.validate([Array, Validation.isTagString], value)) {
                throw new Error(
                    `modifierTags must be an array of valid tag names.`,
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
        // Defaults to the same as the defaultKindSortOrder in sort.ts
        defaultValue: [
            ReflectionKind.Reference,
            // project is never a child so never added to a group
            ReflectionKind.Module,
            ReflectionKind.Namespace,
            ReflectionKind.Enum,
            ReflectionKind.EnumMember,
            ReflectionKind.Class,
            ReflectionKind.Interface,
            ReflectionKind.TypeAlias,

            ReflectionKind.Constructor,
            ReflectionKind.Property,
            ReflectionKind.Variable,
            ReflectionKind.Function,
            ReflectionKind.Accessor,
            ReflectionKind.Method,

            // others are never added to groups
        ].map(ReflectionKind.pluralString),
    });
    options.addDeclaration({
        name: "sort",
        help: (i18n) => i18n.help_sort(),
        type: ParameterType.Array,
        defaultValue: ["kind", "instance-first", "alphabetical"],
        validate(value) {
            const invalid = new Set(value);
            for (const v of SORT_STRATEGIES) {
                invalid.delete(v);
            }

            if (invalid.size !== 0) {
                throw new Error(
                    `sort may only specify known values, and invalid values were provided (${Array.from(
                        invalid,
                    ).join(
                        ", ",
                    )}). The valid sort strategies are:\n${SORT_STRATEGIES.join(
                        ", ",
                    )}`,
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
        validate(value) {
            const invalid = new Set(value);
            const valid = getEnumKeys(ReflectionKind);
            for (const v of valid) {
                invalid.delete(v);
            }

            if (invalid.size !== 0) {
                throw new Error(
                    `kindSortOrder may only specify known values, and invalid values were provided (${Array.from(
                        invalid,
                    ).join(", ")}). The valid kinds are:\n${valid.join(", ")}`,
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
        validate(values) {
            // this is good enough because the values of the ReflectionKind enum are all numbers
            const validValues = getEnumKeys(ReflectionKind);

            for (const kind of values) {
                if (!validValues.includes(kind)) {
                    throw new Error(
                        `'${kind}' is an invalid value for 'requiredToBeDocumented'. Must be one of: ${validValues.join(
                            ", ",
                        )}`,
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
