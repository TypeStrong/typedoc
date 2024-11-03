import type { BundledLanguage } from "shiki" with { "resolution-mode": "import" };
import * as TagDefaults from "./tsdoc-defaults.js";
import type { EnumKeys } from "../enum.js";
import type { ReflectionKind } from "../../models/index.js";

/**
 * Default values for TypeDoc options. This object should not be modified.
 *
 * @privateRemarks
 * These are declared here, rather than within the option declaration, so that
 * they can be exposed as a part of the public API. The unfortunate type declaration
 * is to control the type which appears in the generated documentation.
 */
export const OptionDefaults: {
    excludeNotDocumentedKinds: readonly EnumKeys<typeof ReflectionKind>[];
    excludeTags: readonly `@${string}`[];
    blockTags: readonly `@${string}`[];
    inlineTags: readonly `@${string}`[];
    modifierTags: readonly `@${string}`[];
    cascadedModifierTags: readonly `@${string}`[];
    notRenderedTags: readonly `@${string}`[];
    highlightLanguages: readonly BundledLanguage[];
    sort: readonly string[];
    kindSortOrder: readonly EnumKeys<typeof ReflectionKind>[];
    requiredToBeDocumented: readonly EnumKeys<typeof ReflectionKind>[];
} = {
    excludeNotDocumentedKinds: [
        "Module",
        "Namespace",
        "Enum",
        // Not including enum member here by default
        "Variable",
        "Function",
        "Class",
        "Interface",
        "Constructor",
        "Property",
        "Method",
        "CallSignature",
        "IndexSignature",
        "ConstructorSignature",
        "Accessor",
        "GetSignature",
        "SetSignature",
        "TypeAlias",
        "Reference",
    ],
    excludeTags: [
        "@override",
        "@virtual",
        "@privateRemarks",
        "@satisfies",
        "@overload",
        "@inline",
    ],
    blockTags: TagDefaults.blockTags,
    inlineTags: TagDefaults.inlineTags,
    modifierTags: TagDefaults.modifierTags,
    cascadedModifierTags: ["@alpha", "@beta", "@experimental"],
    notRenderedTags: [
        "@showCategories",
        "@showGroups",
        "@hideCategories",
        "@hideGroups",
        "@expand",
        "@summary",
        "@group",
        "@groupDescription",
        "@category",
        "@categoryDescription",
    ],
    highlightLanguages: [
        "bash",
        "console",
        "css",
        "html",
        "javascript",
        "json",
        "jsonc",
        "json5",
        "yaml",
        "tsx",
        "typescript",
    ],
    sort: ["kind", "instance-first", "alphabetical-ignoring-documents"],
    kindSortOrder: [
        "Document",
        "Project",
        "Module",
        "Namespace",
        "Enum",
        "EnumMember",
        "Class",
        "Interface",
        "TypeAlias",

        "Constructor",
        "Property",
        "Variable",
        "Function",
        "Accessor",
        "Method",

        "Reference",
    ],
    requiredToBeDocumented: [
        "Enum",
        "EnumMember",
        "Variable",
        "Function",
        "Class",
        "Interface",
        "Property",
        "Method",
        "Accessor",
        "TypeAlias",
    ],
};
