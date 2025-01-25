/**
 * @document includeInDoc.md
 * @module
 */

// #region a
export const a = 123;
// #endregion a

/**
 * {@includeCode includeTag.ts#a}
 */
export const region = 456;

/**
 * {@includeCode includeTag.ts:7}
 */
export const line = 456;

/**
 * {@include includeTag.md:3}
 */
export const lineText = 789;

/**
 * {@include invalid.extension}
 */
export const fullFile = 321;
