export const UNIQUE_SYMBOL = Symbol();

export interface ComputedUniqueName {
    [UNIQUE_SYMBOL]: string;
}
