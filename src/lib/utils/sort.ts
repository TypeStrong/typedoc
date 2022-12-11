/**
 * Module which handles sorting reflections according to a user specified strategy.
 * @module
 */

import { ReflectionKind } from "../models/reflections/kind";
import type { DeclarationReflection } from "../models/reflections/declaration";
import { LiteralType } from "../models/types";
import type { Options } from "./options";

export const SORT_STRATEGIES = [
    "source-order",
    "alphabetical",
    "enum-value-ascending",
    "enum-value-descending",
    "static-first",
    "instance-first",
    "visibility",
    "required-first",
    "kind",
] as const;

export type SortStrategy = typeof SORT_STRATEGIES[number];

const defaultKindSortOrder = [
    ReflectionKind.Reference,
    ReflectionKind.Project,
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
    ReflectionKind.ObjectLiteral,

    ReflectionKind.Parameter,
    ReflectionKind.TypeParameter,
    ReflectionKind.TypeLiteral,
    ReflectionKind.CallSignature,
    ReflectionKind.ConstructorSignature,
    ReflectionKind.IndexSignature,
    ReflectionKind.GetSignature,
    ReflectionKind.SetSignature,
] as const;

// Return true if a < b
const sorts: Record<
    SortStrategy,
    (
        a: DeclarationReflection,
        b: DeclarationReflection,
        data: { kindSortOrder: ReflectionKind[] }
    ) => boolean
> = {
    "source-order"(a, b) {
        const aSymbol = a.project.getSymbolFromReflection(a);
        const bSymbol = b.project.getSymbolFromReflection(b);

        // This is going to be somewhat ambiguous. No way around that. Treat the first
        // declaration of a symbol as its ordering declaration.
        const aDecl = aSymbol?.getDeclarations()?.[0];
        const bDecl = bSymbol?.getDeclarations()?.[0];

        if (aDecl && bDecl) {
            const aFile = aDecl.getSourceFile().fileName;
            const bFile = bDecl.getSourceFile().fileName;
            if (aFile < bFile) {
                return true;
            }
            if (aFile == bFile && aDecl.pos < bDecl.pos) {
                return true;
            }

            return false;
        }

        // Someone is doing something weird. Fail to re-order. This *might* be a bug in TD
        // but it could also be TS having some exported symbol without a declaration.
        return false;
    },
    alphabetical(a, b) {
        return a.name < b.name;
    },
    "enum-value-ascending"(a, b) {
        if (
            a.kind == ReflectionKind.EnumMember &&
            b.kind == ReflectionKind.EnumMember
        ) {
            const aValue =
                a.type instanceof LiteralType ? a.type.value : -Infinity;
            const bValue =
                b.type instanceof LiteralType ? b.type.value : -Infinity;

            return aValue! < bValue!;
        }
        return false;
    },
    "enum-value-descending"(a, b) {
        if (
            a.kind == ReflectionKind.EnumMember &&
            b.kind == ReflectionKind.EnumMember
        ) {
            const aValue =
                a.type instanceof LiteralType ? a.type.value : -Infinity;
            const bValue =
                b.type instanceof LiteralType ? b.type.value : -Infinity;

            return bValue! < aValue!;
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
};

export function getSortFunction(opts: Options) {
    const kindSortOrder = opts
        .getValue("kindSortOrder")
        .map((k) => ReflectionKind[k]);

    for (const kind of defaultKindSortOrder) {
        if (!kindSortOrder.includes(kind)) {
            kindSortOrder.push(kind);
        }
    }

    const strategies = opts.getValue("sort");
    const data = { kindSortOrder };

    return function sortReflections(reflections: DeclarationReflection[]) {
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
