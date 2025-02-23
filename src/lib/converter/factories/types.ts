import ts from "typescript";

import type { Context } from "../context.js";
import { ReferenceType } from "../../models/types.js";
import { findPackageForPath, getQualifiedName } from "#node-utils";
import { createSymbolId } from "./symbol-id.js";

export function createSymbolReference(
    symbol: ts.Symbol,
    context: Context,
    name?: string,
) {
    const ref = ReferenceType.createUnresolvedReference(
        name ?? symbol.name,
        createSymbolId(symbol),
        context.project,
        getQualifiedName(symbol, name ?? symbol.name),
    );
    ref.refersToTypeParameter = !!(
        symbol.flags & ts.SymbolFlags.TypeParameter
    );

    const symbolPath = symbol.declarations?.[0]?.getSourceFile().fileName;
    if (!symbolPath) return ref;

    ref.package = findPackageForPath(symbolPath)?.[0];
    return ref;
}
