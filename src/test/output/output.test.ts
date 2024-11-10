import { deepStrictEqual as equal, throws } from "assert";
import { getConverter2App } from "../programs.js";
import { resolve } from "path";
import { Outputs } from "../../lib/output/output.js";
import { TestLogger } from "../TestLogger.js";
import { FileRegistry, ProjectReflection } from "../../lib/models/index.js";
import type { TranslatedString } from "../../lib/internationalization/index.js";

const app = getConverter2App();

describe("Output", () => {
    let optionsSnap: { __optionSnapshot: never };

    let outputs: Outputs;
    let logger: TestLogger;
    let htmlWritten = false;
    let jsonWritten = false;

    const dummyProject = new ProjectReflection("", new FileRegistry());

    before(() => {
        optionsSnap = app.options.snapshot();
    });

    beforeEach(() => {
        outputs = new Outputs(app);
        outputs.addOutput("html", () => {
            htmlWritten = true;
            return Promise.resolve();
        });
        outputs.addOutput("json", () => {
            jsonWritten = true;
            return Promise.resolve();
        });

        logger = app.logger = new TestLogger();

        htmlWritten = false;
        jsonWritten = false;
    });

    afterEach(() => {
        app.options.restore(optionsSnap);
        logger.expectNoOtherMessages();
    });

    it("Uses the --out output by default", () => {
        const specs = outputs.getOutputSpecs();
        equal(specs, [{ name: "html", path: resolve("./docs") }]);
    });

    it("Does not use default value of --out if there is a specified output shortcut", () => {
        app.options.setValue("html", "./html_docs");
        const specs = outputs.getOutputSpecs();
        equal(specs, [{ name: "html", path: resolve("./html_docs") }]);
    });

    it("Uses --out if specified", () => {
        app.options.setValue("html", "./html_docs");
        app.options.setValue("out", "./out_docs");
        const specs = outputs.getOutputSpecs();
        equal(specs, [
            { name: "html", path: resolve("./out_docs") },
            { name: "html", path: resolve("./html_docs") },
        ]);
    });

    it("Uses --outputs if specified", () => {
        app.options.setValue("outputs", [
            { name: "html", path: "./html_docs" },
        ]);
        const specs = outputs.getOutputSpecs();
        equal(specs, [{ name: "html", path: resolve("./html_docs") }]);
    });

    it("Prioritizes shortcuts if both outputs and shortcuts are specified", () => {
        app.options.setValue("outputs", [
            { name: "html", path: "./html_docs" },
        ]);
        app.options.setValue("html", "./html_docs2");
        const specs = outputs.getOutputSpecs();
        equal(specs, [{ name: "html", path: resolve("./html_docs2") }]);
    });

    it("Prioritizes --out if both outputs and --out are specified", () => {
        app.options.setValue("outputs", [
            { name: "html", path: "./html_docs" },
        ]);
        app.options.setValue("out", "./html_docs2");
        const specs = outputs.getOutputSpecs();
        equal(specs, [{ name: "html", path: resolve("./html_docs2") }]);
    });

    it("Supports specifying a different default output name", () => {
        outputs.setDefaultOutputName("json");
        const specs = outputs.getOutputSpecs();
        try {
            equal(specs, [{ name: "json", path: resolve("./docs") }]);
        } finally {
            outputs.setDefaultOutputName("html");
        }
    });

    it("Errors if an output is attempted to be redefined", () => {
        throws(
            () => outputs.addOutput("json", () => Promise.resolve()),
            new Error("Output type 'json' has already been defined"),
        );
    });

    it("Errors if an unspecified output is written", async () => {
        await outputs.writeOutput(
            {
                name: "notDefined",
                path: "./docs",
            },
            dummyProject,
        );

        logger.expectMessage(
            'error: Specified output "notDefined" has not been defined.',
        );
    });

    it("Writes all selected outputs, even if one fails", async () => {
        app.options.setValue("outputs", [
            { name: "html", path: "./html_docs" },
            { name: "notDefined", path: "./dummy" },
            { name: "json", path: "./json_docs" },
        ]);

        await outputs.writeOutputs(dummyProject);
        equal(htmlWritten, true);
        equal(jsonWritten, true);

        logger.expectMessage(
            'error: Specified output "notDefined" has not been defined.',
        );
        logger.expectMessage("info: html generated at ./html_docs");
        logger.expectMessage("info: json generated at ./json_docs");
    });

    it("Skips writing an output if setting options fails", async () => {
        app.options.setValue("outputs", [
            {
                name: "html",
                path: "./html_docs",
                options: { notDefined: true } as any,
            },
        ]);

        await outputs.writeOutputs(dummyProject);
        equal(htmlWritten, false);

        logger.expectMessage(
            "error: Unknown option 'notDefined' You may have meant:*",
        );
    });

    it("Logs an error if an output prints an error message", async () => {
        outputs.addOutput("test", () => {
            app.logger.error("Test Error" as TranslatedString);
            return Promise.resolve();
        });
        await outputs.writeOutput({ name: "test", path: "test" }, dummyProject);

        logger.expectMessage("error: Test Error");
        logger.expectMessage(
            "error: test output could not be generated due to the errors above",
        );
    });

    it("Logs an error if an output throws", async () => {
        outputs.addOutput("test", () =>
            Promise.reject(new Error("Test Error")),
        );
        await outputs.writeOutput({ name: "test", path: "test" }, dummyProject);

        logger.expectMessage("error: Test Error");
        logger.expectMessage(
            "error: test output could not be generated due to the errors above",
        );
    });

    it("Logs an error if an output throws a non-error", async () => {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        outputs.addOutput("test", () => Promise.reject("Test Error"));
        await outputs.writeOutput({ name: "test", path: "test" }, dummyProject);

        logger.expectMessage("error: Test Error");
        logger.expectMessage(
            "error: test output could not be generated due to the errors above",
        );
    });
});
