export interface SymbolIndex {
    [sym: symbol]: unknown;
}

export interface PartialIndex {
    [optName: `data-${string}`]: unknown;
}

export interface UnionIndex {
    [optName: string | symbol]: unknown;
}
