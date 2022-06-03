import { deepStrictEqual as equal } from "assert";

import { TypeDocReader } from "../../../../lib/utils/options/readers";
import { Logger, Options, ConsoleLogger } from "../../../../lib/utils";
import { TestLogger } from "../../../TestLogger";

describe("Options - TypeDocReader", () => {
    const options = new Options(new Logger());
    options.addDefaultDeclarations();
    options.addReader(new TypeDocReader());

    function test(name: string, input: string, cb: () => void) {
        it(name, () => {
            options.reset();
            options.setValue("options", input, __dirname);
            options.read(new ConsoleLogger());
            cb();
        });
    }

    test("Supports extends", "data/extends.json", () => {
        equal(options.getValue("name"), "extends");
        equal(options.getValue("gitRevision"), "master");
    });

    test("Supports js files", "data/td.js", () => {
        equal(options.getValue("gitRevision"), "a");
    });

    function testError(name: string, file: string, message: string) {
        it(name, () => {
            options.reset();
            options.setValue("options", file, __dirname);
            const logger = new TestLogger();
            options.read(logger);
            logger.expectMessage(message);
        });
    }

    testError(
        "Errors if the file cannot be found",
        "data/non-existent-file.json",
        "error: The options file */non-existent-file.json does not exist."
    );
    testError(
        "Errors if the data is invalid",
        "data/invalid.json",
        "error: Failed to parse */invalid.json, ensure it exists and contains an object."
    );
    testError(
        "Errors if any set option errors",
        "data/unknown.json",
        "error: Tried to set an option (someOptionThatDoesNotExist) that was not declared."
    );
    testError(
        "Errors if extends results in a loop",
        "data/circular-extends.json",
        "error: Tried to load the options file */circular-extends.json multiple times."
    );
    it("Does not error if the option file cannot be found but was not set.", () => {
        const options = new (class LyingOptions extends Options {
            override isSet() {
                return false;
            }
        })(new Logger());

        options.addDefaultDeclarations();
        options.addReader(new TypeDocReader());
        const logger = new Logger();
        options.read(logger);
        equal(logger.hasErrors(), false);
    });
});
