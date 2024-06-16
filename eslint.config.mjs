// @ts-check
import eslint from "@eslint/js";
import tslint from "typescript-eslint";

/** @type {import("typescript-eslint").ConfigWithExtends} */
const config = {
    languageOptions: {
        parserOptions: {
            project: true,
            tsconfigRootDir: import.meta.dirname,
        },
    },
    rules: {
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/consistent-type-imports": [
            "error",
            {
                fixStyle: "inline-type-imports",
                prefer: "type-imports",
                disallowTypeAnnotations: false,
            },
        ],

        "@typescript-eslint/restrict-template-expressions": [
            "error",
            {
                allowBoolean: true,
                allowNumber: true,
            },
        ],

        // This one is just annoying since it complains at incomplete code
        "no-empty": "off",

        // Doesn't properly handle intersections of generics.
        "@typescript-eslint/unified-signatures": "off",

        // This rule is factually incorrect. Interfaces which extend some type alias can be used to introduce
        // new type names. This is useful particularly when dealing with mixins.
        "@typescript-eslint/no-empty-interface": "off",

        // Conflicts with TS option to require dynamic access for records, which I find more useful.
        "@typescript-eslint/no-dynamic-delete": "off",

        // Conflicts with the `NeverIfInternal` type used to enforce a stricter API internally
        "@typescript-eslint/no-redundant-type-constituents": "off",
        "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",

        // This is sometimes useful for clarity
        "@typescript-eslint/no-unnecessary-type-arguments": "off",

        // We still use `any` fairly frequently...
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",

        // Really annoying, doesn't provide any value.
        "@typescript-eslint/no-empty-function": "off",

        // Declaration merging with a namespace is a necessary tool when working with enums.
        "@typescript-eslint/no-namespace": "off",

        // Reported by TypeScript
        "@typescript-eslint/no-unused-vars": "off",

        "no-console": "warn",

        "@typescript-eslint/no-confusing-void-expression": "off",
        "@typescript-eslint/unbound-method": "off",

        "@typescript-eslint/prefer-literal-enum-member": [
            "error",
            { allowBitwiseExpressions: true },
        ],

        // I'd like to have this turned on, but haven't figured out how to tell it about
        // checks that are correctly linted as unnecessary for TypeDoc's usage, but not
        // for plugin permitted usage.
        "@typescript-eslint/no-unnecessary-condition": "off",

        // Feel free to turn one of these back on and submit a PR!
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",

        "no-restricted-syntax": [
            "warn",
            {
                selector: "ImportDeclaration[source.value=/.*perf$/]",
                message: "Benchmark calls must be removed before committing.",
            },
            {
                selector:
                    "MemberExpression[object.name=type][property.name=symbol]",
                message:
                    "Use type.getSymbol() instead, Type.symbol is not properly typed.",
            },
        ],
    },
};

export default tslint.config(
    eslint.configs.recommended,
    ...tslint.configs.strictTypeChecked,
    config,
    {
        ignores: [
            "eslint.config.mjs",
            "src/test/renderer/specs",
            "dist",
            "docs",
            "tmp",
            "coverage",
            "static/main.js",
            "src/lib/output/themes/default/assets",
            "**/node_modules",
            "example",
            "src/test/converter",
            "src/test/converter2",
            "src/test/module",
            "src/test/packages",
            "src/test/renderer/",
            "src/test/slow/entry-points",
            "scripts",
            "bin",

            // Not long for this world
            "src/test/events.test.ts",
        ],
    },
);
