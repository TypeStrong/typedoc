/**
 * Module which handles sorting reflections according to a user specified strategy.
 * @module
 */

import { ReflectionKind } from "../models/kind.js";
import type { DeclarationReflection } from "../models/DeclarationReflection.js";
import type { Options } from "./options/index.js";
import type { DocumentReflection } from "../models/index.js";
import * as OptionDefaults from "./options/defaults.js";

export const SORT_STRATEGIES = [
    "source-order",
    "alphabetical",
    "alphabetical-ignoring-documents",
    "enum-value-ascending",
    "enum-value-descending",
    "enum-member-source-order",
    "static-first",
    "instance-first",
    "visibility",
    "required-first",
    "kind",
    "external-last",
    "documents-first",
    "documents-last",
] as const;

export type SortStrategy = (typeof SORT_STRATEGIES)[number];

// Return true if a < b
const sorts: Record<
    SortStrategy,
    (
        a: DeclarationReflection | DocumentReflection,
        b: DeclarationReflection | DocumentReflection,
        data: { kindSortOrder: ReflectionKind[] },
    ) => boolean
> = {
    "source-order"(a, b) {
        // This is going to be somewhat ambiguous. No way around that. Treat the first
        // declaration of a symbol as its ordering declaration.
        const aSymbol = a.project.getSymbolIdFromReflection(a);
        const bSymbol = b.project.getSymbolIdFromReflection(b);

        if (aSymbol && bSymbol) {
            if (aSymbol.packageName < bSymbol.packageName) {
                return true;
            }
            if (
                aSymbol.packageName === bSymbol.packageName &&
                aSymbol.packagePath < bSymbol.packagePath
            ) {
                return true;
            }
            if (
                aSymbol.packageName === bSymbol.packageName &&
                aSymbol.packagePath === bSymbol.packagePath &&
                aSymbol.pos < bSymbol.pos
            ) {
                return true;
            }

            return false;
        }

        // Someone is doing something weird. Fail to re-order. This could happen if someone
        // tries to sort with a reflection that has been removed from the project.
        return false;
    },
    alphabetical(a, b) {
        return a.name.localeCompare(b.name) < 0;
    },
    "alphabetical-ignoring-documents"(a, b) {
        if (
            a.kindOf(ReflectionKind.Document) ||
            b.kindOf(ReflectionKind.Document)
        ) {
            return false;
        }
        return a.name.localeCompare(b.name) < 0;
    },
    "enum-value-ascending"(a, b) {
        if (
            a.kind == ReflectionKind.EnumMember &&
            b.kind == ReflectionKind.EnumMember
        ) {
            const aRefl = a as DeclarationReflection;
            const bRefl = b as DeclarationReflection;

            const aValue = aRefl.type?.type === "literal" ? aRefl.type.value : -Infinity;
            const bValue = bRefl.type?.type === "literal" ? bRefl.type.value : -Infinity;

            return aValue! < bValue!;
        }
        return false;
    },
    "enum-value-descending"(a, b) {
        if (
            a.kind == ReflectionKind.EnumMember &&
            b.kind == ReflectionKind.EnumMember
        ) {
            const aRefl = a as DeclarationReflection;
            const bRefl = b as DeclarationReflection;

            const aValue = aRefl.type?.type === "literal" ? aRefl.type.value : -Infinity;
            const bValue = bRefl.type?.type === "literal" ? bRefl.type.value : -Infinity;

            return bValue! < aValue!;
        }
        return false;
    },
    "enum-member-source-order"(a, b, data) {
        if (
            a.kind === ReflectionKind.EnumMember &&
            b.kind === ReflectionKind.EnumMember
        ) {
            return sorts["source-order"](a, b, data);
        }
        return false;
    },
    "static-first"(a, b) {
        return a.flags.isStatic && !b.flags.isStatic;
    },
    "instance-first"(a, b) {
        return !a.flags.isStatic && b.flags.isStatic;
    },
    visibility(a, b) {
        // Note: flags.isPublic may not be set on public members. It will only be set
        // if the user explicitly marks members as public. Therefore, we can't use it
        // here to get a reliable sort order.
        if (a.flags.isPrivate) {
            return false; // Not sorted before anything
        }
        if (a.flags.isProtected) {
            return b.flags.isPrivate; // Sorted before privates
        }
        if (b.flags.isPrivate || b.flags.isProtected) {
            return true; // We are public, sort before b if b is less visible
        }
        return false;
    },
    "required-first"(a, b) {
        return !a.flags.isOptional && b.flags.isOptional;
    },
    kind(a, b, { kindSortOrder }) {
        return kindSortOrder.indexOf(a.kind) < kindSortOrder.indexOf(b.kind);
    },
    "external-last"(a, b) {
        return !a.flags.isExternal && b.flags.isExternal;
    },
    "documents-first"(a, b) {
        return (
            a.kindOf(ReflectionKind.Document) &&
            !b.kindOf(ReflectionKind.Document)
        );
    },
    "documents-last"(a, b) {
        return (
            !a.kindOf(ReflectionKind.Document) &&
            b.kindOf(ReflectionKind.Document)
        );
    },
};

export function isValidSortStrategy(strategy: string): strategy is SortStrategy {
    return SORT_STRATEGIES.includes(strategy as never);
}

export function getSortFunction(opts: Options, strategies: readonly SortStrategy[] = opts.getValue("sort")) {
    const kindSortOrder = opts
        .getValue("kindSortOrder")
        .map((k) => ReflectionKind[k]);

    for (const kind of OptionDefaults.kindSortOrder) {
        if (!kindSortOrder.includes(ReflectionKind[kind])) {
            kindSortOrder.push(ReflectionKind[kind]);
        }
    }

    const data = { kindSortOrder };

    return function sortReflections(
        reflections: (DeclarationReflection | DocumentReflection)[],
    ) {
        reflections.sort((a, b) => {
            for (const s of strategies) {
                if (sorts[s](a, b, data)) {
                    return -1;
                }
                if (sorts[s](b, a, data)) {
                    return 1;
                }
            }
            return 0;
        });
    };
}
