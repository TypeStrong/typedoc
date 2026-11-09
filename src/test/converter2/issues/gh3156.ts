export function pick<T extends object, K extends keyof T>(value: T, key: K): T[K] {
    return value[key];
}

export const arrow = <T, K extends keyof T>(value: T, key: K): T[K] => value[key];

export function sub<T extends string, U extends T>(value: U): U {
    return value;
}

export class C<T, K extends keyof T> {
    m<U extends T, V extends keyof U>(value: U, key: V): U[V] {
        return value[key];
    }
}

export class Derived extends C<string, "length"> {}
