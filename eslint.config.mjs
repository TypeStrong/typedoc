// @ts-check
import eslint from "@eslint/js";
import tslint from "typescript-eslint";

/** @type {import("typescript-eslint").ConfigWithExtends} */
const config = {
    languageOptions: {
        parserOptions: {
            project: true,
            tsconfigRootDir: import.meta.dirname,
            // We're fairly frequently on a later version of the TS compiler than
            // is officially supported. So far this has never been a real problem.
            warnOnUnsupportedTypeScriptVersion: false,
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

        // This can probably be turned back on in 0.27, when the component hierarchy goes away
        "@typescript-eslint/no-unsafe-function-type": "off",

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
        "@typescript-eslint/no-empty-object-type": "off",

        // Needed for the locales today, don't want to make every contributor to those turn it off.
        "@typescript-eslint/no-require-imports": [
            "error",
            {
                allow: ["/[^/]+\\.cjs"],
            },
        ],

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

        // https://astexplorer.net/#/gist/82d22728cda8283bf38e956640420af4/4d5e6fbcbceed981f9897a859322ade5f1cb86ee
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
            {
                selector:
                    "ImportDeclaration[source.value=typescript] ImportNamespaceSpecifier",
                message: "TS before 5.7 does not have non-default exports.",
            },
            {
                selector:
                    "ImportDeclaration[source.value=typescript] ImportDeclaration",
                message: "TS before 5.7 does not have non-default exports.",
            },
        ],

        "no-fallthrough": ["error", { allowEmptyCase: true }],
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
            "site/typedoc-plugin-redirect.js",
            "site/site-plugin.js",
            "dist",
            "docs",
            "docs2",
            "docs-site",
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
        ],
    },
);
