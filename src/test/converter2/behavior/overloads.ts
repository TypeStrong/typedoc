/**
 * No arg comment
 * {@label NO_ARGS}
 */
export function foo(): string;
/**
 * {@inheritDoc (foo:NO_ARGS)}
 * {@label WITH_X}
 * @param x docs for x
 */
export function foo(x: string): number;
export function foo(x?: string): string | number {
    return x == null ? "" : x.length;
}
