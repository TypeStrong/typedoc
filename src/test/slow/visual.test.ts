import { deepStrictEqual as equal, ok } from "assert";
import { RegSuitCore } from "reg-suit-core";
import { captureRegressionScreenshots } from "../capture-screenshots";

describe("Visual Test", () => {
    let test: (name: string, cb: () => Promise<void>) => void = it;
    if (process.env["SKIP_VISUAL_TEST"]) {
        test = it.skip;
    }

    test("Successfully compares to baseline", async function () {
        await captureRegressionScreenshots();
        const reg = new RegSuitCore({
            configFileName: ".config/regconfig.json",
        });
        const processor = reg.createProcessor();

        const result = await processor.compare(
            await processor.getExpectedKey()
        );

        ok(
            result.comparisonResult.passedItems.length > 1,
            "No baselines compared. captureRegressionScreenshots is probably broken."
        );
        equal(
            result.comparisonResult.newItems,
            [],
            "Cannot run visual test without previously created baseline"
        );
        equal(result.comparisonResult.deletedItems, []);
        equal(result.comparisonResult.failedItems, []);
    });
});
