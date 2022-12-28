import * as assert from "assert";
import { project } from "@typestrong/fs-fixture-builder";

import { PackageJsonReader } from "../../../../lib/utils/options/readers";
import { Logger, Options } from "../../../../lib/utils";
import { TestLogger } from "../../../TestLogger";

describe("Options - PackageJsonReader", () => {
    let optsContainer: Options;
    let testLogger: TestLogger;

    beforeEach(() => {
        optsContainer = new Options(new Logger());
        testLogger = new TestLogger();

        optsContainer.addDefaultDeclarations();
        optsContainer.addReader(new PackageJsonReader());
    });

    it("Does not error if the file cannot be found at a file path", () => {
        optsContainer.setValue("options", "./non-existent-file.json");

        optsContainer.read(testLogger);
        testLogger.expectNoOtherMessages();
        assert.strictEqual(testLogger.hasErrors(), false);
    });

    it("Does not error if the file cannot be found at a directory path", () => {
        optsContainer.setValue("options", "./non-existent-directory");

        optsContainer.read(testLogger);
        testLogger.expectNoOtherMessages();
        assert.strictEqual(testLogger.hasErrors(), false);
    });

    function testErrorLogs(
        testTitle: string,
        pkgJsonContent: string,
        expMsg: string
    ): void {
        it(testTitle, () => {
            const proj = project(testTitle.replace(/ /g, "_"));
            proj.addFile("package.json", pkgJsonContent);

            optsContainer.setValue("options", proj.cwd);
            proj.write();

            optsContainer.read(testLogger);

            proj.rm();

            testLogger.expectMessage(expMsg);
        });
    }

    testErrorLogs(
        "Errors if the package.json data is not valid JSON",
        "Not valid JSON {}",
        "error: Failed to parse */package.json, ensure it exists and contains an object."
    );

    testErrorLogs(
        "Errors if the package.json data is not an object",
        "123",
        "error: Failed to parse */package.json, ensure it exists and contains an object."
    );

    testErrorLogs(
        `Errors if there is no "typedocOptions" field`,
        `{ "notTypedocOptions": {} }`,
        `error: Failed to parse the "typedocOptions" field in */package.json, ensure it exists and contains an object.`
    );

    testErrorLogs(
        `Errors if the "typedocOptions" field does not contain an object`,
        `{ "typedocOptions": 123 }`,
        `error: Failed to parse the "typedocOptions" field in */package.json, ensure it exists and contains an object.`
    );

    testErrorLogs(
        "Errors if any set option errors",
        `{ "typedocOptions": { "someOptionThatDoesNotExist": true } }`,
        "error: Tried to set an option (someOptionThatDoesNotExist) that was not declared."
    );
});
