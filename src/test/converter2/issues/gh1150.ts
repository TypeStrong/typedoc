/**
 * Conditional type with infer
 */
export type PopFront<T extends any[]> = ((...args: T) => any) extends (
    a: any,
    ...r: infer R
) => any
    ? R
    : never;

export type IntersectFirst<T extends any[], R = {}> = {
    0: R;
    1: IntersectFirst<
        PopFront<T>,
        {
            [K in keyof R | keyof T[0]]: K extends keyof R ? R[K] : T[0][K];
        }
    >;
}[T["length"] extends 0 ? 0 : 1];
