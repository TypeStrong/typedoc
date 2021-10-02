/**
 * @module
 * This module demonstrates TypeDoc's support for functions.
 *
 * Use the [`@module`](https://typedoc.org/guides/doccomments/#%40module) tag to
 * tell TypeDoc that a comment block describes the entire module.
 */

/**
 * Calculates the square root of a number.
 * @param x the number to calculate the root of.
 * @returns the square root if `x` is non-negative or `NaN` if `x` is negative.
 */
export function sqrt(x: number): number {
    return Math.sqrt(x);
}

/**
 * Calculates the square root of a number.
 *
 * `sqrtArrowFunction` is defined using a variable declaration:
 *
 * ```
 * export const sqrtArrowFunction = (x: number): number => Math.sqrt(x);
 * ```
 *
 * TypeDoc is smart and documents `sqrtArrowFunction` as a function rather than a variable.
 *
 * @param x the number do calculate the root of.
 * @returns the square root if `x` is non-negative or `NaN` if `x` is negative.
 */
export const sqrtArrowFunction = (x: number): number => Math.sqrt(x);

/**
 * A simple generic function that concatenates two arrays.
 *
 * Use [`@typeParam <param
 * name>`](https://typedoc.org/guides/doccomments/#%40typeparam-%3Cparam-name%3E-or-%40template-%3Cparam-name%3E)
 * to document generic type parameters, e.g.
 *
 * ```text
 * @typeParam T the element type of the arrays
 * ```
 *
 * @typeParam T the element type of the arrays
 */
export function concat<T>(array1: T[], array2: T[]): T[] {
    return array1.concat(array2);
}

/**
 * A function that takes in an options object and makes an HTTP call.
 */
export function makeHttpCall(options: {
    url: string;

    /** e.g. GET, POST, PUT, DELETE */
    method: string;

    /** e.g. `{ 'Authorization': 'Bearer <access token>' }` */
    headers: Record<string, string>;

    body: string | Blob | FormData;
    mode: "cors" | "no-cors" | "same-origin";
}): Promise<Response> {
    const { url, method, headers, body, mode } = options;

    return fetch(url, { method, headers, body, mode });
}

/**
 * The options type for [[`makeHttpCall2`]].
 */
export interface MakeHttpCall2Options {
    url: string;

    /** e.g. GET, POST, PUT, DELETE */
    method: string;

    /** e.g. `{ 'Authorization': 'Bearer <access token>' }` */
    headers: Record<string, string>;
    body: string | Blob | FormData;
    mode: "cors" | "no-cors" | "same-origin";
}

/**
 * A function that takes in an options object that is defined as a separate
 * interface and makes an HTTP call.
 *
 * **Make sure to export the options type when using this pattern.** Otherwise,
 * TypeDoc will not document the options.
 */
export function makeHttpCall2(
    options: MakeHttpCall2Options
): Promise<Response> {
    const { url, method, headers, body, mode } = options;

    return fetch(url, { method, headers, body, mode });
}
