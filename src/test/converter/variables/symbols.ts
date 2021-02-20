export const UNIQUE_SYMBOL = Symbol();

export interface ComputedUniqueName {
    // GH#1514
    [UNIQUE_SYMBOL]: string;
}
