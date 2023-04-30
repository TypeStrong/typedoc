import { deepStrictEqual as equal } from "assert";
import { project as fsProject } from "@typestrong/fs-fixture-builder";

import { TypeDocReader } from "../../../../lib/utils/options/readers";
import { Logger, Options } from "../../../../lib/utils";
import { TestLogger } from "../../../TestLogger";

describe("Options - TypeDocReader", () => {
    const options = new Options(new Logger());
    options.addReader(new TypeDocReader());

    it("Supports comments in json", async () => {
        const project = fsProject("jsonc");
        project.addFile("typedoc.json", '//comment\n{"name": "comment"}');
        const logger = new TestLogger();

        project.write();
        options.reset();
        options.setValue("options", project.cwd);
        await options.read(logger);
        project.rm();

        logger.expectNoOtherMessages();
        equal(options.getValue("name"), "comment");
    });

    it("Supports extends", async () => {
        const project = fsProject("extends");
        project.addJsonFile("typedoc.json", {
            extends: "./other.json",
            name: "extends",
        });
        project.addJsonFile("other.json", {
            gitRevision: "master",
        });
        const logger = new TestLogger();

        project.write();
        options.reset();
        options.setValue("options", project.cwd);
        await options.read(logger);
        project.rm();

        logger.expectNoOtherMessages();
        equal(options.getValue("name"), "extends");
        equal(options.getValue("gitRevision"), "master");
    });

    it("Supports js files", async () => {
        const project = fsProject("js");
        project.addFile("typedoc.js", "module.exports = { name: 'js' }");
        const logger = new TestLogger();

        project.write();
        options.reset();
        options.setValue("options", project.cwd);
        await options.read(logger);
        project.rm();

        logger.expectNoOtherMessages();
        equal(options.getValue("name"), "js");
    });

    it("Supports esm files", async () => {
        const project = fsProject("js");
        project.addFile("typedoc.mjs", "export default { name: 'js' }");
        const logger = new TestLogger();

        project.write();
        options.reset();
        options.setValue("options", project.cwd);
        await options.read(logger);
        project.rm();

        logger.expectNoOtherMessages();
        equal(options.getValue("name"), "js");
    });

    it("Handles configs that are exported as a function that returns the config", async () => {
        const project = fsProject("js");
        project.addFile("typedoc.mjs", "export default () => ({ name: 'js' })");
        const logger = new TestLogger();

        project.write();
        options.reset();
        options.setValue("options", project.cwd);
        await options.read(logger);
        project.rm();

        logger.expectNoOtherMessages();
        equal(options.getValue("name"), "js");
    });

    it("Handles configs that are exported as an async function that returns the config", async () => {
        const project = fsProject("js");
        project.addFile(
            "typedoc.mjs",
            "export default async () => Promise.resolve({ name: 'js' })"
        );
        const logger = new TestLogger();

        project.write();
        options.reset();
        options.setValue("options", project.cwd);
        await options.read(logger);
        project.rm();

        logger.expectNoOtherMessages();
        equal(options.getValue("name"), "js");
    });

    it("Errors if the file cannot be found", async () => {
        options.reset();
        options.setValue("options", "./non-existent-file.json");
        const logger = new TestLogger();
        await options.read(logger);
        logger.expectMessage(
            "error: The options file */non-existent-file.json does not exist."
        );
        logger.expectNoOtherMessages();
    });

    function testError(
        name: string,
        file: unknown,
        message: string,
        json = true
    ) {
        it(name, async () => {
            const optionsFile = json ? "typedoc.json" : "typedoc.js";
            const project = fsProject(name.replace(/ /g, "_"));
            if (typeof file === "string") {
                project.addFile(optionsFile, file);
            } else {
                project.addJsonFile(optionsFile, file);
            }

            options.reset();
            options.setValue("options", project.cwd);
            const logger = new TestLogger();
            project.write();
            await options.read(logger);
            project.rm();
            logger.expectMessage(message);
        });
    }

    testError(
        "Errors if the data is invalid",
        "Not valid json {}",
        "error: Failed to parse */typedoc.json, ensure it exists and contains an object."
    );
    testError(
        "Errors if the data is not an object in a json file",
        123,
        "error: Failed to parse */typedoc.json, ensure it exists and contains an object."
    );
    testError(
        "Errors if the data is not an object in a js file",
        "module.exports = 123",
        "error: The root value of */typedoc.js is not an object.",
        false
    );
    testError(
        "Errors if any set option errors",
        {
            someOptionThatDoesNotExist: true,
        },
        "error: Tried to set an option (someOptionThatDoesNotExist) that was not declared. You may have meant:*"
    );
    testError(
        "Errors if extends results in a loop",
        {
            extends: "./typedoc.json",
        },
        "error: Tried to load the options file */typedoc.json multiple times."
    );
    testError(
        "Errors if the extended path cannot be found",
        {
            extends: "typedoc/nope",
        },
        "error: Failed to resolve typedoc/nope to a file in */typedoc.json"
    );

    it("Does not error if the option file cannot be found but was not set.", async () => {
        const options = new (class LyingOptions extends Options {
            override isSet() {
                return false;
            }
        })(new Logger());

        options.addReader(new TypeDocReader());
        const logger = new Logger();
        await options.read(logger);
        equal(logger.hasErrors(), false);
    });
});
