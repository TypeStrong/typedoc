import { basename, join } from "path";
import { deepStrictEqual as equal } from "assert";

import { TSConfigReader } from "../../../../lib/utils/options/readers";
import { Logger, Options } from "../../../../lib/utils";
import { TestLogger } from "../../../TestLogger";
import { tempdirProject, Project } from "@typestrong/fs-fixture-builder";
import { tmpdir } from "os";

describe("Options - TSConfigReader", () => {
    const options = new Options(new Logger());
    options.addReader(new TSConfigReader());
    const logger = new TestLogger();

    function readWithProject(project: Project, reset = true) {
        if (reset) {
            options.reset();
        }
        logger.reset();
        options.setValue("tsconfig", project.cwd);
        project.write();
        options.read(logger);
        project.rm();
    }

    it("Errors if the file cannot be found", () => {
        options.reset();
        logger.reset();

        options.setValue(
            "tsconfig",
            join(tmpdir(), "typedoc/does-not-exist.json")
        );
        options.read(logger);
        logger.expectMessage("error: *");
    });

    function testError(name: string, file: object) {
        it(name, () => {
            const project = tempdirProject();
            project.addJsonFile("tsconfig.json", file);
            readWithProject(project);
            equal(logger.hasErrors(), true, "No error was logged");
        });
    }

    testError("Errors if the data is invalid", {
        typedocOptions: "Will cause an error",
    });

    testError("Errors if any set option errors", {
        typedocOptions: {
            someOptionThatDoesNotExist: true,
        },
    });

    testError("Errors if tsconfig tries to set options file", {
        typedocOptions: {
            options: "any",
        },
    });

    testError("Errors if tsconfig tries to set tsconfig file", {
        typedocOptions: {
            tsconfig: "any",
        },
    });

    it("Errors if a tsconfig file cannot be parsed", () => {
        const project = tempdirProject();
        project.addFile("tsconfig.json", '{"test}');
        readWithProject(project);
        logger.expectMessage("error: *");
    });

    it("Does not error if the option file cannot be found but was not set.", () => {
        const logger = new Logger();

        const options = new (class LyingOptions extends Options {
            override isSet() {
                return false;
            }
        })(logger);

        options.setValue(
            "tsconfig",
            join(__dirname, "data/does_not_exist.json")
        );
        options.addReader(new TSConfigReader());
        options.read(logger);
        equal(logger.hasErrors(), false);
    });

    function readTsconfig(tsconfig: object) {
        const project = tempdirProject();
        project.addFile("file.ts", "export const abc = 123");
        project.addJsonFile("tsconfig.json", tsconfig);

        readWithProject(project);
        logger.expectNoOtherMessages();
    }

    it("Sets files for the program", () => {
        readTsconfig({
            files: ["./file.ts"],
        });
        equal(
            options.getFileNames().map((f) => basename(f)),
            ["file.ts"]
        );
    });

    it("Allows stripInternal to set excludeInternal", () => {
        readTsconfig({
            compilerOptions: {
                stripInternal: true,
            },
        });
        equal(options.getValue("excludeInternal"), true);
    });

    it("Does not set excludeInternal by stripInternal if already set", () => {
        const project = tempdirProject();
        project.addJsonFile("tsconfig.json", {
            compilerOptions: { stripInternal: true },
        });

        options.reset();
        options.setValue("excludeInternal", false);
        readWithProject(project, false);
        equal(options.getValue("excludeInternal"), false);
    });

    it("Correctly handles folder names ending with .json (#1712)", () => {
        const project = tempdirProject();
        project.addJsonFile("tsconfig.json", {
            compilerOptions: { strict: true },
        });
        readWithProject(project);
        equal(options.getCompilerOptions().strict, true);
    });

    function testTsdoc(tsdoc: object, cb?: () => void, reset = true) {
        const project = tempdirProject();
        project.addFile("file.ts", "export const abc = 123");
        project.addJsonFile("tsconfig.json", {});
        project.addJsonFile("tsdoc.json", tsdoc);

        readWithProject(project, reset);
        cb?.();
        logger.expectNoOtherMessages();
    }

    it("Handles failed tsdoc reads", () => {
        testTsdoc([], () => {
            logger.expectMessage(
                "error: Failed to read tsdoc.json file at */tsdoc.json."
            );
        });
    });

    it("Handles invalid tsdoc files", () => {
        testTsdoc(
            {
                doesNotMatchSchema: true,
            },
            () => {
                logger.expectMessage(
                    `error: The file */tsdoc.json is not a valid tsdoc.json file.`
                );
            }
        );
    });

    it("Warns if an option will be overwritten", () => {
        options.reset();
        options.setValue("blockTags", []);
        options.setValue("modifierTags", []);
        testTsdoc(
            {},
            () => {
                logger.expectMessage(
                    "warn: The blockTags, modifierTags defined in typedoc.json " +
                        "will be overwritten by configuration in tsdoc.json."
                );
            },
            false
        );
    });

    it("Reads tsdoc.json", () => {
        testTsdoc({
            noStandardTags: true,
            tagDefinitions: [
                {
                    tagName: "@tag",
                    syntaxKind: "block",
                },
                {
                    tagName: "@tag2",
                    syntaxKind: "inline",
                },
                {
                    tagName: "@tag3",
                    syntaxKind: "modifier",
                },
            ],
        });

        equal(options.getValue("blockTags"), ["@tag"]);
        equal(options.getValue("inlineTags"), ["@tag2"]);
        equal(options.getValue("modifierTags"), ["@tag3"]);
    });

    it("Handles extends in tsdoc.json", () => {
        const project = tempdirProject();
        project.addFile("file.ts", "export const abc = 123");
        project.addJsonFile("tsconfig.json", {});
        project.addJsonFile("tsdoc.json", { extends: ["./tsdoc2.json"] });
        project.addJsonFile("tsdoc2.json", {
            noStandardTags: true,
            tagDefinitions: [
                {
                    tagName: "@tag",
                    syntaxKind: "block",
                },
            ],
        });

        readWithProject(project);
        equal(options.getValue("blockTags"), ["@tag"]);
        logger.expectNoOtherMessages();
    });

    it("Handles supportForTags in tsdoc.json", () => {
        testTsdoc({
            noStandardTags: true,
            tagDefinitions: [
                {
                    tagName: "@tag",
                    syntaxKind: "block",
                },
                {
                    tagName: "@tag2",
                    syntaxKind: "inline",
                },
                {
                    tagName: "@tag3",
                    syntaxKind: "modifier",
                },
            ],
            supportForTags: {
                "@tag": true,
            },
        });

        equal(options.getValue("blockTags"), ["@tag"]);
        equal(options.getValue("inlineTags"), []);
        equal(options.getValue("modifierTags"), []);
    });

    it("Handles circular extends", () => {
        testTsdoc(
            {
                extends: ["./tsdoc.json"],
            },
            () => {
                logger.expectMessage(
                    'error: Circular reference encountered for "extends" field of */tsdoc.json'
                );
            }
        );
    });

    it("Handles extends which reference invalid files", () => {
        testTsdoc(
            {
                extends: ["typedoc/nope"],
            },
            () => {
                logger.expectMessage(
                    "error: Failed to resolve typedoc/nope to a file in */tsdoc.json"
                );
            }
        );
    });
});
