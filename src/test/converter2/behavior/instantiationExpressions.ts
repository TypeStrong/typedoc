/**
 * Custom Set class, roughly equivalent to:
 * ```ts
 * export class StringSet extends Set<string> {}
 * ```
 *
 * Not quite the same, since the instantiation expression does not cause
 * a type to be created with the same name.
 */
export const StringSet = Set<string>;
