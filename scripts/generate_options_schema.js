//@ts-check

require("ts-node/register");

const { writeFileSync } = require("fs");
const { addTypeDocOptions } = require("../src/lib/utils/options/sources");
const { ParameterType } = require("../src");
const {
    Internationalization,
} = require("../src/lib/internationalization/internationalization");

const IGNORED_OPTIONS = new Set(["help", "version"]);

const IGNORED_DEFAULT_OPTIONS = new Set(["options", "tsconfig"]);

const schema = {
    $schema: "https://json-schema.org/draft-07/schema",
    title: "JSON Schema for typedoc.json",
    type: "object",
    properties: {},
    allowTrailingCommas: true,
};

const i18n = new Internationalization(null).proxy;

addTypeDocOptions({
    /** @param {import("../src").DeclarationOption} option */
    addDeclaration(option) {
        if (IGNORED_OPTIONS.has(option.name)) return;

        const data = {
            description: option.help(i18n),
        };

        const type = option.type ?? ParameterType.String;
        switch (type) {
            case ParameterType.Array:
            case ParameterType.GlobArray:
            case ParameterType.PathArray:
            case ParameterType.ModuleArray:
                data.type = "array";
                data.items = { type: "string" };
                data.default =
                    /** @type {import("../src").ArrayDeclarationOption} */ (
                        option
                    ).defaultValue ?? [];
                break;
            case ParameterType.String:
            case ParameterType.Path:
                data.type = "string";
                if (!IGNORED_DEFAULT_OPTIONS.has(option.name)) {
                    data.default =
                        /** @type {import("../src").StringDeclarationOption} */ (
                            option
                        ).defaultValue ?? "";
                }
                break;
            case ParameterType.Boolean:
                data.type = "boolean";
                data.default =
                    /** @type {import("../src").BooleanDeclarationOption} */ (
                        option
                    ).defaultValue ?? false;
                break;
            case ParameterType.Number: {
                const decl =
                    /** @type {import("../src").NumberDeclarationOption} */ (
                        option
                    );
                data.type = "number";
                data.default = decl.defaultValue ?? 0;
                data.maximum = decl.maxValue;
                data.minimum = decl.minValue;
                break;
            }
            case ParameterType.Map: {
                const map =
                    /** @type {import("../src").MapDeclarationOption} */ (
                        option
                    ).map;
                data.enum =
                    map instanceof Map
                        ? [...map.values()]
                        : Object.keys(map)
                              .filter((key) => isNaN(+key))
                              .map((key) =>
                                  typeof map[key] === "number" ? key : map[key],
                              );
                data.default =
                    /** @type {import("../src").MapDeclarationOption} */ (
                        option
                    ).defaultValue;
                if (!data.enum.includes(data.default)) {
                    for (const [k, v] of map instanceof Map
                        ? map
                        : Object.entries(map)) {
                        if (v === data.default) {
                            data.default = k;
                            break;
                        }
                    }
                }
                break;
            }
            case ParameterType.Flags: {
                const flagsObj = {
                    type: "object",
                    properties: {},
                };
                const defaults =
                    /** @type {import("../src").FlagsDeclarationOption<Record<string, boolean>>} */ (
                        option
                    ).defaults;

                for (const key of Object.keys(defaults)) {
                    flagsObj.properties[key] = {
                        type: "boolean",
                    };
                }
                flagsObj.additionalProperties = false;
                data.anyOf = [{ type: "boolean" }, flagsObj];
                data.default = defaults;
            }
            case ParameterType.Mixed:
            case ParameterType.Object:
                data.default =
                    /** @type {import("../src").MixedDeclarationOption} */ (
                        option
                    ).defaultValue;
                break;

            default:
                /** @type {never} */
                let _unused = type;
        }

        schema.properties[option.name] = data;
    },
});

schema.properties.visibilityFilters.type = "object";
schema.properties.visibilityFilters.properties = Object.fromEntries(
    Object.keys(schema.properties.visibilityFilters.default).map((x) => [
        x,
        { type: "boolean" },
    ]),
);
schema.properties.visibilityFilters.patternProperties = {
    "^@": { type: "boolean" },
};
schema.properties.visibilityFilters.additionalProperties = false;

schema.properties.compilerOptions.type = "object";
schema.properties.compilerOptions.markedOptions = "object";

schema.properties.extends = {
    type: "array",
    items: { type: "string" },
};

delete schema.properties.sort.items.type;
schema.properties.sort.items.enum =
    require("../src/lib/utils/sort").SORT_STRATEGIES;

const output = JSON.stringify(schema, null, "\t");

if (process.argv.length > 2) {
    writeFileSync(process.argv[2], output);
} else {
    console.log(output);
}
