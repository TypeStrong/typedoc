export type PartiallyNamedTuple = [name: string, number];

export type PartiallyNamedTuple2 = [name?: string, number?];

export type PartiallyNamedTupleRest = [name?: string, ...number[]];

export const partiallyNamedTupleRest = {} as any as [
    name?: string,
    ...number[],
];
