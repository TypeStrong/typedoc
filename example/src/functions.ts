/**
 * @module
 * This module demonstrates TypeDoc's support for functions.
 *
 * Use the [`@module`](https://typedoc.org/guides/doccomments/#%40module) tag to
 * tell TypeDoc that a comment block describes the entire module.
 */

/**
 * Calculates the square root of a number.
 * @param x the number do calculate the root of.
 * @returns the square root if `x` is non-negative or `NaN` if `x` is negative.
 */
export function sqrt(x: number): number {
    return Math.sqrt(x);
}
