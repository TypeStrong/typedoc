//@ts-check

const { writeFileSync } = require("fs");
const { addTypeDocOptions } = require("../dist/lib/utils/options/sources");
const { ParameterType } = require("../dist");

const IGNORED_OPTIONS = new Set(["help", "version"]);

const IGNORED_DEFAULT_OPTIONS = new Set(["options", "tsconfig"]);

const schema = {
    $schema: "https://json-schema.org/draft-07/schema",
    title: "JSON Schema for typedoc.json",
    type: "object",
    properties: {},
};

addTypeDocOptions({
    /** @param {import("../dist").DeclarationOption} option */
    addDeclaration(option) {
        if (IGNORED_OPTIONS.has(option.name)) return;

        const data = {
            description: option.help,
        };

        switch (option.type ?? ParameterType.String) {
            case ParameterType.Array:
                data.type = "array";
                data.items = { type: "string" };
                data.default = option.defaultValue ?? [];
                break;
            case ParameterType.String:
                data.type = "string";
                if (!IGNORED_DEFAULT_OPTIONS.has(option.name)) {
                    data.default = option.defaultValue ?? "";
                }
                break;
            case ParameterType.Boolean:
                data.type = "boolean";
                data.default = option.defaultValue ?? false;
                break;
            case ParameterType.Number: {
                const decl = /** @type {import("../dist").NumberDeclarationOption} */ (option);
                data.type = "number";
                data.default = decl.defaultValue ?? 0;
                data.maximum = decl.maxValue;
                data.minimum = decl.minValue;
                break;
            }
            case ParameterType.Map: {
                const map = /** @type {import("../dist").MapDeclarationOption} */ (option)
                    .map;
                data.enum =
                    map instanceof Map
                        ? [...map.keys()]
                        : Object.keys(map).filter((key) => isNaN(+key));
                data.default = option.defaultValue;
                break;
            }
            case ParameterType.Mixed:
                break; // Nothing to do... TypeDoc really shouldn't have any of these.
        }

        schema.properties[option.name] = data;
    },
});

schema.properties.logger.enum = ["console", "none"];
schema.properties.logger.default = "console";

const output = JSON.stringify(schema, null, "\t");

if (process.argv.length > 2) {
    writeFileSync(process.argv[2], output);
} else {
    console.log(output);
}
