import { equal } from "node:assert";

/**
 * {@includeCode includeTagMultipleRegions.ts#example,example2}
 */
export declare function buildString(n: number): string;

function doTest() {
    // #region example
    equal(buildString(3), "123");
    // #endregion example

    {
        // #region example2
        equal(buildString(7), "1234567");
        // #endregion example2
    }
}
