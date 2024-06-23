export { other } from "./other.js";

/** @typedef {import("./other.js").Foo} Foo */
/** @typedef {import("./other.js").Foo} RenamedFoo */

/**
 * @typedef {import("./other.js").Generic<T>} Generic
 * @template {string} T
 */

/**
 * @typedef {import("./other.js").Generic<U>} RenamedGeneric
 * @template {string} U
 */

/**
 * @typedef {import("./other.js").Generic<string>} NonGeneric
 */
