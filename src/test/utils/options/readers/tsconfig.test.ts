import { join, resolve } from "path";
import { deepStrictEqual as equal } from "assert";

import { TSConfigReader } from "../../../../lib/utils/options/readers";
import { Logger, Options } from "../../../../lib/utils";
import { tmpdir } from "os";
import { TestLogger } from "../../../TestLogger";

describe("Options - TSConfigReader", () => {
    const options = new Options(new Logger());
    options.addDefaultDeclarations();
    options.addReader(new TSConfigReader());

    function testError(name: string, file: string) {
        it(name, () => {
            options.reset();
            options.setValue("tsconfig", file);
            const logger = new Logger();
            options.read(logger);
            equal(logger.hasErrors(), true, "No error was logged");
        });
    }

    testError(
        "Errors if the file cannot be found",
        join(tmpdir(), "typedoc/non-existent-file.json")
    );
    testError(
        "Errors if the data is invalid",
        join(__dirname, "data/invalid.tsconfig.json")
    );
    testError(
        "Errors if any set option errors",
        join(__dirname, "data/unknown.tsconfig.json")
    );
    testError(
        "Errors if tsconfig tries to set options file",
        join(__dirname, "data/options-file.tsconfig.json")
    );

    it("Does not error if the option file cannot be found but was not set.", () => {
        const options = new (class LyingOptions extends Options {
            override isSet() {
                return false;
            }
        })(new Logger());
        options.addDefaultDeclarations();

        options.setValue(
            "tsconfig",
            join(__dirname, "data/does_not_exist.json")
        );
        const logger = new Logger();
        options.addReader(new TSConfigReader());
        options.read(logger);
        equal(logger.hasErrors(), false);
    });

    it("Sets files for the program", () => {
        options.reset();
        options.setValue(
            "tsconfig",
            join(__dirname, "data/valid.tsconfig.json")
        );
        options.read(new Logger());
        equal(
            options.getFileNames().map((f) => resolve(f)),
            [resolve(__dirname, "./data/file.ts")]
        );
    });

    it("Allows stripInternal to set excludeInternal", () => {
        options.reset();
        options.setValue(
            "tsconfig",
            join(__dirname, "data/stripInternal.tsconfig.json")
        );
        options.read(new Logger());
        equal(options.getValue("excludeInternal"), true);
    });

    it("Does not set excludeInternal by stripInternal if already set", () => {
        options.reset();
        options.setValue(
            "tsconfig",
            join(__dirname, "data/stripInternal.tsconfig.json")
        );
        options.setValue("excludeInternal", false);
        options.read(new Logger());
        equal(options.getValue("excludeInternal"), false);
    });

    it("Correctly handles folder names ending with .json (#1712)", () => {
        options.reset();
        options.setValue("tsconfig", join(__dirname, "data/folder.json"));
        options.setCompilerOptions([], { strict: false }, void 0);
        options.read(new Logger());
        equal(options.getCompilerOptions().strict, true);
    });

    function testTsdoc(path: string, cb?: (logger: TestLogger) => void) {
        options.reset();
        options.setValue("tsconfig", join(__dirname, path));
        const logger = new TestLogger();
        options.read(logger);
        cb?.(logger);
        logger.expectNoOtherMessages();
    }

    it("Handles failed tsdoc reads", () => {
        testTsdoc("data/tsdoc1", (logger) => {
            logger.expectMessage(
                "error: Failed to read tsdoc.json file at */tsdoc1/tsdoc.json."
            );
        });
    });

    it("Handles invalid tsdoc files", () => {
        testTsdoc("data/tsdoc2", (logger) => {
            logger.expectMessage(
                `error: The file */tsdoc2/tsdoc.json is not a valid tsdoc.json file.`
            );
        });
    });

    it("Warns if an option will be overwritten", () => {
        options.reset();
        options.setValue("blockTags", []);
        options.setValue("modifierTags", []);
        options.setValue("tsconfig", join(__dirname, "data/tsdoc3"));
        const logger = new TestLogger();
        options.read(logger);
        logger.expectMessage(
            "warn: The blockTags, modifierTags defined in typedoc.json " +
                "will be overwritten by configuration in tsdoc.json."
        );
        logger.expectNoOtherMessages();
    });

    it("Reads tsdoc.json", () => {
        testTsdoc("data/tsdoc4");

        equal(options.getValue("blockTags"), ["@tag"]);
        equal(options.getValue("inlineTags"), ["@tag2"]);
        equal(options.getValue("modifierTags"), ["@tag3"]);
    });

    it("Handles extends in tsdoc.json", () => {
        testTsdoc("data/tsdoc5");
        equal(options.getValue("blockTags"), ["@tag"]);
    });

    it("Handles supportForTags in tsdoc.json", () => {
        testTsdoc("data/tsdoc6");

        equal(options.getValue("blockTags"), ["@tag"]);
        equal(options.getValue("inlineTags"), []);
        equal(options.getValue("modifierTags"), []);
    });

    it("Handles circular extends", () => {
        testTsdoc("data/tsdoc7", (logger) => {
            logger.expectMessage(
                'error: Circular reference encountered for "extends" field of */tsdoc7/tsdoc.json'
            );
        });
    });
});
