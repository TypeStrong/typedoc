export class Test {
    method() {}
}

export { Test as Test2 };

/**
 * {@link Test2.method}
 */
export const check = 123;
