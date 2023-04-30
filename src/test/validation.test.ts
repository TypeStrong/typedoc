import { ok } from "assert";
import { join } from "path";
import { Logger, LogLevel } from "..";
import { validateDocumentation } from "../lib/validation/documentation";
import { validateExports } from "../lib/validation/exports";
import { getConverter2App, getConverter2Program } from "./programs";
import { TestLogger } from "./TestLogger";

async function convertValidationFile(file: string) {
    const app = await getConverter2App();
    const program = await getConverter2Program();
    const sourceFile = program.getSourceFile(
        join(__dirname, "converter2/validation", file)
    );

    ok(sourceFile, "Specified source file does not exist.");

    const project = app.converter.convert([
        {
            displayName: "validation",
            program,
            sourceFile,
        },
    ]);

    return project;
}

async function expectWarning(
    typeName: string,
    file: string,
    referencingName: string,
    intentionallyNotExported: readonly string[] = []
) {
    const project = await convertValidationFile(file);

    const logger = new TestLogger();
    validateExports(project, logger, intentionallyNotExported);

    logger.expectMessage(
        `warn: ${typeName}, defined in */${file}, is referenced by ${referencingName} but not included in the documentation.`
    );
}

async function expectNoWarning(
    file: string,
    intentionallyNotExported: readonly string[] = []
) {
    const app = await getConverter2App();
    const program = await getConverter2Program();
    const sourceFile = program.getSourceFile(
        join(__dirname, "converter2/validation", file)
    );

    ok(sourceFile, "Specified source file does not exist.");

    const project = app.converter.convert([
        {
            displayName: "validation",
            program,
            sourceFile,
        },
    ]);

    const logger = new TestLogger();

    validateExports(project, logger, intentionallyNotExported);
    logger.expectNoOtherMessages();
}

describe("validateExports", () => {
    it("Should warn if a variable type is missing", async () => {
        await expectWarning("Foo", "variable.ts", "foo");
    });

    it("Should warn if a type parameter clause is missing", async () => {
        await expectWarning("Foo", "typeParameter.ts", "Bar.T");
    });

    it("Should warn if an index signature type is missing", async () => {
        await expectWarning("Bar", "indexSignature.ts", "Foo.__index");
    });

    it("Should warn within object types", async () => {
        await expectWarning("Foo", "object.ts", "x.__type.foo");
    });

    it("Should warn if a get signature type is missing", async () => {
        await expectWarning("Bar", "getSignature.ts", "Foo.foo.foo");
    });

    it("Should warn if a set signature type is missing", async () => {
        await expectWarning("Bar", "setSignature.ts", "Foo.foo.foo._value");
    });

    it("Should warn if an implemented type is missing", async () => {
        await expectWarning("Bar", "implemented.ts", "Foo");
    });

    it("Should warn if a parameter type is missing", async () => {
        await expectWarning("Bar", "parameter.ts", "Foo.Foo.x");
    });

    it("Should warn if a return type is missing", async () => {
        await expectWarning("Bar", "return.ts", "foo.foo");
    });

    it("Should allow filtering warnings by file name", async () => {
        await expectNoWarning("variable.ts", ["variable.ts:Foo"]);
        await expectNoWarning("variable.ts", ["validation/variable.ts:Foo"]);
        await expectNoWarning("variable.ts", ["Foo"]);
    });

    it("Should not apply warnings filtered by file name to other files", async () => {
        await expectWarning("Foo", "variable.ts", "foo", [
            "notVariable.ts:Foo",
        ]);
    });

    it("Should not produce warnings for types originating in node_modules", async () => {
        await expectNoWarning("externalType.ts");
    });

    it("Should not warn if namespaced name is given to intentionallyNotExported", async () => {
        await expectNoWarning("namespace.ts", ["Bar.Baz"]);
    });

    it("Should warn if intentionallyNotExported contains unused values", async () => {
        const app = await getConverter2App();
        const program = await getConverter2Program();
        const sourceFile = program.getSourceFile(
            join(__dirname, "converter2/validation/variable.ts")
        );

        ok(sourceFile, "Specified source file does not exist.");

        const project = app.converter.convert([
            {
                displayName: "validation",
                program,
                sourceFile,
            },
        ]);

        let sawWarning = false;
        class LoggerCheck extends Logger {
            override log(message: string, level: LogLevel) {
                if (
                    level == LogLevel.Warn &&
                    message.includes("intentionally not exported")
                ) {
                    sawWarning = true;
                    ok(
                        message.includes("notDefined"),
                        "Should have included a warning about notDefined"
                    );
                    ok(
                        !message.includes("Foo"),
                        "Should not include a warn about Foo"
                    );
                }
            }
        }

        validateExports(project, new LoggerCheck(), ["notDefined", "Foo"]);
        ok(sawWarning, "Never saw warning.");
    });
});

describe("validateDocumentation", () => {
    it("Should correctly handle functions", async () => {
        const project = await convertValidationFile("function.ts");
        const logger = new TestLogger();
        validateDocumentation(project, logger, ["Function"]);

        logger.expectMessage(
            "warn: bar, defined in */function.ts, does not have any documentation."
        );
        logger.expectNoOtherMessages();
    });

    it("Should correctly handle accessors", async () => {
        const project = await convertValidationFile("getSignature.ts");
        const logger = new TestLogger();
        validateDocumentation(project, logger, ["Accessor"]);

        logger.expectMessage(
            "warn: Foo.foo, defined in */getSignature.ts, does not have any documentation."
        );
        logger.expectNoOtherMessages();
    });

    it("Should correctly handle constructors", async () => {
        const project = await convertValidationFile("class.ts");
        const logger = new TestLogger();
        validateDocumentation(project, logger, ["Constructor"]);

        logger.expectMessage(
            "warn: Foo.constructor, defined in */class.ts, does not have any documentation."
        );
        logger.expectNoOtherMessages();
    });

    it("Should correctly handle interfaces", async () => {
        const project = await convertValidationFile("interface.ts");
        const logger = new TestLogger();
        validateDocumentation(project, logger, ["Method"]);

        logger.expectMessage(
            "warn: Foo.method, defined in */interface.ts, does not have any documentation."
        );
        logger.expectNoOtherMessages();
    });

    it("Should correctly handle callback parameters", async () => {
        const project = await convertValidationFile("callbackParameters.ts");
        const logger = new TestLogger();
        validateDocumentation(project, logger, ["Parameter", "Property"]);

        logger.expectNoOtherMessages();
    });
});
