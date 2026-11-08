export declare function merge<A extends readonly unknown[]>(...args: [...A, number?]): A;
export declare function tail<T extends unknown[]>(...args: [string, ...T]): T;
export interface W<T extends unknown[]> {
    args: [...T, number];
}
