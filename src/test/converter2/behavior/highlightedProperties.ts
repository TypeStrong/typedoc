export type MyOptions = {
    a: number;
};

/**
 * @param options Param comment
 * @param options.a Highlighted prop
 * @param options.c does not exist
 */
export function fn1(options: MyOptions) {}

type NotExported = {
    a: number;
};

/**
 * @param options Param comment
 * @param options.a Highlighted prop
 * @param options.c does not exist
 */
export function fn2(options: NotExported) {}

export interface InterfaceRef {
    a: string;
}

/**
 * @param options Param comment
 * @param options.a Highlighted prop
 * @param options.c does not exist
 */
export function fn3(options: InterfaceRef) {}
