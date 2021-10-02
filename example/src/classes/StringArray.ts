/**
 * An array of strings that's defined as
 *
 * ```
 * export class StringArray extends Array<string> {
 *     // ...
 * }
 * ```
 *
 * Notice how TypeDoc has substituted `string` for the generic type argument in all
 * the methods inherited from `Array`. For example, the `values` method returns
 * `IterableIterator<string>`.
 */
export class StringArray extends Array<string> {
    /** A method that extends the functionality of a basic JavaScript array. */
    customMethod(): void {
        // do something awesome
    }
}
