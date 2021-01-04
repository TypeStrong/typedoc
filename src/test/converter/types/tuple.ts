export type NamedTuple = [name: string, optionalName?: number];

export const namedTuple = returnMapped<NamedTuple>();

// Helper to force TS to give us types, rather than type nodes, for a given declaration.
function returnMapped<T>() {
    return ({} as any) as { [K in keyof T]: T[K] };
}

export function gh1449<T extends [foo: any, bar?: any]>(a: T): T {
    return a;
}
