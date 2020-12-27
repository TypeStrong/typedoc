export interface StrIndex {
    [x: string]: 1;
}

export interface NumIndex {
    [x: number]: 1;
}

// This is broken... but here's a test for the broken behavior so we know when it is fixed.
export interface BothIndex {
    [x: number]: 1;
    [x: string]: 1 | 2;
}

export type TypeIndex = { [x: string]: 1 };
