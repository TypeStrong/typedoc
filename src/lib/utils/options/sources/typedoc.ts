import type { Options } from "..";
import { LogLevel } from "../../loggers";
import { ParameterType, ParameterHint, EmitStrategy } from "../declaration";
import { BUNDLED_THEMES, Theme } from "shiki";
import { SORT_STRATEGIES } from "../../sort";
import { EntryPointStrategy } from "../../entry-point";
import { ReflectionKind } from "../../../models/reflections";
import { toOrdinal } from "../../ordinal-numbers";

export function addTypeDocOptions(options: Pick<Options, "addDeclaration">) {
    options.addDeclaration({
        type: ParameterType.Path,
        name: "options",
        help: "Specify a json option file that should be loaded. If not specified TypeDoc will look for 'typedoc.json' in the current directory.",
        hint: ParameterHint.File,
        defaultValue: process.cwd(),
    });
    options.addDeclaration({
        type: ParameterType.Path,
        name: "tsconfig",
        help: "Specify a TypeScript config file that should be loaded. If not specified TypeDoc will look for 'tsconfig.json' in the current directory.",
        hint: ParameterHint.File,
        defaultValue: process.cwd(),
    });
    options.addDeclaration({
        name: "entryPoints",
        help: "The entry points of your documentation.",
        type: ParameterType.PathArray,
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
        name: "disableSources",
        help: "Disable setting the source of a reflection when documenting it.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "includes",
        help: "Specify the location to look for included documents (use [[include:FILENAME]] in comments).",
        type: ParameterType.Path,
        hint: ParameterHint.Directory,
    });
    options.addDeclaration({
        name: "media",
        help: "Specify the location with media files that should be copied to the output directory.",
        type: ParameterType.Path,
        hint: ParameterHint.Directory,
    });

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
        name: "emit",
        help: "Specify what TypeDoc should emit, 'docs', 'both', or 'none'.",
        type: ParameterType.Map,
        map: EmitStrategy,
        defaultValue: "docs",
    });

    options.addDeclaration({
        name: "out",
        help: "Specify the location the documentation should be written to.",
        type: ParameterType.Path,
        hint: ParameterHint.Directory,
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
        name: "theme",
        help:
            "Specify the path to the theme that should be used, or 'default' or 'minimal' to use built-in themes. " +
            "Note: Not resolved according to the config file location, always resolved according to cwd.",
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
                        ", "
                    )}`
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
                        ", "
                    )}`
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
        name: "name",
        help: "Set the name of the project that will be used in the header of the template.",
    });
    options.addDeclaration({
        name: "includeVersion",
        help: "Add the package version to the project name.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "excludeTags",
        help: "Remove the listed tags from doc comments.",
        type: ParameterType.Array,
    });
    options.addDeclaration({
        name: "readme",
        help: "Path to the readme file that should be displayed on the index page. Pass `none` to disable the index page and start the documentation on the globals page.",
        type: ParameterType.Path,
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
        name: "categorizeByGroup",
        help: "Specify whether categorization will be done at the group level.",
        type: ParameterType.Boolean,
        defaultValue: true,
    });
    options.addDeclaration({
        name: "cname",
        help: "Set the CNAME file text, it's useful for custom domains on GitHub Pages.",
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
                        invalid
                    ).join(
                        ", "
                    )}). The valid sort strategies are:\n${SORT_STRATEGIES.join(
                        ", "
                    )}`
                );
            }
        },
    });
    options.addDeclaration({
        name: "gitRevision",
        help: "Use specified revision instead of the last revision for linking to GitHub/Bitbucket source files.",
    });
    options.addDeclaration({
        name: "gitRemote",
        help: "Use the specified remote for linking to GitHub/Bitbucket source files.",
        defaultValue: "origin",
    });
    options.addDeclaration({
        name: "gaID",
        help: "Set the Google Analytics tracking ID and activate tracking code.",
    });
    options.addDeclaration({
        name: "gaSite",
        help: "Set the site name for Google Analytics. Defaults to `auto`.",
        defaultValue: "auto",
    });
    options.addDeclaration({
        name: "githubPages",
        help: "Generate a .nojekyll file to prevent 404 errors in GitHub Pages. Defaults to `true`.",
        type: ParameterType.Boolean,
        defaultValue: true,
    });
    options.addDeclaration({
        name: "hideGenerator",
        help: "Do not print the TypeDoc link at the end of the page.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "hideLegend",
        help: "Do not print the Legend for icons at the end of the page.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "cleanOutputDir",
        help: "If set, TypeDoc will remove the output directory before writing output.",
        type: ParameterType.Boolean,
        defaultValue: true,
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
        help: "Specify the npm plugins that should be loaded. Omit to load all installed plugins, set to 'none' to load no plugins.",
        type: ParameterType.ModuleArray,
    });
    options.addDeclaration({
        name: "logger",
        help: "Specify the logger that should be used, 'none' or 'console'.",
        defaultValue: "console",
        type: ParameterType.Mixed,
    });
    options.addDeclaration({
        name: "logLevel",
        help: "Specify what level of logging should be used.",
        type: ParameterType.Map,
        map: LogLevel,
        defaultValue: LogLevel.Info,
    });
    options.addDeclaration({
        name: "markedOptions",
        help: "Specify the options passed to Marked, the Markdown parser used by TypeDoc.",
        type: ParameterType.Mixed,
        validate(value) {
            if (
                typeof value !== "object" ||
                Array.isArray(value) ||
                value == null
            ) {
                throw new Error(
                    "The 'markedOptions' option must be a non-array object."
                );
            }
        },
    });

    options.addDeclaration({
        name: "treatWarningsAsErrors",
        help: "If set, warnings will be treated as errors.",
        type: ParameterType.Boolean,
    });
    options.addDeclaration({
        name: "listInvalidSymbolLinks",
        help: "Emit a list of broken symbol {@link navigation} links after documentation generation, DEPRECATED, prefer validation.invalidLink instead.",
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
            const validValues = Object.values(ReflectionKind)
                // this is good enough because the values of the ReflectionKind enum are all numbers
                .filter((v) => typeof v === "string")
                .join(", ");
            for (
                let i = 0, kind = values[i];
                i < values.length;
                i += 1, kind = values[i]
            ) {
                if (!(kind in ReflectionKind)) {
                    throw new Error(
                        `The ${toOrdinal(
                            i + 1
                        )} 'requiredToBeDocumented' value is invalid. Must be one of: ${validValues}`
                    );
                }
            }
        },
        defaultValue: [
            "Enum",
            "EnumMember",
            "Variable",
            "Function",
            "Class",
            "Interface",
            "Property",
            "Method",
            "GetSignature",
            "SetSignature",
            "TypeAlias",
        ],
    });

    options.addDeclaration({
        name: "validation",
        help: "Specify which validation steps TypeDoc should perform on your generated documentation.",
        type: ParameterType.Flags,
        defaults: {
            notExported: true,
            invalidLink: false,
            notDocumented: false,
        },
    });
}
