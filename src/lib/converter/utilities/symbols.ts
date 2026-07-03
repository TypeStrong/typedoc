import ts from "typescript";

export function resolveAliasedSymbol(
    symbol: ts.Symbol,
    checker: ts.TypeChecker,
): ts.Symbol {
    const seen = new Set<ts.Symbol>();
    while (ts.SymbolFlags.Alias & symbol.flags) {
        symbol = checker.getAliasedSymbol(symbol);

        // #2438, with declaration files, we might have an aliased symbol which eventually points to itself.
        if (seen.has(symbol)) return symbol;
        seen.add(symbol);
    }
    return symbol;
}
