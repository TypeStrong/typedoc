export interface NotDoc {
    /** Doc */
    prop: 123;

    notDoc: 456;
}

/** Doc */
export function identity<T>(x: T): T {
    return x;
}
