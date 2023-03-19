export { other } from "./other";

/** @typedef {import("./other").Foo} Foo */
/** @typedef {import("./other").Foo} RenamedFoo */

/**
 * @typedef {import("./other").Generic<T>} Generic
 * @template {string} T
 */

/**
 * @typedef {import("./other").Generic<U>} RenamedGeneric
 * @template {string} U
 */

/**
 * @typedef {import("./other").Generic<string>} NonGeneric
 */
