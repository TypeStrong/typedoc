import * as ts from "typescript";

export function getQualifiedName(symbol: ts.Symbol, defaultName: string) {
    // Two implementation options for this one:
    // 1. Use the internal symbol.parent, to walk up until we hit a source file symbol (if in a module)
    //    or undefined (if in a global file)
    // 2. Use checker.getFullyQualifiedName and parse out the name from the returned string.
    // The symbol.parent method is easier to check for now.
    let sym: ts.Symbol | undefined = symbol;
    const parts: string[] = [];
    while (sym && !sym.declarations?.some(ts.isSourceFile)) {
        parts.unshift(getHumanName(sym.name));
        sym = sym.parent;
    }

    return parts.join(".") || defaultName;
}

export function getHumanName(name: string) {
    // Unique symbols get a name that will change between runs of the compiler.
    const match = /^__@(.*)@\d+$/.exec(name);
    if (match) {
        return `[${match[1]}]`;
    }

    return name;
}
