import { project } from "@typestrong/fs-fixture-builder";

import { PackageJsonReader } from "../../../../lib/utils/options/readers";
import { Options } from "../../../../lib/utils";
import { TestLogger } from "../../../TestLogger";
import { Internationalization } from "../../../../lib/internationalization/internationalization";

describe("Options - PackageJsonReader", () => {
    let optsContainer: Options;
    let testLogger: TestLogger;

    beforeEach(() => {
        optsContainer = new Options(new Internationalization(null).proxy);
        testLogger = new TestLogger();

        optsContainer.addReader(new PackageJsonReader());
    });

    it("Does not error if no package.json file is found", async () => {
        await optsContainer.read(testLogger, "/does-not-exist");
        testLogger.expectNoOtherMessages();
    });

    function testLogs(
        testTitle: string,
        pkgJsonContent: string,
        test: (logger: TestLogger) => void,
    ): void {
        it(testTitle, async () => {
            const proj = project(testTitle.replace(/[ "]/g, "_"));
            proj.addFile("package.json", pkgJsonContent);
            proj.write();
            after(() => proj.rm());

            await optsContainer.read(testLogger, proj.cwd);

            test(testLogger);
            testLogger.expectNoOtherMessages();
        });
    }

    testLogs(
        `Does not error if typedocOptions is not present`,
        `{ "name": "x" }`,
        () => {},
    );

    testLogs(
        `Errors if the "typedocOptions" field is set but does not contain an object`,
        `{ "name": "x", "typedocOptions": 123 }`,
        (l) =>
            l.expectMessage(
                `error: Failed to parse the "typedocOptions" field in */package.json, ensure it exists and contains an object`,
            ),
    );

    testLogs(
        "Errors if setting any option errors",
        `{ "name": "x", "typedocOptions": { "someOptionThatDoesNotExist": true } }`,
        (l) =>
            l.expectMessage(
                "error: Unknown option 'someOptionThatDoesNotExist' You may have meant:*",
            ),
    );

    testLogs(
        "Warns if the legacy-packages 'typedoc' key is present",
        `{ "name": "x", "typedoc": {} }`,
        (l) =>
            l.expectMessage(
                "warn: The 'typedoc' key in */package.json was used by the legacy-packages entryPointStrategy and will be ignored",
            ),
    );
});
