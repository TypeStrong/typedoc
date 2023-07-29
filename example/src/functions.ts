/**
 * Calculates the square root of a number.
 *
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
 * Use [`@typeParam <param name>`](https://typedoc.org/tags/typeParam/)
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
 * The options type for {@link makeHttpCallA}.
 */
export interface MakeHttpCallAOptions {
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
export function makeHttpCallA(
    options: MakeHttpCallAOptions,
): Promise<Response> {
    const { url, method, headers, body, mode } = options;

    return fetch(url, { method, headers, body, mode });
}

/**
 * A function that takes in an options object and makes an HTTP call.
 *
 * The options type is written directly in the function definition.
 */
export function makeHttpCallB(options: {
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
 * Stringifies and concatenates two numbers into a single string.
 *
 * The documentation site allows you to toggle between the different overloads
 * of a function. The implementation signature of the overloaded function is not
 * included in the documentation.
 */
export function overloadedFunction(a: number, b: number): string;

/**
 * Concatenates two strings.
 *
 * The documentation site allows you to toggle between the different overloads
 * of a function. The implementation signature of the overloaded function is not
 * included in the documentation.
 */
export function overloadedFunction(a: string, b: string): string;

export function overloadedFunction(a: unknown, b: unknown): string {
    return (
        (a as { toString(): string }).toString() +
        (b as { toString(): string }).toString()
    );
}
