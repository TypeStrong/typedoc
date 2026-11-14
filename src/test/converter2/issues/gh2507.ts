export interface Value {
    values: Value[];
}

export function fromPartial<I extends Exact<Value, I>>(object: I): void {
    throw 1;
}

// @ts-expect-error TypeScript 7 reports that I[K] does not satisfy P[K]
export type Exact<P, I extends P> = P extends P ? P & { [K in keyof P]: Exact<P[K], I[K]> } :
    never;
