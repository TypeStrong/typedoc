import { deepStrictEqual as equal } from "assert";
import { project as fsProject } from "@typestrong/fs-fixture-builder";

import { NodeFileSystem, normalizePath, Options, TypeDocReader } from "#node-utils";
import { TestLogger } from "../../../TestLogger.js";
import { join } from "path";

const fs = new NodeFileSystem();

describe("Options - TypeDocReader", () => {
    const options = new Options();
    options.addReader(new TypeDocReader());

    it("Supports comments in json", async () => {
        const project = fsProject("jsonc");
        after(() => project.rm());

        project.addFile("typedoc.json", '//comment\n{"name": "comment"}');
        const logger = new TestLogger();

        project.write();
        options.reset();
        options.setValue("options", normalizePath(project.cwd));
        await options.read(logger, fs);

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
        after(() => project.rm());
        options.reset();
        options.setValue("options", normalizePath(project.cwd));
        await options.read(logger, fs);

        logger.expectNoOtherMessages();
        equal(options.getValue("name"), "extends");
        equal(options.getValue("gitRevision"), "master");
    });

    it("Supports CommonJS files", async () => {
        const project = fsProject("js");
        project.addFile("typedoc.cjs", "module.exports = { name: 'js' }");
        const logger = new TestLogger();

        project.write();
        options.reset();
        options.setValue("options", normalizePath(project.cwd));
        await options.read(logger, fs);
        project.rm();

        logger.expectNoOtherMessages();
        equal(options.getValue("name"), "js");
    });

    it("Supports ESM files", async () => {
        const project = fsProject("js");
        project.addFile("typedoc.mjs", "export default { name: 'js' }");
        const logger = new TestLogger();

        project.write();
        after(() => project.rm());
        options.reset();
        options.setValue("options", normalizePath(project.cwd));
        await options.read(logger, fs);

        logger.expectNoOtherMessages();
        equal(options.getValue("name"), "js");
    });

    it("Errors if the file cannot be found", async () => {
        options.reset();
        options.setValue("options", normalizePath("./non-existent-file.json"));
        const logger = new TestLogger();
        await options.read(logger, fs);
        logger.expectMessage(
            "error: The options file */non-existent-file.json does not exist",
        );
        logger.expectNoOtherMessages();
    });

    function testError(
        name: string,
        file: unknown,
        message: string,
        json = true,
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
            options.setValue("options", normalizePath(project.cwd));
            const logger = new TestLogger();
            project.write();
            after(() => project.rm());
            await options.read(logger, fs);
            logger.expectMessage(message);
        });
    }

    testError(
        "Errors if the data is invalid",
        "Not valid json {}",
        "error: Failed to parse */typedoc.json, ensure it exists and exports an object",
    );
    testError(
        "Errors if the data is not an object in a json file",
        123,
        "error: Failed to parse */typedoc.json, ensure it exists and exports an object",
    );
    testError(
        "Errors if the data is not an object in a js file",
        "module.exports = 123",
        "error: Failed to parse */typedoc.js, ensure it exists and exports an object",
        false,
    );
    testError(
        "Errors if any set option errors",
        {
            someOptionThatDoesNotExist: true,
        },
        "error: Unknown option 'someOptionThatDoesNotExist' You may have meant:*",
    );
    testError(
        "Errors if extends results in a loop",
        {
            extends: "./typedoc.json",
        },
        'error: Circular reference encountered for "extends" field of *',
    );
    testError(
        "Errors if the extended path cannot be found",
        {
            extends: "typedoc/nope",
        },
        "error: Failed to resolve typedoc/nope to a file in */typedoc.json",
    );

    it("Does not error if the option file cannot be found but was not set.", async () => {
        const options = new (class LyingOptions extends Options {
            override isSet() {
                return false;
            }
        })();

        options.addReader(new TypeDocReader());
        const logger = new TestLogger();
        await options.read(logger, fs);
        equal(logger.hasErrors(), false);
    });

    it("Handles ESM config files", async () => {
        const project = fsProject("esm-config");
        project.addFile(
            "typedoc.config.mjs",
            "export default { pretty: false }",
        );
        project.write();
        after(() => project.rm());

        const logger = new TestLogger();
        const options = new Options();
        options.setValue("options", normalizePath(join(project.cwd, "typedoc.config.mjs")));
        options.addReader(new TypeDocReader());
        await options.read(logger, fs);
        equal(logger.hasErrors(), false);
    });

    it("Handles errors when reading config files", async () => {
        const project = fsProject("errors");
        project.addFile("typedoc.config.mjs", "throw new Error('hi')");
        project.write();
        after(() => project.rm());

        const logger = new TestLogger();
        const options = new Options();
        options.setValue("options", normalizePath(join(project.cwd, "typedoc.config.mjs")));
        options.addReader(new TypeDocReader());
        await options.read(logger, fs);

        logger.expectMessage(
            "error: Failed to parse */typedoc.config.mjs, ensure it exists and exports an object",
        );
        logger.expectMessage("error: hi");
    });

    it("Handles non-Error throws when reading config files", async () => {
        const project = fsProject("errors2");
        project.addFile("typedoc.config.cjs", "throw 123");
        project.write();
        after(() => project.rm());

        const logger = new TestLogger();
        const options = new Options();
        options.setValue("options", normalizePath(join(project.cwd, "typedoc.config.cjs")));
        options.addReader(new TypeDocReader());
        await options.read(logger, fs);

        logger.expectMessage(
            "error: Failed to parse */typedoc.config.cjs, ensure it exists and exports an object",
        );
        logger.expectMessage("error: 123");
    });
});
