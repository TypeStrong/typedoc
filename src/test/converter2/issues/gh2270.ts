/**
 * Flagging all state references as {@link Immutable} guides IDEs to treat these
 * as {@link https://en.wikipedia.org/wiki/Immutable_object | Immutable Objects}
 * to avoid programming errors.
 */
export const A = 123;

export type Immutable = readonly [];
