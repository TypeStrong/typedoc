export * from "./linkResolution";

import { A as AnotherName, Meanings } from "./linkResolution";

/** {@link AnotherName | A!}{@link AnotherName A2!}{@link AnotherName} */
export const localSymbolRef = 1;

/** {@link Meanings.B.prop | p} */
export const scoped = 2;
