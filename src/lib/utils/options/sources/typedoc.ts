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
        help: "Specify a json option file that should be loaded. If not specified TypeDoc will look for 'typedoc.json' in the current directory.",
        hint: ParameterHint.File,
        defaultValue: "",
    });
    options.addDeclaration({
        type: ParameterType.Path,
        name: "tsconfig",
        help: "Specify a TypeScript config file that should be loaded. If not specified TypeDoc will look for 'tsconfig.json' in the current directory.",
        hint: ParameterHint.File,
        defaultValue: "",
    });
    options.addDeclaration({
        name: "compilerOptions",
        help: "Selectively override the TypeScript compiler options used by TypeDoc.",
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
        help: "The entry points of your documentation.",
        type: ParameterType.GlobArray,
    });
    options.addDeclaration({
        name: "entryPointStrategy",
        help: "The strategy to be used to convert entry points into documentation modules.",
        type: ParameterType.Map,
        map: EntryPointStrategy,
        defaultValue: EntryPointStrategy.Resolve,
    });

    options.addDeclaration({
        name: "exclude",
        help: "Define patterns to be excluded when expanding a directory that was specified as an entry point.",
        type: ParameterType.GlobArray,
    });
    options.addDeclaration({
        name: "externalPattern",
        help: "Define patterns for files that should be considered being external.",
        type: ParameterType.GlobArray,
        defaultValue: ["**/node_modules/**"],
    });
    options.addDeclaration({
        name: "excludeExternals",
        help: "Prevent externally resolved symbols from being documented.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "excludeNotDocumented",
        help: "Prevent symbols that are not explicitly documented from appearing in the results.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "excludeNotDocumentedKinds",
        help: "Specify the type of reflections that can be removed by excludeNotDocumented.",
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
        help: "Prevent symbols that are marked with @internal from being documented.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "excludePrivate",
        help: "Ignore private variables and methods.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "excludeProtected",
        help: "Ignore protected variables and methods.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "excludeReferences",
        help: "If a symbol is exported multiple times, ignore all but the first export.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "externalSymbolLinkMappings",
        help: "Define custom links for symbols not included in the documentation.",
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
        help: "Specify the location with media files that should be copied to the output directory.",
        type: ParameterType.Path,
        hint: ParameterHint.Directory,
    });
    options.addDeclaration({
        name: "includes",
        help: "Specify the location to look for included documents (use [[include:FILENAME]] in comments).",
        type: ParameterType.Path,
        hint: ParameterHint.Directory,
    });

    ///////////////////////////
    ///// Output Options //////
    ///////////////////////////

    options.addDeclaration({
        name: "out",
        help: "Specify the location the documentation should be written to.",
        type: ParameterType.Path,
        hint: ParameterHint.Directory,
        defaultValue: "./docs",
    });
    options.addDeclaration({
        name: "json",
        help: "Specify the location and filename a JSON file describing the project is written to.",
        type: ParameterType.Path,
        hint: ParameterHint.File,
    });
    options.addDeclaration({
        name: "pretty",
        help: "Specify whether the output JSON should be formatted with tabs.",
        type: ParameterType.Boolean,
        defaultValue: true,
    });
    options.addDeclaration({
        name: "emit",
        help: "Specify what TypeDoc should emit, 'docs', 'both', or 'none'.",
        type: ParameterType.Map,
        map: EmitStrategy,
        defaultValue: "docs",
    });
    options.addDeclaration({
        name: "theme",
        help: "Specify the theme name to render the documentation with",
        type: ParameterType.String,
        defaultValue: "default",
    });

    const defaultLightTheme: Theme = "light-plus";
    const defaultDarkTheme: Theme = "dark-plus";

    options.addDeclaration({
        name: "lightHighlightTheme",
        help: "Specify the code highlighting theme in light mode.",
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
        help: "Specify the code highlighting theme in dark mode.",
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
        help: "Path to a custom CSS file to for the theme to import.",
        type: ParameterType.Path,
    });
    options.addDeclaration({
        name: "markedOptions",
        help: "Specify the options passed to Marked, the Markdown parser used by TypeDoc.",
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
        help: "Set the name of the project that will be used in the header of the template.",
    });
    options.addDeclaration({
        name: "includeVersion",
        help: "Add the package version to the project name.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "disableSources",
        help: "Disable setting the source of a reflection when documenting it.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "basePath",
        help: "Specifies the base path to be used when displaying file paths.",
        type: ParameterType.Path,
    });
    options.addDeclaration({
        name: "excludeTags",
        help: "Remove the listed block/modifier tags from doc comments.",
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
        help: "Path to the readme file that should be displayed on the index page. Pass `none` to disable the index page and start the documentation on the globals page.",
        type: ParameterType.Path,
    });
    options.addDeclaration({
        name: "stripYamlFrontmatter",
        help: "Strip YAML frontmatter from markdown files.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "cname",
        help: "Set the CNAME file text, it's useful for custom domains on GitHub Pages.",
    });
    options.addDeclaration({
        name: "sourceLinkTemplate",
        help: "Specify a link template to be used when generating source urls. If not set, will be automatically created using the git remote. Supports {path}, {line}, {gitRevision} placeholders.",
    });
    options.addDeclaration({
        name: "disableGit",
        help: "Assume that all can be linked to with the sourceLinkTemplate, sourceLinkTemplate must be set if this is enabled. {path} will be rooted at basePath",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "gitRevision",
        help: "Use specified revision instead of the last revision for linking to GitHub/Bitbucket source files. Has no effect if disableSources is set.",
    });
    options.addDeclaration({
        name: "gitRemote",
        help: "Use the specified remote for linking to GitHub/Bitbucket source files. Has no effect if disableGit or disableSources is set.",
        defaultValue: "origin",
    });
    options.addDeclaration({
        name: "githubPages",
        help: "Generate a .nojekyll file to prevent 404 errors in GitHub Pages. Defaults to `true`.",
        type: ParameterType.Boolean,
        defaultValue: true,
    });
    options.addDeclaration({
        name: "htmlLang",
        help: "Sets the lang attribute in the generated html tag.",
        type: ParameterType.String,
        defaultValue: "en",
    });
    options.addDeclaration({
        name: "gaID",
        help: "Set the Google Analytics tracking ID and activate tracking code.",
    });
    options.addDeclaration({
        name: "hideGenerator",
        help: "Do not print the TypeDoc link at the end of the page.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "hideParameterTypesInTitle",
        help: "Hides parameter types in signature titles for easier scanning.",
        type: ParameterType.Boolean,
        defaultValue: true,
    });
    options.addDeclaration({
        name: "cacheBust",
        help: "Include the generation time in links to static assets.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "searchInComments",
        help: "If set, the search index will also include comments. This will greatly increase the size of the search index.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "cleanOutputDir",
        help: "If set, TypeDoc will remove the output directory before writing output.",
        type: ParameterType.Boolean,
        defaultValue: true,
    });
    options.addDeclaration({
        name: "titleLink",
        help: "Set the link the title in the header points to. Defaults to the documentation homepage.",
        type: ParameterType.String,
    });
    options.addDeclaration({
        name: "navigationLinks",
        help: "Defines links to be included in the header.",
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
        help: "Defines links to be included in the sidebar.",
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
        name: "navigation",
        help: "Determines how the navigation sidebar is organized.",
        type: ParameterType.Flags,
        defaults: {
            includeCategories: false,
            includeGroups: false,
            fullTree: false,
        },
    });

    options.addDeclaration({
        name: "visibilityFilters",
        help: "Specify the default visibility for builtin filters and additional filters according to modifier tags.",
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
        help: "Configure search to give a relevance boost to selected categories",
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
        help: 'Configure search to give a relevance boost to selected kinds (eg "class")',
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
        help: "Sets compatibility options for comment parsing that increase similarity with JSDoc comments.",
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
        help: "Determines how TypeDoc searches for comments.",
        type: ParameterType.Map,
        map: CommentStyle,
        defaultValue: CommentStyle.JSDoc,
    });

    options.addDeclaration({
        name: "useTsLinkResolution",
        help: "Use TypeScript's link resolution when determining where @link tags point. This only applies to JSDoc style comments.",
        type: ParameterType.Boolean,
        defaultValue: true,
    });
    options.addDeclaration({
        name: "preserveLinkText",
        help: "If set, @link tags without link text will use the text content as the link. If not set, will use the target reflection name.",
        type: ParameterType.Boolean,
        defaultValue: true,
    });

    options.addDeclaration({
        name: "blockTags",
        help: "Block tags which TypeDoc should recognize when parsing comments.",
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
        help: "Inline tags which TypeDoc should recognize when parsing comments.",
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
        help: "Modifier tags which TypeDoc should recognize when parsing comments.",
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
        help: "Specify whether categorization will be done at the group level.",
        type: ParameterType.Boolean,
        defaultValue: false,
    });
    options.addDeclaration({
        name: "defaultCategory",
        help: "Specify the default category for reflections without a category.",
        defaultValue: "Other",
    });
    options.addDeclaration({
        name: "categoryOrder",
        help: "Specify the order in which categories appear. * indicates the relative order for categories not in the list.",
        type: ParameterType.Array,
    });
    options.addDeclaration({
        name: "groupOrder",
        help: "Specify the order in which groups appear. * indicates the relative order for groups not in the list.",
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
        help: "Specify the sort strategy for documented values.",
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
        name: "kindSortOrder",
        help: "Specify the sort order for reflections when 'kind' is specified.",
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
        help: "Watch files for changes and rebuild docs on change.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "preserveWatchOutput",
        help: "If set, TypeDoc will not clear the screen between compilation runs.",
        type: ParameterType.Boolean,
    });

    options.addDeclaration({
        name: "skipErrorChecking",
        help: "Do not run TypeScript's type checking before generating docs.",
        type: ParameterType.Boolean,
        defaultValue: false,
    });
    options.addDeclaration({
        name: "help",
        help: "Print this message.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "version",
        help: "Print TypeDoc's version.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "showConfig",
        help: "Print the resolved configuration and exit.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "plugin",
        help: "Specify the npm plugins that should be loaded. Omit to load all installed plugins.",
        type: ParameterType.ModuleArray,
    });
    options.addDeclaration({
        name: "logLevel",
        help: "Specify what level of logging should be used.",
        type: ParameterType.Map,
        map: LogLevel,
        defaultValue: LogLevel.Info,
    });

    options.addDeclaration({
        name: "treatWarningsAsErrors",
        help: "If set, all warnings will be treated as errors.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "treatValidationWarningsAsErrors",
        help: "If set, warnings emitted during validation will be treated as errors. This option cannot be used to disable treatWarningsAsErrors for validation warnings.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "intentionallyNotExported",
        help: "A list of types which should not produce 'referenced but not documented' warnings.",
        type: ParameterType.Array,
    });
    options.addDeclaration({
        name: "requiredToBeDocumented",
        help: "A list of reflection kinds that must be documented",
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
        help: "Specify which validation steps TypeDoc should perform on your generated documentation.",
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
