/**
 * A simple named export that will be exported from export.ts
 */
export const a = 1;

/**
 * An export of a local under a different name.
 */
export { a as b };

/**
 * An export with a module specifier that comes from this file.
 */
export { a as c } from './mod';

/**
 * Will not be re-exported from export.ts using export * from...
 */
export default function() {
    console.log('Default');
}
