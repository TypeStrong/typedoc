import { equal } from "node:assert";

/**
 * {@includeCode includeTagDedent.ts#example}
 */
export declare function buildString(n: number): string;

function doTest() {
    // #region example
    equal(buildString(3), "123");
    equal(buildString(7), "1234567");
    // #endregion example
}
