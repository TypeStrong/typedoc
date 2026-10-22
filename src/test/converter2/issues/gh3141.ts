export class Base {}

export function f<
    T extends Base & (abstract new (...args: unknown[]) => unknown),
>(value: T): T {
    return value;
}

export function g<T extends new () => unknown>(value: T): T {
    return value;
}

declare const ctor: abstract new () => object;
export const inferred = ctor;
