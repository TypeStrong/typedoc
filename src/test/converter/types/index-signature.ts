export interface SymbolIndex {
    [sym: symbol]: unknown;
}

export interface PartialIndex {
    [optName: `data-${string}`]: unknown;
}

export interface UnionIndex {
    [optName: string | symbol]: unknown;
    [numName: number]: string;
}

export interface ReadonlyIndex {
    readonly [x: string]: string;
}

declare const symbolMethodName: symbol;
declare const symbolPropertyName: symbol;

export class A {
    [symbolMethodName]() {
        return 1;
    }
    [symbolPropertyName]() {
        return "x";
    }
}
