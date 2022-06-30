import type * as ts from "typescript";

export function getQualifiedName(checker: ts.TypeChecker, symbol: ts.Symbol) {
    const qualifiedName = checker.getFullyQualifiedName(symbol);
    // I think this is less bad than depending on symbol.parent...
    // https://github.com/microsoft/TypeScript/issues/38344
    // It will break if someone names a directory with a quote in it, but so will lots
    // of other things including other parts of TypeDoc. Until it *actually* breaks someone...
    if (qualifiedName.startsWith('"') && qualifiedName.includes('".')) {
        return qualifiedName.substring(qualifiedName.indexOf('".', 1) + 2);
    } else {
        return qualifiedName;
    }
}
