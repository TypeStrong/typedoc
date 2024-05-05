export interface StrIndex {
    [x: string]: 1;
}

export interface NumIndex {
    [x: number]: 1;
}

export interface BothIndex {
    /** Number index */
    [x: number]: 1;
    /** String index */
    [x: string]: 1 | 2;
}

export type TypeIndex = { [x: string]: 1 };
