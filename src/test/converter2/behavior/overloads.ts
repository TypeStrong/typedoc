export function foo(): string;
/**
 * Overrides summary
 */
export function foo(x: string): number;

/**
 * Implementation comment
 * @param x docs for x
 */
export function foo(x?: string): string | number {
    return x == null ? "" : x.length;
}
