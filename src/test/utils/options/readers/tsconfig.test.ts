import { basename, join } from "path";
import { deepStrictEqual as equal } from "assert";

import { TSConfigReader } from "../../../../lib/utils/options/readers";
import { Logger, Options } from "../../../../lib/utils";
import { TestLogger } from "../../../TestLogger";
import { tempdirProject, type Project } from "@typestrong/fs-fixture-builder";
import { tmpdir } from "os";
import { Internationalization } from "../../../../lib/internationalization/internationalization";

describe("Options - TSConfigReader", () => {
    const options = new Options(new Internationalization(null).proxy);
    options.addReader(new TSConfigReader());
    const logger = new TestLogger();

    async function readWithProject(
        project: Project,
        reset = true,
        noErrors = true,
    ) {
        if (reset) {
            options.reset();
        }
        logger.reset();
        options.setValue("tsconfig", project.cwd);
        project.addFile("temp.ts", "export {}");
        project.write();
        await options.read(logger);
        if (noErrors) {
            logger.expectNoOtherMessages();
        }
    }

    it("Errors if the file cannot be found", async () => {
        options.reset();
        logger.reset();

        options.setValue(
            "tsconfig",
            join(tmpdir(), "typedoc/does-not-exist.json"),
        );
        await options.read(logger);
        logger.expectMessage("error: *");
    });

    function testError(name: string, file: object) {
        it(name, async () => {
            using project = tempdirProject();
            project.addJsonFile("tsconfig.json", file);
            await readWithProject(project, true, false);
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

    it("Errors if a tsconfig file cannot be parsed", async () => {
        using project = tempdirProject();
        project.addFile("tsconfig.json", '{"test}');
        await readWithProject(project, true, false);
        logger.expectMessage("error: *");
    });

    it("Does not error if the option file cannot be found but was not set.", async () => {
        const logger = new Logger();

        const options = new (class LyingOptions extends Options {
            override isSet() {
                return false;
            }
        })(new Internationalization(null).proxy);

        options.setValue(
            "tsconfig",
            join(__dirname, "data/does_not_exist.json"),
        );
        options.addReader(new TSConfigReader());
        await options.read(logger);
        equal(logger.hasErrors(), false);
    });

    it("Reads typedocOptions from extended tsconfig files", async () => {
        using project = tempdirProject();
        project.addFile("file.ts", "export const abc = 123");
        project.addJsonFile("tsconfig.json", {
            extends: ["./base.tsconfig.json"],
            files: ["./file.ts"],
            typedocOptions: { plugin: ["a"] },
        });
        project.addJsonFile("base.tsconfig.json", {
            typedocOptions: { name: "a", plugin: ["b"] },
        });

        await readWithProject(project);
        logger.expectNoOtherMessages();
        equal(options.getValue("name"), "a");
        equal(options.getValue("plugin"), ["a"]);
    });

    async function readTsconfig(tsconfig: object) {
        using project = tempdirProject();
        project.addFile("file.ts", "export const abc = 123");
        project.addJsonFile("tsconfig.json", tsconfig);

        await readWithProject(project);
        logger.expectNoOtherMessages();
    }

    it("Sets files for the program", async () => {
        await readTsconfig({
            files: ["./file.ts"],
        });
        equal(
            options.getFileNames().map((f) => basename(f)),
            ["file.ts"],
        );
    });

    it("Allows stripInternal to set excludeInternal", async () => {
        await readTsconfig({
            compilerOptions: {
                stripInternal: true,
            },
        });
        equal(options.getValue("excludeInternal"), true);
    });

    it("Does not set excludeInternal by stripInternal if already set", async () => {
        using project = tempdirProject();
        project.addJsonFile("tsconfig.json", {
            compilerOptions: { stripInternal: true },
        });

        options.reset();
        options.setValue("excludeInternal", false);
        await readWithProject(project, false);
        equal(options.getValue("excludeInternal"), false);
    });

    it("Correctly handles folder names ending with .json (#1712)", async () => {
        using project = tempdirProject();
        project.addJsonFile("tsconfig.json", {
            compilerOptions: { strict: true },
        });
        await readWithProject(project);
        equal(options.getCompilerOptions().strict, true);
    });

    async function testTsdoc(tsdoc: object, cb?: () => void, reset = true) {
        using project = tempdirProject();
        project.addFile("file.ts", "export const abc = 123");
        project.addJsonFile("tsconfig.json", {});
        project.addJsonFile("tsdoc.json", tsdoc);

        await readWithProject(project, reset, false);
        cb?.();
        logger.expectNoOtherMessages();
    }

    it("Handles failed tsdoc reads", async () => {
        await testTsdoc([], () => {
            logger.expectMessage(
                "error: Failed to read tsdoc.json file at */tsdoc.json",
            );
        });
    });

    it("Handles invalid tsdoc files", async () => {
        await testTsdoc(
            {
                doesNotMatchSchema: true,
            },
            () => {
                logger.expectMessage(
                    `error: The file */tsdoc.json is not a valid tsdoc.json file`,
                );
            },
        );
    });

    it("Warns if an option will be overwritten", async () => {
        options.reset();
        options.setValue("blockTags", []);
        options.setValue("modifierTags", []);
        await testTsdoc(
            {},
            () => {
                logger.expectMessage(
                    "warn: The blockTags, modifierTags defined in typedoc.json " +
                        "will be overwritten by configuration in tsdoc.json",
                );
            },
            false,
        );
    });

    it("Reads tsdoc.json", async () => {
        await testTsdoc({
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

    it("Handles extends in tsdoc.json", async () => {
        using project = tempdirProject();
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

        await readWithProject(project);
        equal(options.getValue("blockTags"), ["@tag"]);
        logger.expectNoOtherMessages();
    });

    it("Handles supportForTags in tsdoc.json", async () => {
        await testTsdoc({
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

    it("Handles circular extends", async () => {
        await testTsdoc(
            {
                extends: ["./tsdoc.json"],
            },
            () => {
                logger.expectMessage(
                    'error: Circular reference encountered for "extends" field of */tsdoc.json',
                );
            },
        );
    });

    it("Handles extends which reference invalid files", async () => {
        await testTsdoc(
            {
                extends: ["typedoc/nope"],
            },
            () => {
                logger.expectMessage(
                    "error: Failed to resolve typedoc/nope to a file in */tsdoc.json",
                );
            },
        );
    });
});
