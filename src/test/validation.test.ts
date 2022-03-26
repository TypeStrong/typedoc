import { equal, fail, ok } from "assert";
import { join, relative } from "path";
import { Logger, LogLevel, normalizePath } from "..";
import { validateDocumentation } from "../lib/validation/documentation";
import { validateExports } from "../lib/validation/exports";
import { getConverter2App, getConverter2Program } from "./programs";
import { TestLogger } from "./TestLogger";

function convertValidationFile(file: string) {
    const app = getConverter2App();
    const program = getConverter2Program();
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

function expectWarning(
    typeName: string,
    file: string,
    referencingName: string,
    intentionallyNotExported: readonly string[] = []
) {
    const project = convertValidationFile(file);

    let sawWarning = false;
    const regex =
        /(.*?), defined at (.*?):\d+, is referenced by (.*?) but not included in the documentation\./;

    class LoggerCheck extends Logger {
        override log(message: string, level: LogLevel) {
            const match = message.match(regex);
            if (level === LogLevel.Warn && match) {
                sawWarning = true;
                equal(match[1], typeName, "Missing type name is different.");
                equal(
                    match[2],
                    normalizePath(
                        relative(
                            process.cwd(),
                            `${__dirname}/converter2/validation/${file}`
                        )
                    ),
                    "Referencing file is different."
                );
                equal(
                    match[3],
                    referencingName,
                    "Referencing name is different"
                );
            }
        }
    }

    validateExports(project, new LoggerCheck(), intentionallyNotExported);
    ok(sawWarning, `Expected warning message for ${typeName} to be reported.`);
}

function expectNoWarning(
    file: string,
    intentionallyNotExported: readonly string[] = []
) {
    const app = getConverter2App();
    const program = getConverter2Program();
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

    const regex =
        /(.*?), defined at (.*?):\d+, is referenced by (.*?) but not included in the documentation\./;

    class LoggerCheck extends Logger {
        override log(message: string, level: LogLevel) {
            const match = message.match(regex);
            if (level === LogLevel.Warn && match) {
                fail("Expected no warnings about missing exports");
            }
        }
    }

    validateExports(project, new LoggerCheck(), intentionallyNotExported);
}

describe("validateExports", () => {
    it("Should warn if a variable type is missing", () => {
        expectWarning("Foo", "variable.ts", "foo");
    });

    it("Should warn if a type parameter clause is missing", () => {
        expectWarning("Foo", "typeParameter.ts", "Bar.T");
    });

    it("Should warn if an index signature type is missing", () => {
        expectWarning("Bar", "indexSignature.ts", "Foo.__index");
    });

    it("Should warn within object types", () => {
        expectWarning("Foo", "object.ts", "x.__type.foo");
    });

    it("Should warn if a get signature type is missing", () => {
        expectWarning("Bar", "getSignature.ts", "Foo.foo.foo");
    });

    it("Should warn if a set signature type is missing", () => {
        expectWarning("Bar", "setSignature.ts", "Foo.foo.foo._value");
    });

    it("Should warn if an implemented type is missing", () => {
        expectWarning("Bar", "implemented.ts", "Foo");
    });

    it("Should warn if a parameter type is missing", () => {
        expectWarning("Bar", "parameter.ts", "Foo.Foo.x");
    });

    it("Should warn if a return type is missing", () => {
        expectWarning("Bar", "return.ts", "foo.foo");
    });

    it("Should allow filtering warnings by file name", () => {
        expectNoWarning("variable.ts", ["variable.ts:Foo"]);
        expectNoWarning("variable.ts", ["validation/variable.ts:Foo"]);
        expectNoWarning("variable.ts", ["Foo"]);
    });

    it("Should not apply warnings filtered by file name to other files", () => {
        expectWarning("Foo", "variable.ts", "foo", ["notVariable.ts:Foo"]);
    });

    it("Should not produce warnings for types originating in node_modules", () => {
        expectNoWarning("externalType.ts");
    });

    it("Should warn if intentionallyNotExported contains unused values", () => {
        const app = getConverter2App();
        const program = getConverter2Program();
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
    it("Should correctly handle functions", () => {
        const project = convertValidationFile("function.ts");
        const logger = new TestLogger();
        validateDocumentation(project, logger, ["Function"]);

        logger.expectMessage(
            "warn: bar, defined at src/test/converter2/validation/function.ts:4, does not have any documentation."
        );
        logger.expectNoOtherMessages();
    });

    it("Should correctly handle accessors", () => {
        const project = convertValidationFile("getSignature.ts");
        const logger = new TestLogger();
        validateDocumentation(project, logger, ["Accessor"]);

        logger.expectMessage(
            "warn: Foo.foo, defined at src/test/converter2/validation/getSignature.ts:2, does not have any documentation."
        );
        logger.expectNoOtherMessages();
    });

    it("Should correctly handle constructors", () => {
        const project = convertValidationFile("class.ts");
        const logger = new TestLogger();
        validateDocumentation(project, logger, ["Constructor"]);

        logger.expectMessage(
            "warn: Foo.constructor, defined at src/test/converter2/validation/class.ts:4, does not have any documentation."
        );
        logger.expectNoOtherMessages();
    });
});
