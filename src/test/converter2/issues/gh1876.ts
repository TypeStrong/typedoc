/**
 * @param options.min Nested
 */
export function foo(options?: number | { min?: number }): number {
    return 0;
}

/**
 * @param options.min Nested
 */
export function bar(options: { min: number; max: number } | { min: string }) {
    return 0;
}
