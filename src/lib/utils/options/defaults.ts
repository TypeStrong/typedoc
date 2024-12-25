/**
 * Defaults values for TypeDoc options
 * @module
 */
import type { BundledLanguage } from "@gerrit0/mini-shiki";
import * as TagDefaults from "./tsdoc-defaults.js";
import type { EnumKeys } from "../enum.js";
import type { ReflectionKind } from "../../models/index.js";

export const excludeNotDocumentedKinds: readonly EnumKeys<
    typeof ReflectionKind
>[] = [
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
];

export const excludeTags: readonly `@${string}`[] = [
    "@override",
    "@virtual",
    "@privateRemarks",
    "@satisfies",
    "@overload",
    "@inline",
];

export const blockTags: readonly `@${string}`[] = TagDefaults.blockTags;
export const inlineTags: readonly `@${string}`[] = TagDefaults.inlineTags;
export const modifierTags: readonly `@${string}`[] = TagDefaults.modifierTags;

export const cascadedModifierTags: readonly `@${string}`[] = [
    "@alpha",
    "@beta",
    "@experimental",
];

export const notRenderedTags: readonly `@${string}`[] = [
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
];

export const highlightLanguages: readonly BundledLanguage[] = [
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
];

export const ignoredHighlightLanguages: readonly string[] = [];

export const sort: readonly string[] = [
    "kind",
    "instance-first",
    "alphabetical-ignoring-documents",
];

export const kindSortOrder: readonly EnumKeys<typeof ReflectionKind>[] = [
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
];

export const requiredToBeDocumented: readonly EnumKeys<
    typeof ReflectionKind
>[] = [
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
];
